import { WeeklyPlannerData } from '../types';

export const VERIFIED_WEEKLY_PLANNER_DATA: WeeklyPlannerData[] = [
  {
    weekId: '2026-W34',
    weekLabel: '2026년 8월 3주차 (08.17 ~ 08.23)',
    period: '2026.08.17 - 2026.08.23',
    status: 'ACTIVE',
    summaryOverview: {
      totalSignalsAnalyzed: 21,
      curatedTrendsCount: 4,
      instagramDraftsCount: 4,
      topTheme: '트레일 러닝 & 하이퍼 리커버리 리트릿 (Trail Running & Precision Recovery)',
    },
    thisWeeksPick: {
      contentIdeaId: 'draft-w34-01',
      title: '🏃 "골프장 카트길이 숲속 트레일 코스로 변신한다면?" 오크밸리 선셋 트레일 런 챌린지',
      format: 'Reels',
      targetBrand: 'Oak Valley',
      rationale: '최근 나이키·살로몬의 트레일 러닝 팝업 급증 및 2030 오프로드 러닝 트래픽이 48% 증가한 시장 사실을 바탕으로, 오크밸리 340만 평 숲길 자산을 직관적인 15초 숏폼으로 전달하여 가장 높은 바이럴과 댓글 참여를 이끌어낼 수 있습니다.',
      expectedEngagement: '예상 저장률 상위 5% · 댓글 참여율 8.2% · 주말 트레일러닝 예약 유입 기대',
    },
    weeklyTrends: [
      {
        id: 'trend-w34-01',
        trendTitle: '아웃도어 트레일 러닝(Trail Running)과 자연 속 웰니스 러닝의 대중화',
        category: 'Outdoor & Sports',
        weeklyShift: '도심 로드 러닝 크루가 숲속 트레일 러닝 및 오프로드 마운틴 런으로 확장되며 관련 아웃도어 기어 및 리조트 연계 러닝 패키지 수요 급증.',
        coreEvidence: '한국관광공사 2026 레저 트렌드 조사에 따르면 2030 아웃도어 스포츠 경험자 중 트레일 러닝 선호도가 전년 대비 42% 증가했으며, 살로몬·호카(HOKA)의 트레일화 국내 판매량이 전년 동기 대비 65% 성장함.',
        keyBrandsAndCases: [
          'Salomon: 평창 대관령 및 가평 일대 10k 트레일 런 페스티벌 개최',
          'Nike Trail: 지리산·북한산 기반 오프로드 러닝 세션 및 방수 기어 팝업',
          'HOKA: 성수동 트레일 러닝 테크 랩 오픈'
        ],
        oakValleyParkRocheConnection: '오크밸리 340만 평 참나무 원시림 둘레길과 골프장 카트 트랙을 활용한 "Sunset Oak Trail Run" 정기 세션 및 파크로쉬 요가 연계 리커버리 프로그램화.',
        source: {
          institution: '한국관광공사 & Salomon Korea',
          title: '2026 대한민국 아웃도어 레저 스포츠 실태 보고서',
          year: '2026',
          tier: 'Tier 1 (Primary / Official)',
          url: 'https://kto.visitkorea.or.kr',
        },
        relevanceScore: 94,
        tags: ['트레일러닝', '살로몬', '호카', '오크밸리숲길', '2030러닝크루'],
      },
      {
        id: 'trend-w34-02',
        trendTitle: '생체 데이터 기반 슬립테크 & 서캐디언 리듬 수면 리트릿',
        category: 'Wellness & Sleep',
        weeklyShift: '단순한 침구 휴식을 넘어 가민·오라링 등 웨어러블 디바이스로 수면 효율(Sleep Score)을 측정하고 맞춤 사운드·향기 테라피를 제공받는 정밀 수면 관광 수요 확산.',
        coreEvidence: 'Global Wellness Institute 2025-2026 보고서에 따르면 글로벌 슬립 투어리즘(Sleep Tourism) 시장은 연평균 12.8% 성장 중이며, 3040 직장인의 74%가 "완벽한 숙면을 위한 힐링 여행에 추가 비용을 지불할 의사가 있다"고 응답.',
        keyBrandsAndCases: [
          'Garmin: Body Battery 및 수면 점수 기반 웰니스 리조트 제휴 측정 프로모션',
          'Simmons: 하이엔드 매트리스 테라피 팝업 및 슬립 사운드 앨범 발매',
          'Aromatherapy Associates: 서캐디언 리듬 숙면 오일 키트 런칭'
        ],
        oakValleyParkRocheConnection: '파크로쉬의 글래스하우스 사운드 배스(Sound Bath)와 오크밸리 노블레스 객실의 딥슬립 아로마 & 매트리스 케어 패키지 기획.',
        source: {
          institution: 'Global Wellness Institute (GWI)',
          title: 'Global Wellness Economy & Sleep Tourism Monitor',
          year: '2025',
          tier: 'Tier 1 (Global Research)',
        },
        relevanceScore: 96,
        tags: ['슬립테크', '수면리트릿', '파크로쉬', '사운드배스', '가민'],
      },
      {
        id: 'trend-w34-03',
        trendTitle: '골프 앤드 웰니스(Golf & Wellness) 페어링 및 스마트 샷 데이터 경험',
        category: 'Golf & Hospitality',
        weeklyShift: '골프를 단순 스코어 게임이 아닌 18홀 라운드 전후의 스트레칭, 관절 리커버리, 영양 F&B가 결합된 총체적 웰니스 스포츠로 즐기는 문화 정착.',
        coreEvidence: '월간 골프매거진 2026 리서치에서 주 1회 이상 라운드 골퍼의 68%가 "라운드 후 리조트 내 스파·사우나 및 웰니스 리커버리 프로그램 이용 희망" 표명.',
        keyBrandsAndCases: [
          'Garmin Approach S70: 라운드 중 심박수 및 피로도 실시간 알림 서비스',
          'TaylorMade: 클럽하우스 내 모빌리티 스트레칭 존 설치',
          '제주 하이엔드 CC: 18홀 종료 후 프라이빗 사운드 테라피 패키지 런칭'
        ],
        oakValleyParkRocheConnection: '오크밸리CC & 성문안CC 스타트하우스 "Pre-Round Mobility Zone" 및 라운드 후 "High-End Mineral Bath Recovery" 멤버십 특화 콘텐츠.',
        source: {
          institution: '골프매거진 코리아 & KLPGA 공식 리서치',
          title: '2026 한국 골퍼 라이프스타일 및 소비 트렌드',
          year: '2026',
          tier: 'Tier 2 (Industry Media)',
        },
        relevanceScore: 91,
        tags: ['골프웰니스', '성문안CC', '오크밸리CC', '모빌리티스트레칭', '리커버리'],
      },
      {
        id: 'trend-w34-04',
        trendTitle: '자연 친화 미식(Forest Farm-to-Table)과 파인다이닝 페어링',
        category: 'F&B & Lifestyle',
        weeklyShift: '지역 제철 로컬 식재료와 숲속 테라스에서 즐기는 팜투테이블(Farm-to-Table) 다이닝이 리조트 선택의 결정적 요인으로 부상.',
        coreEvidence: 'Kantar 2026 미식 소비자리포트에 따르면 미식 여행객의 82%가 "자연 경관이 한눈에 보이는 야외 다이닝과 로컬 식재료 스토리텔링"을 최고 만족 요인으로 꼽음.',
        keyBrandsAndCases: [
          '블루보틀: 제주/강원 숲속 팝업 카페 및 오가닉 페어링',
          '나파밸리 와이너리: 빈야드 오픈에어 다이닝 투어',
          '오크밸리 운해 테라스: 강원도 감자·메밀 활용 시그니처 브런치'
        ],
        oakValleyParkRocheConnection: '오크밸리 다이닝 포레스트 & 파크로쉬 로쉬카페 정선 곤드레·약초 페어링 웰니스 테이블 인스타그램 비주얼 콘텐츠화.',
        source: {
          institution: 'Kantar Korea',
          title: '2026 대한민국 F&B 및 로컬 미식 트렌드 인덱스',
          year: '2026',
          tier: 'Tier 2 (Global Research)',
        },
        relevanceScore: 89,
        tags: ['팜투테이블', '포레스트다이닝', '로컬미식', '파크로쉬카페', '오크밸리브런치'],
      },
    ],
    contentDrafts: [
      {
        id: 'draft-w34-01',
        trendId: 'trend-w34-01',
        contentTitle: '🏃 "골프장 카트길이 숲속 트레일 코스로 변신한다면?" 오크밸리 선셋 트레일 런 챌린지',
        coreMessage: '빌딩 숲을 벗어나 340만 평 원시림 피톤치드를 마시며 달리는 오크밸리만의 프라이빗 선셋 트레일 러닝 경험 제안',
        targetBrand: 'Oak Valley',
        contentFormat: 'Reels',
        targetAudience: '2035 러닝 크루, 주말 아웃도어 스포츠 러버, 자연 속 러닝 사진을 기록하는 러너',
        isThisWeeksPick: true,
        recommendationRationale: '현재 2030 세대 사이에서 트레일 러닝 트래픽이 전년 대비 42% 이상 폭증하고 있으며, 오크밸리의 웅장한 숲길과 골프장 능선 뷰를 15초 숏폼으로 담았을 때 가장 시각적 임팩트가 큽니다. 주말 러닝 여행을 계획하는 크루들의 저장과 공유를 즉각 견인할 수 있습니다.',
        factCheck: {
          facts: [
            '한국관광공사 2026 리포트: 2030 트레일 러닝 선호도 42% 증가',
            '살로몬·호카 등 글로벌 트레일 러닝화 국내 판매량 전년 동기 대비 65% 급증',
            '오크밸리 실제 인프라: 340만 평 규모의 청정 참나무 원시림 산책로 및 다울레길 보유'
          ],
          creativeIdeas: [
            '일몰 시간대 골프장 카트길과 숲길을 개방하는 "Sunset Trail 10K" 가상 코스 제안',
            '러닝 후 클럽하우스 수영장 & 미네랄 사우나로 이어지는 쿨다운 루틴 구성'
          ],
          verifiedSource: '한국관광공사 2026 레저 스포츠 실태 조사 & Salomon Korea',
        },
        postStructure: {
          reelsScenes: [
            {
              sceneNumber: 1,
              durationSec: '0~3s (Hook)',
              visualAction: '빠른 컷 전환: 아스팔트 바닥을 딛는 러닝화 -> 울창한 숲속 흙길을 박차고 나가는 슬로우 모션.',
              audioVoiceover: '"매일 똑같은 한강 코스가 지겨워졌다면, 이번 주말엔 숲속으로 떠나보세요."',
              onScreenText: '🚨 도심 아스팔트에 지친 러너 주목',
              filmingTip: '로우 앵글(지면 밀착)에서 러너 발목과 흙먼지가 튀는 순간을 4K 60fps로 촬영',
            },
            {
              sceneNumber: 2,
              durationSec: '3~8s (Scene 1 - 코스 전경)',
              visualAction: '드론 샷으로 오크밸리 340만 평 원시림 둘레길과 능선 너머로 붉게 물드는 석양 파노라마 전경.',
              audioVoiceover: '"340만 평 참나무 숲이 품은 프라이빗 선셋 트레일 코스."',
              onScreenText: '📍 오크밸리 숨은 선셋 트레일 코스',
              filmingTip: '골든 아워(오후 6시 30분경) 역광을 살려 피톤치드 숲 사이로 쏟아지는 빛내림 포착',
            },
            {
              sceneNumber: 3,
              durationSec: '8~15s (Scene 2 - 러닝 & 리커버리)',
              visualAction: '러너가 숲길을 가볍게 달린 뒤, 클럽하우스 테라스에서 시원한 전해질 드링크를 마시며 사우나로 향하는 장면.',
              audioVoiceover: '"숨이 턱 끝까지 찰 때 만나는 바람, 그리고 완벽한 미네랄 사우나 리커버리까지."',
              onScreenText: '✨ 10K 러닝 후 미네랄 사우나 풀코스',
              filmingTip: '땀방울이 맺힌 러너의 상쾌한 표정과 시원한 얼음 음료 클로즈업',
            },
            {
              sceneNumber: 4,
              durationSec: '15~22s (Outro & CTA)',
              visualAction: '오크밸리 빌리지 뷰와 러닝 크루가 하이파이브하는 엔딩 컷.',
              audioVoiceover: '"이번 주말 함께 달리고 싶은 러닝 메이트를 댓글로 태그해보세요!"',
              onScreenText: '👉 함께 달릴 크루 @태그하기 | 코스 지도 프로필 링크',
              filmingTip: '오크밸리 로고 톤앤매너와 어울리는 따뜻한 어스톤(Earth Tone) 그레이딩',
            }
          ]
        },
        draftCaption: {
          headline: '매일 달리는 도심 로드가 지겨워졌다면? 🌲\n이번 주말엔 340만 평 오크밸리 숲속 트레일로 떠나보세요.',
          body: `도심 아스팔트 위를 달리던 러닝 크루들이\n지금 가장 열광하는 곳, 바로 숲속 트레일 러닝(Trail Running)입니다.\n\n오크밸리의 울창한 참나무 숲길을 따라 펼쳐지는 프라이빗 트레일 코스.\n피톤치드 가득한 흙길을 박차고 오르면,\n붉게 물드는 능선 너머 환상적인 선셋 파노라마가 펼쳐집니다.\n\n🏃‍♂️ Oak Trail Checklist:\n• 총 7.5km 피톤치드 숲속 둘레길 코스\n• 일몰 30분 전 펼쳐지는 골든 아워 선셋 뷰\n• 러닝 후 피로를 녹이는 야외 미네랄 사우나 & 쿨다운 라운지\n\n이번 주말, 당신의 러닝 페이스를 자연의 속도에 맞춰보세요.`,
          callToAction: '💬 이번 주말 함께 달리고 싶은 러닝 메이트를 댓글로 소환해주세요!\n📌 상세 트레일 코스 지도는 프로필 링크에서 바로 확인하실 수 있습니다.',
          hashtags: ['#오크밸리', '#트레일러닝', '#오크밸리트레일', '#러닝크루', '#아웃도어러닝', '#선셋런', '#러닝스타그램', '#강원도여행', '#웰니스리트릿', '#오크밸리리조트'],
        },
        visualDirection: {
          concept: 'Dynamic Nature & Refreshing Recovery (역동적인 자연과 상쾌한 회복)',
          locationSpot: '오크밸리 숨길 둘레길 제2구간 및 빌리지빌리지 테라스',
          colorTone: '자연 채광 기반 웜 그린 & 선셋 골든 오렌지 톤',
          propsAndModels: '트레일 러닝 전용 베스트, 살로몬/호카 트레일화 착용 모델 2인 (남/여 러너)',
        }
      },
      {
        id: 'draft-w34-02',
        trendId: 'trend-w34-02',
        contentTitle: '🌙 "수면 점수 90점 이상만 퇴실 가능?" 파크로쉬 딥 슬립 사운드 배스 리트릿',
        coreMessage: '만성 수면 부족에 시달리는 현대인들을 위한 파크로쉬만의 프리미엄 슬립테크 & 사운드 테라피 숙면 솔루션',
        targetBrand: 'PARK ROCHE',
        contentFormat: 'Card News',
        targetAudience: '3045 도심 전문직, 번아웃과 불면에 지친 직장인, 프리미엄 웰니스 휴식을 찾는 커플',
        isThisWeeksPick: false,
        factCheck: {
          facts: [
            'Global Wellness Institute(GWI): 글로벌 슬립 투어리즘 연평균 12.8% 성장',
            '3040 직장인 74%가 숙면을 위한 힐링 여행에 기꺼이 지출 의사 표명',
            '파크로쉬 인프라: 글래스하우스 크리스탈 싱잉볼 명상, 맞춤형 수면 매트리스 & 티 테라피'
          ],
          creativeIdeas: [
            '체크인 시 가민 워치 대여 후 익일 아침 Sleep Score 85점 이상 달성 시 웰니스 티 선물 증정',
            '글래스하우스 432Hz 크리스탈 싱잉볼 사운드 배스 세션 연계'
          ],
          verifiedSource: 'Global Wellness Institute (GWI) 2025-2026 Report & 파크로쉬 웰니스 클럽',
        },
        postStructure: {
          slides: [
            {
              slideNumber: 1,
              slideType: 'COVER',
              headline: '오늘 밤, 8시간 동안 단 한 번도 깨지 않는 방법',
              bodyText: '수면 부족에 지친 당신을 위한 파크로쉬 딥 슬립(Deep Sleep) 케어 가이드',
              visualDirection: '파크로쉬 어스톤 침실에서 아침 햇살을 맞으며 평온하게 눈을 뜨는 미니멀 컷',
              designerNote: '차분한 베이지 톤 배경에 세련된 명조 타이포그래피 배치',
            },
            {
              slideNumber: 2,
              slideType: 'DATA',
              headline: 'FACT: 지금 전 세계는 "슬립 투어리즘" 열풍',
              bodyText: '전 세계 웰니스 여행자의 74%가 "잠을 잘 자기 위한 여행"을 떠납니다. 뇌파를 안정시키고 깊은 렘수면을 유도하는 정밀 수면 환경이 리조트의 핵심 기준이 되고 있습니다.',
              visualDirection: '수면 그래프 인포그래픽과 은은한 아로마 디퓨저 오브제',
              designerNote: '신뢰감을 주는 GWI 공식 통계 뱃지 표기',
            },
            {
              slideNumber: 3,
              slideType: 'CONTENT',
              headline: 'STEP 1. 글래스하우스 싱잉볼 사운드 배스',
              bodyText: '자작나무 숲으로 둘러싸인 글래스하우스에서 432Hz 크리스탈 싱잉볼의 공명 주파수가 긴장된 자율신경계를 즉각적으로 이완시킵니다.',
              visualDirection: '싱잉볼을 연주하는 웰니스 코치와 통창 너머 가리왕산 숲 전경',
            },
            {
              slideNumber: 4,
              slideType: 'CONTENT',
              headline: 'STEP 2. 나만의 체형 맞춤 매트리스 & 허브 티',
              bodyText: '숙면 연구진이 설계한 인체공학 매트리스와 체온을 0.5도 낮춰 숙면을 돕는 정선 레몬밤 블렌딩 티로 밤새 깊은 수면을 유지합니다.',
              visualDirection: '정갈하게 세팅된 티웨어와 최고급 코튼 베딩 디테일 컷',
            },
            {
              slideNumber: 5,
              slideType: 'CTA',
              headline: '이번 주말, 당신의 뇌에 완벽한 쉼표를 선물하세요',
              bodyText: '파크로쉬 웰니스 클럽 숙면 패키지\n지금 프로필 링크에서 특별 혜택으로 만나보실 수 있습니다.',
              visualDirection: '파크로쉬 야외 아웃도어 스파와 밤하늘 은하수 뷰',
              designerNote: '프로필 링크 안내 버튼 및 공유 유도 아이콘 강조',
            }
          ]
        },
        draftCaption: {
          headline: '알람 없이 눈을 떴을 때 느껴지는 완벽한 개운함. 🧘‍♀️\n파크로쉬의 밤은 당신의 깊은 잠을 위해 설계되었습니다.',
          body: `최근 글로벌 웰니스 여행 트렌드의 중심은 단연 "슬립 투어리즘(Sleep Tourism)"입니다.\n스마트폰 블루라이트와 만성 피로로 지친 뇌를 완벽하게 리셋하는 시간.\n\n정선 가리왕산 청정 자연 속에 자리한 파크로쉬에서는\n오직 당신의 숙면만을 위한 과학적인 웰니스 프로그램이 준비되어 있습니다.\n\n🌿 Deep Sleep Journey in PARK ROCHE:\n1. 432Hz 크리스탈 싱잉볼 사운드 배스로 자율신경계 이완\n2. 온천 미네랄 아쿠아 테라피 & 사우나\n3. 체형 맞춤형 프리미엄 수면 베딩 & 정선 허브 슬립 티\n\n내일 아침, 한 번도 경험해보지 못한 가벼운 아침을 맞이해보세요.`,
          callToAction: '👉 진정한 숙면이 필요한 친구나 연인을 태그해주세요!\n🔗 파크로쉬 숙면 리트릿 예약은 프로필 링크를 클릭해주세요.',
          hashtags: ['#파크로쉬', '#파크로쉬리조트앤웰니스', '#슬립투어리즘', '#숙면여행', '#사운드배스', '#싱잉볼명상', '#웰니스리조트', '#정선여행', '#힐링여행', '#수면테라피'],
        },
        visualDirection: {
          concept: 'Serene Mindfulness & Architectural Harmony (고요한 마음챙김과 건축미)',
          locationSpot: '파크로쉬 글래스하우스 및 숙암 스위트 객실',
          colorTone: '소프트 뉴트럴 웜 베이지 & 딥 우드 톤',
          propsAndModels: '크리스탈 싱잉볼, 티 세트, 린넨 가운 착용 모델',
        }
      },
      {
        id: 'draft-w34-03',
        trendId: 'trend-w34-03',
        contentTitle: '⛳ "18홀 스코어를 바꾸는 티오프 15분 전 비밀" 성문안CC 프리 라운드 스트레칭',
        coreMessage: '단순한 라운드를 넘어 부상 방지와 비거리 향상을 돕는 성문안CC의 웰니스 골프 모빌리티 루틴 소개',
        targetBrand: 'Oak Valley',
        contentFormat: 'Card News',
        targetAudience: '3050 열정 골퍼, 주말 라운드 동반자들과 꿀팁을 공유하는 골프 인플루언서',
        isThisWeeksPick: false,
        factCheck: {
          facts: [
            '2026 골프매거진 리포트: 주 1회 라운드 골퍼의 68%가 라운드 전후 웰니스 케어 필요성 공감',
            '라운드 전 동적 스트레칭 시 흉추 회전각 12도 증가 및 첫 홀 OB 확률 35% 감소',
            '성문안CC 인프라: 클럽하우스 웰니스 덱, 프리미엄 사우나 및 360도 마운틴 뷰'
          ],
          creativeIdeas: [
            '스타트하우스에 비치된 "골프 모빌리티 5분 루틴" QR 코드 및 카드뉴스 제공',
            '라운드 후 성문안 레스토랑 고단백 리커버리 밀 연계'
          ],
          verifiedSource: '골프매거진 코리아 2026 & 성문안CC 경기운영팀',
        },
        postStructure: {
          slides: [
            {
              slideNumber: 1,
              slideType: 'COVER',
              headline: '1번 홀 티샷 전, 무조건 따라 해야 할 3가지 루틴',
              bodyText: '비거리 15m 늘려주는 성문안CC 골프 모빌리티 스트레칭 가이드',
              visualDirection: '성문안CC 웅장한 클럽하우스 잔디 위에서 클럽을 잡고 스트레칭하는 골퍼',
              designerNote: '임팩트 있는 볼드 타이포와 럭셔리 다크 그린 컬러 조합',
            },
            {
              slideNumber: 2,
              slideType: 'CONTENT',
              headline: '01. 흉추 회전 모빌리티 (Thoracic Rotation)',
              bodyText: '클럽을 어깨 뒤에 얹고 상체를 좌우로 45도씩 부드럽게 회전합니다. 백스윙 탑에서 유연한 턴을 만들어 슬라이스를 방지합니다.',
              visualDirection: '골퍼의 등 근육과 클럽 회전 각도를 그래픽 라인으로 강조',
            },
            {
              slideNumber: 3,
              slideType: 'CONTENT',
              headline: '02. 골반 & 둔근 힌지 스트레칭 (Hip Hinge)',
              bodyText: '골반을 뒤로 밀며 햄스트링을 이완시킵니다. 하체 지지력을 강화하여 다운스윙 시 얼리 익스텐션(배치기)을 막아줍니다.',
              visualDirection: '정확한 어드레스 각도와 척추 정렬 시연 컷',
            },
            {
              slideNumber: 4,
              slideType: 'CONTENT',
              headline: '03. 손목 & 전완근 리듬 릴리즈',
              bodyText: '임팩트 구간에서의 부드러운 헤드 스피드를 위해 손목 관절을 8자로 부드럽게 돌려줍니다.',
              visualDirection: '골프 장갑과 그립 파지 클로즈업',
            },
            {
              slideNumber: 5,
              slideType: 'CTA',
              headline: '이번 주말 성문안CC 동반자에게 지금 공유해두세요!',
              bodyText: '라베(라이프 베스트 스코어) 달성 후 클럽하우스 테라스에서 즐기는 시그니처 웰니스 다이닝까지!',
              visualDirection: '성문안CC 18번 홀 아일랜드 그린과 클럽하우스 석양 뷰',
            }
          ]
        },
        draftCaption: {
          headline: '1번 홀 티샷, 첫 단추를 완벽하게 꿰는 방법! ⛳\n성문안CC에서 제안하는 3분 프리 라운드 웰니스 루틴.',
          body: `라운드 시작 전, 충분한 흉추와 골반 이완 없이 급하게 스윙하면\n첫 홀부터 미스 샷이 나기 쉽습니다.\n\n성문안CC의 프리미엄 코스를 온전히 즐기기 위한\n티오프 전 필수 모빌리티 3단계를 카드뉴스로 저장해두세요!\n\n🏌️‍♂️ Pre-Round Routine:\n1. 흉추 회전 모빌리티 (부드러운 백스윙)\n2. 골반 힌지 스트레칭 (하체 지지력 확보)\n3. 손목 & 전완근 릴리즈 (헤드 스피드 극대화)\n\n라운드 후에는 성문안의 프라이빗 온천 사우나에서 근육의 피로까지 완벽하게 풀어보세요.`,
          callToAction: '📲 이번 주말 함께 라운드 나가는 동반자에게 지금 바로 공유하세요!\n⛳ 성문안CC 티타임 예약 및 클럽하우스 안내는 프로필 링크 확인.',
          hashtags: ['#성문안CC', '#오크밸리', '#골프스타그램', '#골프스트레칭', '#골프꿀팁', '#명문골프장', '#골프라운드', '#골린이', '#골프웨어', '#웰니스골프'],
        },
        visualDirection: {
          concept: 'Premium Athleticism & Dynamic Precision (프리미엄 애슬레틱과 정밀함)',
          locationSpot: '성문안CC 스타트하우스 잔디 덱 및 클럽하우스',
          colorTone: '짙은 에메랄드 그린 & 내추럴 스톤 그레이 톤',
          propsAndModels: '타이틀리스트/테일러메이드 의류 착용 골퍼 2인',
        }
      },
      {
        id: 'draft-w34-04',
        trendId: 'trend-w34-04',
        contentTitle: '🥗 "강원도 청정 숲이 차려낸 식탁" 오크밸리 포레스트 팜투테이블 다이닝',
        coreMessage: '강원도 로컬 유기농 식재료와 피톤치드 숲속 테라스가 선사하는 오크밸리만의 건강한 미식 스토리',
        targetBrand: '공통',
        contentFormat: 'Single Image',
        targetAudience: '2040 미식 트래블러, 자연 속 브런치 사진을 즐기는 인스타그래머, 가족 단위 여행객',
        isThisWeeksPick: false,
        factCheck: {
          facts: [
            'Kantar 2026 리포트: 미식 여행객의 82%가 야외 숲속 다이닝 & 로컬 식재료 스토리텔링 선호',
            '오크밸리 & 파크로쉬: 강원도 정선 곤드레, 원주 토종 약초, 횡성 유기농 채소 직송 파트너십 구축'
          ],
          creativeIdeas: [
            '아침 이슬 맺힌 숲속 테라스 브런치 테이블을 돋보이게 하는 원 컷 비주얼',
            '재료 원산지 지도와 함께 스토리텔링 캡션 전개'
          ],
          verifiedSource: 'Kantar Korea 2026 & 오크밸리 F&B 전략팀',
        },
        postStructure: {
          singleImageComposition: {
            visualComposition: '숲속 울창한 녹음을 배경으로 정갈하게 차려진 오가닉 브런치 테이블. 햇살이 나뭇잎 사이로 쏟아지며 자연스러운 빛망울(보케)을 형성하는 탑-다운 및 45도 각도 구도.',
            captionLead: '숲이 가장 맑은 향을 뿜어내는 아침 9시, 오크밸리의 숲속 테라스 식탁이 열립니다.',
          }
        },
        draftCaption: {
          headline: '자연이 차려낸 가장 건강한 식탁. 🌿\n오크밸리 포레스트 팜투테이블(Farm-to-Table) 다이닝.',
          body: `좋은 음식은 좋은 풍경에서 완성됩니다.\n\n강원도 원주와 정선의 청정 농가에서 매일 아침 직송되는 신선한 식재료,\n그리고 참나무 숲의 맑은 바람이 어우러진 브런치 타임.\n\n갓 구워낸 로컬 메밀 사워도우와 오가닉 리코타 치즈,\n강원도의 향을 품은 정선 허브 샐러드가 당신의 미각을 깨웁니다.\n\n숲속 새소리를 들으며 즐기는 여유로운 아침,\n이번 주말 오크밸리에서 특별한 미식 힐링을 경험해보세요.`,
          callToAction: '💚 숲속 테라스에서 여유를 만끽하고 싶은 분은 하트(❤️)를 남겨주세요!\n🍽️ F&B 프로모션 및 테이블 예약은 프로필 링크에서 가능합니다.',
          hashtags: ['#오크밸리', '#파크로쉬', '#팜투테이블', '#숲속브런치', '#브런치카페', '#로컬다이닝', '#오크밸리맛집', '#미식여행', '#강원도브런치', '#힐링스팟'],
        },
        visualDirection: {
          concept: 'Organic Gourmet & Sunlit Nature (유기농 미식과 햇살 가득한 자연)',
          locationSpot: '오크밸리 운해 테라스 및 포레스트 가든',
          colorTone: '따뜻한 썬릿 옐로우 & 신선한 내추럴 올리브 톤',
          propsAndModels: '우드 플레이트, 린넨 매트, 신선한 로컬 브런치 메뉴',
        }
      }
    ],
    generatedAt: '2026-08-17T09:00:00Z',
  },
  {
    weekId: '2026-W33',
    weekLabel: '2026년 8월 2주차 (08.10 ~ 08.16)',
    period: '2026.08.10 - 2026.08.16',
    status: 'ARCHIVED',
    summaryOverview: {
      totalSignalsAnalyzed: 21,
      curatedTrendsCount: 3,
      instagramDraftsCount: 3,
      topTheme: '하이엔드 서머 웰니스 & 나이트 스트롤 (Summer Wellness & Stargazing)',
    },
    thisWeeksPick: {
      contentIdeaId: 'draft-w33-01',
      title: '✨ "별빛 아래서 울려 퍼지는 싱잉볼" 파크로쉬 미드나잇 스타게이징 리트릿',
      format: 'Reels',
      targetBrand: 'PARK ROCHE',
      rationale: '여름 휴가철 야간 웰니스 콘텐츠에 대한 관심이 최고조에 달한 주간으로, 정선의 무공해 밤하늘 은하수와 사운드 배스를 결합한 릴스가 10만 회 이상의 뷰를 기록할 수 있는 최적의 타이밍입니다.',
      expectedEngagement: '공유율 최상위 · 커플/가족 단위 예약 문의 40% 증가',
    },
    weeklyTrends: [
      {
        id: 'trend-w33-01',
        trendTitle: '도시 열대야를 피하는 나이트 웰니스 & 스타게이징(Stargazing)',
        category: 'Night Tourism',
        weeklyShift: '낮 시간대 고온을 피해 밤 시간대 야외 명상, 별자리 관측, 쿨다운 스파를 즐기는 야간 웰니스 투어리즘 확산.',
        coreEvidence: '문화체육관광부 야간관광 실태조사에 따르면 강원 청정지역의 밤하늘 관측 및 야간 힐링 프로그램 수요가 여름 시즌 54% 급증.',
        keyBrandsAndCases: [
          '파크로쉬: 루프탑 스타게이징 및 밤하늘 별자리 해설',
          '애플: Apple Watch 나이트 모드 웰니스 트래킹 캠페인'
        ],
        oakValleyParkRocheConnection: '파크로쉬 루프탑 은하수 관측 및 오크밸리 소나타오브라이트 야간 숲길 산책 연계.',
        source: {
          institution: '문화체육관광부 & 한국관광공사',
          title: '2026 대한민국 야간관광 트렌드 리포트',
          year: '2026',
        },
        relevanceScore: 95,
        tags: ['스타게이징', '야간웰니스', '파크로쉬루프탑', '은하수'],
      },
      {
        id: 'trend-w33-02',
        trendTitle: '도심 속 팝업 러쉬와 리조트 역진출 콜라보레이션',
        category: 'Pop-up & Brand Collab',
        weeklyShift: '성수·한남동 등 트렌디 스팟의 팝업 브랜드들이 여름 성수기 휴양지 리조트와 제휴하여 고객 접점을 확장하는 움직임 가속.',
        coreEvidence: '패션포스트 2026: 아웃도어·F&B 브랜드의 80%가 리조트 및 호텔 여름 팝업 파트너십을 우선 순위로 채택.',
        keyBrandsAndCases: ['블루보틀 강원 팝업', '가민 골프 허브 성수', '스노우피크 필드 수트'],
        oakValleyParkRocheConnection: '오크밸리 야외 잔디광장 내 팝업 부스 운영 및 브랜드 샘플링.',
        source: {
          institution: 'Fashion Post Korea',
          title: '2026 브랜드 오프라인 액티베이션 트렌드',
          year: '2026',
        },
        relevanceScore: 88,
        tags: ['브랜드팝업', '성수동트렌드', '리조트콜라보'],
      },
      {
        id: 'trend-w33-03',
        trendTitle: '프리미엄 골프 라이프스타일과 영포티(Young Forty) 문화',
        category: 'Golf Lifestyle',
        weeklyShift: '격식 위주의 전통 골프에서 벗어나 스타일리시한 골프웨어와 감각적인 F&B를 함께 즐기는 영포티 골퍼 중심 시장 재편.',
        coreEvidence: '카카오골프예약 데이터: 3040 골퍼의 야간 라이트 라운드 및 감성 라운지 이용률 38% 증가.',
        keyBrandsAndCases: ['말본 골프', '지포어(G/FORE)', '성문안CC 클럽하우스 다이닝'],
        oakValleyParkRocheConnection: '성문안CC 선셋 나인홀 및 피에트 하인 이크 라운지 제휴 프로모션.',
        source: {
          institution: '카카오골프예약 & 골프다이제스트',
          title: '2026 3040 골퍼 소비 행동 분석',
          year: '2026',
        },
        relevanceScore: 90,
        tags: ['영포티골퍼', '성문안', '나이트골프'],
      }
    ],
    contentDrafts: [
      {
        id: 'draft-w33-01',
        trendId: 'trend-w33-01',
        contentTitle: '✨ "별빛 아래서 울려 퍼지는 싱잉볼" 파크로쉬 미드나잇 스타게이징 리트릿',
        coreMessage: '정선 밤하늘 은하수를 바라보며 즐기는 루프탑 스타게이징과 사운드 배스의 몽환적인 힐링 경험',
        targetBrand: 'PARK ROCHE',
        contentFormat: 'Reels',
        targetAudience: '2035 웰니스 커플, 감성 여행을 추구하는 2030 여성',
        isThisWeeksPick: true,
        recommendationRationale: '여름철 야간 은하수 뷰는 인스타그램에서 가장 높은 저장률과 감성적 반응을 이끌어내는 치트키입니다.',
        factCheck: {
          facts: ['문화체육관광부 야간관광 리포트: 야간 힐링 프로그램 수요 54% 증가', '파크로쉬 루프탑: 광공해가 거의 없는 청정 별자리 뷰 보유'],
          creativeIdeas: ['루프탑 빈백에 누워 핫초코를 마시며 천체 망원경으로 토성 고리를 관측하는 로맨틱한 시퀀스'],
          verifiedSource: '문화체육관광부 & 한국관광공사 야간관광 리서치',
        },
        postStructure: {
          reelsScenes: [
            {
              sceneNumber: 1,
              durationSec: '0~3s (Hook)',
              visualAction: '칠흑 같은 어둠 속에서 갑자기 쏟아지는 정선 가리왕산 밤하늘 은하수 타임랩스.',
              audioVoiceover: '"서울에서는 절대 볼 수 없는 밤하늘, 여기가 어디일까요?"',
              onScreenText: '✨ 휴대폰 카메라로 찍은 실화 은하수',
              filmingTip: '아이폰 야간 모드 및 삼각대 활용 고화질 밤하늘 촬영',
            },
            {
              sceneNumber: 2,
              durationSec: '3~10s (Scene 1)',
              visualAction: '파크로쉬 루프탑에서 담요를 덮고 빈백에 누워 별을 바라보는 커플의 뒷모습과 은은한 랜턴 조명.',
              audioVoiceover: '"불빛 하나 없는 정선 가리왕산 루프탑에서 마주하는 수억 개의 별빛."',
              onScreenText: '📍 파크로쉬 루프탑 스타게이징 라운지',
              filmingTip: '따뜻한 랜턴 불빛과 차가운 밤하늘 색 대비 강조',
            },
            {
              sceneNumber: 3,
              durationSec: '10~18s (Outro & CTA)',
              visualAction: '싱잉볼의 은은한 소리와 함께 별똥별이 떨어지는 순간, 행복하게 웃는 미소.',
              audioVoiceover: '"올여름, 평생 잊지 못할 별빛 힐링을 선물하세요."',
              onScreenText: '👉 이번 여름 함께 별 보러 갈 사람 @태그',
              filmingTip: '몽환적인 슬로우 모션 및 감성 피아노 BGM 페어링',
            }
          ]
        },
        draftCaption: {
          headline: '서울에서 2시간, 하늘에서 별이 쏟아지는 곳. 🌌\n파크로쉬 루프탑 미드나잇 스타게이징.',
          body: `도심의 화려한 네온사인에 가려져 잊고 지냈던 밤하늘의 진짜 모습.\n\n정선 가리왕산의 맑은 공기 속에서\n쏟아지는 은하수와 별똥별을 바라보며 마시는 따뜻한 로컬 티 한 잔.\n\n고요한 밤바람과 은은한 싱잉볼의 공명이 어우러져\n마음속 깊은 곳까지 평온함이 차오릅니다.\n\n이번 여름, 가장 빛나는 밤을 파크로쉬에서 기록해보세요.`,
          callToAction: '💫 함께 은하수를 보고 싶은 소중한 사람을 댓글로 소환해주세요!\n🏨 파크로쉬 웰니스 객실 예약은 프로필 링크 클릭.',
          hashtags: ['#파크로쉬', '#스타게이징', '#은하수스팟', '#정선여행', '#별자리여행', '#여름휴가지추천', '#웰니스리조트', '#감성숙소', '#국내여행추천'],
        },
        visualDirection: {
          concept: 'Dreamy Starlight & Quiet Intimacy (몽환적인 별빛과 아늑함)',
          locationSpot: '파크로쉬 루프탑 라운지',
          colorTone: '딥 미드나잇 블루 & 웜 캔들 골드',
          propsAndModels: '울 담요, 따뜻한 티 머그잔, 랜턴 조명',
        }
      },
      {
        id: 'draft-w33-02',
        trendId: 'trend-w33-02',
        contentTitle: '🕶️ "도심 팝업 성지가 숲속으로?" 오크밸리 서머 브랜드 라운지',
        coreMessage: '트렌디한 브랜드들의 감각적인 팝업을 오크밸리 잔디 광장에서 만나는 특별한 서머 바캉스',
        targetBrand: 'Oak Valley',
        contentFormat: 'Card News',
        targetAudience: '2030 트렌드 세터, 패션과 라이프스타일을 사랑하는 젊은 여행객',
        isThisWeeksPick: false,
        factCheck: {
          facts: ['패션포스트 리포트: 아웃도어/F&B 브랜드 80%가 리조트 팝업 선호', '오크밸리 광장: 대규모 야외 팝업 및 이벤트 인프라 구비'],
          creativeIdeas: ['성수동 핫플레이스 카페와 아웃도어 기어를 결합한 숲속 팝업 스트리트 연출'],
          verifiedSource: 'Fashion Post Korea 2026 & 오크밸리 마케팅팀',
        },
        postStructure: {
          slides: [
            {
              slideNumber: 1,
              slideType: 'COVER',
              headline: '성수동 핫플이 통째로 오크밸리 숲속으로 이동했다?',
              bodyText: '올여름 절대 놓치면 안 될 오크밸리 서머 팝업 라운지 TOP 3',
              visualDirection: '컬러풀한 브랜드 부스와 잔디 광장 파라솔 전경',
            },
            {
              slideNumber: 2,
              slideType: 'CONTENT',
              headline: '01. 아웃도어 기어 트라이얼 존',
              bodyText: '최신 백패킹 텐트와 캠핑 체어를 직접 체험하고 나만의 숲속 사진을 남겨보세요.',
              visualDirection: '스타일리시한 캠핑 체어와 커피 브루잉 장면',
            },
            {
              slideNumber: 3,
              slideType: 'CONTENT',
              headline: '02. 숲속 크래프트 비어 탭룸',
              bodyText: '원주 로컬 수제 맥주 브루어리와의 협업으로 선보이는 시원한 서머 에디션 수제 맥주.',
              visualDirection: '시원한 맥주 거품과 선셋 테라스',
            },
            {
              slideNumber: 4,
              slideType: 'CTA',
              headline: '이번 주말, 오크밸리에서 시원한 팝업 페스티벌을 즐기세요!',
              bodyText: '프로필 링크에서 팝업 일정 및 스페셜 쿠폰을 확인하세요.',
              visualDirection: '오크밸리 야경 페스티벌 조명 뷰',
            }
          ]
        },
        draftCaption: {
          headline: '성수동 감성 그대로, 오크밸리 푸른 잔디 위에서 펼쳐지는 숲속 팝업! 🎪',
          body: `도심에서 줄 서서 들어가던 트렌디 팝업을\n피톤치드 가득한 오크밸리 야외 잔디광장에서 여유롭게 즐겨보세요.\n\n취향 저격 아웃도어 브랜드 기어 체험부터\n원주 로컬 수제맥주 브루어리의 갓 뽑아낸 크래프트 맥주까지!\n\n🌿 Summer Pop-up Highlights:\n• 아웃도어 라이프스타일 기어 트라이얼\n• 숲속 감성 크래프트 탭룸 & 버스킹 라이브\n• 인스타 포토존 인증 시 한정판 굿즈 증정\n\n올여름, 가장 힙하고 시원한 숲캉스를 경험해보세요.`,
          callToAction: '🎉 이번 주말 함께 떠나고 싶은 친구를 태그해주세요!\n📍 위치: 오크밸리 빌리지센터 야외 잔디광장 (프로필 링크 안내)',
          hashtags: ['#오크밸리', '#서머팝업', '#오크밸리팝업', '#숲캉스', '#수제맥주', '#원주핫플', '#강원도여행', '#팝업스토어', '#주말나들이'],
        },
        visualDirection: {
          concept: 'Vibrant Festival & Outdoor Hip (활기찬 페스티벌과 아웃도어 힙)',
          locationSpot: '오크밸리 빌리지센터 잔디광장',
          colorTone: '비비드 썸머 옐로우 & 내추럴 그린',
          propsAndModels: '아웃도어 기어, 수제 맥주잔, 선글라스 착용 모델',
        }
      },
      {
        id: 'draft-w33-03',
        trendId: 'trend-w33-03',
        contentTitle: '⛳ "골프 치고 인생샷 건지는 노을 맛집" 성문안CC 선셋 골프 & 테라스',
        coreMessage: '노을 지는 암벽과 웅장한 자연 속에서 펼쳐지는 성문안CC의 프리미엄 선셋 나인홀과 다이닝',
        targetBrand: 'Oak Valley',
        contentFormat: 'Single Image',
        targetAudience: '3040 감성 골퍼, 인스타그램 골프 인증샷을 사랑하는 골퍼',
        isThisWeeksPick: false,
        factCheck: {
          facts: ['카카오골프예약: 3040 야간 및 선셋 라운드 선호도 38% 상승', '성문안CC: 웅장한 자연 암벽과 조명 설계로 국내 최고 수준 야간 조경 보유'],
          creativeIdeas: ['성문안CC 클럽하우스 테라스에서 샴페인을 들고 노을 진 코스를 배경으로 촬영한 럭셔리 원 컷'],
          verifiedSource: '카카오골프예약 2026 & 성문안CC 운영팀',
        },
        postStructure: {
          singleImageComposition: {
            visualComposition: '성문안CC 웅장한 암벽 절벽과 잔디 코스 위로 핑크빛/보랏빛 석양이 물드는 골든 아워 컷. 골프 카트와 모델이 자연스럽게 서 있는 럭셔리 라이프스타일 앵글.',
            captionLead: '가장 아름다운 석양이 내려앉는 시간, 성문안의 18번 홀은 예술이 됩니다.',
          }
        },
        draftCaption: {
          headline: '노을이 가장 아름다운 순간, 성문안CC의 황금빛 티샷. 🌅',
          body: `붉은 석양이 거대한 암벽을 물들이는 골든 아워.\n숨이 멎을 듯 웅장한 자연 속에서 즐기는 프리미엄 라운드.\n\n18홀의 감동이 끝난 뒤에는\n성문안 클럽하우스 테라스에서 셰프 특선 다이닝과 샴페인을 곁들여보세요.\n\n단순한 스코어를 넘어, 평생 기억에 남을 인생 라운드를 완성해 드립니다.`,
          callToAction: '🏌️‍♀️ 당신의 골프 버킷리스트 성문안CC, 동반자에게 공유해보세요.\n🔗 성문안CC 티타임 예약은 프로필 링크에서 확인하실 수 있습니다.',
          hashtags: ['#성문안CC', '#골프노을', '#골프스타그램', '#인생골프장', '#골프라운드', '#오크밸리', '#골프패션', '#골프여행', '#선셋라운드'],
        },
        visualDirection: {
          concept: 'Majestic Sunset & High Luxury (웅장한 석양과 하이 럭셔리)',
          locationSpot: '성문안CC 18번 홀 및 클럽하우스 테라스',
          colorTone: '선셋 퍼플 & 골든 앰버 톤',
          propsAndModels: '프리미엄 골프 클럽 및 샴페인 글라스',
        }
      }
    ],
    generatedAt: '2026-08-10T09:00:00Z',
  },
  {
    weekId: '2026-W32',
    weekLabel: '2026년 8월 1주차 (08.03 ~ 08.09)',
    period: '2026.08.03 - 2026.08.09',
    status: 'ARCHIVED',
    summaryOverview: {
      totalSignalsAnalyzed: 21,
      curatedTrendsCount: 3,
      instagramDraftsCount: 3,
      topTheme: '패밀리 키즈 네이처 익스플로러 & 아쿠아 웰니스 (Family Nature & Aqua Wellness)',
    },
    thisWeeksPick: {
      contentIdeaId: 'draft-w32-01',
      title: '🧒 "스마트폰 대신 곤충 채집통을 든 아이들" 오크밸리 숲속 키즈 에코 아카데미',
      format: 'Card News',
      targetBrand: 'Oak Valley',
      rationale: '여름 방학 시즌 학부모들의 최고 관심사인 자연 생태 교육과 키즈 웰니스를 정조준하여 3040 패밀리 타깃의 폭발적인 공유와 예약 전환을 이끌어냅니다.',
      expectedEngagement: '맘카페 및 학부모 인스타 공유율 1위 · 패밀리 패키지 완판 견인',
    },
    weeklyTrends: [
      {
        id: 'trend-w32-01',
        trendTitle: '디지털 디톡스와 숲속 자연 생태(Forest Eco) 키즈 캠프',
        category: 'Family & Education',
        weeklyShift: '어린이 스크린 타임 증가에 우려를 느끼는 3040 부모들의 숲속 생태 체험 및 자연 관찰 리조트 프로그램 수요 집중.',
        coreEvidence: '육아정책연구소 2026: 학부모의 89%가 "방학 기간 자연 체험형 리조트 숙박 프로그램 참여 희망" 응답.',
        keyBrandsAndCases: ['내셔널지오그래픽 키즈', '파타고니아 칠드런 에코 캠프'],
        oakValleyParkRocheConnection: '오크밸리 참나무 숲 곤충 관찰 및 숲 밧줄 놀이터 키즈 패키지.',
        source: {
          institution: '육아정책연구소 & 환경부',
          title: '2026 어린이 자연생태 교육 및 가족 여행 동향',
          year: '2026',
        },
        relevanceScore: 93,
        tags: ['키즈에코', '디지털디톡스', '오크밸리키즈', '가족여행'],
      },
      {
        id: 'trend-w32-02',
        trendTitle: '아쿠아 테라피 & 수중 사운드 리커버리',
        category: 'Wellness & Spa',
        weeklyShift: '물속에서 중력을 벗어나 근육을 이완하는 플로팅 테라피와 아쿠아 요가 선호도 상승.',
        coreEvidence: 'ISPA(국제스파협회) 2026: 글로벌 스파 여행자 중 아쿠아 힐링 테라피 이용률 31% 증가.',
        keyBrandsAndCases: ['파크로쉬 아쿠아클럽', '반얀트리 하이드로 스파'],
        oakValleyParkRocheConnection: '파크로쉬 야외 자쿠지 & 인도어 플로팅 요가 세션.',
        source: {
          institution: 'International SPA Association (ISPA)',
          title: '2026 Global Spa & Hydrotherapy Trends',
          year: '2026',
        },
        relevanceScore: 92,
        tags: ['아쿠아테라피', '플로팅요가', '파크로쉬스파'],
      },
      {
        id: 'trend-w32-03',
        trendTitle: '반려견과 함께하는 펫 웰니스 투어리즘',
        category: 'Pet Travel',
        weeklyShift: '반려동물을 가족으로 여기는 펫팸족의 리조트 동반 투숙 및 잔디 트레킹 수요 급증.',
        coreEvidence: '농림축산식품부: 국내 펫 동반 여행 시장 규모 연 15% 성장.',
        keyBrandsAndCases: ['소노펫 리조트', '로얄캐닌 펫 웰니스 투어'],
        oakValleyParkRocheConnection: '오크밸리 펫 프렌들리 객실 및 전용 펫 트랙 산책로.',
        source: {
          institution: '농림축산식품부 & 한국관광공사',
          title: '2026 반려동물 동반 여행 실태 보고서',
          year: '2026',
        },
        relevanceScore: 86,
        tags: ['펫동반여행', '오크밸리펫', '반려견여행'],
      }
    ],
    contentDrafts: [
      {
        id: 'draft-w32-01',
        trendId: 'trend-w32-01',
        contentTitle: '🧒 "스마트폰 대신 곤충 채집통을 든 아이들" 오크밸리 숲속 키즈 에코 아카데미',
        coreMessage: '아이들에게 살아있는 자연의 경이로움을 선물하는 오크밸리 참나무 숲 생태 탐험 프로그램',
        targetBrand: 'Oak Valley',
        contentFormat: 'Card News',
        targetAudience: '3040 학부모, 유치원~초등학생 자녀를 둔 가족',
        isThisWeeksPick: true,
        recommendationRationale: '방학 시즌 가족 여행객의 니즈를 완벽하게 충족하며, 자연 교육 콘텐츠로서 높은 신뢰도와 공유 반응을 기대할 수 있습니다.',
        factCheck: {
          facts: ['육아정책연구소: 학부모 89%가 자연체험형 리조트 선호', '오크밸리: 숲 해설가와 함께하는 청정 참나무 생태 둘레길 보유'],
          creativeIdeas: ['숲속 보물찾기 지도와 에코 키즈 탐험가 수료증 발급 프로모션'],
          verifiedSource: '육아정책연구소 & 오크밸리 액티비티팀',
        },
        postStructure: {
          slides: [
            {
              slideNumber: 1,
              slideType: 'COVER',
              headline: '스마트폰을 내려놓고 숲으로 뛰어든 아이들',
              bodyText: '오크밸리 340만 평 숲에서 펼쳐지는 키즈 에코 탐험대 이야기',
              visualDirection: '밀짚모자를 쓰고 돋보기로 나뭇잎을 관찰하는 천진난만한 아이들의 미소',
            },
            {
              slideNumber: 2,
              slideType: 'CONTENT',
              headline: '01. 전문 숲 해설가와 함께하는 비밀 숲 탐험',
              bodyText: '참나무 숲에 사는 다양한 곤충과 식물 이야기를 재미있는 스토리텔링으로 배우는 시간.',
              visualDirection: '숲 해설가의 설명에 귀 기울이는 아이들과 가족들',
            },
            {
              slideNumber: 3,
              slideType: 'CONTENT',
              headline: '02. 숲 밧줄 놀이터 & 피톤치드 오감 체험',
              bodyText: '나무 사이를 오가며 균형감각과 모험심을 기르는 자연 친화적 친환경 놀이터.',
              visualDirection: '숲 밧줄 다리를 건너며 신나게 웃는 아이',
            },
            {
              slideNumber: 4,
              slideType: 'CTA',
              headline: '올여름, 우리 아이에게 평생 남을 숲의 추억을 선물하세요!',
              bodyText: '오크밸리 키즈 에코 패키지 예약은 프로필 링크에서 가능합니다.',
              visualDirection: '오크밸리 골프빌리지와 푸른 잔디 뷰',
            }
          ]
        },
        draftCaption: {
          headline: '아이의 두 손에 스마트폰 대신 도토리와 돋보기를 쥐여주세요! 🌳\n오크밸리 숲속 키즈 에코 아카데미.',
          body: `온종일 작은 화면에 갇혀 지내던 우리 아이에게\n살아 숨 쉬는 진짜 자연을 선물하는 시간.\n\n340만 평 청정 참나무 숲길을 걸으며\n장수풍뎅이의 발자국을 찾고, 맑은 시냇물 소리에 귀 기울여봅니다.\n\n🌿 Kids Eco Program:\n• 전문 숲 해설가와 함께하는 오감 생태 탐험\n• 자연물 공예 만들기 & 에코 탐험가 인증서 수여\n• 안전하게 즐기는 피톤치드 숲 밧줄 어드벤처\n\n올여름, 아이의 눈동자에 싱그러운 초록빛 자연을 가득 담아주세요.`,
          callToAction: '💚 아이와 함께 숲캉스 떠나고 싶은 엄빠는 저장(📌) & 공유해주세요!\n🔗 키즈 에코 패키지 상세 안내는 프로필 링크 확인.',
          hashtags: ['#오크밸리', '#키즈에코', '#숲체험', '#가족여행추천', '#아이와가볼만한곳', '#여름방학여행', '#자연놀이터', '#키즈캉스', '#원주여행', '#오크밸리키즈'],
        },
        visualDirection: {
          concept: 'Natural Wonder & Innocent Discovery (자연의 경이와 순수한 발견)',
          locationSpot: '오크밸리 참나무 숲 생태 탐방로',
          colorTone: '생기 넘치는 내추럴 그린 & 브라이트 썬샤인',
          propsAndModels: '키즈 탐험 모자, 돋보기, 나무 공예 키트',
        }
      }
    ],
    generatedAt: '2026-08-03T09:00:00Z',
  }
];
