import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { milestonePhoto } from '../../lib/cloudinaryUrl';
import type { MonthSlot } from '../../lib/milestoneMonths';
import type { Milestone } from '../../types';

interface MilestoneNodeProps {
  slot: MonthSlot;
  milestone: Milestone | null;
  busy: boolean;      // this month's photo is uploading
  disabled: boolean;  // another month is mid-upload — block starting a second
  onAdd: (monthNumber: number, file: File, note: string) => void;
  onRemove: (monthNumber: number) => void;
}

// One marker on the timeline rail: a node dot, its label + calendar date, and
// either the attached photo (+ note) or an inline "add photo" form.
export function MilestoneNode({ slot, milestone, busy, disabled, onAdd, onRemove }: MilestoneNodeProps) {
  const theme = useTheme();
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const filled = milestone !== null;

  const resetForm = () => {
    setAdding(false);
    setFile(null);
    setNote('');
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '36px' }}>
      {/* Node dot sitting on the rail. Solid accent when filled, hollow when empty. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-28px',
          top: '3px',
          width: '9px',
          height: '9px',
          backgroundColor: filled ? theme.accent : theme.canvas,
          border: filled ? 'none' : `1px solid ${theme.line}`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.ink }}>{slot.label}</span>
        <span style={{ fontSize: '12px', color: theme.muted }}>· {slot.dateLabel}</span>
      </div>

      {filled ? (
        <div style={{ marginTop: '12px', maxWidth: '360px' }}>
          <img
            src={milestonePhoto(milestone.url)}
            alt={`${slot.label} — ${slot.dateLabel}`}
            loading="lazy"
            style={{ display: 'block', width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', border: `1px solid ${theme.line}` }}
          />
          {milestone.note && (
            <p style={{ margin: '10px 2px 0', fontSize: '14px', lineHeight: 1.5, color: theme.muted }}>{milestone.note}</p>
          )}
          <button
            onClick={() => onRemove(slot.monthNumber)}
            disabled={disabled}
            style={{ marginTop: '8px', background: 'none', border: 'none', padding: '2px', color: theme.rose, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Remove
          </button>
        </div>
      ) : adding ? (
        <div style={{ marginTop: '12px', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label
            className="pill-input"
            style={{ display: 'flex', alignItems: 'center', cursor: busy ? 'default' : 'pointer', color: file ? theme.ink : theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {file ? file.name : 'Choose a photo…'}
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>
          <input
            type="text"
            placeholder="A note (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={busy}
            className="pill-input"
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => file && onAdd(slot.monthNumber, file, note)}
              className="pill-btn pill-btn-primary"
              disabled={!file || busy || disabled}
              style={{ opacity: !file || busy || disabled ? 0.5 : 1, cursor: !file || busy || disabled ? 'default' : 'pointer' }}
            >
              {busy ? 'Adding…' : 'Save'}
            </button>
            <button
              onClick={resetForm}
              className="pill-btn"
              disabled={busy}
              style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={disabled}
          style={{ marginTop: '10px', background: 'none', border: `1px dashed ${theme.line}`, padding: '9px 14px', color: theme.muted, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          + Add photo
        </button>
      )}
    </div>
  );
}
