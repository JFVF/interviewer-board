// Inline picker for a candidate's interview date. Emits null when the date is cleared.
export default function InterviewDatePicker({ value, onChange }) {
  return (
    <input
      type="date"
      className="date-picker"
      aria-label="Interview date"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}
