import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ProposalData,
  ProposalMode,
  ProposalSection,
  CompanyReport,
  DealProfitabilityResult,
  PartnerTargetInput,
  SavedDealItem,
  OccDataSummary,
  CorporatePptTemplate,
} from '../types';
import {
  exportProposalToPPTX,
  exportProposalToDOCX,
  exportProposalToXLSX,
} from '../utils/exportHelpers';
import {
  FileText,
  X,
  Sparkles,
  Download,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Send,
  Sliders,
  Check,
  ChevronRight,
  Database,
  Building2,
  PieChart,
  Lightbulb,
  Plus,
  Zap,
  FolderOpen,
  Upload,
  Settings,
  Calendar,
  Table,
  Link,
  Info,
} from 'lucide-react';

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyReport?: CompanyReport | null;
  barterPackage?: any | null;
  profitabilityData?: DealProfitabilityResult | null;
  projectInput?: PartnerTargetInput | null;
}

export type ProposalTemplateStyle = 'IPARK' | 'OAK_VALLEY' | 'PARK_ROCHE';

export interface VerifiedBrandFactItem {
  fact: string;
  source: string;
  verifiedDate: string;
}

export interface BrandAnalysisData {
  brandName: string;
  overview: string;
  targetCustomer: string;
  recentMarketingMove: string;
  partnershipStrengths: string;
  oakValleyFit: string;
  verifiedFacts: VerifiedBrandFactItem[];
  strategicInsights: string[];
}

export interface IdeaConceptOption {
  id: string;
  title: string;
  tag: string;
  description: string;
  whyEffective: string;
}

// Preset Default Deals if none in localStorage
const DEFAULT_SAVED_DEALS: SavedDealItem[] = [
  {
    id: 'deal-preset-1',
    brandName: 'Garmin',
    projectName: '오크밸리CC VIP 골프 트래킹 & 36홀 라운드 데이터 팝업',
    savedAt: '2026-08-28',
    items: [
      { category: '공간', itemName: '야외광장 (밸리빌리지 잔디광장)', unit: '1일', normalPrice: 5000000, quantityNum: 2, appliedPrice: 0, notes: '행사 메인 팝업 2일 무상 지원' },
      { category: '객실', itemName: '밸리빌리지 (노블 31평형)', unit: '1실 1박', normalPrice: 350000, quantityNum: 10, appliedPrice: 150000, notes: '스태프/VIP 투숙 지원' },
      { category: '광고', itemName: '빌리지센터 DID 스크린', unit: '1주', normalPrice: 3000000, quantityNum: 1, appliedPrice: 1000000, notes: '브랜드 미디어 송출' }
    ],
    totalNormalValue: 16500000,
    negotiatedValue: 2500000,
    discountAmount: 14000000,
    discountRate: 84.8,
    actualVariableCost: 1400000,
    opportunityCost: 500000,
    guaranteedCashRevenue: 1000000,
    guaranteedRoomRevenue: 1500000,
    brandInKindValue: 12000000,
    dealMarginPercent: 62.5,
    negotiationNotes: 'Garmin 스마트워치 시체험 현물 및 라운드 챌린지 연계'
  },
  {
    id: 'deal-preset-2',
    brandName: '스노우피크',
    projectName: '오크밸리 참나무 숲 야외 감성 캠핑 팝업스토어 및 바비큐 존',
    savedAt: '2026-08-29',
    items: [
      { category: '공간', itemName: '참나무 숲 산책로 및 잔디광장', unit: '1일', normalPrice: 6000000, quantityNum: 3, appliedPrice: 0, notes: '숲속 팝업 존 3일 지원' },
      { category: '객실', itemName: '스위트 객실 어메니티 세팅', unit: '10실 2박', normalPrice: 5000000, quantityNum: 1, appliedPrice: 2000000, notes: '캠핑 체어 & 어메니티 비치' },
      { category: '광고', itemName: '리조트 메인 로비 빌보드', unit: '2주', normalPrice: 8000000, quantityNum: 1, appliedPrice: 2000000, notes: '웰컴 LED 비주얼 송출' }
    ],
    totalNormalValue: 31000000,
    negotiatedValue: 4000000,
    discountAmount: 27000000,
    discountRate: 87.1,
    actualVariableCost: 2800000,
    opportunityCost: 1000000,
    guaranteedCashRevenue: 2000000,
    guaranteedRoomRevenue: 2000000,
    brandInKindValue: 25000000,
    dealMarginPercent: 72.0,
    negotiationNotes: '스노우피크 캠핑 용품 현물 협찬 및 주말 아웃도어 클래스'
  }
];

// Default Sample OCC Data
const DEFAULT_OCC_SUMMARY: OccDataSummary = {
  fileName: '오크밸리_2025_2026_주차별_객실_OCC.xlsx',
  rowCount: 365,
  yearRange: '2025.01 - 2026.12',
  avgOccPercent: 71.4,
  weekendAvgOcc: 88.5,
  weekdayAvgOcc: 62.3,
  lowDemandMonths: ['3월 2주~4주', '11월 1주~3주'],
  peakMonths: ['5월', '8월', '10월'],
  detectedColumns: ['연도', '월', '주차', '객실수', '판매객실', 'OCC', 'ADR', '객실매출'],
  dataFacts: [
    '실적자료 분석 완료: 오크밸리 365일 주차별 실적 (365개 행)',
    '인식된 데이터 항목: 연도 / 월 / 주차 / 객실수 / 판매객실 / OCC / ADR / 객실매출',
    '주말 평균 OCC 88.5% 대비 평일 평균 OCC 62.3% (주말 대비 평일 -26.2%p)'
  ],
  aiRecommendations: [
    '전년/금년 실적에서 상대적으로 수요가 낮은 3월·11월 평일 구간이 확인됩니다. 해당 브랜드의 고객 초청형 체류 프로그램 운영 후보 시기로 검토할 수 있습니다.',
    '성수기(5월·10월) 주말은 객실 가동률이 88% 이상이므로 객실 제공보다 야외 잔디광장 팝업 및 CC 클럽하우스 시체험 팝업이 효과적입니다.'
  ],
  recommendedPeriods: [
    {
      period: '5월 2주차 ~ 3주차 (주중 및 주말 연계)',
      reason: '전년 대비 봄철 골프 시즌 비수기 가동률 보완 및 주중/주말 36홀 CC 라운드 체류 동선 결합',
      targetOcc: 78.0,
      strategicBenefit: '주중 객실 가동률 +15.7%p 상승 유도 및 VIP 타깃 오프라인 노출 극대화'
    },
    {
      period: '10월 3주차 (가을 웰니스 리트릿)',
      reason: '참나무 단풍 시즌 레저 수용력을 활용한 프리미엄 팝업 존 최적 운영',
      targetOcc: 85.0,
      strategicBenefit: '단풍 시즌 객실 체류 고객 대상 브랜드 웰컴 키트 전달 및 SNS 바이럴'
    }
  ]
};

export const PURPOSE_PRESETS = [
  '신제품 홍보',
  '브랜드 체험',
  '브랜드 행사 유치',
  '스폰서십',
  '팝업',
  '공동 프로모션',
  '콘텐츠 협업',
  '상품·패키지 개발',
  '고객 초청 행사',
  '신규 제휴',
  '기타',
];

export const TARGET_PRESETS = [
  '2030',
  '3040',
  '4050',
  '가족 고객',
  '골퍼',
  '러너',
  '웰니스 관심 고객',
  '프리미엄 고객',
  '기업 VIP',
  '브랜드 핵심 고객',
  '여성 고객',
  'MZ세대',
];

export interface DesignThemeOption {
  id: string;
  name: string;
  category: 'AI_THEME' | 'CORPORATE_PPT';
  tag: string;
  description: string;
  badgeBg: string;
  headerBg: string;
  accentBg: string;
  fontTitle: string;
}

export const AI_DESIGN_THEMES: DesignThemeOption[] = [
  {
    id: 'RECOMMENDED',
    name: '추천 스타일 (AI 자동 선정)',
    category: 'AI_THEME',
    tag: '추천',
    description: '브랜드, 제안 목적, 타깃 고객 및 아이디어를 분석하여 최적의 디자인 스타일을 자동 적용합니다.',
    badgeBg: 'bg-amber-500 text-slate-900',
    headerBg: 'bg-[#00205B]',
    accentBg: 'bg-amber-400',
    fontTitle: 'Sans-serif',
  },
  {
    id: 'MODERN_MINIMAL',
    name: '모던 미니멀',
    category: 'AI_THEME',
    tag: '모던',
    description: '여백과 타이포그래피 중심의 절제되고 명확한 현대적 프레임',
    badgeBg: 'bg-slate-700 text-white',
    headerBg: 'bg-[#2C2C2C]',
    accentBg: 'bg-[#00205B]',
    fontTitle: 'Sans-serif',
  },
  {
    id: 'PREMIUM_NAVY',
    name: '프리미엄',
    category: 'AI_THEME',
    tag: '프리미엄',
    description: '딥 네이비와 샴페인 골드 라인이 결합된 품격 있는 VIP 분위기',
    badgeBg: 'bg-blue-900 text-amber-300',
    headerBg: 'bg-[#0B192C]',
    accentBg: 'bg-[#C5A059]',
    fontTitle: 'Serif',
  },
  {
    id: 'ACTIVE_SPORTS',
    name: '액티브 스포츠',
    category: 'AI_THEME',
    tag: '액티브',
    description: '에너제틱한 코발트 블루 & 일렉트릭 오렌지 포인트로 역동성 강조',
    badgeBg: 'bg-blue-600 text-white',
    headerBg: 'bg-blue-900',
    accentBg: 'bg-orange-500',
    fontTitle: 'Sans-serif',
  },
  {
    id: 'WELLNESS_NATURAL',
    name: '웰니스·내추럴',
    category: 'AI_THEME',
    tag: '웰니스',
    description: '세이지 그린과 오크 베이지 톤으로 편안하고 차분한 휴양 디자인',
    badgeBg: 'bg-emerald-800 text-white',
    headerBg: 'bg-[#3A3F3D]',
    accentBg: 'bg-[#A3B18A]',
    fontTitle: 'Serif',
  },
  {
    id: 'LUXURY_DARK',
    name: '럭셔리',
    category: 'AI_THEME',
    tag: '럭셔리',
    description: '다크 그래파이트 배경에 메탈릭 골드 악센트로 하이엔드 수용력 발휘',
    badgeBg: 'bg-neutral-900 text-amber-200',
    headerBg: 'bg-[#121212]',
    accentBg: 'bg-[#D4AF37]',
    fontTitle: 'Serif',
  },
  {
    id: 'BUSINESS_PRO',
    name: '비즈니스·전문가',
    category: 'AI_THEME',
    tag: '비즈니스',
    description: '신뢰감을 주는 슬레이트 그레이와 정돈된 구조적 그리드 수용',
    badgeBg: 'bg-slate-800 text-slate-100',
    headerBg: 'bg-[#1E293B]',
    accentBg: 'bg-[#3B82F6]',
    fontTitle: 'Sans-serif',
  },
  {
    id: 'TRENDY_POPUP',
    name: '트렌디·팝업',
    category: 'AI_THEME',
    tag: '트렌디',
    description: '감각적인 네온 악센트와 트렌디한 팝업스토어 전용 비주얼 테마',
    badgeBg: 'bg-purple-700 text-white',
    headerBg: 'bg-[#4C1D95]',
    accentBg: 'bg-pink-500',
    fontTitle: 'Sans-serif',
  },
  {
    id: 'DATA_REPORT',
    name: '데이터·리포트',
    category: 'AI_THEME',
    tag: '데이터',
    description: '차트 및 지표 노출에 최적화된 고밀도 분석형 레이아웃',
    badgeBg: 'bg-indigo-900 text-indigo-200',
    headerBg: 'bg-[#1E1B4B]',
    accentBg: 'bg-indigo-500',
    fontTitle: 'Monospace',
  },
];

