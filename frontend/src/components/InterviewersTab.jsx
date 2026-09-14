import { useMemo, useRef, useState } from 'react';
import { Pencil, Trash2, Upload, Plus } from 'lucide-react';
import TagInput from './TagInput.jsx';
import InterviewerForm from './InterviewerForm.jsx';
import { api } from '../api.js';

export default function InterviewersTab({ interviewers, allSkills, reload }) {
  const [skillFilter, setSkillFilter] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    if (skillFilter.length === 0) return interviewers;
    return interviewers.filter((i) => skillFilter.every((s) => i.skills.includes(s)));
  }, [interviewers, skillFilter]);

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

  return (
    <div className="tab-panel">
      <div className="tab-toolbar">
        <TagInput
          label="Skill"
          value={skillFilter}
          onChange={setSkillFilter}
          suggestions={allSkills}
          placeholder="Filter by skill, press tab to add"
        />
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
        </div>
      </div>
      <p className="helper-text">
        CSV needs a "name" column and an optional "stack" column (skills separated by ; or ,).
      </p>
      {importError && <p className="form-error">{importError}</p>}

      {showAddForm && (
        <InterviewerForm
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="row-list">
        {filtered.map((interviewer) =>
          editingId === interviewer.id ? (
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
                <span className={`dot ${interviewer.available ? 'dot-available' : 'dot-busy'}`} />
                <h3>{interviewer.name}</h3>
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
          )
        )}
        {filtered.length === 0 && <p className="empty-state">No interviewers match this filter.</p>}
      </div>
    </div>
  );
}
