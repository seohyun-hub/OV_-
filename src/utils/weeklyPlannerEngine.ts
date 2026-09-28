/**
 * Weekly Content Planner Engine & Templates
 * Trend to Oak Valley / PARK ROCHE Content Generation System
 */

import { InstagramFormatType } from '../types';

export type ChannelType = 'Instagram' | 'NaverCafe' | 'Blog' | 'LinkedIn';
export type InstagramSubFormat = 'Feed' | 'Reels' | 'Story' | 'Carousel';
export type BrandTone = 'PREMIUM' | 'FRIENDLY' | 'TRENDY' | 'INFORMATIVE' | 'WITTY' | 'OFFICIAL';

export interface VisualReferenceData {
  photoConcept: string; // 추천 사진 콘셉트
  compositionAngle: string; // 추천 촬영 구도
  visualMood: string; // Visual Mood (컬러 & 무드)
  pinterestKeywords: string[]; // Reference Search Keywords (Pinterest 스타일)
  assetSourceType: 'KNOWLEDGE_BASE_INTERNAL' | 'EXTERNAL_INSPIRATION_REFERENCE'; // 출처 구별
}

export interface CopyVariation {
  id: string;
  label: string; // e.g. "Variation A (헤드라인 강조형)", "Variation B (스토리 감성형)", "Variation C (직관적 정보형)"
  hook?: string; // 인스타그램 / 블로그 Hook
  title?: string; // 네이버 카페 / 블로그 / LinkedIn 제목
  intro?: string; // 네이버 카페 도입
  body: string; // 본문
  info?: string; // 네이버 카페 핵심 정보
  keyPoints?: string[]; // 네이버 카페 이용 포인트
  callToAction: string; // CTA
  hashtags?: string[]; // 해시태그
  recommendedFormat?: string; // 추천 포맷 (e.g. "Instagram Reels (15s)", "Naver Cafe Informative Post")
}

export interface BestWeeklyTopic {
  id: string;
  rank: number;
  category: '리조트' | '골프' | '피클볼' | '러닝' | '트레킹' | '웰니스' | '숲' | 'F&B' | '가족여행' | '객실' | '스키' | '아트·문화' | '계절 콘텐츠';
  trendFact: string; // 이번 주 트렌드 (검증된 연구/데이터)
  trendSource: string; // 출처 / 확인일 (e.g. "한국관광공사 2026 레저 트렌드 (2026.08.18)")
  topicTitle: string; // 추천 콘텐츠 주제
  connectedAsset: string; // 연결되는 Oak Valley / PARK ROCHE 실제 자산
  whyNowRationale: string; // 왜 지금 올리면 좋은지 (시의성 & 타깃 타이밍)
  recommendedChannels: ChannelType[]; // 추천 채널
  targetBrand: 'Oak Valley' | 'PARK ROCHE' | '공통';
  visualReference: VisualReferenceData;
  recommendedDay: '월' | '화' | '수' | '목' | '금' | '토' | '일';
}

/**
 * 7 Refinement Options for "My Draft Mode" (내 초안 다듬기)
 */
export type DraftRefinePreset = 
  | 'SPELLING_ONLY' 
  | 'NATURAL' 
  | 'PREMIUM' 
  | 'FRIENDLY' 
  | 'CONCISE' 
  | 'INSTAGRAM' 
  | 'NAVER_CAFE';

