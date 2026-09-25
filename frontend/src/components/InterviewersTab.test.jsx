import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewersTab from './InterviewersTab.jsx';

const interviewers = [
  { id: 1, name: 'Elena Marsh', role: 'QA', skills: ['Java'], available: false, activeCandidateCount: 2 },
  { id: 2, name: 'Ada Lovelace', role: null, skills: ['React'], available: true, activeCandidateCount: 0 },
  { id: 3, name: 'Raj Patel', role: 'DEV', skills: ['Java'], available: true, activeCandidateCount: 0 },
];

function renderTab() {
  render(<InterviewersTab interviewers={interviewers} allSkills={['Java', 'React']} reload={() => {}} />);
}

describe('InterviewersTab grouping', () => {
  it('shows a flat list until grouping is turned on', () => {
    renderTab();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /group by role/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('groups interviewers by role in role order, with no role last', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: /group by role/i }));

    const regions = screen.getAllByRole('region');
    expect(regions.map((r) => r.getAttribute('aria-label'))).toEqual(['Dev', 'QA', 'No role']);
  });

  it('collapses every group by default, showing only headings and counts', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: /group by role/i }));

    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'QA 1' })).toBeInTheDocument();
    expect(screen.queryByText('Elena Marsh')).not.toBeInTheDocument();
  });

  it('expands and collapses a group from its heading', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: /group by role/i }));

    const devToggle = screen.getByRole('button', { name: 'Dev 1' });
    await user.click(devToggle);
    expect(devToggle).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('region', { name: 'Dev' })).getByText('Raj Patel')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();

    await user.click(devToggle);
    expect(devToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Raj Patel')).not.toBeInTheDocument();
  });

  it('collapses all groups again when grouping is turned off and back on', async () => {
    const user = userEvent.setup();
    renderTab();
    const groupButton = screen.getByRole('button', { name: /group by role/i });
    await user.click(groupButton);
    await user.click(screen.getByRole('button', { name: 'Dev 1' }));
    await user.click(groupButton);
    expect(screen.getByText('Raj Patel')).toBeInTheDocument();

    await user.click(groupButton);
    expect(screen.getByRole('button', { name: 'Dev 1' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Raj Patel')).not.toBeInTheDocument();
  });

  it('groups only the interviewers that match the filter', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: /group by role/i }));
    await user.type(screen.getByRole('textbox'), 'Java{Tab}');

    const regions = screen.getAllByRole('region');
    expect(regions.map((r) => r.getAttribute('aria-label'))).toEqual(['Dev', 'QA']);
  });
});

describe('InterviewersTab availability filter', () => {
  it('shows everyone by default', () => {
    renderTab();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Elena Marsh')).toBeInTheDocument();
    expect(screen.getByText('Raj Patel')).toBeInTheDocument();
  });

  it('filters to available or interviewing interviewers', async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(screen.getByRole('button', { name: 'Interviewing' }));
    expect(screen.getByText('Elena Marsh')).toBeInTheDocument();
    expect(screen.queryByText('Raj Patel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Available' }));
    expect(screen.queryByText('Elena Marsh')).not.toBeInTheDocument();
    expect(screen.getByText('Raj Patel')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('combines with the skill filter and with grouping', async () => {
    const user = userEvent.setup();
    renderTab();
    await user.click(screen.getByRole('button', { name: 'Available' }));
    await user.type(screen.getByRole('textbox'), 'Java{Tab}');
    await user.click(screen.getByRole('button', { name: /group by role/i }));

    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual(['Dev']);
    expect(screen.getByRole('button', { name: 'Dev 1' })).toBeInTheDocument();
  });
});
