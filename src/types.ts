export type ActiveTab = 'home' | 'trend' | 'company' | 'competitor' | 'partnership' | 'ratecard' | 'activation' | 'knowledge' | 'partnertarget' | 'partnerpipeline' | 'partnerperformance' | 'weeklyplanner' | 'pressrelease' | 'partnerlist' | 'partnerdb' | 'postevent' | 'interest' | 'proposal' | 'referencesite' | 'instagram_event';

export type TargetBrand = 'Oak Valley' | 'PARK ROCHE' | '공통';

// --- PARTNER TARGET LIST TYPES ---
export type ProjectType =
  | 'Running'
  | 'Golf'
  | 'Wellness'
  | 'Hospitality'
  | 'F&B'
  | 'Outdoor'
  | 'Family'
  | 'Culture'
  | 'Exhibition'
  | 'Festival'
  | 'Membership'
  | string;

export type RequiredPartnershipType =
  | 'Cash Sponsorship'
  | 'Product Sponsorship'
  | 'Brand Experience'
  | 'Joint Marketing'
  | 'Content'
  | 'VIP'
  | 'Sampling'
  | 'Sales'
  | 'Membership';

export interface PartnerTargetInput {
  projectName: string;
  projectType: ProjectType;
  eventDate: string;
  location: string;
  expectedParticipants: string;
  targetCustomer: string;
  requiredPartnershipTypes: RequiredPartnershipType[];
  desiredCashSponsorship: number;
}

export interface TargetCandidateItem {
  id: string;
  companyName: string;
  brand?: string;
  brandName?: string;
  industry: string;
  scaleCategory?: '신생·라이징' | '스타트업' | '중소브랜드' | '대기업' | string;
  whatItDoes?: string;
  whyDiscoveredNow?: string;
  collaborationIdeas?: string[];
  discoverySource?: string;
  discoverySourceType?: 'wadiz' | 'popup' | 'new_product' | 'startup' | 'retail' | 'other' | string;
  recentActivity?: string;
  recentMarketingActivity?: string;
  partnershipReason?: string;
  verifiedSponsorshipCases?: string;
  oakValleyOpportunity?: string;
  oakValleyTouchpoint?: string;
  recommendedDirection?: string;
  cashSponsorshipEvidence?: string; // 근거 부족 시 "확인 자료 부족"
  contactInquiry?: string; // 공식 공개 채널만 표시
  source?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
  verifiedDate?: string;
  whyRecommended?: string;
  officialWebsite?: string;
  evidence?: string;
  isExistingDeal?: boolean;
  existingDealStage?: string;
  scope?: string;
}

export interface PartnerDiscoveryResult {
  projectInput: PartnerTargetInput;
  classifiedIndustries: string[];
  candidates: TargetCandidateItem[];
  generatedAt: string;
}

// --- DEAL PROFITABILITY TYPES ---
export interface DealProfitabilityInput {
  normalValue: number;
  partnerCashInflow: number;
  partnerInKindValue: number;
  actualVariableCost: number;
  opportunityCost: number;
  expectedAdditionalRevenue: number;
  additionalProductionCost: number;
  operatingCost: number;
}

export interface DealProfitabilityResult {
  hasSufficientCostData: boolean;
  partnerCashInflow: number;
  partnerInKindValue: number;
  oakValleyMediaValue: number;
  actualVariableCost: number;
  opportunityCost: number;
  expectedAdditionalRevenue: number;
  additionalProductionCost: number;
  operatingCost: number;
  totalOutflowCost: number;
  totalInflowValue: number;
  expectedNetBenefit: number;
  dealMarginPercent: number;
  costToValueRatioPercent: number;
  evaluationSummary: string;
  warningFlags: string[];
}

// --- PROPOSAL BUILDER TYPES ---
export type ProposalMode = 'INTERNAL' | 'PARTNER';

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  factSummary?: string;
  sourceCitation?: string;
  strategicProposal?: string;
  internalNotesOnly?: string;
  isInternalOnly?: boolean;
}

