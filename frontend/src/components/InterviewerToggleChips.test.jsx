import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewerToggleChips from './InterviewerToggleChips.jsx';

const interviewers = [
  { id: 1, name: 'Dana Kovic', activeCandidateCount: 1 },
  { id: 2, name: 'Priya Nair', activeCandidateCount: 0 },
];

describe('InterviewerToggleChips', () => {
  it('shows each interviewer name with their active candidate count', () => {
    render(<InterviewerToggleChips interviewers={interviewers} selectedIds={[]} onChange={() => {}} />);
    expect(screen.getByText(/Dana Kovic/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('selects an interviewer when its chip is clicked', async () => {
    const onChange = vi.fn();
    render(<InterviewerToggleChips interviewers={interviewers} selectedIds={[]} onChange={onChange} />);
    await userEvent.click(screen.getByText(/Dana Kovic/));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it('deselects an interviewer already selected', async () => {
    const onChange = vi.fn();
    render(<InterviewerToggleChips interviewers={interviewers} selectedIds={[1, 2]} onChange={onChange} />);
    await userEvent.click(screen.getByText(/Dana Kovic/));
    expect(onChange).toHaveBeenCalledWith([2]);
  });
});
