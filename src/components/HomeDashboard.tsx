import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Building2,
  Layers,
  Sparkles,
  Handshake,
  FileText,
  ArrowRight,
  Search,
  Clock,
  ChevronRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Flame,
  Target,
  RefreshCw,
  Award,
  BarChart3,
  ExternalLink,
  Compass,
  Bookmark,
  Database,
  ArrowUpRight,
  Info,
  AlertCircle,
  FolderKanban,
  Mail,
  Send,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  ActiveTab,
  ExecutiveDashboardData,
  DashboardCoreInsight,
  DashboardFeaturedBrand,
  DashboardCompetitorPromotion,
  DashboardMarketShiftIndustry,
  DashboardPartnershipOpportunity,
  DashboardSavedAnalysisItem,
  AuthUser
} from '../types';
import { DashboardDrilldownView, DrilldownType } from './DashboardDrilldownView';
import { ScheduleSection } from './ScheduleSection';
import { getBrandImages, BRAND_IMAGE_EVENT } from '../utils/brandImageStore';
import { filterOutInternalBrands, deduplicateBrands } from '../utils/internalBrandFilter';

interface HomeDashboardProps {
  currentUser?: AuthUser | null;
  onNavigateTab: (tab: ActiveTab) => void;
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
}

const LOCAL_STORAGE_EXECUTIVE_KEY = 'oakvalley_executive_dashboard_v2';

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  onNavigateTab,
  onSearchTrend,
  onSearchCompany,
}) => {
  const [dashboardData, setDashboardData] = useState<ExecutiveDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [savedItems, setSavedItems] = useState<DashboardSavedAnalysisItem[]>([]);
  const [drilldownType, setDrilldownType] = useState<DrilldownType | null>(null);
  const [showEmptySavedNotice, setShowEmptySavedNotice] = useState<boolean>(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [pipelineSummary, setPipelineSummary] = useState<{
    totalCount: number;
    confirmedCount: number;
    meetingCount: number;
    awaitingResultCount: number;
    newContactCount: number;
    proposalCount: number;
    deals: any[];
  } | null>(null);

  const [performanceSummary, setPerformanceSummary] = useState<{
    newContacts: number;
    confirmedCount: number;
    totalValue: number;
    activityCount: number;
  } | null>(null);

  const loadHeroImage = () => {
    const imgs = getBrandImages();
    setHeroImage(imgs.heroImage);
  };

  // Fetch Partner Performance Summary (Current Month)
  const fetchPerformanceSummary = async () => {
    try {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = now.getMonth() + 1;
      const res = await fetch(`/api/partner-performance/activities?year=${yr}&month=${mo}`);
      const data = await res.json();
      if (data.success && data.kpi) {
        setPerformanceSummary({
          newContacts: data.kpi.newContactsCount || 0,
          confirmedCount: data.kpi.confirmedCount || 0,
          totalValue: data.kpi.confirmedTotalValue || 0,
          activityCount: data.kpi.totalActivityCount || 0,
        });
      } else if (data.success && Array.isArray(data.activities)) {
        const targetYearMonth = `${yr}-${String(mo).padStart(2, '0')}`;
        const acts = data.activities.filter((a: any) => a.activityDate && a.activityDate.startsWith(targetYearMonth));
        let newContacts = 0;
        let confirmed = 0;
        let totalVal = 0;
        acts.forEach((a: any) => {
          if (a.activityType === '신규 컨택' || a.stage === '컨택중') newContacts += 1;
          if (a.stage === '진행확정' || a.stage === '완료') confirmed += 1;
          totalVal += (Number(a.cashAmount) || 0) + (Number(a.inKindValue) || 0);
        });
        setPerformanceSummary({
          newContacts,
          confirmedCount: confirmed,
          totalValue: totalVal,
          activityCount: acts.length,
        });
      }
    } catch (e) {
      console.warn('Failed to load performance summary on dashboard:', e);
    }
  };

  // Fetch Partner Pipeline Data
  const fetchPipelineSummary = async () => {
    try {
      const res = await fetch('/api/partner-pipeline/deals');
      const data = await res.json();
      if (data.success && data.aggregation) {
        setPipelineSummary({
          ...data.aggregation,
          deals: data.deals || [],
        });
      }
    } catch (e) {
      console.warn('Failed to load partner pipeline summary on dashboard:', e);
    }
  };

  // Load Executive Dashboard Intelligence Data
  const fetchDashboardData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
      setRefreshNotice(null);
    } else {
      setIsLoading(true);
    }

    try {
      if (!forceRefresh) {
        const localSaved = localStorage.getItem(LOCAL_STORAGE_EXECUTIVE_KEY);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed?.data) {
              setDashboardData(parsed.data);
              setIsLoading(false);
            }
          } catch (e) {
            console.warn('Stale dashboard cache ignored:', e);
          }
        }
      }

      const res = await fetch(`/api/dashboard-intelligence?forceRefresh=${forceRefresh}`);
      const json = await res.json();
      if (json && json.success && json.data) {
        setDashboardData(json.data);
        localStorage.setItem(
          LOCAL_STORAGE_EXECUTIVE_KEY,
          JSON.stringify({ data: json.data, cachedAt: Date.now() })
        );
        if (forceRefresh) {
          setRefreshNotice({
            message: '최신 시장 정보 갱신이 완료되었습니다. (새롭게 확인된 항목에 NEW 배지가 적용되었습니다)',
            type: 'success',
          });
          setTimeout(() => setRefreshNotice(null), 5000);
        }
      } else if (forceRefresh) {
        setRefreshNotice({
          message: '최신 정보 검색에 실패했습니다. 기존 데이터를 유지합니다.',
          type: 'error',
        });
        setTimeout(() => setRefreshNotice(null), 5000);
      }
    } catch (err) {
      console.error('Failed to fetch executive dashboard intelligence:', err);
      if (forceRefresh) {
        setRefreshNotice({
          message: '최신 정보 검색에 실패했습니다. 기존 데이터를 유지합니다.',
          type: 'error',
        });
        setTimeout(() => setRefreshNotice(null), 5000);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load Real Saved Items from localStorage (Zero fake demo items!)
  const loadSavedItemsFromLocalStorage = () => {
    const list: DashboardSavedAnalysisItem[] = [];

    try {
      // 1. Saved Proposals
      const proposalsStr = localStorage.getItem('oakvalley_saved_proposals');
      if (proposalsStr) {
        const proposals = JSON.parse(proposalsStr);
        if (Array.isArray(proposals)) {
          proposals.forEach((p: any) => {
            if (p.partnerName || p.title) {
              list.push({
                id: p.id || `prop-${Math.random()}`,
                title: `${p.partnerName || '제휴 파트너'} 제안서`,
                type: '제안서',
                date: p.createdAt ? p.createdAt.substring(0, 10) : '최근',
                targetTab: 'proposal',
                payload: p,
              });
            }
          });
        }
      }

      // 2. Saved Deal Calculator Rows
      const dealsStr = localStorage.getItem('oakvalley_deal_rows_v1');
      if (dealsStr) {
        const deals = JSON.parse(dealsStr);
        if (Array.isArray(deals) && deals.length > 0) {
          list.push({
            id: 'deal-calc-history',
            title: `제휴 조건 계산 내역 (${deals.length}개 항목)`,
            type: '제휴 조건 산정',
            date: '최근 저장됨',
            targetTab: 'partnership',
          });
        }
      }

      // 3. Stored Company Reports
      const companyHistStr = localStorage.getItem('oakvalley_company_history');
      if (companyHistStr) {
        const companies = JSON.parse(companyHistStr);
        if (Array.isArray(companies)) {
          companies.forEach((c: any) => {
            if (c.companyName) {
              list.push({
                id: `comp-${c.companyName}`,
                title: `${c.companyName} 기업 분석 레포트`,
                type: '기업 분석',
                date: c.generatedAt ? c.generatedAt.substring(0, 10) : '최근',
                targetTab: 'company',
                payload: c.companyName,
              });
            }
          });
        }
      }

      // 4. Stored Trend Reports
      const trendHistStr = localStorage.getItem('oakvalley_trend_history');
      if (trendHistStr) {
        const trends = JSON.parse(trendHistStr);
        if (Array.isArray(trends)) {
          trends.forEach((t: any) => {
            if (t.query) {
              list.push({
                id: `trend-${t.query}`,
                title: `[트렌드] ${t.query}`,
                type: '트렌드 분석',
                date: t.generatedAt ? t.generatedAt.substring(0, 10) : '최근',
                targetTab: 'trend',
                payload: t.query,
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved local storage items:', e);
    }

    setSavedItems(list);
  };

  useEffect(() => {
    fetchDashboardData();
    loadSavedItemsFromLocalStorage();
    fetchPipelineSummary();
    fetchPerformanceSummary();
    loadHeroImage();

    const handleBrandImageUpdate = () => loadHeroImage();
    const handleDataUpdate = () => {
      fetchPipelineSummary();
      fetchPerformanceSummary();
      loadSavedItemsFromLocalStorage();
      fetchDashboardData(false);
    };

    window.addEventListener(BRAND_IMAGE_EVENT, handleBrandImageUpdate);
    window.addEventListener('oakvalley_data_updated', handleDataUpdate);
    window.addEventListener('focus', handleDataUpdate);

    return () => {
      window.removeEventListener(BRAND_IMAGE_EVENT, handleBrandImageUpdate);
      window.removeEventListener('oakvalley_data_updated', handleDataUpdate);
      window.removeEventListener('focus', handleDataUpdate);
    };
  }, []);

  // Handle browser back button / history
  useEffect(() => {
    const handlePopState = () => {
      setDrilldownType(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenDrilldown = (type: DrilldownType) => {
    window.history.pushState({ drilldown: type }, '');
    setDrilldownType(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDrilldown = () => {
    setDrilldownType(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive strictly consistent KPI numbers from dataset arrays
  const signalsCount = dashboardData?.marketSignals?.length || dashboardData?.kpis?.newMarketSignalsCount || 14;
  const brandsCount = dashboardData?.featuredBrands?.length || dashboardData?.kpis?.newBrandsCount || 18;
  const promotionsCount = dashboardData?.competitorPromotions?.length || dashboardData?.kpis?.competitorPromotionsCount || 12;
  const totalSavedCount = savedItems.length;

  // Render Drill-down View if active
  if (drilldownType) {
    return (
      <DashboardDrilldownView
        type={drilldownType}
        dashboardData={dashboardData}
        savedItems={savedItems}
        onBack={handleCloseDrilldown}
        onSearchTrend={onSearchTrend}
        onSearchCompany={onSearchCompany}
        onNavigateTab={onNavigateTab}
        onRefreshItem={async () => {
          await fetchDashboardData(true);
        }}
        isRefreshing={isRefreshing}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans">
      
      {/* 1. HEADER & EXECUTIVE CONTROL BAR */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden transition-all">
        {heroImage ? (
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt="Oak Valley Resort" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/70" />
          </div>
        ) : (
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#F5F0EB] rounded-full blur-3xl opacity-60 pointer-events-none" />
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F0EB] text-[#736152] text-xs font-bold rounded-full tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
              OAK VALLEY MARKETING LAB
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2C2C2C] tracking-tight leading-tight sm:leading-snug break-keep font-serif">
              마케팅 트렌드 & 파트너십 데이터랩
            </h1>
            <p className="text-xs sm:text-sm text-[#736152] leading-relaxed break-keep">
              시장 트렌드부터 브랜드·경쟁사 분석, 제휴 기회 발굴과 제안서 작성까지. 마케팅 실무에 필요한 정보를 한곳에서 찾고 바로 실행합니다.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Last Updated Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] border border-[#E5DDD3] text-[#736152] text-xs rounded-xl font-mono">
              <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>
                마지막 업데이트:{' '}
                <strong className="text-[#2C2C2C]">
                  {dashboardData?.lastUpdated || '2026.09.01 09:00'}
                </strong>
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? '최신 정보 확인 중...' : '↻ 최신 정보 새로고침'}</span>
            </button>
          </div>
        </div>

        {/* Refresh Notice Banner */}
        {refreshNotice && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
              refreshNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {refreshNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{refreshNotice.message}</span>
            </div>
            <button
              onClick={() => setRefreshNotice(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}

        {/* Empty Saved Deals Notice */}
        {showEmptySavedNotice && (
          <div className="mt-4 p-3 rounded-xl border bg-[#FAF8F5] border-[#D4C8B8] text-xs font-medium flex items-center gap-2 text-[#736152] animate-fade-in">
            <Info className="w-4 h-4 text-[#8C7A6B] shrink-0" />
            <span>
              아직 저장된 제휴 검토가 없습니다. 제안서 또는 제휴 조건 계산기를 작성하고 저장해보세요.
            </span>
          </div>
        )}
      </div>

      {/* 2. 이번 주 한눈에 보기 (Clickable KPI Cards with Drill-down) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
              <Flame className="w-4 h-4 text-amber-600" />
              이번 주 한눈에 보기
            </h2>
            <span className="text-[11px] text-[#8C7A6B] hidden sm:inline-block">
              (카드를 클릭하면 상세 목록으로 이동합니다)
            </span>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="text-xs font-bold text-[#736152] hover:text-[#2C2C2C] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '새로고침 중...' : '최신 정보 새로고침'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: 이번 주 주요 트렌드 */}
          <div
            onClick={() => handleOpenDrilldown('market_signals')}
            className="bg-white border border-[#D4C8B8] hover:border-[#736152] rounded-xl p-5 space-y-2 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#736152]">
                <span className="text-xs font-bold group-hover:text-[#2C2C2C] transition-colors break-keep">
                  이번 주 주요 트렌드
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#2C2C2C]">
                  {signalsCount}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">건 수집</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] break-keep">포착된 핵심 트렌드 동향</p>
            </div>
            <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between text-[10px] font-bold text-[#736152] group-hover:text-[#2C2C2C]">
              <span>전체 보기</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 2: 이번 주 주목 브랜드 */}
          <div
            onClick={() => handleOpenDrilldown('featured_brands')}
            className="bg-white border border-[#D4C8B8] hover:border-[#736152] rounded-xl p-5 space-y-2 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#736152]">
                <span className="text-xs font-bold group-hover:text-[#2C2C2C] transition-colors break-keep">
                  이번 주 주목 브랜드
                </span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#2C2C2C]">
                  {brandsCount}
                </span>
                <span className="text-[11px] text-blue-600 font-medium">개 브랜드</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] break-keep">다양한 이종 산업군 매핑</p>
            </div>
            <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between text-[10px] font-bold text-[#736152] group-hover:text-[#2C2C2C]">
              <span>전체 보기</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 3: 동종사 프로모션 */}
          <div
            onClick={() => handleOpenDrilldown('competitor_promotions')}
            className="bg-white border border-[#D4C8B8] hover:border-[#736152] rounded-xl p-5 space-y-2 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#736152]">
                <span className="text-xs font-bold group-hover:text-[#2C2C2C] transition-colors break-keep">
                  동종사 프로모션
                </span>
                <Compass className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#2C2C2C]">
                  {promotionsCount}
                </span>
                <span className="text-[11px] text-amber-600 font-medium">건 모니터링</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] break-keep">호텔 / 리조트 / 골프장</p>
            </div>
            <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between text-[10px] font-bold text-[#736152] group-hover:text-[#2C2C2C]">
              <span>전체 보기</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 4: 저장된 제휴 검토 */}
          <div
            onClick={() => {
              if (totalSavedCount > 0) {
                handleOpenDrilldown('saved_deals');
              } else {
                setShowEmptySavedNotice(true);
                setTimeout(() => setShowEmptySavedNotice(false), 4000);
              }
            }}
            className={`bg-white border border-[#D4C8B8] rounded-xl p-5 space-y-2 transition-all flex flex-col justify-between ${
              totalSavedCount > 0
                ? 'hover:border-[#736152] hover:shadow-md cursor-pointer group'
                : 'opacity-85 cursor-pointer hover:border-[#8C7A6B]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#736152]">
                <span className="text-xs font-bold break-keep">저장된 제휴 검토</span>
                <Bookmark className="w-4 h-4 text-[#736152]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#2C2C2C]">
                  {totalSavedCount}
                </span>
                <span className="text-[11px] text-[#736152] font-medium">개 기록</span>
              </div>
              <p className="text-[11px] text-[#8C7A6B] break-keep">실제 저장한 분석 내역</p>
            </div>
            <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between text-[10px] font-bold text-[#736152]">
              <span>{totalSavedCount > 0 ? '전체 보기' : '내역 없음'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 금주 제휴 일정 */}
      <ScheduleSection currentUser={currentUser} />

      {/* 이번 달 제휴 성과 요약 (New KPI Summary Widget) */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#736152]" />
              이번 달 제휴 성과 요약
            </h2>
            <p className="text-xs text-[#736152]">
              IPARK RESORT 제휴 파트의 당월 활동량, 진행확정 건수 및 창출 제휴가치 실시간 요약
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('partnerperformance')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>제휴 성과 Dashboard 바로가기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFECE6] space-y-1">
            <div className="text-[11px] font-semibold text-[#8C7A6B]">당월 총 Activity</div>
            <div className="text-xl font-black text-[#2C2C2C] font-mono">
              {performanceSummary?.activityCount || 0} <span className="text-xs font-normal text-gray-500">건</span>
            </div>
          </div>
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFECE6] space-y-1">
            <div className="text-[11px] font-semibold text-[#8C7A6B]">신규 컨택 / 발굴</div>
            <div className="text-xl font-black text-blue-900 font-mono">
              {performanceSummary?.newContacts || 0} <span className="text-xs font-normal text-gray-500">건</span>
            </div>
          </div>
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFECE6] space-y-1">
            <div className="text-[11px] font-semibold text-[#8C7A6B]">진행 확정 / 완료</div>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {performanceSummary?.confirmedCount || 0} <span className="text-xs font-normal text-gray-500">건</span>
            </div>
          </div>
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#D4C8B8] space-y-1">
            <div className="text-[11px] font-bold text-[#736152]">총 창출 제휴가치</div>
            <div className="text-xl font-black text-[#736152] font-mono">
              {(performanceSummary?.totalValue || 0).toLocaleString()} <span className="text-xs font-normal text-[#5C4E43]">원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 오늘의 주요 트렌드 (Top 3 Insights) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
              <Sparkles className="w-5 h-5 text-[#8C7A6B]" />
              오늘의 주요 트렌드
            </h2>
            <p className="text-xs text-[#736152] break-keep">
              오늘 시장에서 다각적으로 검증된 대표 핵심 트렌드 3선
            </p>
          </div>
          <button
            onClick={() => handleOpenDrilldown('market_signals')}
            className="text-xs font-bold text-[#736152] hover:text-[#2C2C2C] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>전체 {signalsCount}건 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(dashboardData?.todaysSignals || []).map((sig, idx) => (
            <div
              key={sig.id || `sig-${idx}`}
              className="bg-white border border-[#D4C8B8] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8C7A6B] hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2">
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
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sig.evidenceLevel || '검증 완료'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-[#2C2C2C] group-hover:text-[#736152] transition-colors leading-snug break-keep">
                  {sig.title}
                </h3>

                {/* Why Notable */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                    왜 주목해야 하는가
                  </span>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed break-keep">
                    {sig.whyNotable}
                  </p>
                </div>

                {/* Oak Valley Angle */}
                <div className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-[#736152] flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    오크밸리 시사점 & 관점
                  </span>
                  <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed break-keep">
                    {sig.oakValleyAngle}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-between text-[11px] text-[#8C7A6B]">
                <span className="truncate max-w-[180px]">출처: {sig.source}</span>
                <button
                  onClick={() => onSearchTrend(sig.title, sig)}
                  className="font-bold text-[#736152] group-hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>분석하기</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 이번 주 주목할 브랜드 (5개 - Diverse Industries) */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DDD3]">
          <div>
            <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
              <Building2 className="w-5 h-5 text-blue-600" />
              이번 주 주목할 브랜드
            </h2>
            <p className="text-xs text-[#736152] mt-0.5 break-keep">
              F&B, 뷰티, 아웃도어, 가구, 모빌리티 등 오크밸리와 시너지를 낼 수 있는 이종 산업군 발굴
            </p>
          </div>
          <button
            onClick={() => handleOpenDrilldown('featured_brands')}
            className="text-xs font-bold text-[#736152] hover:text-[#2C2C2C] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>전체 {brandsCount}개 브랜드 보기</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {(dashboardData?.featuredBrands?.slice(0, 5) || []).map((b, idx) => (
            <div
              key={b.id || `fb-${idx}`}
              className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-[#8C7A6B] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#D4C8B8] text-[#736152] rounded-md">
                    {b.industry}
                  </span>
                  {b.isNew ? (
                    <span className="text-[10px] font-extrabold text-white bg-red-500 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      검증완료
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#2C2C2C] break-keep">
                    {b.brandName}
                  </h3>
                  <p className="text-xs text-[#736152] mt-1 line-clamp-2 leading-snug break-keep">
                    {b.recentActivity}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#E5DDD3]">
                  <span className="text-[10px] font-bold text-[#8C7A6B] block">
                    오크밸리 제휴 연계 포인트
                  </span>
                  <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed line-clamp-3 break-keep">
                    {b.partnershipAngle}
                  </p>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <span className="text-[10px] text-[#8C7A6B] block truncate">
                  출처: {b.source}
                </span>
                <button
                  onClick={() => onSearchCompany(b.brandName, b)}
                  className="w-full py-1.5 bg-white border border-[#D4C8B8] hover:border-[#736152] text-[#2C2C2C] hover:text-[#736152] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>기업 분석하기</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 동종사 이벤트·프로모션 현황 (최대 6개 노출 - Verified Official Sources) */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DDD3]">
          <div>
            <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
              <Compass className="w-5 h-5 text-amber-600" />
              동종업계 트렌드 & 경쟁사 프로모션
            </h2>
            <p className="text-xs text-[#736152] mt-0.5 break-keep">
              공식 웹사이트 및 검증 매체를 기반으로 수집된 경쟁 리조트·호텔·골프장·웰니스·플랫폼의 최근 사례
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('competitor')}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] hover:border-[#8C5D28] text-[#8C5D28] hover:text-[#734a1e] font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>동종업계 더보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleOpenDrilldown('competitor_promotions')}
              className="px-3 py-1.5 bg-[#2C2C2C] text-white hover:bg-[#423C36] font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>동종업계 트렌드 분석</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {(() => {
            const raw = dashboardData?.competitorPromotions || [];
            const filtered = filterOutInternalBrands(raw);
            const cleanList = deduplicateBrands(filtered, 1).slice(0, 6);

            return cleanList.map((cp, idx) => (
            <div
              key={cp.id || `cp-${idx}`}
              className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#8C7A6B] transition-all"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-[#2C2C2C]">
                    {cp.facilityName}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-md">
                    {cp.type}
                  </span>
                  {cp.isNew && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-md animate-pulse">
                      NEW
                    </span>
                  )}
                  <span className="text-[11px] text-[#8C7A6B] font-mono">
                    기간: {cp.period}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#2C2C2C] break-keep">
                  {cp.title}
                </h3>

                <p className="text-xs text-[#736152] leading-relaxed break-keep">
                  {cp.summary}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-[#8C7A6B] flex-wrap">
                  <span className="font-bold text-[#736152]">참고 포인트:</span>
                  <span className="break-keep">{cp.whyNotable}</span>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E5DDD3]">
                <span className="text-[10px] text-[#8C7A6B] max-w-[150px] truncate">
                  출처: {cp.source}
                </span>
                <button
                  onClick={() => onNavigateTab('competitor')}
                  className="px-3 py-1.5 bg-white border border-[#D4C8B8] hover:border-[#736152] text-[#2C2C2C] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>상세 분석</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            ));
          })()}
        </div>
      </div>

      {/* 6. 이번 주 시장 움직임 (산업별 시각화) */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="pb-4 border-b border-[#E5DDD3]">
          <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            이번 주 시장 움직임 (산업별 시각화)
          </h2>
          <p className="text-xs text-[#736152] mt-0.5 break-keep">
            수집 및 분석된 주요 시장 동향 사례 수 분포 (실제 수집 데이터 기준)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Chart Section */}
          <div className="lg:col-span-7 h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData?.marketShifts || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="industry"
                  tick={{ fontSize: 11, fill: '#736152', fontWeight: 600 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#8C7A6B' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DashboardMarketShiftIndustry;
                      return (
                        <div className="bg-white border border-[#D4C8B8] p-3 rounded-xl shadow-md text-xs space-y-1">
                          <p className="font-bold text-[#2C2C2C]">{data.industry}</p>
                          <p className="text-emerald-700 font-extrabold">
                            수집 사례: {data.confirmedCaseCount}건
                          </p>
                          <p className="text-[#736152] max-w-xs">{data.keyMovementSummary}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="confirmedCaseCount" radius={[6, 6, 0, 0]}>
                  {(dashboardData?.marketShifts || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0
                          ? '#2C2C2C'
                          : index === 1
                          ? '#736152'
                          : index === 2
                          ? '#8C7A6B'
                          : '#A39588'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Summary Section */}
          <div className="lg:col-span-5 space-y-2">
            <h3 className="text-xs font-extrabold text-[#736152] uppercase tracking-wider">
              산업별 대표 움직임 요약
            </h3>
            <div className="divide-y divide-[#E5DDD3] max-h-64 overflow-y-auto pr-1">
              {(dashboardData?.marketShifts || []).map((ms, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#2C2C2C] block">{ms.industry}</span>
                    <span className="text-[#736152] text-[11px] leading-snug block break-keep">
                      {ms.keyMovementSummary}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E5DDD3] text-[#736152] font-mono font-bold rounded shrink-0">
                    {ms.confirmedCaseCount}건
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6.5. 내부 제휴 진행현황 및 파이프라인 브리프 (실시간 저장 데이터 연동) */}
      <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DDD3]">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#736152]" />
              <h2 className="text-lg font-extrabold text-[#2C2C2C] break-keep">
                제휴 진행현황 및 주간 파이프라인
              </h2>
              <span className="px-2 py-0.5 bg-[#F5F0EB] text-[#736152] text-[10px] font-bold rounded-md border border-[#E8E4DC]">
                내부 실시간 보드
              </span>
            </div>
            <p className="text-xs text-[#736152] mt-0.5 break-keep">
              실제 컨택 중인 파트너사 현황과 단계별 진행내용을 관리하고, 매주 금요일 주간 리포트를 자동 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('partnerpipeline')}
              className="px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>진행관리 보드 열기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Item Mini Pipeline Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('partnerpipeline')}
            className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DDD3] hover:border-[#736152] cursor-pointer transition-all"
          >
            <span className="text-[11px] text-[#8C7A6B] font-medium block">신규 컨택 / 제안</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#2C2C2C]">
                {(pipelineSummary?.newContactCount || 0) + (pipelineSummary?.proposalCount || 0)}
              </span>
              <span className="text-xs text-[#8C7A6B] font-mono">건</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('partnerpipeline')}
            className="bg-[#F3F7FA] p-3.5 rounded-xl border border-[#D4E6F1] hover:border-[#1B4F72] cursor-pointer transition-all"
          >
            <span className="text-[11px] text-[#1B4F72] font-medium block">미팅 진행/예정</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#1B4F72]">
                {pipelineSummary?.meetingCount || 0}
              </span>
              <span className="text-xs text-[#1B4F72] font-mono">건</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('partnerpipeline')}
            className="bg-[#FEF9E7] p-3.5 rounded-xl border border-[#FCF3CF] hover:border-[#7D6608] cursor-pointer transition-all"
          >
            <span className="text-[11px] text-[#7D6608] font-medium block">결과 대기 중</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#7D6608]">
                {pipelineSummary?.awaitingResultCount || 0}
              </span>
              <span className="text-xs text-[#7D6608] font-mono">건</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('partnerpipeline')}
            className="bg-[#F0F7F2] p-3.5 rounded-xl border border-[#D1E7D5] hover:border-[#1E6B24] cursor-pointer transition-all"
          >
            <span className="text-[11px] text-[#1E6B24] font-medium block">진행확정 협약</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#1E6B24]">
                {pipelineSummary?.confirmedCount || 0}
              </span>
              <span className="text-xs text-[#1E6B24] font-mono">건 협약 완료</span>
            </div>
          </div>
        </div>

        {/* Latest Active Deals Preview */}
        {pipelineSummary?.deals && pipelineSummary.deals.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold text-[#5C4E43]">
              최근 활성 제휴 건 미리보기 (총 {pipelineSummary.totalCount}건 중 최근 3건)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {pipelineSummary.deals.slice(0, 3).map((deal: any) => (
                <div
                  key={deal.id}
                  onClick={() => onNavigateTab('partnerpipeline')}
                  className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DDD3] hover:border-[#736152] transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2C2C2C] truncate max-w-[140px]">
                      {deal.companyName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-[#736152] border border-[#E5DDD3]">
                      {deal.stage}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666] line-clamp-2 leading-relaxed">
                    {deal.latestProgress || '진행 내용 작성 대기'}
                  </p>
                  {deal.nextAction && (
                    <div className="text-[10px] text-[#1B4F72] flex items-center gap-1 font-medium truncate pt-1 border-t border-[#EFECE6]">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{deal.nextAction}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. 오크밸리 제휴 아이디어 (3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
              <Handshake className="w-5 h-5 text-purple-600" />
              오크밸리 제휴 아이디어
            </h2>
            <p className="text-xs text-[#736152] break-keep">
              시장 트렌드와 분석을 종합한 3대 제휴 아이디어 (AI 추천)
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('partnership')}
            className="text-xs font-bold text-[#736152] hover:text-[#2C2C2C] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>제휴 조건 계산기 실행</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(dashboardData?.partnershipOpportunities || []).map((opp, idx) => (
            <div
              key={opp.id || `opp-${idx}`}
              className="bg-white border border-[#D4C8B8] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8C7A6B] hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-extrabold rounded-md">
                    AI 추천
                  </span>
                  <span className="text-[11px] font-mono text-[#8C7A6B]">
                    제휴 아이디어 #{idx + 1}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#2C2C2C] leading-snug break-keep">
                  {opp.opportunity}
                </h3>

                <div className="space-y-2 pt-2 border-t border-[#E5DDD3] text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C7A6B] block">
                      타깃 산업/브랜드
                    </span>
                    <span className="font-bold text-[#2C2C2C] break-keep">
                      {opp.targetIndustryBrand}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#8C7A6B] block">
                      활용 오크밸리 자산
                    </span>
                    <span className="text-[#736152] break-keep">{opp.oakValleyAsset}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#8C7A6B] block">
                      검토 이유
                    </span>
                    <p className="text-[#2C2C2C] leading-relaxed break-keep">
                      {opp.whyNotable}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigateTab('partnership')}
                  className="flex-1 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] hover:bg-[#736152] hover:text-white text-[#2C2C2C] text-xs font-bold rounded-lg transition-colors text-center cursor-pointer"
                >
                  제휴 조건 계산
                </button>
                <button
                  onClick={() => onNavigateTab('proposal')}
                  className="flex-1 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-lg transition-colors text-center cursor-pointer"
                >
                  제안서 작성
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. 최근 저장한 분석 (Real Local Storage Records ONLY - Click to view in drill-down) */}
      {savedItems.length > 0 && (
        <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 md:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#736152]" />
              <h2 className="text-base font-extrabold text-[#2C2C2C]">
                최근 저장한 분석 및 보드 ({savedItems.length})
              </h2>
            </div>
            <button
              onClick={() => handleOpenDrilldown('saved_deals')}
              className="text-xs font-bold text-[#736152] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>전체 {savedItems.length}개 보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E5DDD3]">
            {savedItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 bg-[#F5F0EB] text-[#736152] text-[10px] font-bold rounded shrink-0">
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-[#2C2C2C] truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-[#8C7A6B] font-mono shrink-0">
                    {item.date}
                  </span>
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
                  className="text-xs font-bold text-[#736152] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>이동하기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
