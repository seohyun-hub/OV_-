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
  Bookmark
} from 'lucide-react';
import { ActiveTab, ActivationItem, ActivationRegion } from '../types';
import { SAMPLE_ACTIVATIONS } from '../data/sampleActivations';
import { ActivationCalendarView } from './ActivationCalendarView';
import { ActivationDetailModal } from './ActivationDetailModal';
import { CompetitorBest5Section } from './competitor/CompetitorBest5Section';
import {
  calculateActivationStatus,
  formatMonthHeader,
  isEventInMonth,
  matchesCategory,
  matchesRegion,
  matchesQuickFilter
} from '../utils/activationUtils';

interface ActivationRadarViewProps {
  onCreatePartnershipProposal?: (brandName: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const ActivationRadarView: React.FC<ActivationRadarViewProps> = ({
  onCreatePartnershipProposal,
  onNavigateTab,
}) => {
  // Current month state: default "2026.08"
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('2026.08');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal detail state
  const [selectedEvent, setSelectedEvent] = useState<ActivationItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Activations state (initialized with real verified activations)
  const [activations, setActivations] = useState<ActivationItem[]>(SAMPLE_ACTIVATIONS);
  const [isSearchingAI, setIsSearchingAI] = useState<boolean>(false);

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

  // Optional AI Search overlay
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingAI(true);
    try {
      const res = await fetch('/api/search-activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, region: selectedRegion, period: selectedYearMonth }),
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.activations) && data.activations.length > 0) {
        setActivations((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newItems = data.activations.filter((a: ActivationItem) => !existingIds.has(a.id));
          return [...newItems, ...prev];
        });
      }
    } catch (err) {
      console.error('Error fetching activations:', err);
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Filter activations for current view
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

      // Text search query filter (Brand, Event Name, Venue, Industry, Keyword)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBrand = item.brand.toLowerCase().includes(q);
        const matchName = item.eventName.toLowerCase().includes(q);
        const matchLocation = item.location.toLowerCase().includes(q);
        const matchWhatIsIt = item.whatIsIt.toLowerCase().includes(q);
        const matchHotspot = (item.hotspot || '').toLowerCase().includes(q);
        const matchType = item.eventType.toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));

        if (!matchBrand && !matchName && !matchLocation && !matchWhatIsIt && !matchHotspot && !matchType && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [allMonthActivations, selectedCategory, selectedRegion, selectedSubRegion, selectedQuickFilter, searchQuery]);

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
      
      {/* ① 이번 달 동종업계 BEST 5 (Monthly Competitor Best 5) */}
      <CompetitorBest5Section
        currentYearMonth={selectedYearMonth}
        onMonthChange={setSelectedYearMonth}
      />

      {/* ② 전체 동종업계 현황 / Header & Month Navigation */}
      <section className="bg-[#2C2C2C] text-[#FAF8F5] rounded-xs p-6 sm:p-8 space-y-6 shadow-md border border-[#423C36]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#423C36] pb-6">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-[#8C5D28] text-[#FAF8F5] text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider">
              ACTIVATION CALENDAR
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#FAF8F5] tracking-tight">
              {formatMonthHeader(selectedYearMonth)} ACTIVATION CALENDAR
            </h1>
            <p className="text-xs sm:text-sm text-[#C2B7AC] font-light">
              실제 확인 가능한 브랜드 팝업, 전시, 박람회, 스포츠/웰니스 이벤트를 월간 캘린더 형태로 한눈에 탐색합니다.
            </p>
          </div>

          {/* Month Navigation Control Buttons */}
          <div className="flex items-center space-x-2 bg-[#423C36] p-1.5 rounded-2xs border border-[#59514A] shrink-0">
            <button
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
              onClick={handleNextMonth}
              className="px-3 py-2 bg-[#2C2C2C] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-mono font-bold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>다음 달</span>
              <ChevronRight className="w-4 h-4 text-[#D4C8B8]" />
            </button>
          </div>
        </div>

        {/* Search Bar & View Mode Toggle Row (Requirement #2, #11) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          
          {/* Integrated Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="브랜드, 행사명, 장소, 산업, 키워드 검색 (예: Nike, 성수, 웰니스, 골프, 초콜릿, 러닝)"
              className="w-full pl-10 pr-24 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-xs sm:text-sm text-[#2C2C2C] placeholder:text-[#8C7A6B]/70 focus:outline-none focus:border-[#FAF8F5] font-normal"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A6B] hover:text-[#2C2C2C] font-mono"
              >
                초기화
              </button>
            ) : null}
          </form>

          {/* View Mode Switcher: Calendar View (Default) vs List View */}
          <div className="flex items-center space-x-1 bg-[#423C36] p-1 rounded-2xs border border-[#59514A] shrink-0">
            <button
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

        </div>

      </section>

      {/* 2. Filter Control Panel (Category, Region, Quick Filters) */}
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

      {/* 3. Main Content: Calendar View vs List View */}
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
        /* List View (Requirement #2, #5) */
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
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-[#2C2C2C] text-[#FAF8F5] text-xs font-mono font-medium rounded-2xs transition-colors cursor-pointer"
              >
                필터 전체 초기화
              </button>
            </div>
          )}
        </section>
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
