export const ROLES = [
  { value: 'DEV', label: 'Dev' },
  { value: 'AT', label: 'AT' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'QA', label: 'QA' },
];

export function roleLabel(value) {
  return ROLES.find((r) => r.value === value)?.label ?? '';
}

// Splits interviewers into sections in ROLES order, with interviewers without a role last.
// Empty sections are left out; each section keeps the interviewers' original order.
export function groupByRole(interviewers) {
  const groups = [...ROLES, { value: null, label: 'No role' }].map((r) => ({
    role: r.value,
    label: r.label,
    interviewers: [],
  }));
  for (const interviewer of interviewers) {
    const group = groups.find((g) => g.role === interviewer.role) ?? groups[groups.length - 1];
    group.interviewers.push(interviewer);
  }
  return groups.filter((g) => g.interviewers.length > 0);
}
