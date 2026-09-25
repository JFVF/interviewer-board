import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignInterviewers from './AssignInterviewers.jsx';

const interviewers = [
  { id: 1, name: 'Dana Kovic', role: 'DEV', skills: ['Java'], activeCandidateCount: 1 },
  { id: 2, name: 'Priya Nair', role: 'QA', skills: ['Selenium'], activeCandidateCount: 0 },
  { id: 3, name: 'Ben Whitfield', role: 'DEVOPS', skills: ['Azure', 'Terraform'], activeCandidateCount: 0 },
  { id: 4, name: 'Ada Lovelace', role: null, skills: [], activeCandidateCount: 0 },
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
    render(<AssignInterviewers interviewerIds={[1, 2, 3, 4]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    expect(screen.queryByLabelText('Search interviewers')).not.toBeInTheDocument();
    expect(screen.getByText('No more interviewers')).toBeInTheDocument();
  });

  it('shows a small role label next to each interviewer', async () => {
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    const option = (name) => screen.getByRole('button', { name: new RegExp(name) });
    expect(option('Dana Kovic')).toHaveTextContent('Dev');
    expect(option('Ben Whitfield')).toHaveTextContent('DevOps');
    expect(option('Ada Lovelace').querySelector('.assign-menu-role')).toBeNull();
  });

  it('focuses the search field when the menu opens', async () => {
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    expect(screen.getByLabelText('Search interviewers')).toHaveFocus();
  });

  it('filters the list by name or skill as you type', async () => {
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    const search = screen.getByLabelText('Search interviewers');

    await userEvent.type(search, 'priya');
    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
    expect(screen.queryByText('Dana Kovic')).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'terra');
    expect(screen.getByText('Ben Whitfield')).toBeInTheDocument();
    expect(screen.queryByText('Priya Nair')).not.toBeInTheDocument();
  });

  it('assigns a searched interviewer by clicking it', async () => {
    const onChange = vi.fn();
    render(<AssignInterviewers interviewerIds={[1]} interviewers={interviewers} onChange={onChange} />);
    await userEvent.click(screen.getByText('Assign'));
    await userEvent.type(screen.getByLabelText('Search interviewers'), 'selenium');
    await userEvent.click(screen.getByText('Priya Nair'));
    expect(onChange).toHaveBeenCalledWith([1, 2]);
  });

  it('assigns the first match on Enter', async () => {
    const onChange = vi.fn();
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={onChange} />);
    await userEvent.click(screen.getByText('Assign'));
    await userEvent.type(screen.getByLabelText('Search interviewers'), 'azure{Enter}');
    expect(onChange).toHaveBeenCalledWith([3]);
  });

  it('says so when nothing matches the search', async () => {
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    await userEvent.type(screen.getByLabelText('Search interviewers'), 'cobol');
    expect(screen.getByText('No interviewers match')).toBeInTheDocument();
  });

  it('closes on Escape and clears the search for next time', async () => {
    render(<AssignInterviewers interviewerIds={[]} interviewers={interviewers} onChange={() => {}} />);
    await userEvent.click(screen.getByText('Assign'));
    await userEvent.type(screen.getByLabelText('Search interviewers'), 'priya{Escape}');
    expect(screen.queryByLabelText('Search interviewers')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Assign'));
    expect(screen.getByLabelText('Search interviewers')).toHaveValue('');
    expect(screen.getByText('Dana Kovic')).toBeInTheDocument();
  });
});