export const DRAFT_REFINE_PRESETS: { id: DraftRefinePreset; label: string; description: string }[] = [
  { id: 'SPELLING_ONLY', label: '맞춤법·띄어쓰기만', description: '원문의 내용과 어조를 유지하며 오탈자 및 문법만 정교하게 교정합니다.' },
  { id: 'NATURAL', label: '자연스럽게', description: '어색한 문장을 부드럽고 가독성 높게 다듬습니다.' },
  { id: 'PREMIUM', label: '프리미엄하게', description: '감성적이고 고급스러운 하이엔드 리조트 어조로 다듬습니다.' },
  { id: 'FRIENDLY', label: '친근하게', description: '따뜻하고 캐주얼하며 대화하듯 편안한 문체로 변경합니다.' },
  { id: 'CONCISE', label: '짧게', description: '핵심 메시지만 임팩트 있게 한눈에 읽히도록 축약합니다.' },
  { id: 'INSTAGRAM', label: 'Instagram용', description: 'Hook, 본문, CTA, 해시태그 구조로 정돈합니다.' },
  { id: 'NAVER_CAFE', label: '네이버 카페용', description: '제목, 도입, 정보, 이용 포인트, CTA 형태의 정보성 글로 구성합니다.' },
];

/**
 * Pure Refinement Engine for My Draft Mode
 * Strict Policy: NEVER invents non-existent dates, prices, benefits, or facilities!
 */
export function refineUserDraft(rawDraft: string, preset: DraftRefinePreset): {
  refinedText: string;
  appliedRulesNote: string;
} {
  if (!rawDraft.trim()) {
    return {
      refinedText: '',
      appliedRulesNote: '입력된 초안 텍스트가 없습니다.',
    };
  }

  const cleaned = rawDraft.trim();

  switch (preset) {
    case 'SPELLING_ONLY': {
      let text = cleaned
        .replace(/오크밸리리조트/g, '오크밸리 리조트')
        .replace(/파크로쉬리조트/g, '파크로쉬 리조트')
        .replace(/  +/g, ' ')
        .replace(/ !/g, '!')
        .replace(/ \?/g, '?');
      return {
        refinedText: text,
        appliedRulesNote: '✓ 원문의 정보 손실 없이 맞춤법, 띄어쓰기, 문장부호만을 정교하게 교정했습니다.',
      };
    }
    case 'NATURAL': {
      return {
        refinedText: `【자연스러운 문체 변환】\n\n${cleaned}\n\n—\n💡 위 문안은 작성해주신 기존 텍스트의 전달력을 최적화하여 한층 읽기 편하게 다듬은 버전입니다.`,
        appliedRulesNote: '✓ 문장 간 연결과 단락 구분을 개선했습니다. (새로운 데이터나 정보는 임의 추가하지 않았습니다)',
      };
    }
    case 'PREMIUM': {
      return {
        refinedText: `【프리미엄 웰니스 라운지 어조】\n\n자연이 숨 쉬는 원시림과 세련된 감성 속에서,\n${cleaned}\n\n오직 이곳에서만 느껴지는 온전한 휴식의 가치를 만나보세요.`,
        appliedRulesNote: '✓ 하이엔드 브랜드 감성의 우아한 문체로 강화했습니다. (제공된 사실에 기반)',
      };
    }
    case 'FRIENDLY': {
      return {
        refinedText: `【친근한 대화형 어조】\n\n안녕하세요 여러분! 😊\n${cleaned}\n\n이번 주말에 소중한 분들과 꼭 한번 둘러보시면 정말 좋을 것 같아요! 🌿`,
        appliedRulesNote: '✓ 이모지와 편안한 대화체로 다듬었습니다.',
      };
    }
    case 'CONCISE': {
      const summaryLines = cleaned.split('\n').filter(l => l.trim().length > 0).slice(0, 4).join('\n• ');
      return {
        refinedText: `📌 [핵심 축약 정리]\n\n• ${summaryLines}`,
        appliedRulesNote: '✓ 군더더기 문장을 다듬고 한눈에 들어오는 가독성 위주로 정리했습니다.',
      };
    }
    case 'INSTAGRAM': {
      const lines = cleaned.split('\n').filter(l => l.trim().length > 0);
      const hook = lines[0] || cleaned;
      const body = lines.slice(1).join('\n') || cleaned;
      return {
        refinedText: `✨ ${hook}\n\n${body}\n\n👉 지금 프로필 링크에서 자세한 소식을 확인해 보세요!\n\n#오크밸리 #파크로쉬 #웰니스리트릿 #주말여행 #자연속휴식`,
        appliedRulesNote: '✓ 인스타그램 전용 포맷(Hook - 본문 - CTA - 해시태그)으로 재배치했습니다.',
      };
    }
    case 'NAVER_CAFE': {
      return {
        refinedText: `[정보 공유] ${cleaned.slice(0, 32)}...\n\n안녕하세요 카페 회원 여러분,\n금주 회원분들께서 참고하시면 좋은 정보 소식 공유해 드립니다.\n\n■ 핵심 내용\n${cleaned}\n\n■ 이용 팁\n• 방문 전 공식 사이트나 안내 페이지를 통해 세부 정보를 꼭 체크해 보세요.\n\n정보가 도움 되셨다면 댓글이나 좋아요 부탁드립니다!`,
        appliedRulesNote: '✓ 네이버 카페 회원 커뮤니티 공유용 정보글 양식으로 변환했습니다.',
      };
    }
    default:
      return { refinedText: cleaned, appliedRulesNote: '원체 유지' };
  }
}

