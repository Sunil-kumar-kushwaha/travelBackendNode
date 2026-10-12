// services/tokenBlacklistService.ts

import redisClient from "../config/redis";
import logger from "../utils/logger";

const KEY_PREFIX = "blacklist:jti:";

/** Marks a token's jti as revoked until it would have naturally expired. */
export async function blacklistToken(jti: string, expiresAtSeconds: number): Promise<void> {
    if (!redisClient) return; // no-op if Redis isn't configured (see config/redis.ts)

    const ttlSeconds = expiresAtSeconds - Math.floor(Date.now() / 1000);
    if (ttlSeconds <= 0) return; // already expired, nothing to blacklist

    try {
        await redisClient.set(`${KEY_PREFIX}${jti}`, "1", "EX", ttlSeconds);
    } catch (err) {
        // Don't let a Redis blip block logout — log it and move on.
        logger.error(`Failed to blacklist token: ${(err as Error).message}`);
    }
}

/** Returns true if this jti has been revoked. */
export async function isTokenBlacklisted(jti: string | undefined): Promise<boolean> {
    if (!redisClient || !jti) return false;

    try {
        const result = await redisClient.get(`${KEY_PREFIX}${jti}`);
        return result !== null;
    } catch (err) {
        logger.error(`Failed to check token blacklist: ${(err as Error).message}`);
        return false; // fail open — a Redis outage shouldn't lock everyone out
    }
}