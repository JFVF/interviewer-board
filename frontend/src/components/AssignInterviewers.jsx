import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function AssignInterviewers({ interviewerIds, interviewers, onChange }) {
  const [open, setOpen] = useState(false);

  const assigned = useMemo(
    () => interviewerIds.map((id) => interviewers.find((i) => i.id === id)).filter(Boolean),
    [interviewerIds, interviewers]
  );
  const available = useMemo(
    () => interviewers.filter((i) => !interviewerIds.includes(i.id)),
    [interviewerIds, interviewers]
  );

  function add(id) {
    onChange([...interviewerIds, id]);
    setOpen(false);
  }

  function remove(id) {
    onChange(interviewerIds.filter((i) => i !== id));
  }

  return (
    <div className="assign-control">
      {assigned.map((i) => (
        <span className="tag-chip" key={i.id}>
          {i.name}
          <button type="button" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <div className="assign-dropdown">
        <button
          type="button"
          className="assign-trigger"
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        >
          Assign <ChevronDown size={13} />
        </button>
        {open && (
          <ul className="assign-menu">
            {available.length === 0 && <li className="assign-menu-empty">No more interviewers</li>}
            {available.map((i) => (
              <li key={i.id}>
                <button type="button" onMouseDown={() => add(i.id)}>
                  {i.name}
                  <span className="assign-menu-count">{i.activeCandidateCount}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
