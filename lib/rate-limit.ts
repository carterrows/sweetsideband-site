import { NextResponse } from "next/server";

type RateLimitPolicy = {
  id: string;
  limit: number;
  windowMs: number;
  message: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

declare global {
  var __sweetsideRateLimitStore__: Map<string, RateLimitEntry> | undefined;
  var __sweetsideRateLimitLastCleanupAt__: number | undefined;
}

const rateLimitStore =
  globalThis.__sweetsideRateLimitStore__ ??
  (globalThis.__sweetsideRateLimitStore__ = new Map<string, RateLimitEntry>());

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function maybeCleanup(now: number) {
  const lastCleanupAt = globalThis.__sweetsideRateLimitLastCleanupAt__ ?? 0;

  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  globalThis.__sweetsideRateLimitLastCleanupAt__ = now;
}

function consumeRateLimit(
  key: string,
  policy: RateLimitPolicy,
  now = Date.now()
): RateLimitResult {
  maybeCleanup(now);

  const existingEntry = rateLimitStore.get(key);

  if (!existingEntry || existingEntry.resetAt <= now) {
    const resetAt = now + policy.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetAt
    });

    return {
      allowed: true,
      limit: policy.limit,
      remaining: Math.max(policy.limit - 1, 0),
      resetAt,
      retryAfterSeconds: Math.max(Math.ceil(policy.windowMs / 1000), 1)
    };
  }

  existingEntry.count += 1;
  rateLimitStore.set(key, existingEntry);

  const remaining = Math.max(policy.limit - existingEntry.count, 0);

  return {
    allowed: existingEntry.count <= policy.limit,
    limit: policy.limit,
    remaining,
    resetAt: existingEntry.resetAt,
    retryAfterSeconds: Math.max(
      Math.ceil((existingEntry.resetAt - now) / 1000),
      1
    )
  };
}

function buildRateLimitHeaders(result: RateLimitResult) {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set(
    "X-RateLimit-Reset",
    String(Math.max(Math.ceil(result.resetAt / 1000), 0))
  );

  if (!result.allowed) {
    headers.set("Retry-After", String(result.retryAfterSeconds));
  }

  return headers;
}

export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
) {
  const headers = buildRateLimitHeaders(result);

  for (const [key, value] of headers.entries()) {
    response.headers.set(key, value);
  }

  return response;
}

export function enforceRateLimit(policy: RateLimitPolicy) {
  // This deployment does not trust forwarded IP headers, so admin limits are
  // enforced process-wide per route instead of per reported client address.
  const key = `${policy.id}:global`;
  const result = consumeRateLimit(key, policy);

  if (result.allowed) {
    return {
      limited: false as const,
      result
    };
  }

  const response = NextResponse.json(
    {
      error: `${policy.message} Try again in ${result.retryAfterSeconds} seconds.`
    },
    { status: 429 }
  );

  return {
    limited: true as const,
    response: applyRateLimitHeaders(response, result),
    result
  };
}

export const ADMIN_LOGIN_RATE_LIMIT: RateLimitPolicy = {
  id: "admin-login",
  limit: 5,
  windowMs: 10 * 60 * 1000,
  message: "Too many login attempts."
};

export const ADMIN_LOGOUT_RATE_LIMIT: RateLimitPolicy = {
  id: "admin-logout",
  limit: 30,
  windowMs: 5 * 60 * 1000,
  message: "Too many logout requests."
};

export const ADMIN_SYNC_RATE_LIMIT: RateLimitPolicy = {
  id: "admin-sync",
  limit: 12,
  windowMs: 5 * 60 * 1000,
  message: "Too many admin sync requests."
};