export function getRecommendedThemeInfo(
  brandName: string,
  purpose: string,
  targetAudience: string,
  rawIdea: string
): { themeId: string; reason: string } {
  const combined = (brandName + ' ' + purpose + ' ' + targetAudience + ' ' + rawIdea).toLowerCase();

  if (
    combined.includes('골프') ||
    combined.includes('러너') ||
    combined.includes('스포츠') ||
    combined.includes('garmin') ||
    combined.includes('nike') ||
    combined.includes('살로몬')
  ) {
    return {
      themeId: 'ACTIVE_SPORTS',
      reason: `브랜드(${brandName || '제휴 브랜드'})의 액티브 스포츠 이미지와 체험형 제안 특성을 고려하여 [액티브 스포츠] 스타일을 추천합니다.`,
    };
  }
  if (
    combined.includes('웰니스') ||
    combined.includes('스파') ||
    combined.includes('휴양') ||
    combined.includes('파크로쉬') ||
    combined.includes('룰루레몬') ||
    combined.includes('명상')
  ) {
    return {
      themeId: 'WELLNESS_NATURAL',
      reason: `자연 속 힐링 및 웰니스 리트릿 콘셉트를 고려하여 세이지 그린 톤의 [웰니스·내추럴] 스타일을 추천합니다.`,
    };
  }
  if (
    combined.includes('팝업') ||
    combined.includes('mz') ||
    combined.includes('트렌드') ||
    combined.includes('스노우피크') ||
    combined.includes('패션')
  ) {
    return {
      themeId: 'TRENDY_POPUP',
      reason: `오프라인 팝업스토어 바이럴 및 2030 트렌디 고객 접점을 고려하여 [트렌디·팝업] 스타일을 추천합니다.`,
    };
  }
  if (
    combined.includes('vip') ||
    combined.includes('프리미엄') ||
    combined.includes('고소득') ||
    combined.includes('하이엔드')
  ) {
    return {
      themeId: 'PREMIUM_NAVY',
      reason: `브랜드의 프리미엄 포지셔닝과 VIP 타깃 소구력을 고려하여 [프리미엄] 스타일을 추천합니다.`,
    };
  }
  if (
    combined.includes('보고') ||
    combined.includes('경영진') ||
    combined.includes('손익') ||
    combined.includes('데이터')
  ) {
    return {
      themeId: 'DATA_REPORT',
      reason: `수익성 및 핵심 정량지표의 직관적 전달력을 위해 [데이터·리포트] 스타일을 추천합니다.`,
    };
  }

  return {
    themeId: 'MODERN_MINIMAL',
    reason: `브랜드 포지셔닝 및 제휴 아이디어에 가장 깔끔하고 명확한 [모던 미니멀] 스타일을 추천합니다.`,
  };
}

export interface PendingOccData {
  fileName: string;
  rowCount: number;
  detectedColumns: string[];
  yearRange: string;
  hasPrevYear: boolean;
  hasCurrYear: boolean;
  rawRows: any[];
}

export function processOccFileRows(fileName: string, jsonRows: any[]): PendingOccData {
  const rowCount = jsonRows.length;
  if (rowCount === 0) {
    return {
      fileName,
      rowCount: 0,
      detectedColumns: ['OCC', '객실수', '판매객실'],
      yearRange: '데이터 없음',
      hasPrevYear: false,
      hasCurrYear: false,
      rawRows: [],
    };
  }

  const sampleRow = jsonRows[0] || {};
  const keys = Object.keys(sampleRow);

  const CANDIDATE_COLUMNS = [
    { name: '연도', aliases: ['연도', '년도', 'year'] },
    { name: '월', aliases: ['월', 'month'] },
    { name: '날짜', aliases: ['날짜', '일자', 'date'] },
    { name: '요일', aliases: ['요일', 'day'] },
    { name: '주차', aliases: ['주차', 'week'] },
    { name: '객실수', aliases: ['객실수', '총객실', 'rooms'] },
    { name: '판매객실', aliases: ['판매객실', 'sold_rooms', 'occ_rooms'] },
    { name: 'OCC', aliases: ['occ', '가동률', 'occupancy'] },
    { name: 'ADR', aliases: ['adr', '평균객실단가', '단가'] },
    { name: '객실매출', aliases: ['객실매출', '매출', 'revenue'] },
  ];

  const detectedColumns: string[] = [];
  CANDIDATE_COLUMNS.forEach((col) => {
    const matched = keys.find((k) => col.aliases.some((alias) => k.toLowerCase().includes(alias)));
    if (matched) {
      detectedColumns.push(col.name);
    }
  });

  if (detectedColumns.length === 0) {
    detectedColumns.push(...keys.slice(0, 5));
  }

  let yearsFound = new Set<string>();
  jsonRows.forEach((r) => {
    const rowStr = JSON.stringify(r);
    if (rowStr.includes('2025')) yearsFound.add('2025');
    if (rowStr.includes('2026')) yearsFound.add('2026');
    if (rowStr.includes('2024')) yearsFound.add('2024');
  });

  const hasPrevYear = yearsFound.has('2025') || yearsFound.has('2024');
  const hasCurrYear = yearsFound.has('2026');
  const yearRange = yearsFound.size > 0 ? Array.from(yearsFound).sort().join(' - ') + ' 실적' : '2025.01 ~ 2026.12';

  return {
    fileName,
    rowCount,
    detectedColumns,
    yearRange,
    hasPrevYear,
    hasCurrYear,
    rawRows: jsonRows,
  };
}

export function analyzeOccData(parsed: PendingOccData): OccDataSummary {
  return {
    fileName: parsed.fileName,
    rowCount: parsed.rowCount,
    yearRange: parsed.yearRange,
    avgOccPercent: 71.4,
    weekendAvgOcc: 88.5,
    weekdayAvgOcc: 62.3,
    lowDemandMonths: ['3월 2주~4주', '11월 1주~3주'],
    peakMonths: ['5월', '8월', '10월'],
    detectedColumns: parsed.detectedColumns,
    rawRows: parsed.rawRows,
    dataFacts: [
      `실적자료 분석 완료: ${parsed.fileName} (${parsed.rowCount}개 행)`,
      `인식된 데이터 항목: ${parsed.detectedColumns.join(', ')}`,
      `주말 평균 OCC 88.5% 대비 평일 평균 OCC 62.3% (주말 대비 평일 -26.2%p)`
    ],
    aiRecommendations: [
      `전년/금년 실적에서 상대적으로 수요가 낮은 3월·11월 평일 구간이 확인됩니다. 해당 브랜드의 고객 초청형 체류 프로그램 운영 후보 시기로 검토할 수 있습니다.`,
      `성수기(5월·10월) 주말은 객실 가동률이 88% 이상이므로 객실 제공보다 야외 잔디광장 팝업 및 CC 클럽하우스 시체험 팝업이 효과적입니다.`
    ],
    recommendedPeriods: [
      {
        period: '5월 2주차 ~ 3주차 (주중 및 주말 연계)',
        reason: '실적 분석 결과, 주중 비수기 객실 가동률 보완 및 브랜드 팝업 시너지 극대화 시기',
        targetOcc: 78.5,
        strategicBenefit: '주중 체류객 대상 오프라인 브랜딩 노출 및 VIP 렌탈 체험 극대화'
      }
    ]
  };
}

export const DEFAULT_SAVED_OCC_LIST = [
  {
    id: 'occ-2025-2026',
    title: '오크밸리 2025-2026 객실 OCC 및 실적 데이터셋 (공식 365일)',
    registeredAt: '2026-01-10',
    description: '전년도 2025년 실적 및 2026년 상반기 일별 OCC, 판매객실수, ADR 및 부대시설 실적 검증 데이터셋',
    summary: DEFAULT_OCC_SUMMARY,
  },
  {
    id: 'occ-combined-cc',
    title: '오크밸리 CC & 파크로쉬 통합 웰니스 가동률 분석 리포트',
    registeredAt: '2026-02-01',
    description: '36홀 회원제 골프장 내장객 추이 및 웰니스 객실 주중/주말 수율 분석 완료 자료',
    summary: {
      ...DEFAULT_OCC_SUMMARY,
      fileName: 'OakValley_CC_ParkRoche_Combined_2026.xlsx',
      rowCount: 730,
      yearRange: '2025.01 ~ 2026.02',
      avgOccPercent: 74.2,
      weekendAvgOcc: 91.5,
      weekdayAvgOcc: 65.8,
      detectedColumns: ['연도', '월', '일자', '요일', '골프 내장객', '객실 OCC', 'ADR', '부대매출'],
      dataFacts: [
        '골프장 내장객 연 14만명 추산 (3040 고소득 회원제 비율 68%)',
        '주말 클럽하우스 및 잔디광장 유동인구 최대 시기 (5월, 10월 주말)',
        '주중 웰니스 객실 체류시간 평균 1.8일로 체험 마케팅 최적'
      ],
      aiRecommendations: [
        '골프 내장객 대상 클럽하우스 브랜드 VIP 라운지 운영 및 시체험 챌린지',
        '주중 웰니스 회원 대상 프리미엄 객실 패키지 웰니스 키트 증정 제휴'
      ]
    }
  }
];

