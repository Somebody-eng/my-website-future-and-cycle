import path from "node:path";
import { ensureDir, internalLinks, readMarkdownFiles, writeUtf8Bom } from "./content-utils.mjs";

const postsDir = path.resolve("src/content/posts");
const reportPath = path.resolve("reports/maintenance-report.md");
const posts = await readMarkdownFiles(postsDir);
await ensureDir("reports");

const titleMap = new Map();
const slugMap = new Map();
const allInternalRoutes = new Set(["/", "/about/", "/disclaimer/", "/privacy/", "/contact/", "/search/"]);
const now = Date.now();

for (const post of posts) {
  allInternalRoutes.add(`/posts/${post.data.slug}/`);
  titleMap.set(post.data.title, [...(titleMap.get(post.data.title) || []), post.path]);
  slugMap.set(post.data.slug, [...(slugMap.get(post.data.slug) || []), post.path]);
}

for (const post of posts) {
  allInternalRoutes.add(`/categories/${encodeURIComponent(post.data.category)}/`);
  for (const tag of post.data.tags || []) allInternalRoutes.add(`/tags/${encodeURIComponent(tag)}/`);
}

const lines = ["# 维护报告", "", `生成时间：${new Date().toISOString()}`, ""];

lines.push("## 超过 90 天未更新");
const stale = posts.filter((post) => {
  const date = new Date(post.data.updatedDate || post.data.date).valueOf();
  return Number.isFinite(date) && now - date > 90 * 24 * 60 * 60 * 1000;
});
lines.push(stale.length ? stale.map((post) => `- ${post.data.title}`).join("\n") : "- 未发现");
lines.push("");

lines.push("## 重复标题");
const duplicateTitles = [...titleMap.entries()].filter(([, files]) => files.length > 1);
lines.push(duplicateTitles.length ? duplicateTitles.map(([title]) => `- ${title}`).join("\n") : "- 未发现");
lines.push("");

lines.push("## 重复 slug");
const duplicateSlugs = [...slugMap.entries()].filter(([, files]) => files.length > 1);
lines.push(duplicateSlugs.length ? duplicateSlugs.map(([slug]) => `- ${slug}`).join("\n") : "- 未发现");
lines.push("");

lines.push("## 缺少封面 alt 文本");
const missingAlt = posts.filter((post) => !post.data.coverAlt);
lines.push(missingAlt.length ? missingAlt.map((post) => `- ${post.data.title}`).join("\n") : "- 未发现");
lines.push("");

lines.push("## 内部链接数量不足");
const lowInternalLinks = posts.filter((post) => internalLinks(post.content).length < 2);
lines.push(lowInternalLinks.length ? lowInternalLinks.map((post) => `- ${post.data.title}`).join("\n") : "- 未发现");
lines.push("");

lines.push("## 死链接检查");
const linkIssues = [];
for (const post of posts) {
  for (const link of internalLinks(post.content)) {
    const normalized = link.split("#")[0];
    if (!allInternalRoutes.has(normalized)) {
      linkIssues.push(`- ${post.data.title}：内部链接不存在 ${link}`);
    }
  }

  for (const match of post.raw.matchAll(/\[[^\]]+]\((https?:\/\/[^)]+)\)/g)) {
    const url = match[1];
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(url, { method: "HEAD", signal: controller.signal });
      clearTimeout(timer);
      if (response.status >= 400) linkIssues.push(`- ${post.data.title}：外部链接异常 ${response.status} ${url}`);
    } catch (error) {
      linkIssues.push(`- ${post.data.title}：外部链接无法确认 ${url}`);
    }
  }
}
lines.push(linkIssues.length ? linkIssues.join("\n") : "- 未发现");
lines.push("");
lines.push("## 建议");
lines.push("- 对超过 90 天未更新的文章复核事实、来源和内部链接。");
lines.push("- 对外部链接无法确认的项目手动打开核验，避免网络波动导致误报。");

await writeUtf8Bom(reportPath, lines.join("\n"));
console.log(`维护报告已生成：${reportPath}`);
