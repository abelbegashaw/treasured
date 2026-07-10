// --- MASTER UI PALETTE ARCHITECTURE (the warm, editorial "Treasured" look) ---
export const theme = {
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
} as const;

export type Theme = typeof theme;
