import React, { useState, useEffect } from 'react';
import { TargetCandidateItem, PartnerTargetInput } from '../types';
import {
  Search,
  Building2,
  FileText,
  ExternalLink,
  Sparkles,
  Loader2,
  ArrowRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Globe,
  Compass,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface PartnerTargetListViewProps {
  onAnalyzeCompany?: (companyName: string) => void;
  onStartPartnershipWithCompany?: (companyName: string, projectContext?: PartnerTargetInput) => void;
  onNavigateToPipeline?: () => void;
}

const SCOPE_OPTIONS = [
  { value: '신생·라이징', label: '신생·라이징 (우선)', desc: '와디즈, 팝업, 신생 D2C 등 루키 브랜드' },
  { value: '전체', label: '전체 규모', desc: '신생 4개, D2C 2개, 스타트업 2개, 대기업 최대 2개' },
  { value: '스타트업', label: '스타트업', desc: '혁신 기술 및 제품 기반 벤처 기업' },
  { value: '대기업·유명 브랜드', label: '대기업·유명 브랜드', desc: '검증된 대기업 및 시장 리딩 브랜드' },
];

const INDUSTRY_OPTIONS = [
  '전체',
  '식음료',
  '스포츠·골프',
  '패션',
  '뷰티·헬스',
  '자동차',
  '금융',
  'IT·플랫폼',
  '여행·레저',
  '기타',
];

const COLLAB_TYPE_OPTIONS = [
  '전체',
  '스폰서십',
  '현물 협찬',
  '공동 이벤트',
  '클래스·콘텐츠',
  '회원 혜택',
  '공간 팝업',
  '기타',
];

const SUPPORT_TYPE_OPTIONS = [
  '전체',
  '현금 협찬 중심',
  '물품 협찬 중심',
  '공동 기획 중심',
];

const PRESET_QUERIES = [
  '12월 러닝대회 식음료·스포츠 협찬',
  '골프 고객에게 체험시킬 새로운 브랜드',
  '40~60대 여성 클래스 협업 신생 브랜드',
  '아이와 함께하는 리조트 프로그램 브랜드',
  '겨울 야외 행사에 어울리는 F&B 브랜드',
];

const SAVED_STORAGE_KEY = 'oak_valley_saved_partner_candidates';

export const PartnerTargetListView: React.FC<PartnerTargetListViewProps> = ({
  onAnalyzeCompany,
  onStartPartnershipWithCompany,
}) => {
  // Input States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discoveryScope, setDiscoveryScope] = useState<string>('신생·라이징');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('전체');
  const [selectedCollabType, setSelectedCollabType] = useState<string>('전체');
  const [selectedSupportType, setSelectedSupportType] = useState<string>('전체');

  // Search Status & Result States
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<TargetCandidateItem[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string>('');
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [seenBrands, setSeenBrands] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved Candidates State
  const [savedCandidateIds, setSavedCandidateIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [dbContacts, setDbContacts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/partners')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setDbContacts(data.contacts || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedCandidateIds));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  }, [savedCandidateIds]);

  const toggleSaveCandidate = (cand: TargetCandidateItem) => {
    const key = cand.brandName || cand.companyName;
    setSavedCandidateIds((prev) => {
      const exists = prev.includes(key);
      const updated = exists ? prev.filter((k) => k !== key) : [...prev, key];
      setToastMessage(exists ? `[${key}] 보관함에서 삭제되었습니다.` : `[${key}] 제휴 후보로 보관되었습니다.`);
      setTimeout(() => setToastMessage(null), 2500);
      return updated;
    });
  };

  const executeSearch = async (
    queryText: string,
    scope = discoveryScope,
    ind = selectedIndustry,
    collab = selectedCollabType,
    supp = selectedSupportType,
    offset = 0,
    accumulate = false
  ) => {
    const q = queryText.trim();
    if (!q) {
      setError('하고 싶은 제휴를 입력해 주세요.');
      return;
    }

    if (offset === 0) {
      setLoading(true);
      setError(null);
      setLastSubmittedQuery(q);
      setShowSavedOnly(false);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch('/api/discover-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          scope,
          discoveryScope: scope,
          industry: ind,
          collaborationType: collab,
          supportType: supp,
          offset,
          limit: 10,
          excludedBrands: accumulate ? seenBrands : [],
          forceRefresh: offset > 0,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data && data.success && data.result) {
        const newCands: TargetCandidateItem[] = data.result.candidates || [];
        const newBrandNames = newCands.map((c) => c.brandName || c.companyName);

        if (accumulate) {
          setCandidates((prev) => [...prev, ...newCands]);
          setSeenBrands((prev) => Array.from(new Set([...prev, ...newBrandNames])));
          setCurrentOffset(offset);
          setToastMessage(`새로운 신생 브랜드 ${newCands.length}개를 추가 발굴했습니다.`);
          setTimeout(() => setToastMessage(null), 3000);
        } else {
          setCandidates(newCands);
          setSeenBrands(newBrandNames);
          setCurrentOffset(0);
          setHasSearched(true);
        }
      } else {
        setError(data?.error || '검색 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('[PartnerTarget] Search error:', err);
      setError('검색 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handlePresetClick = (preset: string) => {
    setSearchQuery(preset);
    executeSearch(preset);
  };

  const handleLoadMoreBrands = () => {
    if (!lastSubmittedQuery || loading || loadingMore) return;
    executeSearch(
      lastSubmittedQuery,
      discoveryScope,
      selectedIndustry,
      selectedCollabType,
      selectedSupportType,
      currentOffset + 1,
      true
    );
  };

  const handleCreateProposal = (cand: TargetCandidateItem) => {
    const targetName = cand.brandName || cand.companyName;
    const projectContext: PartnerTargetInput = {
      projectName: lastSubmittedQuery || '제휴 프로젝트',
      projectType: cand.industry || selectedIndustry || '제휴',
      eventDate: '',
      location: '오크밸리 및 파크로쉬',
      expectedParticipants: '',
      targetCustomer: cand.whatItDoes || '',
      requiredPartnershipTypes: selectedCollabType !== '전체' ? [selectedCollabType] : ['스폰서십'],
      desiredCashSponsorship: 0,
    };

    if (onStartPartnershipWithCompany) {
      onStartPartnershipWithCompany(targetName, projectContext);
    } else if (onAnalyzeCompany) {
      onAnalyzeCompany(targetName);
    }
  };

  const displayedCandidates = showSavedOnly
    ? candidates.filter((c) => savedCandidateIds.includes(c.brandName || c.companyName))
    : candidates;

  const renderScaleBadge = (scale?: string) => {
    switch (scale) {
      case '신생·라이징':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-2xs text-[11px] font-bold bg-[#FAF2EB] text-[#8C4A28] border border-[#EACBB8]">
            <Sparkles className="w-3 h-3 text-[#D96B27]" />
            <span>신생·라이징</span>
          </span>
        );
      case '스타트업':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-2xs text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span>스타트업</span>
          </span>
        );
      case '중소브랜드':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-2xs text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span>중소·D2C</span>
          </span>
        );
      case '대기업':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-2xs text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>대기업</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-2xs text-[11px] font-bold bg-[#FAF8F5] text-[#736152] border border-[#E8E4DC]">
            <span>신생·라이징</span>
          </span>
        );
    }
  };

  const renderSourceBadge = (source?: string, type?: string) => {
    const sText = source || '신규 발굴 매체';
    const isWadiz = sText.toLowerCase().includes('wadiz') || sText.includes('와디즈') || type === 'wadiz';
    const isPopup = sText.includes('팝업') || type === 'popup';
    const isStartup = sText.includes('스타트업') || type === 'startup';

    if (isWadiz) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
          <span>{sText}</span>
        </span>
      );
    }
    if (isPopup) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{sText}</span>
        </span>
      );
    }
    if (isStartup) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{sText}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-2xs text-[11px] font-semibold bg-[#FAF8F5] text-[#736152] border border-[#E8E4DC]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8C7A6B] shrink-0" />
        <span>{sText}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2C2C] text-white px-4 py-2.5 rounded-xs text-xs font-medium shadow-lg flex items-center space-x-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Main Search Box */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 sm:p-8 space-y-6 shadow-2xs">
        {/* Title & Description */}
        <div className="border-b border-[#F0ECE1] pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#736152] text-white rounded-2xs tracking-wider">
              RISING BRAND DISCOVERY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2C2C] mt-2">
            파트너 타깃 찾기
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1 font-sans">
            이미 아는 유명 대기업 대신, 아직 모르는 실제 <strong>신규·신생·라이징 브랜드</strong>(와디즈 펀딩, 성수 팝업, 루키 D2C, 혁신 스타트업)를 발굴합니다.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Input Field */}
          <div className="relative flex flex-col sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="예) 12월 러닝대회에 함께할 식음료·스포츠 브랜드를 찾아줘"
              className="w-full pl-11 sm:pl-12 pr-4 sm:pr-40 py-3.5 text-sm sm:text-base bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:outline-none focus:bg-white focus:border-[#736152] focus:ring-1 focus:ring-[#736152] text-[#2C2C2C] placeholder:text-[#999999] font-medium shadow-2xs min-h-[50px]"
            />
            <Search className="w-5 h-5 text-[#8C7A6B] absolute left-3.5 sm:left-4 top-4" />
            <button
              id="partner-target-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-6 py-3 sm:py-0 bg-[#736152] text-white hover:bg-[#5C4E43] text-xs sm:text-xs font-semibold rounded-2xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] sm:min-h-0 shadow-2xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>탐색 중...</span>
                </>
              ) : (
                <>
                  <span>파트너 찾기</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Requirement 2: 발굴 범위 Filter (신생·라이징 기본값) */}
          <div className="space-y-2 pt-1 border-t border-[#F0ECE1]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5C4E43] flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-[#736152]" />
                <span>발굴 범위 (Discovery Scope)</span>
              </label>
              <span className="text-[11px] text-[#8C7A6B]">
                {discoveryScope === '신생·라이징' ? '✨ 신규 론칭, 와디즈 펀딩, 성수 팝업 루키 브랜드 우선' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SCOPE_OPTIONS.map((opt) => {
                const isSelected = discoveryScope === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDiscoveryScope(opt.value)}
                    className={`px-3 py-2.5 rounded-2xs text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#736152] text-white border-[#736152] shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#444444] border-[#E8E4DC] hover:border-[#736152] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{opt.label}</div>
                    <div className={`text-[10px] mt-0.5 leading-tight truncate ${isSelected ? 'text-stone-200' : 'text-[#8C7A6B]'}`}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Selectable Filters: 분야 / 협업 방식 / 희망 지원 형태 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#F0ECE1]">
            {/* 1. 분야 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C4E43]">분야</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs text-[#2C2C2C] font-medium focus:outline-none focus:border-[#736152] focus:bg-white"
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '전체' ? '분야: 전체' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. 협업 방식 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C4E43]">협업 방식</label>
              <select
                value={selectedCollabType}
                onChange={(e) => setSelectedCollabType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs text-[#2C2C2C] font-medium focus:outline-none focus:border-[#736152] focus:bg-white"
              >
                {COLLAB_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '전체' ? '협업 방식: 전체' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. 희망 지원 형태 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C4E43]">희망 지원 형태</label>
              <select
                value={selectedSupportType}
                onChange={(e) => setSelectedSupportType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs text-[#2C2C2C] font-medium focus:outline-none focus:border-[#736152] focus:bg-white"
              >
                {SUPPORT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '전체' ? '지원 형태: 전체' : opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="pt-2 border-t border-[#F0ECE1]">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-[#8C7A6B] font-mono mr-1">
                추천 탐색 예시:
              </span>
              {PRESET_QUERIES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-2.5 py-1 text-xs border rounded-2xs transition-colors cursor-pointer ${
                    searchQuery === preset
                      ? 'bg-[#736152] text-white border-[#736152] font-semibold'
                      : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:border-[#736152] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* 2. Loading State View */}
      {loading && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-10 sm:p-14 text-center space-y-4 shadow-2xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF8F5] text-[#736152] border border-[#E8E4DC] mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-[#736152]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-bold text-[#2C2C2C]">
              와디즈 펀딩, 신규 팝업, 스타트업 매체에서 신생 브랜드를 발굴 중입니다…
            </h3>
            <p className="text-xs text-[#8C7A6B]">
              대기업 반복 추천을 차단하고 실제 실존하는 라이징 파트너를 분석하고 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="bg-white border border-rose-200 rounded-xs p-6 text-center space-y-2 shadow-2xs">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <p className="text-xs text-[#666666]">
            다른 검색어를 입력하시거나 발굴 범위를 변경하여 다시 탐색해 보세요.
          </p>
        </div>
      )}

      {/* Initial Empty State Before Any Search */}
      {!loading && !hasSearched && !error && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-10 sm:p-12 text-center space-y-3 shadow-2xs">
          <div className="w-10 h-10 bg-[#FAF8F5] text-[#736152] rounded-full flex items-center justify-center mx-auto border border-[#E8E4DC]">
            <Sparkles className="w-5 h-5 text-[#736152]" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#2C2C2C]">
            궁금한 제휴 아이디어를 자유롭게 입력해 보세요
          </h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            행사명, 타깃 고객, 필요한 협찬 품목 등 원하는 제휴 내용을 문장으로 입력하면
            뻔한 대기업이 아닌, 참신하고 실존하는 신생·라이징 브랜드를 발굴해 드립니다.
          </p>
        </div>
      )}

      {/* 3. Results Screen View */}
      {!loading && hasSearched && (
        <div className="space-y-5">
          {/* Top Summary Bar */}
          <div className="bg-white border border-[#E8E4DC] rounded-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-[#8C7A6B]">제휴 목적:</span>
                <span className="text-sm font-bold text-[#2C2C2C] font-serif">
                  "{lastSubmittedQuery}"
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C4E43]">
                <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs text-[11px] font-medium">
                  발굴 범위: <strong>{discoveryScope}</strong>
                </span>
                <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs text-[11px]">
                  분야: {selectedIndustry}
                </span>
                <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs text-[11px]">
                  협업: {selectedCollabType}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {/* Saved Candidates Filter Toggle */}
              {savedCandidateIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={`px-3 py-1 text-xs font-semibold rounded-2xs border transition-colors flex items-center space-x-1 cursor-pointer ${
                    showSavedOnly
                      ? 'bg-[#736152] text-white border-[#736152]'
                      : 'bg-white text-[#5C4E43] border-[#D9D3C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>보관함 ({savedCandidateIds.length})</span>
                </button>
              )}

              <span className="px-3 py-1 bg-[#736152] text-white text-xs font-bold rounded-2xs">
                발굴된 브랜드 {displayedCandidates.length}개
              </span>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {displayedCandidates.length === 0 ? (
            <div className="bg-white border border-[#E8E4DC] rounded-xs p-10 text-center space-y-2 text-xs text-[#8C7A6B]">
              <p>
                {showSavedOnly
                  ? '현재 보관된 제휴 후보 브랜드가 없습니다.'
                  : '현재 조건에서 확인 가능한 결과가 없습니다.'}
              </p>
              <p>검색어를 보다 넓게 입력하거나 발굴 범위를 변경해 보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedCandidates.map((cand) => {
                const bKey = cand.brandName || cand.companyName;
                const isSaved = savedCandidateIds.includes(bKey);

                const candC = (cand.companyName || '').toLowerCase().trim();
                const candB = (cand.brandName || '').toLowerCase().trim();

                const dbMatch = dbContacts.find((c) => {
                  const cComp = (c.companyName || '').toLowerCase().trim();
                  const cBrand = (c.brandName || '').toLowerCase().trim();
                  return (
                    (candC && cComp && (cComp.includes(candC) || candC.includes(cComp))) ||
                    (candB && cBrand && (cBrand.includes(candB) || candB.includes(cBrand)))
                  );
                });

                return (
                  <div
                    key={cand.id}
                    className="bg-white border border-[#E8E4DC] rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs hover:border-[#736152] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Card Header: Brand Name, Scale Tag, Industry & Save Button */}
                      <div className="flex items-start justify-between gap-2 border-b border-[#F0ECE1] pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <h3 className="text-lg font-bold font-serif text-[#2C2C2C]">
                              {cand.brandName || cand.companyName}
                            </h3>
                            {cand.companyName && cand.companyName !== cand.brandName && (
                              <span className="text-xs font-medium text-[#8C7A6B]">
                                ({cand.companyName})
                              </span>
                            )}
                            {renderScaleBadge(cand.scaleCategory)}
                          </div>

                          <div className="flex items-center space-x-2 flex-wrap gap-1 pt-0.5">
                            <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#5C4E43] border border-[#E8E4DC] text-[11px] font-semibold rounded-2xs">
                              {cand.industry}
                            </span>
                            {/* Requirement 4: Partner DB existing contact badge */}
                            {dbMatch && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold rounded-2xs flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>기존 접점 있음 ({dbMatch.contactName || dbMatch.companyName})</span>
                              </span>
                            )}
                            {/* Requirement 10: Existing Deal in Pipeline Badge */}
                            {cand.isExistingDeal && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold rounded-2xs flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>이미 제휴 검토 중 ({cand.existingDealStage || '진행'})</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Save Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => toggleSaveCandidate(cand)}
                          title={isSaved ? '제휴 후보 보관 취소' : '제휴 후보로 저장'}
                          className={`p-2 rounded-2xs border transition-colors cursor-pointer shrink-0 ${
                            isSaved
                              ? 'bg-[#736152] text-white border-[#736152]'
                              : 'bg-white text-[#8C7A6B] border-[#D9D3C7] hover:border-[#736152] hover:text-[#736152]'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-200" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* 1. 뭐 하는 브랜드인가 (1~2줄) */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#5C4E43] block">
                          ■ 뭐 하는 브랜드인가
                        </span>
                        <p className="text-xs text-[#333333] leading-relaxed bg-[#FAF8F5] p-2.5 rounded-2xs border border-[#F0ECE1] font-medium">
                          {cand.whatItDoes || cand.whyRecommended || '차별화된 콘셉트와 기술력으로 주목받고 있는 브랜드'}
                        </p>
                      </div>

                      {/* 2. 왜 지금 발견됐나 (실제 최근 활동 또는 제품/펀딩/팝업 근거) */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#5C4E43] block">
                          ■ 왜 지금 발견됐나
                        </span>
                        <p className="text-xs text-[#555555] leading-relaxed">
                          {cand.whyDiscoveredNow || cand.recentActivity || '최근 온·오프라인 펀딩 및 팝업, 신제품 론칭으로 고객 반응이 뜨거움'}
                        </p>
                      </div>

                      {/* 3. 우리와 해볼 만한 것 (1~2개) */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#736152] block">
                          ■ 우리와 해볼 만한 것
                        </span>
                        <div className="bg-[#F7F4EE] p-2.5 rounded-2xs border border-[#D9D3C7] space-y-1">
                          {Array.isArray(cand.collaborationIdeas) && cand.collaborationIdeas.length > 0 ? (
                            cand.collaborationIdeas.map((idea, iIdx) => (
                              <div key={iIdx} className="text-xs text-[#2C2C2C] font-medium flex items-start space-x-1.5">
                                <span className="text-[#736152] font-bold shrink-0">·</span>
                                <span>{idea}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed">
                              {cand.recommendedDirection || '행사 참가자 대상 제품 체험 및 공동 브랜딩 프로모션'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4. 발견 출처 (Source) & 공식 홈페이지 */}
                      <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] text-[#8C7A6B] font-medium">발견 출처:</span>
                          {renderSourceBadge(cand.discoverySource, cand.discoverySourceType)}
                        </div>

                        {cand.officialWebsite && (
                          <a
                            href={cand.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs text-[#736152] hover:text-[#5C4E43] font-semibold underline underline-offset-2"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>공식 웹사이트</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 2 Action Buttons */}
                    <div className="pt-3 border-t border-[#F0ECE1] grid grid-cols-2 gap-2 mt-4">
                      {/* Button 1: [기업 상세 분석] */}
                      <button
                        type="button"
                        onClick={() => onAnalyzeCompany && onAnalyzeCompany(cand.companyName || cand.brandName || '')}
                        className="w-full py-2.5 px-3 bg-white hover:bg-[#FAF8F5] border border-[#D9D3C7] text-[#2C2C2C] text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px]"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#736152]" />
                        <span>기업 상세 분석</span>
                      </button>

                      {/* Button 2: [제안서 작성 시작] */}
                      <button
                        type="button"
                        onClick={() => handleCreateProposal(cand)}
                        className="w-full py-2.5 px-3 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer min-h-[40px] shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-200" />
                        <span>제안서 작성 시작</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Requirement 5: [다른 브랜드 더 찾아보기] 버튼 */}
          {!showSavedOnly && displayedCandidates.length > 0 && (
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleLoadMoreBrands}
                disabled={loadingMore}
                className="px-6 py-3.5 bg-white hover:bg-[#FAF8F5] border-2 border-[#736152] text-[#736152] hover:text-[#5C4E43] text-xs sm:text-sm font-bold rounded-2xs transition-all shadow-xs flex items-center justify-center space-x-2 mx-auto cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#736152]" />
                    <span>새로운 실존 브랜드를 추가 발굴하고 있습니다…</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#736152]" />
                    <span>다른 브랜드 더 찾아보기</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#8C7A6B] mt-2">
                기존 결과를 재정렬하지 않고, 이미 노출된 브랜드를 제외한 새로운 실존 브랜드를 추가 탐색합니다.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
