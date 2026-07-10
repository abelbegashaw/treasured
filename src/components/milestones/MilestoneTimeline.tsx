import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { milestoneMonths } from '../../lib/milestoneMonths';
import { MilestoneNode } from './MilestoneNode';
import type { GalleryImage, Milestone } from '../../types';

interface MilestoneTimelineProps {
  anchorDate: string; // 'YYYY-MM-DD'
  milestonesByMonth: Map<number, Milestone>;
  busyMonth: number | null;
  uploadProgress: { done: number; total: number };
  onAdd: (monthNumber: number, files: File[], picks: GalleryImage[], note: string) => void;
  onRemove: (monthNumber: number, mediaId: string) => void;
}

// The left-rail single-column timeline: a hairline spine with a node per month
// from the beginning up to now, oldest at the top.
export function MilestoneTimeline({ anchorDate, milestonesByMonth, busyMonth, uploadProgress, onAdd, onRemove }: MilestoneTimelineProps) {
  const theme = useTheme();
  const slots = useMemo(() => milestoneMonths(anchorDate), [anchorDate]);
  const filledCount = milestonesByMonth.size;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: `1px solid ${theme.ink}` }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.ink }}>The Timeline</span>
        <span style={{ fontSize: '12px', color: theme.muted, letterSpacing: '0.05em' }}>
          {filledCount} of {slots.length} {slots.length === 1 ? 'month' : 'months'}
        </span>
      </div>

      {/* Rail + nodes. The vertical line is one element spanning the column; each
          node draws its own dot onto it. */}
      <div style={{ position: 'relative', paddingLeft: '28px', marginTop: '28px' }}>
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '4px', top: '4px', bottom: '4px', width: '1px', backgroundColor: theme.line }}
        />
        {slots.map((slot) => (
          <MilestoneNode
            key={slot.monthNumber}
            slot={slot}
            milestone={milestonesByMonth.get(slot.monthNumber) ?? null}
            busy={busyMonth === slot.monthNumber}
            disabled={busyMonth !== null && busyMonth !== slot.monthNumber}
            uploadProgress={uploadProgress}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
