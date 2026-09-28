import fs from 'fs';
import path from 'path';
import { ScheduleItem } from '../src/types';
import { firestoreService } from './firestoreService';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULES_FILE = path.join(DATA_DIR, 'schedules.json');

let memorySchedules: ScheduleItem[] | null = null;

export function setMemorySchedules(schedules: ScheduleItem[]) {
  memorySchedules = schedules;
  saveSchedulesFile(schedules);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial realistic default schedules for HDC Resort (Oak Valley & Park Roche)
const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-001',
    date: '2026-09-14',
    time: '10:00',
    title: '윈터 하프 마라톤 스폰서 후속 협의',
    company: '오크밸리 윈터 하프 마라톤',
    scheduleType: '스폰서 제안',
    location: '오크밸리 마케팅회의실 / 비대면',
    assignee: '박서현',
    status: '진행중',
    memo: '마라톤 미디어 협찬 및 브랜드 부스 스폰서십 조건 협의',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-002',
    date: '2026-09-15',
    time: '14:00',
    title: 'Garmin Golf Club 프랙티스 레인지 촬영 운영',
    company: 'Garmin (가민 코리아)',
    scheduleType: '행사 준비',
    location: '성문안 CC 프랙티스 레인지',
    assignee: '박서현',
    status: '예정',
    memo: '골프 스마트워치 앰버서더 촬영 및 장비 세팅 현장 점검',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-003',
    date: '2026-09-16',
    time: '11:00',
    title: 'K-SWISS Pickleball 브랜드 협업 후속 협의',
    company: 'K-SWISS (케이위스)',
    scheduleType: '후속 연락',
    location: '유선 및 이메일',
    assignee: '박서현',
    status: '예정',
    memo: '피클볼 코트 브랜딩 및 주말 시착 이벤트 굿즈 수율 협의',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-004',
    date: '2026-09-17',
    time: '15:00',
    title: '르무통 산책회 객실·패키지 운영 협의',
    company: '르무통 (Le Mouton)',
    scheduleType: '제휴 협의',
    location: '성문안 클럽하우스 미팅룸',
    assignee: '박서현',
    status: '예정',
    memo: '산책회 참가자 전용 숙박 패키지 및 웰컴 슈즈 현물 협찬 조율',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-005',
    date: '2026-09-18',
    time: '10:30',
    title: '러닝대회 미디어/스폰서 미팅 및 후속 협의',
    company: '오크밸리 러닝대회 사무국',
    scheduleType: '미팅',
    location: '서울 사무소',
    assignee: '박서현',
    status: '예정',
    memo: '미디어 파트너십 스폰서 피드백 수렴 및 후속 미팅',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-006',
    date: '2026-09-19',
    time: '14:00',
    title: '성문안 피오레토 × 치유사물 향초 클래스 운영 협의',
    company: '치유사물 (권용은 작가)',
    scheduleType: '클래스 준비',
    location: '성문안 피오레토 레스토랑',
    assignee: '미지정',
    status: '예정',
    memo: '애프터눈티 세트 연계 커스텀 향초 클래스 동선 및 재료 준비',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-007',
    date: '2026-09-20',
    time: '11:30',
    title: 'Mindnook 가족 마음챙김 프로그램 구성 협의',
    company: 'Mindnook (마인드눅)',
    scheduleType: '제휴 협의',
    location: '파크로쉬 웰니스 클럽',
    assignee: '미지정',
    status: '예정',
    memo: '가족 투숙객 대상 싱잉볼 & 명상 커리큘럼 세부 조율',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-008',
    date: '2026-09-21',
    time: '16:00',
    title: '영풍문고 북큐레이션 협업 조건 검토',
    company: '영풍문고',
    scheduleType: '제안 검토',
    location: '서면 검토',
    assignee: '미지정',
    status: '예정',
    memo: '리조트 로비 북크닉존 도서 큐레이션 및 팝업 제안 조건 검토',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-009',
    date: '2026-09-22',
    time: '13:30',
    title: '아이파크신라면세점 VIP 회원 혜택 협의',
    company: 'HDC신라면세점',
    scheduleType: '회원 제휴',
    location: '용산 아이파크몰 본사',
    assignee: '미지정',
    status: '예정',
    memo: 'IPARK VIP 바우처 및 오크밸리 객실 할인 상호 혜택 제휴',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-010',
    date: '2026-09-23',
    time: '15:00',
    title: 'Garmin 프랙티스 레인지 행사 운영 점검',
    company: 'Garmin (가민 코리아)',
    scheduleType: '행사',
    location: '성문안 CC',
    assignee: '박서현',
    status: '예정',
    memo: '프랙티스 레인지 가민 런치모니터 체험 공간 동선 점검',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-011',
    date: '2026-09-24',
    time: '10:00',
    title: '웰니스/사우나 연계 프로그램 도입 협의',
    company: '웰니스 파트너사',
    scheduleType: '제휴 협의',
    location: '오크밸리 사우나 & 스파',
    assignee: '미지정',
    status: '예정',
    memo: '사우나 투숙객 혜택 및 입점 스킨케어 브랜드 연계 협의',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sch-012',
    date: '2026-09-25',
    time: '14:30',
    title: '러닝대회 식음료·웰니스·스포츠 브랜드 스폰서 협의',
    company: '러닝대회 스폰서십 파트너사',
    scheduleType: '계약·협의',
    location: '오크밸리 컨벤션홀',
    assignee: '박서현',
    status: '예정',
    memo: '식음료 및 스포츠 브랜드 협찬 제품 배포 수율 및 인쇄물 로고 배치 조율',
    source: 'MANUAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadSchedules(): ScheduleItem[] {
  if (memorySchedules) {
    return memorySchedules;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(SCHEDULES_FILE)) {
      const data = fs.readFileSync(SCHEDULES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memorySchedules = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading schedules file:', err);
  }
  saveSchedulesFile(DEFAULT_SCHEDULES);
  memorySchedules = DEFAULT_SCHEDULES;
  return DEFAULT_SCHEDULES;
}

function saveSchedulesFile(schedules: ScheduleItem[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving schedules file:', err);
  }
}

export function saveSchedules(schedules: ScheduleItem[]) {
  memorySchedules = schedules;
  saveSchedulesFile(schedules);
}

export function addSchedule(
  input: Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>
): ScheduleItem {
  const schedules = loadSchedules();
  const newItem: ScheduleItem = {
    ...input,
    id: `sch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  schedules.unshift(newItem);
  schedules.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });
  saveSchedules(schedules);
  if (firestoreService.isReady()) {
    firestoreService.setSchedule(newItem).catch((e) => console.error('[ScheduleStore] Firestore write error:', e));
  }
  return newItem;
}

export function batchAddSchedules(
  inputs: Array<Omit<ScheduleItem, 'id' | 'createdAt' | 'updatedAt'>>
): ScheduleItem[] {
  const schedules = loadSchedules();
  const added: ScheduleItem[] = [];

  inputs.forEach((input) => {
    const newItem: ScheduleItem = {
      ...input,
      id: `sch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    schedules.unshift(newItem);
    added.push(newItem);
    if (firestoreService.isReady()) {
      firestoreService.setSchedule(newItem).catch((e) => console.error('[ScheduleStore] Firestore batch write error:', e));
    }
  });

  schedules.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  saveSchedules(schedules);
  return added;
}

export function updateSchedule(
  id: string,
  updates: Partial<Omit<ScheduleItem, 'id' | 'createdAt'>>
): ScheduleItem | null {
  const schedules = loadSchedules();
  const index = schedules.findIndex((s) => s.id === id);
  if (index === -1) return null;

  schedules[index] = {
    ...schedules[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  schedules.sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  saveSchedules(schedules);
  if (firestoreService.isReady()) {
    firestoreService.setSchedule(schedules[index]).catch((e) => console.error('[ScheduleStore] Firestore update error:', e));
  }
  return schedules[index];
}

export function deleteSchedule(id: string): boolean {
  const schedules = loadSchedules();
  const filtered = schedules.filter((s) => s.id !== id);
  if (filtered.length === schedules.length) return false;
  saveSchedules(filtered);
  if (firestoreService.isReady()) {
    firestoreService.deleteSchedule(id).catch((e) => console.error('[ScheduleStore] Firestore delete error:', e));
  }
  return true;
}
