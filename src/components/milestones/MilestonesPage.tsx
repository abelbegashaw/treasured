import { useMilestones } from '../../hooks/useMilestones';
import { useTheme } from '../../context/ThemeContext';
import { AnchorSetup } from './AnchorSetup';
import { MilestoneTimeline } from './MilestoneTimeline';

// SCREEN 3: MONTHLY-ANNIVERSARY MILESTONE TIMELINE
export function MilestonesPage() {
  const theme = useTheme();
  const {
    anchorDate,
    milestonesByMonth,
    loading,
    pageError,
    savingAnchor,
    busyMonth,
    uploadProgress,
    error,
    setAnchorDate,
    addMilestoneMedia,
    removeMilestoneMedia,
    reload,
  } = useMilestones();

  return (
    <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <p style={{ margin: 0, fontSize: '13px', color: theme.rose }}>{error}</p>}

      {loading ? (
        <p style={{ margin: '4px', fontSize: '14px', color: theme.muted }}>Loading your timeline…</p>
      ) : pageError ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px' }}>
          <span style={{ fontSize: '13px', color: theme.rose }}>{pageError}</span>
          <button onClick={reload} className="pill-btn" style={{ border: `1px solid ${theme.line}`, background: 'transparent', color: theme.ink, padding: '6px 16px', fontSize: '13px' }}>
            Retry
          </button>
        </div>
      ) : !anchorDate ? (
        <AnchorSetup onSave={setAnchorDate} saving={savingAnchor} />
      ) : (
        <MilestoneTimeline
          anchorDate={anchorDate}
          milestonesByMonth={milestonesByMonth}
          busyMonth={busyMonth}
          uploadProgress={uploadProgress}
          onAdd={addMilestoneMedia}
          onRemove={removeMilestoneMedia}
        />
      )}
    </div>
  );
}
