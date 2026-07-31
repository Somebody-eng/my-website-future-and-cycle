import {
  adminAuthorized,
  cleanText,
  json,
  options,
  requestOriginAllowed,
  type PagesContext
} from "../_lib/comments";

interface AdminCommentRow {
  id: number;
  slug: string;
  parentId: number | null;
  name: string;
  content: string;
  status: string;
  createdAt: string;
}

export const onRequestOptions = ({ request, env }: PagesContext) => options(request, env);

export async function onRequestGet({ request, env }: PagesContext) {
  if (!requestOriginAllowed(request, env) || !adminAuthorized(request, env)) {
    return json(request, env, { error: "没有审核权限。" }, 401);
  }

  const requestedStatus = new URL(request.url).searchParams.get("status") || "pending";
  const status = ["pending", "approved", "rejected"].includes(requestedStatus) ? requestedStatus : "pending";
  const result = await env.COMMENTS_DB.prepare(
    `SELECT id, slug, parent_id AS parentId, name, content, status, created_at AS createdAt
     FROM comments
     WHERE status = ?
     ORDER BY created_at DESC
     LIMIT 100`
  ).bind(status).all<AdminCommentRow>();

  return json(request, env, { comments: result.results || [] });
}

export async function onRequestPatch({ request, env }: PagesContext) {
  if (!requestOriginAllowed(request, env) || !adminAuthorized(request, env)) {
    return json(request, env, { error: "没有审核权限。" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json(request, env, { error: "请求格式无效。" }, 400);
  }

  const id = Number(body.id);
  const action = cleanText(body.action, 16);
  if (!Number.isInteger(id) || id <= 0) return json(request, env, { error: "留言编号无效。" }, 400);

  if (action === "delete") {
    await env.COMMENTS_DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
  } else if (["approve", "reject"].includes(action)) {
    const status = action === "approve" ? "approved" : "rejected";
    await env.COMMENTS_DB.prepare(
      `UPDATE comments SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`
    ).bind(status, id).run();
  } else {
    return json(request, env, { error: "审核操作无效。" }, 400);
  }

  return json(request, env, { success: true });
}
