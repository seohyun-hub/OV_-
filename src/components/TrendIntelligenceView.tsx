import React, { useState, useEffect } from 'react';
import { TrendReport, TrendFilter, KeyTrend, TrendRadarItem } from '../types';
import {
  Search, Filter, TrendingUp, Building2, Lightbulb,
  ArrowRight, ShieldCheck, RefreshCw, Download, Sparkles,
  ExternalLink, Bookmark, BookmarkCheck, CheckCircle2,
  Calendar, Layers, Radio, Globe, ChevronRight, Info, AlertTriangle
} from 'lucide-react';
import { exportTrendReportToPPTX } from '../utils/pptExporter';

interface TrendIntelligenceViewProps {
  report: TrendReport | null;
  loading: boolean;
  error?: string | null;
  onSearch: (query: string, filter?: Partial<TrendFilter>, forceRefresh?: boolean) => void;
  onAnalyzeCompany: (companyName: string) => void;
  onCreatePartnershipProposal?: (companyName: string) => void;
  onNavigateToKnowledge?: () => void;
}

const BROAD_CATEGORIES: TrendFilter['category'][] = [
  '전체',
  'AI·테크',
  '소비 트렌드',
  '유통·리테일',
  'F&B',
  '뷰티',
  '헬스케어·의료기기',
  '패션',
  '스포츠·러닝·골프',
  '금융',
  '자동차·모빌리티',
  '콘텐츠·엔터테인먼트',
  '공간·팝업',
  '여행',
  '웰니스',
  '라이프스타일',
  '문화·예술',
  '키즈·교육',
  '시니어',
  '반려동물',
  '스타트업·신사업',
];

const PRESET_QUERIES = [
  '요즘 뜨는 소비 트렌드',
  'AI 신사업',
  '웰니스·헬스케어',
  'F&B 팝업',
  '러닝·스포츠',
  '시니어 비즈니스',
  '반려동물 시장',
  '공간·팝업 트렌드',
  '친환경·지속가능성',
];

const LOCAL_STORAGE_SAVED_TRENDS_KEY = 'ipark_saved_trend_discovery_items';

