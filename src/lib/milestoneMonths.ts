// Month-slot generation for the anniversary timeline.
//
// Given the "together since" anchor date, produce one slot per monthly marker
// from the beginning (month 0) up to the current elapsed month. The timeline
// renders these in order; each slot may or may not have a photo attached.

export interface MonthSlot {
  monthNumber: number; // 0 = the beginning, 1 = one month, …
  date: Date;          // calendar date of this marker (anchor + N months)
  label: string;       // 'BEGINNING' | '1 MONTH' | 'N MONTHS'
  dateLabel: string;   // e.g. 'Mar 2026'
}

// Parse a 'YYYY-MM-DD' date as LOCAL midnight. Passing the string straight to
// `new Date()` parses it as UTC, which can shift the day across timezones.
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Add N months, clamping the day to the target month's last day so e.g. a
// Jan-31 anchor lands on Feb-28/29 instead of skipping into March.
function addMonths(base: Date, n: number): Date {
  const total = base.getMonth() + n;
  const year = base.getFullYear() + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(base.getDate(), lastDay));
}

// Whole months elapsed from the anchor up to `now` (inclusive of month 0).
function elapsedMonths(anchor: Date, now: Date): number {
  let n = 0;
  while (addMonths(anchor, n + 1).getTime() <= now.getTime()) n++;
  return n;
}

function labelFor(monthNumber: number): string {
  if (monthNumber === 0) return 'BEGINNING';
  return monthNumber === 1 ? '1 MONTH' : `${monthNumber} MONTHS`;
}

// Oldest first (month 0 at the top), matching the timeline layout.
export function milestoneMonths(anchorIso: string, now: Date = new Date()): MonthSlot[] {
  const anchor = parseLocalDate(anchorIso);
  if (Number.isNaN(anchor.getTime())) return [];

  const last = Math.max(0, elapsedMonths(anchor, now));
  const slots: MonthSlot[] = [];
  for (let n = 0; n <= last; n++) {
    const date = addMonths(anchor, n);
    slots.push({
      monthNumber: n,
      date,
      label: labelFor(n),
      dateLabel: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    });
  }
  return slots;
}
