// Offline heuristic feedback, used when no AI key is configured. Rewards asking open
// questions, engaging over several turns and giving substantive answers.
import type { RoleplayConfig, RoleplayFeedback, RoleplayMessage } from './schema';

const OPEN_STARTERS = /^(what|how|why|who|when|where|could you|can you|tell me|walk me)/i;

export function mockFeedback(c: RoleplayConfig, messages: RoleplayMessage[]): RoleplayFeedback {
  const learner = messages.filter((m) => m.role === 'learner');
  const questions = learner.filter((m) => m.content.includes('?')).length;
  const open = learner.filter((m) => OPEN_STARTERS.test(m.content.trim())).length;
  const avgLen = learner.reduce((n, m) => n + m.content.split(/\s+/).length, 0) / Math.max(1, learner.length);

  const engagement = Math.min(100, (learner.length / c.maxTurns) * 100);
  const curiosity = Math.min(100, questions * 22 + open * 12);
  const depth = Math.min(100, avgLen * 6);
  const overall = Math.round(engagement * 0.35 + curiosity * 0.4 + depth * 0.25);

  return {
    overall,
    criteria: c.rubric.map((r, i) => ({
      criterion: r.criterion,
      score: Math.max(20, Math.min(100, Math.round([curiosity, depth, engagement][i % 3]!))),
      comment:
        i % 3 === 0
          ? `You asked ${questions} question${questions === 1 ? '' : 's'}${open ? `, ${open} of them open-ended` : ''}.`
          : i % 3 === 1
            ? `Your messages averaged ${Math.round(avgLen)} words. ${avgLen < 8 ? 'Try adding a bit more detail.' : 'Good level of detail.'}`
            : `You kept the conversation going for ${learner.length} of ${c.maxTurns} turns.`,
    })),
    strengths: questions > 0 ? ['You asked questions instead of assuming.'] : ['You stayed polite and on topic.'],
    improve: open < 2 ? ['Use more open questions that start with "what", "how" or "why".'] : ['Summarise what you heard before moving on.'],
    tip: 'Try: "Just to check I understood: you need X by Y because Z. Is that right?"',
  };
}
