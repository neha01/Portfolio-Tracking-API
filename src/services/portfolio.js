const TradeModel = require('../models/trade');
const SecurityModel = require('../models/security');
class PortfolioService {

    constructor(app) {

    }

    async getPortfolio() {
        return await TradeModel.aggregate([
            {
                $group: {
                    _id: "$ticker",
                    trades: { $push: "$$ROOT" }
                }
            }, {
                $project: {
                    _id: 0,
                    ticker: "$_id",
                    trades: 1
                }
            },

        ]);
    }

    async getHoldings() {
        return await SecurityModel.aggregate([
            {
                $match: {
                    quantity: { $gt: 0 }
                }
            }, {
                $project: {
                    _id: 1,
                    currentPrice: { $round: [{ "$toDouble": "$currentPrice" }, 4] },
                    ticker: 1,
                    averagePrice: { $round: [{ "$toDouble": "$averagePrice" }, 4] },
                    quantity: 1
                }
            },

        ]);

    }

    async getReturns() {
        const returns = await SecurityModel.aggregate([
            {
                $group: {
                    _id: null,
                    returns: {
                        $sum: {
                            $multiply: [
                                {
                                    $subtract: [{ "$toDouble": "$currentPrice" }, { "$toDouble": "$averagePrice" }]
                                },
                                "$quantity"
                            ]
                        }
                    }
                }
            }, {
                $project: {
                    _id: 0,
                    returns: { $round: ["$returns", 4] }
                }
            }
        ]);
        return returns[0];
    }

}

module.exports = new PortfolioService();


