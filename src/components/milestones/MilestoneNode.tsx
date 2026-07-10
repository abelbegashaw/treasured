import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MilestoneMediaStrip } from './MilestoneMediaStrip';
import { MediaComposer } from './MediaComposer';
import { MediaLightbox } from '../media/MediaLightbox';
import type { MonthSlot } from '../../lib/milestoneMonths';
import type { GalleryImage, Milestone } from '../../types';

interface MilestoneNodeProps {
  slot: MonthSlot;
  milestone: Milestone | null;
  busy: boolean;      // this month is uploading
  disabled: boolean;  // another month is mid-upload
  uploadProgress: { done: number; total: number };
  onAdd: (monthNumber: number, files: File[], picks: GalleryImage[], note: string) => void;
  onRemove: (monthNumber: number, mediaId: string) => void;
}

// One marker on the timeline rail: a node dot, its label + calendar date, the
// month's media carousel (+ note), and controls to add media or open fullscreen.
export function MilestoneNode({ slot, milestone, busy, disabled, uploadProgress, onAdd, onRemove }: MilestoneNodeProps) {
  const theme = useTheme();
  const [composing, setComposing] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const media = milestone?.media ?? [];
  const hasMedia = media.length > 0;

  const handlePost = (files: File[], picks: GalleryImage[], note: string) => {
    onAdd(slot.monthNumber, files, picks, note);
    setComposing(false);
  };

  return (
    <div style={{ position: 'relative', paddingBottom: '40px' }}>
      {/* Node dot on the rail. Solid accent when the month has media, else hollow. */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-28px',
          top: '3px',
          width: '9px',
          height: '9px',
          backgroundColor: hasMedia ? theme.accent : theme.canvas,
          border: hasMedia ? 'none' : `1px solid ${theme.line}`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme.ink }}>{slot.label}</span>
        <span style={{ fontSize: '12px', color: theme.muted }}>· {slot.dateLabel}</span>
      </div>

      {hasMedia && (
        <div style={{ marginTop: '12px' }}>
          <MilestoneMediaStrip
            media={media}
            onOpen={(i) => setLightboxIndex(i)}
            onRemove={(mediaId) => onRemove(slot.monthNumber, mediaId)}
            removeDisabled={disabled || busy}
          />
          {milestone?.note && (
            <p style={{ margin: '10px 2px 0', fontSize: '14px', lineHeight: 1.5, color: theme.muted, overflowWrap: 'anywhere' }}>{milestone.note}</p>
          )}
        </div>
      )}

      {busy && (
        <p style={{ margin: '10px 2px 0', fontSize: '12px', color: theme.muted }}>
          Uploading {uploadProgress.done}/{uploadProgress.total}…
        </p>
      )}

      {composing ? (
        <MediaComposer uploading={busy} progress={uploadProgress} onPost={handlePost} onCancel={() => setComposing(false)} />
      ) : (
        !busy && (
          <button
            onClick={() => setComposing(true)}
            disabled={disabled}
            style={{ marginTop: '10px', background: 'none', border: `1px dashed ${theme.line}`, padding: '9px 14px', color: theme.muted, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: '12px', fontFamily: 'inherit', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {hasMedia ? '+ Add more' : '+ Add media'}
          </button>
        )
      )}

      {lightboxIndex !== null && hasMedia && (
        <MediaLightbox
          items={media}
          startIndex={lightboxIndex}
          caption={milestone?.note}
          dateLabel={`${slot.label} · ${slot.dateLabel}`}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
