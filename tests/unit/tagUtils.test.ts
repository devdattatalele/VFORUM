import { describe, it, expect } from 'vitest';
import { addTagNormalized } from '@/lib/utils/tagUtils';

describe('addTagNormalized', () => {
  it('"React" then "react" yields exactly ["react"]', () => {
    const afterFirst = addTagNormalized([], 'React', 5);
    const afterSecond = addTagNormalized(afterFirst, 'react', 5);
    expect(afterSecond).toEqual(['react']);
  });

  it('"React" twice yields ["react"]', () => {
    const afterFirst = addTagNormalized([], 'React', 5);
    const afterSecond = addTagNormalized(afterFirst, 'React', 5);
    expect(afterSecond).toEqual(['react']);
  });

  it('empty input is a no-op', () => {
    const tags = ['react'];
    expect(addTagNormalized(tags, '', 5)).toBe(tags);
  });

  it('whitespace-only input is a no-op', () => {
    const tags = ['react'];
    expect(addTagNormalized(tags, '   ', 5)).toBe(tags);
  });

  it('" react " normalizes to "react"', () => {
    expect(addTagNormalized([], '  react  ', 5)).toEqual(['react']);
  });

  it('the max cap holds and the next add is a no-op', () => {
    const fullTags = ['a', 'b', 'c', 'd', 'e'];
    expect(addTagNormalized(fullTags, 'f', 5)).toBe(fullTags);
  });
});
