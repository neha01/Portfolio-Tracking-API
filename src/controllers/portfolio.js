const portfolioService = require('../services/portfolio');
const logger = require('../utils/logger');

async function getPortfolio(req, res) {
  try {
    const data = await portfolioService.getPortfolio(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 'FETCH_PORTFOLIO_SUCESS',
      message: 'Portfolio fetched Successfully',
      data,
    });
  } catch (error) {
    logger.error(error.stack);
    return res.status(400).json({
      success: false,
      statusCode: 'FETCH_PORTFOLIO_FAILED',
      message: error.errmsg || error.errors || error.message,
    });
  }
}

async function getHoldings(req, res) {
  try {
    const data = await portfolioService.getHoldings(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 'FETCH_HOLDINGS_SUCESS',
      message: 'Portfolio Holdings fetched Successfully',
      data,
    });
  } catch (error) {
    logger.error(error.stack);
    return res.status(400).json({
      success: false,
      statusCode: 'FETCH_HOLDINGS_FAILED',
      message: error.errmsg || error.errors || error.message,
    });
  }
}

async function getReturns(req, res) {
  try {
    const data = await portfolioService.getReturns(req.body);
    return res.status(200).json({
      success: true,
      statusCode: 'FETCH_RETURNS_SUCESS',
      message: 'Portfolio Returns Fetched Successfully',
      data,
    });
  } catch (error) {
    logger.error(error.stack);
    return res.status(400).json({
      success: false,
      statusCode: 'FETCH_RETURNS_FAILED',
      message: error.errmsg || error.errors || error.message,
    });
  }
}

module.exports = {
  getPortfolio,
  getHoldings,
  getReturns,
};
