import { z } from 'zod';

export const sequenceConfigSchema = z.object({
  instructions: z.string().default('Put the steps in the right order.'),
  // Stored in the CORRECT order; the player shuffles them.
  steps: z.array(z.string().min(1)).min(3).max(8),
});

export type SequenceConfig = z.infer<typeof sequenceConfigSchema>;
