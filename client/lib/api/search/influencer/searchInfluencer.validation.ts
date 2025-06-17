import { z } from "zod";

// export const searchInfluencerSchema = z.object({
//   firstName: z.string().optional(),
//   lastName: z.string().optional(),
//   primaryNiche: z.string().optional(),
//   secondaryNiche: z.string().optional(),
//   country: z.string().optional(),
//   page: z.string().optional(),
//   limit: z.string().optional(),
// });

export const searchInfluencerSchema = z.object({
  username: z.string().optional(),
  primaryNiche: z.string().optional(),
  secondaryNiche: z.string().optional(),
  country: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),

  // page: z.string().optional(),
  // limit: z.string().optional(),
});

export type IsearchInfluencer = z.infer<typeof searchInfluencerSchema>;
