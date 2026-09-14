import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export default function TagInput({ label, value, onChange, suggestions, placeholder }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!text) return [];
    const lower = text.toLowerCase();
    return suggestions
      .filter((s) => !value.includes(s) && s.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [text, suggestions, value]);

  function addTag(tag) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setText('');
    setOpen(false);
  }

  function removeTag(tag) {
    onChange(value.filter((v) => v !== tag));
  }

  return (
    <div className="tag-input-field">
      {label && <span className="field-label">{label}</span>}
      <div className="tag-input">
        <div className="tag-input-tags">
          {value.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            value={text}
            placeholder={value.length === 0 ? placeholder : ''}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === 'Tab') && text.trim()) {
                e.preventDefault();
                addTag(text);
              } else if (e.key === 'Backspace' && !text && value.length > 0) {
                removeTag(value[value.length - 1]);
              }
            }}
          />
        </div>
        {open && filtered.length > 0 && (
          <ul className="tag-input-suggestions">
            {filtered.map((s) => (
              <li key={s} onMouseDown={() => addTag(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
