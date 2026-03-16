// ---------------------------------------------------------------------------
// SSRF Protection — block requests to private/internal IP ranges
// ---------------------------------------------------------------------------

const PRIVATE_IP_PATTERNS = [
	/^127\./, // 127.0.0.0/8  — loopback
	/^10\./, // 10.0.0.0/8   — private class A
	/^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 — private class B
	/^192\.168\./, // 192.168.0.0/16 — private class C
	/^169\.254\./, // 169.254.0.0/16 — link-local / cloud metadata
	/^0\./, // 0.0.0.0/8     — current network
	/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 — CGNAT
	/^192\.0\.0\./, // 192.0.0.0/24  — IETF protocol
	/^198\.1[89]\./, // 198.18.0.0/15 — benchmark testing
	/^::1$/, // IPv6 loopback
	/^fc00:/, // IPv6 unique local
	/^fe80:/, // IPv6 link-local
]

const BLOCKED_HOSTNAMES = [
	'localhost',
	'metadata.google.internal',
	'metadata.google',
]

/**
 * Checks whether a URL points to a private or internal network address.
 * This is a hostname-level check — it catches obvious cases like
 * `localhost`, `127.0.0.1`, `10.x.x.x`, and cloud metadata endpoints.
 *
 * Note: This does NOT resolve DNS, so an attacker could use a DNS rebinding
 * attack with a domain that resolves to a private IP. For full protection,
 * also enforce at the network level (e.g., Vercel's egress restrictions).
 */
export function isPrivateUrl(url: string): boolean {
	try {
		const parsed = new URL(url)
		const hostname = parsed.hostname.toLowerCase()

		// Block known hostnames
		if (BLOCKED_HOSTNAMES.includes(hostname)) return true

		// Block private IP patterns
		for (const pattern of PRIVATE_IP_PATTERNS) {
			if (pattern.test(hostname)) return true
		}

		// Block IPv6-mapped IPv4 (e.g., [::ffff:127.0.0.1])
		const ipv4Mapped = hostname.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
		if (ipv4Mapped) {
			for (const pattern of PRIVATE_IP_PATTERNS) {
				if (pattern.test(ipv4Mapped[1])) return true
			}
		}

		return false
	} catch {
		return true // Invalid URL → block by default
	}
}
