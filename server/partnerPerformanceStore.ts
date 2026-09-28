import fs from 'fs';
import path from 'path';
import { PartnerPerformanceActivity, MonthlyPerformanceKPI } from '../src/types';
import { firestoreService } from './firestoreService';

const DATA_DIR = path.join(process.cwd(), 'data');
const PERFORMANCE_FILE = path.join(DATA_DIR, 'partner_performance.json');

let memoryActivities: PartnerPerformanceActivity[] | null = null;

export function setMemoryPerformanceActivities(activities: PartnerPerformanceActivity[]) {
  memoryActivities = activities;
  savePerformanceActivitiesFile(activities);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Default empty performance activities array (no fake numbers)
const DEFAULT_ACTIVITIES: PartnerPerformanceActivity[] = [];

export function loadPerformanceActivities(): PartnerPerformanceActivity[] {
  if (memoryActivities) {
    return memoryActivities;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(PERFORMANCE_FILE)) {
      const data = fs.readFileSync(PERFORMANCE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryActivities = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading partner performance file:', err);
  }
  savePerformanceActivitiesFile(DEFAULT_ACTIVITIES);
  memoryActivities = DEFAULT_ACTIVITIES;
  return DEFAULT_ACTIVITIES;
}

function savePerformanceActivitiesFile(activities: PartnerPerformanceActivity[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify(activities, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving partner performance file:', err);
  }
}

export function savePerformanceActivities(activities: PartnerPerformanceActivity[]) {
  memoryActivities = activities;
  savePerformanceActivitiesFile(activities);
}

export function addPerformanceActivity(
  input: Omit<PartnerPerformanceActivity, 'id' | 'createdAt' | 'updatedAt'>
): PartnerPerformanceActivity {
  const activities = loadPerformanceActivities();
  const now = new Date().toISOString();
  const newActivity: PartnerPerformanceActivity = {
    ...input,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };

  activities.unshift(newActivity);
  savePerformanceActivities(activities);
  if (firestoreService.isReady()) {
    firestoreService.setPartnerPerformance(newActivity).catch((e) => console.error('[PerformanceStore] Firestore write error:', e));
  }
  return newActivity;
}

export function updatePerformanceActivity(
  id: string,
  input: Partial<Omit<PartnerPerformanceActivity, 'id' | 'createdAt'>>
): PartnerPerformanceActivity | null {
  const activities = loadPerformanceActivities();
  const index = activities.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updated: PartnerPerformanceActivity = {
    ...activities[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  activities[index] = updated;
  savePerformanceActivities(activities);
  if (firestoreService.isReady()) {
    firestoreService.setPartnerPerformance(updated).catch((e) => console.error('[PerformanceStore] Firestore update error:', e));
  }
  return updated;
}

export function deletePerformanceActivity(id: string): boolean {
  const activities = loadPerformanceActivities();
  const filtered = activities.filter((a) => a.id !== id);
  if (filtered.length === activities.length) return false;

  savePerformanceActivities(filtered);
  if (firestoreService.isReady()) {
    firestoreService.deletePartnerPerformance(id).catch((e) => console.error('[PerformanceStore] Firestore delete error:', e));
  }
  return true;
}

export function calculateMonthlyKPI(
  activities: PartnerPerformanceActivity[],
  year: number,
  month: number, // 1-12
  assignee: string // '전체' | '박서현' | '전시현' | '신현연'
): MonthlyPerformanceKPI {
  const targetYearStr = String(year);
  const targetMonthStr = String(month).padStart(2, '0');

  const filtered = activities.filter((a) => {
    if (!a.activityDate) return false;
    const [y, m] = a.activityDate.split('-');
    if (y !== targetYearStr || m !== targetMonthStr) return false;
    if (assignee && assignee !== '전체' && a.assignee !== assignee) return false;
    return true;
  });

  let newContactsCount = 0;
  let proposalsSentCount = 0;
  let meetingsCount = 0;
  let confirmedCount = 0;
  let completedCount = 0;
  let cashAmountTotal = 0;
  let inKindValueTotal = 0;

  filtered.forEach((a) => {
    if (a.activityType === '신규 컨택' || a.stage === '컨택중') {
      newContactsCount += 1;
    }
    if (a.activityType === '제안 발송' || a.stage === '제안') {
      proposalsSentCount += 1;
    }
    if (a.activityType === '미팅' || a.stage === '미팅') {
      meetingsCount += 1;
    }
    if (a.stage === '진행확정') {
      confirmedCount += 1;
    }
    if (a.stage === '완료' || a.activityType === '행사 실행') {
      completedCount += 1;
    }

    cashAmountTotal += Number(a.cashAmount || 0);
    inKindValueTotal += Number(a.inKindValue || a.inKindListPrice || 0);
  });

  const totalPartnershipValue = cashAmountTotal + inKindValueTotal;

  return {
    newContactsCount,
    proposalsSentCount,
    meetingsCount,
    confirmedCount,
    completedCount,
    cashAmountTotal,
    inKindValueTotal,
    totalPartnershipValue,
  };
}
