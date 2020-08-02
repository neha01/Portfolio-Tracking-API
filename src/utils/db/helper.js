const mongoose = require('mongoose');
const logger = require('../logger');

async function connect(config) {
  const dbUrl = `${config.url}:${config.port}/${config.name}`;
  mongoose.connect(process.env.DB_URl || dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoose.connection.on('error', (err) => {
    logger.error(err.stack);
  });
  mongoose.connection.on('open', function callback() {
    logger.info('DB up and running ...', process.env.DB_URl || config.url);
  });
}

module.exports = {
  connect,
};
