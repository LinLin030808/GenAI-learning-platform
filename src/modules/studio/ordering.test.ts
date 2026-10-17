import { describe, expect, it } from 'vitest';
import { formatIssues, moveItem, parseTags } from './ordering';

describe('moveItem', () => {
  it('moves an item up and down', () => {
    expect(moveItem(['a', 'b', 'c'], 'b', 'up')).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 'b', 'down')).toEqual(['a', 'c', 'b']);
  });

  it('leaves the list alone at the edges or for unknown ids', () => {
    expect(moveItem(['a', 'b'], 'a', 'up')).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 'b', 'down')).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 'x', 'up')).toEqual(['a', 'b']);
  });
});

describe('parseTags', () => {
  it('trims, drops empties and duplicates, and caps the count', () => {
    expect(parseTags(' git , teamwork,, git ,')).toEqual(['git', 'teamwork']);
    expect(parseTags('a,b,c,d,e,f,g,h')).toHaveLength(6);
  });
});

describe('formatIssues', () => {
  it('joins paths and messages', () => {
    expect(formatIssues([{ path: ['questions', 0, 'prompt'], message: 'Required' }])).toBe(
      'questions.0.prompt: Required',
    );
  });
});
