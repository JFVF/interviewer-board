import { interviewsByStatus, reportToCsv, sortReportRows } from './reports.js';

const ana = { id: 1, name: 'Ana' };
const ben = { id: 2, name: 'Ben' };
const cy = { id: 3, name: 'Cy' };

describe('interviewsByStatus', () => {
  it('counts each interviewer\'s candidates per status', () => {
    const candidates = [
      { status: 'SCHEDULING', interviewerIds: [1] },
      { status: 'DONE', interviewerIds: [1, 2] },
      { status: 'DONE', interviewerIds: [1] },
      { status: 'REJECTED', interviewerIds: [2] },
    ];
    const { rows } = interviewsByStatus([ana, ben], candidates);
    expect(rows[0]).toEqual({
      interviewer: ana,
      counts: { SCHEDULING: 1, SCHEDULED: 0, DONE: 2, REJECTED: 0 },
      total: 3,
    });
    expect(rows[1]).toEqual({
      interviewer: ben,
      counts: { SCHEDULING: 0, SCHEDULED: 0, DONE: 1, REJECTED: 1 },
      total: 2,
    });
  });

  it('includes interviewers with no interviews, and sorts busiest first then by name', () => {
    const candidates = [{ status: 'SCHEDULED', interviewerIds: [3] }];
    const { rows } = interviewsByStatus([ben, cy, ana], candidates);
    expect(rows.map((r) => r.interviewer.name)).toEqual(['Cy', 'Ana', 'Ben']);
    expect(rows[1].total).toBe(0);
  });

  it('totals each status and counts shared candidates once per interviewer', () => {
    const candidates = [
      { status: 'SCHEDULED', interviewerIds: [1, 2] },
      { status: 'REJECTED', interviewerIds: [] },
    ];
    const { totals, grandTotal } = interviewsByStatus([ana, ben], candidates);
    expect(totals).toEqual({ SCHEDULING: 0, SCHEDULED: 2, DONE: 0, REJECTED: 0 });
    expect(grandTotal).toBe(2);
  });

  it('ignores assignments to interviewers that no longer exist', () => {
    const { rows, grandTotal } = interviewsByStatus([ana], [{ status: 'DONE', interviewerIds: [99] }]);
    expect(rows[0].total).toBe(0);
    expect(grandTotal).toBe(0);
  });
});

const row = (name, counts, role = null) => ({
  interviewer: { name, role },
  counts: { SCHEDULING: 0, SCHEDULED: 0, DONE: 0, REJECTED: 0, ...counts },
  total: Object.values(counts).reduce((a, b) => a + b, 0),
});

describe('sortReportRows', () => {
  const rows = [row('Cy', { DONE: 1 }), row('Ana', { DONE: 3, REJECTED: 1 }), row('Ben', { DONE: 1, SCHEDULING: 2 })];
  const names = (sorted) => sorted.map((r) => r.interviewer.name);

  it('sorts by name in both directions', () => {
    expect(names(sortReportRows(rows, { key: 'name', direction: 'asc' }))).toEqual(['Ana', 'Ben', 'Cy']);
    expect(names(sortReportRows(rows, { key: 'name', direction: 'desc' }))).toEqual(['Cy', 'Ben', 'Ana']);
  });

  it('sorts by a status count in both directions, breaking ties by name', () => {
    expect(names(sortReportRows(rows, { key: 'DONE', direction: 'desc' }))).toEqual(['Ana', 'Ben', 'Cy']);
    expect(names(sortReportRows(rows, { key: 'DONE', direction: 'asc' }))).toEqual(['Ben', 'Cy', 'Ana']);
  });

  it('sorts by total', () => {
    expect(names(sortReportRows(rows, { key: 'total', direction: 'desc' }))).toEqual(['Ana', 'Ben', 'Cy']);
    expect(names(sortReportRows(rows, { key: 'total', direction: 'asc' }))).toEqual(['Cy', 'Ben', 'Ana']);
  });

  it('does not mutate the input', () => {
    const copy = [...rows];
    sortReportRows(rows, { key: 'name', direction: 'asc' });
    expect(rows).toEqual(copy);
  });
});

describe('reportToCsv', () => {
  it('writes a header, one line per row in the given order, and a totals line', () => {
    const csv = reportToCsv(
      [row('Elena Marsh', { SCHEDULED: 2 }, 'AT'), row('Ada', {})],
      { SCHEDULING: 0, SCHEDULED: 2, DONE: 0, REJECTED: 0 },
      2
    );
    expect(csv.split('\r\n')).toEqual([
      'Interviewer,Role,Scheduling,Scheduled,Done,Rejected,Total',
      'Elena Marsh,AT,0,2,0,0,2',
      'Ada,,0,0,0,0,0',
      'Total,,0,2,0,0,2',
    ]);
  });

  it('quotes names with commas or quotes and neutralises formulas', () => {
    const csv = reportToCsv([row('Lee, "Max"', {}), row('=HYPERLINK("x")', {})], {}, 0);
    const lines = csv.split('\r\n');
    expect(lines[1]).toBe('"Lee, ""Max""",,0,0,0,0,0');
    expect(lines[2].startsWith(`"'=HYPERLINK`)).toBe(true);
  });
});
