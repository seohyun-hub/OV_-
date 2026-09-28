import { ActivationItem, ActivationStatus } from '../types';

/**
 * Returns today's formatted date YYYY.MM.DD (e.g., 2026.08.18)
 */
export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear() >= 2026 ? d.getFullYear() : 2026;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Calculates current status (UPCOMING, ONGOING, ENDED) dynamically based on reference date (default today)
 */
export function calculateActivationStatus(
  startDateStr: string,
  endDateStr: string,
  referenceDateStr: string = getTodayDateStr()
): ActivationStatus {
  const start = normalizeDateStr(startDateStr);
  const end = normalizeDateStr(endDateStr || startDateStr);
  const ref = normalizeDateStr(referenceDateStr);

  if (!start) return 'ONGOING';

  if (end && end < ref) {
    return 'ENDED';
  } else if (start > ref) {
    return 'UPCOMING';
  } else {
    return 'ONGOING';
  }
}

/**
 * Sorts activations strictly by recency:
 * 1. ONGOING (진행 중)
 * 2. UPCOMING (가장 가까운 예정일 순 - startDate ASC)
 * 3. ENDED (가장 최근에 종료된 순 - endDate DESC)
 */
export function sortActivationsByRecency(
  items: ActivationItem[],
  referenceDateStr: string = getTodayDateStr()
): ActivationItem[] {
  const ref = normalizeDateStr(referenceDateStr);

  return [...items].sort((a, b) => {
    const statusA = calculateActivationStatus(a.startDate, a.endDate, referenceDateStr);
    const statusB = calculateActivationStatus(b.startDate, b.endDate, referenceDateStr);

    const priorityOrder: Record<ActivationStatus, number> = {
      ONGOING: 1,
      UPCOMING: 2,
      ENDED: 3,
    };

    const prioA = priorityOrder[statusA] || 4;
    const prioB = priorityOrder[statusB] || 4;

    if (prioA !== prioB) {
      return prioA - prioB;
    }

    const startA = normalizeDateStr(a.startDate);
    const startB = normalizeDateStr(b.startDate);
    const endA = normalizeDateStr(a.endDate || a.startDate);
    const endB = normalizeDateStr(b.endDate || b.startDate);

    // If both are ONGOING: prioritize sooner end or later end
    if (statusA === 'ONGOING') {
      if (endA !== endB) return endA.localeCompare(endB);
      return startA.localeCompare(startB);
    }

    // If both are UPCOMING: closest start date comes FIRST (ascending)
    if (statusA === 'UPCOMING') {
      if (startA !== startB) return startA.localeCompare(startB);
      return endA.localeCompare(endB);
    }

    // If both are ENDED: most recently ended comes FIRST (descending)
    if (statusA === 'ENDED') {
      if (endA !== endB) return endB.localeCompare(endA);
      return startB.localeCompare(startA);
    }

    return 0;
  });
}

/**
 * Normalizes date strings to YYYY-MM-DD with zero padding for month and day
 */
