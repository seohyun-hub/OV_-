export interface OcrCandidateResult {
  companyName: string;
  brandName?: string;
  contactName: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  industry?: string;
  notes: string;
  rawText: string;
  candidates: {
    companyCandidates: string[];
    nameCandidates: string[];
    titleCandidates: string[];
    emailCandidates: string[];
    phoneCandidates: string[];
  };
  isUncertain: boolean;
}

export function parseBusinessCardRawText(rawText: string): OcrCandidateResult {
  if (!rawText) {
    return {
      companyName: '',
      contactName: '',
      title: '',
      department: '',
      email: '',
      phone: '',
      mobile: '',
      website: '',
      notes: '',
      rawText: '',
      candidates: {
        companyCandidates: [],
        nameCandidates: [],
        titleCandidates: [],
        emailCandidates: [],
        phoneCandidates: [],
      },
      isUncertain: true,
    };
  }

  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Email Extraction via Deterministic Regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emailMatches = Array.from(new Set(rawText.match(emailRegex) || []));
  const primaryEmail = emailMatches[0] || '';

  // 2. Phone Number Extraction via Deterministic Regex
  const mobileRegex = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g;
  const telRegex = /(?:02|0[3-9]\d{1,2}|1[568]\d{2})[-\s.]?\d{3,4}[-\s.]?\d{4}/g;
  
  const mobileMatches = Array.from(new Set(rawText.match(mobileRegex) || []));
  const telMatches = Array.from(new Set(rawText.match(telRegex) || []));
  const allPhoneMatches = Array.from(new Set([...mobileMatches, ...telMatches]));

  const primaryMobile = mobileMatches[0] || '';
  const primaryTel = telMatches.find((t) => !mobileMatches.includes(t)) || telMatches[0] || '';
  const primaryPhone = primaryMobile || primaryTel || '';

  // 3. Website / URL Extraction via Deterministic Regex
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?(?:\/[^\s]*)?/gi;
  const rawUrlMatches = rawText.match(urlRegex) || [];
  const urlMatches = Array.from(
    new Set(
      rawUrlMatches.filter((u) => {
        if (u.includes('@')) return false;
        if (/^\d+(\.\d+)+$/.test(u)) return false;
        return u.includes('.') && (u.startsWith('www') || u.startsWith('http') || u.endsWith('.com') || u.endsWith('.co.kr') || u.endsWith('.kr') || u.endsWith('.net') || u.endsWith('.org') || u.endsWith('.io'));
      })
    )
  );
  const primaryWebsite = urlMatches[0] || '';

  // 4. Title, Name, Department & Company Name Candidate Analysis
  const titleKeywords = [
    '대표이사', '대표', '총괄', '원장', '센터장', '본부장', '그룹장', '팀장', '실장', '국장', '부장', '차장', '과장', '대리', '주임', '사원',
    'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'Director', 'Managing Director', 'Manager', 'President', 'VP', 'Vice President',
    '고문', '자문', '교수', '연구원', '수석연구원', '책임연구원', '파트너', '매니저', '위원'
  ];

  const companyKeywords = [
    '(주)', '주식회사', '(유)', '유한회사', 'Inc', 'Corp', 'Co.', 'Ltd', 'GmbH', 'Group', '그룹',
    '스튜디오', '엔터테인먼트', '호텔', '리조트', '컨설팅', '미디어', '클럽', '홀딩스', '솔루션', '네트웍스', '랩', '소프트', '테크', '컴퍼니',
    '병원', '의원', '학원', '센터', '협회', '재단', '공사', '공단', '기획', '골프', '컨트리클럽', 'CC', 'C.C'
  ];

  const addressKeywords = ['서울', '경기', '인천', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '특별시', '광역시', '시', '구', '동', '길', '대로', '층', '호', '빌딩', '타워', '주소'];

  const nameCandidates: string[] = [];
  const titleCandidates: string[] = [];
  const companyCandidates: string[] = [];
  const departmentCandidates: string[] = [];
  const addressLines: string[] = [];

  let detectedName = '';
  let detectedTitle = '';
  let detectedDepartment = '';
  let detectedCompany = '';

  for (const line of lines) {
    if (emailMatches.some((e) => line.includes(e))) continue;
    if (allPhoneMatches.some((p) => line.includes(p))) continue;
    if (urlMatches.some((u) => line.includes(u))) continue;

    if (addressKeywords.some((ak) => line.includes(ak)) && (line.includes('구') || line.includes('대로') || line.includes('길') || line.includes('층') || line.includes('빌딩'))) {
      addressLines.push(line);
      continue;
    }

    if (companyKeywords.some((ck) => line.includes(ck))) {
      companyCandidates.push(line);
      if (!detectedCompany) detectedCompany = line;
      continue;
    }

    let hasTitle = false;
    for (const tk of titleKeywords) {
      if (line.includes(tk)) {
        hasTitle = true;
        titleCandidates.push(tk);
        if (!detectedTitle) detectedTitle = tk;

        const nameMatch = line.replace(tk, '').trim();
        const hangulNameMatch = nameMatch.match(/[가-힣]{2,4}/);
        if (hangulNameMatch) {
          nameCandidates.push(hangulNameMatch[0]);
          if (!detectedName) detectedName = hangulNameMatch[0];
        } else if (nameMatch.length >= 2 && nameMatch.length <= 20) {
          nameCandidates.push(nameMatch);
          if (!detectedName) detectedName = nameMatch;
        }

        const deptMatch = line.match(/([가-힣a-zA-Z\s]+(?:팀|부|본부|실|그룹|센터|사업부))/);
        if (deptMatch) {
          departmentCandidates.push(deptMatch[1].trim());
          if (!detectedDepartment) detectedDepartment = deptMatch[1].trim();
        }
        break;
      }
    }

    if (!hasTitle) {
      const cleanLine = line.replace(/[^가-힣a-zA-Z0-9\s()]/g, '').trim();
      if (/^[가-힣]{2,4}$/.test(cleanLine)) {
        nameCandidates.push(cleanLine);
        if (!detectedName) detectedName = cleanLine;
      } else if (cleanLine.length >= 2 && cleanLine.length <= 30) {
        companyCandidates.push(cleanLine);
        if (!detectedCompany && lines.indexOf(line) <= 2) {
          detectedCompany = cleanLine;
        }
      }
    }
  }

  if (!detectedCompany && lines.length > 0) {
    detectedCompany = lines[0];
    if (!companyCandidates.includes(lines[0])) {
      companyCandidates.unshift(lines[0]);
    }
  }

  const isUncertain = !detectedName || !detectedCompany || !primaryEmail;

  return {
    companyName: detectedCompany,
    contactName: detectedName,
    title: detectedTitle,
    department: detectedDepartment,
    email: primaryEmail,
    phone: primaryTel || primaryPhone,
    mobile: primaryMobile,
    website: primaryWebsite,
    notes: addressLines.join(' '),
    rawText: rawText,
    candidates: {
      companyCandidates: Array.from(new Set(companyCandidates)),
      nameCandidates: Array.from(new Set(nameCandidates)),
      titleCandidates: Array.from(new Set(titleCandidates)),
      emailCandidates: emailMatches,
      phoneCandidates: allPhoneMatches,
    },
    isUncertain,
  };
}
