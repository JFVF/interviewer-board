import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from 'lucide-react';
import { roleLabel } from '../roles.js';
import { STATUSES, STATUS_CLASSES, STATUS_LABELS } from '../statuses.js';
import { DEFAULT_SORT, interviewsByStatus, reportToCsv, sortReportRows } from '../reports.js';

function Count({ value }) {
  return <span className={value === 0 ? 'report-zero' : undefined}>{value}</span>;
}

function SortHeader({ sortKey, sort, onSort, numeric, children }) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      className={numeric ? 'report-num' : undefined}
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" className={`report-sort${active ? ' active' : ''}`} onClick={() => onSort(sortKey)}>
        {children}
        <Icon size={12} className="report-sort-icon" aria-hidden="true" />
      </button>
    </th>
  );
}

function downloadCsv(filename, csv) {
  // The BOM makes Excel read the file as UTF-8, so accented names survive.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Revoke on the next tick; revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReportsTab({ interviewers, candidates }) {
  const report = useMemo(() => interviewsByStatus(interviewers, candidates), [interviewers, candidates]);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const rows = useMemo(() => sortReportRows(report.rows, sort), [report.rows, sort]);

  // A new column starts A→Z for names and highest-first for counts; clicking it again flips the order.
  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'name' ? 'asc' : 'desc' }
    );
  }

  function handleExport() {
    downloadCsv(`interviews-by-status-${today()}.csv`, reportToCsv(rows, report.totals, report.grandTotal));
  }

  return (
    <div className="tab-panel">
      <section className="report" aria-labelledby="report-interviews-by-status">
        <div className="report-header">
          <h2 className="report-title" id="report-interviews-by-status">
            Interviews by status
          </h2>
          <button type="button" className="link-btn" onClick={handleExport} disabled={rows.length === 0}>
            <Download size={15} /> Export CSV
          </button>
        </div>
        <p className="helper-text">
          How many candidates each interviewer has in each status. A candidate with several interviewers counts
          once for each of them.
        </p>

        {rows.length === 0 ? (
          <p className="empty-state">No interviewers yet.</p>
        ) : (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <SortHeader sortKey="name" sort={sort} onSort={handleSort}>
                    Interviewer
                  </SortHeader>
                  {STATUSES.map((s) => (
                    <SortHeader key={s} sortKey={s} sort={sort} onSort={handleSort} numeric>
                      <span className={`report-status ${STATUS_CLASSES[s]}`}>{STATUS_LABELS[s]}</span>
                    </SortHeader>
                  ))}
                  <SortHeader sortKey="total" sort={sort} onSort={handleSort} numeric>
                    Total
                  </SortHeader>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ interviewer, counts, total }) => (
                  <tr key={interviewer.id}>
                    <th scope="row">
                      {interviewer.name}
                      {interviewer.role && <span className="role-badge">{roleLabel(interviewer.role)}</span>}
                    </th>
                    {STATUSES.map((s) => (
                      <td key={s} className="report-num">
                        <Count value={counts[s]} />
                      </td>
                    ))}
                    <td className="report-num report-total">
                      <Count value={total} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  {STATUSES.map((s) => (
                    <td key={s} className="report-num">
                      {report.totals[s]}
                    </td>
                  ))}
                  <td className="report-num report-total">{report.grandTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
