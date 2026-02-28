import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    images: z.array(z.string()),
    categories: z.array(z.string()),
    featured: z.boolean().optional(),
    summary: z.string(),
  }),
});

const aboutCollection = defineCollection({
  type: "content",
});

export const collections = {
  blog: blogCollection,
  about: aboutCollection,
};
