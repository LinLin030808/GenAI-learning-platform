import { z } from 'zod';

export const sortConfigSchema = z
  .object({
    instructions: z.string().default('Put each card in the right group.'),
    buckets: z.array(z.string().min(1)).min(2).max(4),
    items: z
      .array(z.object({ text: z.string().min(1), bucket: z.string().min(1) }))
      .min(2)
      .max(12),
  })
  .refine((c) => c.items.every((i) => c.buckets.includes(i.bucket)), {
    message: 'every item.bucket must be one of buckets',
  });

export type SortConfig = z.infer<typeof sortConfigSchema>;
