import { getCollection, type CollectionEntry } from "astro:content";

export async function getPublishedPosts() {
  const posts = await getCollection("posts");
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || b.slug.localeCompare(a.slug, "en"));
}

export function getAllTags(posts: CollectionEntry<"posts">[]) {
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function getRelatedPosts(current: CollectionEntry<"posts">, posts: CollectionEntry<"posts">[], limit = 3) {
  return posts
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const tagScore = post.data.tags.filter((tag) => current.data.tags.includes(tag)).length;
      const categoryScore = post.data.category === current.data.category ? 2 : 0;
      return { post, score: tagScore + categoryScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.valueOf() - a.post.data.date.valueOf())
    .slice(0, limit)
    .map((item) => item.post);
}
