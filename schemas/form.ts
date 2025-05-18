import { z } from "zod";

// Zod schema matching your Amplify `Form` model
export const formSchema = z.object({
  userId: z.string(),
  createdAt: z.date().or(z.string().transform((val) => new Date(val))), // Allow string input too
  published: z.boolean().default(false),
  name: z.string().min(4),
  description: z.string().default(""),
  content: z.string().default("[]"),
  visits: z.number().int().default(0),
  submissions: z.number().int().default(0),
  shareURL: z.string(),
  projID: z.string().min(1),
});

export type formSchemaType = z.infer<typeof formSchema>;
