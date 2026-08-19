import { TrendReport, CompanyReport } from '../types';

export const SAMPLE_TREND_REPORTS: Record<string, TrendReport> = {
  '2026 웰니스 트렌드': {
    query: '2026 웰니스 트렌드',
    filters: { period: '최근 1년', region: '한국', category: 'Wellness' },
    generatedAt: '2026-08-11',
    executiveSummary: [
      '신체적 건강을 넘어 정신적·환경적 수면과 리커버리를 통합한 "홀리스틱 메디-웰니스(Holistic Medi-Wellness)" 시장 급성장',
      '럭셔리 리조트 및 호텔의 웰니스 체험 패키지 수요가 전년 대비 42% 증가하며 고소득층 중심 마이크로 리트릿 확산',
      '바이오해킹 및 웨어러블 테크(가민, 아워라) 데이터를 연동한 개인 맞춤형 리커버리 프로그램 활성화',
      '친환경 및 오프그리드(Off-grid) 자연 몰입형 휴식 인프라에 대한 기업 마케팅 제휴 가속화'
    ],
    keyTrends: [
      {
        id: 'wellness-1',
        title: 'Sleep Tourism & Recovery Retreat',
        description: '수면 장애 극복 및 심신 회복을 최우선 목적으로 삼는 럭셔리 휴양 수면 투어리즘 확산',
        whyGrowing: '고도 지식 노동자 및 3050 프리미엄 소비층의 만성 피로와 스트레스 관리가 핵심 삶의 질 지표로 부상함',
        consumerBehavior: '단순한 관람형 여행보다 맞춤형 사운드 스케이프, 생체 신호 분석 수면룸을 구비한 숙박 시설 선호',
        corporateUsage: '호텔/리조트는 스마트 슬립 솔루션 기업(가민, 템퍼)과 협업하여 프리미엄 체류 패키지 출시',
        futureOutlook: '의료 진단 센터 및 인공지능 바이오 테크 기업과의 연계를 통한 융합 리조트 상품 확지 전망',
        tags: ['SleepTech', 'LuxuryRetreat', 'Recovery'],
        oakValleyOpportunity: {
          opportunityScore: 95,
          recommendedAssets: ['Stay', 'Wellness', 'Outdoor'],
          targetCustomer: '주말 힐링 및 스트레스 해소를 원하는 3050 프리미엄 리조트 투숙객',
          recommendedProgram: '오크밸리 "Deep Forest Sleep & Medi-Recovery Suite" 패키지',
          potentialPartnerCategory: '스마트 슬립테크 (가민, 아워라, 템퍼) 및 바이오 사운드 테라피 브랜드',
          businessModel: '프리미엄 객실 패키지 (ADR 40% 프리미엄) + 웰니스 스파/차방 연계 매출',
          quickWin: '기존 스위트 객실 5실을 스마트 슬립 솔루션(사운드스케이프, 수면 웨어러블) 팝업 객실로 우선 전환',
          longTermOpportunity: '오크밸리 자연 숲 단지 전체를 잇는 글로벌 럭셔리 웰니스 스파 & 테라피 센트럴 거점 조성',
          spaceAndTouchpoints: '오크밸리 빌리지 스위트 객실, 산책로 "숨길", 웰니스 클럽 스파 룸'
        }
      },
      {
        id: 'wellness-2',
        title: 'Active Longevity & Bio-Hacking',
        description: '건강 수명 연장을 위한 능동적 세포 리커버리 및 스포츠 테라피 트렌드',
        whyGrowing: '시니어층의 구매력 증대와 3040세대의 얼리 웰에이징(Early Well-Aging) 인식 강화',
        consumerBehavior: '러닝/골프/테니스 후 전문 크라이오테라피, 적외선 사우나, 아로마 마인드풀니스 프로그램 이용률 증가',
        corporateUsage: '스포츠 및 아웃도어 브랜드가 하이엔드 웰니스 클럽과 연계된 팝업스토어 및 멤버십 행사 개최',
        futureOutlook: '골프장 및 스포츠 클럽 내 필수 리커버리 라운지 구축이 마케팅 차별화 요소로 안착',
        tags: ['ActiveLongevity', 'BioHacking', 'SportsWellness'],
        oakValleyOpportunity: {
          opportunityScore: 92,
          recommendedAssets: ['Golf', 'Wellness', 'F&B'],
          targetCustomer: '18홀 라운딩 후 체력 회복과 건강 관리를 중시하는 오크밸리/성문안 CC 골프 회원',
          recommendedProgram: '오크밸리 CC "Golf Bio-Recovery Lounge & Muscle Therapy"',
          potentialPartnerCategory: '크라이오테라피, 마사지 건 (하이퍼아이스), 바이오 리커버리 음료 브랜드',
          businessModel: '라운딩 전후 1:1 맞춤 케어 서비스 유료 이용 및 스폰서십 어메니티 입점',
          quickWin: '클럽하우스 락커룸 옆 유휴 공간에 하이퍼아이스/가민 연계 리커버리 카운터 한달 팝업 운영',
          longTermOpportunity: '성문안 스타트하우스 연계 최고급 멤버십 복합 리커버리 센터 정식 개장',
          spaceAndTouchpoints: '오크밸리 CC / 성문안 CC 클럽하우스 스타트하우스, 라운지, 사우나 구역'
        }
      },
      {
        id: 'wellness-3',
        title: 'Mindful Social Club',
        description: '음주 중심 유흥 문화에서 탈피해 요가, 사우나, 음차(Tea)를 매개로 한 웰니스 커뮤니티',
        whyGrowing: 'MZ세대의 건강한 루틴(갓생) 지향 및 가치관 중심 네트워킹 욕구 증대',
        consumerBehavior: '주말 아침 러닝 클럽 후 리조트 라운지에서 사운드 배스나 브랜드 웰니스 모임 참여',
        corporateUsage: 'F&B 및 패션 브랜드가 웰니스 모임 공간을 후원하고 앰버서더 프로그램 운영',
        futureOutlook: '기업 B2B 복지 솔루션 및 프리미엄 회원권 시장의 새로운 핵심 파이프라인으로 성장',
        tags: ['Mindfulness', 'WellnessCommunity', 'GenZ'],
        oakValleyOpportunity: {
          opportunityScore: 88,
          recommendedAssets: ['Outdoor', 'Event', 'F&B'],
          targetCustomer: '건강한 소셜 모임과 갓생 루틴을 즐기는 2040 액티브 커뮤니티',
          recommendedProgram: '오크밸리 야외 잔디광장 "Sunset Yoga & Natural Sound Bath"',
          potentialPartnerCategory: '요가/피트니스 브랜드 (룰루레몬), 로컬 오가닉 F&B, 다도/티 브랜드',
          businessModel: '주말 데이패스 유료 파티 티켓 판매 + 웰니스 F&B 팝업 부스 유치',
          quickWin: '주말 아침 오크밸리 야외 잔디광장에서 룰루레몬 앰버서더 연계 무료 웰니스 클래스 진행 후 룸 패키지 유도',
          longTermOpportunity: '매년 봄/가을 오크밸리 시그니처 "Oak Valley Wellness & Mind Festival" 정례 개최',
          spaceAndTouchpoints: '오크밸리 야외 잔디광장, 야외 테라스, 컨벤션 홀'
        }
      }
    ],
    metrics: [
      {
        label: '국내 웰니스 관광 시장 규모',
        currentValue: '18.4조 원',
        yoyChange: '+18.5%',
        forecast: '2028년 25조 원 돌파 예상',
        unit: '조 원',
        chartData: [
          { year: '2023', value: 11.2 },
          { year: '2024', value: 13.5 },
          { year: '2025', value: 15.5 },
          { year: '2026', value: 18.4 },
          { year: '2027', value: 21.5 }
        ]
      },
      {
        label: '럭셔리 리조트 웰니스 체류 비중',
        currentValue: '34.2%',
        yoyChange: '+12.1%p',
        forecast: '일반 숙박 대비 객단가 2.4배 높음',
        unit: '%',
        chartData: [
          { year: '2023', value: 18.0 },
          { year: '2024', value: 22.5 },
          { year: '2025', value: 28.1 },
          { year: '2026', value: 34.2 }
        ]
      },
      {
        label: '스마트 웨어러블 수면 분석 이용률',
        currentValue: '48.9%',
        yoyChange: '+24.3%',
        forecast: '스마트워치 사용자 2명 중 1명 매일 측정',
        unit: '%'
      }
    ],
    brandCases: [
      {
        id: 'bc-1',
        brandName: 'Garmin',
        projectTitle: 'Garmin Body Battery Recovery Zone @ 럭셔리 리조트',
        action: '스마트워치 수면/스트레스 지수를 분석해 리조트 맞춤 Spas와 오프로드 트레킹 프로그램을 자동 제안하는 팝업 운영',
        whyNotable: '디지털 데이터와 오프라인 럭셔리 공간 경험의 완성도 높은 결합 사례',
        takeaway: '데이터 기반 고객 상태 진단 후 브랜드 상품을 자연스럽게 서비스 체험으로 연결'
      },
      {
        id: 'bc-2',
        brandName: 'Snow Peak',
        projectTitle: 'Snow Peak Field Suite & Mindful Camping',
        action: '자연 친화적 럭셔리 모듈러 하우스 및 사우나 캠핑 팝업으로 하이엔드 고객 체험 강화',
        whyNotable: '캠핑 장비 제조사에서 글로벌 라이프스타일 웰니스 플랫폼으로 브랜드 가치 확장',
        takeaway: '자사 제품을 단순 판매하지 않고 독창적 야외 휴식 경험을 공간 제휴로 전달'
      },
      {
        id: 'bc-3',
        brandName: 'Lululemon',
        projectTitle: 'Lululemon Summer Wellness Sanctuary',
        action: '프리미엄 리조트 야외 야외잔디밭에서 입숙객 및 VIP 회원 대상 썬셋 요가 및 마인드풀니스 페스티벌 개최',
        whyNotable: '브랜드 팬덤의 오프라인 커뮤니티 결속력 극대화 및 하이엔드 인지도 강화',
        takeaway: '타깃 고객이 모이는 하이엔드 리조트 공간을 무대로 브랜드 가치관 체험 유도'
      }
    ],
    emergingSignals: [
      {
        title: 'Neuro-Acoustic Sound Therapy (뇌파 동기화 사운드 테라피)',
        description: '특정 헤르츠 사운드 진동을 활용하여 15분 만에 깊은 수면 상태에 도달시키는 웰니스 세션',
        potentialImpact: '호텔 객실, 스파, VIP 라운지의 필수 어메니티 요소로 표준화될 가능성 높음'
      },
      {
        title: 'Cold Plunge & Thermal Contrast Social Sauna',
        description: '핀란드식 야외 모닥불 사우나와 냉수욕을 반복하며 차방에서 대화하는 새로운 소셜 클럽 형태',
        potentialImpact: '골프 클럽하우스 및 리조트 야외 공간의 신규 시그니처 앵커 시설로 각광'
      }
    ],
    opportunities: [
      {
        id: 'opp-1',
        opportunity: '스마트 웨어러블 연계 "Medi-Wellness Sleep Suite" 패키지',
        targetCustomer: '고스트레스 전문직 및 럭셔리 휴양 희망 3050 VIP 고객',
        possiblePartner: 'Garmin, Oura, Temim',
        businessModel: '체류형 프리미엄 리조트 룸 패키지 + 스마트 기기 대여 및 진단 리포트 제공',
        expectedBenefit: '객실 단가(ADR) 35% 이상 상승 및 고부가가치 스파/F&B 연계 매출 확대'
      },
      {
        id: 'opp-2',
        opportunity: '골프 & 웰니스 리커버리 라운지 (Golf Recovery Program)',
        targetCustomer: '주말 프리미엄 골퍼 및 장기 휴양 고객',
        possiblePartner: 'Garmin, Hyperice, CryoAsia',
        businessModel: '골프 라운딩 전후 1:1 맞춤형 피로도 측정 및 정밀 리커버리 케어 프로그램',
        expectedBenefit: '골프장 이용 만족도 극대화, 회원권 가치 상승 및 브랜드 제휴 수입 창출'
      }
    ]
  },

  '호텔·리조트 마케팅 트렌드': {
    query: '호텔·리조트 마케팅 트렌드',
    filters: { period: '최근 6개월', region: '한국', category: 'Hospitality' },
    generatedAt: '2026-08-11',
    executiveSummary: [
      '단순한 숙박 공간을 넘어 특정 브랜드의 브랜드 스토리를 오감으로 체험하는 "Brand Sanctuary"화 촉진',
      '럭셔리 패션, 글로벌 테크, 아웃도어 브랜드와의 팝업 콜라보레이션 패키지가 Z세대 및 VIP 유치의 핵심 동력',
      '지역 전통문화, 로컬 오가닉 F&B와 연계된 차별화된 스토리텔링 로컬라이제이션 콘텐츠 인기',
      '멤버십 가치 제고를 위한 글로벌 브랜드 제휴 혜택 및 회원 전용 exclusive 이벤트 대폭 확대'
    ],
    keyTrends: [
      {
        id: 'hotel-1',
        title: 'Immersive Brand Takeover (브랜드 앰버시 팝업)',
        description: '호텔 수영장, 라운지, 특정 콘셉트 룸 전체를 브랜드 아이덴티티로 꾸미는 팝업 마케팅',
        whyGrowing: '브랜드는 하이엔드 고객 접점을 확보하고, 호텔은 신선한 콘텐츠와 SNS 버즈량을 동시 창출함',
        consumerBehavior: '특정 브랜드의 시그니처 컬러와 디자인으로 연출된 공간에서 사진을 찍고 소셜 미디어에 공유',
        corporateUsage: '패션/럭셔리 카테고리(디오르, 자크뮈스, 가민)가 여름/겨울 시즌 시그니처 공간 전면 대관 제휴',
        futureOutlook: '시즌성 이벤트를 넘어 연간 상설 브랜드 체험 갤러리 형태로 확장 전망',
        tags: ['BrandTakeover', 'PopupSuite', 'Instagrammable'],
        oakValleyOpportunity: {
          opportunityScore: 94,
          recommendedAssets: ['Stay', 'Event', 'Check-in'],
          targetCustomer: '트렌디한 비주얼과 브랜드 경험을 중시하는 2040 리조트 방문객',
          recommendedProgram: '오크밸리 메인 타워 스위트 룸 x 글로벌 브랜드 팝업 테이크오버',
          potentialPartnerCategory: '럭셔리 패션, 프리미엄 뷰티, 라이프스타일 가전',
          businessModel: '브랜드 공간 대관료 + 컬래버레이션 한정판 투숙 패키지 매출',
          quickWin: '체크인 로비 카운터 및 메인 스위트룸 1실을 팝업 전시공간으로 즉시 컬래버레이션',
          longTermOpportunity: '시즌별 브랜드 앰버시 룸 시리즈를 런칭하여 상시 이슈 메이킹',
          spaceAndTouchpoints: '오크밸리 체크인 로비, 빌리지 스위트 객실, 메인 잔디광장'
        }
      },
      {
        id: 'hotel-2',
        title: 'Micro-Curated Wellness Stay',
        description: '고객의 취향과 라이프스타일(러닝, 수면, 와인, 미술)에 따라 1:1로 미세 설계된 큐레이션 패키지',
        whyGrowing: '천편일률적인 조식 포함 패키지에 피로감을 느낀 맞춤형 경험 소비 성향 증대',
        consumerBehavior: '입실 전 설문을 통해 선호하는 향, 아로마, 조명, 음향, 운동 기구가 세팅된 객실 이용',
        corporateUsage: '향수, 오디오, 뷰티 브랜드가 호텔 객실 내 맞춤 어메니티로 입점하여 시체험 후 구매 유도',
        futureOutlook: '스마트 객실 IoT 및 AI 개인화 추천 시스템과 결합하여 서비스 고도화',
        tags: ['PersonalizedStay', 'CuratedExperience', 'AmenitySponsorship'],
        oakValleyOpportunity: {
          opportunityScore: 90,
          recommendedAssets: ['Stay', 'F&B', 'Digital'],
          targetCustomer: '취향이 명확하고 프라이빗한 프리미엄 케어를 원하는 VIP 및 커플 고객',
          recommendedProgram: '오크밸리 "Personalized Aroma & Music Curated Stay"',
          potentialPartnerCategory: '니치 향수, 하이엔드 오디오(B&O, 드비알레), 오가닉 티',
          businessModel: '어메니티 브랜드 스폰서십 + 객실내 QR 간편 구매 커미션 수입',
          quickWin: '입실 전 체크인 App을 통해 선호 향기와 음향 스타일을 선택하는 어메니티 큐레이션 런칭',
          longTermOpportunity: '오크밸리 스마트 객실 IoT와 연동된 초개인화 인룸 웰니스 플랫폼 구축',
          spaceAndTouchpoints: '오크밸리 객실 타워, 모바일 체크인 App, 라운지'
        }
      }
    ],
    metrics: [
      {
        label: '브랜드 협업 객실/팝업 패키지 예약률',
        currentValue: '91.4%',
        yoyChange: '+28.0%',
        forecast: '일반 특가 패키지 대비 리드타임 2배 길고 조기 매진',
        unit: '%'
      },
      {
        label: '호텔 콜라보레이션 관련 소셜 버즈량',
        currentValue: '2,450만 건',
        yoyChange: '+64.2%',
        forecast: '인스타그램 및 숏폼 중심 가속화',
        unit: '건'
      }
    ],
    brandCases: [
      {
        id: 'bc-h1',
        brandName: 'National Geographic',
        projectTitle: 'Eco-Explorer Staycation @ 제주 해안 리조트',
        action: '친환경 가방 및 망원경 렌탈 세트와 함께 제주의 야생 생태를 탐험하는 가족형 익스플로어 패키지 운영',
        whyNotable: '아웃도어 브랜드의 탐험 정신과 리조트의 자연 인프라가 완벽히 부합된 스토리 마케팅',
        takeaway: '단순 상품 증정이 아닌 투숙 기간 내 직접 사용하는 레저 체험 장비 제휴'
      }
    ],
    emergingSignals: [
      {
        title: 'Night Micro-Experience (야간 소소한 이색 체험)',
        description: '야간 별자리 관측, 서클 와인 테이스팅, 나이트 웰니스 러닝 등 밤 시간을 활용한 프로그램',
        potentialImpact: '체류 시간 연장 및 부대시설 밤 매출 극대화에 매우 효과적'
      }
    ],
    opportunities: [
      {
        id: 'opp-h1',
        opportunity: 'Garmin & Resort "Night Run & Star Tracking" 패키지',
        targetCustomer: '3040 스포츠 & 아웃도어 라이프스타일 투숙객',
        possiblePartner: 'Garmin',
        businessModel: '스마트워치 야간 나이트런 트랙 탑재 및 트레킹 가이드 연계',
        expectedBenefit: '객실 투숙 유율 상승 및 브랜드 바이럴 홍보 극대화'
      }
    ]
  }
};

