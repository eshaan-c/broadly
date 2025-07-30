class ClientRateLimiter {
    private requests: Map<string, number[]> = new Map();

    isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get existing requests for this key
        const timestamps = this.requests.get(key) || [];

        // Filter out old requests
        const recentRequests = timestamps.filter(time => time > windowStart);

        // Check if we're over the limit
        if (recentRequests.length >= maxRequests) {
            return false;
        }

        // Add current request
        recentRequests.push(now);
        this.requests.set(key, recentRequests);

        return true;
    }

    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const recent = timestamps.filter(time => time > now - 300000); // Keep 5 min
            if (recent.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, recent);
            }
        }
    }
}

const rateLimiter = new ClientRateLimiter();

// Clean up every minute
if (typeof window !== 'undefined') {
    setInterval(() => rateLimiter.cleanup(), 60000);
}

export { rateLimiter };
