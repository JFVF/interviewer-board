import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { roleLabel } from '../roles.js';
import { matchesSearch } from '../interviewerFilter.js';

export default function AssignInterviewers({ interviewerIds, interviewers, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const assigned = useMemo(
    () => interviewerIds.map((id) => interviewers.find((i) => i.id === id)).filter(Boolean),
    [interviewerIds, interviewers]
  );
  const unassigned = useMemo(
    () => interviewers.filter((i) => !interviewerIds.includes(i.id)),
    [interviewerIds, interviewers]
  );
  const matches = useMemo(() => unassigned.filter((i) => matchesSearch(i, query)), [unassigned, query]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  function add(id) {
    onChange([...interviewerIds, id]);
    close();
  }

  function remove(id) {
    onChange(interviewerIds.filter((i) => i !== id));
  }

  // Close only when focus leaves the whole dropdown, so moving from the trigger to the search field
  // keeps the menu open.
  function handleBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (matches.length > 0) add(matches[0].id);
    } else if (e.key === 'Escape') {
      close();
    }
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
      <div className="assign-dropdown" onBlur={handleBlur}>
        <button
          type="button"
          className="assign-trigger"
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          Assign <ChevronDown size={13} />
        </button>
        {open && (
          <div className="assign-menu">
            {unassigned.length > 0 && (
              <input
                type="search"
                className="assign-search"
                placeholder="Search name or skill"
                aria-label="Search interviewers"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoFocus
              />
            )}
            <ul className="assign-menu-list">
              {unassigned.length === 0 && <li className="assign-menu-empty">No more interviewers</li>}
              {unassigned.length > 0 && matches.length === 0 && (
                <li className="assign-menu-empty">No interviewers match</li>
              )}
              {matches.map((i) => (
                <li key={i.id}>
                  {/* preventDefault keeps focus in the search field so the menu doesn't blur shut. */}
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(i.id)}>
                    <span className="assign-menu-name">
                      {i.name}
                      {i.role && <span className="assign-menu-role">{roleLabel(i.role)}</span>}
                    </span>
                    <span className="assign-menu-count">{i.activeCandidateCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
