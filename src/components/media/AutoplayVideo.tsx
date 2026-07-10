import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface AutoplayVideoProps {
  src: string;          // playable video URL (videoPlayback / mediaFull)
  poster: string;       // still poster frame (videoPoster)
  active?: boolean;     // carousels: only the snapped slide is active (default true)
  controls?: boolean;   // lightbox uses native controls
  fit?: 'cover' | 'contain';
  onClick?: () => void; // e.g. open the lightbox
  style?: CSSProperties; // wrapper style
  ariaLabel?: string;
}

// Instagram-style inline video: muted + looping, it autoplays ONLY while it is
// sufficiently on-screen (IntersectionObserver) and `active`. Because a vertical
// feed shows one node past the threshold at a time — and a carousel marks one
// slide active — at most one video ever plays. preload="none" + a poster mean
// nothing downloads until it actually plays. A corner button toggles sound.
export function AutoplayVideo({ src, poster, active = true, controls = false, fit = 'cover', onClick, style, ariaLabel }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shouldPlay = inView && active;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (shouldPlay) {
      // Autoplay can reject (e.g. before any interaction) — muted playback is
      // allowed, and we ignore the rejection either way.
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [shouldPlay]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        controls={controls}
        onClick={onClick}
        aria-label={ariaLabel}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: fit, cursor: onClick ? 'pointer' : 'default', backgroundColor: '#000' }}
      />
      {!controls && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          style={{ position: 'absolute', bottom: '8px', right: '8px', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer' }}
        >
          <SpeakerIcon muted={muted} />
        </button>
      )}
    </div>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}
