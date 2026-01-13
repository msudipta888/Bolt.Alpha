import { Redis } from '@upstash/redis'

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
    console.error("REDIS ERROR: Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in environment variables.");
} else {
    try {
        const hostname = new URL(redisUrl).hostname;
        console.log(`Initializing Redis client for host: ${hostname}`);
    } catch (e) {
        console.error("REDIS ERROR: Invalid UPSTASH_REDIS_REST_URL format.");
    }
}

export const redis = new Redis({
    url: redisUrl!,
    token: redisToken!,
    retry: {
        retries: 5,
        backoff: (attempt) => Math.min(Math.pow(2, attempt) * 100, 3000)
    }
})

if (redis) {
    console.log("Redis client initialized")
}