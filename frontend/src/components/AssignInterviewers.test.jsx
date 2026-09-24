import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignInterviewers from './AssignInterviewers.jsx';

const interviewers = [
  { id: 1, name: 'Dana Kovic', activeCandidateCount: 1 },
  { id: 2, name: 'Priya Nair', activeCandidateCount: 0 },
];

describe('AssignInterviewers', () => {
  it('renders assigned interviewers as chips', () => {
    render(<AssignInterviewers interviewerIds={[1]} interviewers={interviewers} onChange={() => {}} />);
    expect(screen.getByText('Dana Kovic')).toBeInTheDocument();
    expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
  });

  it('adds an interviewer picked from the Assign dropdown', async () => {
    const onChange = vi.fn();
    render(<AssignInterviewers interviewerIds={[1]} interviewers={interviewers} onChange={onChange} />);
    await userEvent.click(screen.getByText('Assign'));
    await userEvent.click(screen.getByText('Priya Nair'));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it('removes an assigned interviewer via its chip', async () => {
    const onChange = vi.fn();
    render(<AssignInterviewers interviewerIds={[1, 2]} interviewers={interviewers} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Remove Dana Kovic'));
    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it('shows a message when every interviewer is already assigned', async () => {
    render(<AssignInterviewers interviewerIds={[1, 2]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    expect(screen.getByText('No more interviewers')).toBeInTheDocument();
  });
});
