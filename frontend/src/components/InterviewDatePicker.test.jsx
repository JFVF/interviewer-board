import { fireEvent, render, screen } from '@testing-library/react';
import InterviewDatePicker from './InterviewDatePicker.jsx';

describe('InterviewDatePicker', () => {
  it('shows the current interview date', () => {
    render(<InterviewDatePicker value="2026-10-01" onChange={() => {}} />);
    expect(screen.getByLabelText('Interview date')).toHaveValue('2026-10-01');
  });

  it('is empty when no date is set', () => {
    render(<InterviewDatePicker value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('Interview date')).toHaveValue('');
  });

  it('emits the picked date', () => {
    const onChange = vi.fn();
    render(<InterviewDatePicker value={null} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Interview date'), { target: { value: '2026-11-15' } });
    expect(onChange).toHaveBeenCalledWith('2026-11-15');
  });

  it('emits null when the date is cleared', () => {
    const onChange = vi.fn();
    render(<InterviewDatePicker value="2026-10-01" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Interview date'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
