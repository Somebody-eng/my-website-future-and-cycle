import path from "node:path";
import { ensureDir, readMarkdownFiles, validatePost, chineseLength, internalLinks, writeUtf8Bom } from "./content-utils.mjs";

const pendingDir = path.resolve("drafts/pending");
const reportPath = path.resolve("reports/content-check-report.md");

await ensureDir("reports");
const files = await readMarkdownFiles(pendingDir);

const lines = [
  "# 内容审核报告",
  "",
  `生成时间：${new Date().toISOString()}`,
  "",
  `扫描目录：\`${pendingDir}\``,
  `草稿数量：${files.length}`,
  ""
];

if (files.length === 0) {
  lines.push("当前没有待审核草稿。");
} else {
  for (const file of files) {
    const result = validatePost(file);
    lines.push(`## ${path.relative(process.cwd(), file.path)}`);
    lines.push("");
    lines.push(`- 状态：${result.valid ? "通过" : "不通过"}`);
    lines.push(`- 中文正文长度：${chineseLength(file.content)}`);
    lines.push(`- 内部链接数量：${internalLinks(file.content).length}`);
    if (result.issues.length) {
      lines.push("- 问题：");
      for (const issue of result.issues) lines.push(`  - ${issue}`);
    }
    lines.push("");
  }
}

await writeUtf8Bom(reportPath, lines.join("\n"));
console.log(`内容审核报告已生成：${reportPath}`);
