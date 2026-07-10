import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AnchorSetupProps {
  onSave: (date: string) => void;
  saving: boolean;
}

// Shown the first time the timeline opens: capture the "together since" date the
// whole monthly-anniversary timeline is generated from.
export function AnchorSetup({ onSave, saving }: AnchorSetupProps) {
  const theme = useTheme();
  const [date, setDate] = useState('');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: `1px solid ${theme.ink}` }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.ink }}>Where it began</span>
      </div>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: theme.muted }}>
        Set the day your story began. Every monthly anniversary on the timeline is
        counted from here — you can fill each month with a photo and a note.
      </p>
      <input
        type="date"
        value={date}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => setDate(e.target.value)}
        className="pill-input"
        style={{ maxWidth: '220px' }}
      />
      <button
        onClick={() => date && onSave(date)}
        className="pill-btn pill-btn-primary"
        disabled={!date || saving}
        style={{ alignSelf: 'flex-start', opacity: !date || saving ? 0.5 : 1, cursor: !date || saving ? 'default' : 'pointer' }}
      >
        {saving ? 'Saving…' : 'Begin the timeline'}
      </button>
    </section>
  );
}
