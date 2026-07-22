const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode || 500;
  
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`${err.name || 'Error'}: ${err.message}`, err.stack);
  } else {
    logger.error(`${err.name || 'Error'}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
