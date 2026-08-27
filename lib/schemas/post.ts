import { z } from "zod";

import { CATEGORIES } from "@/lib/types";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  body: z
    .string()
    .trim()
    .min(20, "Post body must be at least 20 characters.")
    .max(5000, "Post body must be 5,000 characters or fewer."),
  category: z.enum(CATEGORIES),
});

export type PostFormValues = z.infer<typeof postSchema>;
