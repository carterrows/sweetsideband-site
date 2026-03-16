import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USERNAME = "admin";
export const ADMIN_COOKIE_NAME = "sweetside_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  sub: string;
  exp: number;
};

function getAdminPasswordHash() {
  const value = process.env.ADMIN_PASSWORD_HASH;

  if (!value) {
    throw new Error(
      "Missing ADMIN_PASSWORD_HASH. Set a salted scrypt hash in the format scrypt$<salt>$<hex>."
    );
  }

  return value;
}

function getSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;

  if (!value) {
    throw new Error("Missing ADMIN_SESSION_SECRET.");
  }

  return value;
}

function parsePasswordHash(rawHash: string) {
  const [algorithm, salt, hash] = rawHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    throw new Error(
      "ADMIN_PASSWORD_HASH must use the format scrypt$<salt>$<hex>."
    );
  }

  return {
    salt,
    hash: Buffer.from(hash, "hex")
  };
}

function signToken(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function constantTimeEquals(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminPassword(password: string, username: string) {
  if (username !== ADMIN_USERNAME) {
    return false;
  }

  const { salt, hash } = parsePasswordHash(getAdminPasswordHash());
  const derivedKey = scryptSync(password, salt, hash.length);

  return constantTimeEquals(derivedKey, hash);
}

export function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      sub: ADMIN_USERNAME,
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
    } satisfies SessionPayload)
  ).toString("base64url");
  const signature = signToken(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = Buffer.from(signToken(payload));
  const actualSignature = Buffer.from(signature);

  if (!constantTimeEquals(actualSignature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionPayload;

    return (
      decoded.sub === ADMIN_USERNAME &&
      typeof decoded.exp === "number" &&
      decoded.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  };
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return verifyAdminSessionToken(token);
}

export async function requireAdminAuthentication() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}
