import { useTheme } from '../../context/ThemeContext';

interface ProgressMeterProps {
  done: number;
  total: number;
  percent: number;
}

// Completion Meter
export function ProgressMeter({ done, total, percent }: ProgressMeterProps) {
  const theme = useTheme();

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.muted }}>Completion</p>
        <p style={{ margin: 0, fontSize: '13px', color: theme.muted }}>
          <span style={{ color: theme.ink }}>{done}</span> / {total}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
        <span style={{ fontSize: '34px', lineHeight: 1, color: theme.ink }}>{percent}</span>
        <span style={{ fontSize: '14px', color: theme.muted }}>% done</span>
      </div>
      <div style={{ marginTop: '14px', height: '4px', width: '100%', backgroundColor: theme.line }}>
        <div style={{ height: '100%', backgroundColor: theme.accent, width: `${percent}%`, transition: 'width 0.3s ease' }} />
      </div>
    </section>
  );
}
