const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade');

router.post('/portfolio/securities/:ticker/trades', tradeController._createTrade);
router.put('/portfolio/securities/:ticker/trades/:tradeId', tradeController._updateTrade);
router.delete('/portfolio/securities/:ticker/trades/:tradeId', tradeController._removeTrade);

module.exports = router;