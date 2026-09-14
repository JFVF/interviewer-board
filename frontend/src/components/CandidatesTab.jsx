import { useMemo, useState } from 'react';
import { Pencil, Trash2, Plus, Calendar } from 'lucide-react';
import TagInput from './TagInput.jsx';
import StatusFilter from './StatusFilter.jsx';
import StatusBadge from './StatusBadge.jsx';
import CandidateForm from './CandidateForm.jsx';
import AssignInterviewers from './AssignInterviewers.jsx';
import { api } from '../api.js';

export default function CandidatesTab({ candidates, interviewers, allSkills, reload }) {
  const [skillFilter, setSkillFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [interviewerFilter, setInterviewerFilter] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const interviewerById = useMemo(() => {
    const map = new Map();
    interviewers.forEach((i) => map.set(i.id, i));
    return map;
  }, [interviewers]);

  const interviewerNames = useMemo(() => interviewers.map((i) => i.name), [interviewers]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (skillFilter.length > 0 && !skillFilter.every((s) => c.skills.includes(s))) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
      if (interviewerFilter.length > 0) {
        const names = c.interviewerIds.map((id) => interviewerById.get(id)?.name).filter(Boolean);
        if (!interviewerFilter.every((n) => names.includes(n))) return false;
      }
      return true;
    });
  }, [candidates, skillFilter, statusFilter, interviewerFilter, interviewerById]);

  async function handleSave(data) {
    if (data.id) {
      await api.candidates.update(data.id, data);
    } else {
      await api.candidates.create(data);
    }
    setShowAddForm(false);
    setEditingId(null);
    reload();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this candidate?')) return;
    await api.candidates.remove(id);
    reload();
  }

  async function handleStatusChange(id, status) {
    await api.candidates.updateStatus(id, status);
    reload();
  }

  async function handleAssignChange(candidate, interviewerIds) {
    await api.candidates.update(candidate.id, { ...candidate, interviewerIds });
    reload();
  }

  return (
    <div className="tab-panel">
      <div className="tab-toolbar candidates-toolbar">
        <div className="filter-stack">
          <TagInput
            label="Skill"
            value={skillFilter}
            onChange={setSkillFilter}
            suggestions={allSkills}
            placeholder="Filter by skill, press tab to add"
          />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          <TagInput
            label="Interviewer"
            value={interviewerFilter}
            onChange={setInterviewerFilter}
            suggestions={interviewerNames}
            placeholder="Filter by interviewer, press tab to add"
          />
        </div>
        <div className="tab-toolbar-actions">
          <button
            className="link-btn"
            onClick={() => {
              setEditingId(null);
              setShowAddForm((v) => !v);
            }}
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {showAddForm && (
        <CandidateForm interviewers={interviewers} onSave={handleSave} onCancel={() => setShowAddForm(false)} />
      )}

      <div className="row-list">
        {filtered.map((candidate) =>
          editingId === candidate.id ? (
            <div className="row-card" key={candidate.id}>
              <CandidateForm
                candidate={candidate}
                interviewers={interviewers}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="row-card" key={candidate.id}>
              <div className="row-card-header">
                <div>
                  <h3>{candidate.name}</h3>
                  <p className="row-card-subtitle">{candidate.jobTitle || 'No job title set'}</p>
                </div>
                <div className="row-card-actions">
                  <button className="icon-btn" onClick={() => setEditingId(candidate.id)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(candidate.id)} aria-label="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="tag-list">
                {candidate.skills.map((s) => (
                  <span className="tag-chip static" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="candidate-row-bottom">
                <AssignInterviewers
                  interviewerIds={candidate.interviewerIds}
                  interviewers={interviewers}
                  onChange={(ids) => handleAssignChange(candidate, ids)}
                />
                <div className="candidate-row-meta">
                  {candidate.interviewDate && (
                    <span className="date-chip">
                      <Calendar size={13} /> {candidate.interviewDate}
                    </span>
                  )}
                  <StatusBadge status={candidate.status} onChange={(s) => handleStatusChange(candidate.id, s)} />
                </div>
              </div>
            </div>
          )
        )}
        {filtered.length === 0 && <p className="empty-state">No candidates match this filter.</p>}
      </div>
    </div>
  );
}
