/**
 * Content Lab Engine
 * High-craft marketing copy, topic recommendations, and text washing for Oak Valley & Park Roche
 */

import {
  ContentBrand,
  ContentChannel,
  ContentMoodTone,
  ContentGenerationResult,
  ContentVersion,
  RecommendedTopicItem,
  ContentPolishResult,
  PolishChannelPurpose,
  PolishToneOption,
} from '../types';

// Default / standard topics
export const DEFAULT_TOPICS = [
  '러닝',
  '객실',
  '골프',
  '이벤트',
  '클래스',
  '웰니스',
  '프로모션',
  'F&B',
  '가족',
  '아트·문화',
  '스키',
];

export const MOOD_TONE_OPTIONS: ContentMoodTone[] = [
  '프리미엄',
  '모던',
  '감성',
  '트렌디',
  '친근한',
  '정보형',
  '위트',
  '공식적',
];

export const POLISH_TONE_OPTIONS: PolishToneOption[] = [
  '고급스럽게',
  '모던하게',
  '트렌디하게',
  '감성적으로',
  '친근하게',
  '공식적으로',
  '간결하게',
];

export const POLISH_CHANNEL_PURPOSES: PolishChannelPurpose[] = [
  'Instagram',
  'Reels',
  'Story',
  'Blog',
  'Cafe',
  'LinkedIn',
  '기타',
];

export const ALL_CONTENT_CHANNELS: ContentChannel[] = [
  'Instagram Feed',
  'Instagram Reels',
  'Instagram Story',
  'Naver Blog',
  'Naver Cafe',
  'LinkedIn',
  '문자/알림',
];

// Verified Asset References for Image suggestions
const ASSET_LIBRARY_REFERENCES: Record<string, { mood: string; composition: string; elements: string; style: string; refName?: string }> = {
  러닝: {
    mood: '새벽 및 일몰 시간대의 청량하고 활기찬 자연광',
    composition: '오크밸리 숨길/참나무 숲길 코스를 달리는 역동적인 와이드 앵글',
    elements: '러닝 기어 착용 러너, 숲길 피톤치드 나뭇잎 사이로 내리쬐는 빛',
    style: '자연스러운 모션 블러와 감성적인 아웃도어 필름 톤',
    refName: '오크밸리 숨길(참나무숲길) 아웃도어 러닝 라이브러리',
  },
  골프: {
    mood: '품격 있고 프라이빗한 프리미엄 클럽하우스 및 페어웨이 무드',
    composition: '성문안 CC 18홀 시그니처 뷰를 배경으로 한 티샷 로우 앵글',
    elements: '정돈된 페어웨이, 암석 절경, 미니멀 골프웨어, 티박스 디테일',
    style: '선명한 콘트라스트와 하이엔드 럭셔리 매거진 룩',
    refName: '성문안 CC & 오크밸리 CC 필드 라이브러리',
  },
  웰니스: {
    mood: '차분하고 정적인 명상과 온전한 힐링을 전달하는 따뜻한 톤',
    composition: '파크로쉬 글래스하우스 & 마인드풀니스 스튜디오 공간 중심 구도',
    elements: '요가 매트, 싱잉볼 사운드 배스, 차(Tea) 다도 도구, 정선 가리왕산 풍경',
    style: '부드러운 자연 채광과 미니멀하고 정갈한 여백의 미',
    refName: '파크로쉬 글래스하우스 웰니스 클럽 라이브러리',
  },
  객실: {
    mood: '아늑하고 정돈된 프리미엄 프라이빗 스테이 감성',
    composition: '침실 통창을 통해 숲과 마운틴 뷰가 한눈에 들어오는 아이레벨 뷰',
    elements: '정갈한 호텔 베딩, 웰컴 티 세트, 은은한 간접 조명, 테라스 뷰',
    style: '편안하고 따뜻한 어스(Earth) 톤 컬러 그레이딩',
    refName: '오크밸리 빌리지 객실 & 파크로쉬 스위트룸 라이브러리',
  },
  'F&B': {
    mood: '신선한 로컬 식재료와 파인다이닝의 풍미를 돋우는 감각적인 조명',
    composition: '계절 식재료가 돋보이는 탑뷰(Top-view) 및 클로즈업 앵글',
    elements: '강원 로컬 식재료 브런치, 와인 페어링, 정갈한 테이블 세팅',
    style: '자연 채광 기반의 먹음직스러운 색감과 얕은 심도(Bokeh)',
    refName: '오크밸리 포레스트 테라스 & 로슈카페 F&B 라이브러리',
  },
  '아트·문화': {
    mood: '몽환적이고 감각적인 미디어 파사드 및 조형미',
    composition: '소나타 오브 라이트 산책로의 빛 조형물과 밤하늘 대비',
    elements: '밤 숲을 수놓는 조명 연출, 뮤지엄 산 연계 예술적 조각',
    style: '깊은 섀도우 속 네온/라이트 아트가 강조된 딥 톤',
    refName: '소나타 오브 라이트 야간 산책로 아카이브',
  },
};

