import { useTheme } from '../../context/ThemeContext';

// --- AMBIENT PAPER BACKGROUND LAYERS ---
export function AmbientBackground() {
  const theme = useTheme();

  return (
    <>
      <div className="paper-texture" aria-hidden="true" />
      <div
        className="float-orb"
        style={{ top: '-120px', left: '-8%', width: '280px', height: '280px', backgroundColor: theme.sun, opacity: 0.26, animation: 'floatSlow 14s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div
        className="float-orb"
        style={{ top: '40px', right: '-10%', width: '320px', height: '320px', backgroundColor: theme.rose, opacity: 0.2, animation: 'floatSlow 18s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div className="grid-paper" aria-hidden="true" />
    </>
  );
}
