import { useState } from 'react';
import { useBucketList } from '../../hooks/useBucketList';
import { useItemPhotoCounts } from '../../hooks/useItemPhotoCounts';
import { useTheme } from '../../context/ThemeContext';
import { ProgressMeter } from './ProgressMeter';
import { AddBucketItemForm } from './AddBucketItemForm';
import { BucketListRow } from './BucketListRow';
import { ItemPhotosModal } from './ItemPhotosModal';
import type { BucketItem } from '../../types';

// SCREEN 1: BUCKET LIST WITH CRUD INTERACTION
export function BucketListPage() {
  const theme = useTheme();
  const { counts, refresh: refreshCounts } = useItemPhotoCounts();
  const [photosItem, setPhotosItem] = useState<BucketItem | null>(null);
  const {
    bucketList,
    loading,
    error,
    progress,
    newTodoText,
    setNewTodoText,
    editingId,
    editingText,
    setEditingText,
    createBucketItem,
    toggleBucketItemStatus,
    startInlineEdit,
    saveInlineEdit,
    deleteBucketItem,
  } = useBucketList();

  return (
    <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <ProgressMeter done={progress.done} total={progress.total} percent={progress.percent} />

      <AddBucketItemForm
        newTodoText={newTodoText}
        setNewTodoText={setNewTodoText}
        onSubmit={createBucketItem}
      />

      {error && (
        <p style={{ margin: 0, fontSize: '13px', color: theme.rose }}>{error}</p>
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: `1px solid ${theme.ink}` }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.ink }}>The List</span>
          <span style={{ fontSize: '12px', color: theme.muted, letterSpacing: '0.05em' }}>{bucketList.length} {bucketList.length === 1 ? 'item' : 'items'}</span>
        </div>

        {loading ? (
          <p style={{ margin: '20px 4px 0', fontSize: '14px', color: theme.muted }}>Loading your list…</p>
        ) : bucketList.length === 0 ? (
          <p style={{ margin: '20px 4px 0', fontSize: '14px', color: theme.muted }}>No dreams yet — add your first one above.</p>
        ) : (
          <div>
            {bucketList.map((item, index) => (
              <BucketListRow
                key={item.id}
                item={item}
                index={index}
                total={bucketList.length}
                photoCount={counts[item.id] ?? 0}
                isEditing={editingId === item.id}
                editingText={editingText}
                setEditingText={setEditingText}
                onToggle={toggleBucketItemStatus}
                onStartEdit={startInlineEdit}
                onSaveEdit={saveInlineEdit}
                onDelete={deleteBucketItem}
                onOpenPhotos={setPhotosItem}
              />
            ))}
          </div>
        )}
      </section>

      {photosItem && (
        <ItemPhotosModal
          item={photosItem}
          onClose={() => setPhotosItem(null)}
          onChanged={refreshCounts}
        />
      )}
    </div>
  );
}
