import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
require('dotenv').config();
// const app = require('./app');
// const connectDB = require('./src/config/db');
// const redisClient = require('./src/config/redis');
// const { registerExpiryScheduler } = require('./src/jobs/expiryScheduler');
import logger from "./utils/logger";




const PORT = process.env.PORT || 5050;
const startServer = async () => {
    // await connectDB();

    

    const server = app.listen(PORT, () => {
        logger.info(`[PID ${process.pid}]  server listening on port ${PORT}`);
    });

    // --- Graceful shutdown ---
    const shutdown = (signal: any) => {
        logger.info(`[PID ${process.pid}] Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            logger.info(`[PID ${process.pid}] HTTP server closed.`);
            process.exit(0);
        });
        
        setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
        logger.error(`[PID ${process.pid}] Unhandled Rejection: ${reason}`);
    });
    process.on('uncaughtException', (err) => {
        logger.error(`[PID ${process.pid}] Uncaught Exception: ${err.stack}`);
        process.exit(1);
    });
};

startServer();