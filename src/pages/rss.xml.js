import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

export async function GET(context) {
  const allPosts = await getCollection("blog", ({ id }) =>
    id.startsWith("en/")
  );

  const posts = allPosts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: "Asep Bagja's Blog",
    description:
      "Writings on software engineering, electronics, music, and personal development by Asep Bagja.",
    site: context.site,
    customData: `<language>en-us</language>`,
    items: posts.map((post) => {
      const category = post.data.categories[0].toLowerCase();
      const slug = post.slug.replace("en/", "");
      return {
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
        link: `/${category}/${slug}/`,
        content: sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "title", "width", "height"],
            a: ["href", "title", "target"],
          },
        }),
      };
    }),
  });
}
