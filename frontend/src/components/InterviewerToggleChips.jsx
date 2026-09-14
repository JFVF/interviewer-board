export default function InterviewerToggleChips({ interviewers, selectedIds, onChange }) {
  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  return (
    <div className="toggle-chip-list">
      {interviewers.map((i) => (
        <button
          type="button"
          key={i.id}
          className={`toggle-chip${selectedIds.includes(i.id) ? ' active' : ''}`}
          onClick={() => toggle(i.id)}
        >
          {i.name} <span className="toggle-chip-count">{i.activeCandidateCount}</span>
        </button>
      ))}
    </div>
  );
}
