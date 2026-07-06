import React, { useMemo, useState } from 'react';
import './App.css';

// TypeScript strict data structures
interface BucketItem {
  id: number;
  title: string;
  isCompleted: boolean;
  priority: 'high' | 'normal';
}

interface GalleryImage {
  id: number;
  url: string;
  caption: string;
  timestamp: string;
}

export default function App() {
  // --- MASTER UI PALETTE ARCHITECTURE (matches the original "List for Two" look) ---
  const theme = {
    canvas: '#f7f2e8',   // warm paper background
    ink: '#1f1a16',      // primary text
    muted: '#4b3f35',    // secondary text
    card: '#fff6ea',     // card surface
    line: '#e6d7c8',     // hairline borders
    accent: '#c06b2c',   // burnt orange - primary actions
    accent2: '#3e8d7e',  // teal - completed state
    sun: '#e9b44c',      // golden glow accent
    rose: '#c24b5a',     // rose - priority / destructive
    deep: '#2f2621',     // deep overlay tone
  };

  // --- COMPONENT VIEWS CONTROL STATE ---
  const [activeTab, setActiveTab] = useState<'bucket' | 'gallery' | 'us'>('bucket');

  // --- DATABASE SIMULATION STATE: BUCKET LIST CRUD ---
  const [bucketList, setBucketList] = useState<BucketItem[]>([
    { id: 1, title: 'Watch the sunrise together from a hot air balloon', isCompleted: false, priority: 'high' },
    { id: 2, title: 'Take an authentic Italian pasta cooking class', isCompleted: true, priority: 'normal' },
    { id: 3, title: 'Build a small personal greenhouse in the backyard', isCompleted: false, priority: 'normal' }
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'normal'>('normal');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // --- DATABASE SIMULATION STATE: GALLERY CRUD ---
  const [gallery, setGallery] = useState<GalleryImage[]>([
    { id: 1, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600', caption: 'Road trip coffee stops', timestamp: 'May 2026' },
    { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600', caption: 'Rainy afternoon reading sessions', timestamp: 'June 2026' }
  ]);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgCaptionInput, setImgCaptionInput] = useState('');

  // --- DERIVED PROGRESS STATS (mirrors the original app's completion meter) ---
  const progress = useMemo(() => {
    const done = bucketList.filter((item) => item.isCompleted).length;
    const total = bucketList.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { done, total, percent };
  }, [bucketList]);

  // =========================================================
  // LOGIC CONTROLLERS: BUCKET LIST (CRUD) — unchanged behavior
  // =========================================================
  const createBucketItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: BucketItem = {
      id: Date.now(),
      title: newTodoText.trim(),
      isCompleted: false,
      priority: newTodoPriority
    };
    setBucketList([newItem, ...bucketList]);
    setNewTodoText('');
  };

  const toggleBucketItemStatus = (id: number) => {
    setBucketList(bucketList.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  const startInlineEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveInlineEdit = (id: number) => {
    if (!editingText.trim()) return;
    setBucketList(bucketList.map(item => item.id === id ? { ...item, title: editingText.trim() } : item));
    setEditingId(null);
  };

  const deleteBucketItem = (id: number) => {
    setBucketList(bucketList.filter(item => item.id !== id));
  };

  // =========================================================
  // LOGIC CONTROLLERS: GALLERY (CRUD) — unchanged behavior
  // =========================================================
  const addGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgUrlInput.trim()) return;
    const newImage: GalleryImage = {
      id: Date.now(),
      url: imgUrlInput.trim(),
      caption: imgCaptionInput.trim() || 'Captured Moment',
      timestamp: 'Just Now'
    };
    setGallery([newImage, ...gallery]);
    setImgUrlInput('');
    setImgCaptionInput('');
  };

  const removeGalleryImage = (id: number) => {
    setGallery(gallery.filter(img => img.id !== id));
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', backgroundColor: theme.canvas, color: theme.ink, fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif" }}>

      {/* Structural Stylesheets Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        h1, h2, h3, h4 {
          font-family: 'Space Grotesk', 'Times New Roman', serif;
        }

        .paper-texture {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(233, 180, 76, 0.12), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(194, 75, 90, 0.12), transparent 40%),
            linear-gradient(120deg, rgba(192, 107, 44, 0.08), rgba(62, 141, 126, 0.08));
        }

        .grain-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(115deg, rgba(47, 38, 33, 0.06), rgba(47, 38, 33, 0.06) 1px, transparent 1px, transparent 3px);
          mix-blend-mode: multiply;
          opacity: 0.4;
        }

        .float-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          pointer-events: none;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        @keyframes revealUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .reveal-up {
          animation: revealUp 0.8s ease-out both;
        }

        .card-shadow {
          box-shadow: 0 16px 35px rgba(20, 12, 32, 0.14);
        }

        .nav-pill {
          background: transparent;
          border: none;
          color: ${theme.muted};
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          border-radius: 9999px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-pill:hover {
          color: ${theme.ink};
        }

        .nav-pill.active {
          color: #fff;
          background-color: ${theme.accent};
          box-shadow: 0 6px 14px rgba(192, 107, 44, 0.35);
        }

        .pill-input {
          width: 100%;
          border: 1px solid ${theme.line};
          background-color: rgba(255, 255, 255, 0.8);
          color: ${theme.ink};
          padding: 12px 18px;
          border-radius: 9999px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .pill-input:focus {
          border-color: ${theme.accent};
        }

        .pill-btn {
          border: none;
          border-radius: 9999px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .pill-btn-primary {
          background-color: ${theme.accent};
          color: #fff;
        }
        .pill-btn-primary:hover {
          background-color: ${theme.rose};
        }

        .toggle-circle {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          border: 1px solid ${theme.line};
          background-color: rgba(255, 255, 255, 0.7);
          color: ${theme.muted};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-circle.done {
          background-color: ${theme.accent2};
          border-color: ${theme.accent2};
          color: #fff;
        }

        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          border: 1px solid ${theme.line};
          background: transparent;
          color: ${theme.muted};
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          border-color: ${theme.rose};
          color: ${theme.rose};
        }

        .row-input {
          width: 100%;
          border: none;
          border-bottom: 1px solid transparent;
          background: transparent;
          font-size: 15px;
          font-family: inherit;
          color: ${theme.muted};
          outline: none;
          transition: border-color 0.2s;
        }

        .row-input:focus {
          border-bottom-color: ${theme.accent};
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-up, .float-orb { animation: none !important; }
        }
      `}</style>

      {/* --- AMBIENT PAPER BACKGROUND LAYERS --- */}
      <div className="paper-texture" aria-hidden="true" />
      <div
        className="float-orb"
        style={{ top: '-120px', left: '-8%', width: '280px', height: '280px', backgroundColor: theme.sun, opacity: 0.4, animation: 'floatSlow 14s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div
        className="float-orb"
        style={{ top: '40px', right: '-10%', width: '320px', height: '320px', backgroundColor: theme.rose, opacity: 0.3, animation: 'floatSlow 18s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      {/* --- PRESERVED NAVIGATION HEADER --- */}
      <header className="reveal-up" style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '48px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.3em', color: theme.muted }}>List for Two</p>
          <nav style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '4px', borderRadius: '9999px', border: `1px solid ${theme.line}` }}>
            <button className={`nav-pill ${activeTab === 'bucket' ? 'active' : ''}`} onClick={() => setActiveTab('bucket')}>Bucket List</button>
            <button className={`nav-pill ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>Gallery</button>
            <button className={`nav-pill ${activeTab === 'us' ? 'active' : ''}`} onClick={() => setActiveTab('us')}>Us</button>
          </nav>
        </div>
        <h1 style={{ marginTop: '20px', marginBottom: 0, fontSize: '38px', fontWeight: 600, lineHeight: 1.15, color: theme.ink }}>
          Our shared bucket list.
        </h1>
        <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '16px', color: theme.muted }}>
          Dream it together, do it together, remember it forever.
        </p>
      </header>

      {/* --- WORKSPACE LAYOUT PANELS --- */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '760px', margin: '0 auto', padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* =========================================================
            SCREEN 1: BUCKET LIST WITH CRUD INTERACTION KEYS
            ========================================================= */}
        {activeTab === 'bucket' && (
          <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Completion Meter */}
            <section className="card-shadow" style={{ backgroundColor: theme.card, border: `1px solid ${theme.line}`, borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.muted }}>Completion</p>
                  <p style={{ margin: '8px 0 0', fontSize: '22px', color: theme.ink }}>{progress.done} / {progress.total} completed</p>
                </div>
                <div style={{ minWidth: '150px', borderRadius: '9999px', border: `1px solid ${theme.line}`, backgroundColor: 'rgba(255,255,255,0.7)', padding: '8px 16px', fontSize: '14px', color: theme.muted, textAlign: 'center' }}>
                  {progress.percent}% done
                </div>
              </div>
              <div style={{ marginTop: '16px', height: '8px', width: '100%', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <div style={{ height: '100%', borderRadius: '9999px', backgroundColor: theme.accent, width: `${progress.percent}%`, transition: 'width 0.3s ease' }} />
              </div>
            </section>

            {/* Inline Creation Unit */}
            <section className="card-shadow" style={{ backgroundColor: theme.card, border: `1px solid ${theme.line}`, borderRadius: '24px', padding: '24px' }}>
              <form onSubmit={createBucketItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Add a common dream or milestone task..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  className="pill-input"
                  style={{ flex: '1 1 220px' }}
                />
                <select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as 'high' | 'normal')}
                  className="pill-input"
                  style={{ cursor: 'pointer', flex: '0 1 160px' }}
                >
                  <option value="normal">Normal priority</option>
                  <option value="high">High priority</option>
                </select>
                <button type="submit" className="pill-btn pill-btn-primary">
                  Add
                </button>
              </form>
            </section>

            {/* List Rows Stream */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bucketList.map(item => (
                <div
                  key={item.id}
                  className="card-shadow"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '16px 20px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '18px',
                    border: `1px solid ${theme.line}`,
                    borderLeft: item.priority === 'high' ? `3px solid ${theme.rose}` : `1px solid ${theme.line}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => toggleBucketItemStatus(item.id)}
                      aria-pressed={item.isCompleted}
                      className={`toggle-circle ${item.isCompleted ? 'done' : ''}`}
                    >
                      {item.isCompleted && (
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveInlineEdit(item.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(item.id)}
                        autoFocus
                        className="row-input"
                      />
                    ) : (
                      <span
                        onClick={() => startInlineEdit(item.id, item.title)}
                        style={{
                          fontSize: '15px',
                          color: item.isCompleted ? `${theme.muted}99` : theme.muted,
                          textDecoration: item.isCompleted ? 'line-through' : 'none',
                          cursor: 'text',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </span>
                    )}
                  </div>

                  {/* Operational CRUD Anchors */}
                  <button
                    type="button"
                    onClick={() => deleteBucketItem(item.id)}
                    className="icon-btn"
                    aria-label="Delete"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm2 6h2v8h-2V9zm-4 0h2v8H7V9zm8 0h2v8h-2V9z" />
                    </svg>
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* =========================================================
            SCREEN 2: MASONRY STYLE IMAGE GALLERY & INPUT
            ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* File Path Asset Attachment Controls */}
            <section className="card-shadow" style={{ backgroundColor: theme.card, border: `1px solid ${theme.line}`, borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Paste destination image link URL..."
                  value={imgUrlInput}
                  onChange={(e) => setImgUrlInput(e.target.value)}
                  className="pill-input"
                  style={{ flex: '2 1 240px' }}
                />
                <input
                  type="text"
                  placeholder="Caption memory details..."
                  value={imgCaptionInput}
                  onChange={(e) => setImgCaptionInput(e.target.value)}
                  className="pill-input"
                  style={{ flex: '1 1 160px' }}
                />
              </div>
              <button onClick={addGalleryImage} className="pill-btn pill-btn-primary" style={{ alignSelf: 'flex-start' }}>
                Publish Picture to Canvas Wall
              </button>
            </section>

            {/* Media Presentation Deck */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {gallery.map(img => (
                <div key={img.id} className="card-shadow" style={{ backgroundColor: theme.card, border: `1px solid ${theme.line}`, borderRadius: '18px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '190px', backgroundColor: theme.canvas, overflow: 'hidden' }}>
                    <img src={img.url} alt="Shared Memory Fragment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 500, color: theme.ink }}>{img.caption}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: theme.muted }}>{img.timestamp}</span>
                      <button onClick={() => removeGalleryImage(img.id)} style={{ background: 'none', border: 'none', color: theme.rose, cursor: 'pointer', fontSize: '12px', padding: 0, fontFamily: 'inherit' }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* =========================================================
            SCREEN 3: STORIES SECTION (EDITORIAL ABOUT US DISPLAY)
            ========================================================= */}
        {activeTab === 'us' && (
          <section
            className="reveal-up card-shadow"
            style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'center', backgroundColor: theme.card, padding: '36px', borderRadius: '24px', border: `1px solid ${theme.line}` }}
          >
            <div>
              <p style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.25em', color: theme.muted }}>Our story</p>
              <h2 style={{ fontSize: '28px', margin: '0 0 16px 0', color: theme.ink }}>Our shared space</h2>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: theme.muted, margin: '0 0 24px 0' }}>
                An intentional digital sanctuary designed entirely out of view from regular algorithmic feeds. Here, milestones remain permanent, photos retain their raw contextual meanings, and lists progress gracefully forward in real-time sync.
              </p>
              <div style={{ display: 'inline-block', borderTop: `1px solid ${theme.accent}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: theme.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Twin log engine // live ecosystem</span>
              </div>
            </div>

            <div style={{ border: `1px solid ${theme.line}`, borderRadius: '16px', overflow: 'hidden', height: '280px', backgroundColor: theme.canvas }}>
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600"
                alt="Minimal narrative artwork representational accent window"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}