import { useTheme } from '../../context/ThemeContext';
import type { BucketItem } from '../../types';

interface BucketListRowProps {
  item: BucketItem;
  index: number;
  total: number;
  photoCount: number;
  isEditing: boolean;
  editingText: string;
  setEditingText: (value: string) => void;
  onToggle: (id: string) => void;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenPhotos: (item: BucketItem) => void;
}

export function BucketListRow({ item, index, total, photoCount, isEditing, editingText, setEditingText, onToggle, onStartEdit, onSaveEdit, onDelete, onOpenPhotos }: BucketListRowProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 4px',
        borderBottom: `1px solid ${theme.line}`,
      }}
    >
      {/* Index */}
      <span style={{ flexShrink: 0, width: '26px', fontSize: '12px', color: theme.muted, letterSpacing: '0.05em' }}>
        {String(total - index).padStart(2, '0')}
      </span>

      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-pressed={item.isCompleted}
        className={`toggle-circle ${item.isCompleted ? 'done' : ''}`}
      >
        {item.isCompleted && (
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title / inline edit — takes the horizontal space */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={() => onSaveEdit(item.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(item.id)}
            autoFocus
            className="row-input"
          />
        ) : (
          <span
            onClick={() => onStartEdit(item.id, item.title)}
            style={{
              fontSize: '15px',
              color: item.isCompleted ? `${theme.muted}80` : theme.ink,
              textDecoration: item.isCompleted ? 'line-through' : 'none',
              cursor: 'text',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </span>
        )}
      </div>

      {/* Photos — only once completed ("we did it, here's proof") */}
      {item.isCompleted && (
        <button
          type="button"
          onClick={() => onOpenPhotos(item)}
          style={{
            flexShrink: 0,
            background: 'none',
            border: `1px solid ${theme.line}`,
            color: photoCount > 0 ? theme.ink : theme.muted,
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'inherit',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '5px 9px',
          }}
        >
          Photos{photoCount > 0 ? ` · ${photoCount}` : ''}
        </button>
      )}

      {/* Date */}
      <span style={{ flexShrink: 0, fontSize: '12px', color: theme.muted, letterSpacing: '0.03em' }}>
        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
      </span>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="icon-btn"
        aria-label="Delete"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm2 6h2v8h-2V9zm-4 0h2v8H7V9zm8 0h2v8h-2V9z" />
        </svg>
      </button>
    </div>
  );
}
