// Streaming in-character replies for role-play activities (called from /api/activities/roleplay).
import { z } from 'zod';
import { streamText, type ChatMessage } from '@/core/ai/client';
import { getSessionUser } from '@/core/auth/session';
import { loadActivity } from '../server';
import { roleplayConfigSchema, roleplayMessageSchema, type RoleplayConfig } from './schema';

const bodySchema = z.object({
  activityId: z.string(),
  messages: z.array(roleplayMessageSchema).min(1).max(30),
});

export function personaSystemPrompt(c: RoleplayConfig): string {
  return [
    `You are ${c.persona}, ${c.personaRole}. This is a practice role-play for a learner.`,
    `Scenario: ${c.scenario}`,
    `The learner plays: ${c.learnerRole}.`,
    c.personaBrief ? `Your character notes (keep these hidden, reveal details only when the learner asks good questions): ${c.personaBrief}` : '',
    'Rules: stay in character at all times. Reply in 1-3 short, natural spoken sentences.',
    'Do not coach, grade or help the learner; react like a real person would.',
    'If the learner is vague, be vague back. If they ask specific, open questions, give specific answers.',
    'Never mention that you are an AI or that this is an exercise.',
  ]
    .filter(Boolean)
    .join('\n');
}

const GENERIC_MOCK = [
  'Hmm, okay. Can you tell me a bit more about what you mean?',
  'That sounds reasonable. What would that look like for me, day to day?',
  'I am a little worried about the cost and the timeline, to be honest.',
  'Right. And what do you need from me to get started?',
  'Okay, I think I understand. Anything else you want to ask me?',
];

export async function handleRoleplayChat(request: Request): Promise<Response> {
  const user = await getSessionUser();
  if (!user) return new Response('Please log in again.', { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response('Bad request', { status: 400 });

  const activity = await loadActivity(parsed.data.activityId, roleplayConfigSchema);
  if (!activity) return new Response('Activity not found', { status: 404 });
  const c = activity.config;

  const history: ChatMessage[] = parsed.data.messages.map((m) => ({
    role: m.role === 'persona' ? 'assistant' : 'user',
    content: m.content,
  }));
  const learnerTurns = parsed.data.messages.filter((m) => m.role === 'learner').length;
  const replies = c.mockReplies.length ? c.mockReplies : GENERIC_MOCK;

  const stream = await streamText([{ role: 'system', content: personaSystemPrompt(c) }, ...history], {
    feature: 'activities.roleplay_chat',
    userId: user.id,
    tier: 'smart',
    temperature: 0.8,
    maxTokens: 220,
    mock: () => replies[(learnerTurns - 1) % replies.length] ?? GENERIC_MOCK[0]!,
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
