import { useMemo, useRef, useState } from 'react';
import { Pencil, Trash2, Upload, Plus, Layers, ChevronRight } from 'lucide-react';
import TagInput from './TagInput.jsx';
import InterviewerForm from './InterviewerForm.jsx';
import AvailabilityFilter from './AvailabilityFilter.jsx';
import { api } from '../api.js';
import { groupByRole, roleLabel } from '../roles.js';
import { filterSuggestions, matchesAllTags, matchesAvailability } from '../interviewerFilter.js';

export default function InterviewersTab({ interviewers, allSkills, reload }) {
  const [skillFilter, setSkillFilter] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [groupedByRole, setGroupedByRole] = useState(false);
  // Keys of the role groups the user has expanded; groups start collapsed.
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const filtered = useMemo(
    () =>
      interviewers.filter(
        (i) => matchesAllTags(i, skillFilter) && matchesAvailability(i, availabilityFilter)
      ),
    [interviewers, skillFilter, availabilityFilter]
  );

  const groups = useMemo(() => groupByRole(filtered), [filtered]);

  const suggestions = useMemo(() => filterSuggestions(allSkills), [allSkills]);

  function toggleGrouping() {
    setGroupedByRole((v) => !v);
    setExpandedGroups(new Set());
  }

  function toggleGroup(key) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSave(data) {
    if (data.id) {
      await api.interviewers.update(data.id, data);
    } else {
      await api.interviewers.create(data);
    }
    setShowAddForm(false);
    setEditingId(null);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this interviewer?')) return;
    await api.interviewers.remove(id);
    reload();
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportError('');
    try {
      await api.interviewers.importCsv(file);
      reload();
    } catch (err) {
      setImportError(err.message || 'Import failed.');
    }
  }

  function renderInterviewer(interviewer) {
    return editingId === interviewer.id ? (
      <div className="row-card" key={interviewer.id}>
        <InterviewerForm
          interviewer={interviewer}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      </div>
    ) : (
      <div className="row-card" key={interviewer.id}>
        <div className="row-card-header">
          <div className="row-card-title">
            <span className={`dot ${interviewer.available ? 'dot-available' : 'dot-busy'}`} />
            <h3>{interviewer.name}</h3>
            {interviewer.role && <span className="role-badge">{roleLabel(interviewer.role)}</span>}
          </div>
          <div className="row-card-actions">
            <button className="icon-btn" onClick={() => setEditingId(interviewer.id)} aria-label="Edit">
              <Pencil size={16} />
            </button>
            <button className="icon-btn danger" onClick={() => handleDelete(interviewer.id)} aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="tag-list">
          {interviewer.skills.map((s) => (
            <span className="tag-chip static" key={s}>
              {s}
            </span>
          ))}
        </div>
        <p className={`row-card-status ${interviewer.available ? 'text-available' : 'text-busy'}`}>
          {interviewer.available
            ? 'Available'
            : `Interviewing ${interviewer.activeCandidateCount} candidate${
                interviewer.activeCandidateCount === 1 ? '' : 's'
              }`}
        </p>
      </div>
    );
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar tab-toolbar-stacked">
        <div className="tab-toolbar-actions">
          <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleImport} />
          <button className="link-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> Import CSV
          </button>
          <button
            className="link-btn"
            onClick={() => {
              setEditingId(null);
              setShowAddForm((v) => !v);
            }}
          >
            <Plus size={15} /> Add
          </button>
          <button
            type="button"
            className={`toggle-chip${groupedByRole ? ' active' : ''}`}
            aria-pressed={groupedByRole}
            onClick={toggleGrouping}
          >
            <Layers size={14} /> Group by role
          </button>
        </div>
        <TagInput
          label="Skill"
          value={skillFilter}
          onChange={setSkillFilter}
          suggestions={suggestions}
          placeholder="Filter by skill or role, press tab to add"
        />
        <AvailabilityFilter value={availabilityFilter} onChange={setAvailabilityFilter} />
      </div>
      <p className="helper-text">
        CSV needs a "name" column, plus optional "role" (Dev, AT, DevOps or QA) and "stack" (skills separated by ;) columns.
      </p>
      {importError && <p className="form-error">{importError}</p>}

      {showAddForm && (
        <InterviewerForm
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="row-list">
        {groupedByRole
          ? groups.map((group) => {
              const key = group.role ?? 'none';
              const expanded = expandedGroups.has(key);
              return (
                <section className="role-group" key={key} aria-label={group.label}>
                  <h2 className="role-group-heading">
                    <button
                      type="button"
                      className="role-group-toggle"
                      aria-expanded={expanded}
                      onClick={() => toggleGroup(key)}
                    >
                      <ChevronRight size={14} className={`role-group-chevron${expanded ? ' expanded' : ''}`} />
                      {group.label} <span className="role-group-count">{group.interviewers.length}</span>
                    </button>
                  </h2>
                  {expanded && group.interviewers.map(renderInterviewer)}
                </section>
              );
            })
          : filtered.map(renderInterviewer)}
        {filtered.length === 0 && <p className="empty-state">No interviewers match this filter.</p>}
      </div>
    </div>
  );
}
