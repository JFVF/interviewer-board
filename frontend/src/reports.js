import Papa from 'papaparse';
import { roleLabel } from './roles.js';
import { STATUSES, STATUS_LABELS } from './statuses.js';

export const DEFAULT_SORT = { key: 'total', direction: 'desc' };

function emptyCounts() {
  return Object.fromEntries(STATUSES.map((s) => [s, 0]));
}

// One row per interviewer with how many assigned candidates sit in each status. A candidate with
// several interviewers counts once for each of them, so the totals are interviews, not candidates.
// Rows are sorted by total (busiest first), then by name.
export function interviewsByStatus(interviewers, candidates) {
  const rows = new Map(interviewers.map((i) => [i.id, { interviewer: i, counts: emptyCounts(), total: 0 }]));
  for (const candidate of candidates) {
    for (const id of candidate.interviewerIds) {
      const row = rows.get(id);
      if (!row || !(candidate.status in row.counts)) continue;
      row.counts[candidate.status] += 1;
      row.total += 1;
    }
  }

  const sorted = sortReportRows([...rows.values()], DEFAULT_SORT);
  const totals = emptyCounts();
  for (const row of sorted) {
    for (const s of STATUSES) totals[s] += row.counts[s];
  }
  const grandTotal = STATUSES.reduce((sum, s) => sum + totals[s], 0);
  return { rows: sorted, totals, grandTotal };
}

// Sort keys: 'name', 'total', or a status. Ties fall back to name A→Z so the order is stable.
export function sortReportRows(rows, { key, direction }) {
  const sign = direction === 'asc' ? 1 : -1;
  const value = (row) => (key === 'total' ? row.total : row.counts[key]);
  const byName = (a, b) => a.interviewer.name.localeCompare(b.interviewer.name);
  return [...rows].sort((a, b) => {
    if (key === 'name') return sign * byName(a, b);
    return sign * (value(a) - value(b)) || byName(a, b);
  });
}

// CSV of the report in the given row order, with a trailing totals row.
export function reportToCsv(rows, totals, grandTotal) {
  const fields = ['Interviewer', 'Role', ...STATUSES.map((s) => STATUS_LABELS[s]), 'Total'];
  const data = rows.map(({ interviewer, counts, total }) => [
    interviewer.name,
    roleLabel(interviewer.role),
    ...STATUSES.map((s) => counts[s]),
    total,
  ]);
  data.push(['Total', '', ...STATUSES.map((s) => totals[s]), grandTotal]);
  // escapeFormulae stops names like "=cmd" from running as spreadsheet formulas.
  return Papa.unparse({ fields, data }, { escapeFormulae: true });
}
