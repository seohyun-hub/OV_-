import fs from 'fs';
import path from 'path';
import { firestoreService } from './firestoreService';
import { PartnerArchiveRecord } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARCHIVES_FILE = path.join(DATA_DIR, 'partner_archives.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data preserving existing records
const INITIAL_PARTNER_ARCHIVES: PartnerArchiveRecord[] = [
  {
    id: 'pa-1',
    companyName: '오크밸리 윈터 하프 마라톤 조직위',
    brandName: '윈터 하프 마라톤',
    industry: '스포츠·마라톤',
    internalAssignee: '박서현',
    contactPerson: '마라톤 사업국',
    contactTitle: '사무국장',
    contactPhone: '02-1234-5678',
    contactEmail: 'marathon@oakvalley.co.kr',
    currentStatus: '진행 확정',
    latestProjectName: '2026 오크밸리 윈터 하프 마라톤 메인 스폰서십',
    latestProposalDate: '2026-09-10',
    nextAction: '시설 및 안전 점검 최종 가이드 수립',
    notes: '브랜드 후원사 추가 유치 및 오크밸리 러닝코스 조율',
    proposals: [
      {
        id: 'prop-1-1',
        projectName: '2026 오크밸리 윈터 하프 마라톤 메인 스폰서십',
        proposalDate: '2026-09-10',
        proposalType: '스폰서십 & 공간대관',
        summary: '오크밸리 광장 및 러닝 코스를 활용한 동계 윈터 하프 마라톤 타이틀 제휴 패키지 제안',
        requests: '현금 후원금 3,000만원 + 리조트 객실 바터 50실',
        status: '진행 확정',
        result: '협약 체결 완료 및 코스 승인',
        files: [
          {
            id: 'file-1-1',
            fileName: '2026_Winter_Marathon_Sponsorship_Proposal_v1.pptx',
            version: 'v1.0',
            description: '윈터 마라톤 스폰서십 제안서 최종본',
            uploadDate: '2026-09-10',
            fileType: 'PPT',
            fileSizeFormatted: '12.4 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          },
          {
            id: 'file-1-2',
            fileName: '마라톤_코스안_및_안전점검표.pdf',
            version: 'v1.2',
            description: '오크밸리 슬로프 및 러닝코스 지도',
            uploadDate: '2026-09-12',
            fileType: 'PDF',
            fileSizeFormatted: '4.1 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-1-1', date: '2026-09-10', author: '박서현', content: '최초 제안서 및 코스 활용안 발송 완료' },
      { id: 'tl-1-2', date: '2026-09-12', author: '박서현', content: '스폰서십 패키지 최종 확정 및 유관 부서(시설·운영) 현장 점검 미팅 진행 완료' }
    ]
  },
  {
    id: 'pa-2',
    companyName: 'Garmin Korea',
    brandName: 'Garmin Golf',
    industry: '골프·스포츠IT',
    internalAssignee: '전시현',
    contactPerson: '가민코리아 제휴팀',
    contactTitle: '팀장',
    contactPhone: '02-987-6543',
    contactEmail: 'golf@garmin.co.kr',
    currentStatus: '조건 조율',
    latestProjectName: 'Garmin Golf Approach 라운지 & 3D 스윙 촬영',
    latestProposalDate: '2026-09-08',
    nextAction: '촬영 대관 렌탈 계약서 상호 서명',
    notes: '골프 앰버서더 초청 행사 연계',
    proposals: [
      {
        id: 'prop-2-1',
        projectName: 'Garmin Golf Approach 라운지 & 3D 스윙 촬영',
        proposalDate: '2026-09-08',
        proposalType: '골프 팝업 & 미디어 촬영',
        summary: '성문안 CC & 오크밸리 CC 스타트하우스 내 Approach 스마트워치 팝업 및 GPS 코스 체험존',
        requests: '골프존 팝업 무상 구좌 및 가민 스마트워치 20대 바터 협찬',
        status: '조건 조율',
        result: '1차 조건 합의 및 세부 계약서 검토 중',
        files: [
          {
            id: 'file-2-1',
            fileName: 'Garmin_Approach_Golf_Lounge_Proposal_v2.pptx',
            version: 'v2.0',
            description: '클럽하우스 내 스마트 팝업존 제안서',
            uploadDate: '2026-09-08',
            fileType: 'PPT',
            fileSizeFormatted: '18.2 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          },
          {
            id: 'file-2-2',
            fileName: '성문안CC_스타트하우스_도면.pdf',
            version: 'v1.0',
            description: '부스 설치 가능 구좌 평면도',
            uploadDate: '2026-09-09',
            fileType: 'PDF',
            fileSizeFormatted: '2.8 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-2-1', date: '2026-09-08', author: '전시현', content: 'Garmin Golf 팝업 제안서 최초 전달' },
      { id: 'tl-2-2', date: '2026-09-11', author: '전시현', content: '행사 일정 협의 및 코스 대여 조건 1차 안 확정, 현장 촬영 렌탈 조율 중' }
    ]
  },
  {
    id: 'pa-3',
    companyName: 'K-SWISS Korea',
    brandName: 'K-SWISS Pickleball',
    industry: '스포츠·피클볼',
    internalAssignee: '신현연',
    contactPerson: '마케팅본부',
    contactTitle: '부장',
    contactPhone: '02-3333-4444',
    contactEmail: 'kswiss@k-swiss.co.kr',
    currentStatus: '협의 중',
    latestProjectName: 'K-SWISS 피클볼 코트 브랜딩 & 토너먼트 협찬',
    latestProposalDate: '2026-09-05',
    nextAction: '현물 협찬 품목 세부 수량 조정 회신',
    notes: '가을 피클볼 토너먼트 협찬 연계',
    proposals: [
      {
        id: 'prop-3-1',
        projectName: 'K-SWISS 피클볼 코트 브랜딩 & 토너먼트 협찬',
        proposalDate: '2026-09-05',
        proposalType: '브랜드 제휴 & 현물 협찬',
        summary: '오크밸리 야외 피클볼 전용 코트 펜스 브랜딩 및 주말 동호인 대회 K-SWISS 라켓/의류 협찬',
        requests: '피클볼 코트 네이밍 라이츠 3개월 + 의류/신발 1,000만원 상당 협찬',
        status: '협의 중',
        result: '브랜드 존 설치 검토 중',
        files: [
          {
            id: 'file-3-1',
            fileName: 'K-SWISS_Pickleball_Courts_Branding.pdf',
            version: 'v1.0',
            description: '야외 코트 시안 및 브랜딩 가이드',
            uploadDate: '2026-09-05',
            fileType: 'PDF',
            fileSizeFormatted: '8.5 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-3-1', date: '2026-09-05', author: '신현연', content: '피클볼 코트 네이밍 라이츠 및 행사 제안서 송부' },
      { id: 'tl-3-2', date: '2026-09-10', author: '신현연', content: '제안서 수신 후 브랜드 존 구축 및 바터 협찬 품목 세부 검토 중' }
    ]
  },
  {
    id: 'pa-4',
    companyName: '르무통 (Le Mouton)',
    brandName: '르무통',
    industry: '라이프스타일·풋웨어',
    internalAssignee: '박서현',
    contactPerson: '브랜드전략팀',
    contactTitle: '팀장',
    contactPhone: '02-5555-7777',
    contactEmail: 'lemouton@lemouton.co.kr',
    currentStatus: '제안 완료',
    latestProjectName: '르무통 숨길 산책회 & 편안한 휴식 팝업',
    latestProposalDate: '2026-09-07',
    nextAction: '르무통 마케팅팀 내부 회신 대기',
    notes: '투숙객 대상 팝업 체험 프로그램',
    proposals: [
      {
        id: 'prop-4-1',
        projectName: '르무통 숨길 산책회 & 편안한 휴식 팝업',
        proposalDate: '2026-09-07',
        proposalType: '투숙객 프로그램 & 팝업',
        summary: '오크밸리 숨길 산책로 활용 걷기 행사 및 투숙객 대상 울 슈즈 체험 대여 프로그램',
        requests: '대관료 무료 + 투숙객 시체험 신발 50켤레 비치',
        status: '제안 완료',
        result: '내부 검토 중',
        files: [
          {
            id: 'file-4-1',
            fileName: 'LeMouton_Trail_Walk_Proposal.pptx',
            version: 'v1.0',
            description: '숨길 산책로 팝업 및 대관 가이드',
            uploadDate: '2026-09-07',
            fileType: 'PPT',
            fileSizeFormatted: '9.3 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-4-1', date: '2026-09-07', author: '박서현', content: '숨길 산책로 걷기 행사 기획안 전달' },
      { id: 'tl-4-2', date: '2026-09-09', author: '박서현', content: '숨길 산책로 활용 걷기 행사 제안서 준비 및 대관 가이드 안내' }
    ]
  },
  {
    id: 'pa-5',
    companyName: '치유사물 (Chiyu Samul)',
    brandName: '치유사물',
    industry: '웰니스·아로마',
    internalAssignee: '전시현',
    contactPerson: '치유사물 대표',
    contactTitle: '대표',
    contactPhone: '010-8888-9999',
    contactEmail: 'chiyu@chiyusamul.com',
    currentStatus: '진행 확정',
    latestProjectName: '파크로쉬 & 오크밸리 아로마 힐링 클래스',
    latestProposalDate: '2026-09-01',
    nextAction: '주말 웰니스 모닝 클래스 일정 수립',
    notes: '웰니스 클럽 팝업 연계',
    proposals: [
      {
        id: 'prop-5-1',
        projectName: '파크로쉬 & 오크밸리 아로마 힐링 클래스',
        proposalDate: '2026-09-01',
        proposalType: '웰니스 클래스 & 어메니티',
        summary: '파크로쉬 웰니스 클럽 내 아로마 오일 팝업 존 및 주말 투숙객 아로마 테라피 DIY 클래스',
        requests: '클래스 공간 제공 + 투숙객 웰컴 샘플 500개 증정',
        status: '진행 확정',
        result: '공간 배치 및 Sample 납품 완료',
        files: [
          {
            id: 'file-5-1',
            fileName: '치유사물_웰니스_클래스_기획서.pdf',
            version: 'v1.0',
            description: '아로마 클래스 커리큘럼 및 샘플 사양',
            uploadDate: '2026-09-01',
            fileType: 'PDF',
            fileSizeFormatted: '3.5 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-5-1', date: '2026-09-01', author: '전시현', content: '아로마 테라피 클래스 제안' },
      { id: 'tl-5-2', date: '2026-09-08', author: '전시현', content: '팝업존 공간 배치 및 아로마 힐링 클래스 1차 샘플 제공 완료' }
    ]
  },
  {
    id: 'pa-6',
    companyName: 'Mindnook (마인드눅)',
    brandName: 'Mindnook',
    industry: '가족·웰니스',
    internalAssignee: '신현연',
    contactPerson: '제휴사업팀',
    contactTitle: '팀장',
    contactPhone: '02-4444-5555',
    contactEmail: 'contact@mindnook.co.kr',
    currentStatus: '제안 준비',
    latestProjectName: '가족 마음챙김 키즈 웰니스 프로그램',
    latestProposalDate: '2026-09-04',
    nextAction: '파크로쉬 키즈 모듈 타당성 검토 회신',
    notes: '담당자 지정 및 검토 진행',
    proposals: [
      {
        id: 'prop-6-1',
        projectName: '가족 마음챙김 키즈 웰니스 프로그램',
        proposalDate: '2026-09-04',
        proposalType: '키즈 콘텐츠 & 체험',
        summary: '파크로쉬 라이브러리 연계 키즈 사운드 힐링 및 마음챙김 그림책 체험 프로그램',
        requests: '키즈 클래스 라이선스 및 교구 협찬',
        status: '제안 준비',
        result: '초안 검토 중',
        files: [
          {
            id: 'file-6-1',
            fileName: 'Mindnook_Kids_Wellness_Draft.docx',
            version: 'v0.9',
            description: '마인드눅 키즈 프로그램 초안',
            uploadDate: '2026-09-04',
            fileType: 'DOC',
            fileSizeFormatted: '1.2 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-6-1', date: '2026-09-04', author: '신현연', content: '마인드눅 제휴 아이디어 수신 및 내부 기획안 작성 시작' },
      { id: 'tl-6-2', date: '2026-09-07', author: '신현연', content: '기획안 초안 공유 및 파크로쉬 웰니스 키즈 프로그램 적용 가능 여부 타당성 검토' }
    ]
  },
  {
    id: 'pa-7',
    companyName: '영풍문고',
    brandName: '영풍문고',
    industry: '도서·문화',
    internalAssignee: '신현연',
    contactPerson: '문화사업부',
    contactTitle: '차장',
    contactPhone: '02-397-1234',
    contactEmail: 'book@ypbooks.co.kr',
    currentStatus: '진행 확정',
    latestProjectName: '가을 북스테이 팝업 & 파크로쉬 도서 큐레이션',
    latestProposalDate: '2026-09-02',
    nextAction: '북토크 이벤트 일정 잡기',
    notes: '북카페 비치 완결',
    proposals: [
      {
        id: 'prop-7-1',
        projectName: '가을 북스테이 팝업 & 파크로쉬 도서 큐레이션',
        proposalDate: '2026-09-02',
        proposalType: '도서 바터 & 북스테이',
        summary: '오크밸리 로비 북카페 및 파크로쉬 라이브러리에 영풍문고 큐레이션 도서 300권 비치 및 북스테이 패키지',
        requests: '도서 300권 무상 지원 + 교보/영풍 온라인 패키지 홍보',
        status: '진행 확정',
        result: '도서 수령 및 비치 완료',
        files: [
          {
            id: 'file-7-1',
            fileName: '영풍문고_북스테이_큐레이션_목록.xlsx',
            version: 'v1.0',
            description: '비치 도서 300권 타이틀 및 카테고리',
            uploadDate: '2026-09-02',
            fileType: 'XLS',
            fileSizeFormatted: '520 KB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-7-1', date: '2026-09-02', author: '신현연', content: '북스테이 도서 바터 제안서 확정' },
      { id: 'tl-7-2', date: '2026-09-11', author: '신현연', content: '가을 북스테이 콘셉트 도서 큐레이션 수령 및 리조트 내 비치 확정' }
    ]
  },
  {
    id: 'pa-8',
    companyName: 'HDC 아이파크신라면세점',
    brandName: '신라아이파크면세점',
    industry: '면세·유통',
    internalAssignee: '박서현',
    contactPerson: '마케팅팀',
    contactTitle: '팀장',
    contactPhone: '02-490-1114',
    contactEmail: 'shillaipark@hdcshilla.co.kr',
    currentStatus: '진행 확정',
    latestProjectName: 'IPARK RESORT VIP 면세점 바우처 상호 바터',
    latestProposalDate: '2026-09-03',
    nextAction: '체크인 봉투 인입 수량 최종 점검',
    notes: '면세점 구매고객 리조트 할인권 상호 교환',
    proposals: [
      {
        id: 'prop-8-1',
        projectName: 'IPARK RESORT VIP 면세점 바우처 상호 바터',
        proposalDate: '2026-09-03',
        proposalType: 'VIP 바우처 바터',
        summary: '오크밸리 투숙객 대상 신라아이파크면세점 $30 바우처 지급 및 면세점 VIP 대상 리조트 객실 30% 할인 쿠폰 상호 발권',
        requests: '바우처 실물 10,000매 상호 인쇄',
        status: '진행 확정',
        result: '인쇄 완료 및 체크인 봉투 배포 시작',
        files: [
          {
            id: 'file-8-1',
            fileName: 'ShillaIPark_Voucher_Design.pdf',
            version: 'v2.1',
            description: '면세점 바우처 실물 인쇄 시안',
            uploadDate: '2026-09-03',
            fileType: 'PDF',
            fileSizeFormatted: '5.8 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-8-1', date: '2026-09-03', author: '박서현', content: '바우처 상호 바터 제안 합의' },
      { id: 'tl-8-2', date: '2026-09-12', author: '박서현', content: '하반기 VIP 바우처 실물 인쇄 및 투숙객 체크인 봉투 인입 수량 확정' }
    ]
  }
];

let memoryArchives: PartnerArchiveRecord[] = [];

function loadArchivesFromFile(): PartnerArchiveRecord[] {
  try {
    if (fs.existsSync(ARCHIVES_FILE)) {
      const data = fs.readFileSync(ARCHIVES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[partnerArchiveStore] Error reading archives file:', e);
  }
  // If file doesn't exist or is empty, write initial seed
  try {
    fs.writeFileSync(ARCHIVES_FILE, JSON.stringify(INITIAL_PARTNER_ARCHIVES, null, 2), 'utf-8');
  } catch (e) {}
  return INITIAL_PARTNER_ARCHIVES;
}

function saveArchivesToFile(records: PartnerArchiveRecord[]): void {
  try {
    fs.writeFileSync(ARCHIVES_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.error('[partnerArchiveStore] Error saving archives file:', e);
  }
}

memoryArchives = loadArchivesFromFile();

export function setMemoryPartnerArchives(records: PartnerArchiveRecord[]): void {
  memoryArchives = records;
  saveArchivesToFile(records);
}

export async function loadPartnerArchives(): Promise<PartnerArchiveRecord[]> {
  if (firestoreService.isReady()) {
    const fsRecords = await firestoreService.getPartnerArchives();
    if (fsRecords && fsRecords.length > 0) {
      memoryArchives = fsRecords;
      saveArchivesToFile(fsRecords);
      return fsRecords;
    }
  }
  return memoryArchives;
}

export async function savePartnerArchiveRecord(record: PartnerArchiveRecord): Promise<PartnerArchiveRecord> {
  const existingIdx = memoryArchives.findIndex((p) => p.id === record.id);
  if (existingIdx >= 0) {
    memoryArchives[existingIdx] = record;
  } else {
    memoryArchives.unshift(record);
  }

  saveArchivesToFile(memoryArchives);

  if (firestoreService.isReady()) {
    await firestoreService.setPartnerArchive(record);
  }

  return record;
}

export async function deletePartnerArchiveRecord(id: string): Promise<boolean> {
  memoryArchives = memoryArchives.filter((p) => p.id !== id);
  saveArchivesToFile(memoryArchives);

  if (firestoreService.isReady()) {
    await firestoreService.deletePartnerArchive(id);
  }

  return true;
}
