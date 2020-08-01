const express = require('express');
const config = require('config');
const logger = require('./src/utils/logger');
const morgan = require('morgan');
const loadRoutes = require('./src/routes/index');
const Db = require('./src/utils/db/helper');

const app = express();

async function initialize(app) {
    app.use(express.json());
    app.use(morgan(config.get('morgan.format'), { "stream": logger.stream }));
    Db.connect(config.get('db'));
    loadRoutes(app);
    app.listen(config.get('api.port'));
}

initialize(app);