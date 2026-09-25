import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportsTab from './ReportsTab.jsx';

const interviewers = [
  { id: 1, name: 'Elena Marsh', role: 'AT' },
  { id: 2, name: 'Raj Patel', role: null },
];
const candidates = [
  { id: 10, status: 'SCHEDULED', interviewerIds: [1, 2] },
  { id: 11, status: 'DONE', interviewerIds: [1] },
];

function cells(rowHeader) {
  const row = screen.getByRole('rowheader', { name: rowHeader }).closest('tr');
  return within(row).getAllByRole('cell').map((c) => c.textContent);
}

// Interviewer names in table order, without the totals row.
const names = () => screen.getAllByRole('rowheader').map((h) => h.textContent).slice(0, -1);

describe('ReportsTab', () => {
  it('shows per-status counts and a total for each interviewer, busiest first', () => {
    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    expect(screen.getByRole('heading', { name: 'Interviews by status' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Interviewer', 'Scheduling', 'Scheduled', 'Done', 'Rejected', 'Total',
    ]);
    expect(cells(/Elena Marsh/)).toEqual(['0', '1', '1', '0', '2']);
    expect(cells('Raj Patel')).toEqual(['0', '1', '0', '0', '1']);
    expect(names()).toEqual(['Elena MarshAT', 'Raj Patel']);
  });

  it('totals each status column', () => {
    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    expect(cells('Total')).toEqual(['0', '2', '1', '0', '3']);
  });

  it('shows an empty state and disables export when there are no interviewers', () => {
    render(<ReportsTab interviewers={[]} candidates={[]} />);
    expect(screen.getByText('No interviewers yet.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/ })).toBeDisabled();
  });

  it('sorts by total, highest first, by default', () => {
    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    expect(screen.getByRole('columnheader', { name: /Total/ })).toHaveAttribute('aria-sort', 'descending');
  });

  it('sorts by a column and flips the direction on a second click', async () => {
    const user = userEvent.setup();
    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    const header = (name) => screen.getByRole('columnheader', { name });

    await user.click(screen.getByRole('button', { name: /Interviewer/ }));
    expect(header(/Interviewer/)).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Elena MarshAT', 'Raj Patel']);

    await user.click(screen.getByRole('button', { name: /Interviewer/ }));
    expect(header(/Interviewer/)).toHaveAttribute('aria-sort', 'descending');
    expect(names()).toEqual(['Raj Patel', 'Elena MarshAT']);

    await user.click(screen.getByRole('button', { name: /Done/ }));
    expect(header(/Done/)).toHaveAttribute('aria-sort', 'descending');
    expect(header(/Interviewer/)).toHaveAttribute('aria-sort', 'none');
    expect(names()).toEqual(['Elena MarshAT', 'Raj Patel']);

    await user.click(screen.getByRole('button', { name: /Done/ }));
    expect(header(/Done/)).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['Raj Patel', 'Elena MarshAT']);
  });

  it('keeps the totals row last whatever the sort', async () => {
    const user = userEvent.setup();
    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    await user.click(screen.getByRole('button', { name: /Total/ }));
    expect(screen.getAllByRole('rowheader').at(-1)).toHaveTextContent('Total');
  });

  it('exports the table as sorted on screen to a dated CSV file', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:report');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    let filename;
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      filename = this.download;
    });

    render(<ReportsTab interviewers={interviewers} candidates={candidates} />);
    await user.click(screen.getByRole('button', { name: /Interviewer/ }));
    await user.click(screen.getByRole('button', { name: /Interviewer/ }));
    await user.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(filename).toMatch(/^interviews-by-status-\d{4}-\d{2}-\d{2}\.csv$/);
    const text = await createObjectURL.mock.calls[0][0].text();
    expect(text.replace(/^﻿/, '').split('\r\n')).toEqual([
      'Interviewer,Role,Scheduling,Scheduled,Done,Rejected,Total',
      'Raj Patel,,0,1,0,0,1',
      'Elena Marsh,AT,0,1,1,0,2',
      'Total,,0,2,1,0,3',
    ]);
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:report'));
    click.mockRestore();
  });
});
