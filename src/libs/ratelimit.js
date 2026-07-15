// src/libs/ratelimit.js
// Distributed rate limiting using Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
// These environment variables should be set in .env.local
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Rate limiter for payment creation
 * Allows 5 payment attempts per user per minute
 */
export const paymentRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'froggo:payment',
});

/**
 * Rate limiter for video URL generation
 * Allows 30 video URL requests per user per minute
 * (reasonably generous for normal browsing, but prevents mass scraping)
 */
export const videoUrlRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'froggo:video',
});

/**
 * Rate limiter for general API requests
 * Allows 100 requests per user per minute
 */
export const generalRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'froggo:general',
});

/**
 * Helper function to check rate limit and return appropriate response
 * @param {Ratelimit} rateLimiter - The rate limiter to use
 * @param {string} identifier - User ID or IP address
 * @returns {Promise<{success: boolean, limit: number, remaining: number, reset: number}>}
 */
export async function checkRateLimit(rateLimiter, identifier) {
    try {
        const result = await rateLimiter.limit(identifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } catch (error) {
        console.error('Rate limiting error:', error);
        // On error, allow the request (fail open for availability)
        // but log the error for monitoring
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0,
            error: true,
        };
    }
}