export function normalizeDateStr(dateStr: string): string {
  if (!dateStr) return '';
  const cleaned = dateStr.trim().replace(/\./g, '-').replace(/\//g, '-');
  const parts = cleaned.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return cleaned;
}

/**
 * Checks if an event falls within or overlaps a given year/month string e.g. "2026.08"
 */
export function isEventInMonth(event: ActivationItem, monthStr: string): boolean {
  if (!event) return false;

  // Format target monthStr as "YYYY-MM"
  const mParts = monthStr.replace(/\./g, '-').split('-');
  if (mParts.length < 2) return false;
  const m = `${mParts[0]}-${mParts[1].padStart(2, '0')}`;

  let start = normalizeDateStr(event.startDate);
  let end = normalizeDateStr(event.endDate || event.startDate);

  // Fallback if startDate is missing but periodText exists (e.g. "2026.08.10 ~ 2026.08.25" or "08.01 ~ 08.28")
  if (!start && event.periodText) {
    const periodMatches = event.periodText.match(/\d{4}[\.-]\d{1,2}[\.-]\d{1,2}/g);
    if (periodMatches && periodMatches.length >= 1) {
      start = normalizeDateStr(periodMatches[0]);
      end = periodMatches.length >= 2 ? normalizeDateStr(periodMatches[1]) : start;
    } else {
      const shortMatches = event.periodText.match(/(\d{1,2})[\.-](\d{1,2})/g);
      if (shortMatches && shortMatches.length >= 1) {
        start = normalizeDateStr(`2026.${shortMatches[0]}`);
        end = shortMatches.length >= 2 ? normalizeDateStr(`2026.${shortMatches[1]}`) : start;
      }
    }
  }

  if (!start) return true; // Show items with unparseable dates rather than hiding them

  const startMonth = start.slice(0, 7);
  const endMonth = end ? end.slice(0, 7) : startMonth;

  return startMonth <= m && endMonth >= m;
}

/**
 * Gets day number of month (1-31) for start date in a given month
 */
export function getStartDayOfMonth(event: ActivationItem, monthStr: string): number {
  const mParts = monthStr.replace(/\./g, '-').split('-');
  const m = `${mParts[0]}-${mParts[1].padStart(2, '0')}`;

  const start = normalizeDateStr(event.startDate);
  if (start && start.startsWith(m)) {
    const day = parseInt(start.slice(8, 10), 10);
    return isNaN(day) ? 1 : day;
  }
  return 1; // if started in previous month
}

/**
 * Gets day number of month (1-31) for end date in a given month
 */
export function getEndDayOfMonth(event: ActivationItem, monthStr: string): number {
  const mParts = monthStr.replace(/\./g, '-').split('-');
  const year = parseInt(mParts[0], 10) || 2026;
  const month = parseInt(mParts[1], 10) || 8;
  const daysInM = new Date(year, month, 0).getDate();

  const m = `${mParts[0]}-${String(month).padStart(2, '0')}`;
  const end = normalizeDateStr(event.endDate || event.startDate);
  if (end && end.startsWith(m)) {
    const day = parseInt(end.slice(8, 10), 10);
    return isNaN(day) ? daysInM : day;
  }
  return daysInM; // if ends in subsequent month
}

/**
 * Formats a month title string e.g. "2026.08" -> "2026 AUGUST"
 */
export function formatMonthHeader(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split('.');
  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const idx = parseInt(month, 10) - 1;
  const mName = monthNames[idx] || 'AUGUST';
  return `${year} ${mName}`;
}

/**
 * Category matching logic
 */
export function matchesCategory(event: ActivationItem, selectedCategory: string): boolean {
  if (selectedCategory === '전체' || !selectedCategory) return true;

  const type = (event.eventType || '').toLowerCase();
  const tags = (event.tags || []).map((t) => t.toLowerCase());
  const name = (event.eventName || '').toLowerCase();

  switch (selectedCategory) {
    case '팝업':
      return type.includes('pop') || tags.some((t) => t.includes('pop')) || name.includes('팝업');
    case '전시':
      return type.includes('exhib') || tags.some((t) => t.includes('exhib')) || name.includes('전시');
    case '박람회 / Expo':
      return type.includes('expo') || type.includes('fair') || tags.some((t) => t.includes('expo')) || name.includes('박람회');
    case 'Brand Event':
      return type.includes('brand') || type.includes('event') || tags.some((t) => t.includes('brand'));
    case 'Sports':
      return type.includes('sport') || tags.some((t) => t.includes('sport'));
    case 'Golf':
      return type.includes('golf') || tags.some((t) => t.includes('golf')) || name.includes('골프');
    case 'Running':
      return type.includes('run') || tags.some((t) => t.includes('run') || t.includes('trail')) || name.includes('러닝') || name.includes('트레일');
    case 'Wellness':
      return type.includes('well') || type.includes('yoga') || tags.some((t) => t.includes('well') || t.includes('yoga'));
    case 'Outdoor':
      return type.includes('outdoor') || type.includes('camp') || tags.some((t) => t.includes('outdoor'));
    case 'F&B':
      return type.includes('f&b') || type.includes('food') || tags.some((t) => t.includes('f&b') || t.includes('coffee') || t.includes('gourmet'));
    case 'Fashion / Beauty':
      return type.includes('fashion') || type.includes('beauty') || tags.some((t) => t.includes('fashion') || t.includes('beauty'));
    case 'Lifestyle / Culture':
      return type.includes('life') || type.includes('cult') || tags.some((t) => t.includes('life') || t.includes('art'));
    default:
      return true;
  }
}

/**
 * Region matching logic
 */
export function matchesRegion(
  event: ActivationItem,
  selectedRegion: string,
  selectedSubRegion: string = ''
): boolean {
  if (selectedRegion !== '전체' && selectedRegion !== '한국 전체') {
    const reg = (event.region || '').toLowerCase();
    const city = (event.city || '').toLowerCase();
    const targetReg = selectedRegion.toLowerCase();

    if (targetReg === '서울' && city !== '서울' && reg !== '서울') return false;
    if (targetReg === '경기' && city !== '경기' && reg !== '경기') return false;
    if (targetReg === '인천' && city !== '인천' && reg !== '인천') return false;
    if (targetReg === '강원' && city !== '강원' && reg !== '강원') return false;
    if (targetReg === '부산' && city !== '부산' && reg !== '부산') return false;
    if (targetReg === '제주' && city !== '제주' && reg !== '제주') return false;
    if (targetReg === 'japan' && reg !== 'japan') return false;
    if (targetReg === 'global' && reg !== 'global') return false;
  }

  if (selectedSubRegion) {
    const loc = (event.location || '').toLowerCase();
    const hotspot = (event.hotspot || '').toLowerCase();
    const sub = selectedSubRegion.toLowerCase();
    if (!loc.includes(sub) && !hotspot.includes(sub)) {
      return false;
    }
  }

  return true;
}

/**
 * Quick Filter matching
 */
export function matchesQuickFilter(event: ActivationItem, quickFilter: string): boolean {
  if (quickFilter === '전체' || !quickFilter) return true;

  const status = calculateActivationStatus(event.startDate, event.endDate);

  if (quickFilter === '진행 중') {
    return status === 'ONGOING';
  }
  if (quickFilter === '다음 달 예정') {
    return status === 'UPCOMING';
  }
  if (quickFilter === '곧 종료') {
    if (status !== 'ONGOING') return false;
    const end = normalizeDateStr(event.endDate || event.startDate);
    // Ending within 10 days of 2026-08-17
    return end <= '2026-08-27';
  }
  if (quickFilter === '이번 주' || quickFilter === '이번 주말') {
    // Current week: 2026-08-17 ~ 2026-08-23
    const start = normalizeDateStr(event.startDate);
    const end = normalizeDateStr(event.endDate || event.startDate);
    return start <= '2026-08-23' && end >= '2026-08-17';
  }

  return true;
}
