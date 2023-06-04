import { z, defineCollection } from "astro:content";

const musicCollection = defineCollection({
  type: "data",
  schema: z.object({
    records: z.array(
      z.object({
        title: z.string(),
        year: z.string(),
        single: z.boolean(),
        artwork: z.string(),
        link: z.string(),
      })
    ),
  }),
});

export const collections = {
  music: musicCollection,
};