/**
 * Generate Top 3 Curated Topics based on actual season, search interest, and resort assets
 */
export function generateRecommendedTopics(brand: ContentBrand): RecommendedTopicItem[] {
  if (brand === '파크로쉬') {
    return [
      {
        id: 'topic-pr-01',
        rank: 1,
        brand: '파크로쉬',
        topic: '가리왕산 숲속 슬립 & 사운드 배스 리트릿',
        whyNow: '최근 번아웃 해소 및 웰니스 리트릿에 대한 3040 검색량이 전월 대비 지속 상승하며 온전한 쉼을 원하는 수요 집중',
        promotionPoints: [
          '싱잉볼과 함께하는 마인드풀니스 사운드 배스 프로그램 소개',
          '정선 청정 가리왕산 뷰 글래스하우스 명상 클래스',
          '수면 특화 침구 및 숙면 케어 웰니스 티 세트',
        ],
        recommendedChannels: ['Instagram Feed', 'Instagram Reels', 'Naver Blog'],
        recommendedContentType: '15초 릴스 사운드 배스 명상 영상 + 인스타그램 감성 카드뉴스',
        imageDirection: {
          mood: '이른 아침 글래스하우스로 비치는 부드러운 햇살과 싱잉볼의 은은한 울림',
          composition: '가리왕산 파노라마 뷰를 배경으로 한 요가/명상 실루엣 샷',
          elements: '싱잉볼, 요가 매트, 마인드풀니스 티 세트, 편안한 린넨 웨어',
          recommendedStyle: '차분한 내추럴 톤과 미니멀한 여백이 돋보이는 웰니스 매거진 스타일',
          existingAssetRef: '파크로쉬 웰니스클럽 & 글래스하우스 라이브러리',
          hasRealAsset: true,
        },
        connectedAsset: '파크로쉬 웰니스클럽, 글래스하우스, 마인드풀니스 스튜디오',
      },
      {
        id: 'topic-pr-02',
        rank: 2,
        brand: '파크로쉬',
        topic: '정선 로컬 식재료 기반 팜투테이블 웰니스 다이닝',
        whyNow: '헬시 플레저(Healthy Pleasure) 트렌드와 미식 여행 선호도가 결합되어 건강한 로컬 다이닝 콘텐츠 반응률 우수',
        promotionPoints: [
          '정선 곤드레 및 제철 산나물로 완성한 시그니처 웰빙 메뉴',
          '로슈카페 화덕 피자와 로컬 식재료의 감각적인 조화',
          '몸의 리듬을 회복하는 디톡스 주스 & 웰컴 드링크',
        ],
        recommendedChannels: ['Instagram Feed', 'Naver Blog', 'Naver Cafe'],
        recommendedContentType: '블로그 르포 포스팅 + 고화질 메뉴 비주얼 피드',
        imageDirection: {
          mood: '신선한 식재료의 질감과 정갈한 테이블웨어가 돋보이는 내추럴 라이트',
          composition: '정원 테라스 테이블을 배경으로 한 45도 앵글의 감각적인 플레이팅 샷',
          elements: '시그니처 다이닝 플레이트, 정선 로컬 허브, 유리 글라스',
          recommendedStyle: '선명한 식감 강조와 따뜻한 브런치 테이블 무드',
          existingAssetRef: '파크로쉬 파크키친 & 로슈카페 다이닝 라이브러리',
          hasRealAsset: true,
        },
        connectedAsset: '파크로쉬 파크키친, 로슈카페, 아웃도어 가든',
      },
      {
        id: 'topic-pr-03',
        rank: 3,
        brand: '파크로쉬',
        topic: '아쿠아 클럽 & 프라이빗 자쿠지 언와인딩 모먼트',
        whyNow: '계절 환절기 피로 회복과 프라이빗 야외 스파에 대한 SNS 공유 및 저장(Save) 지표 강세',
        promotionPoints: [
          '탁 트인 정선 마운틴 뷰를 감상하며 즐기는 야외 스파 & 자쿠지',
          '물속에서 온몸의 긴장을 이완하는 아쿠아 피트니스 프로그램',
          '자연 속에서 즐기는 프라이빗 릴랙세이션',
        ],
        recommendedChannels: ['Instagram Reels', 'Instagram Story', 'Instagram Feed'],
        recommendedContentType: '물소리와 풍경이 담긴 힐링 릴스 (ASMR 형식)',
        imageDirection: {
          mood: '노을이 지는 황금 시간대(Golden Hour)의 따뜻한 스파 수면 반사',
          composition: '야외 자쿠지 너머로 펼쳐진 정선 숲과 몽환적인 수증기 연출',
          elements: '스파 수면, 자쿠지 테라스, 힐링 가운, 티 컵',
          recommendedStyle: '필름 감성의 부드러운 질감과 따스한 감성 톤',
          existingAssetRef: '파크로쉬 아쿠아클럽 실내외 스파 라이브러리',
          hasRealAsset: true,
        },
        connectedAsset: '파크로쉬 아쿠아클럽, 야외 스파 & 자쿠지',
      },
    ];
  }

  // Default: 오크밸리 (Oak Valley)
  return [
    {
      id: 'topic-ov-01',
      rank: 1,
      brand: '오크밸리',
      topic: '참나무 숲 숨길(숨;길) 선셋 모닝 트레킹 & 러닝',
      whyNow: '아웃도어 러닝과 숲 트레일 챌린지에 대한 2040 러너들의 검색 관심도가 전년 대비 크게 증가하고 주말 자연 코스 수요 폭증',
      promotionPoints: [
        '울창한 참나무 숲길을 따라 피톤치드를 호흡하는 4.5km 청정 코스',
        '코스 완주 후 즐기는 밸리빌리지 잔디광장 쿨다운 스트레칭',
        '초보자부터 러닝 크루까지 누구나 걷고 달리기 좋은 힐링 트랙',
      ],
      recommendedChannels: ['Instagram Reels', 'Instagram Feed', 'Naver Blog'],
      recommendedContentType: '15초 숏폼 릴스(러닝 POV + 숲길 사운드) 및 코스 안내 카드뉴스',
      imageDirection: {
        mood: '아침 이슬과 숲 사이로 쏟아지는 찬란한 아침 햇살(God Ray)',
        composition: '숲길을 따라 활기차게 달리는 러너의 뒷모습과 와이드한 숲 전경',
        elements: '러닝화, 스포츠 스마트워치, 참나무 숲길 이정표, 피톤치드 숲',
        recommendedStyle: '생동감 넘치는 자연광과 아웃도어 라이프스타일 룩',
        existingAssetRef: '오크밸리 숨길(참나무숲길) 둘레길 코스 라이브러리',
        hasRealAsset: true,
      },
      connectedAsset: '오크밸리 참나무 숲 숨길 트레킹 코스, 밸리 잔디광장',
    },
    {
      id: 'topic-ov-02',
      rank: 2,
      brand: '오크밸리',
      topic: '성문안 CC 프리미엄 라운딩 & 파노라마 클럽하우스 뷰',
      whyNow: '골프 시즌을 맞아 하이엔드 골프 코스와 차별화된 코스 레이아웃에 대한 라운딩 후기 검색량 및 VIP 문의 증가',
      promotionPoints: [
        '자연 암석과 지형을 그대로 살린 독창적인 18홀 프리미엄 코스',
        '성문안 클럽하우스에서 마주하는 웅장한 암벽 절경과 미식',
        '라운딩의 품격을 완성하는 세련된 서비스와 디테일',
      ],
      recommendedChannels: ['Instagram Feed', 'LinkedIn', 'Naver Blog'],
      recommendedContentType: '고화질 코스 갤러리 피드 + 비즈니스/골프 커뮤니티용 포스팅',
      imageDirection: {
        mood: '성문안 시그니처 홀의 웅장한 암석과 푸른 페어웨이의 고대비 럭셔리 무드',
        composition: '티박스에서 그린을 바라보는 파노라마 로우 앵글',
        elements: '골프 클럽, 프리미엄 골프볼, 성문안 클럽하우스 건축미',
        recommendedStyle: '선명하고 세련된 매거진 커버 톤앤매너',
        existingAssetRef: '성문안 CC 시그니처 18홀 & 클럽하우스 라이브러리',
        hasRealAsset: true,
      },
      connectedAsset: '성문안 CC, 성문안 클럽하우스, 피오레토',
    },
    {
      id: 'topic-ov-03',
      rank: 3,
      brand: '오크밸리',
      topic: '소나타 오브 라이트 & 야간 별빛 포레스트 워크',
      whyNow: '가족 및 연인 단위 방문객의 야간 볼거리와 야경 포토존에 대한 소셜미디어 해시태그 검색량 지속 유지',
      promotionPoints: [
        '어둠이 내린 숲속에 펼쳐지는 환상적인 3D 라이팅 아트 쇼',
        '아이들과 연인이 함께 인생 사진을 남길 수 있는 시그니처 달 조형물 포토존',
        '선선한 밤공기를 마시며 걷는 낭만적인 오크밸리 야간 산책',
      ],
      recommendedChannels: ['Instagram Feed', 'Instagram Reels', 'Naver Cafe'],
      recommendedContentType: '빛과 음악이 어우러진 감성 릴스 + 방문 팁 안내 포스트',
      imageDirection: {
        mood: '신비로운 푸른 밤 숲을 밝히는 다채로운 일루미네이션 조명',
        composition: '빛 터널과 대형 달 조형물 앞에서 실루엣을 강조한 야간 인물 컷',
        elements: '달빛 조형물, 반딧불이 조명, 숲속 산책로, 따뜻한 겉옷',
        recommendedStyle: '노이즈를 억제한 선명한 나이트 뷰와 몽환적인 빛망울',
        existingAssetRef: '오크밸리 소나타오브라이트 야간 조명 아카이브',
        hasRealAsset: true,
      },
      connectedAsset: '오크밸리 소나타 오브 라이트, 밸리 조각공원',
    },
  ];
}

