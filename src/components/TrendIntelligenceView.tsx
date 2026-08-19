import React, { useState } from 'react';
import { TrendReport, TrendFilter } from '../types';
import {
  Search, Filter, TrendingUp, BarChart3, Building2, Lightbulb,
  ArrowRight, ShieldCheck, RefreshCw, Download, TreePine, Sparkles, Compass, CheckCircle2, Zap, BookOpen
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { exportTrendReportToPPTX } from '../utils/pptExporter';
import { SourcesAndReferencesSection } from './SourcesAndReferencesSection';
import { KnowledgeBaseBadge } from './KnowledgeBaseBadge';

interface TrendIntelligenceViewProps {
  report: TrendReport | null;
  loading: boolean;
  error?: string | null;
  onSearch: (query: string, filter?: Partial<TrendFilter>) => void;
  onAnalyzeCompany: (companyName: string) => void;
}

export const TrendIntelligenceView: React.FC<TrendIntelligenceViewProps> = ({
  report,
  loading,
  error,
  onSearch,
  onAnalyzeCompany,
}) => {
  const [searchInput, setSearchInput] = useState(report?.query || '');
  const [filterPeriod, setFilterPeriod] = useState<TrendFilter['period']>('최근 1년');
  const [filterRegion, setFilterRegion] = useState<TrendFilter['region']>('한국');
  const [filterCategory, setFilterCategory] = useState<TrendFilter['category']>('Wellness');
  const [showFilters, setShowFilters] = useState(true);

  React.useEffect(() => {
    if (report?.query) {
      setSearchInput(report.query);
    }
  }, [report?.query]);

  // Mobile Collapsible Sections State (default all open, but togglable)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const presetQueries = [
    '요가',
    '초콜릿',
    '향수',
    '반려동물',
    '피클볼',
    '수면',
    '키즈',
    '와인',
    '캠핑',
    '2026 웰니스 트렌드',
    '최근 팝업스토어 트렌드',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim(), {
        period: filterPeriod,
        region: filterRegion,
        category: filterCategory,
      });
    }
  };

  const handlePresetClick = (q: string) => {
    setSearchInput(q);
    onSearch(q, {
      period: filterPeriod,
      region: filterRegion,
      category: filterCategory,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Search Section */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded-xs uppercase tracking-wider">
                Market & Trend Radar
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-900">Market & Trend Radar</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              글로벌 시장 변화, 소비자 기호 전환, 브랜드 선도 사례 및 사업화 기회 분석
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-mono text-slate-400">STATUS:</span>
            <span className="inline-flex items-center space-x-1 text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini AI Engine Connected</span>
            </span>
          </div>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:block">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="어떤 시장이나 트렌드를 조사할까요?"
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-32 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs min-h-[48px]"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 sm:left-4 top-3.5 sm:top-4" />
            <button
              id="trend-search-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-5 py-3 sm:py-0 bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-xs font-semibold rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] sm:min-h-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" />
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <span>인텔리전스 보고서 생성</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Preset Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 font-mono">예시 검색어:</span>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handlePresetClick(q)}
                  className={`px-3 py-1 text-xs border rounded-xs transition-all cursor-pointer ${
                    report?.query === q
                      ? 'bg-slate-900 text-white border-slate-900 font-medium'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Search Filters Toolbar */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 uppercase tracking-wider font-mono">
                <Filter className="w-3.5 h-3.5 text-slate-600" />
                <span>검색 필터 (기간 / 지역 / 카테고리)</span>
              </div>
              <span className="text-xs text-slate-400">{showFilters ? '접기 ▲' : '펼치기 ▼'}</span>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                {/* Period */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">기간</label>
                  <div className="flex flex-wrap gap-1">
                    {(['최근 1개월', '최근 3개월', '최근 6개월', '최근 1년'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFilterPeriod(p)}
                        className={`px-2.5 py-1 text-xs border rounded-xs ${
                          filterPeriod === p
                            ? 'bg-slate-800 text-white border-slate-800 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">지역</label>
                  <div className="flex flex-wrap gap-1">
                    {(['한국', '글로벌', '미국', '일본', '유럽'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFilterRegion(r)}
                        className={`px-2.5 py-1 text-xs border rounded-xs ${
                          filterRegion === r
                            ? 'bg-slate-800 text-white border-slate-800 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">카테고리</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900"
                  >
                    {[
                      'Marketing', 'Travel', 'Hospitality', 'Golf', 'Wellness',
                      'Sports', 'F&B', 'Fashion', 'Beauty', 'Retail', 'Technology', 'Entertainment'
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Loading Skeleton View */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-sm p-8 space-y-6 text-center animate-pulse">
          <div className="inline-flex items-center space-x-2 text-slate-600 text-sm font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
            <span>AI 컨설팅 시스템이 시장 데이터 및 실시간 트렌드를 분석하고 있습니다...</span>
          </div>
          <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto"></div>
          <div className="h-24 bg-slate-100 rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-100 rounded"></div>
            <div className="h-40 bg-slate-100 rounded"></div>
          </div>
        </div>
      )}

      {/* Error Message View */}
      {!loading && error && (
        <div className="bg-white border border-rose-200 rounded-sm p-8 text-center space-y-3 shadow-2xs">
          <div className="text-rose-600 font-semibold text-base">
            {error}
          </div>
          <p className="text-xs text-slate-500">
            검색 키워드를 확인하시고 다시 시도하시거나, 추천 키워드를 클릭해보세요.
          </p>
        </div>
      )}

      {/* Empty Initial State View */}
      {!loading && !report && !error && (
        <div className="bg-white border border-slate-200 rounded-sm p-10 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold font-serif text-slate-900">
              트렌드 검색어를 입력해주세요
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              상단 검색창에 조사하고자 하는 시장, 카테고리 또는 트렌드 키워드를 입력하시면 AI가 근거 기반 인텔리전스 보고서를 즉시 생성합니다.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {presetQueries.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handlePresetClick(q)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xs text-xs font-medium text-slate-700 cursor-pointer transition-colors"
              >
                🔍 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Content Display */}
      {!loading && report && (
        <div className="space-y-8">
          
          {/* Knowledge Base Usage Evidence Badge */}
          <KnowledgeBaseBadge metadata={report.knowledgeBaseMetadata} />

          {/* Report Title Bar */}
          <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 rounded-xs border border-[#5C4E43] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#D4C8B8]">REPORT ID: TR-{Math.floor(Math.random()*8999 + 1000)}</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#5C4E43] text-[#EFECE6] rounded-xs font-mono">
                  {report.filters.region} • {report.filters.period} • {report.filters.category}
                </span>
              </div>
              <h2 className="text-2xl font-serif-display font-bold text-[#FAF8F5] mt-1">
                {report.query} Intelligence Report
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="explore-related-companies-btn"
                onClick={() => {
                  const targetComp = report.brandCases?.[0]?.brandName || report.opportunities?.[0]?.possiblePartner?.split(',')[0] || report.query;
                  onAnalyzeCompany(targetComp);
                }}
                className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer font-sans"
              >
                <span>관련 기업 탐색 &rarr;</span>
              </button>

              <button
                id="export-trend-ppt-btn"
                onClick={() => exportTrendReportToPPTX(report)}
                className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#2C2C2C] text-xs font-medium rounded-xs transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#736152]" />
                <span>PPT 다운로드</span>
              </button>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-4 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('execSummary')}
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">1. Executive Summary</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">핵심 변화 요약</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['execSummary'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['execSummary'] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 sm:p-5 space-y-3">
                {(report.executiveSummary || []).map((summary, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <span>{summary}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 2. Key Trends */}
          <section className="space-y-4">
            <div 
              className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('keyTrends')}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">2. Key Trends</h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">동인 및 발전 전망</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">{report.keyTrends?.length || 0} KEY SHIFTS</span>
                <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                  {collapsedSections['keyTrends'] ? '펼치기 ▲' : '접기 ▼'}
                </button>
              </div>
            </div>

            {!collapsedSections['keyTrends'] && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(report.keyTrends || []).map((trend) => (
                <div key={trend.id} className="bg-white border border-slate-200 rounded-sm p-6 space-y-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {trend.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono border border-slate-200 rounded-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-base font-serif font-bold text-slate-900 leading-snug">
                      {trend.title}
                    </h4>

                    <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xs border border-slate-100 leading-relaxed">
                      {trend.description}
                    </p>

                    <div className="space-y-2.5 text-xs text-slate-600 pt-1">
                      <div>
                        <strong className="text-slate-900 block mb-0.5">■ 왜 성장하는가?</strong>
                        <p className="leading-relaxed text-slate-700">{trend.whyGrowing}</p>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-0.5">■ 소비자 행동 변화:</strong>
                        <p className="leading-relaxed text-slate-700">{trend.consumerBehavior}</p>
                      </div>

                      <div>
                        <strong className="text-slate-900 block mb-0.5">■ 기업 활용 현황:</strong>
                        <p className="leading-relaxed text-slate-700">{trend.corporateUsage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-3">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">■ 향후 발전 가능성:</strong>
                      <p className="leading-relaxed text-slate-700 font-medium">{trend.futureOutlook}</p>
                    </div>

                    {/* OAK VALLEY OPPORTUNITY SECTION */}
                    {trend.oakValleyOpportunity && (
                      <div className="bg-slate-900 text-white rounded-xs p-4 space-y-3 border border-slate-800 mt-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center space-x-1.5">
                            <TreePine className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                              OAK VALLEY OPPORTUNITY
                            </span>
                          </div>
                          {trend.oakValleyOpportunity.opportunityScore && (
                            <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-black rounded-xs">
                              SCORE: {trend.oakValleyOpportunity.opportunityScore}/100
                            </span>
                          )}
                        </div>

                        {/* Recommended Assets */}
                        {trend.oakValleyOpportunity.recommendedAssets && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-mono">추천 자산:</span>
                            {trend.oakValleyOpportunity.recommendedAssets.map((ast, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-amber-300 text-[10px] font-mono border border-slate-700 rounded-xs">
                                {ast}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="space-y-1.5 text-[11px] text-slate-300">
                          <div>
                            <span className="text-slate-400 font-semibold block">추천 프로그램:</span>
                            <p className="text-white font-medium">{trend.oakValleyOpportunity.recommendedProgram}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[10px]">
                            <div>
                              <span className="text-slate-400">타깃 고객:</span> {trend.oakValleyOpportunity.targetCustomer}
                            </div>
                            <div>
                              <span className="text-slate-400">제휴 파트너군:</span> {trend.oakValleyOpportunity.potentialPartnerCategory}
                            </div>
                          </div>

                          <div className="pt-1 text-[10px]">
                            <span className="text-slate-400">수익 모델:</span> {trend.oakValleyOpportunity.businessModel}
                          </div>

                          {trend.oakValleyOpportunity.quickWin && (
                            <div className="bg-emerald-950/80 border border-emerald-800/80 p-2 rounded-xs text-[10px] text-emerald-200">
                              <strong className="text-emerald-300 block mb-0.5 font-mono uppercase">⚡ Quick Win (단기 추진)</strong>
                              {trend.oakValleyOpportunity.quickWin}
                            </div>
                          )}

                          {trend.oakValleyOpportunity.longTermOpportunity && (
                            <div className="bg-blue-950/80 border border-blue-800/80 p-2 rounded-xs text-[10px] text-blue-200">
                              <strong className="text-blue-300 block mb-0.5 font-mono uppercase">🚀 Long-Term Opportunity (장기 관점)</strong>
                              {trend.oakValleyOpportunity.longTermOpportunity}
                            </div>
                          )}

                          {trend.oakValleyOpportunity.spaceAndTouchpoints && (
                            <div className="text-[10px] text-slate-400 pt-1 font-mono">
                              📍 접점 공간: {trend.oakValleyOpportunity.spaceAndTouchpoints}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* 3. Numbers & Signals (Charts & Metrics) */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-6 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('numbersSignals')}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">3. Numbers & Signals</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">시장 규모 및 데이터 수치</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['numbersSignals'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['numbersSignals'] && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(report.metrics || []).map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xs p-4 sm:p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider block mb-1">
                        {metric.label}
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl sm:text-2xl font-bold font-serif text-slate-900">{metric.currentValue}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs border border-emerald-200 font-mono">
                          YoY {metric.yoyChange}
                        </span>
                      </div>
                    </div>

                    {metric.chartData && metric.chartData.length > 0 && (
                      <div className="h-28 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={metric.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '11px' }}
                              formatter={(val: any) => [`${val} ${metric.unit}`, metric.label]}
                            />
                            <Bar dataKey="value" fill="#0f172a" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 font-medium">
                      <span className="text-slate-400 block font-mono text-[10px] uppercase">Future Forecast</span>
                      {metric.forecast}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Brand Cases */}
          <section className="space-y-4">
            <div 
              className="flex items-center justify-between border-b border-slate-200 pb-2 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('brandCases')}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">4. Brand Cases</h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">국내외 대표 활용 사례</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['brandCases'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['brandCases'] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(report.brandCases || []).map((bc) => (
                  <div key={bc.id} className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 space-y-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-serif text-slate-900 px-2 py-0.5 bg-slate-100 rounded-xs border border-slate-200">
                          {bc.brandName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">CASE REPORT</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {bc.projectTitle}
                      </h4>

                      <div className="space-y-2 text-xs text-slate-700">
                        <div>
                          <strong className="text-slate-900 block mb-0.5">■ 수행 내용:</strong>
                          <p className="leading-relaxed">{bc.action}</p>
                        </div>

                        <div>
                          <strong className="text-slate-900 block mb-0.5">■ 주목할 이유:</strong>
                          <p className="leading-relaxed">{bc.whyNotable}</p>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-100">
                          <strong className="text-slate-900 block mb-0.5">■ 마케터 시사점:</strong>
                          <p className="leading-relaxed font-medium text-slate-800">{bc.takeaway}</p>
                        </div>
                      </div>
                    </div>

                    {/* CRITICAL CROSS-LINK BUTTON: Trend -> Company */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        id={`analyze-brand-${bc.brandName.toLowerCase()}`}
                        onClick={() => onAnalyzeCompany(bc.brandName)}
                        className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xs transition-colors cursor-pointer group min-h-[40px]"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors" />
                        <span>[{bc.brandName}] 기업 분석하기</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 5. Emerging Signals */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-6 space-y-4 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('emergingSignals')}
            >
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">5. Emerging Signals</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">초기 태동하는 신규 포착 신호</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['emergingSignals'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['emergingSignals'] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(report.emergingSignals || []).map((signal, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xs p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <h4 className="text-sm font-bold text-slate-900">{signal.title}</h4>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{signal.description}</p>
                    <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 font-mono">
                      <span className="text-slate-800 font-semibold font-sans">예상 파급력: </span>
                      {signal.potentialImpact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 6. Business Opportunity */}
          <section className="bg-slate-900 text-white rounded-sm p-6 sm:p-8 space-y-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block">STRATEGIC IMPLICATIONS</span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5">6. Business Opportunity & Partnership Ideas</h3>
              </div>
              <span className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded-xs border border-slate-700 font-mono">
                AI 추천 마케터 실행안
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(report.opportunities || []).map((opp) => (
                <div key={opp.id} className="bg-slate-800/90 border border-slate-700 rounded-xs p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="inline-block px-2.5 py-1 bg-blue-950 text-blue-300 text-xs font-semibold rounded-xs border border-blue-800">
                      기회 아이디어
                    </div>

                    <h4 className="text-lg font-bold text-white leading-snug">
                      {opp.opportunity}
                    </h4>

                    <div className="space-y-2 text-xs text-slate-300 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400 font-mono">타깃 고객:</span>
                        <span className="col-span-2 text-white font-medium">{opp.targetCustomer}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400 font-mono">추천 제휴 파트너:</span>
                        <span className="col-span-2 text-blue-300 font-semibold">{opp.possiblePartner}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-400 font-mono">비즈니스 모델:</span>
                        <span className="col-span-2 text-slate-200">{opp.businessModel}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xs border border-slate-700 mt-2">
                        <span className="text-emerald-400 font-mono font-semibold">기대 효과:</span>
                        <span className="col-span-2 text-emerald-200 font-medium">{opp.expectedBenefit}</span>
                      </div>
                    </div>
                  </div>

                  {/* CROSS-LINK BUTTON TO COMPANY INTELLIGENCE */}
                  <div className="pt-3 border-t border-slate-700">
                    <button
                      id={`analyze-partner-${opp.possiblePartner.split(',')[0].trim().toLowerCase()}`}
                      onClick={() => onAnalyzeCompany(opp.possiblePartner.split(',')[0].trim())}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-700 border border-slate-600 rounded-xs transition-colors cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>[{opp.possiblePartner.split(',')[0].trim()}] 파트너 기업 분석하기</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Sources & References */}
          {report.references && report.references.length > 0 && (
            <SourcesAndReferencesSection
              references={report.references}
              overallEvidenceLevel={report.evidenceLevel}
              title="7. Research Sources & References"
              description={`"${report.query}" 트렌드 인텔리전스는 정부기관, 글로벌 컨설팅 그룹, 산업 협회의 Tier 1~3 공식 출처와 검증된 데이터에 기반하여 작성되었습니다.`}
            />
          )}

        </div>
      )}

    </div>
  );
};
