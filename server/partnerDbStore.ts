import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { firestoreService } from './firestoreService';
import {
  PartnerRecord,
  PartnerContactRecord,
  PartnerDbDuplicateItem,
  DuplicateActionType,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PARTNERS_FILE = path.join(DATA_DIR, 'partners.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'partner_contacts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed partners if files do not exist yet
const INITIAL_PARTNERS: PartnerRecord[] = [
  {
    id: 'p-1',
    companyName: '오크밸리 윈터 하프 마라톤 조직위',
    brandName: '윈터 하프 마라톤',
    industry: '스포츠·마라톤',
    website: 'https://oakvalley.co.kr',
    internalOwner: '박서현',
    recentDealNote: '스폰서십 패키지 최종 확정 및 현장 점검 미팅 완료',
    notes: '브랜드 후원사 추가 유치 협의 중',
    source: '기존 시스템',
    hasExistingInteraction: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-2',
    companyName: 'Garmin Korea',
    brandName: 'Garmin Golf',
    industry: '골프·스포츠IT',
    website: 'https://garmin.co.kr',
    internalOwner: '전시현',
    recentDealNote: '행사 일정 협의 및 코스 대여 조건 1차 안 확정',
    notes: '골프 앰버서더 초청 행사 연계',
    source: '기존 시스템',
    hasExistingInteraction: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p-3',
    companyName: 'K-SWISS Korea',
    brandName: 'K-SWISS Pickleball',
    industry: '스포츠·피클볼',
    website: 'https://k-swiss.co.kr',
    internalOwner: '신현연',
    recentDealNote: '피클볼 코트 브랜드 전용 공간 구축 안 검토',
    notes: '야외 피클볼 전용 코트 팝업',
    source: '기존 시스템',
    hasExistingInteraction: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CONTACTS: PartnerContactRecord[] = [
  {
    id: 'pc-1',
    partnerId: 'p-1',
    companyName: '오크밸리 윈터 하프 마라톤 조직위',
    brandName: '윈터 하프 마라톤',
    contactName: '마라톤 사업국',
    title: '사무국장',
    department: '운영국',
    email: 'marathon@oakvalley.co.kr',
    phone: '02-1234-5678',
    website: 'https://oakvalley.co.kr',
    industry: '스포츠·마라톤',
    internalOwner: '박서현',
    recentDealNote: '스폰서십 패키지 최종 확정',
    notes: '주요 연락처',
    source: '기존 시스템',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pc-2',
    partnerId: 'p-2',
    companyName: 'Garmin Korea',
    brandName: 'Garmin Golf',
    contactName: '가민코리아 제휴팀',
    title: '팀장',
    department: '마케팅팀',
    email: 'golf@garmin.co.kr',
    phone: '02-987-6543',
    website: 'https://garmin.co.kr',
    industry: '골프·스포츠IT',
    internalOwner: '전시현',
    recentDealNote: '행사 일정 협의',
    notes: '골프 마케팅 총괄',
    source: '기존 시스템',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper: Local File I/O
function loadLocalPartners(): PartnerRecord[] {
  if (!fs.existsSync(PARTNERS_FILE)) {
    fs.writeFileSync(PARTNERS_FILE, JSON.stringify(INITIAL_PARTNERS, null, 2), 'utf-8');
    return INITIAL_PARTNERS;
  }
  try {
    const raw = fs.readFileSync(PARTNERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PARTNERS;
  }
}

function saveLocalPartners(data: PartnerRecord[]) {
  fs.writeFileSync(PARTNERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function loadLocalContacts(): PartnerContactRecord[] {
  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(INITIAL_CONTACTS, null, 2), 'utf-8');
    return INITIAL_CONTACTS;
  }
  try {
    const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CONTACTS;
  }
}

function saveLocalContacts(data: PartnerContactRecord[]) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Exported Service Functions
export async function getAllPartners(): Promise<PartnerRecord[]> {
  if (firestoreService.isReady()) {
    const fsData = await firestoreService.getPartners();
    if (fsData && fsData.length > 0) {
      saveLocalPartners(fsData); // Sync local
      return fsData;
    }
  }
  return loadLocalPartners();
}

export async function getAllPartnerContacts(): Promise<PartnerContactRecord[]> {
  if (firestoreService.isReady()) {
    const fsData = await firestoreService.getPartnerContacts();
    if (fsData && fsData.length > 0) {
      saveLocalContacts(fsData); // Sync local
      return fsData;
    }
  }
  return loadLocalContacts();
}

export async function savePartnerRecord(item: PartnerRecord): Promise<PartnerRecord> {
  const current = loadLocalPartners();
  const idx = current.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...item, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(item);
  }
  saveLocalPartners(current);

  if (firestoreService.isReady()) {
    await firestoreService.setPartner(item);
  }
  return item;
}

export async function savePartnerContactRecord(item: PartnerContactRecord): Promise<PartnerContactRecord> {
  const current = loadLocalContacts();
  const idx = current.findIndex((c) => c.id === item.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...item, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(item);
  }
  saveLocalContacts(current);

  if (firestoreService.isReady()) {
    await firestoreService.setPartnerContact(item);
  }
  return item;
}

export async function deletePartnerRecord(id: string): Promise<boolean> {
  let current = loadLocalPartners();
  current = current.filter((p) => p.id !== id);
  saveLocalPartners(current);

  if (firestoreService.isReady()) {
    await firestoreService.deletePartner(id);
  }
  return true;
}

export async function deletePartnerContactRecord(id: string): Promise<boolean> {
  let current = loadLocalContacts();
  current = current.filter((c) => c.id !== id);
  saveLocalContacts(current);

  if (firestoreService.isReady()) {
    await firestoreService.deletePartnerContact(id);
  }
  return true;
}

// STANDARD FIELD KEYS FOR MAPPING
export const STANDARD_PARTNER_FIELDS: Record<string, string> = {
  companyName: '회사명',
  brandName: '브랜드명',
  contactName: '담당자명',
  title: '직급',
  department: '부서',
  email: '이메일',
  phone: '전화번호',
  website: '홈페이지',
  instagramUrl: 'Instagram',
  industry: '업종',
  internalOwner: '담당자(내부)',
  recentDealNote: '최근 제휴 내용',
  notes: '메모',
  source: '출처',
};

// Column Auto-Mapping Logic
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  headers.forEach((header) => {
    const clean = header.trim().toLowerCase().replace(/[\s_\-\(\)]/g, '');

    if (/회사|상호|기업|company/i.test(clean)) {
      mapping[header] = 'companyName';
    } else if (/브랜드|brand/i.test(clean)) {
      mapping[header] = 'brandName';
    } else if (/담당자명|성명|이름|담당자|contactname|name/i.test(clean) && !/내부/i.test(clean)) {
      mapping[header] = 'contactName';
    } else if (/직급|직책|포지션|title|position/i.test(clean)) {
      mapping[header] = 'title';
    } else if (/부서|팀|부서명|dept|department/i.test(clean)) {
      mapping[header] = 'department';
    } else if (/이메일|메일|email|mail/i.test(clean)) {
      mapping[header] = 'email';
    } else if (/전화|휴대폰|연락처|폰|cell|phone|tel|mobile/i.test(clean)) {
      mapping[header] = 'phone';
    } else if (/인스타|instagram|insta|sns/i.test(clean)) {
      mapping[header] = 'instagramUrl';
    } else if (/홈페이지|웹사이트|url|site|website/i.test(clean)) {
      mapping[header] = 'website';
    } else if (/업종|산업|카테고리|분야|industry|category/i.test(clean)) {
      mapping[header] = 'industry';
    } else if (/내부담당|내부담당자|담당자내부|assignee|owner/i.test(clean)) {
      mapping[header] = 'internalOwner';
    } else if (/최근제휴|제휴내용|이력|최근진행|deal|progress/i.test(clean)) {
      mapping[header] = 'recentDealNote';
    } else if (/메모|비고|특이사항|note|notes|memo/i.test(clean)) {
      mapping[header] = 'notes';
    } else if (/출처|경로|소스|source/i.test(clean)) {
      mapping[header] = 'source';
    } else {
      mapping[header] = '';
    }
  });

  return mapping;
}

// Helper: Smart parsing & splitting of mixed contact fields (Email, Phone, Website, Instagram)
export function parseAndCleanContactFields(raw: {
  email?: string;
  phone?: string;
  website?: string;
  instagramUrl?: string;
}): {
  email: string;
  phone: string;
  website: string;
  instagramUrl: string;
} {
  const emailInput = cleanString(raw.email);
  const phoneInput = cleanString(raw.phone);
  const websiteInput = cleanString(raw.website);
  const instagramInput = cleanString(raw.instagramUrl);

  const combined = [emailInput, phoneInput, websiteInput, instagramInput].join(' ');

  // 1. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emailsFound = combined.match(emailRegex) || [];
  const cleanEmail = emailsFound[0] ? emailsFound[0].trim() : (emailInput && !emailInput.includes('http') && !emailInput.includes('/') ? emailInput : '');

  // 2. Instagram extraction
  const instagramRegex = /(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.-]+\/?)/gi;
  const instagramMatches = combined.match(instagramRegex) || [];
  let cleanInstagram = instagramMatches[0] ? instagramMatches[0].trim() : '';

  if (!cleanInstagram && instagramInput) {
    if (instagramInput.includes('instagram.com')) {
      cleanInstagram = instagramInput;
    } else {
      const handle = instagramInput.replace(/^@/, '').trim();
      if (handle && !handle.includes(' ') && !handle.includes('http')) {
        cleanInstagram = `https://instagram.com/${handle}`;
      } else {
        cleanInstagram = instagramInput;
      }
    }
  }

  // 3. Website extraction
  const urlRegex = /(https?:\/\/[^\s,;]+|www\.[^\s,;]+)/gi;
  const urlsFound = combined.match(urlRegex) || [];
  const nonInstaUrls = urlsFound.filter((u) => !u.toLowerCase().includes('instagram.com'));
  const cleanWebsite = nonInstaUrls[0]
    ? nonInstaUrls[0].trim()
    : websiteInput && !websiteInput.toLowerCase().includes('instagram.com') && !websiteInput.includes('@')
    ? websiteInput
    : '';

  if (!cleanInstagram) {
    const instaInUrls = urlsFound.find((u) => u.toLowerCase().includes('instagram.com'));
    if (instaInUrls) cleanInstagram = instaInUrls.trim();
  }

  // 4. Phone extraction: strip out emails and URLs from phone string
  let phoneStr = phoneInput;
  phoneStr = phoneStr.replace(emailRegex, '').replace(urlRegex, '').trim();
  phoneStr = phoneStr.replace(/^[,;\/\s\-\.]+/, '').replace(/[,;\/\s\-\.]+$ /, '');

  return {
    email: cleanEmail,
    phone: phoneStr,
    website: cleanWebsite,
    instagramUrl: cleanInstagram,
  };
}

// Parse Excel or CSV file buffer
export function parseExcelOrCsvBuffer(buffer: Buffer): {
  headers: string[];
  autoMapping: Record<string, string>;
  rowsRaw: any[];
  totalRows: number;
} {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rowsRaw: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  let headers: string[] = [];
  if (rowsRaw.length > 0) {
    headers = Object.keys(rowsRaw[0]);
  }

  const autoMapping = detectColumnMapping(headers);

  return {
    headers,
    autoMapping,
    rowsRaw,
    totalRows: rowsRaw.length,
  };
}

// Clean phone/email string helper
function cleanString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// Duplicate Detection Logic
export async function detectDuplicates(
  incomingItems: Partial<PartnerContactRecord>[]
): Promise<PartnerDbDuplicateItem[]> {
  const existingPartners = await getAllPartners();
  const existingContacts = await getAllPartnerContacts();

  const duplicates: PartnerDbDuplicateItem[] = [];

  incomingItems.forEach((incoming, idx) => {
    const comp = cleanString(incoming.companyName).toLowerCase();
    const brand = cleanString(incoming.brandName).toLowerCase();
    const repName = comp && comp !== '미지정 업체' ? comp : brand;
    const email = cleanString(incoming.email).toLowerCase();
    const phone = cleanString(incoming.phone).replace(/[^0-9]/g, '');
    const name = cleanString(incoming.contactName).toLowerCase();

    if (!repName && !email && !phone) return;

    let matchedPartner: PartnerRecord | undefined;
    let matchedContact: PartnerContactRecord | undefined;
    let matchReason = '';

    // Check exact email match
    if (email) {
      matchedContact = existingContacts.find((c) => cleanString(c.email).toLowerCase() === email);
      if (matchedContact) {
        matchReason = `이메일 일치 (${incoming.email})`;
      }
    }

    // Check company/brand + phone match
    if (!matchedContact && repName && phone && phone.length >= 7) {
      matchedContact = existingContacts.find((c) => {
        const cRep = (c.companyName && c.companyName !== '미지정 업체' ? c.companyName : c.brandName || '').toLowerCase();
        return cRep === repName && cleanString(c.phone).replace(/[^0-9]/g, '') === phone;
      });
      if (matchedContact) {
        matchReason = `기업/브랜드 & 전화번호 일치 (${repName} / ${incoming.phone})`;
      }
    }

    // Check company/brand + contact name match
    if (!matchedContact && repName && name) {
      matchedContact = existingContacts.find((c) => {
        const cRep = (c.companyName && c.companyName !== '미지정 업체' ? c.companyName : c.brandName || '').toLowerCase();
        return cRep === repName && cleanString(c.contactName).toLowerCase() === name;
      });
      if (matchedContact) {
        matchReason = `기업/브랜드 & 담당자명 일치 (${repName} / ${incoming.contactName})`;
      }
    }

    // Check company name match in Partners DB
    if (repName) {
      matchedPartner = existingPartners.find((p) => {
        const pRep = (p.companyName && p.companyName !== '미지정 업체' ? p.companyName : p.brandName || '').toLowerCase();
        return pRep === repName;
      });
    }

    if (matchedContact || matchedPartner) {
      duplicates.push({
        importIndex: idx,
        incoming,
        existingPartner: matchedPartner,
        existingContact: matchedContact,
        matchReason: matchReason || (matchedPartner ? `기존 등록 대표명 일치 (${matchedPartner.companyName || matchedPartner.brandName})` : '중복 후보 발견'),
        chosenAction: 'UPDATE', // Default recommendation
      });
    }
  });

  return duplicates;
}

// Batch Import with chosen action per row
export async function batchImportPartnersAndContacts(
  itemsWithActions: Array<{
    item: Partial<PartnerContactRecord>;
    action: DuplicateActionType;
    targetPartnerId?: string;
    targetContactId?: string;
  }>
): Promise<{ addedCount: number; updatedCount: number; skippedCount: number }> {
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const existingPartners = await getAllPartners();
  const existingContacts = await getAllPartnerContacts();

  for (const entry of itemsWithActions) {
    const { item, action, targetContactId } = entry;

    if (action === 'SKIP') {
      skippedCount++;
      continue;
    }

    let rawComp = cleanString(item.companyName);
    if (rawComp === '미지정 업체') rawComp = '';
    const brandName = cleanString(item.brandName);

    // Clean fields using parseAndCleanContactFields
    const cleanedContact = parseAndCleanContactFields({
      email: item.email,
      phone: item.phone,
      website: item.website,
      instagramUrl: item.instagramUrl,
    });

    const companyName = rawComp;
    const contactName = cleanString(item.contactName) || '담당자';
    const title = cleanString(item.title);
    const department = cleanString(item.department);
    const email = cleanedContact.email;
    const phone = cleanedContact.phone;
    const website = cleanedContact.website;
    const instagramUrl = cleanedContact.instagramUrl;
    const industry = cleanString(item.industry) || '기타';
    const internalOwner = cleanString(item.internalOwner) || '박서현';
    const recentDealNote = cleanString(item.recentDealNote);
    const notes = cleanString(item.notes);
    const source = cleanString(item.source) || '파일 업로드';

    // Target Partner identification
    const repName = (companyName || brandName).toLowerCase();
    let partner = existingPartners.find((p) => {
      const pRep = (p.companyName && p.companyName !== '미지정 업체' ? p.companyName : p.brandName || '').toLowerCase();
      return pRep === repName && repName.length > 0;
    });

    if (!partner) {
      partner = {
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        companyName,
        brandName,
        industry,
        website,
        instagramUrl,
        internalOwner,
        recentDealNote,
        notes,
        source,
        hasExistingInteraction: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await savePartnerRecord(partner);
      existingPartners.unshift(partner);
    } else {
      // Update partner with non-empty attributes if missing
      const updatedP: PartnerRecord = {
        ...partner,
        companyName: partner.companyName || companyName,
        brandName: partner.brandName || brandName,
        industry: partner.industry || industry,
        website: partner.website || website,
        instagramUrl: partner.instagramUrl || instagramUrl,
        internalOwner: partner.internalOwner || internalOwner,
        recentDealNote: recentDealNote || partner.recentDealNote,
        notes: notes ? `${partner.notes || ''}\n${notes}`.trim() : partner.notes,
        hasExistingInteraction: true,
        updatedAt: new Date().toISOString(),
      };
      await savePartnerRecord(updatedP);
    }

    if (action === 'UPDATE' && targetContactId) {
      const existingC = existingContacts.find((c) => c.id === targetContactId);
      if (existingC) {
        const updatedContact: PartnerContactRecord = {
          ...existingC,
          partnerId: partner.id,
          companyName: companyName || existingC.companyName,
          brandName: brandName || existingC.brandName,
          contactName: contactName || existingC.contactName,
          title: title || existingC.title,
          department: department || existingC.department,
          email: email || existingC.email,
          phone: phone || existingC.phone,
          website: website || existingC.website,
          instagramUrl: instagramUrl || existingC.instagramUrl,
          industry: industry || existingC.industry,
          internalOwner: internalOwner || existingC.internalOwner,
          recentDealNote: recentDealNote || existingC.recentDealNote,
          notes: notes ? `${existingC.notes || ''}\n${notes}`.trim() : existingC.notes,
          updatedAt: new Date().toISOString(),
        };
        await savePartnerContactRecord(updatedContact);
        updatedCount++;
        continue;
      }
    }

    // Otherwise ADD_NEW contact
    const newContact: PartnerContactRecord = {
      id: `pc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      partnerId: partner.id,
      companyName,
      brandName,
      contactName,
      title,
      department,
      email,
      phone,
      website,
      instagramUrl,
      industry,
      internalOwner,
      recentDealNote,
      notes,
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await savePartnerContactRecord(newContact);
    existingContacts.unshift(newContact);
    addedCount++;
  }

  return { addedCount, updatedCount, skippedCount };
}

// Utility: One-time or user-triggered cleanup of existing partner DB records (all 85+ records)
export async function cleanupExistingPartnerData(): Promise<{
  cleanedPartnersCount: number;
  cleanedContactsCount: number;
  message: string;
}> {
  const partners = await getAllPartners();
  const contacts = await getAllPartnerContacts();

  let cleanedPartnersCount = 0;
  let cleanedContactsCount = 0;

  for (const p of partners) {
    let modified = false;
    let newComp = p.companyName || '';
    if (newComp === '미지정 업체' && p.brandName) {
      newComp = '';
      modified = true;
    }

    const cleanedUrls = parseAndCleanContactFields({ website: p.website, instagramUrl: p.instagramUrl });
    if (cleanedUrls.website !== p.website || cleanedUrls.instagramUrl !== p.instagramUrl) {
      modified = true;
    }

    if (modified) {
      p.companyName = newComp;
      p.website = cleanedUrls.website;
      p.instagramUrl = cleanedUrls.instagramUrl;
      p.updatedAt = new Date().toISOString();
      await savePartnerRecord(p);
      cleanedPartnersCount++;
    }
  }

  for (const c of contacts) {
    let modified = false;
    let newComp = c.companyName || '';
    if (newComp === '미지정 업체' && c.brandName) {
      newComp = '';
      modified = true;
    }

    const cleaned = parseAndCleanContactFields({
      email: c.email,
      phone: c.phone,
      website: c.website,
      instagramUrl: c.instagramUrl,
    });

    if (
      cleaned.email !== c.email ||
      cleaned.phone !== c.phone ||
      cleaned.website !== c.website ||
      cleaned.instagramUrl !== c.instagramUrl
    ) {
      modified = true;
    }

    if (modified) {
      c.companyName = newComp;
      c.email = cleaned.email;
      c.phone = cleaned.phone;
      c.website = cleaned.website;
      c.instagramUrl = cleaned.instagramUrl;
      c.updatedAt = new Date().toISOString();
      await savePartnerContactRecord(c);
      cleanedContactsCount++;
    }
  }

  return {
    cleanedPartnersCount,
    cleanedContactsCount,
    message: `기존 DB 데이터 정리 완료: 파트너사 ${cleanedPartnersCount}건, 연락처 ${cleanedContactsCount}건 정리됨`,
  };
}

// Generate Excel Buffer for Export
export async function generatePartnerDbExcelBuffer(): Promise<Buffer> {
  const partners = await getAllPartners();
  const contacts = await getAllPartnerContacts();

  // Flatten contacts and partners into clean tabular rows
  const rows = contacts.map((c, idx) => {
    const parent = partners.find((p) => p.id === c.partnerId || p.companyName === c.companyName);
    return {
      'No.': idx + 1,
      '회사명': c.companyName || parent?.companyName || '',
      '브랜드명': c.brandName || parent?.brandName || '',
      '담당자명': c.contactName || '',
      '직급': c.title || '',
      '부서': c.department || '',
      '이메일': c.email || '',
      '전화번호': c.phone || '',
      '홈페이지': c.website || parent?.website || '',
      '업종': c.industry || parent?.industry || '',
      '담당자(내부)': c.internalOwner || parent?.internalOwner || '박서현',
      '최근 제휴 내용': c.recentDealNote || parent?.recentDealNote || '',
      '메모': c.notes || parent?.notes || '',
      '출처': c.source || parent?.source || '파트너 DB',
      '등록일': c.createdAt ? c.createdAt.split('T')[0] : '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '파트너_연락처_DB');

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}