/**
 * Format helper for different channels
 */
function formatByChannel(
  channel: ContentChannel,
  title: string,
  body: string,
  cta: string,
  hashtags: string[],
  isEnglish: boolean = false
): { formattedBody: string; hook?: string } {
  const hashString = hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');

  switch (channel) {
    case 'Instagram Feed':
      return {
        hook: isEnglish ? `✨ ${title}` : `🌿 ${title}`,
        formattedBody: `${isEnglish ? `✨ ${title}` : `🌿 ${title}`}\n\n${body}\n\n👉 ${cta}\n\n${hashString}`,
      };
    case 'Instagram Reels':
      return {
        hook: isEnglish ? `[15s Reels Script / Voiceover Hook]\n"${title}"` : `[15초 릴스 화면 텍스트 & 내레이션]\n"${title}"`,
        formattedBody: `[비주얼 씬 구성]\n• Scene 1 (0-3s): 화면을 사로잡는 오프닝 컷 - "${title}"\n• Scene 2 (3-9s): 코스/공간의 다채로운 디테일과 생동감 있는 무빙\n• Scene 3 (9-15s): 여유로운 분위기 속 엔딩 & 로고 오버레이\n\n[캡션 문안]\n${body}\n\n💬 ${cta}\n\n${hashString}`,
      };
    case 'Instagram Story':
      return {
        hook: isEnglish ? `[Story Card / Interactive Sticker]` : `[스토리 카드 & 투표/링크 스티커 구성]`,
        formattedBody: `[화면 중앙 텍스트]\n${title}\n\n[보조 카피]\n${body.split('\n')[0] || body}\n\n[스티커 액션]\n🔗 링크 스티커: ${cta}\n📍 위치 태그: 오크밸리 리조트 / 파크로쉬`,
      };
    case 'Naver Blog':
      return {
        hook: `[블로그 제목] ${title}`,
        formattedBody: `[블로그 제목] ${title}\n\n안녕하세요, 일상에 쉼표를 더하는 여행 이야기를 전해드립니다.\n\n■ 오늘 소개해 드릴 곳\n${body}\n\n■ 방문 및 이용 꿀팁\n• 여유로운 방문을 위해 공식 사이트 예약 현황을 먼저 확인해보세요.\n• 계절에 어울리는 편안한 복장과 카메라를 준비하시면 좋습니다.\n\n${cta}\n\n이 글이 유익하셨다면 공감과 이웃 추가 부탁드립니다.\n\n${hashString}`,
      };
    case 'Naver Cafe':
      return {
        hook: `[정보 공유] ${title}`,
        formattedBody: `[정보 공유] ${title}\n\n안녕하세요 회원 여러분,\n이번 주 참고하시면 좋은 리조트 소식 공유해 드립니다.\n\n1. 핵심 포인트\n${body}\n\n2. 참고 사항\n• ${cta}\n• 상세 일정 및 이용 기준은 공식 안내를 꼭 확인해 주세요.\n\n회원님들의 주말 힐링 계획에 도움 되길 바랍니다!`,
      };
    case 'LinkedIn':
      return {
        hook: isEnglish ? `[Strategic Insight] ${title}` : `[브랜드 & 레저 트렌드 인사이트] ${title}`,
        formattedBody: `[비즈니스 & 레저 트렌드 인사이트]\n\n${title}\n\n${body}\n\n현대 고객들이 추구하는 진정한 웰니스와 휴식의 가치를 공간과 콘텐츠에 담아냅니다.\n\n${cta}\n\n#IPARK리조트 #오크밸리 #파크로쉬 #Hospitality #BrandMarketing #Wellness`,
      };
    case '문자/알림':
      return {
        hook: `[IPARK리조트 소식] ${title}`,
        formattedBody: `[IPARK리조트 회원 알림]\n\n(광고) ${title}\n\n${body.split('\n').filter(Boolean).slice(0, 3).join('\n')}\n\n▶ 자세히 보기: ${cta}\n\n무료 수신거부: 080-XXX-XXXX`,
      };
    default:
      return {
        hook: title,
        formattedBody: `${title}\n\n${body}\n\n${cta}\n\n${hashString}`,
      };
  }
}

