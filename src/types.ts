export type ActiveTab = 'home' | 'trend' | 'company' | 'partnership' | 'ratecard' | 'activation' | 'knowledge' | 'partnertarget';

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
  brand: string;
  industry: string;
  recentMarketingActivity: string;
  verifiedSponsorshipCases: string;
  oakValleyTouchpoint: string;
  recommendedDirection: string;
  cashSponsorshipEvidence: string; // 근거 부족 시 "확인 자료 부족"
  contactInquiry: string; // 공식 공개 채널만 표시
  source: string;
  sourceUrl?: string;
  sourceDate: string;
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
  title: string; // e.g. "공식 홈페이지", "공식 Instagram", "보도자료"
  url?: string;
  refDate: string; // e.g. "2026.08.10"
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

export interface TrendFilter {
  period: '최근 1개월' | '최근 3개월' | '최근 6개월' | '최근 1년';
  region: '한국' | '글로벌' | '미국' | '일본' | '유럽';
  category: 'Marketing' | 'Travel' | 'Hospitality' | 'Golf' | 'Wellness' | 'Sports' | 'F&B' | 'Fashion' | 'Beauty' | 'Retail' | 'Technology' | 'Entertainment' | '전체';
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

export interface BusinessOpportunity {
  id: string;
  opportunity: string;
  targetCustomer: string;
  possiblePartner: string;
  businessModel: string;
  expectedBenefit: string;
}

export interface TrendReport {
  query: string;
  filters: TrendFilter;
  generatedAt: string;
  executiveSummary: string[];
  keyTrends: KeyTrend[];
  metrics: SignalMetric[];
  brandCases: BrandCase[];
  emergingSignals: EmergingSignal[];
  opportunities: BusinessOpportunity[];
  references?: ReferenceSource[];
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

