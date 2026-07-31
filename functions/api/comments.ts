import {
  cleanText,
  fingerprint,
  json,
  options,
  requestOriginAllowed,
  validSlug,
  verifyTurnstile,
  type PagesContext
} from "../_lib/comments";

interface CommentRow {
  id: number;
  parentId: number | null;
  name: string;
  content: string;
  createdAt: string;
}

export const onRequestOptions = ({ request, env }: PagesContext) => options(request, env);

export async function onRequestGet({ request, env }: PagesContext) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!validSlug(slug)) return json(request, env, { error: "文章标识无效。" }, 400);

  const result = await env.COMMENTS_DB.prepare(
    `SELECT id, parent_id AS parentId, name, content, created_at AS createdAt
     FROM comments
     WHERE slug = ? AND status = 'approved'
     ORDER BY created_at ASC
     LIMIT 200`
  ).bind(slug).all<CommentRow>();

  return json(request, env, { comments: result.results || [] });
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!requestOriginAllowed(request, env)) return json(request, env, { error: "来源不被允许。" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json(request, env, { error: "请求格式无效。" }, 415);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json(request, env, { error: "无法读取留言内容。" }, 400);
  }

  if (cleanText(body.website, 200)) return json(request, env, { accepted: true, pending: true }, 202);

  const slug = cleanText(body.slug, 120);
  const name = cleanText(body.name, 24);
  const content = cleanText(body.content, 1200);
  const parentId = Number.isInteger(body.parentId) && Number(body.parentId) > 0 ? Number(body.parentId) : null;
  const turnstileToken = cleanText(body.turnstileToken, 2048);

  if (!validSlug(slug)) return json(request, env, { error: "文章标识无效。" }, 400);
  if (name.length < 1) return json(request, env, { error: "请填写昵称。" }, 400);
  if (content.length < 2) return json(request, env, { error: "留言至少需要两个字符。" }, 400);
  if (!(await verifyTurnstile(request, env, turnstileToken))) {
    return json(request, env, { error: "人机验证未通过，请重试。" }, 400);
  }

  const visitorFingerprint = await fingerprint(request, env);
  const recent = await env.COMMENTS_DB.prepare(
    `SELECT COUNT(*) AS count FROM comments
     WHERE fingerprint = ?
       AND created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-10 minutes')`
  ).bind(visitorFingerprint).first<{ count: number }>();
  if ((recent?.count || 0) >= 3) {
    return json(request, env, { error: "提交得有些快，请稍后再试。" }, 429);
  }

  if (parentId) {
    const parent = await env.COMMENTS_DB.prepare(
      `SELECT id FROM comments WHERE id = ? AND slug = ? AND status = 'approved'`
    ).bind(parentId, slug).first<{ id: number }>();
    if (!parent) return json(request, env, { error: "回复的留言不存在或尚未公开。" }, 400);
  }

  const status = env.COMMENTS_AUTO_APPROVE === "true" ? "approved" : "pending";
  const result = await env.COMMENTS_DB.prepare(
    `INSERT INTO comments (slug, parent_id, name, content, status, fingerprint)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(slug, parentId, name, content, status, visitorFingerprint).run();

  return json(request, env, {
    accepted: true,
    pending: status !== "approved",
    id: result.meta?.last_row_id
  }, 201);
}
