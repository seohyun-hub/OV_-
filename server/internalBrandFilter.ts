/**
 * Utility to identify and filter out internal brands/facilities (Server-side)
 * Internal Assets to exclude from competitor, market trend, and industry lists:
 * - Oak Valley / 오크밸리
 * - PARK ROCHE / 파크로쉬 / 파크로쉬 리조트앤웰니스
 * - IPARK RESORT / IPARK 리조트 / 아이파크
 * - 오크밸리CC, 오크힐스CC, 성문안CC, 월송리CC
 * - 오크밸리 스키장
 * - HDC Resort / HDC리조트
 */

const INTERNAL_BRAND_KEYWORDS = [
  'oak valley',
  'oakvalley',
  '오크밸리',
  '오크힐스',
  'oakhills',
  'park roche',
  'parkroche',
  '파크로쉬',
  'ipark',
  '아이파크',
  '성문안',
  'sungmunan',
  '월송리',
  'wolsongri',
  'hdc'
];

/**
 * Checks if a given text contains any internal brand or facility name.
 */
export function isInternalBrand(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.toLowerCase().replace(/[\s\-_'".&/()\[\]]/g, '');
  return INTERNAL_BRAND_KEYWORDS.some((kw) => {
    const normKw = kw.toLowerCase().replace(/[\s\-_'".&/()\[\]]/g, '');
    return normalized.includes(normKw);
  });
}

/**
 * Filters an array of objects to exclude any records associated with internal brands.
 */
export function filterOutInternalBrands<T extends Record<string, any>>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    if (!item || typeof item !== 'object') return false;

    // Check main subject/brand/name/url fields
    const primaryFields = [
      item.companyName,
      item.facilityName,
      item.brand,
      item.competitorName,
      item.companyBrand,
      item.hotelResortName,
      item.name,
      item.officialUrl,
      item.sourceUrl,
      item.url,
      item.partnerBrandName,
    ];

    for (const field of primaryFields) {
      if (typeof field === 'string' && isInternalBrand(field)) {
        return false;
      }
    }

    // Check title and details fields for internal brand actors
    const contentFields = [
      item.title,
      item.whatWasDone,
      item.summary,
      item.details,
      item.memo,
    ];

    for (const field of contentFields) {
      if (typeof field === 'string' && isInternalBrand(field)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Removes duplicate promotions/events by title/URL, and ensures each brand appears
 * at most `maxPerBrand` times (default 1).
 */
export function deduplicateBrands<T extends Record<string, any>>(items: T[], maxPerBrand: number = 1): T[] {
  if (!Array.isArray(items)) return [];
  const brandCountMap = new Map<string, number>();
  const seenTitlesOrUrls = new Set<string>();

  return items.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    
    // Check exact duplicate title or URL
    const title = String(item.title || item.whatWasDone || '').trim().toLowerCase();
    const url = String(item.sourceUrl || item.officialUrl || '').trim().toLowerCase();
    const key = `${title}::${url}`;
    if (title.length > 2 && seenTitlesOrUrls.has(key)) {
      return false;
    }
    if (title.length > 2) {
      seenTitlesOrUrls.add(key);
    }

    // Extract normalized brand name
    const rawBrand = String(
      item.companyName ||
      item.facilityName ||
      item.brand ||
      item.competitorName ||
      item.companyBrand ||
      item.hotelResortName ||
      ''
    ).toLowerCase();

    // Group variations like "아난티 앳 부산", "아난티 앳 강남", "아난티" as "아난티"
    let canonicalBrand = rawBrand;
    if (rawBrand.includes('아난티') || rawBrand.includes('ananti')) {
      canonicalBrand = '아난티';
    } else if (rawBrand.includes('해비치') || rawBrand.includes('haevichi')) {
      canonicalBrand = '해비치';
    } else if (rawBrand.includes('소노') || rawBrand.includes('비발디') || rawBrand.includes('sono')) {
      canonicalBrand = '소노펠리체';
    } else if (rawBrand.includes('파라다이스') || rawBrand.includes('paradise')) {
      canonicalBrand = '파라다이스';
    } else if (rawBrand.includes('조선') || rawBrand.includes('josun')) {
      canonicalBrand = '조선호텔';
    } else if (rawBrand.includes('신라') || rawBrand.includes('shilla')) {
      canonicalBrand = '신라호텔';
    } else if (rawBrand.includes('야놀자') || rawBrand.includes('인터파크') || rawBrand.includes('yanolja')) {
      canonicalBrand = '야놀자';
    }

    if (!canonicalBrand) return true;

    const count = brandCountMap.get(canonicalBrand) || 0;
    if (count >= maxPerBrand) {
      return false;
    }
    brandCountMap.set(canonicalBrand, count + 1);
    return true;
  });
}

