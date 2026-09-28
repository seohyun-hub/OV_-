import { WeeklyPlannerData, TodaysSignalsData } from '../types';
import { VERIFIED_WEEKLY_PLANNER_DATA } from '../data/weeklyPlannerData';

const STORAGE_PREFIX = 'ov_weekly_planner_';

/**
 * Fetch all available week summaries for week selection dropdown
 */
export function getAvailableWeeks(): { weekId: string; weekLabel: string; period: string; status: 'ACTIVE' | 'ARCHIVED' }[] {
  return VERIFIED_WEEKLY_PLANNER_DATA.map((w) => ({
    weekId: w.weekId,
    weekLabel: w.weekLabel,
    period: w.period,
    status: w.status,
  }));
}

/**
 * Get Weekly Planner Data for a specific week (or default to current active week)
 * Priority: LocalStorage -> Server API -> Static Verified Dataset
 */
export async function getWeeklyPlannerData(weekId: string = '2026-W34', forceRefresh: boolean = false): Promise<WeeklyPlannerData> {
  const storageKey = `${STORAGE_PREFIX}${weekId}`;

  if (!forceRefresh) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.weekId === weekId && parsed.weeklyTrends?.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached weekly planner from localStorage:', e);
    }
  }

  // Try fetching from Server API
  try {
    const res = await fetch(`/api/weekly-planner?weekId=${encodeURIComponent(weekId)}&forceRefresh=${forceRefresh ? 'true' : 'false'}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        saveWeeklyPlannerToStorage(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Server API fetch for weekly planner failed, using verified static dataset:', err);
  }

  // Fallback to verified static dataset
  const fallback = VERIFIED_WEEKLY_PLANNER_DATA.find((w) => w.weekId === weekId) || VERIFIED_WEEKLY_PLANNER_DATA[0];
  saveWeeklyPlannerToStorage(fallback);
  return fallback;
}

/**
 * Save Weekly Planner to LocalStorage for offline speed and fast switching
 */
export function saveWeeklyPlannerToStorage(data: WeeklyPlannerData): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${data.weekId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save weekly planner to localStorage:', e);
  }
}

/**
 * Copy text helper with fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}