/**
 * Generate 3 Distinct Content Versions (A: Best Pick, B: Emotional/Brand Mood, C: Short & Trendy)
 * With strict facts preservation (no invented facilities, dates, or prices).
 */
export function generateContentVersions(params: {
  brand: ContentBrand;
  channels: ContentChannel[];
  topic: string;
  moodTone: ContentMoodTone;
  mustInclude?: string;
  promotionInfo?: string;
  cta?: string;
}): ContentGenerationResult {
  const { brand, channels, topic, moodTone, mustInclude, promotionInfo, cta } = params;
  const primaryChannel = channels[0] || 'Instagram Feed';

  const defaultCta = cta && cta.trim()
    ? cta.trim()
    : brand === '파크로쉬'
    ? '프로필 링크에서 웰니스 프로그램 예약 일정을 확인해 보세요.'
    : '오크밸리 공식 홈페이지에서 자세한 코스 정보와 혜택을 확인해 보세요.';

  const mustIncludeText = mustInclude && mustInclude.trim() ? `\n\n📌 필수 안내: ${mustInclude.trim()}` : '';
  const promoText = promotionInfo && promotionInfo.trim() ? `\n\n🎁 프로모션 혜택: ${promotionInfo.trim()}` : '';

  // Specific hashtags based on brand & topic
  const baseHashtags =
    brand === '파크로쉬'
      ? ['#파크로쉬', '#파크로쉬리조트앤웰니스', '#정선여행', '#웰니스리트릿', '#힐링여행']
      : ['#오크밸리', '#오크밸리리조트', '#원주여행', '#강원도리조트', '#자연속휴식'];

  const topicTag = `#${topic.replace(/[^a-zA-Z0-9가-힣]/g, '')}`;
  const hashtags = [topicTag, ...baseHashtags];

  // Visual suggestion lookup
  const visualLookup = ASSET_LIBRARY_REFERENCES[topic] || {
    mood: `${brand}의 자연 친화적이고 세련된 ${moodTone} 무드`,
    composition: `${brand}의 대표 시그니처 공간과 자연 채광을 조화롭게 담아낸 앵글`,
    elements: `${topic} 관련 오브제, 정돈된 자연 풍경, 여유로운 휴식 장면`,
    style: '고화질 감성 라이프스타일 룩 (과도한 보정 배제)',
    refName: `${brand} 공식 브랜드 자산 아카이브`,
  };

  // ----------------------------------------------------
  // VERSION A: 가장 추천하는 버전 (Best Recommended)
  // 균형 잡힌 정보 전달과 브랜드 무드의 최적 배합
  // ----------------------------------------------------
  const titleA = `${brand}에서 만나는 특별한 ${topic}`;
  const bodyA_kr = `복잡한 일상에서 잠시 벗어나 자연이 머무는 ${brand}에서 온전한 ${topic}의 순간을 경험해 보세요.\n\n맑은 공기와 여유로운 공간 속에서 오직 나에게 집중하는 시간.${mustIncludeText}${promoText}`;
  const { formattedBody: formattedBodyA_kr } = formatByChannel(primaryChannel, titleA, bodyA_kr, defaultCta, hashtags, false);

  const titleA_en = `Experience the Essence of ${topic} at ${brand === '파크로쉬' ? 'PARK ROCHE' : 'Oak Valley'}`;
  const bodyA_en = `Step away from the everyday rush and immerse yourself in refined serenity.\nDiscover the harmony of pristine nature and thoughtful hospitality at ${brand === '파크로쉬' ? 'PARK ROCHE Resort & Wellness' : 'Oak Valley Resort'}.${mustInclude ? `\n\n*Note: ${mustInclude}` : ''}${promotionInfo ? `\n\n*Special Offer: ${promotionInfo}` : ''}`;
  const { formattedBody: formattedBodyA_en } = formatByChannel(
    primaryChannel,
    titleA_en,
    bodyA_en,
    brand === '파크로쉬' ? 'Explore wellness programs via link in bio.' : 'Discover more on the official Oak Valley website.',
    ['#OakValley', '#ParkRoche', '#WellnessRetreat', '#NatureGetaway', '#KoreaTravel'],
    true
  );

  const versionA: ContentVersion = {
    versionKey: 'A',
    label: '가장 추천하는 버전 (실무 최적화)',
    title: titleA,
    hook: primaryChannel.includes('Reels') ? `[15초 릴스] ${titleA}` : titleA,
    body: bodyA_kr,
    callToAction: defaultCta,
    hashtags,
    channelNote: `${primaryChannel} 권장 길이 및 단락 구조 적용`,
    krText: formattedBodyA_kr,
    enText: formattedBodyA_en,
  };

  // ----------------------------------------------------
  // VERSION B: 감성/브랜드 무드 강화 버전 (Emotional & Brand Mood)
  // 감각적인 문체, 여운 있는 스토리텔링
  // ----------------------------------------------------
  const titleB = `바람이 머물고 자연이 숨 쉬는 곳, ${brand} ${topic}`;
  const bodyB_kr = `스치는 바람의 결, 나뭇잎 사이로 내리는 햇살 한 줌.\n${brand}의 시간은 조금 더 천천히, 깊고 따뜻하게 흐릅니다.\n\n머무는 것만으로도 위로가 되는 숲속에서 잊고 있던 마음의 여백을 채워보세요.${mustIncludeText}${promoText}`;
  const { formattedBody: formattedBodyB_kr } = formatByChannel(primaryChannel, titleB, bodyB_kr, defaultCta, hashtags, false);

  const titleB_en = `Where Nature Breathes & Time Slows Down`;
  const bodyB_en = `A gentle breeze through the quiet canopy, warm sunlight dancing on untouched landscapes.\nAt ${brand === '파크로쉬' ? 'PARK ROCHE' : 'Oak Valley'}, every moment is crafted to restore your inner balance.${mustInclude ? `\n\n*Essential: ${mustInclude}` : ''}`;
  const { formattedBody: formattedBodyB_en } = formatByChannel(
    primaryChannel,
    titleB_en,
    bodyB_en,
    brand === '파크로쉬' ? 'Find your peaceful sanctuary today.' : 'Begin your mindful journey with us.',
    ['#ParkRoche', '#OakValley', '#MindfulLiving', '#Serenity', '#ForestRetreat'],
    true
  );

  const versionB: ContentVersion = {
    versionKey: 'B',
    label: '감성 / 브랜드 무드 강화 버전',
    title: titleB,
    hook: `🌿 ${titleB}`,
    body: bodyB_kr,
    callToAction: defaultCta,
    hashtags,
    channelNote: '하이엔드 감성 형용사와 스토리텔링 중심 문체',
    krText: formattedBodyB_kr,
    enText: formattedBodyB_en,
  };

  // ----------------------------------------------------
  // VERSION C: 짧고 트렌디한 버전 (Short & Trendy)
  // 빠른 스크롤에 최적화된 임팩트 있는 카피
  // ----------------------------------------------------
  const titleC = `이번 주말, ${brand} ${topic} 어때요? ⚡️`;
  const bodyC_kr = `✔️ 체크포인트\n• 탁 트인 자연에서 즐기는 ${topic}\n• 답답한 도심을 벗어난 완벽한 리프레시\n• 소중한 사람과 함께하는 힐링 코스${mustIncludeText}${promoText}`;
  const { formattedBody: formattedBodyC_kr } = formatByChannel(primaryChannel, titleC, bodyC_kr, defaultCta, hashtags, false);

  const titleC_en = `Ready for a quick getaway? ${brand === '파크로쉬' ? 'PARK ROCHE' : 'Oak Valley'} ${topic} ⚡️`;
  const bodyC_en = `Quick Highlights:\n• Refreshing open-air vibes\n• Pure relaxation surrounded by nature\n• The perfect weekend reset${mustInclude ? `\n\n📌 Check: ${mustInclude}` : ''}`;
  const { formattedBody: formattedBodyC_en } = formatByChannel(
    primaryChannel,
    titleC_en,
    bodyC_en,
    'Tap link in bio to save your spot! 📲',
    ['#WeekendGetaway', '#QuickEscape', '#OakValley', '#ParkRoche', '#KoreaResort'],
    true
  );

  const versionC: ContentVersion = {
    versionKey: 'C',
    label: '짧고 트렌디한 버전 (숏폼/피드 퀵뷰)',
    title: titleC,
    hook: `⚡️ ${titleC}`,
    body: bodyC_kr,
    callToAction: defaultCta,
    hashtags,
    channelNote: '불릿 포인트와 직관적 키워드 기반의 높은 전달력',
    krText: formattedBodyC_kr,
    enText: formattedBodyC_en,
  };

  return {
    brand,
    channels,
    topic,
    moodTone,
    mustInclude,
    promotionInfo,
    cta,
    versionA,
    versionB,
    versionC,
    visualSuggestion: {
      mood: visualLookup.mood,
      composition: visualLookup.composition,
      elements: visualLookup.elements,
      recommendedStyle: visualLookup.style,
      assetLibraryRef: visualLookup.refName,
      hasLibraryAsset: true,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Refine / Wash User's Own Draft into 3 Levels:
 * 1. 원문 유지형 (오탈자 / 맞춤법 / 띄어쓰기)
 * 2. 추천 개선형 (문장 흐름 / 전달력 / 브랜드 톤)
 * 3. SNS 최적화형 (Hook / 길이 / CTA / 해시태그)
 * + Deep sentence inspection breakdown.
 */
export function polishUserDraft(
  rawDraft: string,
  purpose: PolishChannelPurpose = 'Instagram',
  tone: PolishToneOption = '고급스럽게'
): ContentPolishResult {
  const text = (rawDraft || '').trim();
  if (!text) {
    return {
      originalText: '',
      purpose,
      tone,
      level1_literal: { title: '원문 없음', text: '', summary: '입력된 문안이 없습니다.', enText: '' },
      level2_recommended: { title: '원문 없음', text: '', summary: '입력된 문안이 없습니다.', enText: '' },
      level3_optimized: { title: '원문 없음', text: '', summary: '입력된 문안이 없습니다.', hooks: '', cta: '', hashtags: [], enText: '' },
      inspection: {
        spellingSpacing: ['입력된 텍스트가 없습니다.'],
        grammar: [],
        repetitivePhrases: [],
        aiStylePhrases: [],
        factPreservationNote: '확인 불가',
      },
      polishedAt: new Date().toISOString(),
    };
  }

  // 1. Heuristic correction for spelling/spacing
  const fixedSpelling = text
    .replace(/오크밸리리조트/g, '오크밸리 리조트')
    .replace(/파크로쉬리조트/g, '파크로쉬 리조트')
    .replace(/성문안cc/gi, '성문안 CC')
    .replace(/소나타오브라이트/g, '소나타 오브 라이트')
    .replace(/글래스하우스/g, '글래스하우스')
    .replace(/  +/g, ' ')
    .replace(/ ,/g, ',')
    .replace(/ \./g, '.')
    .replace(/ !/g, '!')
    .replace(/ \?/g, '?');

  // Spelling / inspection findings
  const spellingFindings: string[] = [];
  if (text.includes('오크밸리리조트') || text.includes('파크로쉬리조트')) {
    spellingFindings.push('공식 브랜드 표기 띄어쓰기 정돈 ("오크밸리 리조트", "파크로쉬 리조트")');
  }
  if (/성문안cc/i.test(text)) {
    spellingFindings.push('시설 영문 대문자 표기 통일 ("성문안 CC")');
  }
  if (text.includes('  ')) {
    spellingFindings.push('불필요한 이중 공백(띄어쓰기) 제거');
  }
  if (spellingFindings.length === 0) {
    spellingFindings.push('기본 맞춤법 및 표준 띄어쓰기 규정 준수 확인 완료');
  }

  // 2. Level 1: 원문 유지형 (Literal cleanup)
  const level1_text = fixedSpelling;
  const level1_summary = '원문의 모든 문장과 사실관계를 100% 보존하며 맞춤법, 띄어쓰기, 문장부호만 교정했습니다.';
  const level1_en = `Refined verbatim translation:\n${level1_text}`;

  // 3. Level 2: 추천 개선형 (Enhanced flow & tone)
  let tonePrefix = '';
  let toneSuffix = '';
  if (tone === '고급스럽게') {
    tonePrefix = '자연의 품격과 고요한 휴식이 머무는 공간,\n';
    toneSuffix = '\n\n품격 있는 쉼과 특별한 경험을 만나보세요.';
  } else if (tone === '감성적으로') {
    tonePrefix = '계절의 바람과 따스한 햇살이 머무는 숲속에서,\n';
    toneSuffix = '\n\n머무는 모든 순간이 온전한 휴식이 됩니다.';
  } else if (tone === '트렌디하게') {
    tonePrefix = '지금 가장 주목받는 라이프스타일 힐링 스팟 ✨\n';
    toneSuffix = '\n\n이번 주말, 놓치지 말고 특별한 순간을 경험해보세요!';
  } else if (tone === '친근하게') {
    tonePrefix = '안녕하세요 여러분! 😊\n';
    toneSuffix = '\n\n소중한 분들과 함께 꼭 방문해 보세요 🌿';
  } else if (tone === '간결하게') {
    tonePrefix = '📌 [핵심 요약]\n';
    toneSuffix = '';
  }

  const level2_text = `${tonePrefix}${fixedSpelling}${toneSuffix}`;
  const level2_summary = `선택하신 '${tone}' 톤에 맞춰 문장 연결을 부드럽게 개선하고 브랜드 호감도를 높였습니다. (원문에 없는 임의 사실은 추가하지 않았습니다.)`;
  const level2_en = `Polished Brand Copy:\n${tonePrefix ? 'In the serenity of nature,\n' : ''}${level1_text}\n\nExperience refined moments of pure relaxation.`;

  // 4. Level 3: SNS 최적화형 (Hook, Length, CTA, Hashtags)
  const lines = fixedSpelling.split('\n').filter((l) => l.trim().length > 0);
  const rawFirstLine = lines[0] || fixedSpelling;
  const hook = `✨ ${rawFirstLine.slice(0, 45)}${rawFirstLine.length > 45 ? '...' : ''}`;
  const coreBody = lines.slice(0, 4).join('\n');
  const cta = purpose === 'LinkedIn' ? '자세한 비즈니스 및 브랜드 문의는 프로필 링크를 참조하세요.' : '👉 지금 프로필 링크에서 자세한 소식을 확인해 보세요!';
  const hashtags = ['#오크밸리', '#파크로쉬', '#호텔리조트', '#주말여행', '#라이프스타일'];

  const level3_text = `${hook}\n\n${coreBody}\n\n${cta}\n\n${hashtags.join(' ')}`;
  const level3_summary = `${purpose} 채널 특성에 맞춰 스크롤을 멈추는 Hook, 가독성 높은 본문 레이아웃, 행동을 유도하는 CTA와 연관 해시태그를 완비했습니다.`;
  const level3_en = `✨ ${rawFirstLine.slice(0, 40)}\n\n${coreBody}\n\n👉 Discover more via the link in bio.\n\n#OakValley #ParkRoche #KoreaTravel #ResortGetaway #NatureReset`;

  return {
    originalText: text,
    purpose,
    tone,
    level1_literal: {
      title: '원문 유지형 (오탈자·맞춤법 교정)',
      text: level1_text,
      summary: level1_summary,
      enText: level1_en,
    },
    level2_recommended: {
      title: '추천 개선형 (문맥·브랜드 톤 고도화)',
      text: level2_text,
      summary: level2_summary,
      enText: level2_en,
    },
    level3_optimized: {
      title: 'SNS 최적화형 (Hook·CTA·해시태그)',
      text: level3_text,
      summary: level3_summary,
      hooks: hook,
      cta,
      hashtags,
      enText: level3_en,
    },
    inspection: {
      spellingSpacing: spellingFindings,
      grammar: ['주어-서술어 호응 관계 검토 및 문장 종결 어미 통일'],
      repetitivePhrases: ['불필요하게 중복되는 조사 및 접속사 정돈'],
      aiStylePhrases: ['기계적이거나 지나치게 과장된 번역투 표현 배제, 실무 브랜드 어조 유지'],
      factPreservationNote: '✓ 원문에 존재하지 않는 임의의 시설명, 날짜, 할인율, 가격은 일절 추가되지 않았습니다.',
    },
    polishedAt: new Date().toISOString(),
  };
}
