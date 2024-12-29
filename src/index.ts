import mongoose from 'mongoose';
import http from 'http';
import app from './app.js';
import config from './config/config.js';
import logger from './config/logger.js';
import { initSocket } from './sockets/socket.js'; // Import socket initialization

let server: any;

// Create an HTTP server instance
const httpServer = http.createServer(app);

// Connect to MongoDB and start the server
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = httpServer.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // Initialize Socket.IO
  initSocket(httpServer);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: any) => {
  logger.error(error);
  exitHandler();
};

// Uncomment these lines to handle errors and signals
// process.on('uncaughtException', unexpectedErrorHandler);
// process.on('unhandledRejection', unexpectedErrorHandler);
// process.on('SIGTERM', () => {
//   logger.info('SIGTERM received');
//   if (server) {
//     server.close();
//   }
// });