export const TrendIntelligenceView: React.FC<TrendIntelligenceViewProps> = ({
  report,
  loading,
  error,
  onSearch,
  onAnalyzeCompany,
  onCreatePartnershipProposal,
  onNavigateToKnowledge,
}) => {
  const [searchInput, setSearchInput] = useState(report?.query || '');
  const [filterPeriod, setFilterPeriod] = useState<TrendFilter['period']>('최근 7일');
  const [filterRegion, setFilterRegion] = useState<TrendFilter['region']>('한국');
  const [filterCategory, setFilterCategory] = useState<TrendFilter['category']>('전체');
  const [showFilters, setShowFilters] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'current' | 'saved'>('current');
  const [selectedLocalCategory, setSelectedLocalCategory] = useState<string>('전체');

  // Saved/Bookmarked Trends (Decoupled Archive)
  const [savedTrends, setSavedTrends] = useState<KeyTrend[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_TRENDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (report?.query) {
      setSearchInput(report.query);
    }
    if (report?.filters?.period) {
      setFilterPeriod(report.filters.period);
    }
    if (report?.filters?.category) {
      setFilterCategory(report.filters.category);
    }
  }, [report?.query, report?.filters]);

  const toggleSaveTrend = (trend: KeyTrend) => {
    setSavedTrends((prev) => {
      const exists = prev.some((item) => item.title === trend.title);
      let updated: KeyTrend[];
      if (exists) {
        updated = prev.filter((item) => item.title !== trend.title);
      } else {
        updated = [trend, ...prev];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_TRENDS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save trend to localStorage:', err);
      }
      return updated;
    });
  };

  const isTrendSaved = (trend: KeyTrend) => {
    return savedTrends.some((item) => item.title === trend.title);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveViewTab('current');
      onSearch(
        searchInput.trim(),
        {
          period: filterPeriod,
          region: filterRegion,
          category: filterCategory,
        },
        false
      );
    }
  };

  const handleForceRefresh = () => {
    if (searchInput.trim()) {
      setActiveViewTab('current');
      onSearch(
        searchInput.trim(),
        {
          period: filterPeriod,
          region: filterRegion,
          category: filterCategory,
        },
        true
      );
    }
  };

  const handlePresetClick = (q: string) => {
    setSearchInput(q);
    setActiveViewTab('current');
    onSearch(
      q,
      {
        period: filterPeriod,
        region: filterRegion,
        category: filterCategory,
      },
      false
    );
  };

  const [selectedSection, setSelectedSection] = useState<string>('전체');
  const [selectedSubDimension, setSelectedSubDimension] = useState<string>('전체');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // URL Helper functions to enforce strict article URL vs official homepage separation
  const isSpecificArticleUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || !trimmed.startsWith('http')) return false;
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname.includes('google.com') && parsed.pathname.includes('/search')) return false;
      const cleanPath = parsed.pathname.replace(/\/$/, '');
      if (!cleanPath || cleanPath === '' || cleanPath === '/index.html' || cleanPath === '/index.php') return false;
      return true;
    } catch {
      return false;
    }
  };

  const isValidOfficialUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || !trimmed.startsWith('http')) return false;
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  };

  // Reset pagination on report change
  useEffect(() => {
    setVisibleCount(12);
    setSelectedSection('전체');
    setSelectedSubDimension('전체');
  }, [report?.query]);

  // Filter key trends locally by category, section, sub-dimension
  const allKeyTrends = report?.keyTrends || [];

  const filteredKeyTrends = allKeyTrends.filter((trend) => {
    if (selectedLocalCategory !== '전체' && trend.category !== selectedLocalCategory) return false;
    if (selectedSection !== '전체' && trend.section !== selectedSection) return false;
    if (selectedSubDimension !== '전체' && trend.subDimension !== selectedSubDimension) return false;
    return true;
  });

  const displayedKeyTrends = filteredKeyTrends.slice(0, visibleCount);
  const hasMoreTrends = filteredKeyTrends.length > visibleCount;

  const uniqueCategories = Array.from(
    new Set(allKeyTrends.map((t) => t.category).filter(Boolean))
  );

  const detectedSubDimensions = report?.detectedSubDimensions && report.detectedSubDimensions.length > 0
    ? report.detectedSubDimensions
    : Array.from(new Set(allKeyTrends.map((t) => t.subDimension).filter(Boolean)));

  const ALL_SECTIONS = [
    '전체',
    '업계 핵심 변화',
    '주요 브랜드/기업 움직임',
    '골프장/리조트 사례',
    '기술/서비스',
    '소비자 변화',
    '제휴 아이디어',
  ];

  const getSourceTypeBadge = (sourceType?: string) => {
    switch (sourceType) {
      case '공식자료':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case '리서치':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case '언론':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Trend Discovery':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Search Bar */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 sm:p-7 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#736152] text-white rounded-2xs tracking-wider">
                TREND DISCOVERY
              </span>
              <span className="text-[11px] text-[#8C7A6B] font-sans">
                사회·소비·범산업 트렌드 탐색 & IPARK리조트 기회 발굴
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2C2C] mt-1.5">
              트렌드 탐색
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-sans max-w-3xl leading-relaxed">
              사회·소비·산업 전반에서 새롭게 나타나는 최신 트렌드를 폭넓게 발견하고,
              IPARK리조트에 적용 가능한 실질적 협업·공간 기회를 발굴합니다.
            </p>
          </div>

          {report && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleForceRefresh}
                disabled={loading}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#5C4E43] border border-[#D9D3C7] rounded-2xs text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                title="캐시를 무시하고 최신 검색 수행"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>새로고침</span>
              </button>

              <button
                type="button"
                onClick={() => exportTrendReportToPPTX(report)}
                className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-2xs text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>보고서 다운로드</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:block">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="사회·소비·산업 트렌드를 검색하세요 (예: 요즘 40대 소비, AI 신사업, 웰니스 팝업)"
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-40 py-3.5 text-sm sm:text-base bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:outline-none focus:bg-white focus:border-[#736152] focus:ring-1 focus:ring-[#736152] text-[#2C2C2C] placeholder:text-[#999999] font-medium shadow-2xs min-h-[48px]"
            />
            <Search className="w-5 h-5 text-[#8C7A6B] absolute left-3.5 sm:left-4 top-3.5 sm:top-4" />
            <button
              id="trend-discovery-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-5 py-3 sm:py-0 bg-[#736152] text-white hover:bg-[#5C4E43] text-xs sm:text-xs font-semibold rounded-2xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] sm:min-h-0 shadow-2xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" />
                  <span>탐색 중...</span>
                </>
              ) : (
                <>
                  <span>트렌드 탐색하기</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#8C7A6B] font-mono mr-1">추천 탐색어:</span>
            {PRESET_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handlePresetClick(q)}
                className={`px-2.5 py-1 text-xs border rounded-2xs transition-all cursor-pointer ${
                  report?.query === q
                    ? 'bg-[#736152] text-white border-[#736152] font-medium'
                    : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:border-[#736152] hover:bg-[#FAF8F5]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Filters Accordion Toggle */}
          <div className="pt-2 border-t border-[#F0ECE1]">
            <div
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#5C4E43]">
                <Filter className="w-3.5 h-3.5 text-[#736152]" />
                <span>검색 필터 (기간: {filterPeriod} · 카테고리: {filterCategory} · 지역: {filterRegion})</span>
              </div>
              <span className="text-xs text-[#8C7A6B]">{showFilters ? '접기 ▲' : '필터 변경 ▼'}</span>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs bg-[#FAF8F5] p-3.5 rounded-2xs border border-[#E8E4DC] mt-2">
                {/* 1. Period */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#736152]" />
                    <span>최신성 (우선순위)</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(['최근 7일', '최근 30일', '최근 90일', '최근 1개월', '최근 3개월', '최근 1년'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFilterPeriod(p)}
                        className={`px-2.5 py-1 text-xs border rounded-2xs transition-colors ${
                          filterPeriod === p
                            ? 'bg-[#736152] text-white border-[#736152] font-semibold'
                            : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] block">
                    * 최근 7일 내 변화를 1순위로 탐색하며, 필요 시 30일/90일로 확장
                  </span>
                </div>

                {/* 2. Category */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-[#736152]" />
                    <span>범산업 카테고리 (전체 기본)</span>
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D9D3C7] rounded-2xs text-[#2C2C2C] font-medium focus:outline-none focus:border-[#736152]"
                  >
                    {BROAD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#8C7A6B] block">
                    * 20여 개 범산업 영역을 편중 없이 탐색합니다
                  </span>
                </div>

                {/* 3. Region */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-[#736152]" />
                    <span>지역</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {(['한국', '글로벌', '미국', '일본'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFilterRegion(r)}
                        className={`px-2.5 py-1 text-xs border rounded-2xs transition-colors ${
                          filterRegion === r
                            ? 'bg-[#736152] text-white border-[#736152] font-semibold'
                            : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Tabs: Current Search vs. Saved Archive */}
      <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('current')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-2xs transition-colors ${
              activeViewTab === 'current'
                ? 'bg-[#736152] text-white shadow-2xs'
                : 'text-[#5C4E43] hover:bg-[#FAF8F5]'
            }`}
          >
            최신 탐색 결과 {report ? `(${report.keyTrends?.length || 0}건)` : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('saved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1.5 ${
              activeViewTab === 'saved'
                ? 'bg-[#736152] text-white shadow-2xs'
                : 'text-[#5C4E43] hover:bg-[#FAF8F5]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>저장된 트렌드 아카이브 ({savedTrends.length}건)</span>
          </button>
        </div>

        {report && activeViewTab === 'current' && (
          <span className="text-[11px] text-[#8C7A6B] font-mono hidden sm:inline">
            탐색 기준: {report.recencyRangeUsed || '7일 이내'} • {report.generatedAt}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !report && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-8 sm:p-12 space-y-6 text-center shadow-2xs">
          <div className="inline-flex items-center space-x-2.5 text-[#5C4E43] text-sm font-medium">
            <RefreshCw className="w-5 h-5 animate-spin text-[#736152]" />
            <span>사회·소비·산업 전반의 실시간 변화와 팩트를 수집·검증하고 있습니다...</span>
          </div>
          <div className="h-4 bg-[#FAF8F5] rounded w-2/3 mx-auto animate-pulse"></div>
          <div className="h-28 bg-[#FAF8F5] rounded w-full animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-44 bg-[#FAF8F5] rounded animate-pulse"></div>
            <div className="h-44 bg-[#FAF8F5] rounded animate-pulse"></div>
            <div className="h-44 bg-[#FAF8F5] rounded animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Loading Top Banner when initial report is already displayed */}
      {loading && report && (
        <div className="bg-[#FAF8F5] border border-[#D9D3C7] rounded-xs p-3.5 flex items-center justify-center space-x-2 text-xs font-semibold text-[#5C4E43] animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-[#736152]" />
          <span>분석 데이터를 불러오는 중입니다...</span>
        </div>
      )}

      {/* Error Message View */}
      {!loading && error && !report && (
        <div className="bg-white border border-rose-200 rounded-xs p-8 text-center space-y-3 shadow-2xs">
          <div className="text-rose-700 font-semibold text-base">
            {error}
          </div>
          <p className="text-xs text-[#666666] max-w-md mx-auto">
            {error.includes('신규 트렌드가 없습니다')
              ? '검색 기간을 더 넓히거나 범산업 카테고리를 전체로 선택하여 다시 탐색해 보세요.'
              : '잠시 후 다시 시도하시거나, 다른 추천 검색어를 탐색해보세요.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleForceRefresh}
              className="px-4 py-2 bg-[#736152] text-white text-xs font-semibold rounded-2xs hover:bg-[#5C4E43] transition-colors"
            >
              다시 탐색하기
            </button>
          </div>
        </div>
      )}

      {/* Error Top Banner when initial report is displayed */}
      {!loading && error && report && (
        <div className="bg-amber-50 border border-amber-200 rounded-xs p-3.5 text-center space-y-1 shadow-2xs">
          <div className="text-amber-800 font-semibold text-xs flex items-center justify-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Empty Initial State View */}
      {!loading && !report && !error && activeViewTab === 'current' && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-10 sm:p-14 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 bg-[#FAF8F5] text-[#736152] rounded-full flex items-center justify-center mx-auto border border-[#E8E4DC]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold font-serif text-[#2C2C2C]">
              사회·소비·산업 트렌드를 탐색해보세요
            </h3>
            <p className="text-xs text-[#666666] leading-relaxed font-sans">
              특정 리조트나 호텔에 편중되지 않고, 현재 시장 전반에서 새롭게 일어나는 변화를
              독립적으로 탐색한 후 IPARK리조트에 연결 가능한 기회를 분석해 드립니다.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {PRESET_QUERIES.slice(0, 5).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handlePresetClick(q)}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D9D3C7] rounded-2xs text-xs font-medium text-[#5C4E43] cursor-pointer transition-colors"
              >
                🔍 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SAVED ARCHIVE TAB VIEW */}
      {activeViewTab === 'saved' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DC] rounded-xs p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">저장된 트렌드 아카이브</h3>
              <p className="text-xs text-[#8C7A6B]">
                사용자가 스크랩한 트렌드 카드 목록입니다. 최신 검색 결과와 분리되어 보관됩니다.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#736152]">{savedTrends.length}건</span>
          </div>

          {savedTrends.length === 0 ? (
            <div className="bg-white border border-[#E8E4DC] rounded-xs p-8 text-center text-xs text-[#8C7A6B]">
              아직 저장된 트렌드가 없습니다. 트렌드 카드의 북마크 아이콘을 클릭하여 보관하세요.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedTrends.map((trend) => (
                <div
                  key={trend.id}
                  className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FAF8F5] text-[#5C4E43] border border-[#E8E4DC] rounded-2xs">
                        {trend.category}
                      </span>
                      <button
                        onClick={() => toggleSaveTrend(trend)}
                        className="text-amber-600 hover:text-rose-600 transition-colors p-1"
                        title="보관 해제"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-base font-bold text-[#2C2C2C] leading-snug font-serif">
                      {trend.title}
                    </h4>
                    <p className="text-xs text-[#555555] leading-relaxed">
                      {trend.whatIsHappening}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs">
                    {trend.sourceUrl && (
                      <a
                        href={trend.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#736152] hover:underline flex items-center space-x-1"
                      >
                        <span>원문 보기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {trend.relatedCompanies?.[0] && (
                      <button
                        onClick={() => onAnalyzeCompany(trend.relatedCompanies![0])}
                        className="text-[#5C4E43] hover:text-[#2C2C2C] font-medium"
                      >
                        [{trend.relatedCompanies[0]}] 분석
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CURRENT SEARCH RESULTS VIEW */}
      {report && activeViewTab === 'current' && (
        <div className="space-y-7">
          {/* 2. 오늘의 트렌드 레이더 (Today's Trend Radar) */}
          {report.trendRadar && report.trendRadar.length > 0 && (
            <section className="bg-gradient-to-br from-[#FAF8F5] to-white border border-[#D9D3C7] rounded-xs p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#736152] text-white flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-serif font-bold text-[#2C2C2C]">
                        오늘의 트렌드 레이더
                      </h2>
                      <span className="px-2 py-0.5 bg-[#736152]/10 text-[#736152] text-[10px] font-mono font-bold rounded-2xs">
                        TOP 5
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C7A6B] font-sans">
                      범산업 최신 동향 중 새로움과 시의성이 가장 높은 상위 5대 핵심 신호
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 text-[11px] bg-white text-[#5C4E43] border border-[#D9D3C7] rounded-2xs font-mono">
                    ⏱️ 탐색 범위: {report.recencyRangeUsed || '7일 이내'}
                  </span>
                </div>
              </div>

              {/* Radar Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {report.trendRadar.map((radar, idx) => (
                  <div
                    key={radar.id || idx}
                    className="bg-white border border-[#E8E4DC] rounded-xs p-3.5 space-y-2.5 flex flex-col justify-between hover:border-[#736152] transition-all shadow-2xs group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FAF8F5] text-[#5C4E43] border border-[#E8E4DC] rounded-2xs">
                          {radar.category}
                        </span>
                        {radar.crossChecked && (
                          <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-0.5" title="다수 언론/기관 교차 검증됨">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>교차검증</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-[#2C2C2C] leading-snug group-hover:text-[#736152] transition-colors">
                        {radar.title}
                      </h3>

                      <p className="text-[11px] text-[#666666] leading-relaxed line-clamp-3">
                        {radar.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F5F2EB] flex items-center justify-between text-[10px] text-[#8C7A6B]">
                      <span className="truncate max-w-[90px]">{radar.sourceName}</span>
                      {radar.sourceUrl ? (
                        <a
                          href={radar.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#736152] hover:underline flex items-center space-x-0.5"
                          title="원문 보기"
                        >
                          <span>원문</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span>{radar.publishedDate}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. 전체 탐색 트렌드 리스트 & 6대 섹션 구획 */}
          <section className="space-y-4">
            {/* Search Intent Banner */}
            <div className="bg-[#FAF8F5] border border-[#D9D3C7] rounded-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start md:items-center space-x-3">
                <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded-2xs border ${
                  report.intentType === 'INDUSTRY_DEEP_DIVE'
                    ? 'bg-emerald-800 text-white border-emerald-900'
                    : 'bg-[#736152] text-white border-[#5C4E43]'
                }`}>
                  {report.intentType === 'INDUSTRY_DEEP_DIVE' ? `산업 딥다이브: ${report.targetIndustry || report.query}` : '범산업 탐색'}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C]">
                    {report.intentType === 'INDUSTRY_DEEP_DIVE'
                      ? `"${report.targetIndustry || report.query}" 산업 내 세부 영역 딥다이브 (총 ${allKeyTrends.length}건 수집)`
                      : `범산업 다채로운 소비 트렌드 탐색 (총 ${allKeyTrends.length}건 수집)`}
                  </h3>
                  <p className="text-xs text-[#666666] mt-0.5">
                    {report.intentType === 'INDUSTRY_DEEP_DIVE'
                      ? '타 산업의 일반 트렌드를 섞지 않고, 오직 해당 산업 내부의 운영, 기술, 브랜드, 소비자 변화를 집중 심층 분석하였습니다.'
                      : '사회·소비·산업 전반의 최신 동향을 편중 없이 분산 탐색하여 수집하였습니다.'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#8C7A6B] font-mono shrink-0">
                표시 중: <strong className="text-[#2C2C2C]">{displayedKeyTrends.length}</strong> / {filteredKeyTrends.length}건
              </div>
            </div>

            {/* Sub-Dimension Quick Pills */}
            {detectedSubDimensions.length > 0 && (
              <div className="bg-white border border-[#E8E4DC] rounded-xs p-3 space-y-2">
                <div className="text-[11px] font-bold text-[#736152] flex items-center space-x-1 font-mono">
                  <Layers className="w-3.5 h-3.5 text-[#736152]" />
                  <span>세부 탐색축 필터 ({detectedSubDimensions.length}개):</span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSubDimension('전체')}
                    className={`px-2.5 py-1 text-xs rounded-2xs border transition-colors cursor-pointer ${
                      selectedSubDimension === '전체'
                        ? 'bg-[#736152] text-white border-[#736152] font-bold'
                        : 'bg-[#FAF8F5] text-[#5C4E43] border-[#E8E4DC] hover:border-[#736152]'
                    }`}
                  >
                    전체
                  </button>
                  {detectedSubDimensions.map((sd) => (
                    <button
                      key={sd}
                      type="button"
                      onClick={() => setSelectedSubDimension(sd)}
                      className={`px-2.5 py-1 text-xs rounded-2xs border transition-colors cursor-pointer ${
                        selectedSubDimension === sd
                          ? 'bg-[#736152] text-white border-[#736152] font-bold'
                          : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:border-[#736152] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {sd}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6-Section Tabs */}
            <div className="flex items-center flex-wrap gap-1.5 border-b border-[#E8E4DC] pb-2 pt-1">
              <span className="text-xs font-bold text-[#5C4E43] mr-1">섹션별 보기:</span>
              {ALL_SECTIONS.map((sec) => {
                const count = sec === '전체'
                  ? allKeyTrends.length
                  : allKeyTrends.filter((t) => t.section === sec).length;

                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setSelectedSection(sec);
                      setVisibleCount(12);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-2xs border transition-colors cursor-pointer font-medium ${
                      selectedSection === sec
                        ? 'bg-[#2C2C2C] text-white border-[#2C2C2C] font-bold shadow-2xs'
                        : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {sec} ({count})
                  </button>
                );
              })}
            </div>

            {/* Trend Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedKeyTrends.map((trend) => {
                const isSaved = isTrendSaved(trend);
                const hasArticleUrl = isSpecificArticleUrl(trend.sourceUrl);
                const hasOfficialUrl = isValidOfficialUrl(trend.officialUrl);

                return (
                  <div
                    key={trend.id}
                    className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 shadow-2xs hover:border-[#736152] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Card Header Meta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {trend.section && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#736152] text-white rounded-2xs">
                              {trend.section}
                            </span>
                          )}
                          {trend.subDimension && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FAF8F5] text-[#5C4E43] border border-[#E8E4DC] rounded-2xs">
                              {trend.subDimension}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#F5F2EB] text-[#8C7A6B] rounded-2xs">
                            {trend.category}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSaveTrend(trend)}
                          className={`p-1 transition-colors cursor-pointer ${
                            isSaved ? 'text-amber-600' : 'text-[#8C7A6B] hover:text-[#2C2C2C]'
                          }`}
                          title={isSaved ? '저장됨' : '트렌드 저장'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Brand Header & Title */}
                      <div>
                        {trend.brandName && (
                          <div className="text-xs font-bold text-[#736152] font-mono mb-0.5 flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{trend.brandName}</span>
                          </div>
                        )}
                        <h3 className="text-base font-bold text-[#2C2C2C] leading-snug font-serif">
                          {trend.title}
                        </h3>
                      </div>

                      {/* Structured Analysis Section */}
                      <div className="space-y-2.5 pt-1">
                        {/* ① 확인된 사실 / 최근 활동 */}
                        <div className="space-y-1 bg-[#FAF8F5] p-2.5 rounded-2xs border border-[#F0ECE1]">
                          <div className="text-[11px] font-bold text-[#736152] flex items-center justify-between">
                            <span className="flex items-center space-x-1">
                              <span className="w-4 h-4 rounded-full bg-[#736152] text-white text-[9px] flex items-center justify-center font-mono">1</span>
                              <span>최근 실제 활동 [FACT]</span>
                            </span>
                            <span className="text-[10px] text-[#8C7A6B] font-mono">
                              게시일: {trend.publishedDate || '2026.08'}
                            </span>
                          </div>
                          <p className="text-xs text-[#2C2C2C] leading-relaxed font-normal">
                            {trend.recentActivity || trend.whatIsHappening || trend.description}
                          </p>
                        </div>

                        {/* ② 시장/소비 왜 주목할 만한가 */}
                        <div className="space-y-1 bg-amber-50/50 p-2.5 rounded-2xs border border-amber-100">
                          <div className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                            <span className="w-4 h-4 rounded-full bg-amber-800 text-white text-[9px] flex items-center justify-center font-mono">2</span>
                            <span>왜 주목할 만한가 [INSIGHT]</span>
                          </div>
                          <p className="text-xs text-[#332211] leading-relaxed">
                            {trend.whyNotable || trend.whyGrowing}
                          </p>
                        </div>

                        {/* ③ 관련 제품/서비스 */}
                        {trend.relatedProducts && trend.relatedProducts.length > 0 && (
                          <div className="space-y-1 text-[11px] text-[#5C4E43]">
                            <span className="font-bold font-mono text-[10px]">관련 제품/서비스:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {trend.relatedProducts.map((p) => (
                                <span key={p} className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E0D9CC] rounded-2xs text-[10px] font-medium text-[#2C2C2C]">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ④ IPARK리조트/오크밸리 활용 가능 포인트 */}
                        <div className="pt-0.5">
                          {trend.hasDirectApplication ? (
                            <div className="bg-[#F7F4EE] border border-[#D9D3C7] p-2.5 rounded-2xs space-y-1">
                              <div className="flex items-center space-x-1 text-[11px] font-bold text-[#736152]">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>IPARK리조트/오크밸리 활용 포인트</span>
                              </div>
                              <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed pl-4">
                                {trend.iparkResortAngle}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-[#FAF8F5] border border-[#E8E4DC] p-2 rounded-2xs space-y-1">
                              <div className="flex items-center space-x-1 text-[10px] font-semibold text-[#8C7A6B]">
                                <span>IPARK리조트 시사점 (시장 관찰 필요)</span>
                              </div>
                              <p className="text-[11px] text-[#666666] leading-relaxed pl-2">
                                {trend.iparkResortAngle || '직접 적용보다 시장 소비 동향 추이 관찰 권장'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Related Companies Chips */}
                      {trend.relatedCompanies && trend.relatedCompanies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          <span className="text-[10px] text-[#8C7A6B]">연관 기업:</span>
                          {trend.relatedCompanies.map((comp) => (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => onAnalyzeCompany(comp)}
                              className="px-1.5 py-0.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-2xs text-[10px] font-medium text-[#5C4E43] transition-colors cursor-pointer"
                              title={`${comp} 기업 분석 바로가기`}
                            >
                              #{comp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Toolbar with Strict URL Separation */}
                    <div className="pt-3 border-t border-[#F0ECE1] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
                        <span className="truncate max-w-[150px]" title={trend.sourceName}>
                          출처: {trend.sourceName || '공식 언론 및 데이터'}
                        </span>
                        <span>{trend.publishedDate}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {/* Button 1: Original Source (Only if specific article URL exists!) */}
                        {hasArticleUrl ? (
                          <a
                            href={trend.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-2 bg-white hover:bg-[#FAF8F5] border border-[#D9D3C7] text-[#5C4E43] text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1 text-center"
                            title="실제 확인된 기사/뉴스룸 글 열기"
                          >
                            <span>원문 보기</span>
                            <ExternalLink className="w-3 h-3 text-[#736152]" />
                          </a>
                        ) : (
                          <div className="px-2 py-2 bg-[#FAF8F5] text-[#A0988E] text-[11px] rounded-2xs border border-[#E8E4DC] text-center font-medium">
                            원문 미제공
                          </div>
                        )}

                        {/* Button 2: Official Homepage */}
                        {hasOfficialUrl ? (
                          <a
                            href={trend.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D9D3C7] text-[#2C2C2C] text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1 text-center"
                            title="기업/브랜드 공식 홈페이지 열기"
                          >
                            <Globe className="w-3 h-3 text-[#736152]" />
                            <span className="truncate">공식 홈페이지</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAnalyzeCompany(trend.brandName || trend.relatedCompanies?.[0] || trend.title)}
                            className="px-2 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D9D3C7] text-[#2C2C2C] text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Building2 className="w-3 h-3 text-[#736152]" />
                            <span className="truncate">기업 상세분석</span>
                          </button>
                        )}
                      </div>

                      {/* Partnership Proposal Action */}
                      {trend.hasDirectApplication && (
                        <button
                          type="button"
                          onClick={() => {
                            const comp = trend.brandName || trend.relatedCompanies?.[0] || trend.title;
                            if (onCreatePartnershipProposal) {
                              onCreatePartnershipProposal(comp);
                            } else {
                              onAnalyzeCompany(comp);
                            }
                          }}
                          className="w-full py-2 px-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>제휴 아이디어 만들기 &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Expansion Button (20~30 items expansion) */}
            {hasMoreTrends && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-sm font-semibold rounded-2xs transition-all cursor-pointer shadow-2xs inline-flex items-center space-x-2"
                >
                  <span>더 보기 (+{filteredKeyTrends.length - visibleCount}개 트렌드 추가 펼치기)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="block text-xs text-[#8C7A6B] mt-2">
                  * 전체 {filteredKeyTrends.length}건 중 현재 {displayedKeyTrends.length}건 표시 중
                </span>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
