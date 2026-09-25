import { groupByRole } from './roles.js';

describe('groupByRole', () => {
  it('groups in role order with no-role interviewers last, skipping empty roles', () => {
    const interviewers = [
      { id: 1, role: 'QA' },
      { id: 2, role: null },
      { id: 3, role: 'DEV' },
      { id: 4, role: 'QA' },
    ];
    expect(groupByRole(interviewers)).toEqual([
      { role: 'DEV', label: 'Dev', interviewers: [{ id: 3, role: 'DEV' }] },
      { role: 'QA', label: 'QA', interviewers: [{ id: 1, role: 'QA' }, { id: 4, role: 'QA' }] },
      { role: null, label: 'No role', interviewers: [{ id: 2, role: null }] },
    ]);
  });

  it('puts interviewers with a missing or unknown role under "No role"', () => {
    const groups = groupByRole([{ id: 1 }, { id: 2, role: 'MANAGER' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('No role');
    expect(groups[0].interviewers.map((i) => i.id)).toEqual([1, 2]);
  });

  it('returns no groups for an empty list', () => {
    expect(groupByRole([])).toEqual([]);
  });
});
