import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Building2,
  Calendar,
  Tag,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { CompetitorBest5Item } from '../../types';
import { CompetitorBest5DetailModal } from './CompetitorBest5DetailModal';

interface CompetitorBest5SectionProps {
  currentYearMonth: string;
  onMonthChange: (yearMonth: string) => void;
}

export const CompetitorBest5Section: React.FC<CompetitorBest5SectionProps> = ({
  currentYearMonth,
  onMonthChange,
}) => {
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'DOMESTIC' | 'OVERSEAS'>('ALL');
  const [items, setItems] = useState<CompetitorBest5Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected item for detail modal
  const [selectedItem, setSelectedItem] = useState<CompetitorBest5Item | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Fetch BEST 5 data from server
  const fetchBest5 = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/competitor-best5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearMonth: currentYearMonth,
          regionFilter,
          forceRefresh,
        }),
      });

      const data = await res.json();
      if (data && data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setError(data?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error fetching competitor best5:', err);
      setError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBest5(false);
  }, [currentYearMonth, regionFilter]);

  // Format month for display e.g. "2026.08" -> "2026년 8월"
  const formatMonthTitle = (ym: string) => {
    const [year, month] = ym.split('.');
    return `${year}년 ${parseInt(month, 10)}월`;
  };

  // Category Tag Korean Label mapping
  const getCategoryTagLabel = (tag: string): string => {
    const map: Record<string, string> = {
      'PACKAGE': '패키지',
      'PARTNERSHIP': '브랜드 제휴',
      'NEW EXPERIENCE': '신규 콘텐츠',
      'GOLF & SPORTS': '골프·스포츠',
      'WELLNESS': '웰니스',
      'F&B': 'F&B',
      'FAMILY': '패밀리',
      'PET': '펫',
      'CULTURE': '문화·콘텐츠',
      'SEASONAL': '시즌 프로모션',
    };
    return map[tag] || tag;
  };

  // Month step helper
  const handlePrevMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('.');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    onMonthChange(`${y}.${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = currentYearMonth.split('.');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    onMonthChange(`${y}.${String(m).padStart(2, '0')}`);
  };

  const handleOpenDetail = (item: CompetitorBest5Item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  return (
    <section className="bg-white rounded-xs p-6 sm:p-8 space-y-6 shadow-xs border border-[#E8E4DC] relative">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-[#8C5D28] text-white text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider">
              MONTHLY BEST 5
            </span>
            <span className="text-xs text-[#786658] font-mono">
              실무 참고 실증 사례
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mt-1 tracking-tight">
            {formatMonthTitle(currentYearMonth)} · 동종업계 BEST 5
          </h2>
          <p className="text-xs sm:text-sm text-[#786658] font-light mt-1">
            Oak Valley / PARK ROCHE 실무에서 참고 가치가 높은 국내외 호텔·리조트 실제 검증 사례입니다.
          </p>
        </div>

        {/* Right Controls: Month Selector, Region Filter, Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Month Navigation Control */}
          <div className="flex items-center space-x-1 bg-[#F5F2EB] p-1 rounded-2xs border border-[#E8E4DC]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-[#EFECE6] text-[#2C2C2C] rounded-2xs transition-colors cursor-pointer"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4 text-[#736152]" />
            </button>
            <span className="px-3 text-xs font-semibold text-[#2C2C2C] tracking-wide whitespace-nowrap">
              {formatMonthTitle(currentYearMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-[#EFECE6] text-[#2C2C2C] rounded-2xs transition-colors cursor-pointer"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4 text-[#736152]" />
            </button>
          </div>

          {/* Region Filter Tabs: 전체 | 국내 | 해외 */}
          <div className="flex items-center bg-[#F5F2EB] p-1 rounded-2xs border border-[#E8E4DC] text-xs font-medium">
            <button
              onClick={() => setRegionFilter('ALL')}
              className={`px-3 py-1.5 rounded-2xs transition-all cursor-pointer ${
                regionFilter === 'ALL'
                  ? 'bg-[#736152] text-white shadow-2xs font-semibold'
                  : 'text-[#5C4E43] hover:text-[#2C2C2C]'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setRegionFilter('DOMESTIC')}
              className={`px-3 py-1.5 rounded-2xs transition-all cursor-pointer ${
                regionFilter === 'DOMESTIC'
                  ? 'bg-[#736152] text-white shadow-2xs font-semibold'
                  : 'text-[#5C4E43] hover:text-[#2C2C2C]'
              }`}
            >
              국내
            </button>
            <button
              onClick={() => setRegionFilter('OVERSEAS')}
              className={`px-3 py-1.5 rounded-2xs transition-all cursor-pointer ${
                regionFilter === 'OVERSEAS'
                  ? 'bg-[#736152] text-white shadow-2xs font-semibold'
                  : 'text-[#5C4E43] hover:text-[#2C2C2C]'
              }`}
            >
              해외
            </button>
          </div>

          {/* Refresh Button: 최신 정보 새로고침 */}
          <button
            onClick={() => fetchBest5(true)}
            disabled={loading}
            className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F5F2EB] text-[#736152] border border-[#D4C8B8] text-xs font-medium rounded-2xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">최신 정보 새로고침</span>
          </button>
        </div>
      </div>

      {/* 2. Verification Count Badge Banner */}
      <div className="flex items-center justify-between bg-[#FAF8F5] p-3.5 rounded-2xs border border-[#E8E4DC] text-xs">
        <div className="flex items-center space-x-2 text-[#423C36]">
          <ShieldCheck className="w-4 h-4 text-[#1E5647] shrink-0" />
          <span className="font-semibold text-[#2C2C2C]">
            현재 확인 가능한 주요 사례 {items.length}건
          </span>
          <span className="hidden sm:inline text-[#786658]">
            (검증된 공식 1차 출처 기반 · 가상 샘플 데이터 미생성)
          </span>
        </div>

        <div className="text-[11px] text-[#786658] font-mono hidden md:block">
          *근거 없는 AI Score를 배제하고 실무 적합성을 최우선 분석합니다.
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-[#736152] animate-spin mx-auto" />
          <p className="text-xs text-[#786658] font-mono">
            {formatMonthTitle(currentYearMonth)} 동종업계 주요 사례를 확인 중입니다...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xs text-xs">
          {error}
        </div>
      )}

      {/* 3. Cards Grid (BEST 5 Items) */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-[#FAF8F5] hover:bg-white border border-[#E8E4DC] hover:border-[#8C5D28] rounded-2xs p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between space-y-4"
            >
              {/* Card Header Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-[#2C2C2C] group-hover:bg-[#8C5D28] text-white text-[11px] font-mono font-bold rounded-2xs flex items-center justify-center transition-colors">
                      {item.rank}
                    </span>
                    <span className="px-2 py-0.5 bg-[#EFECE6] text-[#736152] text-[10px] font-mono font-bold rounded-2xs border border-[#D4C8B8]">
                      {item.regionText}
                    </span>
                  </div>

                  {/* Category Tags (1~2 tags) */}
                  <div className="flex items-center space-x-1">
                    {item.categoryTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-[#E2ECE9] text-[#1E5647] text-[10px] font-medium rounded-2xs"
                      >
                        {getCategoryTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hotel/Resort Name */}
                <div>
                  <div className="text-[11px] font-medium text-[#786658] flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-[#8C7A6B]" />
                    <span className="truncate">{item.hotelResortName} ({item.companyBrand})</span>
                  </div>
                  
                  {/* Promotion/Program/Partnership Name */}
                  <h3 className="text-sm font-bold text-[#2C2C2C] mt-1 leading-snug group-hover:text-[#8C5D28] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>

                {/* 한 줄 핵심 내용 */}
                <div className="text-xs text-[#423C36] leading-relaxed line-clamp-2 bg-white/80 p-2.5 rounded-2xs border border-[#E8E4DC]">
                  {item.oneLineSummary}
                </div>

                {/* 왜 주목했는지 */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#8C5D28] uppercase block">
                    왜 주목했는가
                  </span>
                  <p className="text-xs text-[#5C4E43] leading-normal line-clamp-2">
                    {item.whyNoticed}
                  </p>
                </div>

                {/* Oak Valley / PARK ROCHE 참고 포인트 1줄 */}
                <div className="pt-2 border-t border-[#E8E4DC]/80 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#1E5647] uppercase block">
                    실무 참고 포인트
                  </span>
                  <p className="text-xs text-[#2C2C2C] font-medium leading-normal line-clamp-2">
                    {item.oakValleyReference}
                  </p>
                </div>
              </div>

              {/* Action Button: [자세히 보기] */}
              <div className="pt-2">
                <button
                  onClick={() => handleOpenDetail(item)}
                  className="w-full py-2 bg-[#F5F2EB] group-hover:bg-[#736152] text-[#736152] group-hover:text-white text-xs font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>자세히 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Detail Modal */}
      <CompetitorBest5DetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

    </section>
  );
};
