const SecurityService = require('./security');
const tradeSchema = require('../utils/validations/trade');
const updateTradeSchema = require('../utils/validations/updateTrade');
const TradeModel = require('../models/trade');
const SecurityModel = require('../models/security');

class TradeService {
  async createTrade(data) {
    data = await tradeSchema.validateAsync(data); // validate and transform data with Joi
    const { ticker, operation, price, quantity: tradeQuantity } = data;
    const security = await SecurityModel.findOne({ ticker }).lean();
    if (security) {
      // security already exists,update avgPrice ,quantity & create new trade
      const oldQuantity = security.quantity;
      const changeInQuantity =
        operation === 'BUY'
          ? oldQuantity + tradeQuantity
          : oldQuantity - tradeQuantity;
      if (changeInQuantity < 0)
        throw new Error(
          'Invalid trade : You dont have enough shares to execute this trade'
        );
      const tradeData = {
        trade: {
          new: data,
        },
      };
      await SecurityService.updateSecurity(
        ticker,
        operation,
        tradeData,
        'TRADE_CREATED'
      );
    } else if (operation === 'BUY') {
      // security doesn't exist in portfolio; so create new security
      await SecurityService.createSecurity({
        ticker,
        averagePrice: price,
        quantity: tradeQuantity,
      });
    } else {
      // The operation is Sell,
      // but there is no corresponding security to sell in portfolio
      throw new Error(
        'Invalid trade : You dont have enough shares to execute this trade'
      );
    }
    return TradeModel.create(data);
  }

  async updateTrade(data, tradeId) {
    data = await updateTradeSchema.validateAsync(data); // validate and transform data with Joi
    const { price: updatedTradePrice, quantity: updatedTradeQuantity } = data;
    const oldTrade = await TradeModel.findOne({ _id: tradeId }).lean();
    if (!oldTrade) throw new Error('Please input Valid TradeId');
    const {
      ticker,
      operation,
      price: tradePrice,
      quantity: tradeQuantity,
    } = oldTrade;

    if (
      updatedTradeQuantity === tradeQuantity &&
      updatedTradePrice === tradePrice
    ) {
      // no changes in trade
      throw new Error('No changes found to update the Trade.');
    }

    const security = await SecurityModel.findOne({ ticker }).lean();
    const { quantity: oldQuantity } = security;
    const changeInTradeQuantity = updatedTradeQuantity - tradeQuantity;
    const tradeData = {
      trade: {
        new: { ...data, ticker, operation },
        old: oldTrade,
      },
    };
    const changeInQuantity =
      operation === 'BUY'
        ? oldQuantity + changeInTradeQuantity
        : oldQuantity - changeInTradeQuantity;
    if (changeInQuantity < 0)
      throw new Error(
        'Invalid trade :You dont have enough shares to execute this trade'
      ); // this can happen when all quantities were sold off and now buy trade is being updated
    await SecurityService.updateSecurity(
      ticker,
      operation,
      tradeData,
      'TRADE_UPDATED'
    );

    return TradeModel.findOneAndUpdate({ _id: tradeId }, data, {
      new: true,
    });
  }

  async removeTrade(tradeId) {
    const oldTrade = await TradeModel.findOne({ _id: tradeId }).lean();
    if (!oldTrade) throw new Error('Please input Valid TradeId');
    const { ticker, operation } = oldTrade;
    await SecurityService.updateSecurity(
      ticker,
      operation,
      { trade: { old: oldTrade } },
      'TRADE_DELETED'
    );
    return TradeModel.findOneAndDelete({ _id: tradeId }).lean();
  }
}

module.exports = new TradeService();
