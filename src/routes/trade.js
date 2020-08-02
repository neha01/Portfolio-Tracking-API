const express = require('express');
const tradeController = require('../controllers/trade');

const router = express.Router();

router.post(
  '/portfolio/securities/:ticker/trades',
  tradeController.createTrade
);
router.put(
  '/portfolio/securities/:ticker/trades/:tradeId',
  tradeController.updateTrade
);
router.delete(
  '/portfolio/securities/:ticker/trades/:tradeId',
  tradeController.removeTrade
);

module.exports = router;
