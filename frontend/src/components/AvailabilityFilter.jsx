import { AVAILABILITY_OPTIONS } from '../interviewerFilter.js';

export default function AvailabilityFilter({ value, onChange }) {
  return (
    <div className="tag-input-field">
      <span className="field-label">Availability</span>
      <div className="status-filter" role="group" aria-label="Availability">
        {AVAILABILITY_OPTIONS.map((o) => (
          <button
            type="button"
            key={o.value}
            className={`status-filter-btn${value === o.value ? ' active' : ''}`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
