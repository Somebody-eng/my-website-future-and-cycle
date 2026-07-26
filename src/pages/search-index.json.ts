import type { APIRoute } from "astro";
import { getPublishedPosts } from "@lib/posts";

export const prerender = true;

function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^---[\s\S]*?---/m, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[>#*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchableText(markdown: string, category: string) {
  const text = plainText(markdown);
  if (category !== "伯克希尔股东会实录" || text.length <= 15000) return text;

  const chunkSize = 5000;
  const middleStart = Math.max(chunkSize, Math.floor(text.length / 2) - Math.floor(chunkSize / 2));
  return [
    text.slice(0, chunkSize),
    text.slice(middleStart, middleStart + chunkSize),
    text.slice(-chunkSize)
  ].join(" … ");
}
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    url: `../posts/${post.slug}/`,
    date: post.data.date.toISOString(),
    updatedDate: post.data.updatedDate.toISOString(),
    readingTime: post.data.readingTime,
    content: searchableText(post.body, post.data.category)
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
