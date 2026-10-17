import { describe, expect, it } from 'vitest';
import { pickTrack, recommendCourses, type CourseForMatching, type OnboardingAnswers } from './recommend';

const catalog: CourseForMatching[] = [
  { id: 'basics', title: 'How Software Gets Built', tags: ['fundamentals', 'sdlc', 'requirements'], level: 'beginner', audience: 'everyone' },
  { id: 'agents', title: 'Working with AI Coding Agents', tags: ['ai-agents', 'prompting', 'code-review'], level: 'intermediate', audience: 'cs' },
  { id: 'people', title: 'People Skills for Tech Teams', tags: ['communication', 'teamwork', 'interview', 'soft-skills'], level: 'beginner', audience: 'everyone' },
];

const base: OnboardingAnswers = { background: 'non_cs', codingLevel: 0, goal: 'understand', interests: [], style: 'concepts' };

describe('recommendCourses', () => {
  it('puts fundamentals first for a non-CS beginner and the CS-only course last', () => {
    const ids = recommendCourses(base, catalog);
    expect(ids[0]).toBe('basics');
    expect(ids.at(-1)).toBe('agents');
  });

  it('puts the AI agents course first for a CS grad who wants AI skills', () => {
    const ids = recommendCourses({ ...base, background: 'cs_graduate', codingLevel: 3, goal: 'ai_skills', interests: ['ai-agents'] }, catalog);
    expect(ids[0]).toBe('agents');
  });

  it('leans towards people skills for interview-focused learners', () => {
    const ids = recommendCourses({ ...base, background: 'cs_student', codingLevel: 2, goal: 'career', interests: ['interview'] }, catalog);
    expect(ids[0]).toBe('people');
  });
});

describe('pickTrack', () => {
  it('hands-on learners who have coded a bit are builders', () => {
    expect(pickTrack({ ...base, codingLevel: 1, style: 'hands_on' })).toBe('builder');
  });
  it('people who never coded start as explorers even if they like hands-on', () => {
    expect(pickTrack({ ...base, codingLevel: 0, style: 'hands_on' })).toBe('explorer');
  });
});
