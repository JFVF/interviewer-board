import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusFilter from './StatusFilter.jsx';

describe('StatusFilter', () => {
  it('renders a toggle button for every status', () => {
    render(<StatusFilter value={[]} onChange={() => {}} />);
    ['Scheduling', 'Scheduled', 'Done', 'Rejected'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('adds a status when an inactive button is clicked', async () => {
    const onChange = vi.fn();
    render(<StatusFilter value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByText('Scheduled'));
    expect(onChange).toHaveBeenCalledWith(['SCHEDULED']);
  });

  it('removes a status when an active button is clicked again', async () => {
    const onChange = vi.fn();
    render(<StatusFilter value={['SCHEDULED', 'DONE']} onChange={onChange} />);
    await userEvent.click(screen.getByText('Scheduled'));
    expect(onChange).toHaveBeenCalledWith(['DONE']);
  });
});