export const SAMPLE_COMPANY_REPORTS: Record<string, CompanyReport> = {
  'Garmin': {
    companyName: 'Garmin',
    generatedAt: '2026-08-11',
    overview: {
      companyName: '가민 (Garmin Ltd.)',
      englishName: 'Garmin Ltd.',
      summary: '미국에 본사를 둔 글로벌 고성능 GPS 내비게이션 및 스포츠 스마트 웨어러블 전문 기업. 항공, 해양, 자동차, 아웃도어, 피트니스 5개 핵심 영역에서 압도적인 기술력을 보유하고 있음.',
      mainBusinesses: ['아웃도어 GPS 기기', '프리미엄 피트니스 스마트워치', '항공/해양 내비게이션 시스템', '럭셔리 워치 컬렉션 (MARQ)'],
      mainBrands: ['Garmin Fenix', 'Garmin Forerunner', 'Garmin MARQ', 'Garmin Venu', 'Approach (Golf)'],
      productsServices: ['멀티스포츠 스마트워치', '골프 GPS 거리측정기', '사이클링 컴퓨터 (Edge)', 'Garmin Connect 앱 바이오 데이터 플랫폼'],
      targetCustomers: '프리미엄 러너, 골퍼, 아웃도어 트레커, 익스트림 스포츠 마니아, 하이엔드 웰니스 관심 고객',
      marketPosition: '고성능 스포츠 및 전문 아웃도어 스마트워치 시장 글로벌 1위 (럭셔리 스포츠 워치 부문 선도)'
    },
    brandIdentity: {
      positioning: 'Precision Performance & Adventurous Luxury (정밀한 성능과 탐험적 럭셔리)',
      targetCustomer: '자신의 신체 데이터를 측정하고 한계를 극복하고자 하는 3040 고소득 액티브 프로페셔널',
      personality: '전문적인(Professional), 신뢰할 수 있는(Trustworthy), 도전적인(Adventurous), 첨단의(High-tech)',
      coreMessage: 'Beat Yesterday (어제의 나를 넘어서다)',
      keywords: ['Performance', 'Navigation', 'Endurance', 'Precision', 'Bio-Data'],
      visualIdentity: '다크 매트 텍스처, 정밀한 아날로그-디지털 인터페이스, 인디고 블루 및 하이비즈 포인트 컬러'
    },
    recentActivities: [
      {
        yearMonth: '2026.06',
        type: '신제품',
        title: 'Garmin Approach S70 Premium Golf Collection 출시',
        description: '전 세계 43,000개 이상 골프장 코스 뷰 및 바람, 경사, 클럽 추천 AI 어시스턴트 기능 탑재'
      },
      {
        yearMonth: '2026.04',
        type: '팝업스토어',
        title: 'Garmin Bio-Hacking Lounge 팝업 @ 성수',
        description: '체수분, 수면 점수, Body Battery 실시간 진단 및 크라이오테라피 결합 브랜드 경험존 운영'
      },
      {
        yearMonth: '2026.02',
        type: '콜라보레이션',
        title: 'Garmin x 하이엔드 럭셔리 리조트 "Run & Recovery Suite"',
        description: '스마트워치 대여와 함께 객실 내 개인 맞춤형 스트레칭 및 수면 분석 프로그램 연계'
      },
      {
        yearMonth: '2025.10',
        type: '스폰서십',
        title: '글로벌 메이저 마라톤 및 하이엔드 트레일러닝 대회 공식 타임키퍼',
        description: '참가자 실시간 위치 추적 서비스 및 피니시 라인 파티 VIP 브랜딩'
      }
    ],
    marketingDirection: {
      focusAreas: ['Sports Wellness', 'Data-Driven Lifestyle', 'Premium Community', 'Luxury Experiential'],
      strategicAnalysis: '가민은 단순한 IT 기기 제조사를 넘어 고객의 생체 데이터(Heart Rate, Body Battery, Sleep Score)를 매개로 한 하이엔드 피트니스 & 웰니스 라이프스타일 에코시스템을 구축하는 데 집중하고 있음. 특히 프리미엄 골퍼 및 럭셔리 휴양 고객과의 접점을 확대하기 위해 오프라인 공간 제휴를 적극 모색 중임.'
    },
    partnerships: [
      {
        id: 'garmin-p1',
        domain: 'Golf',
        idea: '골프장 & 가민 어프로치 "Smart Caddie & Track Report" 제휴',
        whyThisBrand: '가민은 세계 최고 수준의 골프 코스 정밀 데이터와 웨어러블 디바이스를 보유하고 있어 골프장 고객 경험 가치를 극대화할 수 있음',
        brandBenefit: '프리미엄 골프장 고객에게 가민 플래그십 골프워치 시체험 기회 제공 및 유망 구매층 확보',
        businessBenefit: '골프장 코스 가치 제고, 스마트 골프장 브랜드 이미지 구축 및 클럽하우스 내 가민 가젯 판매 수수료 창출',
        targetCustomer: '3050 프리미엄 골프 클럽 회원 및 주말 필드 골퍼',
        difficulty: '하',
        potential: '높음'
      },
      {
        id: 'garmin-p2',
        domain: 'Wellness',
        idea: '리조트 & 가민 "Body Battery Medi-Sleep Retreat" 패키지',
        whyThisBrand: '가민의 체력 잔여량(Body Battery) 및 심회복도 데이터와 리조트의 스파/수면 시설이 결합 시 독보적인 메디-웰니스 스토리가 완성됨',
        brandBenefit: '투숙 기간 내 정밀 데이터를 기반으로 한 자사 기기의 강력한 효용성 입증',
        businessBenefit: '단순 숙박 상품을 고단가 하이엔드 웰니스 케어 패키지로 격상(ADR 상승 효과)',
        targetCustomer: '번아웃 해소 및 정밀 휴식을 원하는 3050 VIP 휴양 고객',
        difficulty: '중',
        potential: '높음'
      },
      {
        id: 'garmin-p3',
        domain: 'Brand Experience',
        idea: '야외 트레일 & 산책로 "Garmin Fitness Trail & GPS Checkpoint"',
        whyThisBrand: '리조트/호텔 주변의 산책로나 트레킹 코스를 가민 GPS 맵에 공식 등록하고 구간 기록 챌린지 운영 가능',
        brandBenefit: '아웃도어 액티비티 고객과의 자연스러운 오프라인 로케이션 브랜드 접점 형성',
        businessBenefit: '투숙객 야외 부대시설 이용률 증대 및 SNS 자발적 인증샷 버즈 형성',
        targetCustomer: '가족 및 연인 투숙객, 러닝/트레킹 마니아',
        difficulty: '하',
        potential: '중간'
      }
    ],
    recommendations: [
      {
        rank: 'BEST 1',
        badgeText: '가장 추천하는 핵심 제휴',
        ideaTitle: '골프장 & 가민 어프로치 "Smart Caddie & Track Report" 제휴',
        reasoning: '골프장에 가민의 최신 골프워치 대여 인프라를 구축하면 즉각적인 고객 만족도 상승과 클럽하우스 프리미엄 이미지 제고 효과가 발생하며, 초기 투자 부담이 낮아 빠른 실행이 가능함.'
      },
      {
        rank: 'BEST 2',
        badgeText: '실행 용이성 우수',
        ideaTitle: '야외 트레일 & 산책로 "Garmin Fitness Trail & GPS Checkpoint"',
        reasoning: '기존의 호텔/리조트 야외 산책 코스를 활용하여 가민 GPS 챌린지 코스로 지정하고 리워드를 제공하는 방식으로, 별도의 복잡한 설치 없이 마케팅 제휴 협약만으로 2주 내 즉시 시행 가능함.'
      },
      {
        rank: 'BEST 3',
        badgeText: '장기 확장성 높음',
        ideaTitle: '리조트 & 가민 "Body Battery Medi-Sleep Retreat" 패키지',
        reasoning: '호텔의 객실, 스파, F&B를 하나로 묶는 최고가 패키지 상품 개발이 가능하여 단가 상승과 장기적인 메디-웰니스 시그니처 리조트 브랜딩을 도모할 수 있음.'
      }
    ],
    relatedTrends: ['2026 웰니스 트렌드', '호텔·리조트 마케팅 트렌드', '최근 골프 산업 트렌드'],

    oakValleyFit: {
      overallFitScore: 95,
      isScoreAvailable: true,
      verifiedFactorsCount: 5,
      totalPossibleFactors: 7,
      coverageText: 'Evidence Coverage: 5 / 7 factors verified',
      brandFitScore: 96,
      customerFitScore: 94,
      factors: [
        {
          factorKey: 'golfFit',
          factorName: 'Golf Fit',
          grade: 'HIGH',
          score: 96,
          reasoning: '가민 어프로치(Approach) 라인업이 글로벌 프리미엄 골퍼 인지도 1위를 기록 중이며 오크밸리 36홀 코스와 완벽 연동됨.',
          evidenceSummary: 'Garmin Official IR Presentation (2025) 및 Approach 시리즈 공식 제품군',
          source: 'Garmin Official IR (2025.04)',
          verifiedDate: '2025.04',
          verified: true,
        },
        {
          factorKey: 'resortFit',
          factorName: 'Resort Stay Fit',
          grade: 'HIGH',
          score: 94,
          reasoning: '스위트 투숙객 대상 스마트 웰컴 가젯 대여 및 수면 데이터 리포팅 서비스 연계 가능성이 객관적으로 입증됨.',
          evidenceSummary: '가민 웰니스 디바이스 호스피탈리티 제휴 실적 보유',
          source: 'Garmin Press Release (2025.10)',
          verifiedDate: '2025.10',
          verified: true,
        },
        {
          factorKey: 'wellnessFit',
          factorName: 'Wellness Fit',
          grade: 'HIGH',
          score: 95,
          reasoning: '바디 배터리(Body Battery) 및 스트레스/수면 생체 데이터 지표가 오크밸리 참나무 숲 힐링 프로그램과 완벽 호환.',
          evidenceSummary: 'GWI Wellness Economy 2025 & Garmin Health API',
          source: 'Garmin Health Official (2025)',
          verifiedDate: '2025.08',
          verified: true,
        },
        {
          factorKey: 'customerFit',
          factorName: 'Customer Base Match',
          grade: 'HIGH',
          score: 94,
          reasoning: '오크밸리 주고객층인 3050 고소득 액티브 트래블러와 가민의 핵심 구매층이 일치함.',
          evidenceSummary: '기업 공식 데모그래픽 가이던스 및 한국관광공사 레저 데이터',
          source: 'KTO & Garmin IR Data (2025)',
          verifiedDate: '2025.09',
          verified: true,
        },
        {
          factorKey: 'executionFeasibility',
          factorName: 'Execution Feasibility',
          grade: 'HIGH',
          score: 96,
          reasoning: '클럽하우스 내 스마트 가젯 대여 카운터 및 숲길 GPS 트레킹 코스 지정으로 빠른 제휴 착수 가능.',
          evidenceSummary: '오크밸리 클럽하우스 및 참나무 숲길 공간 인프라 확보',
          source: 'Oak Valley Master Plan 2026',
          verifiedDate: '2026.01',
          verified: true,
        },
      ],
      recommendedAssets: [
        { asset: 'Golf', priority: 1, reason: '오크밸리 CC 및 성문안 CC(36홀 프리미엄 코스)에 가민 어프로치 S70 스마트 캐디 대여 인프라 구축' },
        { asset: 'Wellness', priority: 2, reason: '오크밸리 웰니스 센터 및 스파와 가민 바디배터리 수면/스트레스 생체 데이터 연동 프로그램' },
        { asset: 'Outdoor', priority: 3, reason: '오크밸리 산책로 "숨길" 참나무 숲 트레일에 가민 전용 GPS 챌린지 락커 및 트랙 설정' },
        { asset: 'Stay', priority: 4, reason: '가민 웰컴 스마트워치 대여 및 숙면 분석 데이터 리포트가 제공되는 "Oak Valley x Garmin Recovery Suite"' },
        { asset: 'Event', priority: 5, reason: '오크밸리 메인 잔디광장에서 가민 앰버서더 및 러닝 크루 초청 "Garmin Night Trail Run" 페스티벌' }
      ]
    },

    whyOakValley: {
      reasons: [
        {
          category: 'Customer',
          title: '고소득 액티브 골퍼 & 패밀리 고객층의 완벽한 스펙트럼 일치',
          detail: '오크밸리 연간 방문객의 68% 이상이 3050 고소득 액티브 소비층으로, 가민의 핵심 구매 타깃인 하이엔드 스포츠/골프 웨어러블 유저와 완벽히 상충 없이 맞물림.'
        },
        {
          category: 'Brand Experience',
          title: '대한민국 최고 수준의 36홀 프리미엄 골프 코스 및 참나무 숲 야외 필드',
          detail: '성문안 CC, 오크밸리 CC의 세계적 골프 코스와 광활한 참나무 숲 아웃도어 환경은 가민의 정밀 GPS, 골프 맵팅, 수면/체력 분석 기능을 검증하는 가장 완벽한 리빙랩(Living Lab)임.'
        },
        {
          category: 'Business',
          title: '골프장 스타트하우스 & 스위트 객실 팝업을 통한 높은 구매 전환율',
          detail: '라운딩 및 휴양 중에 직접 대여하여 18홀 실전 체험을 해본 고객의 현장 구매 전환율은 매장 매대 대비 최소 3.5배 이상 높음.'
        },
        {
          category: 'Marketing',
          title: '사계절 연중 브랜딩 독점성 및 고화질 바이럴 버즈 형성',
          detail: '봄/가을 라운딩 시즌 스마트 캐디, 여름 숲속 나이트 트레일, 겨울 스파 웰니스 등 사계절 내내 오크밸리의 상징적 공간을 가민의 오프라인 앰버시 거점으로 독점 마케팅할 수 있음.'
        },
        {
          category: 'Long-term Expansion',
          title: '오크밸리 전용 Garmin Connect 디지털 코스 구축 및 연례 챔피언십',
          detail: 'Garmin Connect 앱 내 "Oak Valley Championship Track"을 상설 신설하여 오크밸리 방문을 유도하는 디지털 락인(Lock-in) 팬덤 생태계 형성.'
        }
      ],
      recommendedPartnershipDirection: '오크밸리 CC 및 성문안 CC 내 "Garmin Smart Caddie Lounge" 상설 구축 및 "Oak Valley x Garmin Bio-Recovery Stay" 연간 제휴 협약 체결'
    }
  },

  'Nike': {
    companyName: 'Nike',
    generatedAt: '2026-08-11',
    overview: {
      companyName: '나이키 (Nike, Inc.)',
      englishName: 'Nike, Inc.',
      summary: '글로벌 스포츠 의류, 신발, 용품 시장의 독보적 1위 브랜드. 영감(Inspiration)과 혁신(Innovation)을 바탕으로 전 세계 운동선수 및 스포츠 팬덤을 매개하는 문화 아이콘.',
      mainBusinesses: ['스포츠 신발/의류 제조', '디지털 러닝 앱 (NRC/NTC)', '스포츠 스타 라이선싱 및 스폰서십', '커뮤니티 및 스트리트 웨어'],
      mainBrands: ['Nike', 'Jordan', 'Converse', 'Nike Running (NRC)'],
      productsServices: ['러닝화 (Alphafly, Vaporfly)', '농구화 & 조던 시리즈', '트레이닝 의류', 'Nike Training Club 디지털 플랫폼'],
      targetCustomers: '전 세계 운동선수, 러너, 스포츠 마니아, 젠지 스트리트 컬처 매니아, 액티브 라이프스타일 온·오프라인 소비자',
      marketPosition: '글로벌 스포츠웨어 및 운동화 브랜드 가치 1위'
    },
    brandIdentity: {
      positioning: 'Empowerment & Iconic Athletic Innovation (영감과 전설적인 스포츠 혁신)',
      targetCustomer: '자신의 가능성에 도전하고 도전을 즐기는 전 세계 모든 인간 ("If you have a body, you are an athlete")',
      personality: '도전적인(Challenging), 혁신적인(Innovative), 역동적인(Dynamic), 대담한(Bold)',
      coreMessage: 'Just Do It.',
      keywords: ['Inspiration', 'Athletic', 'Innovation', 'Community', 'Empowerment'],
      visualIdentity: '스우시(Swoosh) 로고, 볼드하고 강렬한 타이포그래피, 하이 콘트라스트 모노톤과 액션 컬러'
    },
    recentActivities: [
      {
        yearMonth: '2026.05',
        type: '캠페인',
        title: 'Nike Run Club "City Night Relay" 프로젝트',
        description: '도심 주요 거점과 도심 야경 트랙을 잇는 크루 기반 대규모 라운드 러닝 행사'
      },
      {
        yearMonth: '2026.03',
        type: '팝업스토어',
        title: 'Nike Innovation Lab & Recovery Hub',
        description: '최첨단 레이싱화 시착 및 발걸음 가속도/체형 측정 체험형 팝업 운영'
      }
    ],
    marketingDirection: {
      focusAreas: ['Grassroots Community', 'Digital App Ecosystem', 'Local Sport Culture', 'Premium Athletic Experience'],
      strategicAnalysis: '나이키는 디지털 앱(NRC)을 통한 고집적 스포츠 커뮤니티 연결과 오프라인 대규모 시체험 이벤트를 융합하는 데 주력하고 있음.'
    },
    partnerships: [
      {
        id: 'nike-p1',
        domain: 'Event',
        idea: '리조트 x Nike Run Club "Sunrise & Sunset Trail Run" 캠프',
        whyThisBrand: '나이키 러닝 크루의 압도적 모객력과 리조트의 탁월한 자연 경관이 결합되어 시너지 창출',
        brandBenefit: '자연 친화적 프리미엄 트레일 코스에서 나이키 트레일화 체험 및 팬덤 결속 강화',
        businessBenefit: '비수기 주말 주중 객실 가동률 상승 및 소셜 미디어 트렌디한 바이럴 효과',
        targetCustomer: '2040 러닝 마니아 및 스포츠 러버',
        difficulty: '중',
        potential: '높음'
      }
    ],
    recommendations: [
      {
        rank: 'BEST 1',
        badgeText: '가장 추천하는 핵심 제휴',
        ideaTitle: '리조트 x Nike Run Club "Sunrise & Sunset Trail Run" 캠프',
        reasoning: 'NRC 앱 사용자 인프라를 활용하여 리조트 투숙과 러닝 이벤트를 결합할 경우 압도적인 파급력을 창출함.'
      },
      {
        rank: 'BEST 2',
        badgeText: '실행 용이성 우수',
        ideaTitle: 'Nike Pop-up Rental Station @ 리조트 피트니스',
        reasoning: '호텔 피트니스 센터 내 나이키 최신 러닝화 및 피트니스 기어 임대 카운터를 상설 운영하는 방식.'
      },
      {
        rank: 'BEST 3',
        badgeText: '장기 확장성 높음',
        ideaTitle: '나이키 주니어 스포츠 챔피언십 레저 캠프',
        reasoning: '가족 단위 장기 체류 객실 유치 및 자녀 레저 교육 연계로 연례 시그니처 행사화 가능.'
      }
    ],
    relatedTrends: ['2026 웰니스 트렌드', '최근 골프 산업 트렌드', '글로벌 스포츠 마케팅 사례'],

    oakValleyFit: {
      overallFitScore: 90,
      isScoreAvailable: true,
      verifiedFactorsCount: 4,
      totalPossibleFactors: 7,
      coverageText: 'Evidence Coverage: 4 / 7 factors verified',
      brandFitScore: 91,
      customerFitScore: 89,
      factors: [
        {
          factorKey: 'eventFit',
          factorName: 'Event & Outdoor Fit',
          grade: 'HIGH',
          score: 95,
          reasoning: 'Nike Run Club(NRC) 및 나이키 트레일 대규모 야외 이벤트 수행 이력이 보도자료 및 글로벌 캠페인으로 확인됨.',
          evidenceSummary: 'NRC 트레일 런 페스티벌 및 팝업스토어 공식 보도',
          source: 'Nike Newsroom & Press Release (2025.11)',
          verifiedDate: '2025.11',
          verified: true,
        },
        {
          factorKey: 'golfFit',
          factorName: 'Golf Fit',
          grade: 'HIGH',
          score: 92,
          reasoning: '나이키 골프 어패럴/화 라인업이 프리미엄 골프 시장에서 활발히 유통되고 있음.',
          evidenceSummary: 'Nike Golf Official Product Line & Sponsorships',
          source: 'Nike Official Store & IR (2025)',
          verifiedDate: '2025.06',
          verified: true,
        },
        {
          factorKey: 'customerFit',
          factorName: 'Customer Base Match',
          grade: 'HIGH',
          score: 89,
          reasoning: '오크밸리 투숙객 및 방문객 타깃층과 나이키 러닝/골프 타깃 페르소나의 일치도가 높음.',
          evidenceSummary: 'Nike Annual Report 2025 Consumer Segments',
          source: 'Nike Annual Report 2025',
          verifiedDate: '2025.07',
          verified: true,
        },
        {
          factorKey: 'executionFeasibility',
          factorName: 'Execution Feasibility',
          grade: 'HIGH',
          score: 88,
          reasoning: '리조트 야외 광장 기반 러닝 챌린지 및 팝업 렌탈존 형태의 빠른 착수 가능.',
          evidenceSummary: '오크밸리 야외 잔디광장 매체 확보',
          source: 'Oak Valley Media Directory',
          verifiedDate: '2026.01',
          verified: true,
        },
      ],
      recommendedAssets: [
        { asset: 'Event', priority: 1, reason: '오크밸리 광활한 야외 잔디광장을 활용한 NRC 대규모 트레일 러닝 및 페스티벌' },
        { asset: 'Outdoor', priority: 2, reason: '원주 자연 숲 트레일 인프라를 기반으로 한 나이키 트레일 러닝 전용 코스 지정' },
        { asset: 'Golf', priority: 3, reason: '오크밸리 CC 연계 나이키 골프(Nike Golf) 신규 어패럴 및 라운딩 팝업존' },
        { asset: 'Stay', priority: 4, reason: '러닝 크루 및 스포츠 동호인 단체 투숙을 위한 전용 룸 패키지' },
        { asset: 'Digital', priority: 5, reason: 'Nike Run Club(NRC) 앱 내 오크밸리 전용 인앱 코스 챌린지 런칭' }
      ]
    },

    whyOakValley: {
      reasons: [
        {
          category: 'Customer',
          title: 'MZ세대 액티브 러너부터 고소득 골프 애호가까지의 폭넓은 상호 보완',
          detail: '나이키의 핵심 팬덤인 2030 트렌디 러너 및 3040 골프 레이디/아마추어가 오크밸리의 리조트 및 골프 자산과 정확히 결합함.'
        },
        {
          category: 'Brand Experience',
          title: '압도적인 규모의 야외 잔디광장 및 청정 숲 아웃도어 무대',
          detail: '도심 답답한 트랙을 벗어나 오크밸리의 탁 트인 자연 속에서 나이키 러닝화와 골프웨어의 혁신적 성능을 온전히 전달할 수 있음.'
        },
        {
          category: 'Business',
          title: '주말 데이이벤트 및 대규모 체류형 스포츠 캠프 매출',
          detail: 'NRC 챌린지 참가자 500~1,000명 단위의 주말 대규모 단체 투숙 및 F&B 매출을 즉시 견인 가능.'
        },
        {
          category: 'Marketing',
          title: '소셜 미디어 버즈 폭발 및 젠지(GenZ) 오크밸리 브랜드 유입',
          detail: '나이키 시그니처 팝업 및 야간 나이트 릴레이를 통해 오크밸리의 브랜드 이미지를 한층 더 젊고 트렌디하게 쇄신.'
        },
        {
          category: 'Long-term Expansion',
          title: '매년 개최되는 "Oak Valley x Nike Trail Relay Festival"',
          detail: '단발성 행사를 넘어 봄/가을 오크밸리 공식 시그니처 아웃도어 스포츠 축제로 브랜드 상징화.'
        }
      ],
      recommendedPartnershipDirection: '오크밸리 야외 잔디광장 기반 "Nike Trail Running Camp" 연례 개최 및 오크밸리 CC 내 Nike Golf 팝업스토어 유치'
    }
  },

  'Snow Peak': {
    companyName: 'Snow Peak',
    generatedAt: '2026-08-11',
    overview: {
      companyName: '스노우피크 (Snow Peak)',
      englishName: 'Snow Peak Inc.',
      summary: '일본 니가타현에서 시작된 프리미엄 아웃도어 및 라이프스타일 브랜드. "인간성 회복"을 브랜드 철학으로 삼아 장인 정신이 담긴 캠핑 기어와 럭셔리 아웃도어 가구를 제조·판매함.',
      mainBusinesses: ['프리미엄 캠핑 용품', '아웃도어 어패럴', '스노우피크 필드 리조트 및 모듈러 하우스', 'F&B 및 감성 라이프스타일'],
      mainBrands: ['Snow Peak', 'Snow Peak Apparel', 'Snow Peak Eat', 'FIELD SUITE SPA'],
      productsServices: ['티타늄 컵/체어/화로대', '모듈러 타프/텐트', '친환경 아웃도어 의류', '야외 사우나 및 글램핑 공간 컨설팅'],
      targetCustomers: '자연 속에서 고품격 휴식을 열망하는 3050 프리미엄 고소득 패밀리 및 자연주의 라이프스타일러',
      marketPosition: '프리미엄 감성 캠핑 및 럭셔리 아웃도어 라이프스타일 영역 독보적 위치'
    },
    brandIdentity: {
      positioning: 'Outdoor Luxury & Humanity Restoration (아웃도어 럭셔리와 인간성의 회복)',
      targetCustomer: '바쁜 도시 생활에서 벗어나 가족·지인과 불멍(화로)을 즐기며 대화하고자 하는 감성 소비층',
      personality: '자연 친화적인(Nature-oriented), 장인 정신의(Artisanal), 따뜻한(Warm), 프리미엄(Premium)',
      coreMessage: 'No Asobi Life (일상에 놀이를)',
      keywords: ['Restoration', 'Craftsmanship', 'Nature', 'Bonfire', 'OutdoorLuxury'],
      visualIdentity: '자연스러운 에스닉 아웃도어 톤, 내추럴 우드, 티타늄 그레이, 세련된 아웃도어 라이트'
    },
    recentActivities: [
      {
        yearMonth: '2026.04',
        type: '이벤트',
        title: 'Snow Peak Way Premium Outdoor Gathering',
        description: '자연 속에서 모닥불을 피우고 브랜드 팬들과 모놀로그 대화를 나누는 럭셔리 캠프'
      },
      {
        yearMonth: '2026.01',
        type: '신제품',
        title: '스노우피크 야외 모닥불 온천 사우나 세트',
        description: '리조트 및 야외 공간에 간편하게 설치 가능한 가변형 핀란드식 사우나 캐빈'
      }
    ],
    marketingDirection: {
      focusAreas: ['Natural Immersion', 'Outdoor Sauna & Spa', 'Family Bonding', 'Sustainable Resort Architecture'],
      strategicAnalysis: '단순한 용품 판매를 넘어 자연과 인간을 잇는 리조트, 스파, 글램핑 공간 컬래버레이션 프로젝트에 전사적인 역량을 집중하고 있음.'
    },
    partnerships: [
      {
        id: 'sp-p1',
        domain: 'Accommodation',
        idea: '리조트 x Snow Peak "Field Suite Glamping Lounge"',
        whyThisBrand: '스노우피크의 완성도 높은 프리미엄 텐트와 가구는 리조트 야외 부지에 설치 시 즉각적인 5성급 글램핑 라운지로 탈바꿈함',
        brandBenefit: '자사 프리미엄 캠핑 장비를 최상급 환경에서 체험하게 하여 하이엔드 구매 유도',
        businessBenefit: '유휴 야외 부지를 활용하여 신규 유료 글램핑/BBQ/불멍 체험 공간 구축 및 고수익 창출',
        targetCustomer: '3040 키즈 동반 가족 투숙객 및 럭셔리 감성 커플',
        difficulty: '중',
        potential: '높음'
      }
    ],
    recommendations: [
      {
        rank: 'BEST 1',
        badgeText: '가장 추천하는 핵심 제휴',
        ideaTitle: '리조트 x Snow Peak "Field Suite Glamping Lounge"',
        reasoning: '호텔 및 리조트의 잔여 야외 부지를 활용해 최고급 글램핑 존을 구축할 수 있으며, 공간 가치 극대화와 높은 부대시설 이용료 수입을 보장함.'
      },
      {
        rank: 'BEST 2',
        badgeText: '실행 용이성 우수',
        ideaTitle: '스노우피크 불멍(Bonfire) & 와인 나이트 라운지',
        reasoning: '스노우피크 대표 화로대를 야외 테라스에 연출하고 와인과 아쿠스틱 음악을 결합하는 야간 감성 프로그램으로, 최소 비용으로 즉각 도입 가능함.'
      },
      {
        rank: 'BEST 3',
        badgeText: '장기 확장성 높음',
        ideaTitle: '스노우피크 모듈러 야외 사우나 & 웰니스 스파 룸',
        reasoning: '사계절 운영 가능한 야외 이동식 사우나 및 자연 온천존을 기획하여 겨울철 및 사계절 인기를 끄는 독창적 시그니처 시설로 발전 가능.'
      }
    ],
    relatedTrends: ['2026 웰니스 트렌드', '호텔·리조트 마케팅 트렌드', '최근 팝업스토어 트렌드'],

    oakValleyFit: {
      overallFitScore: 97,
      isScoreAvailable: true,
      verifiedFactorsCount: 5,
      totalPossibleFactors: 7,
      coverageText: 'Evidence Coverage: 5 / 7 factors verified',
      brandFitScore: 98,
      customerFitScore: 96,
      factors: [
        {
          factorKey: 'resortFit',
          factorName: 'Resort Stay Fit',
          grade: 'HIGH',
          score: 98,
          reasoning: '스노우피크 필드 스위트(FIELD SUITE) 및 리조트 모듈러 하우스 설치 사업이 공식 IR 및 프로젝트 보고서로 검증됨.',
          evidenceSummary: 'Snow Peak FIELD SUITE SPA 공식 가동 실적 및 IR 자료',
          source: 'Snow Peak IR Presentation (2025.05)',
          verifiedDate: '2025.05',
          verified: true,
        },
        {
          factorKey: 'wellnessFit',
          factorName: 'Wellness Fit',
          grade: 'HIGH',
          score: 97,
          reasoning: '자연 감성 아웃도어 힐링 및 모닥불(불멍) 프로그램이 브랜드 핵심 정체성임.',
          evidenceSummary: 'Snow Peak Sustainability & Brand Book 2025',
          source: 'Snow Peak Brand Book (2025)',
          verifiedDate: '2025.03',
          verified: true,
        },
        {
          factorKey: 'eventFit',
          factorName: 'Event & Outdoor Fit',
          grade: 'HIGH',
          score: 96,
          reasoning: 'Snow Peak Way 프리미엄 야외 고객 이벤트 개최 이력이 다수 입증됨.',
          evidenceSummary: 'Snow Peak Way Official Event History',
          source: 'Snow Peak Official Site (2025.12)',
          verifiedDate: '2025.12',
          verified: true,
        },
        {
          factorKey: 'customerFit',
          factorName: 'Customer Base Match',
          grade: 'HIGH',
          score: 96,
          reasoning: '오크밸리 고소득 패밀리 투숙객과 스노우피크 로열티 고객층의 구매력이 상호 최고 수준 일치.',
          evidenceSummary: '스노우피크 로열티 멤버십 분석 데이터',
          source: 'Snow Peak IR Data (2025)',
          verifiedDate: '2025.06',
          verified: true,
        },
        {
          factorKey: 'executionFeasibility',
          factorName: 'Execution Feasibility',
          grade: 'HIGH',
          score: 98,
          reasoning: '오크밸리 울창한 참나무 숲과 잔디광장을 활용한 모듈러 라운지 구축 즉시 가능.',
          evidenceSummary: '오크밸리 야외 잔디광장 및 숲길 매체 인프라',
          source: 'Oak Valley Master Plan 2026',
          verifiedDate: '2026.01',
          verified: true,
        },
      ],
      recommendedAssets: [
        { asset: 'Outdoor', priority: 1, reason: '오크밸리의 잔여 울창한 숲 부지를 스노우피크 필드 스위트 감성 캠핑 존으로 전환' },
        { asset: 'Stay', priority: 2, reason: '스노우피크 모듈러 텐트 및 전용 가구 세트로 구성된 "Snow Peak Field Suite Room"' },
        { asset: 'F&B', priority: 3, reason: '오크밸리 야외 잔디광장에서 스노우피크 티타늄 쿡웨어 기반 불멍(Bonfire) & 와인 F&B' },
        { asset: 'Wellness', priority: 4, reason: '스노우피크 야외 모닥불 사우나 세트를 오크밸리 숨길 산책로에 연계 구축' },
        { asset: 'Event', priority: 5, reason: '오크밸리 회원 및 스노우피크 VIP 유저 초청 "Snow Peak Way @ Oak Valley" 정례 개최' }
      ]
    },

    whyOakValley: {
      reasons: [
        {
          category: 'Customer',
          title: '3050 고소득 패밀리 투숙객과 스노우피크 VIP 타깃층의 100% 동질성',
          detail: '오크밸리의 주요 방문객인 하이엔드 키즈 패밀리 및 자연 속 휴양 희망자는 스노우피크가 지향하는 "인간성 회복"과 감성 아웃도어 기어의 최고 소비층임.'
        },
        {
          category: 'Brand Experience',
          title: '수도권 근교 독보적 규모의 유휴 산림 부지 및 고급 숙박 인프라',
          detail: '단순한 인공 캠핑장이 아닌, 오크밸리의 울창한 실제 자연 참나무 산림 부지는 스노우피크 장비의 최상급 가치(No Asobi)를 발현할 수 있는 유일무이한 무대임.'
        },
        {
          category: 'Business',
          title: '유휴 부지 가치 극대화를 통한 럭셔리 글램핑 & F&B 높은 마진율',
          detail: '건축 공사 없이 스노우피크 전용 필드 스위트 존 설치만으로 최고 단가 글램핑 패키지와 야간 F&B 불멍 세트를 판매하여 즉각적인 고수익 창출.'
        },
        {
          category: 'Marketing',
          title: '스노우피크 팬덤의 자발적 SNS 인증샷 및 연중 매진 신화',
          detail: '스노우피크 럭셔리 캠핑존은 인스타그램 인증샷 성지로 부상하여 오크밸리 전체의 감성 브랜드 이미지를 크게 상승시킴.'
        },
        {
          category: 'Long-term Expansion',
          title: '오크밸리 내 상설 "Snow Peak Field Suite Spa & Resort" 단지화',
          detail: '일본 스노우피크 니가타 본사 필드 스위트처럼, 오크밸리 단지 일부를 국내 최초 "Snow Peak Field Suite Spa" 공식 거점으로 장기 개발.'
        }
      ],
      recommendedPartnershipDirection: '오크밸리 야외 잔여 산림 부지 내 "Snow Peak Field Suite Glamping & Bonfire Lounge" 상설 구축'
    }
  }
};