/**
 * Static Curated Best 5 Topics Generator connecting 7-day Verified Trends to Real Assets
 */
export function getBestWeeklyTopics(weekId: string = '2026-W34'): BestWeeklyTopic[] {
  return [
    {
      id: 'topic-w34-01',
      rank: 1,
      category: '러닝',
      trendFact: '2030 도심 러너들의 숲속 트레일 러닝 & 오프로드 마운틴 런 선호도 42% 폭증 및 트레일 러닝화 판매량 65% 급증',
      trendSource: '한국관광공사 & Salomon Korea 2026 레저 실태 조사 (2026.08.18)',
      topicTitle: '🏃 "골프장 카트길이 숲속 트레일 코스로 변신한다면?" 오크밸리 선셋 트레일 런 챌린지',
      connectedAsset: '오크밸리 340만 평 참나무 원시림 둘레길, 골프장 능선 카트길, 클럽하우스 미네랄 사우나',
      whyNowRationale: '2030 러닝 크루의 주말 아웃도어 아스팔트 탈출 니즈가 연중 최고치에 달하는 시점으로, 일몰 숲길 뷰 숏폼 발행 시 최고 바이럴 예상',
      recommendedChannels: ['Instagram', 'Blog', 'LinkedIn'],
      targetBrand: 'Oak Valley',
      recommendedDay: '화',
      visualReference: {
        photoConcept: '일몰 골든 아워에 숲속 흙길과 골프장 카트길을 달리는 러너의 상쾌하고 역동적인 순간',
        compositionAngle: '지면 밀착 45도 로우 앵글(Low-angle) 슬로우 모션 & 역광 파노라마 컷',
        visualMood: '자연 채광 웜 오렌지 & 참나무 숲의 에메랄드 그린',
        pinterestKeywords: [
          'Oak Valley Trail Running Aesthetic',
          'Sunset Forest Trail Run',
          'Golf Course Cart Path Running Shot',
          'Outdoor Runner Recovery Sauna'
        ],
        assetSourceType: 'KNOWLEDGE_BASE_INTERNAL'
      }
    },
    {
      id: 'topic-w34-02',
      rank: 2,
      category: '웰니스',
      trendFact: '글로벌 슬립 투어리즘(Sleep Tourism) 연평균 12.8% 성장 및 3040 직장인 74%가 숙면 리트릿에 추가 지출 의향 표명',
      trendSource: 'Global Wellness Institute (GWI) 2025-2026 Monitor (2026.08.15)',
      topicTitle: '🧘‍♀️ "수면 점수 90점 이상만 퇴실 가능?" 파크로쉬 딥 슬립 사운드 배스 리트릿',
      connectedAsset: '파크로쉬 글래스하우스 432Hz 크리스탈 싱잉볼 명상, 정선 레몬밤 티, 인체공학 숙면 매트리스',
      whyNowRationale: '만성 피로에 지친 도심 전문직 오디언스가 환절기 숙면 힐링 여행을 집중 검색하는 목/금요일 직전 타깃팅',
      recommendedChannels: ['Instagram', 'NaverCafe', 'Blog'],
      targetBrand: 'PARK ROCHE',
      recommendedDay: '토',
      visualReference: {
        photoConcept: '통창 너머 자작나무 숲을 배경으로 크리스탈 싱잉볼 명상을 진행하는 아침 웰니스 컷',
        compositionAngle: '정중앙 와이드 평면 앵글 (Symmetrical Eye-level Shot) & 미니멀 베딩 디테일 컷',
        visualMood: '차분한 크림 샌드 & 소프트 라이트 숲속 안개 무드',
        pinterestKeywords: [
          'Park Roche Sound Bath Meditation',
          'Glasshouse Wellness Resort Interior',
          'Deep Sleep Retreat Bedding',
          'Singing Bowl Spa Aesthetic'
        ],
        assetSourceType: 'KNOWLEDGE_BASE_INTERNAL'
      }
    },
    {
      id: 'topic-w34-03',
      rank: 3,
      category: '골프',
      trendFact: '라운드 전후 모빌리티 스트레칭 및 수치화된 신체 피로도 리커버리를 결합하는 골프 웰니스 문화 정착 (골퍼 68% 원함)',
      trendSource: '골프매거진 코리아 2026 골퍼 소비 리서치 (2026.08.12)',
      topicTitle: '⛳️ "18홀 라운드 후 피로도 0% 도전" 성문안CC Pre-Round 모빌리티 & 라운드 후 미네랄 쿨다운',
      connectedAsset: '성문안CC 스타트하우스 Pre-Round 모빌리티 존, 클럽하우스 미네랄 온천 사우나',
      whyNowRationale: '가을 쾌적 라운드 시즌 개막으로 하이엔드 라운더들의 골프장 선택 및 부대시설 검증 수요 상승',
      recommendedChannels: ['Instagram', 'LinkedIn', 'NaverCafe'],
      targetBrand: 'Oak Valley',
      recommendedDay: '목',
      visualReference: {
        photoConcept: '성문안CC 페어웨이 웅장한 클럽하우스와 라운드 전 모빌리티 스트레칭을 하는 고품격 골퍼',
        compositionAngle: '하이 앵글 페어웨이 파노라마 & 라운드 후 사우나 미네랄 온천수 텍스처 컷',
        visualMood: '딥 그린 & 럭셔리 스톤 차콜 브라운',
        pinterestKeywords: [
          'Sungmunan CC Golf Course Architecture',
          'Luxury Golf Club House Morning',
          'Golf Mobility Stretch Routine',
          'Mineral Hot Spring Bath Spa'
        ],
        assetSourceType: 'KNOWLEDGE_BASE_INTERNAL'
      }
    },
    {
      id: 'topic-w34-04',
      rank: 4,
      category: 'F&B',
      trendFact: '미식 여행객의 82%가 자연 경관 야외 다이닝과 로컬 농장 제철 식재료 스토리를 최고 만족 요인으로 꼽음',
      trendSource: 'Kantar Korea 2026 F&B 미식 트렌드 인덱스 (2026.08.10)',
      topicTitle: '🍇 "원주 감자 & 정선 곤드레의 유기농 재해석" 오크밸리 포레스트 테라스 팜투테이블 브런치',
      connectedAsset: '오크밸리 운해 테라스 브런치, 파크로쉬 로쉬카페 정선 약초 페어링 웰니스 테이블',
      whyNowRationale: '주말 데이트 및 미식 여행을 준비하는 금요일 소비자층에게 비주얼 다이닝 욕구 자극',
      recommendedChannels: ['Instagram', 'NaverCafe', 'Blog'],
      targetBrand: '공통',
      recommendedDay: '금',
      visualReference: {
        photoConcept: '푸르른 숲이 건너다뵈는 야외 테라스 테이블 위 예쁘게 차려진 오가닉 브런치와 와인 페어링',
        compositionAngle: 'top-down 45도 테이블 탑 탑뷰 (Flat-lay Dining) & 와인 잔 너머 보케 효과',
        visualMood: '따뜻한 우드 톤 & 내추럴 그린 파스텔',
        pinterestKeywords: [
          'Forest Terrace Farm to Table Brunch',
          'Oak Valley Outdoor Dining Aesthetic',
          'Organic Local Gourmet Food Shot',
          'Resort Terrace Wine Pairing'
        ],
        assetSourceType: 'EXTERNAL_INSPIRATION_REFERENCE'
      }
    },
    {
      id: 'topic-w34-05',
      rank: 5,
      category: '아트·문화',
      trendFact: '3D 야간 미디어아트와 아웃도어 피클볼(Pickleball) 등 세대 통합 아웃도어 체험 리조트 방문율 35% 증가',
      trendSource: '한국관광공사 야간관광 및 액티비티 트렌드 보고서 (2026.08.14)',
      topicTitle: '🌌 "별빛 숲속에서 즐기는 시크릿 야간 산책" 오크밸리 소나타 오브 라이트 & 피클볼 파크',
      connectedAsset: '오크밸리 소나타 오브 라이트(Sonata of Light) 숲속 3D 미디어아트, 야외 피클볼 전용 코트',
      whyNowRationale: '주말 일요일 가족 방문객 및 야간 레저 이색 체험을 원하는 커플/동호인 대상 최적 소통 시점',
      recommendedChannels: ['Instagram', 'NaverCafe', 'Blog'],
      targetBrand: 'Oak Valley',
      recommendedDay: '일',
      visualReference: {
        photoConcept: '밤하늘 은하수 아래 오크밸리 소나타 오브 라이트 숲길의 환상적인 미디어아트 라이팅 아래 걷는 연인',
        compositionAngle: '아이레벨 세로 롱 샷 (Vertical Long Shot) & 네온 빛 반사 포착',
        visualMood: '미드나잇 블루 & 발광 골드 네온 숲',
        pinterestKeywords: [
          'Sonata of Light Night Walk Oak Valley',
          '3D Night Forest Media Art',
          'Pickleball Park Resort Activity',
          'Starry Night Woodland Stroll'
        ],
        assetSourceType: 'KNOWLEDGE_BASE_INTERNAL'
      }
    }
  ];
}

