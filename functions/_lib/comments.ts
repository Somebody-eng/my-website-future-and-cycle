export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: { last_row_id?: number };
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1Statement;
}

export interface CommentsEnv {
  COMMENTS_DB: D1Database;
  COMMENTS_ADMIN_SECRET?: string;
  COMMENTS_HASH_SALT?: string;
  COMMENTS_AUTO_APPROVE?: string;
  COMMENTS_ALLOWED_ORIGINS?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export interface PagesContext {
  request: Request;
  env: CommentsEnv;
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function allowedOrigins(env: CommentsEnv) {
  return new Set(
    (env.COMMENTS_ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

export function requestOriginAllowed(request: Request, env: CommentsEnv) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  if (origin === requestOrigin || allowedOrigins(env).has(origin)) return true;

  try {
    const hostname = new URL(origin).hostname;
    return hostname === "future-cycle.pages.dev" || hostname.endsWith(".future-cycle.pages.dev");
  } catch {
    return false;
  }
}

export function json(request: Request, env: CommentsEnv, data: unknown, status = 200) {
  const origin = request.headers.get("origin");
  const headers = new Headers(jsonHeaders);
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  if (origin && requestOriginAllowed(request, env)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export function options(request: Request, env: CommentsEnv) {
  if (!requestOriginAllowed(request, env)) return json(request, env, { error: "来源不被允许。" }, 403);
  const origin = request.headers.get("origin");
  const headers = new Headers({
    "access-control-allow-methods": "GET, POST, PATCH, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    "cache-control": "no-store"
  });
  if (origin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }
  return new Response(null, { status: 204, headers });
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, maxLength);
}

export function validSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 120;
}

export async function fingerprint(request: Request, env: CommentsEnv) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const source = `${env.COMMENTS_HASH_SALT || "future-cycle-comments"}:${ip}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function verifyTurnstile(request: Request, env: CommentsEnv, token: string) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export function adminAuthorized(request: Request, env: CommentsEnv) {
  const secret = env.COMMENTS_ADMIN_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization") || "";
  return authorization === `Bearer ${secret}`;
}
