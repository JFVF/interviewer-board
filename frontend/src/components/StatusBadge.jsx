import { useState } from 'react';
import { STATUSES, STATUS_CLASSES as CLASSES, STATUS_LABELS as LABELS } from '../statuses.js';

export default function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="status-dropdown">
      <button
        type="button"
        className={`status-badge dropdown-trigger ${CLASSES[status]}`}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      >
        {LABELS[status]}
      </button>
      {open && (
        <ul className="status-dropdown-menu">
          {STATUSES.map((s) => (
            <li key={s}>
              <button
                type="button"
                className={CLASSES[s]}
                onMouseDown={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                {LABELS[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
