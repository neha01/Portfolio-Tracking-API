/* eslint-disable class-methods-use-this */
const BigNumber = require('bignumber.js');

const SecurityModel = require('../models/security');

class SecurityService {
  async createSecurity(data) {
    return SecurityModel.create(data);
  }

  async updateSecurity(ticker, operation, data, action) {
    const oldSecurityData = await SecurityModel.findOne({ ticker }).lean();
    if (action === 'TRADE_CREATED') {
      await this.updateSecurityWhenNewTradePlaced(
        oldSecurityData,
        data.trade,
        operation
      );
    } else if (action === 'TRADE_UPDATED') {
      await this.updateSecurityWhenTradeUpdated(oldSecurityData, data.trade);
    } else if (action === 'TRADE_DELETED') {
      await this.updateSecurityWhenTradeDeleted(oldSecurityData, data.trade);
    }
  }

  async updateSecurityWhenNewTradePlaced(security, trade, operation) {
    const { ticker, quantity, averagePrice } = security;
    const oldQuantity = quantity;
    const oldAveragePrice = new BigNumber(averagePrice); // used BigNumber lib for precise float calculations
    const newQuantity = trade.new.quantity;
    const newPrice = new BigNumber(trade.new.price);

    if (operation === 'BUY') {
      // upadte average price & quantity for security
      const {
        updatedAveragePrice,
        totalQuantity,
      } = await this.calculateWeightedAverage(
        oldAveragePrice,
        oldQuantity,
        newPrice,
        newQuantity
      );
      await SecurityModel.findOneAndUpdate(
        { ticker },
        { quantity: totalQuantity, averagePrice: updatedAveragePrice }
      );
    } else {
      const totalQuantity = oldQuantity - newQuantity;
      await SecurityModel.findOneAndUpdate(
        { ticker },
        { quantity: totalQuantity }
      );
    }
  }

  calculateWeightedAverage(
    oldAveragePrice,
    oldQuantity,
    newPrice,
    newQuantity
  ) {
    const totalPrice = oldAveragePrice
      .multipliedBy(oldQuantity)
      .plus(newPrice.multipliedBy(newQuantity));
    const totalQuantity = oldQuantity + newQuantity;
    const updatedAveragePrice = totalPrice.dividedBy(totalQuantity);
    return {
      updatedAveragePrice,
      totalQuantity,
    };
  }

  async updateSecurityWhenTradeUpdated(security, trade) {
    let {
      ticker,
      averagePrice: oldAveragePrice,
      quantity: oldQuantity,
    } = security;

    oldAveragePrice = new BigNumber(oldAveragePrice);
    const newTradeQuantity = trade.new.quantity;
    const newTradePrice = new BigNumber(trade.new.price);
    const oldTradeQuantity = trade.old.quantity;
    const oldTradePrice = new BigNumber(trade.old.price);

    const totalPriceWithoutTrade = oldAveragePrice
      .multipliedBy(oldQuantity)
      .minus(oldTradePrice.multipliedBy(oldTradeQuantity)); // remove old trade calculations from average price calculations

    const finalTotalPrice = totalPriceWithoutTrade.plus(
      newTradePrice.multipliedBy(newTradeQuantity)
    );
    const finalQuantity =
      trade.new.operation === 'BUY'
        ? oldQuantity + newTradeQuantity - oldTradeQuantity
        : oldQuantity - (newTradeQuantity - oldTradeQuantity); // calculate quantity with updated trade data
    const finalWeightedAverage =
      Number(finalQuantity) === 0
        ? '0'
        : finalTotalPrice.dividedBy(finalQuantity); // calculate average price with updated trade data

    await SecurityModel.findOneAndUpdate(
      { ticker },
      { quantity: finalQuantity, averagePrice: finalWeightedAverage }
    );
  }

  async updateSecurityWhenTradeDeleted(security, trade) {
    let {
      ticker,
      averagePrice: oldAveragePrice,
      quantity: oldQuantity,
    } = security;
    oldAveragePrice = new BigNumber(oldAveragePrice);
    const oldTradePrice = new BigNumber(trade.old.price);
    const oldTradeQuantity = trade.old.quantity;

    let totalPriceWithoutTrade = null;
    let totalQuantityWithoutTrade = null;
    let finalWeightedAverage = null;
    if (trade.old.operation === 'BUY') {
      totalQuantityWithoutTrade = oldQuantity - oldTradeQuantity;
      if (totalQuantityWithoutTrade < 0)
        throw new Error('Error: This Trade cannot be deleted');
      totalPriceWithoutTrade = oldAveragePrice
        .multipliedBy(oldQuantity)
        .minus(oldTradePrice.multipliedBy(oldTradeQuantity)); // remove trade details from average price calculations
      finalWeightedAverage =
        Number(totalQuantityWithoutTrade) === 0
          ? '0'
          : totalPriceWithoutTrade.dividedBy(totalQuantityWithoutTrade);
    } else {
      totalQuantityWithoutTrade = oldQuantity + oldTradeQuantity;
      totalPriceWithoutTrade = oldAveragePrice
        .multipliedBy(oldQuantity)
        .plus(oldTradePrice.multipliedBy(oldTradeQuantity)); // since sell trade is removed,add back its quantity
      finalWeightedAverage = oldAveragePrice; // sell doesnt affect avg price calculations
    }

    await SecurityModel.findOneAndUpdate(
      { ticker },
      {
        quantity: totalQuantityWithoutTrade,
        averagePrice: finalWeightedAverage,
      }
    );
  }
}

module.exports = new SecurityService();
