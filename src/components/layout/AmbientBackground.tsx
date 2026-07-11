import { useTheme } from '../../context/ThemeContext';

// --- AMBIENT PAPER BACKGROUND LAYERS ---
export function AmbientBackground() {
  const theme = useTheme();

  // Fixed to the viewport (and self-clipping) so the textured backdrop stays put
  // while content scrolls over it, and the off-canvas orbs can never add page
  // overflow — which is also what lets the top bar be sticky.
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div className="paper-texture" />
      <div
        className="float-orb"
        style={{ top: '-120px', left: '-8%', width: '280px', height: '280px', backgroundColor: theme.sun, opacity: 0.26, animation: 'floatSlow 14s ease-in-out infinite' }}
      />
      <div
        className="float-orb"
        style={{ top: '40px', right: '-10%', width: '320px', height: '320px', backgroundColor: theme.rose, opacity: 0.2, animation: 'floatSlow 18s ease-in-out infinite' }}
      />
      <div className="grid-paper" />
    </div>
  );
}
