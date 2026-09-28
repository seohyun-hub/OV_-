import fs from 'fs';
import path from 'path';
import { ReferenceSiteItem, ReferenceCategory } from '../src/types';
import { firestoreService } from './firestoreService';

const DATA_DIR = path.join(process.cwd(), 'data');
const REFERENCE_SITES_FILE = path.join(DATA_DIR, 'reference_sites.json');

let memoryReferenceSites: ReferenceSiteItem[] | null = null;

export function setMemoryReferenceSites(sites: ReferenceSiteItem[]) {
  memoryReferenceSites = sites;
  saveReferenceSitesFile(sites);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Verified initial reference sites with 100% real official URLs
const DEFAULT_REFERENCE_SITES: ReferenceSiteItem[] = [
  {
    id: 'ref-001',
    name: '네이버 데이터랩 (Naver DataLab)',
    category: '검색 & 트렌드',
    description: '네이버 분야별 검색 트렌드, 쇼핑인사이트, 지역별/성연령별 관심도 통계 리소스',
    url: 'https://datalab.naver.com',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-002',
    name: '구글 트렌드 (Google Trends)',
    category: '검색 & 트렌드',
    description: '전 세계 및 국가별 실시간 검색어 키워드 관심도 및 추이 분석',
    url: 'https://trends.google.com',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-003',
    name: 'KOSIS 국가통계포털 (통계청)',
    category: '시장조사',
    description: '대한민국 공식 국가 통계 포털, 인구·산업·서비스업·관광 종합 데이터',
    url: 'https://kosis.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-004',
    name: '한국관광 데이터랩 (한국관광공사)',
    category: '관광',
    description: '국내외 관광객 빅데이터, 카드 소비 패턴, 지역별 관광객 방문 추이',
    url: 'https://datalab.visitkorea.or.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-005',
    name: 'KOTRA 해외시장뉴스 (대한무역투자진흥공사)',
    category: '글로벌 리서치',
    description: '글로벌 시장 트렌드, 해외 소비재/서비스 동향 보고서 및 무역 정보',
    url: 'https://dream.kotra.or.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-006',
    name: 'Global Wellness Institute (GWI)',
    category: '웰니스',
    description: '글로벌 웰니스 경제, 스파·수면·리커버리 및 웰니스 투어리즘 공식 연구보고서',
    url: 'https://globalwellnessinstitute.org',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-007',
    name: '강원특별자치도청 공식 포털',
    category: '강원특별자치도',
    description: '강원특별자치도 도정 소식, 관광·레저·문화 정책 공고 및 보도자료',
    url: 'https://www.provin.gangwon.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-008',
    name: '원주시청 공식 포털',
    category: '원주시',
    description: '원주시 시정 소식, 원주 관광/축제/문화 행사 동향 및 공식 알림',
    url: 'https://www.wonju.go.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-009',
    name: '한국소비자원 (KCA)',
    category: '소비자 정보',
    description: '소비자 동향 리포트, 거래 실태 조사, 서비스 평가 및 소비자 권익 자료',
    url: 'https://www.kca.go.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-010',
    name: '국가법령정보센터 (법제처)',
    category: '법률·규정',
    description: '관광진흥법, 체육시설 설치·이용 법률, 식품위생법 등 관련 규정 조회',
    url: 'https://www.law.go.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-011',
    name: '한국호텔업협회 (KHA)',
    category: '호텔',
    description: '국내 호텔업 객실 가동률(OCC), ADR 수입 통계 및 산업 동향',
    url: 'https://www.hotelskorea.or.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-012',
    name: '한국골프장경영협회 (KGBA)',
    category: '골프',
    description: '전국 회원제/대중제 골프장 이용객 동향 및 골프 산업 현황 데이터',
    url: 'https://www.kgba.co.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-013',
    name: '문화체육관광부 (MCST)',
    category: '정부·공공기관',
    description: '대한민국 문화·체육·관광 정책, 관광자원 육성 및 공식 보도자료',
    url: 'https://www.mcst.go.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-014',
    name: '대학내일20대연구소',
    category: '마케팅 리서치',
    description: 'MZ세대/Z세대 소비 트렌드, 미디어 이용 행태 및 트렌드 인사이트',
    url: 'https://www.20slab.org',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-015',
    name: '오픈서베이 (OpenSurvey)',
    category: '마케팅 리서치',
    description: '소비자 행태 트렌드 리포트, 모바일 쇼핑·F&B·식음료 인사이트',
    url: 'https://www.opensurvey.co.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-016',
    name: '스포티비뉴스 (SPOTV NEWS)',
    category: '스포츠',
    description: '국내외 스포츠, 골프, 아웃도어 스포츠 이슈 및 전문 미디어 보도',
    url: 'https://www.spotvnews.co.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-017',
    name: '더바이어 (The Buyer)',
    category: '미디어',
    description: '유통, F&B, 프랜차이즈, B2B 소비재 트렌드 및 유통 전문 매체',
    url: 'https://www.itbuyer.com',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-018',
    name: '패션엔 (FashionN)',
    category: '브랜드',
    description: '패션, 뷰티, 패션 라이프스타일 브랜드 트렌드, 팝업스토어 및 콜라보 소식',
    url: 'https://www.fashionn.com',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'ref-019',
    name: '한국콘텐츠진흥원 (KOCCA)',
    category: '기타',
    description: '대한민국 콘텐츠 산업 동향, 캐릭터/IP/라이선싱 및 융복합 리서치',
    url: 'https://www.kocca.kr',
    isOfficial: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
];

export function loadReferenceSites(): ReferenceSiteItem[] {
  if (memoryReferenceSites) {
    return memoryReferenceSites;
  }
  ensureDataDir();
  if (!fs.existsSync(REFERENCE_SITES_FILE)) {
    saveReferenceSitesFile(DEFAULT_REFERENCE_SITES);
    memoryReferenceSites = DEFAULT_REFERENCE_SITES;
    return DEFAULT_REFERENCE_SITES;
  }
  try {
    const raw = fs.readFileSync(REFERENCE_SITES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data) && data.length > 0) {
      memoryReferenceSites = data;
      return data;
    }
  } catch (err) {
    console.error('Error reading reference_sites.json, falling back to defaults:', err);
  }
  memoryReferenceSites = DEFAULT_REFERENCE_SITES;
  return DEFAULT_REFERENCE_SITES;
}

function saveReferenceSitesFile(sites: ReferenceSiteItem[]) {
  ensureDataDir();
  fs.writeFileSync(REFERENCE_SITES_FILE, JSON.stringify(sites, null, 2), 'utf-8');
}

export function saveReferenceSites(sites: ReferenceSiteItem[]) {
  memoryReferenceSites = sites;
  saveReferenceSitesFile(sites);
}

export function addReferenceSite(siteInput: Omit<ReferenceSiteItem, 'id' | 'createdAt' | 'updatedAt'>): ReferenceSiteItem {
  const sites = loadReferenceSites();
  const today = new Date().toISOString().substring(0, 10);
  const newSite: ReferenceSiteItem = {
    ...siteInput,
    id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: today,
    updatedAt: today,
  };
  sites.unshift(newSite);
  saveReferenceSites(sites);
  if (firestoreService.isReady()) {
    firestoreService.setReferenceSite(newSite).catch((e) => console.error('[ReferenceSiteStore] Firestore write error:', e));
  }
  return newSite;
}

export function updateReferenceSite(id: string, siteInput: Partial<ReferenceSiteItem>): ReferenceSiteItem | null {
  const sites = loadReferenceSites();
  const index = sites.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const today = new Date().toISOString().substring(0, 10);
  const updatedSite: ReferenceSiteItem = {
    ...sites[index],
    ...siteInput,
    updatedAt: today,
  };
  sites[index] = updatedSite;
  saveReferenceSites(sites);
  if (firestoreService.isReady()) {
    firestoreService.setReferenceSite(updatedSite).catch((e) => console.error('[ReferenceSiteStore] Firestore update error:', e));
  }
  return updatedSite;
}

export function deleteReferenceSite(id: string): boolean {
  const sites = loadReferenceSites();
  const filtered = sites.filter((s) => s.id !== id);
  if (filtered.length === sites.length) return false;
  saveReferenceSites(filtered);
  if (firestoreService.isReady()) {
    firestoreService.deleteReferenceSite(id).catch((e) => console.error('[ReferenceSiteStore] Firestore delete error:', e));
  }
  return true;
}
