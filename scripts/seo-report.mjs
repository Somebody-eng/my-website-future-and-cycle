import path from "node:path";
import { ensureDir, readMarkdownFiles, wordCount, writeUtf8Bom } from "./content-utils.mjs";

const postsDir = path.resolve("src/content/posts");
const reportPath = path.resolve("reports/seo-report.md");
const posts = await readMarkdownFiles(postsDir);
await ensureDir("reports");

const titleCounts = new Map();
const descriptionCounts = new Map();
for (const post of posts) {
  titleCounts.set(post.data.title, (titleCounts.get(post.data.title) || 0) + 1);
  descriptionCounts.set(post.data.description, (descriptionCounts.get(post.data.description) || 0) + 1);
}

const lines = ["# SEO 报告", "", `生成时间：${new Date().toISOString()}`, "", "| 标题 | 标题长度 | 描述长度 | 字数 | 分类 | 标签 | 标记 |", "| --- | ---: | ---: | ---: | --- | --- | --- |"];

for (const post of posts) {
  const title = post.data.title || "";
  const description = post.data.description || "";
  const flags = [];
  if (title.length < 8 || title.length > 32) flags.push("标题长度需复核");
  if (!description) flags.push("缺少描述");
  if (description.length < 50 || description.length > 120) flags.push("描述长度需复核");
  if (titleCounts.get(title) > 1) flags.push("重复标题");
  if (descriptionCounts.get(description) > 1) flags.push("重复描述");
  if (wordCount(post.content) < 600) flags.push("正文偏短");

  lines.push(`| ${title} | ${title.length} | ${description.length} | ${wordCount(post.content)} | ${post.data.category} | ${(post.data.tags || []).join("、")} | ${flags.join("；") || "正常"} |`);
}

await writeUtf8Bom(reportPath, lines.join("\n"));
console.log(`SEO 报告已生成：${reportPath}`);
