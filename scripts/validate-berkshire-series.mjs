import fs from "node:fs/promises";
import path from "node:path";
import { ensureDir, readMarkdownFiles, writeUtf8Bom } from "./content-utils.mjs";

const config = JSON.parse(await fs.readFile(path.resolve("src/data/berkshire-series.json"), "utf8"));
const posts = (await readMarkdownFiles(path.resolve("src/content/posts")))
  .filter((post) => post.data.category === config.category)
  .map((post) => ({ ...post, year: Number(String(post.data.slug || "").match(/\d{4}/)?.[0]) }))
  .sort((a, b) => a.year - b.year);

const issues = [];
if (!posts.length) issues.push("未找到伯克希尔股东会实录文章。");

for (const [index, post] of posts.entries()) {
  const expectedYear = config.firstYear + index;
  if (!Number.isInteger(post.year)) issues.push(`${post.path} 的 slug 缺少四位年份。`);
  if (post.year !== expectedYear) issues.push(`年份必须连续：期望 ${expectedYear}，实际 ${post.year}。`);
  const archiveUrl = config.referenceArchive?.[post.year];
  if (!archiveUrl?.startsWith(config.requiredSourceUrlPrefix)) {
    issues.push(`${post.year} 年缺少内部资料归档地址。`);
  }
}

const nextYear = posts.length ? posts.at(-1).year + 1 : config.firstYear;
if (nextYear !== config.nextYear) issues.push(`配置中的 nextYear 应为 ${nextYear}，当前为 ${config.nextYear}。`);

await ensureDir("reports");
const lines = [
  "# 伯克希尔股东会实录序列报告",
  "",
  `生成时间：${new Date().toISOString()}`,

  `编辑方式：${config.editorialMode}`,
  "",
  "## 已发布年份",
  ...(posts.length ? posts.map((post) => `- ${post.year}：${post.data.title}`) : ["- 暂无"]),
  "",
  `下一篇年份：${nextYear}`,
  "",
  "## 校验结果",
  ...(issues.length ? issues.map((issue) => `- ${issue}`) : ["- 通过"])
];
await writeUtf8Bom(path.resolve("reports/berkshire-series-report.md"), lines.join("\n"));

if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log(`伯克希尔实录序列校验通过，下一篇：${nextYear} 年。`);
