const tradeService = require('../services/trade');
const winston = require('winston');
const logger = require('../utils/logger')

async function _createTrade(req, res) {
    try {
        const data = await tradeService.createTrade(req.body);
        return res.status(200).json({
            success: true,
            statusCode: 'CREATE_TRADE_SUCESS',
            message: 'Trade created Successfully',
            data
        })
    } catch (error) {
        logger.error(error.stack);
        return res.status(400).json({
            success: false,
            statusCode: 'CREATE_TRADE_FAILED',
            message: error.errmsg || error.errors || error.message
        })
    }
}

async function _updateTrade(req, res) {
    try {
        const { tradeId } = req.params;
        const data = await tradeService.updateTrade(req.body, tradeId);
        return res.status(200).json({
            success: true,
            statusCode: 'UPDATE_TRADE_SUCESS',
            message: 'Trade Updated Successfully',
            data
        })
    } catch (error) {
        logger.error(error.stack);
        return res.status(400).json({
            success: false,
            statusCode: 'UPDATE_TRADE_FAILED',
            message: error.errmsg || error.errors || error.message
        })
    }
}

async function _removeTrade(req, res) {
    try {
        const { tradeId } = req.params;
        const data = await tradeService.removeTrade(tradeId);
        return res.status(200).json({
            success: true,
            statusCode: 'DELETE_TRADE_SUCCESS',
            message: 'Trade Deleted Successfully',
            data
        })
    } catch (error) {
        logger.error(error.stack);
        return res.status(400).json({
            success: false,
            statusCode: 'DELETE_TRADE_FAILED',
            message: error.errmsg || error.errors || error.message
        })
    }
}

module.exports = {
    _createTrade,
    _updateTrade,
    _removeTrade
}