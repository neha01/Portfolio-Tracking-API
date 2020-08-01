
const SecurityModel = require('../models/security');
const BigNumber = require('bignumber.js');
class SecurityService {

    constructor(app) {
    }

    async createSecurity(data) {
        return await SecurityModel.create(data);
    }

    async updateSecurity(ticker, operation, data, action) {
        let oldSecurityData = await SecurityModel.findOne({ ticker }).lean();
        if (action === 'TRADE_CREATED') {
            await this.updateSecurityWhenNewTradePlaced(oldSecurityData, data.trade, operation);
        } else if (action === 'TRADE_UPDATED') {
            await this.updateSecurityWhenTradeUpdated(oldSecurityData, data.trade);
        } else if (action === 'TRADE_DELETED') {
            await this.updateSecurityWhenTradeDeleted(oldSecurityData, data.trade);
        }
    }

    async updateSecurityWhenNewTradePlaced(security, trade, operation) {
        const { ticker, quantity, averagePrice } = security;
        let oldQuantity = quantity;
        let oldAveragePrice = new BigNumber(averagePrice); // used BigNumber lib for precise float calculations
        let newQuantity = trade.new.quantity;
        let newPrice = new BigNumber(trade.new.price);

        if (operation === 'BUY') { // upadte average price & quantity for security
            const { updatedAveragePrice, totalQuantity } = await this
                .calculateWeightedAverage(oldAveragePrice, oldQuantity, newPrice, newQuantity);
            await SecurityModel.findOneAndUpdate({ ticker },
                { quantity: totalQuantity, averagePrice: updatedAveragePrice });
        } else {
            let totalQuantity = oldQuantity - newQuantity;
            await SecurityModel
                .findOneAndUpdate({ ticker }, { quantity: totalQuantity });
        }
    }

    calculateWeightedAverage(oldAveragePrice, oldQuantity, newPrice, newQuantity) {
        let totalPrice = oldAveragePrice.multipliedBy(oldQuantity)
            .plus(newPrice.multipliedBy(newQuantity));
        let totalQuantity = oldQuantity + newQuantity;
        let updatedAveragePrice = (totalPrice.dividedBy(totalQuantity));
        return {
            updatedAveragePrice,
            totalQuantity
        };
    }

    async updateSecurityWhenTradeUpdated(security, trade) {
        let { ticker, averagePrice: oldAveragePrice, quantity: oldQuantity } = security;

        oldAveragePrice = new BigNumber(oldAveragePrice);
        let newTradeQuantity = trade.new.quantity;
        let newTradePrice = new BigNumber(trade.new.price);
        let oldTradeQuantity = trade.old.quantity;
        let oldTradePrice = new BigNumber(trade.old.price);

        let totalPriceWithoutTrade = oldAveragePrice.multipliedBy(oldQuantity)
            .minus(oldTradePrice.multipliedBy(oldTradeQuantity)); // remove old trade calculations from average price calculations

        let finalTotalPrice = totalPriceWithoutTrade
            .plus(newTradePrice.multipliedBy(newTradeQuantity));
        let finalQuantity = trade.new.operation === 'BUY' ?
            oldQuantity + newTradeQuantity - oldTradeQuantity
            : oldQuantity - (newTradeQuantity - oldTradeQuantity); //calculate quantity with updated trade data
        let finalWeightedAverage = finalTotalPrice.dividedBy(finalQuantity); // calculate average price with updated trade data

        await SecurityModel.findOneAndUpdate({ ticker },
            { quantity: finalQuantity, averagePrice: finalWeightedAverage });
    }

    async updateSecurityWhenTradeDeleted(security, trade) {
        let { ticker, averagePrice: oldAveragePrice, quantity: oldQuantity } = security;
        oldAveragePrice = new BigNumber(oldAveragePrice);
        let oldTradeQuantity = new BigNumber(trade.old.quantity);
        let oldTradePrice = new BigNumber(trade.old.price);

        let totalPriceWithoutTrade = null;
        let totalQuantityWithoutTrade = null;
        let finalWeightedAverage = null;
        if (trade.old.operation === 'BUY') {
            totalQuantityWithoutTrade = oldQuantity - oldTradeQuantity;
            if (totalQuantityWithoutTrade < 0) throw new Error('Error: This Trade cannot be deleted');
            totalPriceWithoutTrade = oldAveragePrice.multipliedBy(oldQuantity)
                .minus(oldTradePrice.multipliedBy(oldTradeQuantity));// remove trade details from average price calculations
            finalWeightedAverage = totalPriceWithoutTrade.dividedBy(totalQuantityWithoutTrade);
        } else {
            totalQuantityWithoutTrade = oldQuantity + oldTradeQuantity;
            totalPriceWithoutTrade = oldAveragePrice.multipliedBy(oldQuantity)
                .plus(oldTradePrice.multipliedBy(oldTradeQuantity));//since sell trade is removed,add back its quantity
            finalWeightedAverage = oldAveragePrice; // sell doesnt affect avg price calculations
        }

        await SecurityModel.findOneAndUpdate({ ticker },
            { quantity: totalQuantityWithoutTrade, averagePrice: finalWeightedAverage });
    }
}

module.exports = new SecurityService();


