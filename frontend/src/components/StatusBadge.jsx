import { useState } from 'react';

const STATUSES = ['SCHEDULING', 'SCHEDULED', 'DONE', 'REJECTED'];

const LABELS = {
  SCHEDULING: 'Scheduling',
  SCHEDULED: 'Scheduled',
  DONE: 'Done',
  REJECTED: 'Rejected',
};

const CLASSES = {
  SCHEDULING: 'status-scheduling',
  SCHEDULED: 'status-scheduled',
  DONE: 'status-done',
  REJECTED: 'status-rejected',
};

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
