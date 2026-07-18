import fs from "node:fs/promises";
import path from "node:path";
import { ensureDir, readMarkdownFiles, renderMatter, readingTime, slugify, validatePost, defaultDisclaimer, writeUtf8Bom } from "./content-utils.mjs";

const pendingDir = path.resolve("drafts/pending");
const postsDir = path.resolve("src/content/posts");
const reportPath = path.resolve("reports/publish-log.md");
const today = new Date().toISOString().slice(0, 10);

await ensureDir("reports");
await ensureDir(postsDir);

const files = await readMarkdownFiles(pendingDir);
const lines = ["# 草稿发布日志", "", `生成时间：${new Date().toISOString()}`, ""];

let published = 0;
for (const file of files) {
  const result = validatePost(file);
  const relative = path.relative(process.cwd(), file.path);

  if (!result.valid) {
    lines.push(`- 跳过：\`${relative}\``);
    for (const issue of result.issues) lines.push(`  - ${issue}`);
    continue;
  }

  const basenameSlug = slugify(path.basename(file.path, ".md"));
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(file.data.slug) ? file.data.slug : basenameSlug;
  const data = {
    ...file.data,
    date: today,
    updatedDate: today,
    slug,
    disclaimer: file.data.disclaimer || defaultDisclaimer,
    readingTime: readingTime(file.content)
  };

  let target = path.join(postsDir, `${slug}.md`);
  let suffix = 2;
  while (true) {
    try {
      await fs.access(target);
      target = path.join(postsDir, `${slug}-${suffix}.md`);
      suffix += 1;
    } catch {
      break;
    }
  }

  await fs.writeFile(target, renderMatter(data, file.content), "utf8");
  await fs.unlink(file.path);
  published += 1;
  lines.push(`- 发布：\`${relative}\` -> \`${path.relative(process.cwd(), target)}\``);
}

lines.push("");
lines.push(`发布数量：${published}`);
lines.push(`跳过数量：${files.length - published}`);

await writeUtf8Bom(reportPath, lines.join("\n"));
console.log(`草稿发布日志已生成：${reportPath}`);
