import { filterSuggestions, matchesAllTags, matchesAvailability, matchesSearch } from './interviewerFilter.js';

const elena = { name: 'Elena Marsh', role: 'AT', skills: ['Java', 'Selenium'] };
const ben = { name: 'Ben Whitfield', role: 'DEVOPS', skills: ['Azure'] };
const noRole = { name: 'Ada Lovelace', role: null, skills: ['React'] };

describe('matchesAllTags', () => {
  it('matches skills ignoring case', () => {
    expect(matchesAllTags(elena, ['java'])).toBe(true);
    expect(matchesAllTags(elena, ['SELENIUM', 'Java'])).toBe(true);
    expect(matchesAllTags(elena, ['react'])).toBe(false);
  });

  it('matches the role by label or value, ignoring case', () => {
    expect(matchesAllTags(elena, ['at'])).toBe(true);
    expect(matchesAllTags(ben, ['DevOps'])).toBe(true);
    expect(matchesAllTags(ben, ['devops', 'azure'])).toBe(true);
    expect(matchesAllTags(ben, ['at'])).toBe(false);
  });

  it('handles interviewers without a role', () => {
    expect(matchesAllTags(noRole, ['react'])).toBe(true);
    expect(matchesAllTags(noRole, ['dev'])).toBe(false);
  });

  it('matches everyone when there are no tags', () => {
    expect(matchesAllTags(noRole, [])).toBe(true);
  });
});

describe('filterSuggestions', () => {
  it('adds role labels and drops case-insensitive duplicates', () => {
    expect(filterSuggestions(['at', 'Java', 'java'])).toEqual(['Dev', 'AT', 'DevOps', 'QA', 'Java']);
  });
});

describe('matchesAvailability', () => {
  const free = { available: true };
  const busy = { available: false };

  it('matches everyone for ALL', () => {
    expect(matchesAvailability(free, 'ALL')).toBe(true);
    expect(matchesAvailability(busy, 'ALL')).toBe(true);
  });

  it('matches only available interviewers for AVAILABLE', () => {
    expect(matchesAvailability(free, 'AVAILABLE')).toBe(true);
    expect(matchesAvailability(busy, 'AVAILABLE')).toBe(false);
  });

  it('matches only interviewing interviewers for BUSY', () => {
    expect(matchesAvailability(free, 'BUSY')).toBe(false);
    expect(matchesAvailability(busy, 'BUSY')).toBe(true);
  });
});

describe('matchesSearch', () => {
  it('matches everyone for a blank query', () => {
    expect(matchesSearch(elena, '')).toBe(true);
    expect(matchesSearch(elena, '   ')).toBe(true);
  });

  it('matches part of the name or a skill, ignoring case', () => {
    expect(matchesSearch(elena, 'mar')).toBe(true);
    expect(matchesSearch(elena, 'SELEN')).toBe(true);
    expect(matchesSearch(elena, 'azure')).toBe(false);
  });

  it('matches the role by value or label', () => {
    expect(matchesSearch(ben, 'devops')).toBe(true);
    expect(matchesSearch(noRole, 'dev')).toBe(false);
  });
});
