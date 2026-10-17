import { describe, expect, it } from 'vitest';
import { buildAudienceNote, lessonCountFromTopic, pickLearnerTypes } from './audience';

describe('buildAudienceNote', () => {
  it('describes a non-CS beginner', () => {
    expect(buildAudienceNote({ background: 'non_cs', codingLevel: 0, track: 'explorer' })).toBe(
      'a non-CS university student who has never coded; likes concepts and everyday examples first',
    );
  });

  it('adds the reason and works without a profile', () => {
    expect(buildAudienceNote(null, 'my internship')).toBe('wants to learn this because: my internship');
    expect(buildAudienceNote(null)).toBeUndefined();
  });

  it('clamps odd coding levels', () => {
    expect(buildAudienceNote({ background: 'cs_graduate', codingLevel: 9, track: 'builder' })).toContain(
      'who codes regularly',
    );
  });
});

describe('lessonCountFromTopic', () => {
  it('reads a lesson count from the topic', () => {
    expect(lessonCountFromTopic('Ancient Rome in 5 lessons')).toBe(5);
    expect(lessonCountFromTopic('Git in 2 short lessons')).toBe(2);
  });

  it('falls back otherwise', () => {
    expect(lessonCountFromTopic('Basics of photography')).toBe(4);
    expect(lessonCountFromTopic('Top 10 lessons of history')).toBe(4);
  });
});

describe('pickLearnerTypes', () => {
  it('keeps preferred types that exist, else everything', () => {
    expect(pickLearnerTypes(['quiz', 'coding', 'slides'])).toEqual(['quiz', 'slides']);
    expect(pickLearnerTypes(['coding', 'roleplay'])).toEqual(['coding', 'roleplay']);
    expect(pickLearnerTypes([])).toEqual([]);
  });
});
