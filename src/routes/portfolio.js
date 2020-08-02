const express = require('express');

const router = express.Router();

const portfolioController = require('../controllers/portfolio');

router.get('/portfolio', portfolioController.getPortfolio);
router.get('/portfolio/holdings', portfolioController.getHoldings);
router.get('/portfolio/returns', portfolioController.getReturns);

module.exports = router;
