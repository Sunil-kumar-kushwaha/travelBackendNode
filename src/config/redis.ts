

import Redis from "ioredis";
import logger from "../utils/logger";

let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);

    redisClient.on("connect", () => logger.info("Redis connected"));
    redisClient.on("error", (err) => logger.error(`Redis error: ${err.message}`));
} else {
    logger.warn(
        "REDIS_URL not set — token blacklist (logout invalidation) is disabled. " +
        "Logout will still clear client cookies, but old tokens stay valid until they expire."
    );
}

export default redisClient;