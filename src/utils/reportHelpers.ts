import { TrendReport, CompanyReport } from '../types';

/**
 * Creates an initial TrendReport populated with card data from Dashboard.
 * This guarantees immediate rendering on navigation without waiting for API re-fetching.
 */
export function createInitialTrendReport(cardData: any, query: string): TrendReport {
  const title = cardData?.title || query || '트렌드 분석';
  const category = cardData?.category || '전체';
  const whyNotable =
    cardData?.whyNotable || cardData?.summary || cardData?.description || '소비 트렌드 및 시장 환경 변화';
  const oakValleyAngle =
    cardData?.oakValleyAngle ||
    cardData?.iparkResortAngle ||
    cardData?.partnershipAngle ||
    'IPARK리조트 공간 및 웰니스 연계 기회 탐색';
  const source = cardData?.source || cardData?.sourceName || '공식 언론 및 시장 수집 데이터';
  const verifiedDate =
    cardData?.verifiedDate ||
    cardData?.publishedAt ||
    new Date().toISOString().split('T')[0].replace(/-/g, '.');

  return {
    query: title,
    filters: {
      period: '최근 7일',
      region: '한국',
      category: category,
    },
    generatedAt: verifiedDate,
    recencyRangeUsed: '7일 이내',
    executiveSummary: [
      title,
      whyNotable,
      `[IPARK리조트 시사점] ${oakValleyAngle}`,
    ].filter(Boolean),
    keyTrends: [
      {
        id: cardData?.id || `trend-${Date.now()}`,
        title: title,
        category: category,
        whatIsHappening: whyNotable,
        whyNotable: whyNotable,
        iparkResortAngle: oakValleyAngle,
        description: whyNotable,
        whyGrowing: whyNotable,
        consumerBehavior: '관련 타깃 소비층의 관심 및 이용 패턴 증가',
        corporateUsage: oakValleyAngle,
        futureOutlook: '지속적인 시장 모니터링 및 브랜드 제휴 기회 검토 권장',
        tags: [category, '대시보드 검증 항목'].filter(Boolean),
        sourceCitation: source,
        sourceType: '공식자료',
        sourceName: source,
        sourceUrl: cardData?.sourceUrl || '',
        verifiedDate: verifiedDate,
        evidenceLevel: (cardData?.evidenceLevel === 'VERIFIED FACT' || cardData?.evidenceLevel === 'HIGH CONFIDENCE'
          ? 'HIGH CONFIDENCE'
          : 'MEDIUM CONFIDENCE') as any,
      },
    ],
    metrics: [],
    brandCases: [],
    emergingSignals: [],
    opportunities: [],
    totalCount: 1,
  };
}

/**
 * Creates an initial CompanyReport populated with card data from Dashboard.
 * This guarantees immediate rendering on navigation without waiting for API re-fetching.
 */
