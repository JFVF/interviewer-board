import { ROLES, roleLabel } from './roles.js';

// A filter tag matches an interviewer when it equals, ignoring case, one of their skills or their role
// (either the stored value like "DEVOPS" or the display label like "DevOps").
export function matchesAllTags(interviewer, tags) {
  const terms = new Set(interviewer.skills.map((s) => s.toLowerCase()));
  if (interviewer.role) {
    terms.add(interviewer.role.toLowerCase());
    terms.add(roleLabel(interviewer.role).toLowerCase());
  }
  return tags.every((tag) => terms.has(tag.toLowerCase()));
}

// Skill suggestions plus role labels, without case-insensitive duplicates.
export function filterSuggestions(skills) {
  const seen = new Set();
  return [...ROLES.map((r) => r.label), ...skills].filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const AVAILABILITY_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Interviewing' },
];

// ALL matches everyone; AVAILABLE and BUSY follow the interviewer's derived `available` flag.
export function matchesAvailability(interviewer, availability) {
  if (availability === 'AVAILABLE') return interviewer.available;
  if (availability === 'BUSY') return !interviewer.available;
  return true;
}

// Free-text search: matches when the query is part of the interviewer's name, one of their skills, or
// their role (value or label), ignoring case. A blank query matches everyone.
export function matchesSearch(interviewer, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [interviewer.name, ...(interviewer.skills ?? [])];
  if (interviewer.role) fields.push(interviewer.role, roleLabel(interviewer.role));
  return fields.some((f) => f.toLowerCase().includes(q));
}