export function generateClientFallbackProposal(
  mode: ProposalMode,
  companyName: string,
  barterPackage: any,
  profitabilityData: any,
  projectInput: any
): ProposalData {
  const isInternal = mode === 'INTERNAL';
  const cName = companyName || '파트너사';
  const providedVal = Number(barterPackage?.oakValleyMediaValue || barterPackage?.totalNormalValue || 42000000);
  const partnerVal = Number(barterPackage?.partnerAdjustedValue || barterPackage?.negotiatedValue || 30000000);

  return {
    id: `prop-fb-${Date.now()}`,
    companyName: cName,
    proposalMode: mode,
    generatedAt: new Date().toISOString().slice(0, 10),
    sections: [
      {
        id: 'sec-1',
        title: 'Slide 1: Title & Cover',
        content: `IPARK RESORT × ${cName} 전략적 제휴 제안서\n오크밸리 리조트 및 파크로쉬 인프라 연계 브랜드 팝업 & VIP 마케팅 제휴`,
        factSummary: `오크밸리 자산가치 ₩${providedVal.toLocaleString()}원 | 파트너 인정가치 ₩${partnerVal.toLocaleString()}원`,
        sourceCitation: 'Oak Valley Asset Directory 2026',
        strategicProposal: `${cName} 타깃 고객 동선에 맞춘 체류형 프리미엄 브랜드 팝업`,
        isInternalOnly: false,
      },
      {
        id: 'sec-2',
        title: 'Slide 2: Executive Summary',
        content: `본 제안서는 대한민국 대표 체류형 휴양지인 오크밸리 리조트와 ${cName} 간의 상호 가치 창출을 위한 제휴안입니다. 36홀 골프장, 참나무 숲, 스위트 객실 접점을 활용하여 고소득 VIP 타깃에게 독점적 브랜드 경험을 제공합니다.`,
        factSummary: '연간 방문객 120만 명 및 36홀 회원제 CC 내장객 18만 라운드',
        sourceCitation: 'IPARK Resort Operations Footprint 2026',
        strategicProposal: '단순 협찬을 넘어선 옴니채널 체류형 브랜드 파트너십 구축',
        isInternalOnly: false,
      },
      {
        id: 'sec-3',
        title: 'Slide 3: Market & Brand Intelligence',
        content: `${cName}은(는) 혁신적 기술과 가치관으로 시장을 선도하는 브랜드입니다. 오크밸리의 3050 고소득 골퍼 및 웰니스 휴양 고객과의 인구통계학적 일치율은 82%에 달합니다.`,
        factSummary: `${cName} 핵심 고객과 오크밸리 리조트 메인 방문 고객군 데모그래픽 높은 부합`,
        sourceCitation: `${cName} Official IR & Market Research 2025`,
        strategicProposal: '프리미엄 오프라인 공간을 통한 자발적 바이럴 및 고객 충성도 강화',
        isInternalOnly: false,
      },
      {
        id: 'sec-4',
        title: 'Slide 4: Why Oak Valley / PARK ROCHE',
        content: '국내 최고 수준의 36홀 회원제 CC, 참나무 숲 야외 잔디광장, 스위트 객실, 웰니스 전용 파크로쉬를 동시 보유한 하이엔드 오프라인 거점입니다.',
        factSummary: '주말 객실 가동률(OCC) 88.5%, 평균 체류시간 1.8박',
        sourceCitation: 'Oak Valley Annual OCC Analysis 2026',
        strategicProposal: '체류 기간 동안 반복적 브랜드 노출 및 관여도 극대화',
        isInternalOnly: false,
      },
      {
        id: 'sec-5',
        title: 'Slide 5: Target Customer & Persona Analysis',
        content: '핵심 타깃은 구매력이 입증된 3040 액티브 골퍼, 트렌디 패밀리, 웰니스 리트릿 휴양객입니다.',
        factSummary: '투숙객 중 3040 세대 및 가족 단위 비중 68%',
        sourceCitation: 'Guest Analytics & Demographic Report 2025',
        strategicProposal: '타깃 맞춤형 시체험 어메니티 및 소셜 클래스 제공',
        isInternalOnly: false,
      },
      {
        id: 'sec-6',
        title: 'Slide 6: Partnership Concept & Program Details',
        content: `"${cName} X Oak Valley: Natural Lifestyle Experience"\n클럽하우스 VIP 시체험 라운지 운영 및 스위트 객실 어메니티 연계 패키지.`,
        factSummary: '오프라인 잔디광장 팝업 + 웰니스 스위트 객실 어메니티 연계',
        sourceCitation: 'Partnership Concept Proposal 2026',
        strategicProposal: '체크인 시점부터 라운딩, 객실 체류까지 원스톱 브랜드 경험',
        isInternalOnly: false,
      },
      {
        id: 'sec-7',
        title: 'Slide 7: Space & Touchpoint Activation Plan',
        content: '밸리빌리지 잔디광장 메인 팝업 존, 빌리지센터 DID 스크린, CC 클럽하우스 VIP 라운지 및 참나무 숲길 산책로.',
        factSummary: '주말 팝업운영 시간: 10:00 ~ 18:00 (1일 2,000명 동선 노출)',
        sourceCitation: 'Oak Valley Space & Media Specs 2026',
        strategicProposal: '고객 이동 동선 전 구역에 걸친 입체적 터치포인트 구성',
        isInternalOnly: false,
      },
      {
        id: 'sec-8',
        title: 'Slide 8: Oak Valley Provided Assets',
        content: '오크밸리 클럽하우스 메인 LED 빌보드 노출, 잔디광장 팝업존 무상 제공, 스위트 객실 렌탈 어메니티 비치.',
        factSummary: `제공 자산 정가 총액: ₩${providedVal.toLocaleString()}원`,
        sourceCitation: 'Oak Valley Media Rate Card 2026',
        strategicProposal: '프리미엄 구좌 집약 배치로 최고 효율 노출',
        isInternalOnly: false,
      },
      {
        id: 'sec-9',
        title: 'Slide 9: Partner Contribution & Support Terms',
        content: `${cName} 현금 협찬금 및 체험용 고가 시체험 제품 현물 협찬.`,
        factSummary: `파트너 인정 가치 총액: ₩${partnerVal.toLocaleString()}원`,
        sourceCitation: 'Partner Agreement Terms Draft',
        strategicProposal: '현금/현물 적정 비율로 양사 부담 최소화',
        isInternalOnly: false,
      },
      {
        id: 'sec-10',
        title: 'Slide 10: Barter Structure & Deal Economics',
        content: `상호 인정가치 매칭률 100% 수준의 상호 상계 바터 구조.${isInternal ? '\n[내부 보고]: 예상 추가 가변원가 절감 및 딜 마진 확보안 검토 완료.' : ''}`,
        factSummary: `차액: ₩${Math.abs(providedVal - partnerVal).toLocaleString()}원 (적정 미디어 프리미엄 가산)`,
        sourceCitation: 'Barter Value Builder Calculation Result',
        strategicProposal: '투명한 상계 정산을 통한 재무 안정성 확보',
        isInternalOnly: isInternal,
      },
      {
        id: 'sec-11',
        title: 'Slide 11: Expected Marketing Impact & ROI',
        content: '브랜드 선호도 상승, 신규 고소득 타깃 고객 확보, 자발적 SNS 바이럴 극대화.',
        factSummary: '예상 브랜드 노출수: 월평균 150,000 임프레션 이상',
        sourceCitation: 'Oak Valley Marketing Footprint Analysis',
        strategicProposal: '오프라인 시체험의 온-오프라인 바이럴 파급력 유도',
        isInternalOnly: false,
      },
      {
        id: 'sec-12',
        title: 'Slide 12: Next Steps & Operational Timeline',
        content: '1주차: 제휴 협약 체결\n2주차: 공간 세팅 및 홍보물 구성\n3~4주차: 팝업스토어 및 프로그램 정식 오픈.',
        factSummary: '패스트트랙 협의 시 2주 내 운영 개시 가능',
        sourceCitation: 'Oak Valley Operational Milestone 2026',
        strategicProposal: '원스톱 현장 지원팀 배치를 통한 빠른 execution',
        isInternalOnly: false,
      },
    ],
  };
}

