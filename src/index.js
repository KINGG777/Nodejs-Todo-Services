// src/index.js
require('dotenv').config(); // Load environment variables
const createServer = require('./server');
const logger = require('./logger');

const PORT = process.env.PORT || 3000;
const app = createServer();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
