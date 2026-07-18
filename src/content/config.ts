import { defineCollection, z } from "astro:content";

const DEFAULT_DISCLAIMER = "本文仅用于商业与投资教育讨论，不构成任何投资建议。";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    updatedDate: z.coerce.date(),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    author: z.string().default("未来与周期编辑部"),
    coverImage: z.string().default("/images/covers/default.svg"),
    coverAlt: z.string().min(1),
    readingTime: z.number().int().positive(),
    featured: z.boolean().default(false),
    disclaimer: z.string().default(DEFAULT_DISCLAIMER),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string().url().optional(),
        note: z.string().optional()
      })
    ).default([])
  })
});

export const collections = { posts };
