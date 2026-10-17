'use server';

import { z } from 'zod';
import { generateText } from '@/core/ai/client';
import { requireUser } from '@/core/auth/session';
import { loadActivity } from '../server';
import { codingConfigSchema } from './schema';

const inputSchema = z.object({
  activityId: z.string(),
  code: z.string().max(8000),
  failing: z.array(z.string().max(300)).max(12),
});

/** A nudge, not the answer. Uses the cheap model. */
export async function getCodingHint(input: z.infer<typeof inputSchema>): Promise<{ hint: string; mocked: boolean }> {
  const user = await requireUser();
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { hint: 'Run the tests first, then ask me again.', mocked: true };
  const activity = await loadActivity(parsed.data.activityId, codingConfigSchema);
  if (!activity) return { hint: 'I could not find this exercise.', mocked: true };
  const { config } = activity;
  const firstFail = parsed.data.failing[0];

  const { text, mocked } = await generateText(
    [
      {
        role: 'system',
        content:
          'You are Pip, a patient coding tutor. Give ONE short hint (max 70 words) that helps the learner find the problem themselves. ' +
          'Point at the line or idea, ask a guiding question. Never paste a full corrected solution.',
      },
      {
        role: 'user',
        content: [
          `Task: ${config.instructions}`,
          config.hintContext ? `Context: ${config.hintContext}` : '',
          `Function: ${config.functionName}`,
          `Learner code:\n${parsed.data.code}`,
          `Failing tests:\n${parsed.data.failing.join('\n') || '(none run yet)'}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
    {
      feature: 'activities.coding_hint',
      userId: user.id,
      tier: 'fast',
      maxTokens: 200,
      mock: () =>
        firstFail
          ? `Look closely at the failing case: ${firstFail}. What does your function return for that input, step by step? Try adding a console.log just before the return.`
          : 'Start with the simplest test case. What should the function return there, and what does it return now?',
    },
  );
  return { hint: text, mocked };
}