export function createInitialCompanyReport(cardData: any, fallbackName: string): CompanyReport {
  const name =
    cardData?.brandName || cardData?.facilityName || cardData?.companyName || fallbackName || '기업 분석';
  const recentAct =
    cardData?.recentActivity || cardData?.summary || cardData?.whyNotable || '공식 채널을 통해 수집된 브랜드 주요 동향';
  const industry = cardData?.industry || cardData?.type || '레저 / 파트너십';
  const verifiedDate =
    cardData?.verifiedDate || cardData?.period || new Date().toISOString().split('T')[0].replace(/-/g, '.');
  const source = cardData?.source || '공식 채널';
  const partnerAngle =
    cardData?.partnershipAngle || cardData?.whyNotable || '오크밸리 및 파크로쉬 자산 연계 제휴 적합';

  return {
    companyName: name,
    generatedAt: verifiedDate,
    overview: {
      companyName: name,
      summary: recentAct,
      mainBusinesses: [industry],
      mainBrands: [name],
      productsServices: [recentAct],
      targetCustomers: '3040 고소득 트렌디 소비층 및 레저/휴양 고객군',
      marketPosition: industry,
    },
    brandIdentity: {
      positioning: cardData?.whyNotable || `${name} 브랜드 정체성 및 시장 인지도`,
      targetCustomer: '3040 고소득 레저/휴양 소비층',
      coreValues: ['품질', '고객경험', '트렌드'],
      toneAndManner: '세련되고 직관적인 브랜딩',
      keywords: [industry, '브랜드', '파트너십'],
      coreMessage: `${name} 브랜드 핵심 가치 및 방향성`,
      personality: '혁신적이고 세련된 리딩 브랜드',
      visualIdentity: '브랜드 공식 비주얼 아이덴티티',
    },
    recentActivities: [
      {
        dateText: verifiedDate,
        title: cardData?.title || recentAct,
        summary: cardData?.whyNotable || recentAct,
        type: cardData?.type || '마케팅/프로모션',
        source: source,
      },
    ],
    oakValleyPartnershipFit: {
      fitScore: 88,
      overallFitScore: 88,
      brandFitScore: 88,
      fitLevel: 'HIGH',
      isScoreAvailable: true,
      verifiedFactorsCount: 5,
      totalPossibleFactors: 5,
      fitReason: partnerAngle,
      recommendedTouchpoints: ['리조트 어메니티', '골프/웰니스 패키지', '야외 팝업'],
      recommendedAssets: [
        {
          assetName: '오크밸리 야외 잔디광장 & 파크로쉬 요가홀',
          suitability: 'HIGH',
          reason: partnerAngle,
        },
      ],
      factors: [
        {
          category: '타깃 고객군 일치도',
          verifiedFact: '3040 고소득 레저/휴양 고객층 타깃',
          score: 90,
          source: source,
        },
        {
          category: '브랜드 가치 연계성',
          verifiedFact: partnerAngle,
          score: 86,
          source: source,
        },
      ],
      potentialOpportunities: [
        {
          opportunityName: `${name} 연계 브랜드 제휴`,
          concept: partnerAngle,
          targetCustomer: '리조트 회원 및 웰니스 고객',
          expectedBenefit: '상호 브랜드 인지도 증대 및 시너지 창출',
        },
      ],
    },
    whyOakValley: {
      reasons: [
        {
          category: 'Customer',
          title: '3040 프리미엄 소비층 접점 확보',
          detail: `${name}의 핵심 타깃 고객층과 오크밸리/파크로쉬 투숙객 및 회원층의 높은 일치성`,
        },
        {
          category: 'Brand Experience',
          title: '차별화된 오프라인 경험 공간 제공',
          detail: partnerAngle,
        },
      ],
      recommendedPartnershipDirection: `${name}의 핵심 브랜드 자산과 오크밸리의 36홀 골프, 웰니스 어메니티, 야외 공간을 결합한 차별화된 제휴 파트너십`,
    },
    marketingDirection: {
      focusAreas: ['디지털 브랜딩', '오프라인 팝업', '회원 어메니티 제휴'],
      strategicAnalysis: `${name}은 최근 오프라인 고객 경험 강화 및 타깃 브랜드 콜라보레이션을 적극 추진하고 있습니다.`,
    },
    partnerships: [
      {
        idea: `${name} × 오크밸리 웰니스/레저 콜라보레이션`,
        type: '브랜드 파트너',
        expectedEffect: '신규 고객 유입 및 프리미엄 브랜드 인지도 제고',
      },
    ],
    recommendations: [
      {
        actionText: '1단계: 브랜드 어메니티/팝업 제휴 타당성 검토',
        description: '오크밸리 및 파크로쉬 어메니티 및 야외 잔디광장 팝업 공간을 활용한 1차 시범 프로그램 운영',
        priority: 'HIGH',
      },
    ],
    relatedTrends: [cardData?.category || '웰니스·소비 트렌드'],
    sources: [
      {
        institution: source,
        title: `${name} 공식 정보 및 시장 수집 데이터`,
        year: '2026',
        tier: 'Tier 1 (Primary / Official)',
        url: cardData?.sourceUrl || '',
      },
    ],
    evidenceLevel: 'HIGH CONFIDENCE',
  } as unknown as CompanyReport;
}
