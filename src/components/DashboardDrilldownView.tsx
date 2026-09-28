import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Building2,
  Compass,
  Bookmark,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  FileText,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import {
  ActiveTab,
  ExecutiveDashboardData,
  DashboardCoreInsight,
  DashboardFeaturedBrand,
  DashboardCompetitorPromotion,
  DashboardSavedAnalysisItem
} from '../types';
import { filterOutInternalBrands, deduplicateBrands } from '../utils/internalBrandFilter';

export type DrilldownType =
  | 'market_signals'
  | 'featured_brands'
  | 'competitor_promotions'
  | 'saved_deals';

interface DashboardDrilldownViewProps {
  type: DrilldownType;
  dashboardData: ExecutiveDashboardData | null;
  savedItems: DashboardSavedAnalysisItem[];
  onBack: () => void;
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onRefreshItem: (type: DrilldownType) => Promise<void>;
  isRefreshing: boolean;
}

export const DashboardDrilldownView: React.FC<DashboardDrilldownViewProps> = ({
  type,
  dashboardData,
  savedItems,
  onBack,
  onSearchTrend,
  onSearchCompany,
  onNavigateTab,
  onRefreshItem,
  isRefreshing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // 1. Market Signals Data
  const signalsList: DashboardCoreInsight[] = useMemo(() => {
    return dashboardData?.marketSignals && dashboardData.marketSignals.length > 0
      ? dashboardData.marketSignals
      : dashboardData?.todaysSignals || [];
  }, [dashboardData]);

  // 2. Featured Brands Data
  const brandsList: DashboardFeaturedBrand[] = useMemo(() => {
    return dashboardData?.featuredBrands || [];
  }, [dashboardData]);

  // 3. Competitor Promotions Data
  const promotionsList: DashboardCompetitorPromotion[] = useMemo(() => {
    const raw = dashboardData?.competitorPromotions || [];
    const filtered = filterOutInternalBrands(raw);
    return deduplicateBrands(filtered, 1);
  }, [dashboardData]);

  // Derive categories for filter pills based on type
  const categories = useMemo(() => {
    if (type === 'market_signals') {
      const cats = Array.from(new Set(signalsList.map((s) => s.category.split(' · ')[0]))).filter(Boolean);
      return ['전체', ...cats];
    }
    if (type === 'featured_brands') {
      const cats = Array.from(new Set(brandsList.map((b) => b.industry.split(' · ')[0]))).filter(Boolean);
      return ['전체', ...cats];
    }
    if (type === 'competitor_promotions') {
      const cats = Array.from(new Set(promotionsList.map((p) => p.type))).filter(Boolean);
      return ['전체', ...cats];
    }
    if (type === 'saved_deals') {
      const cats = Array.from(new Set(savedItems.map((s) => s.type))).filter(Boolean);
      return ['전체', ...cats];
    }
    return ['전체'];
  }, [type, signalsList, brandsList, promotionsList, savedItems]);

  // Filtered lists
  const filteredSignals = useMemo(() => {
    return signalsList.filter((sig) => {
      const matchesSearch =
        !searchQuery ||
        sig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sig.whyNotable.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sig.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === '전체' || sig.category.includes(selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [signalsList, searchQuery, selectedCategory]);

  const filteredBrands = useMemo(() => {
    return brandsList.filter((b) => {
      const matchesSearch =
        !searchQuery ||
        b.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.recentActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.partnershipAngle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === '전체' || b.industry.includes(selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [brandsList, searchQuery, selectedCategory]);

  const filteredPromotions = useMemo(() => {
    return promotionsList.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === '전체' || p.type.includes(selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [promotionsList, searchQuery, selectedCategory]);

  const filteredSavedItems = useMemo(() => {
    return savedItems.filter((item) => {
      const matchesSearch =
        !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === '전체' || item.type === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [savedItems, searchQuery, selectedCategory]);

  // Title and config based on drilldown type
  const config = useMemo(() => {
    switch (type) {
      case 'market_signals':
        return {
          title: '이번 주 주요 트렌드',
          englishTitle: 'Weekly Market Trends & Insights',
          count: signalsList.length,
          unit: '건',
          icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
          desc: '최신 시장 데이터를 종합 분석한 핵심 트렌드 및 변화 동향 목록입니다.',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'featured_brands':
        return {
          title: '이번 주 주목 브랜드',
          englishTitle: 'Featured Brands for Cross-Industry Partnership',
          count: brandsList.length,
          unit: '개 브랜드',
          icon: <Building2 className="w-5 h-5 text-blue-600" />,
          desc: 'F&B, 뷰티, 아웃도어, 가구, 모빌리티 등 오크밸리와 시너지를 낼 수 있는 이종 산업군 브랜드입니다.',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'competitor_promotions':
        return {
          title: '동종사 이벤트 · 프로모션',
          englishTitle: 'Competitor Resort & Golf Promotions',
          count: promotionsList.length,
          unit: '건',
          icon: <Compass className="w-5 h-5 text-amber-600" />,
          desc: '경쟁 리조트, 호텔, 골프장의 공식 웹사이트 및 언론 보도를 기반으로 수집된 실제 프로모션 현황입니다.',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'saved_deals':
        return {
          title: '저장된 제휴 검토',
          englishTitle: 'Saved Deals & Analysis Reports',
          count: savedItems.length,
          unit: '개 항목',
          icon: <Bookmark className="w-5 h-5 text-[#736152]" />,
          desc: '사용자가 직접 작성하고 저장한 제안서, 제휴 조건 계산 내역, 기업/트렌드 분석 내역입니다.',
          badgeBg: 'bg-[#F5F0EB] text-[#736152] border-[#E5DDD3]',
        };
    }
  }, [type, signalsList.length, brandsList.length, promotionsList.length, savedItems.length]);

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      
      {/* 1. TOP NAVIGATION & HEADER */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DDD3] pb-5">
          {/* Back button */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F5F0EB] border border-[#E5DDD3] text-[#2C2C2C] hover:text-[#736152] text-xs font-bold rounded-xl transition-all cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기</span>
          </button>

          {/* Refresh and Timestamp */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DDD3] text-[#736152] text-xs rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>
                업데이트: <strong className="text-[#2C2C2C]">{dashboardData?.lastUpdated || '2026.09.01 09:00'}</strong>
              </span>
            </div>

            {type !== 'saved_deals' && (
              <button
                onClick={() => onRefreshItem(type)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? '조회 중...' : '이 항목만 새로고침'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Title and Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
                {config.icon}
              </div>
              <h1 className="text-2xl font-extrabold text-[#2C2C2C] tracking-tight">
                {config.title}
              </h1>
              <span className={`px-2.5 py-1 border text-xs font-extrabold rounded-lg ${config.badgeBg}`}>
                총 {config.count} {config.unit}
              </span>
            </div>
            <p className="text-xs text-[#736152] leading-relaxed max-w-3xl">
              {config.desc}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="pt-4 border-t border-[#E5DDD3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 내용, 브랜드, 카테고리 검색..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-xs text-[#2C2C2C] placeholder-[#8C7A6B] focus:outline-none focus:border-[#736152] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-[#8C7A6B] shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              필터:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#736152] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#736152] hover:bg-[#F5F0EB] border border-[#E5DDD3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DRILLDOWN CONTENT LIST */}
      
      {/* 2-A. MARKET SIGNALS (14 items) */}
      {type === 'market_signals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#736152]">
              전체 {signalsList.length}건 중 {filteredSignals.length}건 표시
            </span>
            <span className="text-[11px] text-[#8C7A6B] font-mono">
              Dashboard와 100% 동일한 데이터셋
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSignals.map((sig, idx) => (
              <div
                key={sig.id || `sig-${idx}`}
                className="bg-white border border-[#D4C8B8] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8C7A6B] hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Category & Badge Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-[#F5F0EB] text-[#736152] text-[11px] font-bold rounded-lg">
                        {sig.category}
                      </span>
                      {sig.isNew && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-md animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#8C7A6B] font-mono">
                        확인일: {sig.verifiedDate || dashboardData?.verifiedDate || '2026.09.01'}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {sig.evidenceLevel || '검증 완료'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-[#2C2C2C] group-hover:text-[#736152] transition-colors leading-snug break-keep">
                    {sig.title}
                  </h3>

                  {/* Key Details */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      핵심 내용 & 주목 이유
                    </span>
                    <p className="text-xs text-[#2C2C2C] leading-relaxed break-keep">
                      {sig.whyNotable}
                    </p>
                  </div>

                  {/* Oak Valley Relevance */}
                  <div className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] font-bold text-[#736152] flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-[#8C7A6B]" />
                      오크밸리 전략적 시사점
                    </span>
                    <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed break-keep">
                      {sig.oakValleyAngle}
                    </p>
                  </div>
                </div>

                {/* Source & Actions */}
                <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[#8C7A6B] truncate max-w-[220px]">
                    출처: {sig.source}
                  </span>
                  <button
                    onClick={() => onSearchTrend(sig.title, sig)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#736152] hover:text-white border border-[#D4C8B8] text-[#2C2C2C] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <span>트렌드 심층 분석하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSignals.length === 0 && (
            <div className="bg-white border border-[#D4C8B8] rounded-2xl p-12 text-center space-y-3">
              <Info className="w-8 h-8 text-[#8C7A6B] mx-auto" />
              <p className="text-sm font-bold text-[#2C2C2C]">검색 조건에 맞는 트렌드가 없습니다.</p>
              <p className="text-xs text-[#736152]">검색어를 변경하거나 필터를 '전체'로 재설정해보세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 2-B. FEATURED BRANDS (18 items) */}
      {type === 'featured_brands' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#736152]">
              전체 {brandsList.length}개 브랜드 중 {filteredBrands.length}개 표시
            </span>
            <span className="text-[11px] text-[#8C7A6B] font-mono">
              다양한 이종 산업군 매핑 완료
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((b, idx) => (
              <div
                key={b.id || `fb-${idx}`}
                className="bg-white border border-[#D4C8B8] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#8C7A6B] hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Industry & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-[#FAF8F5] border border-[#E5DDD3] text-[#736152] rounded-md">
                        {b.industry}
                      </span>
                      {b.isNew && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-md animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      검증완료
                    </span>
                  </div>

                  {/* Brand Name */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#2C2C2C] group-hover:text-[#736152] transition-colors break-keep">
                      {b.brandName}
                    </h3>
                    <p className="text-xs text-[#736152] mt-1.5 leading-relaxed break-keep">
                      <strong className="text-[#2C2C2C] font-semibold">최근 움직임: </strong>
                      {b.recentActivity}
                    </p>
                  </div>

                  {/* Why Notable */}
                  <div className="space-y-1 pt-2 border-t border-[#E5DDD3]">
                    <span className="text-[10px] font-bold text-[#8C7A6B] block">
                      왜 지금 주목하는가
                    </span>
                    <p className="text-xs text-[#2C2C2C] leading-relaxed break-keep">
                      {b.whyNotable}
                    </p>
                  </div>

                  {/* Oak Valley Partnership Angle */}
                  <div className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-bold text-[#736152] flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#8C7A6B]" />
                      오크밸리 제휴 연계 포인트
                    </span>
                    <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed break-keep">
                      {b.partnershipAngle}
                    </p>
                  </div>
                </div>

                {/* Source & Actions */}
                <div className="pt-3 border-t border-[#E5DDD3] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#8C7A6B]">
                    <span className="truncate max-w-[150px]">출처: {b.source}</span>
                    <span className="font-mono">확인일: {b.verifiedDate || dashboardData?.verifiedDate || '2026.09.01'}</span>
                  </div>
                  <button
                    onClick={() => onSearchCompany(b.brandName, b)}
                    className="w-full py-2 bg-white border border-[#D4C8B8] hover:bg-[#736152] hover:text-white text-[#2C2C2C] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>기업 상세분석하기</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredBrands.length === 0 && (
            <div className="bg-white border border-[#D4C8B8] rounded-2xl p-12 text-center space-y-3">
              <Info className="w-8 h-8 text-[#8C7A6B] mx-auto" />
              <p className="text-sm font-bold text-[#2C2C2C]">검색 조건에 맞는 주목 브랜드가 없습니다.</p>
              <p className="text-xs text-[#736152]">검색어를 변경하거나 필터를 '전체'로 재설정해보세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 2-C. COMPETITOR PROMOTIONS (12 items) */}
      {type === 'competitor_promotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#736152]">
              전체 {promotionsList.length}건 중 {filteredPromotions.length}건 표시
            </span>
            <span className="text-[11px] text-[#8C7A6B] font-mono">
              공식 홈페이지 및 언론 검증 데이터
            </span>
          </div>

          <div className="space-y-3">
            {filteredPromotions.map((cp, idx) => (
              <div
                key={cp.id || `cp-${idx}`}
                className="bg-white border border-[#D4C8B8] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-[#8C7A6B] hover:shadow-md transition-all group"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-[#2C2C2C]">
                      {cp.facilityName}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-md">
                      {cp.type}
                    </span>
                    {cp.isNew && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-md animate-pulse">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-[#8C7A6B] font-mono bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DDD3] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8C7A6B]" />
                      기간: {cp.period}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                    {cp.title}
                  </h3>

                  <p className="text-xs text-[#736152] leading-relaxed">
                    {cp.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-[#2C2C2C]">
                      <span className="font-bold text-[#736152]">참고 포인트:</span>
                      <span>{cp.whyNotable}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E5DDD3]">
                  <div className="text-[11px] text-[#8C7A6B] text-right space-y-0.5">
                    <span className="block max-w-[200px] truncate">공식 출처: {cp.source}</span>
                    <span className="font-mono text-[10px]">확인일: {cp.verifiedDate || dashboardData?.verifiedDate || '2026.09.01'}</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('competitor')}
                    className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#736152] hover:text-white border border-[#D4C8B8] text-[#2C2C2C] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>동종업계 트렌드 분석</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPromotions.length === 0 && (
            <div className="bg-white border border-[#D4C8B8] rounded-2xl p-12 text-center space-y-3">
              <Info className="w-8 h-8 text-[#8C7A6B] mx-auto" />
              <p className="text-sm font-bold text-[#2C2C2C]">검색 조건에 맞는 동종사 프로모션이 없습니다.</p>
              <p className="text-xs text-[#736152]">검색어를 변경하거나 필터를 '전체'로 재설정해보세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 2-D. SAVED DEALS (Local Storage Real Items) */}
      {type === 'saved_deals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#736152]">
              실제 저장된 제휴 검토 내역 ({filteredSavedItems.length}개)
            </span>
            <span className="text-[11px] text-[#8C7A6B] font-mono">
              실제 사용자 세션 데이터만 표시 (가짜 데이터 없음)
            </span>
          </div>

          {savedItems.length === 0 ? (
            <div className="bg-white border border-[#D4C8B8] rounded-2xl p-12 text-center space-y-4">
              <Bookmark className="w-10 h-10 text-[#8C7A6B] mx-auto opacity-50" />
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#2C2C2C]">
                  아직 저장된 제휴 검토 내역이 없습니다.
                </h3>
                <p className="text-xs text-[#736152] max-w-md mx-auto leading-relaxed">
                  기업 분석, 제휴 조건 산정 계산기 또는 제안서 생성 후 저장하시면 이 곳에서 히스토리를 모아보고 빠르게 불러올 수 있습니다.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateTab('partnership')}
                  className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  제휴 조건 계산기 실행
                </button>
                <button
                  onClick={() => onNavigateTab('proposal')}
                  className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#F5F0EB] border border-[#D4C8B8] text-[#2C2C2C] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  제휴 제안서 작성하기
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#D4C8B8] rounded-2xl divide-y divide-[#E5DDD3] overflow-hidden">
              {filteredSavedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 bg-[#F5F0EB] text-[#736152] text-xs font-bold rounded-lg shrink-0">
                      {item.type}
                    </span>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#2C2C2C] truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-[#8C7A6B] font-mono">
                        저장일: {item.date}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item.type === '기업 분석' && item.payload) {
                        onSearchCompany(item.payload, item);
                      } else if (item.type === '트렌드 분석' && item.payload) {
                        onSearchTrend(item.payload, item);
                      } else {
                        onNavigateTab(item.targetTab);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D4C8B8] hover:bg-[#736152] hover:text-white text-[#2C2C2C] text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <span>열기 / 편집</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
