import { z } from 'zod';

export const quizConfigSchema = z
  .object({
    questions: z
      .array(
        z.object({
          prompt: z.string().min(1),
          options: z.array(z.string().min(1)).min(2).max(6),
          answerIndex: z.number().int().min(0),
          explanation: z.string().default(''),
        }),
      )
      .min(1)
      .max(10),
  })
  .refine((c) => c.questions.every((q) => q.answerIndex < q.options.length), {
    message: 'answerIndex must point to one of the options',
  });

export type QuizConfig = z.infer<typeof quizConfigSchema>;
