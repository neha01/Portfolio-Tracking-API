const express = require('express');
const config = require('config');
const morgan = require('morgan');
const logger = require('./src/utils/logger');
const loadRoutes = require('./src/routes/index');
const Db = require('./src/utils/db/helper');

const app = express();

async function initialize() {
  app.use(express.json());
  app.use(morgan(config.get('morgan.format'), { stream: logger.stream }));
  Db.connect(config.get('db'));
  loadRoutes(app);
  app.listen(process.env.PORT || config.get('api.port'));
}

initialize();
