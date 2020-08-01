
const SecurityService = require('../services/security');
const tradeSchema = require('../utils/validations/trade');
const updateTradeSchema = require('../utils/validations/updateTrade');
const TradeModel = require('../models/trade');
const SecurityModel = require('../models/security');
class TradeService {

    constructor(app) {
        // this.TradeModel = app.locals.models.trade; 
        //Improvement: Populate all models in app.locals & constructor can load all models from app.locals 
    }

    async createTrade(data) {
        data = await tradeSchema.validateAsync(data); //validate and transform data with Joi
        const { ticker, operation, price, quantity: tradeQuantity } = data;
        const security = await SecurityModel.findOne({ ticker }).lean();
        let result = null;
        if (security) { //security already exists, update its avg price & quantity & create new trade
            const oldQuantity = security.quantity;
            const changeInQuantity = operation === 'BUY' ? oldQuantity + tradeQuantity : oldQuantity - tradeQuantity;
            if (changeInQuantity < 0) throw new Error('Invalid trade : You dont have enough shares to execute this trade');
            result = await TradeModel.create(data);
            const tradeData = {
                trade: {
                    new: data
                }
            };
            await SecurityService.updateSecurity(ticker, operation, tradeData, 'TRADE_CREATED');
        } else if (operation === 'BUY') { //security doesn't exist in portfolio; so create new security
            result = await TradeModel.create(data);
            await SecurityService.createSecurity({ ticker, averagePrice: price, quantity: tradeQuantity });
        } else {
            //The operation is Sell but there is no corresponding security to sell in portfolio
            throw new Error('Invalid trade : You dont have enough shares to execute this trade')
        }
        return result;
    }

    async updateTrade(data, tradeId) {
        data = await updateTradeSchema.validateAsync(data); //validate and transform data with Joi
        const { price: updatedTradePrice, quantity: updatedTradeQuantity } = data;
        let oldTrade = await TradeModel.findOne({ _id: tradeId }).lean();
        const { ticker, operation, price: tradePrice, quantity: tradeQuantity } = oldTrade;

        if (updatedTradeQuantity === tradeQuantity && updatedTradePrice === tradePrice) { // no changes in trade
            throw new Error('No changes found to update the Trade.');
        }

        const security = await SecurityModel.findOne({ ticker }).lean();
        const { averagePrice, quantity: oldQuantity } = security;
        const changeInTradeQuantity = updatedTradeQuantity - tradeQuantity;
        const tradeData = {
            trade: {
                new: Object.assign(data, { ticker, operation }),
                old: oldTrade
            }
        };
        let result = null;
        if (operation === 'BUY') {
            const changeInQuantity = oldQuantity + changeInTradeQuantity;
            if (changeInQuantity < 0) throw new Error('Invalid trade :You dont have enough shares to execute this trade');// this can happen when all quantities were sold off and now buy trade is being updated
            result = await TradeModel.findOneAndUpdate({ _id: tradeId }, data, { new: true });
            await SecurityService.updateSecurity(ticker, operation, tradeData, 'TRADE_UPDATED');
        } else { // Sell operation
            const changeInQuantity = oldQuantity - changeInTradeQuantity; // final quantity of shares after upadting trade 
            if (changeInQuantity < 0) throw new Error('Invalid trade : You dont have enough shares to execute this trade');
            result = await TradeModel.findOneAndUpdate({ _id: tradeId }, data, { new: true });
            await SecurityService.updateSecurity(ticker, operation, tradeData, 'TRADE_UPDATED');
        }
        return result;
    }

    async removeTrade(tradeId) {
        let oldTrade = await TradeModel.findOne({ _id: tradeId }).lean();
        const { ticker, operation } = oldTrade;
        await SecurityService.updateSecurity(ticker, operation, { trade: { old: oldTrade } }, 'TRADE_DELETED');
        return await TradeModel.findOneAndDelete({ _id: tradeId }).lean();
    }
}

module.exports = new TradeService();


