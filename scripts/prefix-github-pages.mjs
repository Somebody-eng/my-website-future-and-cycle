import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const basePath = "/my-website-future-and-cycle";
const textExtensions = new Set([".html", ".css", ".js", ".xml", ".txt"]);

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const details = await stat(fullPath);
    if (details.isDirectory()) files.push(...(await collectFiles(fullPath)));
    else if (textExtensions.has(path.extname(entry))) files.push(fullPath);
  }

  return files;
}

function prefixRootPaths(content) {
  return content
    .replace(/((?:href|src|action)=["'])\/(?!\/|my-website-future-and-cycle(?:\/|["']))/g, `$1${basePath}/`)
    .replace(/(url\(["']?)\/(?!\/|my-website-future-and-cycle\/)/g, `$1${basePath}/`);
}

for (const file of await collectFiles(distDir)) {
  const content = await readFile(file, "utf8");
  const updated = prefixRootPaths(content);
  if (updated !== content) await writeFile(file, updated, "utf8");
}

console.log(`GitHub Pages 路径前缀已写入：${basePath}/`);
