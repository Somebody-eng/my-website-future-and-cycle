import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const requiredFields = [
  "title",
  "description",
  "date",
  "updatedDate",
  "category",
  "tags",
  "slug",
  "author",
  "coverImage",
  "coverAlt",
  "readingTime",
  "featured",
  "disclaimer",
  "sources"
];

export const riskPhrases = ["稳赚", "必涨", "推荐买入", "建议买入", "马上买", "翻倍", "确定收益"];
export const defaultDisclaimer = "本文仅用于商业与投资教育讨论，不构成任何投资建议。";

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeUtf8Bom(filePath, content) {
  await fs.writeFile(filePath, `\ufeff${content}`, "utf8");
}

export async function readMarkdownFiles(dir) {
  await ensureDir(dir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const raw = await fs.readFile(fullPath, "utf8");
      files.push({ path: fullPath, raw, ...matter(raw) });
    }
  }
  return files;
}

export function stripMarkdown(content) {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "")
    .replace(/[#>*_`~-]/g, "")
    .trim();
}

export function chineseLength(content) {
  const matches = stripMarkdown(content).match(/[\u4e00-\u9fff]/g);
  return matches ? matches.length : 0;
}

export function wordCount(content) {
  const text = stripMarkdown(content);
  const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const english = (text.match(/[A-Za-z0-9]+/g) || []).length;
  return chinese + english;
}

export function readingTime(content) {
  return Math.max(1, Math.ceil(wordCount(content) / 450));
}

export function internalLinks(content) {
  return [...content.matchAll(/\[[^\]]+]\((\/[^)]+)\)/g)].map((match) => match[1]);
}

export function slugify(input) {
  const slug = String(input || "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || `post-${new Date().toISOString().slice(0, 10)}`;
}

export function validatePost(file, options = {}) {
  const minChineseLength = options.minChineseLength ?? 1200;
  const issues = [];
  const data = file.data || {};

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      issues.push(`缺少 frontmatter 字段：${field}`);
    }
  }

  if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    issues.push("slug 必须为英文小写、数字和连字符");
  }

  if (chineseLength(file.content) < minChineseLength) {
    issues.push(`中文正文少于 ${minChineseLength} 字`);
  }

  const disclaimerText = `${data.disclaimer || ""}\n${file.content}`;
  if (!disclaimerText.includes("不构成任何投资建议")) {
    issues.push("缺少免责声明或免责声明表述不足");
  }

  for (const phrase of riskPhrases) {
    if (`${file.raw}`.includes(phrase)) {
      issues.push(`出现高风险表述：${phrase}`);
    }
  }

  if (internalLinks(file.content).length < 2) {
    issues.push("内部链接少于 2 个");
  }

  if (!Array.isArray(data.sources) || data.sources.length < 1) {
    issues.push("缺少至少一个来源说明");
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export function renderMatter(data, content) {
  return matter.stringify(content.trim() + "\n", data, { lineWidth: 100 });
}
