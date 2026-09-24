import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagInput from './TagInput.jsx';

function setup(props = {}) {
  const onChange = vi.fn();
  render(
    <TagInput
      label="Skill"
      value={props.value ?? []}
      onChange={onChange}
      suggestions={props.suggestions ?? ['Java', 'React', 'TypeScript']}
      placeholder="Filter by skill, press tab to add"
    />
  );
  return { onChange };
}

describe('TagInput', () => {
  it('renders the label and existing tags', () => {
    setup({ value: ['Java'] });
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
  });

  it('adds a tag on Enter', async () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText('Filter by skill, press tab to add');
    await userEvent.type(input, 'Kubernetes{Enter}');
    expect(onChange).toHaveBeenCalledWith(['Kubernetes']);
  });

  it('adds a tag on Tab', async () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText('Filter by skill, press tab to add');
    await userEvent.type(input, 'Go{Tab}');
    expect(onChange).toHaveBeenCalledWith(['Go']);
  });

  it('does not add a duplicate tag', async () => {
    const { onChange } = setup({ value: ['Java'] });
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Java{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes the last tag on Backspace when the input is empty', async () => {
    const { onChange } = setup({ value: ['Java', 'React'] });
    const input = screen.getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['Java']);
  });

  it('removes a tag when its remove button is clicked', async () => {
    const { onChange } = setup({ value: ['Java', 'React'] });
    await userEvent.click(screen.getByLabelText('Remove Java'));
    expect(onChange).toHaveBeenCalledWith(['React']);
  });

  it('adds a tag by clicking a matching suggestion', async () => {
    const { onChange } = setup();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Rea');
    await userEvent.click(screen.getByText('React'));
    expect(onChange).toHaveBeenCalledWith(['React']);
  });
});
