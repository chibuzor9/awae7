// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per-instance, suitable for serverless)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
	count: number
	resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/** Remove expired entries periodically to prevent memory leaks */
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup() {
	const now = Date.now()
	if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
	lastCleanup = now
	for (const [key, entry] of store) {
		if (now > entry.resetAt) store.delete(key)
	}
}

interface RateLimitOptions {
	/** Maximum requests allowed in the window */
	limit: number
	/** Window duration in milliseconds */
	windowMs: number
}

interface RateLimitResult {
	allowed: boolean
	remaining: number
	resetAt: number
}

/**
 * Check whether a request from the given key should be rate-limited.
 * Returns `allowed: false` if the limit has been exceeded.
 */
export function checkRateLimit(
	key: string,
	{ limit, windowMs }: RateLimitOptions
): RateLimitResult {
	cleanup()

	const now = Date.now()
	const entry = store.get(key)

	if (!entry || now > entry.resetAt) {
		store.set(key, { count: 1, resetAt: now + windowMs })
		return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
	}

	entry.count++

	if (entry.count > limit) {
		return { allowed: false, remaining: 0, resetAt: entry.resetAt }
	}

	return {
		allowed: true,
		remaining: limit - entry.count,
		resetAt: entry.resetAt,
	}
}

/** Extract a rate-limit key from the request (IP-based) */
export function getRateLimitKey(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for')
	const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
	return `rl:${ip}`
}