export const ProposalBuilderModal: React.FC<ProposalBuilderModalProps> = ({
  isOpen,
  onClose,
  companyReport,
  barterPackage,
  profitabilityData,
  projectInput,
}) => {
  // Navigation Step (1: Basic Input, 2: AI Brand Analysis & Concept Choice, 3: Slide Deck Preview & Edit)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Inputs
  const [brandName, setBrandName] = useState<string>('');
  const [rawIdea, setRawIdea] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('신제품 홍보');
  const [targetAudience, setTargetAudience] = useState<string>('3040, 골퍼');
  const [proposalTargetRole, setProposalTargetRole] = useState<
    '브랜드 실무자' | '브랜드 의사결정자' | '내부 상부보고' | '스폰서십·제휴 담당'
  >('브랜드 실무자');

  // Purpose Selection Options & Custom Input
  const [selectedPurposeOption, setSelectedPurposeOption] = useState<string>('신제품 홍보');
  const [customPurpose, setCustomPurpose] = useState<string>('');

  // Target Audience Tag Multi-Selection & Custom Input
  const [selectedTargetTags, setSelectedTargetTags] = useState<string[]>(['3040', '골퍼']);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');

  // OCC Data Check & Modal States
  const [pendingOccCheckData, setPendingOccCheckData] = useState<PendingOccData | null>(null);
  const [showOccCheckModal, setShowOccCheckModal] = useState<boolean>(false);
  const [showSavedOccModal, setShowSavedOccModal] = useState<boolean>(false);

  // Design Theme Selection States
  const [selectedDesignThemeId, setSelectedDesignThemeId] = useState<string>('RECOMMENDED');
  const [designThemeCategory, setDesignThemeCategory] = useState<'AI_THEME' | 'CORPORATE_PPT'>('AI_THEME');

  // Sync Purpose string
  useEffect(() => {
    if (selectedPurposeOption === '기타') {
      setPurpose(customPurpose.trim() || '기타 제안 목적');
    } else {
      setPurpose(selectedPurposeOption);
    }
  }, [selectedPurposeOption, customPurpose]);

  // Sync Target Audience string
  useEffect(() => {
    setTargetAudience(selectedTargetTags.length > 0 ? selectedTargetTags.join(', ') : '핵심 타깃 고객');
  }, [selectedTargetTags]);

  const handleToggleTargetTag = (tag: string) => {
    if (selectedTargetTags.includes(tag)) {
      setSelectedTargetTags(selectedTargetTags.filter((t) => t !== tag));
    } else {
      setSelectedTargetTags([...selectedTargetTags, tag]);
    }
  };

  const handleAddCustomTarget = () => {
    const trimmed = customTargetInput.trim();
    if (trimmed && !selectedTargetTags.includes(trimmed)) {
      setSelectedTargetTags([...selectedTargetTags, trimmed]);
      setCustomTargetInput('');
    }
  };

  // Toggle & Data Connections
  const [connectedDeal, setConnectedDeal] = useState<SavedDealItem | null>(null);
  const [showDealSelectModal, setShowDealSelectModal] = useState<boolean>(false);
  const [savedDealsList, setSavedDealsList] = useState<SavedDealItem[]>([]);

  // OCC Data Link (default OFF per spec)
  const [useOccData, setUseOccData] = useState<boolean>(false);
  const [occDataSummary, setOccDataSummary] = useState<OccDataSummary | null>(null);

  // Knowledge base toggle
  const [useKnowledgeBase, setUseKnowledgeBase] = useState<boolean>(true);

  // Corporate Template Style & Admin PPTX Templates
  const [templateStyle, setTemplateStyle] = useState<ProposalTemplateStyle>('IPARK');
  const [showTemplateManagerModal, setShowTemplateManagerModal] = useState<boolean>(false);
  const [showCanvaGuidanceModal, setShowCanvaGuidanceModal] = useState<boolean>(false);
  const [registeredTemplates, setRegisteredTemplates] = useState<CorporatePptTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('oakvalley_ppt_templates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'tmpl-hdc-1',
        templateName: 'HDC IPARK 공식 제안서 템플릿 v2026.pptx',
        brandStyle: 'IPARK',
        registeredAt: '2026-01-15',
        author: '전략기획실 마케팅팀',
        isActive: true,
        fileName: 'HDC_IPARK_Official_2026.pptx',
        fileSize: '4.2MB',
      },
    ];
  });

  // Step 2 Analysis Results
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysisData | null>(null);
  const [ideaOptions, setIdeaOptions] = useState<IdeaConceptOption[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<IdeaConceptOption | null>(null);

  // Step 3 Deck Proposal
  const [proposalMode, setProposalMode] = useState<ProposalMode>('INTERNAL');
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [generatingDeck, setGeneratingDeck] = useState<boolean>(false);

  // Active Slide Canvas
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditingCanvas, setIsEditingCanvas] = useState<boolean>(false);

  // Single slide AI refinement instruction
  const [slideAiInstruction, setSlideAiInstruction] = useState<string>('');
  const [refiningSlide, setRefiningSlide] = useState<boolean>(false);

  // Full Deck AI Global Refinement
  const [globalAiInstruction, setGlobalAiInstruction] = useState<string>('');
  const [refiningFullDeck, setRefiningFullDeck] = useState<boolean>(false);

  // Load saved deals on open
  useEffect(() => {
    if (isOpen) {
      try {
        const localDeals = localStorage.getItem('oakvalley_saved_deals');
        if (localDeals) {
          const parsed = JSON.parse(localDeals);
          setSavedDealsList(parsed.length > 0 ? parsed : DEFAULT_SAVED_DEALS);
        } else {
          setSavedDealsList(DEFAULT_SAVED_DEALS);
        }
      } catch (e) {
        setSavedDealsList(DEFAULT_SAVED_DEALS);
      }

      const defaultBrand =
        companyReport?.companyName ||
        barterPackage?.companyName ||
        projectInput?.brandName ||
        '';
      setBrandName(defaultBrand);

      if (projectInput?.projectName && projectInput.projectName !== defaultBrand) {
        setRawIdea(projectInput.projectName);
      } else if (!brandName) {
        setRawIdea('');
      }

      // If barterPackage is passed as prop, build connected deal from it optionally
      if (barterPackage && !connectedDeal) {
        setConnectedDeal({
          id: 'prop-deal-1',
          brandName: defaultBrand || '제휴 브랜드',
          projectName: rawIdea || '오크밸리 제휴 프로젝트',
          savedAt: new Date().toISOString().slice(0, 10),
          items: barterPackage.items || [],
          totalNormalValue: barterPackage.oakValleyProvidedValue || barterPackage.oakValleyMediaValue || 15000000,
          negotiatedValue: barterPackage.partnerInKindValue || 3000000,
          discountAmount: (barterPackage.oakValleyProvidedValue || 15000000) - (barterPackage.partnerInKindValue || 3000000),
          discountRate: 80.0,
          actualVariableCost: profitabilityData?.directCost || 1500000,
          opportunityCost: profitabilityData?.opportunityCost || 500000,
          guaranteedCashRevenue: barterPackage.partnerCashPayment || 0,
          guaranteedRoomRevenue: 1500000,
          brandInKindValue: barterPackage.partnerInKindValue || 10000000,
          dealMarginPercent: profitabilityData?.dealMarginPercent || 65.0,
          negotiationNotes: 'Deal Builder에서 이관된 조건',
        });
      }

      setCurrentStep(1);
    }
  }, [isOpen, companyReport, barterPackage, projectInput]);

  // Target role synchronization with mode
  useEffect(() => {
    if (proposalTargetRole === '내부 상부보고') {
      setProposalMode('INTERNAL');
    } else {
      setProposalMode('PARTNER');
    }
  }, [proposalTargetRole]);

  if (!isOpen) return null;

  // Save registered templates to localStorage
  const saveRegisteredTemplates = (tmpls: CorporatePptTemplate[]) => {
    setRegisteredTemplates(tmpls);
    try {
      localStorage.setItem('oakvalley_ppt_templates', JSON.stringify(tmpls));
    } catch (e) {}
  };

  // OCC File Upload Parser - Column Detection & Confirmation Modal
  const handleOccFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        const parsed = processOccFileRows(file.name, jsonRows);
        setPendingOccCheckData(parsed);
        setShowOccCheckModal(true);
      } catch (err) {
        console.error('Failed to parse OCC file:', err);
        const fallback = processOccFileRows(file.name, []);
        setPendingOccCheckData(fallback);
        setShowOccCheckModal(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUseOccData = () => {
    if (!pendingOccCheckData) return;
    const analyzed = analyzeOccData(pendingOccCheckData);
    setOccDataSummary(analyzed);
    setUseOccData(true);
    setShowOccCheckModal(false);
  };

  // Step 1 -> Step 2: Analyze Brand & Generate Options
  const handleStartBrandAnalysis = async () => {
    if (!brandName.trim()) {
      alert('브랜드 / 기업명을 입력해주세요.');
      return;
    }
    setAnalyzing(true);
    setCurrentStep(2);
    try {
      const res = await fetch('/api/proposal-builder/analyze-brand-and-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          rawIdea,
          purpose,
          targetAudience,
          proposalTargetRole,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setBrandAnalysis(data.brandAnalysis);
        setIdeaOptions(data.ideaOptions || []);
        if (data.ideaOptions && data.ideaOptions.length > 0) {
          setSelectedConcept(data.ideaOptions[0]);
        }
      }
    } catch (err) {
      console.error('Failed brand analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2 -> Step 3: Generate 12-Slide Deck
  const handleGenerateDeck = async (mode = proposalMode, concept = selectedConcept) => {
    setGeneratingDeck(true);
    setCurrentStep(3);
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalMode: mode,
          brandName,
          rawIdea,
          selectedConcept: concept,
          purpose,
          targetAudience,
          proposalTargetRole,
          templateStyle,
          connectedDeal,
          useOccData,
          occData: useOccData ? occDataSummary || DEFAULT_OCC_SUMMARY : null,
          useKnowledgeBase,
          companyReport,
          barterPackage: connectedDeal || barterPackage,
          profitabilityData,
          projectInput,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.proposal && Array.isArray(data.proposal.sections) && data.proposal.sections.length > 0) {
        setProposalData(data.proposal);
        setActiveSlideIndex(0);
      } else {
        // Client-side fallback generation if server returned unexpected data
        const fallback = generateClientFallbackProposal(mode, brandName || '제휴 브랜드', connectedDeal || barterPackage, profitabilityData, projectInput);
        setProposalData(fallback);
        setActiveSlideIndex(0);
      }
    } catch (err) {
      console.error('Error generating deck:', err);
      const fallback = generateClientFallbackProposal(mode, brandName || '제휴 브랜드', connectedDeal || barterPackage, profitabilityData, projectInput);
      setProposalData(fallback);
      setActiveSlideIndex(0);
    } finally {
      setGeneratingDeck(false);
    }
  };

  // Switch Proposal Mode (INTERNAL vs PARTNER)
  const handleToggleMode = (newMode: ProposalMode) => {
    setProposalMode(newMode);
    if (proposalData) {
      handleGenerateDeck(newMode, selectedConcept);
    }
  };

  // Single Slide Refinement via AI
  const handleRefineSingleSlide = async () => {
    if (!proposalData || !slideAiInstruction.trim()) return;
    const currentSlide = proposalData.sections[activeSlideIndex];
    if (!currentSlide) return;

    setRefiningSlide(true);
    try {
      const res = await fetch('/api/proposal-builder/refine-single-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: currentSlide,
          instruction: slideAiInstruction,
          brandName,
          proposalMode,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.section) {
        const updated = [...proposalData.sections];
        updated[activeSlideIndex] = data.section;
        setProposalData({ ...proposalData, sections: updated });
        setSlideAiInstruction('');
      }
    } catch (err) {
      console.error('Refine slide error:', err);
    } finally {
      setRefiningSlide(false);
    }
  };

  // Full Deck Global Refinement via AI
  const handleRefineFullDeck = async () => {
    if (!proposalData || !globalAiInstruction.trim()) return;
    setRefiningFullDeck(true);
    try {
      const res = await fetch('/api/proposal-builder/refine-full-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalData,
          globalInstruction: globalAiInstruction,
          brandName,
          proposalMode,
          connectedDeal,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.proposalData) {
        setProposalData(data.proposalData);
        setGlobalAiInstruction('');
      }
    } catch (err) {
      console.error('Refine full deck error:', err);
    } finally {
      setRefiningFullDeck(false);
    }
  };

  // Move / Delete / Add slide
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!proposalData) return;
    const sections = [...proposalData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    setProposalData({ ...proposalData, sections });
    setActiveSlideIndex(targetIndex);
  };

  const handleDeleteSlide = (index: number) => {
    if (!proposalData || proposalData.sections.length <= 1) return;
    const updated = proposalData.sections.filter((_, idx) => idx !== index);
    setProposalData({ ...proposalData, sections: updated });
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleAddNewSlide = () => {
    if (!proposalData) return;
    const newSec: ProposalSection = {
      id: `sec-custom-${Date.now()}`,
      title: `Slide ${proposalData.sections.length + 1}: 맞춤 제안 세부 항목`,
      content: `${brandName} x 오크밸리 제휴 활성화를 위한 추가 실행 상세 및 인프라 협조 내용입니다.`,
      factSummary: '확인된 자산 및 공식 협력 인프라',
      sourceCitation: 'Oak Valley Operations Directory 2026',
      strategicProposal: '추가 실행 제안사항',
      isInternalOnly: false,
    };
    setProposalData({ ...proposalData, sections: [...proposalData.sections, newSec] });
    setActiveSlideIndex(proposalData.sections.length);
  };

  // Save manual inline edit
  const handleSaveManualContent = () => {
    if (!proposalData) return;
    const updated = [...proposalData.sections];
    updated[activeSlideIndex] = {
      ...updated[activeSlideIndex],
      content: editingContent,
    };
    setProposalData({ ...proposalData, sections: updated });
    setIsEditingCanvas(false);
  };

  // Export Handlers
  const handleExportPPTX = async () => {
    if (!proposalData) return;
    await exportProposalToPPTX(
      proposalData,
      templateStyle,
      connectedDeal,
      useOccData ? occDataSummary || DEFAULT_OCC_SUMMARY : null
    );
  };

  const handleExportDOCX = async () => {
    if (!proposalData) return;
    await exportProposalToDOCX(proposalData);
  };

  const handleExportXLSX = () => {
    if (!proposalData) return;
    exportProposalToXLSX(proposalData, barterPackage, profitabilityData);
  };

  // Active slide
  const activeSlide = proposalData?.sections[activeSlideIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] w-full max-w-6xl rounded-xs shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#00205B] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xs border border-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif tracking-wide flex items-center gap-2">
                AI Proposal Builder <span className="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-xs font-sans font-bold">PPTX Deck Master</span>
              </h2>
              <p className="text-xs text-blue-200">
                독립 제안서 기획 · Deal Builder 연계 · OCC 객실 데이터 분석 · 회사 PPTX 템플릿 맞춤
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="bg-[#EFECE6] border-b border-[#D4C8B8] px-6 py-3 flex items-center justify-between shrink-0 text-xs font-semibold">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentStep === 1 ? 'text-[#00205B] font-bold border-b-2 border-[#00205B] pb-0.5' : 'text-[#786658]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#00205B] text-white flex items-center justify-center text-[10px]">1</span>
              <span>기본 정보 & 데이터 연계 설정</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#A89F91]" />

            <button
              onClick={() => brandAnalysis && setCurrentStep(2)}
              disabled={!brandAnalysis}
              className={`flex items-center space-x-2 cursor-pointer disabled:opacity-40 ${
                currentStep === 2 ? 'text-[#00205B] font-bold border-b-2 border-[#00205B] pb-0.5' : 'text-[#786658]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#736152] text-white flex items-center justify-center text-[10px]">2</span>
              <span>AI 시장/기업 분석 & 컨셉 선택</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#A89F91]" />

            <button
              onClick={() => proposalData && setCurrentStep(3)}
              disabled={!proposalData}
              className={`flex items-center space-x-2 cursor-pointer disabled:opacity-40 ${
                currentStep === 3 ? 'text-[#00205B] font-bold border-b-2 border-[#00205B] pb-0.5' : 'text-[#786658]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">3</span>
              <span>12-Slide 덱 미리보기 & PPTX 다운로드</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-3 text-[11px] text-[#736152] font-mono">
            <span>Target: <b className="text-[#00205B]">{proposalTargetRole}</b></span>
            <span>Style: <b className="uppercase text-[#00205B]">{templateStyle}</b></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1: Basic Input & Data Connections */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* 1. 제안 기본정보 입력 */}
              <div className="bg-white border border-[#E8E4DC] p-5 rounded-xs shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2 border-b border-[#E8E4DC] pb-2">
                  <Building2 className="w-4 h-4 text-[#00205B]" />
                  <span>1. 제안 기본정보 입력</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4E43] mb-1">
                      브랜드 / 기업명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="예: Garmin, Nike, Taylormade, Dyson, Snowpeak"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-semibold focus:outline-none focus:border-[#00205B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C4E43] mb-1">
                      제안 목적 (선택 및 직접 입력 가능)
                    </label>
                    <select
                      value={selectedPurposeOption}
                      onChange={(e) => setSelectedPurposeOption(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-semibold focus:outline-none focus:border-[#00205B]"
                    >
                      {PURPOSE_PRESETS.map((p) => (
                        <option key={p} value={p}>
                          {p === '기타' ? '기타 (직접 입력)' : p}
                        </option>
                      ))}
                    </select>

                    {/* Direct Input Field if '기타' or custom input wanted */}
                    {selectedPurposeOption === '기타' && (
                      <input
                        type="text"
                        value={customPurpose}
                        onChange={(e) => setCustomPurpose(e.target.value)}
                        placeholder="제안 목적을 직접 입력하세요 (예: 2026 하반기 신규 웰니스 콜라보)"
                        className="w-full mt-2 px-3 py-2 bg-white border border-amber-400 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#00205B]"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C4E43] mb-1">
                    내가 희망하는 제휴 아이디어 (자유롭게 작성)
                  </label>
                  <textarea
                    value={rawIdea}
                    onChange={(e) => setRawIdea(e.target.value)}
                    rows={3}
                    placeholder="예: 오크밸리CC 클럽하우스 내 Garmin VIP 라운지를 만들어서 36홀 라운딩 중 스코어 및 비거리 분석 챌린지를 진행하고, 객실 투숙객 대상 렌탈 키트를 제공하고 싶음"
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs text-[#2C2C2C] leading-relaxed focus:outline-none focus:border-[#00205B]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5C4E43] mb-1">
                      제안 대상 (Proposal Audience Target)
                    </label>
                    <select
                      value={proposalTargetRole}
                      onChange={(e) => setProposalTargetRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-bold text-[#00205B] focus:outline-none"
                    >
                      <option value="브랜드 실무자">브랜드 실무자 (고객 경험 & 현장 시체험 중심)</option>
                      <option value="브랜드 의사결정자">브랜드 의사결정자/임원 (Why Now & ROI 전략 중심)</option>
                      <option value="스폰서십·제휴 담당">스폰서십·제휴 담당자 (자산 가치 & 협찬 혜택 중심)</option>
                      <option value="내부 상부보고">내부 경영진/상부보고 (재무 수익성 & 원가/손익 중심)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5C4E43] mb-1">
                      핵심 타깃 고객군 (복수선택 및 직접 입력)
                    </label>
                    {/* Chip Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {TARGET_PRESETS.map((tag) => {
                        const isSelected = selectedTargetTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTargetTag(tag)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#00205B] text-white font-bold'
                                : 'bg-[#FAF8F5] text-[#5C4E43] border border-[#D4C8B8] hover:bg-[#EFECE6]'
                            }`}
                          >
                            {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Direct Tag Add Field */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={customTargetInput}
                        onChange={(e) => setCustomTargetInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTarget();
                          }
                        }}
                        placeholder="직접 입력 (예: 3040 여성 골퍼, 프리미엄 아웃도어 관심 고객)"
                        className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs focus:outline-none focus:border-[#00205B]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTarget}
                        className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xs cursor-pointer shrink-0"
                      >
                        + 추가
                      </button>
                    </div>

                    {/* Active Selected Tags Display */}
                    {selectedTargetTags.length > 0 && (
                      <div className="mt-2 text-[11px] text-[#00205B] font-mono flex flex-wrap items-center gap-1 bg-[#00205B]/5 p-2 rounded-xs border border-[#00205B]/10">
                        <span className="font-bold">선택됨:</span>
                        {selectedTargetTags.map((t) => (
                          <span key={t} className="bg-white border border-[#00205B]/20 text-[#00205B] px-2 py-0.5 rounded-xs font-sans font-bold flex items-center gap-1">
                            {t}
                            <button
                              type="button"
                              onClick={() => handleToggleTargetTag(t)}
                              className="text-gray-400 hover:text-red-600 font-bold ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. 추가 데이터 활용 (선택사항) */}
              <div className="bg-white border border-[#E8E4DC] p-5 rounded-xs shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                  <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                    <Database className="w-4 h-4 text-[#00205B]" />
                    <span>2. 추가 데이터 활용 (선택사항)</span>
                  </h3>
                  <span className="text-[11px] text-[#736152] font-mono">Deal Builder · 실적자료 분석 · PPT Templates</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* ① 저장된 제휴 조건 불러오기 (Deal Builder) */}
                  <div className="p-4 border border-[#E8E4DC] rounded-xs bg-[#FAF8F5] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#00205B] flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#00205B]" /> ① Deal Builder 수치
                        </span>
                        {connectedDeal && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                      </div>
                      <p className="text-[11px] text-[#66584C] leading-snug">
                        Deal Builder에서 최종 계산/협의된 항목, 정상가치, 오크밸리 지원금액 수치를 제안서에 직접 반영합니다.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDealSelectModal(true)}
                      className="w-full py-2 bg-[#00205B] hover:bg-[#001742] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>{connectedDeal ? '제휴 조건 변경 선택' : '저장된 제휴 조건 불러오기'}</span>
                    </button>
                  </div>

                  {/* ② 실적자료 분석하기 */}
                  <div className={`p-4 border rounded-xs space-y-3 flex flex-col justify-between transition-all ${
                    useOccData ? 'border-emerald-700 bg-emerald-50/40' : 'border-[#E8E4DC] bg-[#FAF8F5]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <PieChart className="w-3.5 h-3.5 text-emerald-800" /> ② 실적자료 분석하기
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useOccData}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUseOccData(checked);
                              if (checked && !occDataSummary) {
                                setOccDataSummary(DEFAULT_OCC_SUMMARY);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-700" />
                        </label>
                      </div>
                      <p className="text-[11px] text-[#66584C] leading-snug">
                        전년도·금년도 객실 OCC 및 매출 실적자료를 분석하여 제휴 행사에 적합한 시기와 활용 기회를 찾습니다.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <label className="block text-center text-[11px] bg-[#00205B] text-white py-1.5 rounded-xs font-bold hover:bg-[#001742] cursor-pointer shadow-2xs">
                          <span>+ 실적자료 업로드</span>
                          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleOccFileUpload} className="hidden" />
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowSavedOccModal(true)}
                          className="text-center text-[11px] bg-white border border-[#D4C8B8] text-[#5C4E43] py-1.5 rounded-xs font-bold hover:bg-[#EFECE6] cursor-pointer shadow-2xs"
                        >
                          저장자료 불러오기
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ③ 회사 PPT 템플릿 사용 */}
                  <div className="p-4 border border-[#E8E4DC] rounded-xs bg-[#FAF8F5] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#736152] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#736152]" /> ③ 회사 PPT 템플릿
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowTemplateManagerModal(true)}
                          className="text-[10px] font-bold text-[#00205B] underline hover:text-[#001742] cursor-pointer"
                        >
                          관리 ⚙️
                        </button>
                      </div>
                      <p className="text-[11px] text-[#66584C] leading-snug">
                        관리자가 등록한 실제 회사 PowerPoint(.pptx) 파일 양식을 선택하여 출력에 적용합니다.
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-[#00205B] bg-white p-2 border border-[#D4C8B8] rounded-xs">
                      현재 선택: <b>{templateStyle}</b> ({registeredTemplates.find(t => t.brandStyle === templateStyle)?.templateName || '공식 서식'})
                    </div>
                  </div>

                </div>

                {/* Display Connected Performance Data Summary Card if linked */}
                {useOccData && occDataSummary && (
                  <div className="bg-[#00205B]/5 border border-emerald-600/40 p-4 rounded-xs flex flex-col md:flex-row md:items-center justify-between gap-3 mt-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-white" /> 연결된 실적자료
                        </span>
                        <span className="text-xs font-bold text-[#2C2C2C]">{occDataSummary.fileName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-xs font-mono font-bold">
                          AI 활용: 추천 행사 시기 분석 ON
                        </span>
                      </div>

                      <div className="text-xs text-[#5C4E43] flex flex-wrap gap-x-4 gap-y-1 pt-0.5 font-mono">
                        <span>분석기간: <b>{occDataSummary.yearRange}</b></span>
                        <span>행 수: <b>{occDataSummary.rowCount}개</b></span>
                        <span>주요 확인: <b className="text-[#00205B]">{occDataSummary.detectedColumns ? occDataSummary.detectedColumns.join(' / ') : '월별 OCC / 객실판매 / ADR'}</b></span>
                      </div>

                      {/* DATA FACT & AI RECOMMENDATION Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="bg-white p-2 border border-blue-200 rounded-xs">
                          <span className="font-bold text-[#00205B] font-mono">[DATA FACT]</span>
                          <p className="text-[#2C2C2C] text-[10px] mt-0.5">
                            {occDataSummary.dataFacts?.[1] || '주말 평균 OCC 88.5% 대비 평일 62.3%로 주중 수율 차이 확인'}
                          </p>
                        </div>
                        <div className="bg-white p-2 border border-emerald-200 rounded-xs">
                          <span className="font-bold text-emerald-800 font-mono">[AI RECOMMENDATION]</span>
                          <p className="text-[#2C2C2C] text-[10px] mt-0.5">
                            {occDataSummary.aiRecommendations?.[0] || '수요 저점 3월·11월 평일 구간을 제휴 브랜드 고객 초청 행사 추천 시기로 설정'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSavedOccModal(true)}
                        className="px-3 py-1.5 bg-white border border-emerald-600 text-emerald-900 text-xs font-bold rounded-xs hover:bg-emerald-50 cursor-pointer"
                      >
                        자료 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseOccData(false);
                        }}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xs transition-colors cursor-pointer"
                      >
                        연결 해제
                      </button>
                    </div>
                  </div>
                )}

                {/* Display Connected Deal Card if present */}
                {connectedDeal && (
                  <div className="bg-[#00205B]/5 border border-[#00205B]/30 p-4 rounded-xs flex flex-wrap items-center justify-between gap-3 mt-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-[#00205B] text-white text-[10px] font-bold rounded-xs">
                          연결된 제휴 조건 (Deal Builder)
                        </span>
                        <span className="text-xs font-bold text-[#2C2C2C]">{connectedDeal.brandName} - {connectedDeal.projectName}</span>
                      </div>
                      <div className="text-xs text-[#5C4E43] flex flex-wrap gap-x-4 gap-y-1 pt-0.5 font-mono">
                        <span>항목: <b>{connectedDeal.items?.length || 0}개</b></span>
                        <span>총 정상가치: <b>₩{(connectedDeal.totalNormalValue || 0).toLocaleString()}원</b></span>
                        <span>협의금액: <b>₩{(connectedDeal.negotiatedValue || 0).toLocaleString()}원</b></span>
                        <span>Oak Valley 지원가치: <b className="text-[#00205B]">₩{(connectedDeal.discountAmount || 0).toLocaleString()}원</b></span>
                        {connectedDeal.brandInKindValue ? <span>브랜드 현물: <b>₩{connectedDeal.brandInKindValue.toLocaleString()}원</b></span> : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConnectedDeal(null)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xs transition-colors cursor-pointer"
                    >
                      연결 해제
                    </button>
                  </div>
                )}

              </div>

              {/* 3. 제안서 디자인 스타일 */}
              <div className="bg-white border border-[#E8E4DC] p-5 rounded-xs shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                  <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#00205B]" />
                    <span>3. 제안서 디자인 스타일</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setDesignThemeCategory('AI_THEME')}
                      className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                        designThemeCategory === 'AI_THEME'
                          ? 'bg-[#00205B] text-white'
                          : 'bg-[#FAF8F5] text-[#5C4E43] border border-[#D4C8B8]'
                      }`}
                    >
                      AI 디자인 테마 ({AI_DESIGN_THEMES.length}종)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignThemeCategory('CORPORATE_PPT')}
                      className={`px-3 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                        designThemeCategory === 'CORPORATE_PPT'
                          ? 'bg-[#00205B] text-white'
                          : 'bg-[#FAF8F5] text-[#5C4E43] border border-[#D4C8B8]'
                      }`}
                    >
                      <span>회사 공식 템플릿 ({registeredTemplates.filter((t) => t.isActive).length}개)</span>
                    </button>
                  </div>
                </div>

                {/* Smart Recommendation Reason Bar */}
                {designThemeCategory === 'AI_THEME' && (
                  <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-xs text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 text-amber-950 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><b>AI 추천 스타일:</b> {getRecommendedThemeInfo(brandName, purpose, targetAudience, rawIdea).reason}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const rec = getRecommendedThemeInfo(brandName, purpose, targetAudience, rawIdea);
                        setSelectedDesignThemeId(rec.themeId);
                        if (rec.themeId === 'ACTIVE_SPORTS') setTemplateStyle('OAK_VALLEY');
                        else if (rec.themeId === 'WELLNESS_NATURAL') setTemplateStyle('PARK_ROCHE');
                        else setTemplateStyle('IPARK');
                      }}
                      className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xs text-[11px] shrink-0"
                    >
                      추천 스타일 적용
                    </button>
                  </div>
                )}

                {/* AI General Design Themes Category */}
                {designThemeCategory === 'AI_THEME' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AI_DESIGN_THEMES.map((theme) => {
                      const isSelected = selectedDesignThemeId === theme.id;
                      return (
                        <div
                          key={theme.id}
                          onClick={() => {
                            setSelectedDesignThemeId(theme.id);
                            if (theme.id === 'ACTIVE_SPORTS') setTemplateStyle('OAK_VALLEY');
                            else if (theme.id === 'WELLNESS_NATURAL') setTemplateStyle('PARK_ROCHE');
                            else setTemplateStyle('IPARK');
                          }}
                          className={`p-3 border rounded-xs cursor-pointer transition-all flex flex-col justify-between space-y-2 relative overflow-hidden ${
                            isSelected
                              ? 'border-[#00205B] ring-2 ring-[#00205B]/30 bg-[#FAF8F5] shadow-xs'
                              : 'border-[#E8E4DC] bg-white hover:border-[#00205B]/40 hover:bg-[#FAF8F5]/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${theme.badgeBg}`}>
                                [{theme.tag}]
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00205B]" />}
                            </div>
                            <h4 className="text-xs font-bold text-[#2C2C2C]">{theme.name}</h4>
                            <p className="text-[11px] text-[#66584C] mt-0.5 leading-snug">{theme.description}</p>
                          </div>

                          {/* Design Preview Card Mockup Thumbnail */}
                          <div className="pt-2 border-t border-[#E8E4DC]/60">
                            <div className="text-[9px] font-mono text-[#786658] mb-1 flex items-center justify-between">
                              <span>디자인 Preview Card</span>
                              <span>{theme.fontTitle}</span>
                            </div>
                            <div className="bg-[#F4F6F9] border border-[#D4C8B8] rounded-xs p-1.5 space-y-1">
                              {/* Mini Cover Preview */}
                              <div className={`${theme.headerBg} p-1.5 rounded-2xs text-white text-[9px] font-bold flex items-center justify-between`}>
                                <span>표지: BRAND × OAK VALLEY</span>
                                <div className={`w-2 h-2 rounded-full ${theme.accentBg}`} />
                              </div>
                              {/* Mini Content Preview */}
                              <div className="bg-white p-1 rounded-2xs border border-gray-200 text-[8px] text-gray-700 flex items-center justify-between">
                                <span>본문: 12-Slide Executive Layout</span>
                                <span className="text-[7px] text-gray-400">P.03</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Corporate Official PPT Template Category */}
                {designThemeCategory === 'CORPORATE_PPT' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[#00205B]/5 p-3 rounded-xs border border-[#00205B]/20">
                      <div className="text-xs text-[#00205B] font-bold">
                        🏢 관리자가 직접 등록한 회사 공식 PowerPoint (.pptx) 템플릿 목록
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTemplateManagerModal(true)}
                        className="px-3 py-1 bg-[#00205B] text-white text-xs font-bold rounded-xs hover:bg-[#001742] cursor-pointer"
                      >
                        관리자 템플릿 관리 ⚙️
                      </button>
                    </div>

                    {registeredTemplates.filter((t) => t.isActive).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {registeredTemplates
                          .filter((t) => t.isActive)
                          .map((tmpl) => (
                            <div
                              key={tmpl.id}
                              onClick={() => {
                                setTemplateStyle(tmpl.brandStyle);
                                setSelectedDesignThemeId(tmpl.id);
                              }}
                              className={`p-4 border rounded-xs cursor-pointer transition-all space-y-2 ${
                                templateStyle === tmpl.brandStyle
                                  ? 'border-[#00205B] ring-2 ring-[#00205B]/30 bg-[#FAF8F5]'
                                  : 'border-[#E8E4DC] bg-white hover:border-[#00205B]/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 bg-blue-900 text-white text-[10px] font-bold rounded-xs">
                                  [회사 공식 .pptx]
                                </span>
                                <span className="text-[10px] font-mono text-gray-500">{tmpl.registeredAt}</span>
                              </div>
                              <h4 className="text-xs font-bold text-[#00205B]">{tmpl.templateName}</h4>
                              <div className="text-[11px] text-[#66584C] font-mono">
                                파일: {tmpl.fileName} ({tmpl.fileSize || '공식 서식'}) | 작성: {tmpl.author}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-[#D4C8B8] rounded-xs bg-[#FAF8F5] space-y-2">
                        <AlertCircle className="w-6 h-6 text-[#A89F91] mx-auto" />
                        <p className="text-xs font-bold text-[#5C4E43]">등록된 회사 공식 템플릿이 없습니다</p>
                        <p className="text-[11px] text-[#786658]">
                          관리자가 [템플릿 관리 ⚙️] 버튼을 통해 실제 .pptx 파일 서식을 등록하면 이 목록에 표시됩니다.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowTemplateManagerModal(true)}
                          className="mt-2 px-4 py-1.5 bg-[#00205B] text-white text-xs font-bold rounded-xs cursor-pointer"
                        >
                          .pptx 템플릿 등록하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Start AI Generation Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleStartBrandAnalysis}
                  className="px-10 py-3.5 bg-[#00205B] hover:bg-[#001742] text-white text-sm font-bold rounded-xs shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 제안서 기획 시작 →</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: AI Brand Analysis & Concept Choice */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {analyzing ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#00205B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-[#2C2C2C]">
                    {brandName} 브랜드 시장 분석 및 오크밸리 연계 컨셉을 창출하는 중...
                  </p>
                  <p className="text-xs text-[#786658]">
                    공식 기업 실적, 최근 마케팅 동향, VERIFIED FACT 데이터 수집 중
                  </p>
                </div>
              ) : brandAnalysis ? (
                <>
                  {/* Brand Analysis Summary Card */}
                  <div className="bg-white border border-[#E8E4DC] p-5 rounded-xs shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-[#00205B]" />
                        <h3 className="text-base font-bold font-serif text-[#2C2C2C]">
                          {brandAnalysis.brandName} 브랜드 분석 결과
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-[#00205B] text-xs font-mono font-bold rounded-xs">
                        STRATEGIC SYNERGY AUDIT
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div>
                          <span className="font-bold text-[#5C4E43]">개요 & 포지셔닝:</span>
                          <p className="text-[#2C2C2C] mt-0.5">{brandAnalysis.overview}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#5C4E43]">타깃 소비층:</span>
                          <p className="text-[#2C2C2C] mt-0.5">{brandAnalysis.targetCustomer}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#5C4E43]">최근 행보:</span>
                          <p className="text-[#2C2C2C] mt-0.5">{brandAnalysis.recentMarketingMove}</p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC]">
                        <div>
                          <span className="font-bold text-[#00205B]">오크밸리/파크로쉬 연계 적합성:</span>
                          <p className="text-[#2C2C2C] mt-0.5">{brandAnalysis.oakValleyFit}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#736152]">시너지 창출 강점:</span>
                          <p className="text-[#2C2C2C] mt-0.5">{brandAnalysis.partnershipStrengths}</p>
                        </div>
                      </div>
                    </div>

                    {/* Verified Facts & AI Insights Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#E8E4DC] text-xs">
                      
                      {/* VERIFIED FACTS */}
                      <div className="bg-emerald-50/50 p-3.5 rounded-xs border border-emerald-200 space-y-2">
                        <div className="flex items-center space-x-1.5 font-mono font-bold text-emerald-900 text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>[VERIFIED FACT] 검증된 기업 사실 및 데이터</span>
                        </div>
                        {brandAnalysis.verifiedFacts?.map((vf, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-xs border border-emerald-100 shadow-2xs">
                            <p className="font-semibold text-slate-800">{vf.fact}</p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-emerald-700 font-mono">
                              <span>출처: {vf.source}</span>
                              <span>확인일: {vf.verifiedDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* AI STRATEGIC INSIGHTS */}
                      <div className="bg-blue-50/50 p-3.5 rounded-xs border border-blue-200 space-y-2">
                        <div className="flex items-center space-x-1.5 font-mono font-bold text-[#00205B] text-[11px]">
                          <Lightbulb className="w-4 h-4 text-[#00205B]" />
                          <span>[AI STRATEGIC INSIGHT] 전략적 제안 포인트</span>
                        </div>
                        {brandAnalysis.strategicInsights?.map((si, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-xs border border-blue-100 shadow-2xs text-slate-800">
                            ★ {si}
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* 3 Strategic Concept Options */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>추천 제휴 실행 컨셉 옵션 선택 (1가지 선택)</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ideaOptions.map((option) => {
                        const isSelected = selectedConcept?.id === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() => setSelectedConcept(option)}
                            className={`p-4 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-[#00205B] ring-2 ring-[#00205B]/20 bg-blue-50/20'
                                : 'border-[#E8E4DC] bg-white hover:border-[#736152]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 bg-[#00205B] text-white text-[10px] font-mono font-bold rounded-xs">
                                  {option.tag}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00205B]" />}
                              </div>
                              <h4 className="text-xs font-bold text-[#2C2C2C] mb-1.5 font-serif">
                                {option.title}
                              </h4>
                              <p className="text-[11px] text-[#5C4E43] leading-relaxed mb-3">
                                {option.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[#F5F2EB] text-[10px] text-[#786658]">
                              <span className="font-bold text-[#2C2C2C]">★ 기대효과:</span> {option.whyEffective}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-[#D4C8B8] bg-white text-[#736152] text-xs font-semibold rounded-xs cursor-pointer hover:bg-[#FAF8F5]"
                    >
                      ← 기본 설정으로 돌아가기
                    </button>

                    <button
                      onClick={() => handleGenerateDeck(proposalMode, selectedConcept)}
                      className="px-8 py-3 bg-[#00205B] hover:bg-[#001742] text-white text-sm font-bold rounded-xs shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>선택한 컨셉으로 12-Slide 제안서 생성 →</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* STEP 3: 12-Slide Deck Preview & Edit & Export */}
          {currentStep === 3 && (
            <div>
              {generatingDeck ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-[#00205B] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-[#2C2C2C]">
                    12-Slide 맞춤 제안서 덱(Proposal Deck)을 완성하는 중...
                  </p>
                  <p className="text-xs text-[#786658]">
                    Deal Builder 수치 검증 · OCC 데이터 연계 · 슬라이드별 VERIFIED FACT 매칭 중
                  </p>
                </div>
              ) : proposalData ? (
                <div className="space-y-4">
                  
                  {/* Top Control Bar */}
                  <div className="bg-white border border-[#E8E4DC] p-3 rounded-xs shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Proposal Mode Switch */}
                    <div className="flex items-center space-x-1 bg-[#FAF8F5] p-1 border border-[#D4C8B8] rounded-xs text-xs font-semibold">
                      <button
                        onClick={() => handleToggleMode('INTERNAL')}
                        className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                          proposalMode === 'INTERNAL'
                            ? 'bg-[#00205B] text-white font-bold shadow-2xs'
                            : 'text-[#736152] hover:text-[#2C2C2C]'
                        }`}
                      >
                        내부 경영진 보고용 (INTERNAL)
                      </button>
                      <button
                        onClick={() => handleToggleMode('PARTNER')}
                        className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                          proposalMode === 'PARTNER'
                            ? 'bg-[#736152] text-white font-bold shadow-2xs'
                            : 'text-[#736152] hover:text-[#2C2C2C]'
                        }`}
                      >
                        외부 파트너 제시용 ({proposalTargetRole})
                      </button>
                    </div>

                    {/* Template Switcher */}
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-[#5C4E43]">템플릿:</span>
                      <select
                        value={templateStyle}
                        onChange={(e) => setTemplateStyle(e.target.value as ProposalTemplateStyle)}
                        className="px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs font-bold text-[#00205B]"
                      >
                        <option value="IPARK">HDC IPARK Corporate (Navy & Gold)</option>
                        <option value="OAK_VALLEY">Oak Valley Nature (Green & Sand)</option>
                        <option value="PARK_ROCHE">Park Roche Wellness (Slate & Sage)</option>
                      </select>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleExportPPTX}
                        className="px-3 py-1.5 bg-[#00205B] hover:bg-[#001742] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>PPTX 다운로드</span>
                      </button>

                      <button
                        onClick={() => setShowCanvaGuidanceModal(true)}
                        className="px-2.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Canva에서 편집</span>
                      </button>

                      <button
                        onClick={handleExportDOCX}
                        className="px-2.5 py-1.5 bg-white border border-[#D4C8B8] hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#736152]" />
                        <span>DOCX</span>
                      </button>

                      <button
                        onClick={handleExportXLSX}
                        className="px-2.5 py-1.5 bg-white border border-[#D4C8B8] hover:bg-[#FAF8F5] text-[#2C2C2C] text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                        <span>XLSX</span>
                      </button>
                    </div>

                  </div>

                  {/* Global AI Refinement Prompt Box */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3.5 rounded-xs shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>전체 제안서 AI 수정 요청 (Full Proposal Deck AI Refine)</span>
                      </span>
                      <span className="text-[10px] text-blue-200 font-mono">
                        * Deal Builder 숫자 & 사용자 직접 수정 내역 자동 보존
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={globalAiInstruction}
                        onChange={(e) => setGlobalAiInstruction(e.target.value)}
                        placeholder="예: '전체적으로 임원보고용으로 더 간결하게 정리해줘', '브랜드 입장에서 얻는 시너지 효과를 더 강조해줘'"
                        className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 text-white placeholder-blue-200/60 rounded-xs text-xs font-semibold focus:outline-none focus:bg-white/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineFullDeck()}
                      />

                      <button
                        onClick={handleRefineFullDeck}
                        disabled={refiningFullDeck || !globalAiInstruction.trim()}
                        className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 text-xs font-bold rounded-xs cursor-pointer flex items-center space-x-1 shrink-0"
                      >
                        {refiningFullDeck ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                        )}
                        <span>전체 반영 ✨</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Work Area: Left Thumbnails + Center Active Slide Canvas */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[500px]">
                    
                    {/* Left Thumbnail Strip (4 cols) */}
                    <div className="md:col-span-4 bg-white border border-[#E8E4DC] p-3 rounded-xs shadow-2xs space-y-2 max-h-[600px] overflow-y-auto">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DC] text-xs font-bold text-[#2C2C2C]">
                        <span>슬라이드 목록 ({proposalData.sections.length}p)</span>
                        <button
                          onClick={handleAddNewSlide}
                          className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D4C8B8] hover:bg-[#EFECE6] text-[11px] text-[#736152] font-semibold rounded-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> 슬라이드 추가
                        </button>
                      </div>

                      {proposalData.sections.map((sec, idx) => {
                        const isActive = idx === activeSlideIndex;
                        const isInternalOnly = sec.isInternalOnly;

                        if (proposalMode === 'PARTNER' && isInternalOnly) {
                          return null;
                        }

                        return (
                          <div
                            key={sec.id}
                            onClick={() => {
                              setActiveSlideIndex(idx);
                              setIsEditingCanvas(false);
                            }}
                            className={`p-2.5 border rounded-xs cursor-pointer transition-all relative ${
                              isActive
                                ? 'border-[#00205B] bg-blue-50/40 ring-1 ring-[#00205B]'
                                : 'border-[#E8E4DC] bg-white hover:border-[#D4C8B8]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-mono font-bold text-[#00205B]">
                                P.{idx + 1}
                              </span>

                              <div className="flex items-center space-x-1">
                                {isInternalOnly && (
                                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono font-bold rounded-xs flex items-center gap-0.5">
                                    <Lock className="w-2.5 h-2.5" /> Internal
                                  </span>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSlide(idx, 'up');
                                  }}
                                  disabled={idx === 0}
                                  className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveSlide(idx, 'down');
                                  }}
                                  disabled={idx === proposalData.sections.length - 1}
                                  className="p-0.5 text-gray-400 hover:text-black disabled:opacity-20 cursor-pointer"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSlide(idx);
                                  }}
                                  className="p-0.5 text-red-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs font-bold text-[#2C2C2C] truncate font-serif">
                              {sec.title}
                            </p>
                            <p className="text-[10px] text-[#786658] line-clamp-1 mt-0.5">
                              {sec.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Center Canvas Preview & Single Slide AI Refine (8 cols) */}
                    <div className="md:col-span-8 flex flex-col space-y-3">
                      
                      {/* Active Slide Canvas (Styled by Template Style) */}
                      {activeSlide && (
                        <div
                          className={`p-6 border rounded-xs shadow-md transition-all min-h-[420px] flex flex-col justify-between ${
                            templateStyle === 'IPARK'
                              ? 'bg-slate-900 text-white border-slate-700'
                              : templateStyle === 'OAK_VALLEY'
                              ? 'bg-[#2D4A3E] text-white border-[#1e342b]'
                              : 'bg-[#3A3F3D] text-white border-stone-600'
                          }`}
                        >
                          <div>
                            {/* Slide Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
                              <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
                                HDC RESORT PARTNERSHIP DECK | SLIDE {activeSlideIndex + 1}
                              </span>

                              {activeSlide.isInternalOnly && (
                                <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold rounded-xs flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> 내부 전용 (Internal Only)
                                </span>
                              )}
                            </div>

                            {/* Slide Title */}
                            <h3 className="text-lg font-bold font-serif mb-4 text-white">
                              {activeSlide.title}
                            </h3>

                            {/* Slide Canvas Content Rendering (Custom view for Partnership Terms table and OCC) */}
                            {isEditingCanvas ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  rows={6}
                                  className="w-full p-3 bg-white text-slate-900 text-xs font-mono rounded-xs focus:outline-none"
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setIsEditingCanvas(false)}
                                    className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-xs cursor-pointer"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={handleSaveManualContent}
                                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-xs cursor-pointer"
                                  >
                                    내용 저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                
                                {/* Standard text content */}
                                <div
                                  onClick={() => {
                                    setEditingContent(activeSlide.content);
                                    setIsEditingCanvas(true);
                                  }}
                                  className="text-xs leading-relaxed whitespace-pre-line font-sans bg-white/10 p-4 rounded-xs border border-white/10 hover:border-amber-400/50 cursor-pointer transition-all group"
                                  title="클릭하여 직접 텍스트 수정"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-amber-200 mb-1 opacity-60 group-hover:opacity-100">
                                    <span>[본문 내용]</span>
                                    <span className="flex items-center gap-1"><Edit3 className="w-3 h-3" /> 클릭하여 직접 편집</span>
                                  </div>
                                  {activeSlide.content}
                                </div>

                                {/* Custom Table view if this is Partnership Terms slide and Deal is connected */}
                                {(activeSlide.title.includes('제휴 조건') || activeSlide.title.includes('Partnership Terms')) && connectedDeal && (
                                  <div className="bg-black/40 border border-white/20 p-3 rounded-xs space-y-2 text-xs">
                                    <div className="flex items-center justify-between font-mono text-[11px] text-amber-300 font-bold border-b border-white/10 pb-1">
                                      <span>[연결된 Deal Builder 상호 제휴 가치표]</span>
                                      <span>{connectedDeal.brandName} x 오크밸리</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-[11px] border-collapse">
                                        <thead>
                                          <tr className="border-b border-white/20 text-slate-300 font-mono">
                                            <th className="py-1 px-2">구분</th>
                                            <th className="py-1 px-2">제공항목</th>
                                            <th className="py-1 px-2 text-right">정상가치</th>
                                            <th className="py-1 px-2 text-right">제안조건</th>
                                            <th className="py-1 px-2">비고</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {connectedDeal.items?.map((it, idx) => (
                                            <tr key={idx} className="border-b border-white/10 text-slate-200">
                                              <td className="py-1 px-2 font-bold text-amber-200">{it.category}</td>
                                              <td className="py-1 px-2">{it.itemName} ({it.unit})</td>
                                              <td className="py-1 px-2 text-right font-mono">₩{(it.normalPrice * it.quantityNum).toLocaleString()}</td>
                                              <td className="py-1 px-2 text-right font-mono font-bold text-emerald-300">₩{(it.appliedPrice * it.quantityNum).toLocaleString()}</td>
                                              <td className="py-1 px-2 text-[10px] text-slate-400">{it.notes}</td>
                                            </tr>
                                          ))}
                                          <tr className="bg-white/10 font-bold font-mono text-white">
                                            <td colSpan={2} className="py-1.5 px-2">합계 요약</td>
                                            <td className="py-1.5 px-2 text-right">₩{connectedDeal.totalNormalValue.toLocaleString()}</td>
                                            <td className="py-1.5 px-2 text-right text-emerald-300">₩{connectedDeal.negotiatedValue.toLocaleString()}</td>
                                            <td className="py-1.5 px-2 text-[10px] text-amber-300">지원가치: ₩{connectedDeal.discountAmount.toLocaleString()}원</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Financial protection: internal costs only rendered if target role is 내부 상부보고 */}
                                    {proposalTargetRole === '내부 상부보고' && (
                                      <div className="pt-2 border-t border-amber-400/30 font-mono text-[10px] text-amber-200 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>실제 추가비용: <b>₩{connectedDeal.actualVariableCost?.toLocaleString()}원</b></span>
                                        <span>기회비용: <b>₩{connectedDeal.opportunityCost?.toLocaleString()}원</b></span>
                                        <span>예상 손익: <b>₩{((connectedDeal.guaranteedCashRevenue || 0) + (connectedDeal.guaranteedRoomRevenue || 0) - (connectedDeal.actualVariableCost || 0)).toLocaleString()}원 ({connectedDeal.dealMarginPercent?.toFixed(1)}%)</b></span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Custom OCC View if this is Recommended Timing slide */}
                                {(activeSlide.title.includes('추천 운영 시기') || activeSlide.title.includes('Recommended Timing')) && useOccData && (
                                  <div className="bg-emerald-950/60 border border-emerald-400/30 p-3.5 rounded-xs space-y-2 text-xs">
                                    <div className="flex items-center justify-between font-mono text-[11px] text-emerald-300 font-bold">
                                      <span className="flex items-center gap-1.5">
                                        <PieChart className="w-3.5 h-3.5 text-emerald-400" /> [OCC 실적 데이터 기반 AI 추천 운영 시기]
                                      </span>
                                      <span>객실 가동률 365일 분석</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                                      <div className="bg-white/10 p-2 rounded-xs border border-white/10">
                                        <span className="font-bold text-amber-300 block mb-0.5">★ 추천 시기: 5월 2주차 ~ 3주차 (주중)</span>
                                        <p className="text-slate-200 text-[10px]">전년 대비 봄철 비수기 가동률 보완 및 주중/주말 36홀 CC 라운드 체류 결합</p>
                                      </div>
                                      <div className="bg-white/10 p-2 rounded-xs border border-white/10 font-mono text-[10px]">
                                        <span className="font-bold text-emerald-300 block mb-0.5">OCC 지표:</span>
                                        <div>평일 OCC: {occDataSummary?.weekdayAvgOcc || 62.3}% vs 주말 OCC: {occDataSummary?.weekendAvgOcc || 88.5}%</div>
                                        <div className="text-amber-200 mt-0.5">목표 OCC: 78.0% (+15.7%p 보완)</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              </div>
                            )}
                          </div>

                          {/* Fact & Strategic Insight Footers */}
                          <div className="mt-4 pt-3 border-white/20 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                            {activeSlide.factSummary && (
                              <div className="bg-black/30 p-2.5 rounded-xs border border-white/10 text-slate-200">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-0.5">
                                  ✓ VERIFIED FACT
                                </span>
                                {activeSlide.factSummary}
                              </div>
                            )}

                            {activeSlide.strategicProposal && (
                              <div className="bg-white/10 p-2.5 rounded-xs border border-white/10 text-amber-100">
                                <span className="text-[10px] font-mono text-amber-300 font-bold block mb-0.5">
                                  ★ AI STRATEGIC INSIGHT
                                </span>
                                {activeSlide.strategicProposal}
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* Single Slide AI Refinement Prompt Box */}
                      <div className="bg-white border border-[#E8E4DC] p-3.5 rounded-xs shadow-2xs space-y-2">
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#00205B]">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>현재 슬라이드(P.{activeSlideIndex + 1}) AI 맞춤 수정 요청</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={slideAiInstruction}
                            onChange={(e) => setSlideAiInstruction(e.target.value)}
                            placeholder="예: '지원 자산에 노블스위트 10실 무료 제공 조건 추가해줘', '문체를 더 정중하게 바꿔줘'"
                            className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-semibold focus:outline-none focus:border-[#00205B]"
                            onKeyDown={(e) => e.key === 'Enter' && handleRefineSingleSlide()}
                          />

                          <button
                            onClick={handleRefineSingleSlide}
                            disabled={refiningSlide || !slideAiInstruction.trim()}
                            className="px-4 py-1.5 bg-[#00205B] hover:bg-[#001742] disabled:opacity-40 text-white text-xs font-bold rounded-xs cursor-pointer flex items-center space-x-1 shrink-0"
                          >
                            {refiningSlide ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>수정 적용</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="py-16 text-center space-y-4 bg-white border border-[#E8E4DC] rounded-xs p-6">
                  <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
                  <h3 className="text-sm font-bold text-[#2C2C2C]">제안서 덱 정보가 불러와지지 않았습니다.</h3>
                  <p className="text-xs text-[#786658]">아래 버튼을 누르면 12-Slide 제안서 덱을 즉시 구성합니다.</p>
                  <button
                    onClick={() => {
                      const fallback = generateClientFallbackProposal(proposalMode, brandName || '제휴 브랜드', connectedDeal || barterPackage, profitabilityData, projectInput);
                      setProposalData(fallback);
                      setActiveSlideIndex(0);
                    }}
                    className="px-6 py-2.5 bg-[#00205B] text-white text-xs font-bold rounded-xs cursor-pointer shadow-sm hover:bg-[#001742]"
                  >
                    12-Slide 제안서 덱 즉시 로드
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#EFECE6] border-t border-[#D4C8B8] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#786658] font-mono">
            IPARK Resort Proposal Builder v3.0 | 실무 데이터 &amp; PPTX 자동 생성
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
          >
            닫기 (Close)
          </button>
        </div>

      </div>

      {/* SUB-MODAL 1: Saved Deal Builder Selector Modal */}
      {showDealSelectModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00205B]" />
                <span>저장된 제휴 조건 불러오기 (Deal Builder)</span>
              </h3>
              <button onClick={() => setShowDealSelectModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5C4E43]">
              Deal Builder에서 계산되고 확정된 제휴 조건을 선택하여 제안서에 연결합니다. (수치는 원본 보존됩니다)
            </p>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedDealsList.map((deal) => (
                <div
                  key={deal.id}
                  onClick={() => {
                    setConnectedDeal(deal);
                    if (!brandName.trim()) setBrandName(deal.brandName);
                    if (!rawIdea.trim()) setRawIdea(deal.projectName);
                    setShowDealSelectModal(false);
                  }}
                  className="p-4 border rounded-xs hover:border-[#00205B] bg-[#FAF8F5] hover:bg-blue-50/30 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00205B]">{deal.brandName} - {deal.projectName}</span>
                    <span className="text-[10px] font-mono text-gray-500">저장일: {deal.savedAt}</span>
                  </div>

                  <div className="text-xs text-[#5C4E43] grid grid-cols-2 md:grid-cols-4 gap-2 font-mono bg-white p-2 border rounded-xs">
                    <div>항목: <b>{deal.items?.length || 0}개</b></div>
                    <div>정상가치: <b>₩{(deal.totalNormalValue || 0).toLocaleString()}원</b></div>
                    <div>협의금액: <b>₩{(deal.negotiatedValue || 0).toLocaleString()}원</b></div>
                    <div>지원가치: <b className="text-[#00205B]">₩{(deal.discountAmount || 0).toLocaleString()}원</b></div>
                  </div>

                  {deal.negotiationNotes && (
                    <div className="text-[11px] text-[#786658]">
                      비고: {deal.negotiationNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDealSelectModal(false)}
                className="px-4 py-2 bg-gray-200 text-slate-800 text-xs font-semibold rounded-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Corporate PPT Template Manager Modal */}
      {showTemplateManagerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00205B]" />
                <span>회사 PPT 템플릿 관리 (관리자 기능)</span>
              </h3>
              <button onClick={() => setShowTemplateManagerModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5C4E43]">
              IPARK 리조트 공식 PowerPoint(.pptx) 템플릿 파일 양식을 등록하고 활성화 상태를 관리합니다.
            </p>

            {/* Template Upload */}
            <div className="p-4 border border-dashed border-[#00205B]/30 rounded-xs bg-blue-50/20 text-center space-y-2">
              <Upload className="w-6 h-6 text-[#00205B] mx-auto" />
              <div className="text-xs font-bold text-[#00205B]">신규 PowerPoint(.pptx) 템플릿 파일 등록</div>
              <label className="inline-block px-4 py-1.5 bg-[#00205B] text-white text-xs font-bold rounded-xs cursor-pointer hover:bg-[#001742]">
                <span>.pptx 파일 선택</span>
                <input
                  type="file"
                  accept=".pptx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const newTmpl: CorporatePptTemplate = {
                        id: `tmpl-${Date.now()}`,
                        templateName: file.name,
                        brandStyle: 'IPARK',
                        registeredAt: new Date().toISOString().slice(0, 10),
                        author: '관리자 (직접 등록)',
                        isActive: true,
                        fileName: file.name,
                        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)}MB`,
                      };
                      saveRegisteredTemplates([newTmpl, ...registeredTemplates]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Template List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="text-xs font-bold text-[#2C2C2C]">등록된 템플릿 목록 ({registeredTemplates.length}개)</div>
              {registeredTemplates.map((tmpl) => (
                <div key={tmpl.id} className="p-3 border rounded-xs bg-[#FAF8F5] flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#00205B] flex items-center gap-2">
                      <span>{tmpl.templateName}</span>
                      <span className="px-1.5 py-0.2 bg-blue-100 text-[#00205B] text-[9px] rounded-xs">{tmpl.brandStyle}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      등록일: {tmpl.registeredAt} | 등록자: {tmpl.author} | 용량: {tmpl.fileSize}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const updated = registeredTemplates.map((t) => (t.id === tmpl.id ? { ...t, isActive: !t.isActive } : t));
                        saveRegisteredTemplates(updated);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xs cursor-pointer ${
                        tmpl.isActive ? 'bg-emerald-700 text-white' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {tmpl.isActive ? '활성 (Active)' : '비활성'}
                    </button>
                    <button
                      onClick={() => {
                        const updated = registeredTemplates.filter((t) => t.id !== tmpl.id);
                        saveRegisteredTemplates(updated);
                      }}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTemplateManagerModal(false)}
                className="px-4 py-2 bg-[#00205B] text-white text-xs font-semibold rounded-xs"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: Canva Guidance Modal */}
      {showCanvaGuidanceModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Canva에서 제안서 편집하기 안내</span>
              </h3>
              <button onClick={() => setShowCanvaGuidanceModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5C4E43] leading-relaxed">
              <p>
                생성된 <b>PPTX 파일</b>을 먼저 다운로드한 후, Canva(캔바) 사이트에서 <b>드래그 앤 드롭(Drag & Drop)</b>으로 업로드하시면 원 클릭으로 Canva에서 곧바로 폰트/디자인을 편집하실 수 있습니다.
              </p>
              <div className="bg-amber-50 p-3 rounded-xs border border-amber-200 text-[11px] font-mono text-amber-900 space-y-1">
                <div>✓ editable PowerPoint Table & Text Frames 호환 완료</div>
                <div>✓ Canva 연동 및 슬라이드 편집 구조 지원</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowCanvaGuidanceModal(false)}
                className="px-3 py-1.5 bg-gray-200 text-slate-800 text-xs font-semibold rounded-xs"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowCanvaGuidanceModal(false);
                  handleExportPPTX();
                }}
                className="px-4 py-1.5 bg-[#00205B] text-white text-xs font-bold rounded-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>PPTX 다운로드 및 Canva 준비</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: OCC File Column & Data Fact Verification Modal */}
      {showOccCheckModal && pendingOccCheckData && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-700" />
                <span>업로드 실적자료 컬럼 및 실적 데이터 확인</span>
              </h3>
              <button onClick={() => setShowOccCheckModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5C4E43]">
              <div className="bg-[#FAF8F5] p-3 border rounded-xs font-mono space-y-1">
                <div>파일명: <b>{pendingOccCheckData.fileName}</b></div>
                <div>총 레코드 수: <b>{pendingOccCheckData.rowCount}개 행</b></div>
                <div>감지된 주요 항목: <b className="text-[#00205B]">{pendingOccCheckData.detectedColumns.join(', ')}</b></div>
              </div>

              {/* Data Fact vs AI Recommendation Distinction */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#00205B]">실적 데이터 분석 구분 [DATA FACT vs AI RECOMMENDATION]</div>
                
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xs space-y-1">
                  <div className="font-bold text-[#00205B] font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" /> [DATA FACT - 실적 확인 사실]
                  </div>
                  <ul className="text-[11px] text-[#2C2C2C] space-y-0.5 list-disc pl-4 font-mono">
                    <li>주말 평균 객실 OCC: <b>{pendingOccCheckData.weekendAvgOcc}%</b> / 주중 평균 OCC: <b>{pendingOccCheckData.weekdayAvgOcc}%</b></li>
                    <li>주중-주말 OCC 격차: <b>{(pendingOccCheckData.weekendAvgOcc - pendingOccCheckData.weekdayAvgOcc).toFixed(1)}%p</b></li>
                    <li>수요 보완 필요 구간: <b>3월 2~3주차, 11월 1~2주차 (평일 OCC 55% 이하)</b></li>
                  </ul>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xs space-y-1">
                  <div className="font-bold text-emerald-900 font-mono text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> [AI RECOMMENDATION - 제안서 활용 추천]
                  </div>
                  <ul className="text-[11px] text-[#2C2C2C] space-y-0.5 list-disc pl-4 font-mono">
                    <li>제휴 브랜드 고객 초청 행사를 <b>5월 2주차~3주차 주중</b>으로 설정하여 주중 체류율 증대</li>
                    <li>비수기 패키지 결합을 통해 객실 ADR 보완 및 부대시설 매출 활성화 도모</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowOccCheckModal(false)}
                className="px-4 py-2 bg-gray-200 text-slate-800 text-xs font-semibold rounded-xs"
              >
                취소
              </button>
              <button
                onClick={handleConfirmUseOccData}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>이 데이터로 제안서 반영하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 5: Saved OCC Performance Data Selector Modal */}
      {showSavedOccModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-[#00205B] flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>저장된 실적자료 목록 불러오기</span>
              </h3>
              <button onClick={() => setShowSavedOccModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5C4E43]">
              시스템에 미리 등록 및 검증된 오크밸리 리조트 객실/골프/부대시설 실적 데이터를 선택합니다.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {DEFAULT_SAVED_OCC_LIST.map((savedOcc) => (
                <div
                  key={savedOcc.id}
                  onClick={() => {
                    setOccDataSummary(savedOcc.summary);
                    setUseOccData(true);
                    setShowSavedOccModal(false);
                  }}
                  className="p-4 border border-[#E8E4DC] hover:border-emerald-600 rounded-xs bg-[#FAF8F5] hover:bg-emerald-50/30 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00205B]">{savedOcc.title}</span>
                    <span className="text-[10px] font-mono text-[#786658]">등록일: {savedOcc.registeredAt}</span>
                  </div>

                  <p className="text-[11px] text-[#5C4E43] leading-snug">{savedOcc.description}</p>

                  <div className="text-[10px] text-emerald-900 font-mono bg-white p-2 border border-emerald-200 rounded-xs space-y-0.5">
                    <div><b>분석기간:</b> {savedOcc.summary.yearRange} ({savedOcc.summary.rowCount}개 행)</div>
                    <div><b>수치:</b> 주말 OCC {savedOcc.summary.weekendAvgOcc}% / 주평일 {savedOcc.summary.weekdayAvgOcc}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSavedOccModal(false)}
                className="px-4 py-2 bg-gray-200 text-slate-800 text-xs font-semibold rounded-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProposalBuilderModal;
