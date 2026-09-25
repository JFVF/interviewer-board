import { STATUSES, STATUS_LABELS as LABELS } from '../statuses.js';

export default function StatusFilter({ value, onChange }) {
  function toggle(status) {
    onChange(value.includes(status) ? value.filter((s) => s !== status) : [...value, status]);
  }

  return (
    <div className="tag-input-field">
      <span className="field-label">Status</span>
      <div className="status-filter">
        {STATUSES.map((s) => (
          <button
            type="button"
            key={s}
            className={`status-filter-btn${value.includes(s) ? ' active' : ''}`}
            onClick={() => toggle(s)}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
