import rss from "@astrojs/rss";
import { getPublishedPosts } from "@lib/posts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@lib/site";

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`
    }))
  });
}
