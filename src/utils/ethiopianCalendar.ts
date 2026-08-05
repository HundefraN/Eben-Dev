/**
 * High-precision Ethiopian Calendar (Ge'ez calendar) conversion & formatting utility.
 * Uses Julian Day Number (JDN) algorithm for exact mathematical accuracy.
 */

export interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number; // 1-30 (or 1-5/6 for Pagume)
  monthNameEn: string;
  monthNameAm: string;
}

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yakatit',
  'Magabit',
  'Miyazya',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nahase',
  'Pagume',
];

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም',
  'ጥቅምት',
  'ህዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜ',
];

/**
 * Convert Gregorian date parameters to Julian Day Number (JDN)
 */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert a JavaScript Date (Gregorian) to Ethiopian Date structure
 */
export function gregorianToEthiopian(dateInput: Date | string | number): EthiopianDate {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return {
      year: 2018,
      month: 1,
      day: 1,
      monthNameEn: ETHIOPIAN_MONTHS_EN[0],
      monthNameAm: ETHIOPIAN_MONTHS_AM[0],
    };
  }

  const gy = date.getFullYear();
  const gm = date.getMonth() + 1; // 1-indexed
  const gd = date.getDate();

  const jdn = gregorianToJDN(gy, gm, gd);

  // Offset from JDN to Ethiopian Epoch (1 Meskerem 1 EC = JDN 1723856)
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  const monthIdx = Math.min(Math.max(month - 1, 0), 12);

  return {
    year,
    month,
    day,
    monthNameEn: ETHIOPIAN_MONTHS_EN[monthIdx] || 'Meskerem',
    monthNameAm: ETHIOPIAN_MONTHS_AM[monthIdx] || 'መስከረም',
  };
}

export type CalendarMode = 'gregorian' | 'ethiopian';
export type EthiopianScript = 'amharic' | 'english';

export interface FormatOptions {
  showTime?: boolean;
  short?: boolean;
  relative?: boolean;
}

/**
 * Format time string (e.g., "09:30 AM")
 */
export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Get relative time string (e.g., "2m ago", "Just now")
 */
export function getRelativeTimeString(dateInput: Date | string | number): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSecs < 10) return 'Just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

/**
 * Format any date into Gregorian or Ethiopian calendar string
 */
export function formatAdminDate(
  dateInput: Date | string | number | undefined | null,
  calendarMode: CalendarMode = 'ethiopian',
  scriptMode: EthiopianScript = 'amharic',
  options: FormatOptions = { showTime: true }
): string {
  if (!dateInput) return 'N/A';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return 'N/A';

  if (options.relative) {
    return getRelativeTimeString(date);
  }

  const timeStr = options.showTime ? `, ${formatTimeOnly(date)}` : '';

  if (calendarMode === 'gregorian') {
    if (options.short) {
      const monthShort = date.toLocaleString('en-US', { month: 'short' });
      return `${monthShort} ${date.getDate()}, ${date.getFullYear()}${timeStr}`;
    }
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${timeStr}`;
  }

  // Ethiopian Calendar formatting
  const eth = gregorianToEthiopian(date);
  if (scriptMode === 'amharic') {
    return `${eth.monthNameAm} ${eth.day}, ${eth.year} ዓ.ም.${timeStr}`;
  } else {
    return `${eth.monthNameEn} ${eth.day}, ${eth.year} E.C.${timeStr}`;
  }
}
