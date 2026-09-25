import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewerForm from './InterviewerForm.jsx';

describe('InterviewerForm', () => {
  it('saves the selected role', async () => {
    const onSave = vi.fn();
    render(<InterviewerForm onSave={onSave} onCancel={() => {}} />);

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Elena Marsh');
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'DEVOPS');
    await userEvent.click(screen.getByRole('button', { name: 'Add interviewer' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Elena Marsh', role: 'DEVOPS' }));
  });

  it('prefills the role when editing and allows clearing it', async () => {
    const onSave = vi.fn();
    render(
      <InterviewerForm
        interviewer={{ id: 1, name: 'Raj Patel', role: 'QA', skills: [] }}
        onSave={onSave}
        onCancel={() => {}}
      />
    );

    expect(screen.getByLabelText('Role')).toHaveValue('QA');
    await userEvent.selectOptions(screen.getByLabelText('Role'), '');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ id: 1, role: null }));
  });
});