export interface ProposalData {
  id: string;
  companyName: string;
  proposalMode: ProposalMode;
  generatedAt: string;
  sections: ProposalSection[];
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

export type DocCategory = '회사소개서' | '시설소개서' | '골프장 소개' | '객실/리조트 소개' | '광고매체 Rate Card' | '행사/제휴 사양서' | '기타';

export interface DocumentChunk {
  chunkId: string;
  chunkIndex: number;
  text: string;
  charLength: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;              // 자료명
  fileType: string;           // PDF, PPTX, DOCX, XLSX, CSV, TXT 등
  targetBrand: TargetBrand;   // Oak Valley | PARK ROCHE | 공통
  category: DocCategory;      // 자료 유형
  fileSize: number;           // bytes
  uploadDate: string;         // YYYY.MM.DD HH:mm
  version: string;            // e.g., "v1.0"
  status: 'ACTIVE' | 'INACTIVE'; // 상태
  extractedText?: string;      // 실제 파싱된 텍스트 내용
  summary?: string;           // AI가 생성한 문서 요약
  chunks?: DocumentChunk[];   // RAG 검색용 의미/페이지 단위 텍스트 Chunk
  chunkCount?: number;
}

export interface KnowledgeBaseMetadata {
  used: boolean;
  activeDocCount: number;
  usedDocs: { title: string; brand: TargetBrand; version: string; uploadDate: string; category?: string }[];
  externalSourceCount: number;
  lastUpdated?: string | null;
}

export type ActivationEventType =
  | 'Pop-up'
  | 'Exhibition'
  | 'Expo'
  | 'Fair'
  | 'Brand Event'
  | 'Sports'
  | 'Wellness'
  | 'Golf'
  | 'Outdoor'
  | 'F&B'
  | 'Fashion'
  | 'Beauty'
  | 'Lifestyle'
  | 'Cultural'
  | 'Membership'
  | 'VIP';

export type ActivationStatus = 'ONGOING' | 'UPCOMING' | 'ENDED';

export type ActivationRegion =
  | '서울'
  | '경기'
  | '강원'
  | '부산'
  | '제주'
  | '한국 전체'
  | 'Japan'
  | 'US'
  | 'Europe'
  | 'Global';

export type ActivationPeriodFilter =
  | '오늘'
  | '이번 주'
  | '이번 달'
  | '향후 3개월'
  | '향후 6개월'
  | '지난 3개월'
  | '전체';

export interface BenchmarkInsight {
  concept: string;
  customerJourney: string;
  spaceDesign: string;
  content: string;
  productExperience: string;
  fnb: string;
  membership: string;
  sns: string;
  influencer: string;
  salesConnection: string;
  photoZone: string;
  giftSampling: string;
  community: string;
  whatOakValleyCanLearn: string[]; // Exactly 3 key takeaways
}

export interface OakValleyParkRocheInsight {
  oakValleyFit: 'HIGH' | 'MEDIUM' | 'LOW';
  parkRocheFit: 'HIGH' | 'MEDIUM' | 'LOW';
  applicableAssets: string[]; // e.g., ["Golf", "Stay", "Forest", "Wellness", "Recovery", "F&B", "Check-in", "Event Space", "Outdoor", "Membership", "VIP", "Content"]
  adaptationIdea: string;
  quickWin: string;
  signatureVersion: string;
  potentialPartner: string;
}

export interface ActivationSource {
  title: string; // e.g. "COEX 공식 행사 일정", "Instagram @sungsooodong", "공식 홈페이지", "보도자료"
  url?: string;
  refDate: string; // e.g. "2026.09.10"
  isOfficial?: boolean; // true: 공식 확인, false: 추가 확인 필요
  sourceRole?: 'OFFICIAL' | 'DISCOVERY'; // '공식 확인' vs '추가 확인 필요'
}

export interface ActivationItem {
  id: string;
  eventName: string;
  brand: string;
  eventType: ActivationEventType;
  location: string;
  city: string;
  region: ActivationRegion;
  hotspot?: string; // e.g. "성수", "한남", "더현대 서울", "코엑스", "신세계 강남", "롯데월드몰", "서울숲", "DDP", "부산", "제주"
  startDate: string; // YYYY.MM.DD
  endDate: string; // YYYY.MM.DD or "기간 확인 필요"
  periodText: string; // e.g. "2026.08.10 ~ 2026.08.25"
  status: ActivationStatus;
  whatIsIt: string; // 2~3줄 요약
  experiencePoint: string;
  targetCustomer: string;
  whyItMatters: string;
  source: ActivationSource;
  oakValleyParkRocheInsight: OakValleyParkRocheInsight;
  benchmark: BenchmarkInsight;
  tags?: string[];
  isSaved?: boolean;
}

// --- PARTNERSHIP DEAL BUILDER ADVANCED TYPES ---

export type RateCardCategory = '공간' | '객실' | '골프' | 'F&B' | '광고' | '스포츠' | '기타';

export interface MasterRateCardItem {
  id: string;
  category: RateCardCategory | string;
  itemName: string;
  unit: string;
  normalPrice: number;
  condition: string;
  notes: string;
}

export interface DealCreateData {
  brandName: string;
  eventName: string;
  expectedParticipants: string;
  eventDate: string;
  purpose: string;
}

export interface VerifiedBrandFact {
  fact: string;
  source: string;
  date: string;
  category: 'MARKET' | 'COMPANY' | 'MARKETING' | 'PARTNERSHIP PATTERN' | string;
}

export interface BrandIntelligenceData {
  market: {
    recentStatus: string;
    industryTrends: string;
    brandPosition: string;
    mainCompetitors: string[];
  };
  company: {
    recentDirection: string;
    newProductsServices: string;
    investmentExpansion: string;
    financialGrowthInfo: string;
  };
  marketing: {
    recentCampaigns: string;
    popupsEvents: string;
    sponsorshipCollab: string;
    influencerCommunity: string;
    offlineActivation: string;
  };
  partnershipPattern: {
    pastCollabCases: string;
    preferredActivationForms: string;
    interestAreas: string[];
  };
  verifiedFacts: VerifiedBrandFact[];
  searchedAt: string;
}

export interface BrandNeedHypothesis {
  hypotheses: Array<{
    title: string;
    explanation: string;
    alignmentScore: number;
  }>;
  primaryHypothesis: string;
}

export interface RealEconomicsCosts {
  operatingLabor: number;
  outsourcingCost: number;
  setupCost: number;
  fnbCost: number;
  otherCost: number;
  opportunityCost: number;
}

export interface RealEconomicsRevenues {
  venueRevenue: number;
  roomRevenue: number;
  golfRevenue: number;
  fnbRevenue: number;
  participantFeeRevenue: number;
  brandCashSponsorship: number;
  otherRevenue: number;
}

export interface BrandContributionDetails {
  cashSponsorship: number;
  inKindSupportRetail: number;
  inKindRecognitionRate: number; // default 70%
  inKindRecognizedValue: number;
  mediaAdvValue: number;
  snsContentValue: number;
  influencerValue: number;
  audienceValue: number;
  crmDbValue: number;
  prizesValue: number;
  staffValue: number;
  otherSupportValue: number;
}

export type TargetProfitMode = 'BREAKEVEN' | 'PLUS_100M' | 'PROFIT_10' | 'PROFIT_20' | 'CUSTOM';

export interface DealOptionDetails {
  optionKey: 'OPTION_A' | 'OPTION_B' | 'OPTION_C' | 'OPTION_D' | 'OPTION_E';
  optionType: 'GUARANTEED_ROOM' | 'PARTICIPATION_REVENUE' | 'CASH_SPONSORSHIP' | 'HYBRID' | 'COST_TRANSFER';
  title: string;
  description: string;
  expectedSecuredValue: number;
  expectedSecuredValueText: string;
  oakValleyAdvantage: string;
  brandAdvantage: string;
  difficulty: '하' | '중' | '상';
  recommendedReason: string;
}

export interface NegotiationLadderTier {
  tierName: 'IDEAL' | 'TARGET' | 'MINIMUM';
  title: string;
  description: string;
  totalSecuredValue: number;
  roomGuarantee: string;
  participantFeeShare: string;
  cashSponsorship: string;
  inKindTerms: string;
  supportConditions: string;
}

export type DealVerdictType = '진행 추천' | '조건부 진행' | '재협상 권고' | '진행 재검토';

export interface FullDealAdvisorResult {
  brandName: string;
  eventName: string;
  brandIntelligence: BrandIntelligenceData;
  needHypothesis: BrandNeedHypothesis;
  negotiationOptions: DealOptionDetails[];
  brandSpecificStrategy: {
    category: string;
    coreTactics: string[];
    tailoredApproach: string;
  };
  negotiationLadder: {
    ideal: NegotiationLadderTier;
    target: NegotiationLadderTier;
    minimum: NegotiationLadderTier;
  };
  verdict: {
    verdictType: DealVerdictType;
    rationale: string;
    keyNumbersSummary: string;
  };
  executiveSummary: string;
}

export interface TodayActivationSignalItem {
  id: string;
  event: string;
  brand: string;
  eventType: ActivationEventType;
  location: string;
  period: string;
  whyWatch: string;
  relevance: string; // Oak Valley / Park Roche Relevance
  activationId?: string;
}

export interface TodayActivationSignals {
  popups: TodayActivationSignalItem[]; // 3 items
  exhibitionsFairs: TodayActivationSignalItem[]; // 3 items
  exhibitions?: TodayActivationSignalItem[]; // Optional alias for safety
  brandEvents: TodayActivationSignalItem[]; // 3 items
}


export interface RateCardItem {
  id: string;
  mediaName: string;
  category: string;
  location: string;
  description: string;
  normalPrice: number;
  partnershipPrice: number;
  period: string;
  quantity: number;
  exposure: string;
  productionCost: number;
  requiredCost: number; // 실비 비용
  restrictions: string;
  notes: string;
}

// --- ACCUMULATIVE PARTNER CONDITION & BARTER PLAN TYPES ---

export type ItemProvider = 'IPARK리조트' | '파트너';

export type LineItemCategory =
  | '현금'
  | '현물'
  | '객실'
  | '골프'
  | '이용권'
  | '상품'
  | '홍보'
  | '콘텐츠'
  | '운영비'
  | '보장매출'
  | '기타';

export const LINE_ITEM_CATEGORIES: LineItemCategory[] = [
  '현금',
  '현물',
  '객실',
  '골프',
  '이용권',
  '상품',
  '홍보',
  '콘텐츠',
  '운영비',
  '보장매출',
  '기타',
];

export const ITEM_PROVIDERS: ItemProvider[] = ['IPARK리조트', '파트너'];

export interface PartnerConditionLineItem {
  id: string;
  partnerName: string;      // 파트너사명 (e.g. 아디다스 코리아)
  projectName: string;      // 프로젝트명 (e.g. 2026 오크밸리 웰니스 팝업)
  itemName: string;         // 항목명
  provider: ItemProvider;   // 제공주체 (IPARK리조트 / 파트너)
  category: LineItemCategory; // 유형 (현금, 현물, 객실 등)
  quantityPeriod: string;   // 수량/기간 (e.g. 2일, 30실, 3,000개)
  quantityNum: number;      // 수량 숫자 (계산용)
  unitPrice: number;        // 단가 (원)
  normalPrice: number;      // 정상가 (원)
  recognizedPrice: number;  // 인정가/협의가 (원)
  costPrice: number;        // 원가/실제비용 (원)
  totalAmount: number;      // 총액 = recognizedPrice * quantityNum (원)
  notes: string;            // 비고
  isActive: boolean;        // 사용여부
  createdAt: string;
  updatedAt: string;
}

export interface BarterPlan {
  id: string;
  partnerName: string;
  projectName: string;
  planName: string;         // 협의안 명칭 (e.g. 협의안 A, 협의안 B)
  description?: string;     // 설명
  includedItemIds: string[]; // 포함된 Line Item ID 목록
  itemOverrides?: Record<string, {
    quantityNum?: number;
    recognizedPrice?: number;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerConditionHistory {
  id: string;
  partnerName: string;
  projectName: string;
  lineItemId: string;
  itemName: string;
  fieldChanged: string;     // 예: "수량", "인정과", "신규 생성", "보완 업로드"
  previousValue: string;    // 예: "20실"
  newValue: string;         // 예: "30실"
  reason?: string;          // 변경 사유 / 파일명
  changedAt: string;
}

export interface FileUploadComparison {
  matchedExisting: {
    existingItem: PartnerConditionLineItem;
    extractedItem: Partial<PartnerConditionLineItem>;
  }[];
  proposedChanges: {
    existingItem: PartnerConditionLineItem;
    extractedItem: Partial<PartnerConditionLineItem>;
    changedFields: { field: string; oldVal: any; newVal: any }[];
  }[];
  newItems: Partial<PartnerConditionLineItem>[];
}

export interface LegacyBarterCalculationResult {
  planName: string;
  partnerName: string;
  projectName: string;
  iparkTotalValue: number;      // IPARK리조트 제공가치
  partnerTotalValue: number;    // 파트너 제공가치
  guaranteedRevenue: number;    // 보장매출
  expectedCosts: number;        // 예상 비용
  expectedProfit: number;       // 예상 손익
  valueDifference: number;      // 교환가치 차이 (파트너가치 - IPARK가치)
  
  iparkItems: PartnerConditionLineItem[];
  partnerItems: PartnerConditionLineItem[];
  
  summaryNotes: string;
  valueComparisonSummary: string;
  guaranteedRevenueDetails: string;
  profitabilityDetails: string;
  negotiationRecommendation: string;
}

// --- SIMPLIFIED PARTNERSHIP DEAL BUILDER TYPES ---

export type BarterAssetType = '광고' | '숙박' | '부대시설' | '할인' | string;

export interface OakValleyBarterAsset {
  id: string;
  itemName: string; // 광고매체 및 바터 리스트
  location: string; // 위치
  type: BarterAssetType; // 형태 (광고, 숙박, 부대시설, 할인 등)
  specification: string; // 규격
  unitPrice: number; // 단가 (원)
  unitPriceText?: string; // e.g. "별도 산정"
  period: string; // 기간
  notes: string; // 비고
}

export interface DealCalculationRow {
  id: string;
  date: string; // 일자 (e.g. 2026.08.15 ~ 2026.08.16)
  location: string; // 장소 (e.g. 밸리빌리지 잔디광장)
  itemName: string; // 사용명 / 항목
  quantityPeriod: string; // 시간·수량 (e.g. 1개월, 20실, 2팀)
  quantityNum: number; // 수량 계수
  normalPrice: number; // 정상가 (원)
  appliedPrice: number; // 제휴가 (원)
  discountRate: number; // 할인율 (%)
  discountAmount: number; // 할인금액 (원) = (normalPrice - appliedPrice) * quantityNum
  totalNormal: number; // 정상가 총액 (normalPrice * quantityNum)
  totalApplied: number; // 제휴가 총액 (appliedPrice * quantityNum)
  notes: string; // 비고
  assetId?: string; // 오크밸리 기준 단가표 자산 ID
}

export interface PartnerContributionInput {
  companyName: string; // 업체명
  cashSupport: number; // 현금 지원 (원)
  productSupport: number; // 현물 소비자가 (원)
  inKindRecognitionRate: number; // 현물 인정률 (%) - default 70
  otherSupportValue?: number; // 기타 지원가치 (원)
  otherSupportDesc?: string; // 기타 지원 내역 설명
}

export interface DealNegotiationCriteria {
  minimumCondition: {
    requiredEffectiveValue: number;
    minCashRequired: number;
    minInKindRetailEquivalent: number;
    description: string;
  };
  targetCondition: {
    targetSurplusRate: number;
    targetEffectiveValue: number;
    targetCashRequired: number;
    targetInKindRetailEquivalent: number;
    description: string;
  };
  currentOffer: {
    partnerEffectiveValue: number;
    isMeetingMinimum: boolean;
    achievementRateVsTarget: number;
    gapToTarget: number;
    description: string;
  };
  recommendationSummary: string; // 정확한 계산식 기반 권장 협의안
}

export interface RecommendedBarterItem {
  id: string;
  assetId?: string; // Reference to OakValleyBarterAsset.id
  itemName: string; // 제공 항목
  location: string; // 위치
  type: string; // 형태
  specification: string; // 규격
  unitPrice: number; // 단가
  unitPriceText?: string;
  quantityPeriod: string; // 수량/기간 (e.g. "1년", "20실", "2팀")
  quantityNum: number; // 수량 숫자
  providedValue: number; // 제공가치 (단가 * quantityNum)
  notes: string; // 비고
}

export interface BarterPackageResult {
  companyName: string;
  cashSupport: number;
  productSupport: number;
  inKindRecognitionRate: number;
  partnerRecognizedValue: number; // 파트너 인정가치
  targetProvidedValue?: number; // 사용자가 변경할 수 있는 목표 제공가
  oakValleyProvidedValue: number; // Oak Valley 총 제공가치
  difference: number; // 차액 (+200,000원)
  matchRate: number; // 바터 매칭률 (%)
  items: RecommendedBarterItem[];
  recommendationReason: string; // AI 추천 이유 (2~3줄)
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

export interface PartnerInput {
  companyName: string;
  cashInvestment: number;
  productSponsorship: number;
  marketingSupport: number;
  otherSupport: number;
  otherSupportName: string;
  partnershipObjective: string;
}

export interface BarterRecognitionRates {
  cash: number; // e.g. 100
  productSponsorship: number; // e.g. 70
  marketingSupport: number; // e.g. 50
  otherSupport: number; // e.g. 50
}

export interface SelectedMediaItem {
  rateCardItemId: string;
  mediaName: string;
  category: string;
  location: string;
  quantity: number;
  period: string;
  normalPrice: number;
  partnershipPrice: number;
  providedValue: number; // partnershipPrice * quantity
  requiredCost: number; // requiredCost * quantity
  reasonForSelection: string;
}

export interface ProfitabilityCheck {
  profitabilityLevel: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  opportunityCostNote: string;
  hasActualCostData: boolean;
  warnings: string[];
}

export interface AIRecommendationDetails {
  whyThisPackage: string[];
  negotiationPoints: string[];
  additionalAsks: string[];
}

export interface PackageOption {
  type: 'SAFE' | 'BALANCED' | 'IMPACT';
  isRecommended: boolean;
  title: string;
  description: string;
  partnerAdjustedValue: number;
  oakValleyMediaValue: number;
  difference: number;
  valueRatio: number;
  estimatedActualCost: number;
  brandFit: string;
  expectedImpact: string;
  executionDifficulty: '상' | '중' | '하';
  mediaItems: SelectedMediaItem[];
  profitabilityAnalysis: ProfitabilityCheck;
  aiRecommendation: AIRecommendationDetails;
}

export type TrendSourceType = '공식자료' | '리서치' | '언론' | 'Trend Discovery';

export interface TrendFilter {
  period: '최근 7일' | '최근 30일' | '최근 90일' | '최근 1개월' | '최근 3개월' | '최근 6개월' | '최근 1년';
  region: '한국' | '글로벌' | '미국' | '일본' | '유럽';
  category: string;
}

export type OakValleyAsset = 'Golf' | 'Stay' | 'Wellness' | 'F&B' | 'Event' | 'Outdoor' | 'Check-in' | 'Membership' | 'Digital';
export type OakValleyLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RecommendedOakValleyAsset {
  asset: OakValleyAsset;
  priority: number;
  reason: string;
}

export interface VerifiedFitFactor {
  factorKey: string; // e.g. "golfFit", "wellnessFit", "revenuePotential", "eventFit", "resortFit", "customerFit", "executionFeasibility"
  factorName: string; // e.g. "Golf Fit", "Wellness Fit", "Revenue Potential", "Event Fit", "Resort Stay Fit", "Customer Base Match", "Execution Feasibility"
  grade: 'HIGH' | 'MEDIUM' | 'LOW';
  score?: number; // 0~100
  reasoning: string; // 판단 이유
  evidenceSummary: string; // 사용된 근거
  source: string; // 출처명 + 발행일/확인일
  verifiedDate?: string;
  verified: boolean; // true if actual verifiable data exists
}

export interface OakValleyFit {
  overallFitScore?: number | null; // 0~100 (null if insufficient evidence)
  isScoreAvailable: boolean; // false if verified factors < 2
  verifiedFactorsCount: number; // e.g. 4
  totalPossibleFactors: number; // e.g. 7
  coverageText: string; // "Evidence Coverage: 4 / 7 factors verified" or "Insufficient Evidence"
  factors: VerifiedFitFactor[]; // ONLY verified evaluation factors
  brandFitScore?: number; // optional legacy/supplementary
  customerFitScore?: number; // optional legacy/supplementary
  golfFit?: OakValleyLevel;
  resortFit?: OakValleyLevel;
  wellnessFit?: OakValleyLevel;
  eventFit?: OakValleyLevel;
  revenuePotential?: OakValleyLevel;
  executionDifficulty?: OakValleyLevel;
  recommendedAssets: RecommendedOakValleyAsset[];
}

export interface WhyOakValleyReason {
  category: 'Customer' | 'Brand Experience' | 'Business' | 'Marketing' | 'Long-term Expansion';
  title: string;
  detail: string;
}

export interface WhyOakValley {
  reasons: WhyOakValleyReason[];
  recommendedPartnershipDirection: string;
}

export interface OakValleyOpportunity {
  opportunityScore: number; // 0~100
  recommendedAssets: OakValleyAsset[];
  targetCustomer: string;
  recommendedProgram: string;
  potentialPartnerCategory: string;
  businessModel: string;
  quickWin: string;
  longTermOpportunity: string;
  spaceAndTouchpoints: string;
}

export interface ReferenceSource {
  id?: string;
  institution: string; // 기관명 (e.g. "Global Wellness Institute", "McKinsey & Company", "한국관광공사")
  title: string; // 보고서/자료명 (e.g. "Global Wellness Economy Monitor 2025")
  year: string; // 발행연도 (e.g. "2025")
  tier: 'Tier 1 (Primary / Official)' | 'Tier 2 (Global Consulting & Research)' | 'Tier 3 (Reliable Business Media)' | string;
  appliedTo?: string; // 분석 활용 영역 (e.g. "웰니스 시장 규모 및 수면 투어리즘 동향 분석")
  url?: string; // 원문 링크
  confidence?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL'; // 근거 수준
  note?: string; // 검증 메모 (e.g. "공식 확인 자료" / "기관별 정의 차이 유의")
}

export interface KeyTrend {
  id: string;
  title: string;
  category?: string;
  region?: string;
  publishedDate?: string;
  verifiedDate?: string;
  recencyDays?: number;
  sourceType?: TrendSourceType;
  crossChecked?: boolean;
  sourceName?: string;
  sourceUrl?: string; // 개별 확인된 기사/뉴스룸 콘텐츠 URL
  officialUrl?: string; // 기업/브랜드 공식 홈페이지 URL
  relatedCompanies?: string[];

  // Enhanced Sectioning & Sub-dimension Classification
  section?: '업계 핵심 변화' | '주요 브랜드/기업 움직임' | '골프장/리조트 사례' | '기술/서비스' | '소비자 변화' | '제휴 아이디어' | string;
  subDimension?: string; // e.g., '거리측정기/워치', '골프장 운영', '2인 플레이' 등
  brandName?: string; // 기업/브랜드명 (Garmin, Voice Caddie 등)
  recentActivity?: string; // 최근 실제 활동
  relatedProducts?: string[]; // 관련 제품/서비스

  // Simplified Trend Card fields (User Intent)
  whatIsHappening?: string; // 무슨 일이 일어나고 있나 (실제 확인된 사실 2~3줄)
  whyNotable?: string; // 왜 주목할 만한가 (시장/소비 변화 1~2줄)
  iparkResortAngle?: string; // IPARK리조트에서 보면 (활용 가능성이 있을 경우 1~2줄 / 없으면 '직접 적용보다 시장 관찰 필요')
  hasDirectApplication?: boolean; // false if '직접 적용보다 시장 관찰 필요'

  description: string;
  whyGrowing: string;
  consumerBehavior: string;
  corporateUsage: string;
  futureOutlook: string;
  tags: string[];
  oakValleyOpportunity?: OakValleyOpportunity;
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
  sourceCitation?: string; // e.g. "McKinsey, 2026; Skift, 2025"
  factData?: string; // FACT: 무엇이 실제로 일어나고 있는가
  evidenceData?: string; // EVIDENCE: 어떤 데이터와 자료가 이를 뒷받침하는가
  implicationData?: string; // IMPLICATION: 기업에게 어떤 의미가 있는가
}

export interface MetricChartPoint {
  year: string;
  value: number;
}

export interface SignalMetric {
  label: string;
  currentValue: string;
  yoyChange: string;
  forecast: string;
  unit: string;
  chartData?: MetricChartPoint[];
  source?: string; // e.g. "Global Wellness Institute, 2025"
  sourceTier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
  sourceNote?: string;
}

export interface BrandCase {
  id: string;
  brandName: string;
  projectTitle: string;
  action: string;
  whyNotable: string;
  takeaway: string;
  sourceCitation?: string;
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
}

export interface EmergingSignal {
  title: string;
  description: string;
  potentialImpact: string;
  sourceCitation?: string;
}

export interface SearchInterestDataPoint {
  period: string; // e.g. "2025-09"
  ratio: number; // 0~100 상대 관심지수
  formattedDate?: string;
}

export interface SearchKeywordGroupInterest {
  title: string;
  keywords: string[];
  data: SearchInterestDataPoint[];
}

export interface SearchMomentumSummary {
  isConnected: boolean; // Naver DataLab API 연결 여부
  sourceName: string; // "Naver DataLab Search Trend API"
  trend12Months: 'UP' | 'DOWN' | 'STABLE';
  trend12MonthsLabel: string; // e.g. "12개월 추세 ↑ (+24.5%)"
  recent3MonthsChange: string; // e.g. "최근 3개월 관심도 +18.2% 상승"
  peakPeriod: string; // e.g. "최고 관심 시점: 2026년 05월 (지수 100)"
  relatedKeywords: string[]; // e.g. ["반려동물 건강", "펫 헬스케어", "펫푸드", "반려견 동반 여행"]
  ageGenderInsight?: string;
  deviceInsight?: string;
  disclaimer: string;
}

export interface SearchInterestMomentumSection {
  momentumSummary: SearchMomentumSummary;
  keywordGroupsData: SearchKeywordGroupInterest[];
  expandedKeywords: string[];
}

export interface BusinessOpportunity {
  id: string;
  opportunity: string;
  targetCustomer: string;
  possiblePartner: string;
  businessModel: string;
  expectedBenefit: string;
}

export interface TrendRadarItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  publishedDate: string;
  sourceType: TrendSourceType;
  sourceName: string;
  sourceUrl?: string;
  officialUrl?: string;
  brandName?: string;
  relatedCompany?: string;
  crossChecked?: boolean;
}

export interface TrendReport {
  query: string;
  intentType?: 'INDUSTRY_DEEP_DIVE' | 'CROSS_INDUSTRY'; // 검색 의도 분류
  targetIndustry?: string; // e.g. "골프", "뷰티", "F&B"
  detectedSubDimensions?: string[]; // 골프/산업 검색 시 실제 결과가 존재하는 세부 탐색축 목록
  sectionsPresent?: string[]; // 결과에 존재하는 섹션 목록 (업계 핵심 변화, 주요 브랜드/기업 움직임 등)
  filters: TrendFilter;
  generatedAt: string;
  recencyRangeUsed?: '7일 이내' | '30일 이내' | '90일 이내';
  trendRadar?: TrendRadarItem[];
  totalCount?: number;
  classifiedIndustries?: string[];
  expandedKeywords?: string[];
  searchInterestMomentum?: SearchInterestMomentumSection;
  executiveSummary: string[];
  keyTrends: KeyTrend[];
  metrics: SignalMetric[];
  brandCases: BrandCase[];
  emergingSignals: EmergingSignal[];
  opportunities: BusinessOpportunity[];
  references?: ReferenceSource[];
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

export interface DashboardCoreInsight {
  id: string;
  category: string; // 분야 (e.g. "호텔 · 웰니스", "F&B · 오프라인", "골프 · 체류형")
  title: string; // 핵심 변화
  whyNotable: string; // 왜 주목해야 하는지 / 핵심 내용
  oakValleyAngle: string; // Oak Valley 관점 한 줄
  source: string; // 출처 (공식 웹사이트 / 언론)
  verifiedDate: string; // 확인일 (e.g. "2026.08.31")
  evidenceLevel: 'VERIFIED FACT' | 'AI STRATEGIC INSIGHT';
  isNew?: boolean; // 새롭게 확인된 신호
}

export interface DashboardFeaturedBrand {
  id: string;
  brandName: string; // 브랜드명
  industry: string; // 산업 (e.g. "F&B / Gourmet", "Wellness Tech", "Outdoor Gear", "Fashion / Lifestyle", "Mobility")
  recentActivity: string; // 최근 움직임 (신제품 출시, 팝업, 협업, 오프라인 행사 등)
  whyNotable: string; // 왜 지금 주목하는가
  partnershipAngle: string; // Oak Valley Partnership Angle
  source: string; // 공식 출처
  verifiedDate: string; // 확인일
  evidenceLevel: 'VERIFIED FACT' | 'AI STRATEGIC INSIGHT';
  isNew?: boolean; // 새롭게 확인된 브랜드
}

export interface DashboardCompetitorPromotion {
  id: string;
  facilityName: string; // 시설/브랜드명 (e.g. "아난티 앳 부산", "파크로쉬 리조트앤웰니스", "해슬리 나인브릿지")
  type: string; // 유형/카테고리 (e.g. "패키지 프로모션", "웰니스 리트릿", "골프 이벤트", "F&B 다이닝")
  title: string; // 행사 · 프로모션명
  period: string; // 기간 (e.g. "2026.08.15 ~ 2026.10.31")
  summary: string; // 주요 내용 / 핵심 요약
  whyNotable: string; // 왜 참고할 만한지
  source: string; // 공식 출처 (1순위 공식 홈페이지 / 2순위 언론)
  sourceUrl?: string;
  verifiedDate: string; // 확인일
  evidenceLevel: 'VERIFIED FACT' | 'AI STRATEGIC INSIGHT';
  isNew?: boolean; // 새롭게 확인된 프로모션
}

export interface DashboardMarketShiftIndustry {
  industry: string; // e.g. "스포츠", "웰니스", "F&B", "호텔·리조트", "골프", "패션·라이프스타일", "테크"
  confirmedCaseCount: number; // 수집된 주요 움직임/사례 수
  keyMovementSummary: string; // 대표적인 주요 움직임 요약
}

export interface DashboardPartnershipOpportunity {
  id: string;
  opportunity: string; // 기회 아이디어
  targetIndustryBrand: string; // 연결 가능한 산업/브랜드
  oakValleyAsset: string; // Oak Valley 활용자산
  whyNotable: string; // 왜 지금 검토할 만한지
  evidenceLevel: 'AI STRATEGIC INSIGHT';
}

export interface DashboardKpis {
  newMarketSignalsCount: number; // 이번 주 신규 시장 신호
  newBrandsCount: number; // 이번 주 신규 브랜드
  competitorPromotionsCount: number; // 확인된 동종사 프로모션
  savedReviewsCount: number; // 저장된 제휴 검토
}

export interface DashboardSavedAnalysisItem {
  id: string;
  title: string; // 브랜드/주제명
  type: '트렌드 분석' | '기업 분석' | '동종업계 트렌드' | '제휴 조건 산정' | '제안서' | '행사 성과' | 'Knowledge Base';
  date: string; // 저장일
  targetTab: ActiveTab;
  payload?: any;
}

export interface ExecutiveDashboardData {
  lastUpdated: string; // YYYY.MM.DD HH:mm
  verifiedDate: string; // YYYY.MM.DD
  kpis: DashboardKpis;
  todaysSignals: DashboardCoreInsight[]; // Top 3
  marketSignals: DashboardCoreInsight[]; // All market signals (exact match with kpis.newMarketSignalsCount)
  featuredBrands: DashboardFeaturedBrand[]; // All featured brands (exact match with kpis.newBrandsCount)
  competitorPromotions: DashboardCompetitorPromotion[]; // All competitor promotions (exact match with kpis.competitorPromotionsCount)
  marketShifts: DashboardMarketShiftIndustry[]; // 산업별 시각화용
  partnershipOpportunities: DashboardPartnershipOpportunity[]; // 3개
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

export interface TodayTrendSignal {
  trend: string;
  description: string;
  whyNow: string;
  oakValleyRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  sourceCitation?: string;
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
}

export interface TodayBrandWatch {
  brand: string;
  recentMovement: string;
  whyWatch: string;
  oakValleyFit: string;
  recommendedTouchpoint: 'Golf' | 'Stay' | 'Wellness' | 'Outdoor' | 'F&B' | 'Event' | 'Membership' | 'Family' | 'Content' | string;
  sourceCitation?: string;
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
}

export interface TodayOakValleyOpportunity {
  type: 'QUICK WIN' | 'SIGNATURE' | 'FUTURE BET';
  idea: string;
  concept: string;
  targetCustomer: string;
  recommendedPartnerCategory: string;
  oakValleyAsset: string;
  expectedBenefit: string;
  executionDifficulty: '상' | '중' | '하';
}

export interface TodaysSignalsData {
  date: string; // YYYY.MM.DD
  trendSignals: TodayTrendSignal[];
  brandWatch: TodayBrandWatch[];
  opportunities: TodayOakValleyOpportunity[];
  whyThisMatters: {
    keyTakeaway: string;
    recommendedAction: string;
  };
  references?: ReferenceSource[];
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

export interface CompanyOverview {
  companyName: string;
  englishName?: string;
  summary: string;
  mainBusinesses: string[];
  mainBrands: string[];
  productsServices: string[];
  targetCustomers: string;
  marketPosition: string;
}

export interface BrandIdentity {
  positioning: string;
  targetCustomer: string;
  personality: string;
  coreMessage: string;
  keywords: string[]; // Exact 5 core keywords
  visualIdentity: string;
}

export interface MarketingTimelineItem {
  yearMonth: string;
  type: '캠페인' | '콜라보레이션' | '팝업스토어' | '이벤트' | '스폰서십' | '신제품' | '콘텐츠';
  title: string;
  description: string;
}

export interface MarketingDirection {
  focusAreas: string[];
  strategicAnalysis: string;
}

export type DomainCategory = 
  | 'Brand Experience'
  | 'Event'
  | 'Golf'
  | 'Wellness'
  | 'Accommodation'
  | 'F&B'
  | 'Pop-up'
  | 'Content'
  | 'Membership'
  | 'VIP'
  | 'Product Experience'
  | 'Package'
  | 'Community';

export interface PartnershipOpportunity {
  id: string;
  domain: DomainCategory;
  idea: string;
  whyThisBrand: string;
  brandBenefit: string;
  businessBenefit: string;
  targetCustomer: string;
  difficulty: '상' | '중' | '하';
  potential: '높음' | '중간';
}

export interface AIRecommendation {
  rank: 'BEST 1' | 'BEST 2' | 'BEST 3';
  badgeText: string;
  ideaTitle: string;
  reasoning: string;
}

export interface CompanyReport {
  companyName: string;
  generatedAt: string;
  overview: CompanyOverview;
  brandIdentity: BrandIdentity;
  recentActivities: MarketingTimelineItem[];
  marketingDirection: MarketingDirection;
  partnerships: PartnershipOpportunity[];
  recommendations: AIRecommendation[];
  relatedTrends: string[];
  oakValleyFit?: OakValleyFit;
  whyOakValley?: WhyOakValley;
  references?: ReferenceSource[];
  evidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
  knowledgeBaseMetadata?: KnowledgeBaseMetadata;
}

// --- COMPETITOR MONTHLY BEST 5 TYPES ---
export type CompetitorCategoryTag =
  | 'PACKAGE'
  | 'PARTNERSHIP'
  | 'WELLNESS'
  | 'GOLF & SPORTS'
  | 'F&B'
  | 'FAMILY'
  | 'PET'
  | 'CULTURE'
  | 'SEASONAL'
  | 'NEW EXPERIENCE';

export interface CompetitorBest5Item {
  id: string;
  rank: number;
  month: string; // e.g. "2026.08"
  isDomestic: boolean;
  regionText: '국내' | '해외';
  companyBrand: string; // 운영사 / 브랜드
  hotelResortName: string; // 호텔·리조트명
  title: string; // 프로모션 / 프로그램 / 제휴명
  categoryTags: CompetitorCategoryTag[]; // 1~2개
  oneLineSummary: string; // 한 줄 핵심 내용
  whyNoticed: string; // 왜 주목했는지
  oakValleyReference: string; // Oak Valley / PARK ROCHE 참고 포인트 1줄

  // Detailed Modal Fields (상세보기)
  period: string; // 기간
  priceInfo?: string; // 가격 (공식 확인 가능한 경우)
  programDetails: string; // 프로그램 구성
  isBrandPartnership: boolean; // 브랜드 협업 여부
  partnerBrandName?: string; // 협업 브랜드명
  officialSourceTitle: string; // 공식 출처
  officialSourceUrl: string; // 공식 출처 URL
  verificationDate: string; // 확인일 (YYYY.MM.DD)

  featureAnalysis: string; // 주목 포인트 (기존 상품과 비교한 특징 분석)
  oakValleyApplicability?: string; // Oak Valley 적용 아이디어 (골프/객실/F&B/액티비티 등)
  parkRocheApplicability?: string; // PARK ROCHE 적용 아이디어 (웰니스/리커버리/수면/명상 등)
}

// --- COMPETITOR INTELLIGENCE RADAR & WATCHLIST TYPES ---
export type CompetitorMainCategory =
  | 'ALL'
  | 'RESORT'
  | 'HOTEL'
  | 'GOLF'
  | 'WELLNESS_SPA'
  | 'TRAVEL_PLATFORM'
  | 'SPORTS_LEISURE'
  | 'GLOBAL'
  | 'HOTEL_RESORT'
  | 'SPORTS_OUTDOOR'
  | 'TRAVEL_LEISURE';

export type CompetitorSectorType =
  | '리조트'
  | '호텔'
  | '골프'
  | '웰니스·스파'
  | '여행 플랫폼'
  | '스포츠·레저'
  | '글로벌'
  | '호텔·리조트'
  | '복합';
export type CompetitorTimeframe = '30d' | '7d' | '3m' | '6m' | '1y';

export type CompetitorTrendType =
  | '전체'
  | '프로모션'
  | '패키지'
  | '브랜드 제휴'
  | '행사·이벤트'
  | '골프'
  | '웰니스'
  | 'F&B'
  | '콘텐츠'
  | '멤버십'
  | '시설·신사업';

export type SourcePriorityTier = '1ST_PARTY_OFFICIAL' | '2ND_PARTY_PRESS' | '3RD_PARTY_PUBLIC';

// 1차 개편 전용 타입
export type CompetitorWatchCategory = 'GOLF' | 'RESORT' | 'HOTEL' | 'HOTEL_RESORT' | 'WELLNESS' | 'WELLNESS_SPA';
export type CompetitorPriorityTier = 1 | 2 | 3 | 4;

export type CompetitorChangeType =
  | 'PRICE DOWN'
  | 'PRICE UP'
  | 'NEW PACKAGE'
  | 'NEW PROMOTION'
  | 'NEW EVENT'
  | 'NEW PARTNERSHIP'
  | 'OPERATING CHANGE'
  | 'NEW SERVICE'
  | 'HOTEL'
  | 'WELLNESS'
  | 'SPA'
  | 'PACKAGE'
  | 'PARTNERSHIP'
  | 'NEW EXPERIENCE'
  | 'FACILITY';

export type CompetitorTabType =
  | 'ALL'
  | 'GOLF_WATCH'
  | 'RESORT_WATCH'
  | 'WELLNESS_WATCH'
  | 'PRICE_CHANGE'
  | 'PROMOTION_PACKAGE'
  | 'EVENT_PARTNERSHIP'
  | 'NEW_SERVICE';

export interface CompetitorWatchListItem {
  id: string;
  competitorName?: string;
  companyName: string;
  category: CompetitorSectorType | CompetitorWatchCategory | string;
  watchCategory?: CompetitorWatchCategory;
  region: string; // e.g. "원주·횡성", "춘천·강촌", "홍천·평창·강릉·고성", "수도권 프리미엄", "국내", "해외"
  priority?: CompetitorPriorityTier | number;
  priorityTier?: string; // e.g. "PRIORITY_1", "RESORT_COMPETITOR"
  officialWebsite?: string;
  officialUrl?: string;
  pricingUrl?: string;
  pricingNoticeUrl?: string;
  reservationUrl?: string;
  reservationNoticeUrl?: string;
  promotionUrl?: string;
  noticeUrl?: string;
  packageUrl?: string;
  lastCheckedAt?: string;
  lastChangedAt?: string;
  lastVerifiedDate?: string;

  // 골프 전용 저장 필드
  weekdayGreenFee?: number | string;
  fridayGreenFee?: number | string;
  saturdayGreenFee?: number | string;
  sundayGreenFee?: number | string;
  cartFee?: number | string;
  caddieFee?: number | string;
  twoPlayerAvailable?: boolean | string;
  threePlayerAvailable?: boolean | string;
  nightGolf?: boolean | string;
  selfGolf?: boolean | string;
  packageAvailable?: boolean | string;

  // 호텔/리조트 및 웰니스 전용 태그/시설
  wellnessFacilities?: string[];
  hotelScale?: string;
  spaType?: string;

  memo?: string;
  isActive?: boolean;
  country?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface CompetitorSignalCardItem {
  id: string;
  competitorName: string;
  companyName?: string;
  category?: CompetitorWatchCategory;
  region: string;
  priority?: CompetitorPriorityTier | number;
  priorityTier?: string;
  watchCategory?: CompetitorWatchCategory;
  changeType: CompetitorChangeType | string;
  changeTitle?: string;
  summary?: string;
  changeDetails: string;
  details?: string;
  previousValue?: string;
  currentValue?: string;
  priceDifference?: string;
  changeDiffText?: string;
  sourceType?: string;
  sourceName?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  officialSourceUrl?: string;
  publishedAt?: string;
  eventDate?: string;
  checkedAt?: string;
  verifiedDate?: string;
  whyImportant: string;
  oakValleyCheckpoint: string;
  iparkCheckpoint?: string;
  isTopSignal?: boolean;
  isImportant?: boolean;
}

export interface CompetitorKPIs {
  watchCount: number;
  priceChangeCount: number;
  newPromotionCount: number;
  newPackageCount: number;
  newPartnershipCount: number;
  notableCompetitorCount: number;
}

export interface CompetitorRadarItem {
  id: string;
  companyName: string;            // 회사/시설명
  category: CompetitorSectorType; // 호텔·리조트 | 골프 | 복합
  region: '국내' | '해외';
  country: string;               // e.g. "한국", "일본", "미국"
  whatWasDone: string;           // 무엇을 했는가
  periodText: string;            // 행사/프로모션 기간 (e.g. "2026.08.15 ~ 2026.09.30" or "상시 운영")
  status: 'ONGOING' | 'UPCOMING' | 'ENDED';
  targetCustomer: string;        // 대상 고객
  priceInfo: string;             // 가격 (공식가격 or "날짜·요일·시간대에 따라 변동" or "가격 확인 필요")
  keyFeatures: string[];         // 핵심 특징
  whyNotable: string;            // 왜 주목할 만한가
  aiOakValleyPoint: string;      // Oak Valley 참고 포인트 (AI INSIGHT)
  sourceTitle: string;           // 출처명
  sourceUrl?: string;
  sourcePriority: SourcePriorityTier; // 1순위 공식 / 2순위 신뢰언론 / 3순위 기타
  dataDate: string;              // 자료 작성일 (YYYY.MM.DD)
  verificationDate: string;      // 확인일 (YYYY.MM.DD)
  isBest10?: boolean;
  best10Rank?: number;
  best10Reason?: string;         // BEST 10 선정 이유 (1문장)
  trendTypes: string[];          // e.g. ["패키지", "웰니스"]
  isNewDiscovery?: boolean;      // 새로 발견된 업체 여부 (Watch List에 미등록)
  isSaved?: boolean;
}

export interface OakValleyOpportunityRadar {
  referProducts: string;         // 지금 참고할 상품
  referPromotions: string;       // 참고할 프로모션
  partnerIndustries: string;     // 제휴 가능 산업
  golfOperationNotes: string;    // 골프 운영 참고
  contentTopics: string;         // 콘텐츠 주제
}

export interface DiscoveredCompetitor {
  companyName: string;
  category: CompetitorSectorType;
  region: '국내' | '해외';
  whyWatch: string;              // 왜 주목하는지
  recentMovement: string;        // 최근 확인된 움직임
  sourceTitle: string;
  sourceUrl?: string;
}

export interface CompetitorRadarResponse {
  success: boolean;
  lastUpdated: string;           // YYYY.MM.DD HH:mm
  filters: {
    category: CompetitorMainCategory;
    timeframe: CompetitorTimeframe;
    trendTypes: string[];
    searchQuery: string;
  };
  marketSummary: string[];        // 이번 달 동종업계 주요 변화 (3~5개)
  oakValleyOpportunity: OakValleyOpportunityRadar;
  best10Items: CompetitorRadarItem[]; // 이번 달 주목할 동종업계 BEST 10
  allItems: CompetitorRadarItem[];    // 전체 검색결과
  discoveredCompetitors: DiscoveredCompetitor[]; // 새롭게 확인된 경쟁사 (최대 5개)
  watchList: CompetitorWatchListItem[];
  savedItems: CompetitorRadarItem[];
  searchStats: {
    totalCandidatesSearched: number;
    selectedResultCount: number;
    hotelResortCount: number;
    golfCount: number;
    duplicateRemovedCount: number;
    primarySources: string[];
    difficultSearchAreas: string;
  };
}

// --- WEEKLY CONTENT PLANNER TYPES ---

export type InstagramFormatType = 'Card News' | 'Reels' | 'Single Image';

export interface WeeklyTrendTopic {
  id: string;
  trendTitle: string;
  category: string;
  weeklyShift: string; // 이번 주 변화
  coreEvidence: string; // 핵심 근거 (FACT)
  keyBrandsAndCases: string[]; // 주요 브랜드 / 사례 (FACT)
  oakValleyParkRocheConnection: string; // Oak Valley / PARK ROCHE 연결 포인트 (CONTENT IDEA)
  source: {
    institution: string;
    title: string;
    year: string;
    tier?: string;
    url?: string;
  };
  relevanceScore: number; // 0 ~ 100
  tags: string[];
}

export interface InstagramPostStructureSlide {
  slideNumber: number;
  slideType: 'COVER' | 'CONTENT' | 'DATA' | 'CASE' | 'CTA' | 'OUTRO';
  headline: string;
  bodyText: string;
  visualDirection: string;
  designerNote?: string;
}

export interface InstagramReelsScene {
  sceneNumber: number;
  durationSec: string; // e.g. "0~3s (Hook)", "3~8s (Scene 1)"
  visualAction: string;
  audioVoiceover: string;
  onScreenText: string;
  filmingTip: string;
}

export interface InstagramContentIdea {
  id: string;
  trendId: string;
  contentTitle: string;
  coreMessage: string;
  targetBrand: 'Oak Valley' | 'PARK ROCHE' | '공통';
  contentFormat: InstagramFormatType;
  targetAudience: string;
  isThisWeeksPick?: boolean;
  recommendationRationale?: string; // THIS WEEK'S PICK 추천 사유 (2~3문장)
  
  // Separation of Concerns: FACT vs CONTENT IDEA
  factCheck: {
    facts: string[]; // 검증된 시장 사실 (FACT)
    creativeIdeas: string[]; // 오크밸리 적용 아이디어 (CONTENT IDEA)
    verifiedSource: string; // 검증 출처
  };

  // Post Structure (Ready-to-use template)
  postStructure: {
    slides?: InstagramPostStructureSlide[];
    reelsScenes?: InstagramReelsScene[];
    singleImageComposition?: {
      visualComposition: string;
      captionLead: string;
    };
  };

  // Ready-to-use Draft Caption
  draftCaption: {
    headline: string;
    body: string; // 단락 구분이 확실한 캡션 원문
    callToAction: string;
    hashtags: string[];
  };

  // Visual / Filming Direction
  visualDirection: {
    concept: string;
    locationSpot: string; // 오크밸리 참나무 숲길, 성문안 CC, 파크로쉬 글래스하우스 등
    colorTone: string;
    propsAndModels: string;
  };
}

export interface WeeklyPlannerData {
  weekId: string; // e.g. "2026-W34"
  weekLabel: string; // e.g. "2026년 8월 3주차 (08.17 ~ 08.23)"
  period: string; // "2026.08.17 - 2026.08.23"
  status: 'ACTIVE' | 'ARCHIVED';
  summaryOverview: {
    totalSignalsAnalyzed: number;
    curatedTrendsCount: number;
    instagramDraftsCount: number;
    topTheme: string;
  };
  thisWeeksPick: {
    contentIdeaId: string;
    title: string;
    format: InstagramFormatType;
    targetBrand: 'Oak Valley' | 'PARK ROCHE' | '공통';
    rationale: string;
    expectedEngagement: string;
  };
  weeklyTrends: WeeklyTrendTopic[];
  contentDrafts: InstagramContentIdea[];
  generatedAt: string;
}

// ==========================================
// POST-EVENT PERFORMANCE & ONLINE BUZZ TRACKER
// ==========================================

export type PostEventPeriod = '7DAYS' | '30DAYS' | '90DAYS' | 'ALL' | 'CUSTOM';

export type PostEventChannel =
  | '뉴스/기사'
  | '네이버 블로그'
  | '네이버 카페'
  | 'Instagram'
  | 'YouTube'
  | 'TikTok'
  | '공식 홈페이지/SNS'
  | '기타 웹사이트';

export interface PostEventRegistration {
  eventId?: string;
  projectName?: string; // 프로젝트명 (선택)
  eventName: string; // 행사명 / 프로젝트명
  eventDate: string; // 진행 기간 (선택)
  brandName: string; // 브랜드/파트너 (선택)
  location: string; // 장소 (선택)
  locations?: string[]; // 복수 선택된 장소 목록
  personNames?: string[]; // 관련 인물 (선택, 예: 이시우 프로)
  keywords: string[]; // 관련 키워드 (선택)
  officialHashtags: string[]; // 공식 해시태그
  isExistingEvent?: boolean; // 저장된 행사 불러옴 여부
  lastVerifiedDate?: string; // 최근 확인일 (YYYY-MM-DD)
}

export interface SavedEventItem {
  id: string;
  projectName?: string;
  eventName: string;
  brandName: string;
  eventDate: string;
  locations: string[];
  location: string;
  personNames?: string[];
  keywords: string[];
  officialHashtags: string[];
  lastVerifiedDate: string;
  createdAt: string;
  report?: PostEventAnalysisReport;
}

export interface RecentSearchItem {
  id: string;
  projectName?: string;
  eventName: string;
  brandName: string;
  locations: string[];
  personNames?: string[];
  keywords: string[];
  officialHashtags: string[];
  searchedAt: string;
}

export interface PostEventSearchQueryItem {
  query: string; // 예: "Garmin + 오크밸리", "가민 + 오크밸리CC", "Garmin Golf + Oak Valley"
  type: string;
  purpose: string;
}

export interface PostEventContentItem {
  id: string;
  title?: string; // 실제 검색 확인 제목
  titleOrSummary: string; // 제목 또는 게시물 내용 요약
  author: string; // 계정/작성자/매체명
  platform: 'Instagram' | '블로그·카페' | '언론' | 'YouTube' | '기타' | string; // 플랫폼
  channel: PostEventChannel | string;
  publishDate: string; // 게시일 YYYY-MM-DD
  views: number | null; // 공개 수치만 사용. 미공개 시 null
  reactions?: number | null; // 공개 확인 반응 (좋아요+댓글 등)
  likes: number | null; // 공개 수치만 사용. 미공개 시 null
  comments: number | null; // 공개 수치만 사용. 미공개 시 null
  shares: number | null; // 공개 수치만 사용. 미공개 시 null
  url: string; // 실제 검색에서 확인한 원문 URL
  verifiedDate: string; // 확인일 YYYY-MM-DD
  connectionEvidence?: string; // 이 프로젝트와 연결된 근거 (브랜드·장소·기간·인물·키워드 복수 일치)
  relevanceReason: string; // 연관 사유
  
  // 오크밸리/파크로쉬 노출 여부
  isOakValleyMentioned?: boolean; // 오크밸리 이름 언급
  isOakValleyLocationMentioned?: boolean; // 장소 언급
  isOakValleyHashtag?: boolean; // 태그/해시태그
  isOakValleyAccountTagged?: boolean; // 공식계정 태그
  isFacilityLandscapeExposed?: boolean; // 시설/풍경 노출
  
  relevanceScore?: number; // 0-100 관련성 점수
  isDeduplicated?: boolean; // 중복 제거 여부
}

export interface PostEventInternalData {
  instagramReach?: number | null; // Instagram 도달
  instagramImpressions?: number | null; // 노출
  instagramSaves?: number | null; // 저장
  instagramShares?: number | null; // 공유
  reelsViews?: number | null; // 릴스 조회
  linkClicks?: number | null; // 링크 클릭
  brandReportNotes?: string; // 브랜드 측 결과보고서 요약
  influencerDataNotes?: string; // Influencer 결과자료 요약
  oakValleyOfficialSnsNotes?: string; // 오크밸리 공식 SNS 결과
  updatedAt?: string;
}

export interface PostEventTopContentItem {
  rank: number;
  content: PostEventContentItem;
  contentTypeDescription: string; // 어떤 콘텐츠였는지 (예: 오크밸리 참나무 숲길을 직접 걸으며 착화감을 릴스로 연출한 영상)
  reactionDescription: string; // 어떤 반응이 있었는지 (예: 조회수 4.2만 회, 댓글 128개 "오크밸리에 이런 숲길이 있었나요?", "신발 착화감 궁금해요")
  whyHighImpact: string; // 왜 반응이 좋았는지 (예: 리조트의 자연 풍경과 제품의 편안함이 직관적 비주얼로 잘 전달됨)
}

export interface PostEventSentimentAnalysis {
  positiveTopics: Array<{ topic: string; count: number; exampleQuotes: string[] }>;
  negativeOrRegretTopics: Array<{ topic: string; count: number; exampleQuotes: string[] }>;
  keyInterestAreas: string[]; // 예: 골프장에서 걷는 경험, 자연환경/풍경, 가족 참여, 브랜드 제품 문의, 가격 관련 의견, 재참여 의사
}

export interface PostEventResortExposureAnalysis {
  exposureLevel: 'BRAND_AND_OAKVALLEY_COEXPOSURE' | 'OAKVALLEY_SEPARATE_VIRAL' | 'BRAND_FOCUSED_NEED_IMPROVEMENT';
  exposureTitle: string; // 예: "브랜드와 오크밸리가 함께 노출됨"
  exposureSummary: string;
  oakValleyNameMentionRatePercent: number;
  oakValleyLocationMentionRatePercent: number;
  oakValleyHashtagRatePercent: number;
  oakValleyAccountTagRatePercent: number;
  facilityLandscapeExposureRatePercent: number;
}

export interface PostEventBuzzPersistenceAnalysis {
  persistenceStatus: 'IMMEDIATE_PEAK_ONLY' | 'SUSTAINED_2_TO_4_WEEKS' | 'LONG_TERM_ADDITIONS_AFTER_MONTH' | 'NO_NEW_POSTS';
  persistenceStatusLabel: string; // 예: "2~4주 동안 지속"
  description: string;
  dateDistribution: Array<{ date: string; count: number }>;
}

export interface PostEventExecutiveQA {
  howFarSpread: string; // 얼마나 많이 퍼졌나?
  whereSpreadMost: string; // 어디에서 가장 많이 퍼졌나?
  bestReactedContent: string; // 어떤 콘텐츠 반응이 가장 좋았나?
  whatPeopleInterestedIn: string; // 사람들은 무엇에 관심을 보였나?
  wasOakValleyExposed: string; // 오크밸리는 충분히 노출됐나?
  didBuzzContinueAfterEvent: string; // 행사 후에도 반응이 이어졌나?
  whatToDoNextEvent: string; // 다음 행사에서 무엇을 더 해야 하나?
}

export interface PostEventActionableRecommendation {
  id: string;
  category: '장소태그/계정' | '포토존/해시태그' | '후속콘텐츠' | '운영개선';
  title: string;
  actionDetail: string; // 실무 협상 및 운영에 바로 사용할 제안
  expectedImpact: string;
}

export interface PostEventParsedReport {
  extractedMetrics: {
    instagramReach?: number;
    instagramImpressions?: number;
    instagramSaves?: number;
    instagramShares?: number;
    reelsViews?: number;
    linkClicks?: number;
    totalParticipantsConfirmed?: number;
    influencerPostsCount?: number;
  };
  keyTakeaways: string[];
  rawSummary: string;
  confidenceScore: number;
  parsedAt: string;
  userApproved: boolean; // 사용자 승인 여부 (UI 상 수정/승인 후 확정)
}

export interface PostEventAnalysisReport {
  eventId: string;
  registration: PostEventRegistration;
  searchQueries: PostEventSearchQueryItem[];
  selectedPeriod: PostEventPeriod;
  customStartDate?: string;
  customEndDate?: string;
  
  // 6. 상단 실시간 공개 지표 (실검색 검증 수치만 사용)
  summaryKpi: {
    verifiedContentCount: number; // 확인된 관련 콘텐츠 (예: 38건)
    articleCount: number; // 기사 (예: 6건)
    snsCommunityCount: number; // SNS·블로그·커뮤니티 (예: 32건)
    verifiableViewsTotal: number; // 공개 확인 가능한 조회수 합산
    verifiableReactionsTotal: number; // 공개 확인 가능한 반응 (좋아요/댓글/공유 합산)
    latestPostDate: string; // 최근 관련 게시물 날짜 (YYYY-MM-DD)
    deduplicatedRemovedCount: number; // 중복 제거된 무관/복제 수
    verifiedDataNote: string; // 예: "검색 가능한 공개 범위에서 확인된 38건 (추정 수치 없음)"
  };
  
  // 7. 콘텐츠 목록
  contents: PostEventContentItem[];
  
  // 8. TOP 5
  topContents: PostEventTopContentItem[];
  
  // 9. 사람들의 반응
  sentimentAnalysis: PostEventSentimentAnalysis;
  
  // 10. 오크밸리 노출도
  resortExposure: PostEventResortExposureAnalysis;
  
  // 11. 행사 후 확산 추이
  buzzPersistence: PostEventBuzzPersistenceAnalysis;
  
  // 차트 및 요약용 파생 필드
  executiveSummaryParagraph?: string;
  channelStats?: { channel: string; count: number }[];
  dailyTimeline?: { date: string; count: number }[];
  
  // 12. 내부 자료 (비공개 성과)
  internalData: PostEventInternalData;
  
  // 13. 파싱된 리포트
  parsedReport?: PostEventParsedReport;
  
  // 14. 최종 평가 (Q&A)
  executiveQA: PostEventExecutiveQA;
  
  // 15. 다음 행사 개선안
  recommendations: PostEventActionableRecommendation[];
  
  searchedAt: string; // 조사 일시
  isHistoryComparisonAvailable?: boolean;
  previousSearchCount?: number;
  previousSearchedAt?: string;
}

// --- MULTI CHANNEL INTEREST MONITOR TYPES ---

export type InterestPeriod = '7DAYS' | '30DAYS' | '3MONTHS' | '6MONTHS' | '1YEAR';

export type InterestChannelCategory = 'ALL' | 'SEARCH' | 'SNS_VIDEO' | 'BLOG_COMMUNITY' | 'NEWS';

export interface InterestChannelItem {
  id: string;
  channel: 'NAVER' | 'Google' | 'YouTube' | 'Instagram' | 'TikTok' | 'NAVER Blog' | 'NAVER Cafe' | 'News';
  category: InterestChannelCategory;
  title: string;
  summary: string;
  url: string;
  publishDate: string;
  author: string;
  views: number | null; // null if platform does not publicly expose view count
  reactions: number | null; // null if platform does not publicly expose reactions
  source: string;
  verifiedNote: string;
}

export interface InterestDemographicItem {
  channel: string; // e.g., 'NAVER 검색 데이터 (DataLab API)'
  group: string; // e.g., '30~39세', '40~49세', '여성 58%', '남성 42%'
  interestShare: number; // relative %
  sourceNote: string; // e.g. 'NAVER Search Trends API 공식 기준'
  isAvailable: boolean; // if false, '확인할 수 없음 (공개 API 미제공)'
  unavailabilityReason?: string;
}

export interface InterestTopicItem {
  topic: string; // e.g., '피클볼', '골프', '숙박', '스키', '가족여행', '맛집'
  changeRate: number; // e.g., +42.5
  trendStatus: 'RISING' | 'STABLE' | 'DECLINING';
  channelBreakdown: string;
  relevanceToOakValley: string;
  sourceNote: string;
}

export interface CompetitorInterestComparison {
  brand: string; // e.g., '오크밸리', '비발디파크', '휘닉스', '용평'
  naverSearchIndex: number; // 0~100 relative index
  googleTrendsIndex: number; // 0~100 relative index
  verifiedContentCount: number;
  newsMentionCount: number;
  topSurgeTopic: string;
  sourceNote: string;
}

export interface InternalChannelStatus {
  channelName: 'Oak Valley 홈페이지' | '공식 Instagram' | '예약페이지';
  status: 'DATA_CONNECTION_REQUIRED';
  message: string; // '실제 데이터 연결 필요 (GA4 / Search Console / Instagram Insights 미연결)'
  verifiedNote: string;
}

export interface PostEventLinkItem {
  eventId: string;
  eventName: string;
  eventDate: string;
  preEventInterestIndex: number;
  duringEventInterestIndex: number;
  postEventInterestIndex: number;
  contentGrowthPercent: number;
  disclaimer: string;
}

export interface InterestAIAnalysis {
  factSummary: string; // [FACT] 실증 데이터 수치 요약
  risingTopics: string[]; // 1. 지금 관심이 올라가는 것
  decliningTopics: string[]; // 2. 관심이 줄어드는 것
  channelReactionSummary: string; // 3. 어떤 채널에서 반응이 나타나는지
  competitorDifference: string; // 4. 경쟁사와 다른 점
  weeklyContentIdeas: string[]; // 5. 이번 주 콘텐츠로 활용할 주제
  productPromotionIdeas: string[]; // 6. 상품/프로모션으로 검토할 주제
  partnershipOpportunities: string[]; // 7. 제휴 기회를 찾아볼 주제
  sourceNote: string;
}

export interface InterestContentTrendItem {
  date: string;
  count: number;
  newsCount?: number;
  blogCount?: number;
  snsCount?: number;
  youtubeCount?: number;
}

export interface InterestTopKeywordItem {
  rank: number;
  keyword: string;
  count: number;
  category: string;
  context: string;
}

export interface InterestKeyIssueItem {
  id: string;
  title: string;
  factEvidence: string;
  representativeSource: string;
  marketMeaning: string;
  sourceUrl?: string;
  whatHappened?: string;
  whyHighlighted?: string;
  relatedContentCount?: number;
  evidenceContents?: Array<{
    title: string;
    sourceName: string;
    publishDate: string;
    summary: string;
    url: string;
  }>;
}

export interface InterestBrandCompanyActivity {
  id: string;
  companyName: string;
  activityTitle: string;
  activityDate: string;
  relevanceContext: string;
  sourceName: string;
  sourceUrl: string;
}

export interface InterestBrandAnalysis {
  whyPeopleSearch: string[];
  whatPeopleLike: string[];
  repeatedInconveniences: string[];
  frequentlyMentionedFacilities: string[];
  highReactionContents: Array<{
    title: string;
    sourceName: string;
    publishDate: string;
    summary: string;
    url: string;
  }>;
  comparisons?: Array<{
    brandVs: string;
    summary: string;
  }>;
}

export interface InterestPeoplesVoice {
  isAvailable: boolean;
  unavailabilityNotice?: string;
  positives?: Array<{ topic: string; quote: string; count?: number }>;
  questions?: Array<{ topic: string; quote: string; count?: number }>;
  concerns?: Array<{ topic: string; quote: string; count?: number }>;
}

export interface InterestChannelDistributionItem {
  channelName: '뉴스/언론' | '블로그/카페' | '공개 SNS' | 'YouTube' | '브랜드 공식' | '기타 웹' | string;
  count: number;
  percentage: number;
  color: string;
}

export interface InterestIPARKApplicationItem {
  id: string;
  ideaTitle: string;
  applicableAsset: string;
  expectedEffectAndAction: string;
}

export interface InterestKeywordComparisonItem {
  keyword: string;
  contentVolume: number;
  mainChannel: string;
  topModifier: string;
  trendStatus: 'RISING' | 'STABLE' | 'DECLINING';
}

export interface InterestMonitorReport {
  query: string;
  compareQueries?: string[];
  period: InterestPeriod;
  searchedAt: string;
  periodExpanded?: boolean;
  periodNotice?: string;
  isBrandMode?: boolean;
  brandName?: string;
  statusState?: 'SUCCESS' | 'DATA_INSUFFICIENT' | 'SEARCH_ERROR';
  statusMessage?: string;
  sourcesSummary: {
    searchSource: string;
    snsSource: string;
    communitySource: string;
    newsSource: string;
  };
  summaryKpi: {
    confirmedContentCount: number;
    newsCount: number;
    top3Keywords: string[];
    activeChannelsCount: number;
    searchInterestChangePercent?: number;
    topRisingTopic?: string;
    topSurgeChannel?: string;
    verificationNote: string;
  };
  contentTrend?: InterestContentTrendItem[];
  topKeywords?: InterestTopKeywordItem[];
  risingTopicsList?: Array<{
    topic: string;
    changeRatePercent: number;
    channelDistributionText: string;
    reason: string;
  }>;
  channelDistribution?: InterestChannelDistributionItem[];
  keyIssues?: InterestKeyIssueItem[];
  brandCompanyActivities?: InterestBrandCompanyActivity[];
  brandAnalysis?: InterestBrandAnalysis;
  peoplesVoice?: InterestPeoplesVoice;
  representativeContents?: Array<{
    id: string;
    title: string;
    channelCategory: 'NEWS' | 'BLOG_CAFE' | 'SNS' | 'YOUTUBE' | 'OFFICIAL' | 'OTHER' | string;
    channelName: string;
    publishDate: string;
    summary: string;
    url: string;
    author?: string;
    views?: number | null;
    reactions?: number | null;
  }>;
  aiInsight?: {
    factSummary: string;
    marketInterpretation: string;
    actionableTakeaway: string;
  };
  iparkApplications?: InterestIPARKApplicationItem[];
  comparisons?: InterestKeywordComparisonItem[];
  reliabilityInfo?: {
    groundingSources: string[];
    verifiedAt: string;
    privacyNotice: string;
  };

  // Backwards compatibility
  channelItems?: InterestChannelItem[];
  demographics?: InterestDemographicItem[];
  relatedTopics?: InterestTopicItem[];
  competitorComparisons?: CompetitorInterestComparison[];
  internalChannels?: InternalChannelStatus[];
  postEventLinks?: PostEventLinkItem[];
  aiAnalysis?: InterestAIAnalysis;
}

export interface AuthUser {
  userId: string;
  username: string;
  name: string;
  team: string;
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  allowedMenus?: string[];
}

export interface CreatedByMeta {
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface AppMenuDef {
  key: ActiveTab;
  label: string;
  group: string;
}

export function isMenuAllowed(user: AuthUser | null | undefined, menuKey: ActiveTab): boolean {
  if (!user) return false;
  if (user.isAdmin) return true; // Admin always allowed
  if (!user.allowedMenus || user.allowedMenus.length === 0) {
    return true; // Default to allowed if allowedMenus not initialized
  }
  return user.allowedMenus.includes(menuKey) || (menuKey === 'proposal' && user.allowedMenus.includes('partnership'));
}

export const ALL_APP_MENUS: AppMenuDef[] = [
  { key: 'home', label: 'Dashboard (대시보드)', group: '메인' },
  { key: 'trend', label: '트렌드 탐색', group: '트렌드 & 인사이트' },
  { key: 'company', label: '기업 트렌드', group: '트렌드 & 인사이트' },
  { key: 'competitor', label: '동종업계 트렌드', group: '트렌드 & 인사이트' },
  { key: 'activation', label: '행사·팝업', group: '트렌드 & 인사이트' },
  { key: 'interest', label: '관심도 분석', group: '트렌드 & 인사이트' },
  { key: 'partnertarget', label: '파트너 타깃 찾기', group: '트렌드 & 인사이트' },
  { key: 'weeklyplanner', label: '콘텐츠 랩', group: 'MARKETING' },
  { key: 'pressrelease', label: '보도자료 작성', group: 'MARKETING' },
  { key: 'instagram_event', label: 'Instagram 이벤트', group: 'MARKETING' },
  { key: 'partnerperformance', label: '제휴 성과', group: '제휴 분석 & 제안' },
  { key: 'partnerpipeline', label: '제휴 진행관리', group: '제휴 분석 & 제안' },
  { key: 'postevent', label: '행사 후 성과', group: '제휴 분석 & 제안' },
  { key: 'partnership', label: '제휴 조건 계산', group: '제휴 분석 & 제안' },
  { key: 'proposal', label: '제안서 만들기', group: '제휴 분석 & 제안' },
  { key: 'knowledge', label: 'Knowledge Base', group: '자료' },
  { key: 'ratecard', label: '가격자료 DB', group: '자료' },
  { key: 'partnerdb', label: '파트너 DB', group: '자료' },
  { key: 'partnerlist', label: '제휴 제안 관리 히스토리', group: '자료' },
  { key: 'referencesite', label: '참고 사이트', group: '자료' },
];

export type ReferenceCategory =
  | '전체'
  | '검색 & 트렌드'
  | '시장조사'
  | '마케팅 리서치'
  | '글로벌 리서치'
  | '웰니스'
  | '관광'
  | '정부·공공기관'
  | '강원특별자치도'
  | '원주시'
  | '소비자 정보'
  | '법률·규정'
  | '리조트'
  | '호텔'
  | '골프'
  | '스포츠'
  | '미디어'
  | '브랜드'
  | '기타';

export interface ReferenceSiteItem {
  id: string;
  name: string;           // 사이트명
  category: ReferenceCategory; // 분야
  description: string;    // 간단 설명
  url: string;            // URL
  isOfficial?: boolean;   // 공식 사이트 여부
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// INFLUENCER DIRECTORY TYPES
// ==========================================

export type InfluencerPlatform =
  | 'Instagram'
  | 'YouTube'
  | 'Threads'
  | 'Blog'
  | 'TikTok'
  | '기타';

export type InfluencerCategory =
  | '골프'
  | '러닝'
  | '웰니스'
  | '여행'
  | '호텔·리조트'
  | '맛집·F&B'
  | '가족·육아'
  | '아웃도어'
  | '뷰티'
  | '패션'
  | '스포츠'
  | '라이프스타일'
  | '기타';

export interface InfluencerItem {
  id: string;
  name: string;             // 이름 / 활동명
  handle: string;           // 계정 ID (e.g., @golf_lover)
  platform: InfluencerPlatform; // 플랫폼
  profileUrl: string;       // 프로필 URL
  categories: InfluencerCategory[]; // 주요 분야 (복수 선택)
  notes: string;            // 특징
  followers?: string;       // 팔로워/구독자 수 (e.g. "1.2만" 또는 "확인 필요")
  phone?: string;           // 연락처 (선택, 승인 사용자만 공개)
  email?: string;           // 이메일 (선택, 승인 사용자만 공개)
  memo?: string;            // 메모
  isVerified?: boolean;     // 실제 확인 여부
  createdAt: string;        // 등록일
  updatedAt: string;        // 수정일
}

export interface InfluencerRecommendationResult {
  name: string;
  platform: InfluencerPlatform;
  handle: string;
  categories: InfluencerCategory[];
  features: string;
  profileUrl: string;
  followers: string;
  verifiedDate: string;
  isOfficialPublic: boolean;
}

// ==========================================
// CONTENT LAB TYPES
// ==========================================

export type ContentBrand = '오크밸리' | '파크로쉬';

export type ContentChannel =
  | 'Instagram Feed'
  | 'Instagram Reels'
  | 'Instagram Story'
  | 'Naver Blog'
  | 'Naver Cafe'
  | 'LinkedIn'
  | '문자/알림';

export type ContentTopicCategory =
  | '러닝'
  | '객실'
  | '골프'
  | '이벤트'
  | '클래스'
  | '웰니스'
  | '프로모션'
  | 'F&B'
  | '가족'
  | '아트·문화'
  | '스키'
  | '직접 입력'
  | string;

export type ContentMoodTone =
  | '프리미엄'
  | '모던'
  | '감성'
  | '트렌디'
  | '친근한'
  | '정보형'
  | '위트'
  | '공식적';

export type PolishToneOption =
  | '고급스럽게'
  | '모던하게'
  | '트렌디하게'
  | '감성적으로'
  | '친근하게'
  | '공식적으로'
  | '간결하게';

export type PolishChannelPurpose =
  | 'Instagram'
  | 'Reels'
  | 'Story'
  | 'Blog'
  | 'Cafe'
  | 'LinkedIn'
  | '기타';

export interface ContentVersion {
  versionKey: 'A' | 'B' | 'C';
  label: string; // e.g. "가장 추천하는 버전 (Best Pick)", "감성/브랜드 무드 강화 버전", "짧고 트렌디한 버전"
  title: string;
  hook?: string;
  body: string;
  callToAction: string;
  hashtags: string[];
  channelNote: string;
  krText: string;
  enText: string;
}

export interface ContentGenerationResult {
  brand: ContentBrand;
  channels: ContentChannel[];
  topic: string;
  moodTone: ContentMoodTone;
  mustInclude?: string;
  promotionInfo?: string;
  cta?: string;
  versionA: ContentVersion;
  versionB: ContentVersion;
  versionC: ContentVersion;
  visualSuggestion: {
    mood: string;
    composition: string;
    elements: string;
    recommendedStyle: string;
    assetLibraryRef?: string;
    hasLibraryAsset: boolean;
  };
  generatedAt: string;
}

export interface RecommendedTopicItem {
  id: string;
  rank: number;
  brand: ContentBrand;
  topic: string; // 추천 주제
  whyNow: string; // 왜 지금 좋은지 (시의성/트렌드/데이터 근거)
  promotionPoints: string[]; // 홍보 포인트
  recommendedChannels: ContentChannel[]; // 추천 채널
  recommendedContentType: string; // 추천 콘텐츠 형태 (e.g. 15초 릴스, 카드뉴스 슬라이드, 블로그 르포)
  imageDirection: {
    mood: string;
    composition: string;
    elements: string;
    recommendedStyle: string;
    existingAssetRef?: string;
    hasRealAsset: boolean;
  };
  connectedAsset: string;
}

export interface ContentPolishResult {
  originalText: string;
  purpose: PolishChannelPurpose;
  tone: PolishToneOption;
  
  // 3 Polish Levels
  level1_literal: {
    title: string;
    text: string;
    summary: string;
    enText: string;
  };
  level2_recommended: {
    title: string;
    text: string;
    summary: string;
    enText: string;
  };
  level3_optimized: {
    title: string;
    text: string;
    summary: string;
    hooks: string;
    cta: string;
    hashtags: string[];
    enText: string;
  };

  // Text Inspection Breakdown
  inspection: {
    spellingSpacing: string[]; // 맞춤법 / 띄어쓰기 수정 사항
    grammar: string[]; // 문법 / 어색한 표현
    repetitivePhrases: string[]; // 중복 표현 점검
    aiStylePhrases: string[]; // 과도하게 AI스러운 표현 / 과장된 마케팅 표현 점검
    factPreservationNote: string; // 원문 외 임의 생성 사실 없음 확인
  };
  polishedAt: string;
}

// ==========================================
// PRESS RELEASE (보도자료 작성) TYPES
// ==========================================

export type PressReleaseMode = 'CREATE' | 'POLISH';

export interface PressReleaseEventInfo {
  date?: string;
  location?: string;
  targetAudience?: string;
  price?: string;
  participatingBrands?: string;
  extraInfo?: string;
}

export interface PressReleaseInput {
  subject: string; // 주제
  issuer: string; // 발표 주체 (예: HDC리조트 오크밸리, 파크로쉬 리조트앤웰니스)
  moodTone: string; // 무드/톤 (공식적/정보형, 프리미엄/고급, 역동적/트렌디 등)
  keyHighlight: string; // 가장 강조하고 싶은 내용
  briefDescription: string; // 간략 설명
  eventInfo: PressReleaseEventInfo;
}

export interface PressReleaseArticle {
  headlineCandidates: string[]; // 제목 후보 3개
  recommendedHeadline: string; // 추천 제목
  subtitle: string; // 부제
  leadParagraph: string; // 리드문
  bodySections: Array<{
    sectionTitle: string;
    paragraphs: string[];
  }>;
  keyHighlights: string[]; // 핵심 내용 (Bullet points)
  aboutCompany: string; // 회사/시설 소개
  pressContact: {
    department: string;
    contactPerson: string;
    email: string;
    phone: string;
    note?: string;
  };
}

export interface PressReleaseResult {
  mode: PressReleaseMode;
  input?: PressReleaseInput;
  originalDraft?: string;
  koreanRelease: PressReleaseArticle;
  englishRelease: PressReleaseArticle;
  inspectionChecklist: {
    spellingGrammar: string[];
    journalismToneEvaluation: string;
    factIntegrityCheck: string;
    exaggerationRemoved: string[];
  };
  createdAt: string;
}

export interface SavedDealItem {
  id: string;
  brandName: string;
  projectName: string;
  savedAt: string;
  items: Array<{
    category: string;
    itemName: string;
    unit: string;
    normalPrice: number;
    quantityNum: number;
    appliedPrice: number;
    notes: string;
  }>;
  totalNormalValue: number;
  negotiatedValue: number;
  discountAmount: number;
  discountRate: number;
  actualVariableCost: number;
  opportunityCost: number;
  guaranteedCashRevenue: number;
  guaranteedRoomRevenue: number;
  brandInKindValue: number;
  dealMarginPercent: number;
  negotiationNotes?: string;
}

export interface OccDataSummary {
  fileName: string;
  rowCount: number;
  yearRange: string;
  avgOccPercent: number;
  weekendAvgOcc: number;
  weekdayAvgOcc: number;
  lowDemandMonths: string[];
  peakMonths: string[];
  recommendedPeriods: Array<{
    period: string;
    reason: string;
    targetOcc: number;
    strategicBenefit: string;
  }>;
  rawRows?: any[];
  detectedColumns?: string[];
  dataFacts?: string[];
  aiRecommendations?: string[];
}

export interface CorporatePptTemplate {
  id: string;
  templateName: string;
  brandStyle: 'IPARK' | 'OAK_VALLEY' | 'PARK_ROCHE';
  registeredAt: string;
  author: string;
  isActive: boolean;
  fileName: string;
  fileSize?: string;
}

// ==========================================
// PARTNER PIPELINE & WEEKLY REPORT TYPES
// ==========================================

export type PartnerDealStage =
  | '신규 컨택'
  | '제안 발송'
  | '미팅 예정'
  | '미팅 완료'
  | '결과 대기'
  | '조건 조율'
  | '진행 확정'
  | '보류'
  | '종료'
  | '컨택중'
  | '제안'
  | '미팅'
  | '결과'
  | '결과대기'
  | '진행확정';

export const PARTNER_DEAL_STAGES: PartnerDealStage[] = [
  '신규 컨택',
  '제안 발송',
  '미팅 예정',
  '미팅 완료',
  '결과 대기',
  '조건 조율',
  '진행 확정',
  '보류',
  '종료',
];

export interface PartnerDealHistoryItem {
  id: string;
  date: string;
  stage: PartnerDealStage;
  note: string;
  author: string;
}

export interface PartnerDealItem {
  id: string;
  companyName: string; // 업체명
  brandName: string; // 브랜드/기업
  projectName?: string; // 프로젝트명
  industry: string; // 산업군
  externalContactPerson: string; // 외부 담당자명
  externalContactInfo: string; // 외부 담당자 연락처/이메일
  internalAssignee: string; // 내부 담당자
  firstContactDate: string; // 최초 컨택일 (YYYY-MM-DD)
  lastUpdatedDate: string; // 최근 업데이트일 (YYYY-MM-DD)
  stage: PartnerDealStage; // 진행단계
  latestProgress: string; // 최근 진행내용
  nextAction: string; // 다음 액션
  nextActionDate: string; // 다음 예정일 (YYYY-MM-DD)
  nextActionTime?: string; // 다음 액션 시간 (HH:mm)
  location?: string; // 장소
  expectedCollaboration: string; // 예상 협업내용
  notes: string; // 비고
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  history?: PartnerDealHistoryItem[];
}

export interface WeeklyPipelineAggregation {
  totalCount: number;
  newContactCount: number; // 신규 컨택
  proposalCount: number; // 제안 발송
  newContactAndProposalCount?: number; // 신규 컨택 / 제안 발송 합계
  meetingUpcomingCount?: number; // 미팅 예정
  meetingCompletedCount?: number; // 미팅 완료
  meetingCount: number; // 미팅 진행/예정 (미팅 예정 + 미팅 완료)
  awaitingResultCount: number; // 결과 대기
  negotiationCount?: number; // 조건 조율
  confirmedCount: number; // 진행 확정
  holdCount: number; // 보류
  closedCount?: number; // 종료
  thisWeekUpdatedCount: number;
}

export interface WeeklyReportRecipient {
  id: string;
  name: string; // 이름
  email: string; // 이메일
  isActive: boolean; // 수신 여부
  createdAt: string;
  updatedAt: string;
  department?: string;
}

export type WeeklyReportDispatchStatus =
  | 'NOT_CONFIGURED' // 자동 이메일 발송 기능 연결 필요
  | 'PENDING'
  | 'SUCCESS' // 발송 완료
  | 'FAILED'; // 발송 실패

export interface WeeklyExternalMarketTrends {
  marketTrends: Array<{
    title: string;
    category: string;
    summary: string;
    source: string;
    sourceUrl?: string;
    verifiedDate: string;
  }>;
  competitorPromotions: Array<{
    competitorName: string;
    title: string;
    period: string;
    details: string;
    sourceUrl?: string;
  }>;
  popupsAndEvents: Array<{
    title: string;
    brand: string;
    location: string;
    period: string;
    highlights: string;
    sourceUrl?: string;
  }>;
  notableBrands: Array<{
    brand: string;
    industry: string;
    reason: string;
    referenceUrl?: string;
  }>;
}

export interface WeeklyReportData {
  id: string;
  periodLabel: string; // e.g. "2026년 8월 4주차 (08.24 ~ 08.30)"
  startDate: string;
  endDate: string;
  createdAt: string;
  generatedBy: string;
  
  // 1. 이번 주 핵심 요약 (3~5줄)
  executiveSummary: string[];
  
  // 2. 금주 시장·동종사 동향
  externalTrends: WeeklyExternalMarketTrends;
  
  // 3. 제휴팀 진행현황
  pipelineAggregation: WeeklyPipelineAggregation;
  
  // 4. 주요 제휴 건
  keyDeals: Array<{
    id: string;
    companyName: string;
    brandName: string;
    stage: PartnerDealStage;
    latestProgress: string;
    nextAction: string;
    internalAssignee: string;
    nextActionDate: string;
    expectedCollaboration: string;
  }>;
  
  // 5. 다음 주 예정
  nextWeekSchedule: Array<{
    dealId: string;
    companyName: string;
    actionType: string;
    dueDate: string;
    description: string;
    assignee: string;
  }>;
  
  // 6. AI 추천 (다음 주 우선 처리할 업무 3개 - 실제 데이터 기반)
  aiPriorityRecommendations: string[];
  
  // Dispatch metadata
  dispatchStatus: WeeklyReportDispatchStatus;
  statusMessage: string;
  dispatchedAt?: string;
  sentRecipients?: Array<{ name: string; email: string }>;
  emailSubject?: string;
  htmlContent?: string;
}

export interface EmailServerStatus {
  isConfigured: boolean;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpFrom?: string;
  cronSchedule: string; // '매주 금요일 18:00 KST'
  nextScheduledRun?: string;
  lastRunAt?: string;
  lastRunStatus?: string;
}

// ==========================================
// OFFICIAL MANAGERS (IPARK RESORT 제휴파트 담당자)
// ==========================================
export const OFFICIAL_MANAGERS = ['박서현', '전시현', '신현연', '미지정'] as const;
export type OfficialManager = typeof OFFICIAL_MANAGERS[number];

// ==========================================
// SCHEDULE MANAGEMENT TYPES (금주 제휴 일정)
// ==========================================

export type ScheduleType =
  | '미팅'
  | '제안서 발송'
  | '후속 연락'
  | '결과 확인'
  | '행사'
  | '촬영'
  | '파트너 방문'
  | '계약·협의'
  | '스폰서 제안'
  | '클래스 준비'
  | '제휴 협의'
  | '행사 준비'
  | '제안 검토'
  | '회원 제휴'
  | '기타';

export type ScheduleStatus = '예정' | '진행중' | '완료' | '보류';

export const SCHEDULE_TYPES: ScheduleType[] = [
  '미팅',
  '제안서 발송',
  '후속 연락',
  '결과 확인',
  '행사',
  '촬영',
  '파트너 방문',
  '계약·협의',
  '스폰서 제안',
  '클래스 준비',
  '제휴 협의',
  '행사 준비',
  '제안 검토',
  '회원 제휴',
  '기타',
];

export const SCHEDULE_STATUSES: ScheduleStatus[] = ['예정', '진행중', '완료', '보류'];

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm or '전일'
  title: string; // 일정명
  company: string; // 업체/브랜드
  scheduleType: ScheduleType; // 일정 유형
  location: string; // 장소
  assignee: string; // 담당자
  status: ScheduleStatus; // 진행상태
  memo: string; // 메모
  source?: 'MANUAL' | 'AI_EXTRACTED';
  dealId?: string; // 연동된 파이프라인 Deal ID (옵션)
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedScheduleCandidate {
  id: string;
  date: string;
  time: string;
  title: string;
  company: string;
  scheduleType: ScheduleType;
  location: string;
  assignee: string;
  status: ScheduleStatus;
  memo: string;
  needsVerification?: boolean;
  verificationNote?: string;
}

// ==========================================
// PARTNER PERFORMANCE & KPI TYPES
// ==========================================

export type PartnerActivityType =
  | '신규 컨택'
  | '제안 발송'
  | '미팅'
  | '행사 실행'
  | '계약 체결'
  | '기타';

export type PartnerStageType =
  | '컨택중'
  | '제안'
  | '미팅'
  | '협상'
  | '진행확정'
  | '완료'
  | '보류/드롭';

export type PartnershipKind =
  | '현금 협찬'
  | '현물 협찬'
  | '공동 마케팅'
  | '장소 대관'
  | '티켓/샘플링'
  | '기타';

export interface PartnerPerformanceActivity {
  id: string;
  activityDate: string; // YYYY-MM-DD
  activityType: PartnerActivityType;
  partnerName: string; // 제휴사/브랜드명
  assignee: '박서현' | '전시현' | '신현연' | string;
  stage: PartnerStageType;
  partnershipType: PartnershipKind;
  cashAmount: number; // 현금 (원)
  inKindValue: number; // 현물 가치 (원)
  inKindListPrice?: number;
  details?: string;
  linkedDealId?: string; // 제휴 진행관리 Deal ID (선택)
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyPerformanceKPI {
  newContactsCount: number;
  proposalsSentCount: number;
  meetingsCount: number;
  confirmedCount: number;
  completedCount: number;
  cashAmountTotal: number;
  inKindValueTotal: number;
  totalPartnershipValue: number;
}

// ==========================================
// INSTAGRAM EVENT MANAGEMENT TYPES (신규 독립 기능)
// ==========================================

export interface InstagramApiScopeStatus {
  metaApiConnected: boolean;
  businessAccountConnected: boolean;
  mediaListAccessible: boolean;
  commentsApiAccessible: boolean;
  authorIdentificationAccessible: boolean;
  paginationSupported: boolean;
  likeCountAccessible: boolean;
  insightsAccessible: boolean;
}

export interface InstagramConfigurationHelp {
  appIdConfigured: boolean;
  appSecretConfigured: boolean;
  tokenConfigured: boolean;
  redirectUri: string;
  requiredPermissions: string[];
  requiredEnvVars: string[];
  metaDeveloperUrl: string;
}

export interface InstagramConnectionStatus {
  isConnected: boolean;
  accountUsername?: string;
  accountName?: string;
  accountId?: string;
  profilePictureUrl?: string;
  connectedAt?: string;
  statusText: '정상' | '미연결' | '토큰만료' | '권한부족';
  apiScopeStatus: InstagramApiScopeStatus;
  configurationHelp: InstagramConfigurationHelp;
}

export interface InstagramEventConditions {
  requireComment: boolean;       // 댓글 작성
  requireFriendTag: boolean;      // 친구 태그
  minFriendTags: number;          // 최소 태그 수 (기본 1)
  requireKeyword: boolean;        // 특정 키워드 포함
  requiredKeywords: string[];     // 키워드 목록
  oneEntryPerId: boolean;         // ID당 1회 참여
  ticketPerComment: boolean;      // 댓글마다 응모권 1개
  customRuleNote?: string;        // API 미제공 조건 안내 (팔로우/좋아요 등은 '확인 필요' 표기)
}

export type InstagramCommentConditionStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'NEEDS_VERIFICATION';

export interface InstagramCommentItem {
  id: string;                     // 댓글 고유 ID
  eventId: string;                // 연결된 이벤트 ID
  username: string;              // Instagram ID (@작성자)
  text: string;                  // 댓글 본문
  timestamp: string;             // 작성일시 (ISO or YYYY-MM-DD HH:mm)
  likeCount: number | null;      // 댓글 좋아요 (API 미제공 시 null)
  friendTags: string[];          // 파싱된 @친구태그
  friendTagCount: number;        // 친구 태그 수
  userCommentCount: number;      // 해당 사용자의 총 댓글 수
  isDuplicate: boolean;          // 동일 ID의 중복 댓글 여부 (2번째 댓글부터 true)
  conditionStatus: InstagramCommentConditionStatus; // 조건 충족 / 미충족 / 확인 필요
  conditionDetails: string;      // 판별 상세 (예: "댓글 작성 + 친구 2명 태그 충족")
  isWinner: boolean;             // 당첨 여부
  winningRoundId?: string;       // 당첨된 추첨 회차 ID
}

export interface InstagramParticipantAggregate {
  username: string;              // Instagram ID
  totalComments: number;         // 총 댓글 수
  allComments: Array<{ id: string; text: string; timestamp: string }>;
  taggedAccounts: string[];      // 태그한 계정 목록
  conditionStatus: InstagramCommentConditionStatus; // 최종 조건 충족 여부
  conditionReason: string;       // 충족/미충족 사유
  ticketCount: number;           // 부여된 응모권 수
  isWinner: boolean;             // 당첨 여부
  firstCommentDate: string;      // 첫 댓글 일시
  lastCommentDate: string;       // 최근 댓글 일시
}

export interface InstagramLotteryWinner {
  username: string;
  commentSnippet: string;
  commentDate: string;
  ticketNumber?: number;
}

export interface InstagramLotteryHistory {
  id: string;
  eventId: string;
  drawnAt: string;               // 추첨 일시
  totalCommentsCount: number;    // 전체 댓글 수
  totalParticipantsCount: number;// 참여 ID 수
  eligibleParticipantsCount: number; // 조건 충족 ID 수
  winnerCount: number;           // 당첨 인원
  rulesApplied: {
    onlyEligible: boolean;       // 조건 충족 참여자만
    deduplicateId: boolean;      // 중복 ID 1명으로 처리
    ticketPerComment: boolean;   // 댓글 1개당 응모권 1개
  };
  winners: InstagramLotteryWinner[];
  isTestDraw?: boolean;          // QA 테스트 추첨 여부
  notes?: string;
}

export interface InstagramCommentAnalysis {
  totalComments: number;
  uniqueParticipants: number;
  duplicateParticipantsCount: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  positiveReactions: string[];   // 긍정 반응
  questionsAndInquiries: string[]; // 질문/문의
  improvementSuggestions: string[]; // 개선 의견
  analyzedAt: string;
}

export interface InstagramEventItem {
  id: string;
  title: string;                 // 이벤트명
  postUrl: string;               // Instagram 게시물 URL
  postId?: string;               // 추출된 Post Shortcode 또는 Media ID
  startDate: string;             // 이벤트 시작일 (YYYY-MM-DD)
  endDate: string;               // 이벤트 종료일 (YYYY-MM-DD)
  winnerCount: number;           // 당첨 인원
  conditions: InstagramEventConditions;
  createdAt: string;
  updatedAt: string;
  status: 'READY' | 'FETCHED' | 'DRAWN' | 'CLOSED';
  lastFetchedAt?: string;
  commentsCount?: number;
  participantsCount?: number;
  eligibleCount?: number;
  hasDrawn?: boolean;
}

// ==========================================
// PARTNER & CARD DB TYPES (신규 파트너 DB)
// ==========================================

export interface PartnerRecord {
  id: string;
  companyName: string;          // 회사명
  brandName?: string;           // 브랜드명
  industry?: string;            // 업종
  website?: string;             // 홈페이지
  instagramUrl?: string;        // Instagram URL or handle
  internalOwner?: string;       // 담당자(내부)
  recentDealNote?: string;      // 최근 제휴 내용
  notes?: string;               // 메모
  source?: string;              // 출처 (Excel업로드, 명함OCR, 수동, 등)
  hasExistingInteraction?: boolean; // 기존 거래/협의 이력 유무
  createdAt: string;
  updatedAt: string;
}

export interface PartnerContactRecord {
  id: string;
  partnerId?: string;           // 연동된 파트너 ID
  companyName: string;          // 회사명
  brandName?: string;           // 브랜드명
  contactName: string;          // 담당자명 / 이름
  title?: string;               // 직급
  department?: string;          // 부서
  email?: string;               // 이메일
  phone?: string;               // 전화번호 / 휴대폰
  website?: string;             // 홈페이지
  instagramUrl?: string;        // Instagram URL or handle
  industry?: string;            // 업종
  internalOwner?: string;       // 담당자(내부)
  recentDealNote?: string;      // 최근 제휴 내용
  notes?: string;               // 메모
  source?: string;              // 출처 (Excel업로드, 명함OCR, 수동 등)
  createdAt: string;
  updatedAt: string;
}

export type DuplicateActionType = 'UPDATE' | 'ADD_NEW' | 'SKIP';

export interface PartnerDbDuplicateItem {
  importIndex: number;
  incoming: Partial<PartnerContactRecord>;
  existingPartner?: PartnerRecord;
  existingContact?: PartnerContactRecord;
  matchReason: string; // e.g. "회사명 + 이메일 일치"
  chosenAction: DuplicateActionType;
}

// ==========================================
// PARTNER PROPOSAL HISTORY & MATERIAL ARCHIVE TYPES (제휴 이력 & 제안자료 아카이브)
// ==========================================

export type ArchiveProposalStatus =
  | '제안 준비'
  | '제안 완료'
  | '회신 대기'
  | '미팅 예정'
  | '협의 중'
  | '조건 조율'
  | '진행 확정'
  | '완료'
  | '보류'
  | '무산'
  | '재접촉 필요';

export interface ProposalAttachedFile {
  id: string;
  fileName: string;           // 파일명 (e.g. 최초제안서.pptx)
  version: string;            // 버전 (e.g. v1.0, v2.0)
  description?: string;       // 설명
  uploadDate: string;         // 업로드일
  fileUrl?: string;           // Data URL or Blob Link or GCS Link
  fileType?: string;          // PPT, PDF, XLS, DOC, IMG 등
  fileSizeFormatted?: string;
  hasOriginalFile?: boolean;  // 실제 원본 파일 존재 여부
  storageProvider?: string;   // 'gcs' | 'local_dataurl' | 'none'
  isStorageConnected?: boolean;
}

export interface ProposalHistoryItem {
  id: string;
  projectName: string;        // 프로젝트명
  proposalDate: string;       // 제안일
  proposalType: string;       // 제안 형태
  summary: string;            // 제안 내용 요약
  requests: string;           // 요청사항
  status: ArchiveProposalStatus; // 진행상태
  result?: string;            // 결과
  files: ProposalAttachedFile[]; // 파일 목록
}

export interface TimelineEntry {
  id: string;
  date: string;               // YYYY-MM-DD
  author?: string;            // 작성자/내부담당자
  content: string;            // 내용
  stageTag?: string;
}

export interface PartnerArchiveRecord {
  id: string;
  companyName: string;        // 업체명
  brandName?: string;         // 브랜드명
  industry: string;           // 업종
  internalAssignee: string;   // 내부 담당자
  contactPerson: string;      // 상대 담당자명
  contactTitle?: string;      // 부서/직급
  contactEmail?: string;      // 이메일
  contactPhone?: string;      // 연락처
  
  proposals: ProposalHistoryItem[]; // 다중 제안 이력
  timeline: TimelineEntry[];       // 협의 히스토리 (타임라인)
  
  currentStatus: ArchiveProposalStatus; // 현재 상태
  latestProjectName?: string;  // 프로젝트명 (리스트 노출용)
  latestProposalDate?: string; // 최근 제안일
  nextAction?: string;        // 다음액션
  notes?: string;
  updatedAt?: string;
}

// ==========================================
// PRICING ASSETS DB & BARTER CALCULATION TYPES
// ==========================================

export type PricingAssetCategory =
  | '객실'
  | '골프'
  | '공간'
  | '사우나'
  | '클래스'
  | '광고'
  | 'F&B'
  | '기타';

export interface PriceHistoryRecord {
  id: string;
  changeDate: string;
  oldNormalPrice: number;
  newNormalPrice: number;
  oldPartnerPrice?: number;
  newPartnerPrice?: number;
  reasonOrFile?: string;
}

export interface PricingAssetItem {
  id: string;
  category: PricingAssetCategory; // 카테고리
  itemName: string;               // 항목명
  specCondition?: string;         // 규격/조건
  unit: string;                   // 단위 (1실, 1팀, 1회, 1시간, 1매 등)
  normalPrice: number;            // 정상가
  partnerPrice?: number;          // 제휴가
  costPrice?: number;             // 원가
  notes?: string;                 // 비고
  sourceFile?: string;            // 출처파일
  isActive: boolean;              // 활성화 상태
  createdAt: string;
  updatedAt: string;
  history?: PriceHistoryRecord[]; // 가격 변경 이력
}

export interface IparkValueLineItem {
  id: string;
  assetId?: string;               // 연동된 PricingAssetItem ID
  itemName: string;               // 항목명
  specCondition?: string;         // 규격/조건
  quantity: number;               // 수량
  unitPrice: number;              // 이번 협의 단가 (수정 가능, 원본 DB 미변경)
  costPrice?: number;             // 원가
  totalAmount: number;            // 수량 * 단가
  notes?: string;
}

export interface PartnerValueLineItem {
  id: string;
  itemName: string;               // 항목명
  quantity: number;               // 수량
  unitPrice: number;              // 단가
  totalAmount: number;            // 총액 (수량 * 단가)
  valueType: '현금' | '현물' | '마케팅' | '기타'; // 구분
  notes?: string;
}

export interface GuaranteedRevenueLineItem {
  id: string;
  productName: string;            // 상품명
  quantity: number;               // 수량
  salesUnitPrice: number;         // 판매단가
  expectedRevenue: number;        // 예상매출 (수량 * 판매단가)
  commissionRatePercent?: number; // 수수료율 (%)
  expectedNetRevenue: number;     // 예상순매출
  notes?: string;
}

export interface BarterCalculationResult {
  id: string;
  companyName: string;            // 업체명 (자유입력)
  projectName: string;            // 프로젝트명 (자유입력)
  calculationDate: string;        // 계산일
  notes?: string;                 // 메모
  
  iparkItems: IparkValueLineItem[];
  partnerItems: PartnerValueLineItem[];
  guaranteedRevenues: GuaranteedRevenueLineItem[];
  
  // Calculated Totals
  iparkTotalValue: number;        // IPARK리조트 제공가치 총액
  iparkTotalCost: number;         // 실제 원가 총액
  partnerCashValue: number;       // 파트너 현금
  partnerGoodsValue: number;      // 파트너 현물가치
  partnerTotalValue: number;      // 파트너 총 제공가치
  guaranteedTotalRevenue: number; // 보장매출 총액
  expectedNetRevenueTotal: number;// 예상순매출 총액
  valueDifference: number;        // 가치 차이
  expectedProfitLoss: number;     // 예상 손익
  
  aiSummary?: string;             // 조건 요약
  aiNegotiationProposal?: string; // 추천 협상안
  
  linkedDealId?: string;          // 제휴 진행관리 연결 ID (선택)
  createdAt: string;
  updatedAt: string;
}






