import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Calendar,
  Grid,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  Building2,
  ExternalLink,
  Layers,
  HelpCircle,
  Clock,
  Bookmark,
  ArrowLeft,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { ActiveTab, ActivationItem, ActivationRegion } from '../types';
import { SAMPLE_ACTIVATIONS } from '../data/sampleActivations';
import { ActivationCalendarView } from './ActivationCalendarView';
import { ActivationDetailModal } from './ActivationDetailModal';
import {
  calculateActivationStatus,
  formatMonthHeader,
  isEventInMonth,
  matchesCategory,
  matchesRegion,
  matchesQuickFilter,
  sortActivationsByRecency,
  getTodayDateStr
} from '../utils/activationUtils';

interface ActivationRadarViewProps {
  onCreatePartnershipProposal?: (brandName: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const ActivationRadarView: React.FC<ActivationRadarViewProps> = ({
  onCreatePartnershipProposal,
  onNavigateTab,
}) => {
  // Current month state: default "2026.09"
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('2026.09');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Filter states for Calendar View
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('전체');
  
  // Search input and executed search state
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ActivationItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal detail state
  const [selectedEvent, setSelectedEvent] = useState<ActivationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Default Activations dataset (initialized with real verified activations)
  const [activations, setActivations] = useState<ActivationItem[]>(SAMPLE_ACTIVATIONS);

  // Categories list (Requirement #3)
  const categories = [
    '전체',
    '팝업',
    '전시',
    '박람회 / Expo',
    'Brand Event',
    'Sports',
    'Golf',
    'Running',
    'Wellness',
    'Outdoor',
    'F&B',
    'Fashion / Beauty',
    'Lifestyle / Culture',
  ];

  // Regions list (Requirement #4)
  const regions = [
    '전체',
    '서울',
    '경기',
    '인천',
    '강원',
    '부산',
    '제주',
    '기타 국내',
    'Japan',
    'Global',
  ];

  // Seoul Sub-regions list
  const seoulSubRegions = [
    '성수',
    '한남',
    '강남',
    '여의도',
    '잠실',
    'DDP',
    '코엑스',
  ];

  // Quick Filters (Requirement #10)
  const quickFilters = [
    '전체',
    '이번 주',
    '이번 주말',
    '진행 중',
    '곧 종료',
    '다음 달 예정',
  ];

  // Month navigation handlers (Requirement #1)
  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedYearMonth.split('.');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedYearMonth(`${y}.${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedYearMonth.split('.');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedYearMonth(`${y}.${String(m).padStart(2, '0')}`);
  };

  // Execute Web-based Fact-Verified Activation Search (Strict Verified Search Layer)
  const executeActivationSearch = async (queryText: string) => {
    const query = queryText.trim();
    if (!query) {
      setActiveSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setActiveSearchQuery(query);
    setIsSearching(true);
    setSearchError(null);

    try {
      // Call backend /api/search-activations for comprehensive Google Grounded Verified results
      const res = await fetch('/api/search-activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          region: selectedRegion !== '전체' ? selectedRegion : '전체',
          forceRefresh: false,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || '검색 요청 처리 중 오류가 발생했습니다.');
      }

      const data = await res.json();
      if (data && data.success && Array.isArray(data.activations)) {
        // Sort strictly by recency: ONGOING -> UPCOMING (closest first) -> ENDED (most recently ended first)
        const sorted = sortActivationsByRecency(data.activations, getTodayDateStr());
        setSearchResults(sorted);
      } else {
        throw new Error(data?.error || '공식 데이터 조회에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error executing activation search:', err);
      setSearchError(err?.message || '실시간 공식 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Form submit handler (supports both Enter key and Button click)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeActivationSearch(searchInput);
  };

  // Return to monthly calendar view
  const handleReturnToCalendar = () => {
    setSearchInput('');
    setActiveSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  // Filter activations for monthly calendar view
  const allMonthActivations = useMemo(() => {
    return activations.filter((a) => isEventInMonth(a, selectedYearMonth));
  }, [activations, selectedYearMonth]);

  const filteredActivations = useMemo(() => {
    return allMonthActivations.filter((item) => {
      // Category filter
      if (!matchesCategory(item, selectedCategory)) return false;

      // Region & SubRegion filter
      if (!matchesRegion(item, selectedRegion, selectedSubRegion)) return false;

      // Quick filter
      if (!matchesQuickFilter(item, selectedQuickFilter)) return false;

      return true;
    });
  }, [allMonthActivations, selectedCategory, selectedRegion, selectedSubRegion, selectedQuickFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'bg-[#E2ECE9] text-[#1E5647] border-[#B2D3C9]';
      case 'UPCOMING':
        return 'bg-[#EBF2FA] text-[#225082] border-[#BACEE6]';
      case 'ENDED':
        return 'bg-[#F2EFEA] text-[#706458] border-[#D9D3C7]';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header & Search Control Bar */}
      <section className="bg-[#2C2C2C] text-[#FAF8F5] rounded-xs p-6 sm:p-8 space-y-6 shadow-md border border-[#423C36]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#423C36] pb-6">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-[#8C5D28] text-[#FAF8F5] text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider">
              {activeSearchQuery ? 'ACTIVATION SEARCH' : 'ACTIVATION CALENDAR'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#FAF8F5] tracking-tight">
              {activeSearchQuery
                ? `'${activeSearchQuery}' 검색 결과`
                : `${formatMonthHeader(selectedYearMonth)} ACTIVATION CALENDAR`}
            </h1>
            <p className="text-xs sm:text-sm text-[#C2B7AC] font-light">
              {activeSearchQuery
                ? `공식 출처에서 사실 확인된 브랜드 팝업, 전시, 박람회, 스포츠/웰니스 이벤트 검색 결과입니다.`
                : `실제 확인 가능한 브랜드 팝업, 전시, 박람회, 스포츠/웰니스 이벤트를 월간 캘린더 형태로 한눈에 탐색합니다.`}
            </p>
          </div>

          {/* Month Navigation Control Buttons (Shown when in calendar mode) */}
          {!activeSearchQuery && (
            <div className="flex items-center space-x-2 bg-[#423C36] p-1.5 rounded-2xs border border-[#59514A] shrink-0">
              <button
                id="btn-prev-month"
                onClick={handlePrevMonth}
                className="px-3 py-2 bg-[#2C2C2C] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#D4C8B8]" />
                <span>이전 달</span>
              </button>

              <span className="px-4 py-2 font-serif-display font-bold text-sm text-[#FAF8F5] tracking-wide">
                {formatMonthHeader(selectedYearMonth)}
              </span>

              <button
                id="btn-next-month"
                onClick={handleNextMonth}
                className="px-3 py-2 bg-[#2C2C2C] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>다음 달</span>
                <ChevronRight className="w-4 h-4 text-[#D4C8B8]" />
              </button>
            </div>
          )}

          {/* Return to calendar button when search mode is active */}
          {activeSearchQuery && (
            <button
              id="btn-return-calendar-top"
              type="button"
              onClick={handleReturnToCalendar}
              className="px-4 py-2 bg-[#736152] hover:bg-[#8C7A6B] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm self-start md:self-auto"
            >
              <ArrowLeft className="w-4 h-4 text-[#FAF8F5]" />
              <span>월간 캘린더로 돌아가기</span>
            </button>
          )}
        </div>

        {/* Search Bar & View Mode Toggle Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          
          {/* Integrated Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full flex items-center gap-2">
            
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]" />
              <input
                id="input-activation-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="브랜드명, 행사명, 장소, 산업, 키워드 검색 (예: Kiaf, Frieze, Nike, 골프, 웰니스, 러닝, 초콜릿, 성수 팝업)"
                className="w-full pl-10 pr-12 sm:pr-20 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-xs sm:text-sm text-[#2C2C2C] placeholder:text-[#8C7A6B]/70 focus:outline-none focus:border-[#736152] font-normal transition-colors"
              />

              {/* Clear button inside input if text exists */}
              {searchInput ? (
                <button
                  id="btn-clear-search-input"
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B] hover:text-[#2C2C2C] font-mono cursor-pointer"
                >
                  초기화
                </button>
              ) : null}

              {/* Mobile Embedded Search Icon Button */}
              <button
                id="btn-mobile-activation-search"
                type="button"
                onClick={() => handleSearchSubmit()}
                aria-label="행사 검색"
                className="sm:hidden absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#736152] active:bg-[#5C4E43] text-white rounded-2xs cursor-pointer shadow-xs transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* PC Oak Valley Taupe Search Button */}
            <button
              id="btn-pc-activation-search"
              type="button"
              onClick={() => handleSearchSubmit()}
              className="hidden sm:inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs sm:text-sm font-mono font-bold rounded-2xs transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>검색</span>
            </button>

            {/* Quick Search Suggestion Chips */}
            <div className="hidden md:flex items-center gap-1.5 ml-2 text-xs">
              <span className="text-[11px] text-[#C2B7AC] font-mono whitespace-nowrap">추천:</span>
              {[
                '서울 / 향후 30일 / 전체',
                'COEX 공식 행사',
                '성수동 팝업스토어',
                '더현대 서울 팝업',
                '한남동 갤러리',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchInput(chip);
                    executeActivationSearch(chip);
                  }}
                  className="px-2 py-0.5 bg-[#423C36] hover:bg-[#59514A] text-[#FAF8F5] text-[10px] rounded-2xs border border-[#59514A] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {chip}
                </button>
              ))}
            </div>

          </form>

          {/* View Mode Switcher (Shown in Calendar Mode) */}
          {!activeSearchQuery && (
            <div className="flex items-center space-x-1 bg-[#423C36] p-1 rounded-2xs border border-[#59514A] shrink-0 self-end sm:self-auto">
              <button
                id="btn-view-mode-calendar"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-[#FAF8F5] text-[#2C2C2C] shadow-2xs'
                    : 'text-[#C2B7AC] hover:text-[#FAF8F5]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>

              <button
                id="btn-view-mode-list"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#FAF8F5] text-[#2C2C2C] shadow-2xs'
                    : 'text-[#C2B7AC] hover:text-[#FAF8F5]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          )}

        </div>

      </section>

      {/* 2. Search Results View vs 3. Calendar Filters & Views */}
      {activeSearchQuery ? (
        /* ================== SEARCH RESULTS VIEW ================== */
        <section className="space-y-6 animate-in fade-in duration-200">
          
          {/* Search Header Bar with Return Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xs border border-[#E8E4DC] shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-[#736152] rounded-full animate-pulse" />
              <div>
                <h2 className="text-base sm:text-lg font-serif-display font-bold text-[#2C2C2C]">
                  '{activeSearchQuery}' 검색 결과
                </h2>
                <p className="text-xs text-[#8C7A6B] font-mono">
                  공식 출처 사실 확인 완료: <strong className="text-[#2C2C2C]">{searchResults.length}건</strong>
                </p>
              </div>
            </div>

            <button
              id="btn-return-calendar-results"
              onClick={handleReturnToCalendar}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#736152] border border-[#D4C8B8] text-xs font-mono font-bold rounded-2xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>월간 캘린더로 돌아가기</span>
            </button>
          </div>

          {/* Loading State */}
          {isSearching && (
            <div className="bg-white border border-[#E8E4DC] p-12 sm:p-16 rounded-xs text-center space-y-4 shadow-2xs font-mono">
              <Loader2 className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  행사 정보를 검색하고 공식 출처를 확인하고 있습니다...
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  '{activeSearchQuery}' 관련 브랜드 팝업, 전시, 박람회, 이벤트 데이터를 웹에서 실시간 검증합니다.
                </p>
              </div>
            </div>
          )}

          {/* Error State vs Results Grid vs Empty State */}
          {!isSearching && searchError && (
            <div className="bg-[#FAF4EB] border border-[#E8D8C3] p-10 sm:p-14 rounded-xs text-center space-y-4 shadow-2xs font-mono">
              <AlertTriangle className="w-10 h-10 text-[#8C5D28] mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#2C2C2C]">
                  검색 중 오류가 발생했습니다
                </h3>
                <p className="text-xs text-[#8C5D28] max-w-md mx-auto leading-relaxed">
                  {searchError}
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => executeActivationSearch(activeSearchQuery)}
                  className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>다시 시도하기</span>
                </button>
                <button
                  onClick={handleReturnToCalendar}
                  className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8] text-xs font-mono font-bold rounded-2xs transition-colors cursor-pointer"
                >
                  월간 캘린더로 돌아가기
                </button>
              </div>
            </div>
          )}

          {/* Results Grid or Empty State */}
          {!isSearching && !searchError && (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item) => {
                  const status = calculateActivationStatus(item.startDate, item.endDate);
                  return (
                    <div
                      key={item.id}
                      id={`card-activation-${item.id}`}
                      onClick={() => {
                        setSelectedEvent(item);
                        setIsDetailOpen(true);
                      }}
                      className="bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] hover:border-[#736152] p-5 rounded-xs cursor-pointer transition-all space-y-3.5 flex flex-col justify-between shadow-2xs group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 border font-mono font-bold rounded-2xs text-[10px] ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                          <span className="px-2 py-0.5 bg-[#FAF4EB] text-[#8C5D28] border border-[#E8D8C3] font-mono text-[10px] rounded-2xs font-semibold">
                            #{item.eventType}
                          </span>
                        </div>

                        {/* Event Name */}
                        <h4 className="text-base font-serif-display font-bold text-[#2C2C2C] leading-snug group-hover:text-[#736152] transition-colors">
                          {item.eventName}
                        </h4>

                        {/* Brand / Host */}
                        <div className="text-xs font-mono text-[#736152] font-bold flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>주최/브랜드: {item.brand}</span>
                        </div>

                        {/* Summary / What is it */}
                        <p className="text-xs text-[#5C4E43] leading-relaxed line-clamp-2">
                          {item.whatIsIt}
                        </p>
                      </div>

                      {/* Event Details Footer: Location, Period, Verified Source */}
                      <div className="pt-3 border-t border-[#E8E4DC] space-y-2 text-xs text-[#8C7A6B] font-mono">
                        <div className="flex items-start space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0 mt-0.5" />
                          <span className="truncate text-[#423C36]">
                            {item.location} {item.city ? `(${item.city})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                          <span className="text-[#423C36] font-semibold">{item.periodText}</span>
                        </div>

                        {/* Official Verified Source */}
                        {item.source && (
                          <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs text-[11px] space-y-1">
                            <div className="flex items-center justify-between text-[#736152] font-semibold">
                              <span className="flex items-center space-x-1">
                                <span className="text-[#1E5647]">✓</span>
                                <span>공식 출처 사실 확인</span>
                              </span>
                              {item.source.refDate && <span className="text-[#8C7A6B] text-[10px]">확인일: {item.source.refDate}</span>}
                            </div>
                            <div className="text-[#5C4E43] truncate font-normal flex items-center justify-between">
                              <span className="truncate">{item.source.title}</span>
                              {item.source.url && (
                                <span className="text-[10px] text-[#736152] font-bold shrink-0 ml-1">
                                  🔗 바로가기
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-1 text-right text-[11px] text-[#736152] font-bold">
                          상세보기 및 오크밸리 제휴 해석 →
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No Fact-verified results found state */
              <div className="bg-white border border-[#E8E4DC] p-12 sm:p-16 rounded-xs text-center space-y-4 shadow-2xs font-mono">
                <AlertCircle className="w-10 h-10 text-[#8C7A6B] mx-auto" />
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#2C2C2C]">
                    공식 출처로 확인 가능한 결과를 찾지 못했습니다.
                  </h3>
                  <p className="text-xs text-[#8C7A6B] max-w-md mx-auto leading-relaxed">
                    공식 출처에서 사실 확인이 되지 않은 가공의 결과는 생성하지 않습니다. 검색어를 변경하거나 다른 브랜드명, 행사명으로 다시 검색해 보세요.
                  </p>
                </div>
                <button
                  id="btn-return-calendar-empty"
                  onClick={handleReturnToCalendar}
                  className="mt-3 px-5 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>월간 캘린더로 돌아가기</span>
                </button>
              </div>
            )
          )}

        </section>
      ) : (
        /* ================== MONTHLY CALENDAR VIEW ================== */
        <>
          {/* Filter Control Panel (Category, Region, Quick Filters) */}
          <section className="bg-white p-5 sm:p-6 rounded-xs border border-[#E8E4DC] shadow-2xs space-y-5">
            
            {/* Category Filter Bar (Requirement #3) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-[#8C7A6B] font-bold block uppercase tracking-wider">
                ■ 카테고리 필터 (CATEGORY FILTER)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-2xs border text-xs font-mono transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#2C2C2C] text-[#FAF8F5] border-[#2C2C2C] font-bold shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#423C36] border-[#E8E4DC] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter Bar & Seoul Sub-location Tags (Requirement #4) */}
            <div className="pt-3 border-t border-[#E8E4DC] space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#8C7A6B] font-bold block uppercase tracking-wider">
                  ■ 지역 필터 (REGION FILTER)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(reg);
                        setSelectedSubRegion('');
                      }}
                      className={`px-3 py-1.5 rounded-2xs border text-xs font-mono transition-colors cursor-pointer ${
                        selectedRegion === reg
                          ? 'bg-[#736152] text-[#FAF8F5] border-[#736152] font-bold shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#423C36] border-[#E8E4DC] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {reg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seoul Sub-location tags if Seoul is active or in general */}
              {(selectedRegion === '전체' || selectedRegion === '서울') && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-2 border-l-2 border-[#D4C8B8]">
                  <span className="text-[11px] font-mono text-[#8C7A6B] mr-1 font-semibold">서울 세부 지역:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSubRegion('')}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-2xs border transition-colors cursor-pointer ${
                      selectedSubRegion === ''
                        ? 'bg-[#2C2C2C] text-[#FAF8F5] border-[#2C2C2C]'
                        : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:bg-[#EFECE6]'
                    }`}
                  >
                    전체 지역
                  </button>
                  {seoulSubRegions.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubRegion(sub)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-2xs border transition-colors cursor-pointer ${
                        selectedSubRegion === sub
                          ? 'bg-[#8C5D28] text-[#FAF8F5] border-[#8C5D28] font-bold'
                          : 'bg-white text-[#5C4E43] border-[#E8E4DC] hover:bg-[#EFECE6]'
                      }`}
                    >
                      #{sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Filters Row (Requirement #10) */}
            <div className="pt-3 border-t border-[#E8E4DC] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#8C7A6B] font-bold">빠른 탐색:</span>
                {quickFilters.map((qf) => (
                  <button
                    key={qf}
                    type="button"
                    onClick={() => setSelectedQuickFilter(qf)}
                    className={`px-2.5 py-1 rounded-2xs border transition-colors cursor-pointer ${
                      selectedQuickFilter === qf
                        ? 'bg-[#2C2C2C] text-[#FAF8F5] border-[#2C2C2C] font-bold'
                        : 'bg-[#FAF8F5] text-[#5C4E43] border-[#E8E4DC] hover:bg-[#EFECE6]'
                    }`}
                  >
                    {qf}
                  </button>
                ))}
              </div>

              <div className="text-[#8C7A6B]">
                조회된 행사: <strong className="text-[#2C2C2C]">{filteredActivations.length}개</strong>
              </div>
            </div>

          </section>

          {/* Main Content: Calendar View vs List View */}
          {viewMode === 'calendar' ? (
            <ActivationCalendarView
              yearMonth={selectedYearMonth}
              activations={filteredActivations}
              allMonthActivations={allMonthActivations}
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setIsDetailOpen(true);
              }}
            />
          ) : (
            /* List View */
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
                <h3 className="text-sm font-mono font-bold text-[#2C2C2C] uppercase tracking-wider flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-[#736152]" />
                  <span>{formatMonthHeader(selectedYearMonth)} ACTIVATION LIST ({filteredActivations.length}건)</span>
                </h3>
              </div>

              {filteredActivations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActivations.map((item) => {
                    const status = calculateActivationStatus(item.startDate, item.endDate);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedEvent(item);
                          setIsDetailOpen(true);
                        }}
                        className="bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] hover:border-[#8C7A6B] p-5 rounded-xs cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-2xs group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 border font-mono font-bold rounded-2xs text-[10px] ${getStatusBadge(status)}`}>
                              {status}
                            </span>
                            <span className="px-2 py-0.5 bg-[#FAF4EB] text-[#8C5D28] border border-[#E8D8C3] font-mono text-[10px] rounded-2xs">
                              #{item.eventType}
                            </span>
                          </div>

                          <h4 className="text-base font-serif-display font-bold text-[#2C2C2C] leading-snug group-hover:text-[#736152] transition-colors">
                            {item.eventName}
                          </h4>

                          <div className="text-xs font-mono text-[#736152] font-semibold">
                            {item.brand}
                          </div>

                          <p className="text-xs text-[#5C4E43] leading-relaxed line-clamp-2">
                            {item.whatIsIt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E8E4DC] space-y-1.5 text-xs text-[#8C7A6B] font-mono">
                          <div className="flex items-center justify-between">
                            <span>📍 장소: {item.location} ({item.city})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>📅 기간: {item.periodText}</span>
                          </div>
                          <div className="pt-1 text-right text-[11px] text-[#736152] font-semibold">
                            상세보기 및 AI 전략 해석 →
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#E8E4DC] p-12 rounded-xs text-center space-y-3 font-mono">
                  <HelpCircle className="w-8 h-8 text-[#8C7A6B] mx-auto" />
                  <h4 className="text-sm font-bold text-[#2C2C2C]">선택하신 조건에 일치하는 행사가 없습니다.</h4>
                  <p className="text-xs text-[#8C7A6B] max-w-md mx-auto">
                    카테고리 및 지역 필터를 '전체'로 재설정하시거나 검색어를 변경해 보세요.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('전체');
                      setSelectedRegion('전체');
                      setSelectedSubRegion('');
                      setSelectedQuickFilter('전체');
                    }}
                    className="mt-2 px-4 py-2 bg-[#2C2C2C] text-[#FAF8F5] text-xs font-mono font-medium rounded-2xs transition-colors cursor-pointer"
                  >
                    필터 전체 초기화
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* 4. Event Detail Modal (Requirement #6) */}
      <ActivationDetailModal
        activation={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onCreatePartnershipProposal={onCreatePartnershipProposal}
      />

    </div>
  );
};

