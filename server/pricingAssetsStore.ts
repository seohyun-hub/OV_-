import fs from 'fs';
import path from 'path';
import { PricingAssetItem, BarterCalculationResult } from '../src/types';

const PRICING_ASSETS_FILE = path.join(process.cwd(), 'data', 'pricing_assets.json');
const BARTER_CALCULATIONS_FILE = path.join(process.cwd(), 'data', 'barter_calculations.json');

const DEFAULT_PRICING_ASSETS: PricingAssetItem[] = [
  {
    id: 'pa-001',
    category: '객실',
    itemName: '오크밸리 밸리빌리지 31평형',
    specCondition: '주중 (일~목) / 클린타입',
    unit: '1실 1박',
    normalPrice: 320000,
    partnerPrice: 180000,
    costPrice: 65000,
    notes: '체크인 15:00, 체크아웃 11:00',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-002',
    category: '객실',
    itemName: '파크로쉬 리조트앤웰니스 숙암 킹',
    specCondition: '주중 (일~목) / 2인 조식 포함',
    unit: '1실 1박',
    normalPrice: 450000,
    partnerPrice: 280000,
    costPrice: 120000,
    notes: '웰니스 프로그램 2인 무료 이용 포함',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-003',
    category: '골프',
    itemName: '오크밸리 CC 18홀 비회원 그린피',
    specCondition: '주중 (월~금)',
    unit: '1인 1라운드',
    normalPrice: 220000,
    partnerPrice: 160000,
    costPrice: 50000,
    notes: '카트비 및 캐디피 별도',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-004',
    category: '골프',
    itemName: '성문안 CC 18홀 프리미엄 그린피',
    specCondition: '주중 (월~목)',
    unit: '1인 1라운드',
    normalPrice: 290000,
    partnerPrice: 210000,
    costPrice: 70000,
    notes: '퍼블릭 최상급 코스',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-005',
    category: '공간',
    itemName: '오크밸리 잔디광장 (Main Lawn)',
    specCondition: '1,500평 야외 대관 / 전일 사용',
    unit: '1일 (10시간)',
    normalPrice: 5000000,
    partnerPrice: 3500000,
    costPrice: 800000,
    notes: '전력 및 시설보호 관리비 포함',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-006',
    category: '공간',
    itemName: '빌리지센터 로비 팝업존',
    specCondition: '유동인구 최상 / 3m x 3m 부스',
    unit: '1일',
    normalPrice: 1500000,
    partnerPrice: 1000000,
    costPrice: 150000,
    notes: '집기 제공 및 전력 연결 지원',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-007',
    category: '광고',
    itemName: '골프 클럽하우스 메인 LED 미디어월',
    specCondition: '15초 영상 / 일 100회 이상 구동',
    unit: '1개월',
    normalPrice: 3000000,
    partnerPrice: 2000000,
    costPrice: 200000,
    notes: '골프장 회원 및 방문객 동선 노출',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-008',
    category: 'F&B',
    itemName: '아웃도어 야외 셀프 바비큐 패키지',
    specCondition: '한우/한돈 모듬 4인 세트',
    unit: '1세트',
    normalPrice: 180000,
    partnerPrice: 140000,
    costPrice: 95000,
    notes: '숯 및 그릴 세팅 비용 포함',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-009',
    category: '사우나',
    itemName: '오크밸리 사우나 & 수영장 자유이용권',
    specCondition: '대인 1인 기준',
    unit: '1매',
    normalPrice: 35000,
    partnerPrice: 20000,
    costPrice: 5000,
    notes: '당일 재입장 불가',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  },
  {
    id: 'pa-010',
    category: '클래스',
    itemName: '파크로쉬 마인드풀니스 웰니스 클래스',
    specCondition: '요가 / 싱잉볼 메디테이션',
    unit: '1인 1회',
    normalPrice: 50000,
    partnerPrice: 30000,
    costPrice: 10000,
    notes: '사전 예약 필수',
    sourceFile: '2026_IPARK_Asset_RateCard.xlsx',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: []
  }
];

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Pricing Assets File I/O
export function loadPricingAssets(): PricingAssetItem[] {
  try {
    if (fs.existsSync(PRICING_ASSETS_FILE)) {
      const raw = fs.readFileSync(PRICING_ASSETS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading pricing_assets.json:', e);
  }
  // Fallback to default & save
  savePricingAssets(DEFAULT_PRICING_ASSETS);
  return DEFAULT_PRICING_ASSETS;
}

export function savePricingAssets(items: PricingAssetItem[]): void {
  try {
    ensureDir(PRICING_ASSETS_FILE);
    fs.writeFileSync(PRICING_ASSETS_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving pricing_assets.json:', e);
  }
}

// Barter Calculations File I/O
export function loadBarterCalculations(): BarterCalculationResult[] {
  try {
    if (fs.existsSync(BARTER_CALCULATIONS_FILE)) {
      const raw = fs.readFileSync(BARTER_CALCULATIONS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading barter_calculations.json:', e);
  }
  return [];
}

export function saveBarterCalculations(list: BarterCalculationResult[]): void {
  try {
    ensureDir(BARTER_CALCULATIONS_FILE);
    fs.writeFileSync(BARTER_CALCULATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving barter_calculations.json:', e);
  }
}
