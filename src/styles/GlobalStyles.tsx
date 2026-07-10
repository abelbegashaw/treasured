import { useTheme } from '../context/ThemeContext';

// Structural Stylesheets Injection
export function GlobalStyles() {
  const theme = useTheme();

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

      h1, h2, h3, h4 {
        font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-weight: 400;
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

      /* Square graph-paper grid — subtle minor lines with a slightly stronger
         major line every 5 cells. Sits over the warm color layers. */
      .grid-paper {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(to right, rgba(47, 38, 33, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(47, 38, 33, 0.05) 1px, transparent 1px),
          linear-gradient(to right, rgba(47, 38, 33, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(47, 38, 33, 0.08) 1px, transparent 1px);
        background-size: 26px 26px, 26px 26px, 130px 130px, 130px 130px;
        mix-blend-mode: multiply;
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

      /* Flat, editorial surfaces — no drop shadows. */
      .card-shadow {
        box-shadow: none;
      }

      /* Underlined text tabs instead of filled pills. */
      .nav-pill {
        background: transparent;
        border: none;
        border-bottom: 1px solid transparent;
        color: ${theme.muted};
        padding: 6px 2px;
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        cursor: pointer;
        border-radius: 0;
        transition: color 0.2s, border-color 0.2s;
      }

      .nav-pill:hover {
        color: ${theme.ink};
      }

      .nav-pill.active {
        color: ${theme.ink};
        border-bottom-color: ${theme.accent};
      }

      /* Square, hairline-bordered fields. */
      .pill-input {
        width: 100%;
        border: 1px solid ${theme.line};
        background-color: rgba(255, 255, 255, 0.5);
        color: ${theme.ink};
        padding: 13px 16px;
        border-radius: 0;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .pill-input:focus {
        border-color: ${theme.ink};
      }

      /* Square buttons, regular weight. Primary = ink block, hover accent. */
      .pill-btn {
        border: none;
        border-radius: 0;
        padding: 13px 22px;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0.06em;
        font-family: inherit;
        cursor: pointer;
        transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        white-space: nowrap;
      }

      .pill-btn-primary {
        background-color: ${theme.ink};
        color: ${theme.canvas};
      }
      .pill-btn-primary:hover {
        background-color: ${theme.accent};
      }

      /* Square checkbox. */
      .toggle-circle {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 0;
        border: 1px solid ${theme.muted};
        background-color: transparent;
        color: ${theme.canvas};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }

      .toggle-circle.done {
        background-color: ${theme.ink};
        border-color: ${theme.ink};
        color: ${theme.canvas};
      }

      /* Borderless icon action, color-only hover. */
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 0;
        border: none;
        background: transparent;
        color: ${theme.muted};
        cursor: pointer;
        opacity: 0.65;
        transition: color 0.2s, opacity 0.2s;
      }

      .icon-btn:hover {
        color: ${theme.rose};
        opacity: 1;
      }

      .row-input {
        width: 100%;
        border: none;
        border-bottom: 1px solid ${theme.line};
        background: transparent;
        font-size: 15px;
        font-family: inherit;
        color: ${theme.ink};
        outline: none;
        padding: 2px 0;
        transition: border-color 0.2s;
      }

      .row-input:focus {
        border-bottom-color: ${theme.accent};
      }

      /* --- GALLERY: Instagram-style grid — ALWAYS exactly 3 columns --- */
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3px;
      }
      @media (min-width: 700px) {
        .gallery-grid { gap: 6px; } /* slightly larger gutter on desktop, still 3 cols */
      }

      .gallery-tile {
        position: relative;
        aspect-ratio: 4 / 5;
        padding: 0;
        border: none;
        border-radius: 0;
        overflow: hidden;
        cursor: pointer;
        background-color: ${theme.line}; /* placeholder tint while the image loads */
      }
      .gallery-tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .gallery-tile:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 2px; }

      /* Subtle caption overlay on hover — only on hover-capable (desktop) devices. */
      .gallery-tile-caption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 22px 10px 8px;
        font-size: 12px;
        font-weight: 500;
        color: #fff;
        text-align: left;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0;
        transition: opacity 0.25s ease;
        pointer-events: none;
      }
      @media (hover: hover) {
        .gallery-tile:hover .gallery-tile-caption { opacity: 1; }
      }

      /* Carousel count badge on a multi-image tile. */
      .carousel-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 6px;
        font-size: 11px;
        color: #fff;
        background: rgba(0, 0, 0, 0.55);
      }

      /* Play badge centered on a video tile in the grid. */
      .gallery-tile-video {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        color: #fff;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: none;
      }

      /* Carousel position dots. */
      .carousel-dots {
        flex-shrink: 0;
        display: flex;
        gap: 7px;
        align-items: center;
        justify-content: center;
        padding: 12px 0 2px;
      }
      .carousel-dot {
        width: 6px;
        height: 6px;
        background: rgba(255, 255, 255, 0.4);
        transition: background 0.2s ease, transform 0.2s ease;
      }
      .carousel-dot.active {
        background: #fff;
        transform: scale(1.25);
      }

      /* Skeleton placeholder tiles shown while a page of photos loads. */
      @keyframes galleryShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .gallery-skeleton {
        aspect-ratio: 4 / 5;
        border-radius: 0;
        background-image: linear-gradient(90deg, ${theme.line} 25%, ${theme.card} 37%, ${theme.line} 63%);
        background-size: 200% 100%;
        animation: galleryShimmer 1.4s ease-in-out infinite;
      }

      /* --- GALLERY: full-screen modal feed --- */
      @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes modalPop {
        from { opacity: 0; transform: translateY(16px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .gallery-modal { animation: modalFade 0.28s ease both; }
      .gallery-modal-post { animation: modalPop 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }

      .gallery-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 0;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: transparent;
        color: #fff;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .gallery-close:hover { background: rgba(255, 255, 255, 0.14); border-color: rgba(255, 255, 255, 0.6); }

      /* --- Passcode eye toggle --- */
      .passcode-eye {
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: none;
        border-radius: 9999px;
        background: none;
        color: ${theme.muted};
        cursor: pointer;
        transition: color 0.2s ease, background 0.2s ease;
      }
      .passcode-eye:hover { color: ${theme.ink}; background: rgba(0, 0, 0, 0.05); }

      @media (prefers-reduced-motion: reduce) {
        .reveal-up, .float-orb { animation: none !important; }
        .gallery-tile, .gallery-tile img, .gallery-tile-caption, .gallery-skeleton,
        .gallery-modal, .gallery-modal-post, .gallery-close {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}
