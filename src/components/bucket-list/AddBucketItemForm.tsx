import type { FormEvent } from 'react';

interface AddBucketItemFormProps {
  newTodoText: string;
  setNewTodoText: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

// Inline Creation Unit
export function AddBucketItemForm({ newTodoText, setNewTodoText, onSubmit }: AddBucketItemFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '0' }}>
      <input
        type="text"
        placeholder="Add a dream or milestone…"
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        className="pill-input"
        style={{ flex: 1, borderRight: 'none' }}
      />
      <button type="submit" className="pill-btn pill-btn-primary">
        Add
      </button>
    </form>
  );
}