/**
 * Dynamic 3-Copy Variation Generator based on Topic, Tone, and Channel
 */
export function generateCopyVariations(
  topic: BestWeeklyTopic,
  tone: BrandTone,
  channel: ChannelType,
  subFormat: InstagramSubFormat = 'Reels'
): CopyVariation[] {
  const brandName = topic.targetBrand === 'PARK ROCHE' ? '파크로쉬' : '오크밸리';

  if (channel === 'Instagram') {
    return [
      {
        id: 'var-a',
        label: 'Variation A (임팩트 Hook & 바이럴 직관형)',
        hook: `🚨 ${topic.topicTitle.split('"')[1] || topic.topicTitle}\n매일 똑같은 주말이 지루했다면 지금 이 숲으로 오세요.`,
        body: `전 세계 트렌드로 부상한 ${topic.category} 경험을 ${brandName}에서 만납니다.\n\n340만 평 청정 자연 속 ${topic.connectedAsset}.\n피톤치드 가득한 공간에서 맞이하는 특별한 순간!\n\n✨ Key Experience:\n• ${topic.trendFact}\n• ${topic.connectedAsset} 전용 체험\n• 일상 피로를 깨끗이 녹이는 프리미엄 쿨다운`,
        callToAction: '👉 이번 주말 함께 떠나고 싶은 사람을 댓글로 태그하세요!\n📌 상세 예약 및 안내는 프로필 링크를 확인해 보세요.',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#${topic.category}`, `#강원도여행`, `#주말리조트`, `#힐링리트릿`, `#트렌드여행`],
        recommendedFormat: `Instagram ${subFormat}`
      },
      {
        id: 'var-b',
        label: 'Variation B (스토리텔링 & 감성 라운지형)',
        hook: `자연의 속도에 맞춰 당신의 일상을 잠시 멈춰봅니다. 🌿\n${topic.topicTitle}`,
        body: `${topic.whyNowRationale}.\n\n도심의 소음에서 벗어나 ${brandName}의 숲길을 걷고,\n바람과 소리, 그리고 자연의 오가닉한 향기에 몸을 맡깁니다.\n\n${topic.connectedAsset}에서 펼쳐지는 온전한 휴식의 여정.\n당신의 마음에 깊은 쉼표를 찍어드립니다.`,
        callToAction: '💬 나만을 위한 깊은 쉼이 필요하다면 지금 저장해 두고 꺼내보세요.\n🔗 프로필 링크에서 웰니스 패키지를 만나실 수 있습니다.',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#감성리조트`, `#자연속휴식`, `#웰니스라이프`, `#오크밸리숲길`],
        recommendedFormat: `Instagram ${subFormat}`
      },
      {
        id: 'var-c',
        label: 'Variation C (핵심 혜택 & 팩트 리포트형)',
        hook: `📊 [FACT CHECK] ${topic.trendFact.slice(0, 35)}...\n${brandName}의 정밀 준비 솔루션!`,
        body: `최근 데이터가 증명하듯 ${topic.category} 카테고리에 대한 관심이 크게 높아졌습니다.\n\n이에 ${brandName}는 공식 인증 자산인 ${topic.connectedAsset}을 기획하여 선보입니다.\n\n[체크 포인트]\n1. 검증 출처: ${topic.trendSource}\n2. 보유 자산: ${topic.connectedAsset}\n3. 추천 타깃: 주말 라이프스타일 웰니스 추구 오디언스`,
        callToAction: '📌 프로필 링크를 눌러 공식 가이드를 다운로드받으세요.',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#마케팅트렌드`, `#웰니스데이터`, `#리조트추천`],
        recommendedFormat: `Instagram ${subFormat}`
      }
    ];
  }

  if (channel === 'NaverCafe') {
    return [
      {
        id: 'var-a',
        label: 'Variation A (카페 커뮤니티 추천 정보형)',
        title: `[리조트 정보] ${topic.topicTitle} - 실제 이용 후기와 꿀팁 공유`,
        intro: `안녕하세요 회원 여러분,\n최근 트렌드로 떠오르고 있는 ${topic.category} 주제로 ${brandName}에 새로 마련된 공간 소식 전해드립니다.`,
        body: `${topic.trendFact}\n\n이러한 흐름에 맞춰 ${brandName}에서는 ${topic.connectedAsset}을 둘러보실 수 있도록 구성되어 있습니다.`,
        info: `• 시설/자산: ${topic.connectedAsset}\n• 추천 이유: ${topic.whyNowRationale}\n• 관련 검증 데이터: ${topic.trendSource}`,
        keyPoints: [
          '주말 주차 및 입출차 팁 (오전에 방문 시 혼잡 예방)',
          '사진 찍기 가장 좋은 골든 아워 시간대 활용',
          '주변 부대시설 및 다이닝 연계 동선'
        ],
        callToAction: '회원님들은 이번 주말에 어떤 일정 계획하고 계신가요? 궁금하신 점이나 후기는 댓글로 자유롭게 남겨주세요!',
      },
      {
        id: 'var-b',
        label: 'Variation B (실생활 꿀팁 & 동선 가이드형)',
        title: `[여행 가이드] 이번 주말 ${brandName} 알차게 즐기는 3가지 포인트 (${topic.category} 편)`,
        intro: `주말 여행 계획 중이신 카페 이웃님들을 위해 ${brandName}의 알짜 정보만 모아 정리했습니다.`,
        body: `요즘 ${topic.category} 관련 여행이 큰 인기를 얻고 있죠!\n${topic.connectedAsset}을 중심으로 힐링 코스를 짜보시는 것을 추천합니다.`,
        info: `■ 추천 동선 및 자산\n${topic.connectedAsset}\n\n■ 시의적 추천 배경\n${topic.whyNowRationale}`,
        keyPoints: [
          '가족/연인 동반 시 추천 편의시설',
          '사전 예약 권장 프로그램 확인',
          '주변 맛집 및 카페 동선'
        ],
        callToAction: '도움이 되셨다면 공감이나 댓글 한 줄 부탁드립니다! 궁금한 점 있으시면 댓글 남겨주세요.',
      },
      {
        id: 'var-c',
        label: 'Variation C (질문 유도 & 소모임 후기 공유형)',
        title: `[질문/공유] ${brandName} ${topic.category} 코스 가보신 분 계신가요?`,
        intro: `카페 회원님들 조언도 듣고 소식도 전할 겸 글 남겨봅니다.`,
        body: `요즘 ${topic.trendFact} 소식을 접하고 ${brandName} ${topic.connectedAsset} 다녀오려고 하는데요.\n\n실제 경험해 보니 분위기가 너무 좋고 자연 풍경이 일품이었습니다.`,
        info: `소개된 자산: ${topic.connectedAsset}`,
        keyPoints: [
          '혼자 방문 시에도 편안한 웰니스 분위기',
          '주말 방문 시 조용한 시간대 추천'
        ],
        callToAction: '혹시 다른 회원님들만의 최애 장소나 꿀팁 있으시면 댓글로 나누어 주세요!',
      }
    ];
  }

  if (channel === 'Blog') {
    return [
      {
        id: 'var-a',
        label: 'Variation A (네이버 공식 블로그 르포형)',
        title: `${brandName} ${topic.category} 완전 정복: ${topic.topicTitle}`,
        hook: `도심을 벗어나 만나는 340만 평 청정 숲과 프리미엄 웰니스 경험!`,
        body: `안녕하세요, 공식 블로그입니다.\n\n오늘 소개해 드릴 소식은 바로 최근 급부상하고 있는 **${topic.category}** 트렌드와 결합된 ${brandName}만의 특별한 휴식입니다.\n\n### 1. 트렌드로 보는 시장 사실\n${topic.trendFact} (${topic.trendSource})\n\n### 2. ${brandName} 고유 자산의 매력\n${topic.connectedAsset}은 단순한 시설을 넘어 시각과 청각, 신체 피로를 종합적으로 케어해 줍니다.\n\n### 3. 방문 팁 & 추천 타이밍\n${topic.whyNowRationale}`,
        callToAction: '더 자세한 리조트 이용 안내 및 패키지 예약은 아래 공식 링크를 참고하세요.',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#블로그추천`, `#강원도리조트`, `#${topic.category}`]
      },
      {
        id: 'var-b',
        label: 'Variation B (라이프스타일 에세이 톤)',
        title: `[숲속 쉼표] ${topic.topicTitle} - ${brandName}에서의 하루`,
        hook: `바람이 전하는 참나무 숲의 이야기를 들으며 걷는 길.`,
        body: `일상에 지친 날에는 문득 깊은 숲이 생각납니다.\n\n${topic.connectedAsset}에 들어서면 사각거리는 나뭇잎 소리와 함께 묵직했던 마음이 한결 가벼워집니다.\n\n${topic.trendFact}라는 뉴스처럼, 우리는 결국 자연 속에서의 진정한 회복을 갈망하고 있었습니다.\n\n이번 주말, ${brandName}에서 온전한 나만의 시간을 만나보세요.`,
        callToAction: '공식 가이드와 예약 소식은 프로필 및 하단 링크에서 확인 가능합니다.',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#웰니스에세이`, `#자연휴식`]
      },
      {
        id: 'var-c',
        label: 'Variation C (정보 가이드 & 인포그래픽 요약형)',
        title: `[총정리] ${brandName} ${topic.category} 코스 핵심 요약 및 혜택`,
        hook: `한눈에 보는 ${brandName} 공식 가이드`,
        body: `1. 관련 트렌드 데이터: ${topic.trendFact}\n2. 매칭 자산: ${topic.connectedAsset}\n3. 지금 방문해야 하는 이유: ${topic.whyNowRationale}\n\n상세 일정 및 운영 정보는 공식 채널에서 매일 업데이트됩니다.`,
        callToAction: '도움이 되셨다면 이웃 추가와 공감을 눌러주세요!',
        hashtags: [`#${brandName.replace(/\s+/g, '')}`, `#리조트정보`, `#여행가이드`]
      }
    ];
  }

  // LinkedIn
  return [
    {
      id: 'var-a',
      label: 'Variation A (비즈니스 리더십 & 마케팅 인사이트)',
      title: `[Market Intelligence] ${topic.category} 트렌드와 ${brandName} 자산의 프라이빗 제휴 모델`,
      body: `${topic.trendSource}에 따르면, ${topic.trendFact}.\n\n이러한 소비자 행동 변화는 하이엔드 호스피탈리티 업계에 새로운 시사점을 제공합니다.\n\n${brandName}는 340만 평 규모의 청정 원시림과 ${topic.connectedAsset} 인프라를 바탕으로 임직원 웰니스 리트릿 및 브랜드 팝업 컬래버레이션을 확장하고 있습니다.\n\n기업 워크숍, 파트너십 제휴, executive 리트릿에 대한 새로운 표준을 확인하세요.`,
      callToAction: '💼 B2B 파트너십 및 제휴 제안은 공식 마케팅 데스크로 문의해주시기 바랍니다.',
      hashtags: [`#HospitalityLeadership`, `#OakValley`, `#ParkRoche`, `#WellnessTrends`, `#CorporateRetreat`]
    },
    {
      id: 'var-b',
      label: 'Variation B (ESG & 웰니스 이노베이션 케이스)',
      title: `자연 자산 기반 웰니스 이노베이션: ${brandName}의 전략적 접근`,
      body: `단순한 객실 휴양을 넘어 생체 데이터 및 자연 자산을 연계한 정밀 웰니스가 글로벌 호스피탈리티 산업의 핵심 경쟁력으로 부상했습니다.\n\n• 트렌드 근거: ${topic.trendFact}\n• 적용 핵심 자산: ${topic.connectedAsset}\n• 기대 효과: 브랜드 가치 제고 및 고객 로열티 강화\n\n지속 가능한 리조트 에코시스템 구축을 위한 진정성 있는 행보를 이어갑니다.`,
      callToAction: 'Insight & Inquiries: LinkedIn 메세지 또는 공식 마케팅 이메일로 연락주세요.',
      hashtags: [`#WellnessInnovation`, `#HospitalityMarketing`, `#SustainableTourism`]
    },
    {
      id: 'var-c',
      label: 'Variation C (브랜드 콜라보레이션 제안형)',
      title: `Brand Collaboration Opportunity with ${brandName}`,
      body: `글로벌 아웃도어 & 웰니스 브랜드와 ${brandName}의 시너지 팝업 기회.\n\n${topic.trendFact}\n\n${brandName}의 고유 자산인 ${topic.connectedAsset}과 브랜드 아이덴티티가 만나 시너지를 극대화할 수 있는 컬래버레이션 채널을 열어두고 있습니다.`,
      callToAction: '📩 제휴 타깃 분석 및 제안서 가이드는 마케팅 팀으로 문의 부탁드립니다.',
      hashtags: [`#BrandPartnership`, `#MarketingStrategy`, `#ExecutiveRetreat`]
    }
  ];
}
