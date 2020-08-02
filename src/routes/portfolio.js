const express = require('express');
const portfolioController = require('../controllers/portfolio');

const router = express.Router();

router.get('/portfolio', portfolioController.getPortfolio);
router.get('/portfolio/holdings', portfolioController.getHoldings);
router.get('/portfolio/returns', portfolioController.getReturns);

module.exports = router;
