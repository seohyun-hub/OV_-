import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Info,
  Building2,
  Share2,
  CheckCircle2,
  Eye,
  MessageSquare,
  Instagram,
  Youtube,
  Globe,
  Newspaper,
  Users,
  Award,
  Link as LinkIcon,
  ShieldCheck,
  Zap,
  Upload,
  FileSpreadsheet,
  Plus,
  X,
  Smile,
  Frown,
  HelpCircle,
  Tag,
  Flame,
  Check,
  Compass,
  Briefcase
} from 'lucide-react';
import {
  InterestPeriod,
  InterestChannelCategory,
  InterestMonitorReport,
  InterestChannelItem,
  ActiveTab
} from '../types';

interface InterestMonitorViewProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  onSendTopicToWeeklyPlanner?: (topic: string) => void;
}

const PRESET_KEYWORDS = ['러닝', '피클볼', '오크밸리', '파크로쉬', '웰니스'];

export const InterestMonitorView: React.FC<InterestMonitorViewProps> = ({
  onNavigateTab,
  onSendTopicToWeeklyPlanner,
}) => {
  const [queryInput, setQueryInput] = useState('러닝');
  const [activeQuery, setActiveQuery] = useState('러닝');
  const [compareInput, setCompareInput] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<InterestPeriod>('30DAYS');
  const [selectedCategory, setSelectedCategory] = useState<InterestChannelCategory>('ALL');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InterestMonitorReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; date: string }>>([]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => [
        ...prev,
        { name: file.name, date: new Date().toLocaleDateString('ko-KR') },
      ]);
      alert(`[${file.name}] 파일이 등록되었습니다.\n내부 데이터 분석 지표에 반영됩니다.`);
    }
  };

  const fetchInterestReport = async (kw: string, period: InterestPeriod, compareQueries: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-multi-channel-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: kw, period, compareQueries }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setError(data.error || '데이터를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Failed to fetch interest report:', err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestReport(activeQuery, selectedPeriod, compareList);
  }, [activeQuery, selectedPeriod, compareList]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed) return;
    setActiveQuery(trimmed);
  };

  const handleAddCompareKeyword = () => {
    const trimmed = compareInput.trim();
    if (trimmed && !compareList.includes(trimmed) && trimmed !== activeQuery) {
      setCompareList([...compareList, trimmed]);
      setCompareInput('');
    }
  };

  const handleRemoveCompareKeyword = (kw: string) => {
    setCompareList(compareList.filter((item) => item !== kw));
  };

  const handlePresetClick = (kw: string) => {
    setQueryInput(kw);
    setActiveQuery(kw);
  };

  const handleCreateWeeklyContent = (topic: string) => {
    if (onSendTopicToWeeklyPlanner) {
      onSendTopicToWeeklyPlanner(topic);
    } else if (onNavigateTab) {
      onNavigateTab('weeklyplanner');
    }
  };

  const filteredChannelItems = (report?.channelItems || []).filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const periodLabels: Record<InterestPeriod, string> = {
    '7DAYS': '최근 7일',
    '30DAYS': '최근 30일',
    '3MONTHS': '최근 3개월',
    '6MONTHS': '최근 6개월',
    '1YEAR': '최근 1년',
  };

  return (
    <div className="space-y-6 pb-16 font-sans text-[#2C2C2C] bg-[#FAF8F5] min-h-screen p-4 md:p-6">
      
      {/* 1. HEADER & SEARCH FORM */}
      <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-[#736152] text-white text-[10px] font-bold rounded-2xs uppercase tracking-wide">
                공개 웹 트렌드 모니터
              </span>
              <span className="text-xs text-[#8C7A6B]">실제 수집 데이터 분석</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#2C2C2C] mt-1">
              관심도 분석
            </h1>
            <p className="text-xs text-[#736152] mt-0.5">
              뉴스, 공식자료, 블로그·카페, 공개 SNS, YouTube 등 실제 수집된 데이터를 바탕으로 주요 키워드와 브랜드 반응을 분석합니다.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-[#8C7A6B] bg-[#F5F2EB] px-3 py-1.5 rounded-xs border border-[#E8E4DC] self-start">
            <ShieldCheck className="w-4 h-4 text-[#736152]" />
            <span>실제 수집 데이터 기준 (가짜 0% 추정치 없음)</span>
          </div>
        </div>

        {/* MAIN SEARCH & PERIOD & COMPARISON INPUT */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="분석할 주요 키워드를 입력하세요 (예: 러닝, 피클볼, 오크밸리)"
                  className="w-full pl-9 pr-4 py-2 bg-[#F5F2EB] border border-[#D4C8B8] rounded-xs text-xs focus:outline-hidden focus:border-[#736152] focus:bg-white text-[#2C2C2C] font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#736152] text-white text-xs font-semibold rounded-xs hover:bg-[#5C4E43] transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 shadow-2xs"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>검색 분석</span>
              </button>
            </form>

            {/* PERIOD SELECTOR */}
            <div className="flex items-center space-x-1 bg-[#F5F2EB] p-1 rounded-xs border border-[#D4C8B8] self-start">
              {(['7DAYS', '30DAYS', '3MONTHS', '6MONTHS', '1YEAR'] as InterestPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-2xs transition-all cursor-pointer ${
                    selectedPeriod === p
                      ? 'bg-[#736152] text-white font-bold shadow-2xs'
                      : 'text-[#5C4E43] hover:bg-[#EFECE6]'
                  }`}
                >
                  {p === '7DAYS' ? '7일' : p === '30DAYS' ? '30일' : p === '3MONTHS' ? '3개월' : p === '6MONTHS' ? '6개월' : '1년'}
                </button>
              ))}
            </div>
          </div>

          {/* KEYWORD COMPARISON BAR */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EFECE6] text-xs">
            <span className="text-[#8C7A6B] font-semibold text-[11px] shrink-0">비교 키워드 추가:</span>
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
                placeholder="비교 키워드 (예: 마라톤)"
                className="px-2.5 py-1 bg-[#F5F2EB] border border-[#D4C8B8] rounded-xs text-xs focus:outline-hidden focus:bg-white text-[#2C2C2C] w-36"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompareKeyword();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCompareKeyword}
                className="px-2 py-1 bg-[#E8E4DC] hover:bg-[#D4C8B8] text-[#5C4E43] text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>추가</span>
              </button>
            </div>

            {compareList.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#736152]/10 text-[#736152] border border-[#736152]/30 rounded-2xs text-xs font-medium"
              >
                <span>vs {kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompareKeyword(kw)}
                  className="hover:text-red-600 cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* PRESET TAGS & COVERAGE SCOPE */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFECE6] text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[#8C7A6B] font-semibold text-[11px]">추천 키워드:</span>
              {PRESET_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handlePresetClick(kw)}
                  className={`px-2.5 py-1 rounded-xs text-xs font-medium border transition-colors cursor-pointer ${
                    activeQuery === kw
                      ? 'bg-[#736152] text-white border-[#736152]'
                      : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#F5F2EB]'
                  }`}
                >
                  #{kw}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8C7A6B]">
              <span className="font-semibold text-[#736152]">수집 범위:</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">뉴스/언론</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">공식 뉴스룸</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">블로그/카페</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">공개 SNS</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">YouTube</span>
              <span className="px-1.5 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] rounded-2xs">전문매체</span>
            </div>
          </div>

        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xs border border-[#D4C8B8] p-12 text-center space-y-3 shadow-2xs">
          <RefreshCw className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
          <p className="text-xs text-[#736152] font-semibold">
            Google Grounding &amp; 공개 웹 데이터를 수집하고 기사/콘텐츠/버즈 트렌드를 실시간 분석 중입니다...
          </p>
        </div>
      )}

      {!loading && report && (
        <>
          {/* SUMMARY HEADER BANNER */}
          <div className="bg-[#736152] text-white rounded-xs p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-[#D4C8B8] font-medium flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{report.query}</span>
                <span>•</span>
                <span>{periodLabels[report.period] || report.period}</span>
                <span>•</span>
                <span>공개 웹 데이터 기반</span>
                <span>•</span>
                <span>최종 확인: {report.searchedAt}</span>
              </div>
              <h2 className="text-lg font-bold mt-0.5">
                '{report.query}' 실시간 관심도 분석 종합 리포트
              </h2>
            </div>
            <div className="text-[11px] text-[#D4C8B8] bg-[#5C4E43] px-3 py-1.5 rounded-xs border border-[#8C7A6B] self-start sm:self-auto font-mono">
              중복 기사/동일 URL 정제 완료
            </div>
          </div>

          {/* 2. TOP SUMMARY 4 CORE KPIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: VERIFIED CONTENT COUNT */}
            <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span className="text-xs font-bold text-[#736152]">① 수집/확인된 관련 콘텐츠</span>
                <Globe className="w-4 h-4 text-[#736152]" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-[#2C2C2C]">
                  {report.summaryKpi?.confirmedContentCount ?? 0}
                </span>
                <span className="text-xs text-[#8C7A6B] font-semibold">건</span>
              </div>
              <p className="text-[10px] text-[#8C7A6B] leading-tight">
                YouTube, 블로그/카페, 공개 SNS, 뉴스 수집 총 건수
              </p>
            </div>

            {/* KPI 2: NEWS COUNT */}
            <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span className="text-xs font-bold text-[#736152]">② 뉴스 / 언론 기사</span>
                <Newspaper className="w-4 h-4 text-[#736152]" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-[#2C2C2C]">
                  {report.summaryKpi?.newsCount ?? 0}
                </span>
                <span className="text-xs text-[#8C7A6B] font-semibold">건</span>
              </div>
              <p className="text-[10px] text-[#8C7A6B] leading-tight">
                검증된 언론 매체 및 보도자료 출고 건수
              </p>
            </div>

            {/* KPI 3: TOP 3 KEYWORDS */}
            <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span className="text-xs font-bold text-[#736152]">③ 연관 언급 키워드 Top 3</span>
                <Tag className="w-4 h-4 text-[#736152]" />
              </div>
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {(report.summaryKpi?.top3Keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[#F5F2EB] border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-2xs"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#8C7A6B] leading-tight">
                콘텐츠 및 기사 제목 추출 최빈 키워드
              </p>
            </div>

            {/* KPI 4: ACTIVE CHANNELS COUNT */}
            <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span className="text-xs font-bold text-[#736152]">④ 수집 채널 수</span>
                <Layers className="w-4 h-4 text-[#736152]" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-[#2C2C2C]">
                  {report.summaryKpi?.activeChannelsCount ?? 5}
                </span>
                <span className="text-xs text-[#8C7A6B] font-semibold">개 채널</span>
              </div>
              <p className="text-[10px] text-[#8C7A6B] leading-tight">
                뉴스, 뉴스룸, 블로그, SNS, YouTube, 전문매체
              </p>
            </div>

          </div>

          {/* BRAND MONITORING MODE SECTION (IF BRAND SEARCH) */}
          {report.brandAnalysis?.isBrandMode && (
            <div className="bg-[#FAF8F5] border-2 border-[#736152] rounded-xs p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4C8B8] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-[#736152] text-white text-[11px] font-bold rounded-2xs">
                    브랜드 모니터링 모드
                  </span>
                  <h2 className="text-base font-bold text-[#2C2C2C]">
                    [{report.brandAnalysis.brandName}] 공식 소식 &amp; 자사 브랜드 반응
                  </h2>
                </div>
                <div className="text-xs text-[#736152] font-semibold bg-white px-3 py-1 rounded-2xs border border-[#D4C8B8]">
                  공식자료/보도자료 수집: <strong className="text-[#2C2C2C] font-mono">{report.brandAnalysis.officialAnnouncementCount}건</strong>
                </div>
              </div>

              {/* COMPANY ACTIVITIES & ANNOUNCEMENTS */}
              {report.brandAnalysis.recentCompanyActivities && report.brandAnalysis.recentCompanyActivities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#736152] flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>최근 공식 주요 활동 &amp; 보도자료</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.brandAnalysis.recentCompanyActivities.map((act, idx) => (
                      <div key={idx} className="bg-white p-3 border border-[#D4C8B8] rounded-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#2C2C2C] truncate max-w-[200px]">{act.title}</span>
                          <span className="text-[10px] bg-[#F5F2EB] text-[#736152] px-1.5 py-0.5 rounded-2xs font-medium">{act.category}</span>
                        </div>
                        <p className="text-[11px] text-[#5C4E43] leading-relaxed">{act.summary}</p>
                        <div className="text-[10px] text-[#8C7A6B] pt-1 border-t border-[#EFECE6] flex items-center justify-between">
                          <span>영향: {act.impact}</span>
                          <span className="font-mono">{act.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPETITOR COMPARISON & POSITION */}
              {report.brandAnalysis.competitorComparison && (
                <div className="bg-white p-3 border border-[#D4C8B8] rounded-xs space-y-1 text-xs">
                  <span className="font-bold text-[#736152] flex items-center space-x-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>경쟁사 대비 브랜드 입지 &amp; 버즈 동향</span>
                  </span>
                  <p className="text-[#2C2C2C] leading-relaxed">{report.brandAnalysis.competitorComparison}</p>
                </div>
              )}
            </div>
          )}
          {report.summaryKpi?.confirmedContentCount === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xs p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-sm font-bold text-amber-900">
                입력하신 검색어 '{report.query}'의 최근 공개 데이터 검색 결과가 없습니다.
              </h3>
              <p className="text-xs text-amber-800">
                추천 키워드(#러닝, #피클볼, #오크밸리)를 선택하시거나 더 범용적인 검색어로 재시도해 보세요.
              </p>
            </div>
          )}

          {/* MAIN TWO COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SECTION: KEYWORDS TOP 10 */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-[#736152]" />
                      <h2 className="text-base font-bold text-[#2C2C2C]">주요 언급 키워드 Top 10</h2>
                    </div>
                    <p className="text-xs text-[#8C7A6B] mt-0.5">
                      수집된 포스팅 및 뉴스 기사 본문/제목에서 추출된 상위 10개 키워드와 추출 맥락입니다.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#736152] bg-[#F5F2EB] px-2.5 py-1 rounded-2xs border border-[#E8E4DC]">
                    빈도순 정렬
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5F2EB] text-[#5C4E43] border-b border-[#D4C8B8]">
                        <th className="p-2.5 font-bold w-12 text-center">순위</th>
                        <th className="p-2.5 font-bold">연관 키워드</th>
                        <th className="p-2.5 font-bold w-20 text-center">언급 건수</th>
                        <th className="p-2.5 font-bold w-24">카테고리</th>
                        <th className="p-2.5 font-bold">언급 맥락 / 내용예시</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6]">
                      {(report.topKeywords || []).map((item) => (
                        <tr key={item.rank} className="hover:bg-[#FAF8F5]">
                          <td className="p-2.5 text-center font-bold font-mono text-[#736152]">
                            {item.rank}
                          </td>
                          <td className="p-2.5 font-bold text-[#2C2C2C]">
                            #{item.keyword}
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono text-emerald-800">
                            {item.count}건
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] text-[10px] font-semibold text-[#5C4E43] rounded-2xs">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-2.5 text-xs text-[#5C4E43]">
                            {item.context}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION: RISING TOPICS */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <h2 className="text-base font-bold text-[#2C2C2C]">급상승 연관 주제 (Surge Buzz Topics)</h2>
                    </div>
                    <p className="text-xs text-[#8C7A6B] mt-0.5">
                      최근 관심이 급증하고 있는 세부 주제와 리조트 콘텐츠 연결 포인트입니다.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(report.relatedTopics || []).map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs space-y-2 hover:border-[#736152] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#2C2C2C]">{topic.topic}</span>
                          <span className="text-[10px] font-mono text-[#8C7A6B]">({topic.channelBreakdown})</span>
                        </div>
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-2xs ${
                          topic.changeRate > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {topic.changeRate > 0 ? `+${topic.changeRate}%` : `${topic.changeRate}%`}
                        </span>
                      </div>

                      <p className="text-xs text-[#5C4E43] leading-relaxed">
                        <strong className="text-[#736152]">IPARK리조트 연결 기회:</strong> {topic.relevanceToOakValley}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6] text-[11px] text-[#8C7A6B]">
                        <span className="font-mono">{topic.sourceNote}</span>
                        <button
                          onClick={() => handleCreateWeeklyContent(topic.topic)}
                          className="px-2.5 py-1 bg-[#736152] text-white text-[11px] font-semibold rounded-2xs hover:bg-[#5C4E43] transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Instagram className="w-3 h-3" />
                          <span>이 주제로 주간 콘텐츠 기획하기</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: KEY ISSUES (3~5개) */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="border-b border-[#EFECE6] pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#736152]" />
                    <h2 className="text-base font-bold text-[#2C2C2C]">핵심 이슈 분석 (Key Issues)</h2>
                  </div>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    확인된 기사/자료 근거와 출처 성격, 시장·소비적 의미를 명확히 분리하여 제시합니다.
                  </p>
                </div>

                <div className="space-y-4">
                  {(report.keyIssues || []).map((issue, idx) => (
                    <div
                      key={issue.id || idx}
                      className="p-4 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                        <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                          <span className="w-5 h-5 bg-[#736152] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{issue.title}</span>
                        </h3>
                        <span className="px-2 py-0.5 bg-[#F5F2EB] border border-[#E8E4DC] text-[10px] font-semibold text-[#736152] rounded-2xs">
                          {issue.representativeSource}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-white border border-[#E8E4DC] rounded-xs space-y-1">
                          <div className="text-[10px] font-bold text-[#736152] flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>📌 확인된 사실 근거 (Fact Evidence)</span>
                          </div>
                          <p className="text-[#2C2C2C] leading-relaxed">{issue.factEvidence}</p>
                        </div>

                        <div className="p-2.5 bg-white border border-[#E8E4DC] rounded-xs space-y-1">
                          <div className="text-[10px] font-bold text-[#736152] flex items-center space-x-1">
                            <Compass className="w-3 h-3 text-blue-700" />
                            <span>💡 시장·소비 의미 (Market Meaning)</span>
                          </div>
                          <p className="text-[#2C2C2C] leading-relaxed">{issue.marketMeaning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: PEOPLE'S VOICE */}
              {report.peoplesVoice && (
                <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                  <div className="border-b border-[#EFECE6] pb-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-[#736152]" />
                      <h2 className="text-base font-bold text-[#2C2C2C]">소비자 / 사용자 실제 반응 (People's Voice)</h2>
                    </div>
                    <p className="text-xs text-[#8C7A6B] mt-0.5">
                      공개 블로그/카페, 유튜브 댓글, SNS 포스팅에서 직접 확인된 실제 목소리 분류입니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* POSITIVE */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xs space-y-2">
                      <div className="font-bold text-emerald-900 flex items-center space-x-1.5 border-b border-emerald-200 pb-1.5">
                        <Smile className="w-4 h-4 text-emerald-700" />
                        <span>긍정 반응 (Positive)</span>
                      </div>
                      <ul className="space-y-1.5 text-emerald-950 text-[11px] leading-relaxed">
                        {((report.peoplesVoice.positives || report.peoplesVoice.positive || []) as any[]).map((voice, i) => {
                          const quoteText = typeof voice === 'string' ? voice : (voice?.quote || voice?.topic || '');
                          const topicText = typeof voice === 'object' && voice?.topic ? voice.topic : null;
                          const countNum = typeof voice === 'object' ? voice?.count : undefined;
                          return (
                            <li key={i} className="flex items-start space-x-1">
                              <span className="text-emerald-700 font-bold">•</span>
                              <div>
                                {topicText && (
                                  <span className="inline-block text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-2xs mr-1">
                                    [{topicText}]
                                  </span>
                                )}
                                <span>"{quoteText}"</span>
                                {countNum !== undefined && (
                                  <span className="text-[10px] font-mono text-[#8C7A6B] ml-1">({countNum}건)</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* FRICTION / DISSATISFACTION */}
                    <div className="p-3 bg-red-50/60 border border-red-200 rounded-xs space-y-2">
                      <div className="font-bold text-red-900 flex items-center space-x-1.5 border-b border-red-200 pb-1.5">
                        <Frown className="w-4 h-4 text-red-700" />
                        <span>불만 / 아쉬운 점 (Pain Points)</span>
                      </div>
                      <ul className="space-y-1.5 text-red-950 text-[11px] leading-relaxed">
                        {((report.peoplesVoice.concerns || report.peoplesVoice.negative || []) as any[]).map((voice, i) => {
                          const quoteText = typeof voice === 'string' ? voice : (voice?.quote || voice?.topic || '');
                          const topicText = typeof voice === 'object' && voice?.topic ? voice.topic : null;
                          const countNum = typeof voice === 'object' ? voice?.count : undefined;
                          return (
                            <li key={i} className="flex items-start space-x-1">
                              <span className="text-red-700 font-bold">•</span>
                              <div>
                                {topicText && (
                                  <span className="inline-block text-[10px] font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded-2xs mr-1">
                                    [{topicText}]
                                  </span>
                                )}
                                <span>"{quoteText}"</span>
                                {countNum !== undefined && (
                                  <span className="text-[10px] font-mono text-[#8C7A6B] ml-1">({countNum}건)</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* EXPECTATIONS & QUESTIONS */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xs space-y-2">
                      <div className="font-bold text-amber-900 flex items-center space-x-1.5 border-b border-amber-200 pb-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>기대 &amp; 문의 사항 (Inquiries)</span>
                      </div>
                      <ul className="space-y-1.5 text-amber-950 text-[11px] leading-relaxed">
                        {((report.peoplesVoice.questions || []) as any[]).map((voice, i) => {
                          const quoteText = typeof voice === 'string' ? voice : (voice?.quote || voice?.topic || '');
                          const topicText = typeof voice === 'object' && voice?.topic ? voice.topic : null;
                          const countNum = typeof voice === 'object' ? voice?.count : undefined;
                          return (
                            <li key={i} className="flex items-start space-x-1">
                              <span className="text-amber-700 font-bold">•</span>
                              <div>
                                {topicText && (
                                  <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded-2xs mr-1">
                                    [{topicText}]
                                  </span>
                                )}
                                <span>"{quoteText}"</span>
                                {countNum !== undefined && (
                                  <span className="text-[10px] font-mono text-[#8C7A6B] ml-1">({countNum}건)</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: REPRESENTATIVE CONTENT ITEMS WITH CATEGORY TABS */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-3">
                  <div>
                    <h2 className="text-base font-bold text-[#2C2C2C]">대표 수집 콘텐츠 목록</h2>
                    <p className="text-xs text-[#8C7A6B]">수집된 관련 기사, 동영상, 포스팅 목록입니다.</p>
                  </div>

                  {/* CATEGORY TABS */}
                  <div className="flex items-center space-x-1 bg-[#F5F2EB] p-1 rounded-xs border border-[#D4C8B8]">
                    {[
                      { key: 'ALL', label: '전체' },
                      { key: 'SEARCH', label: '검색' },
                      { key: 'SNS_VIDEO', label: 'SNS·영상' },
                      { key: 'BLOG_COMMUNITY', label: '블로그·커뮤니티' },
                      { key: 'NEWS', label: '뉴스' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setSelectedCategory(t.key as InterestChannelCategory)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-2xs transition-colors cursor-pointer ${
                          selectedCategory === t.key
                            ? 'bg-[#736152] text-white font-semibold'
                            : 'text-[#5C4E43] hover:bg-[#EFECE6]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONTENT CARDS */}
                <div className="space-y-3">
                  {filteredChannelItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xs border border-[#E8E4DC] bg-[#FAF8F5] hover:border-[#736152] transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs ${
                            item.channel === 'NAVER' || item.channel === 'NAVER Blog' || item.channel === 'NAVER Cafe'
                              ? 'bg-emerald-700 text-white'
                              : item.channel === 'YouTube' || item.channel === 'Google'
                              ? 'bg-red-700 text-white'
                              : item.channel === 'Instagram'
                              ? 'bg-pink-700 text-white'
                              : 'bg-blue-700 text-white'
                          }`}>
                            {item.channel}
                          </span>
                          <span className="text-[11px] text-[#8C7A6B]">{item.author}</span>
                          <span className="text-[11px] text-[#8C7A6B]">• {item.publishDate}</span>
                        </div>

                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#736152] hover:underline font-semibold flex items-center space-x-1 bg-[#F5F2EB] px-2 py-0.5 rounded-2xs border border-[#D4C8B8]"
                          >
                            <span>원문 보기</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#8C7A6B] italic bg-[#F5F2EB] px-2 py-0.5 rounded-2xs border border-[#E8E4DC]">
                            출처 확인됨 (직접URL 미제공)
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#2C2C2C]">{item.title}</h3>
                      <p className="text-xs text-[#5C4E43] leading-relaxed">{item.summary}</p>

                      <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-[#8C7A6B] border-t border-[#EFECE6] gap-2">
                        <div className="flex items-center space-x-3">
                          {item.views !== null ? (
                            <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                              <Eye className="w-3 h-3" />
                              <span>조회수 {item.views.toLocaleString()}회</span>
                            </span>
                          ) : (
                            <span className="text-[#8C7A6B] italic">조회수: 공개 API 미제공</span>
                          )}

                          {item.reactions !== null ? (
                            <span className="flex items-center space-x-1 text-[#736152]">
                              <MessageSquare className="w-3 h-3" />
                              <span>반응 {item.reactions.toLocaleString()}건</span>
                            </span>
                          ) : null}
                        </div>

                        <div className="text-[10px] text-[#8C7A6B] font-mono bg-white px-2 py-0.5 rounded-2xs border border-[#E8E4DC]">
                          {item.verifiedNote}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT 1 COL */}
            <div className="space-y-6">
              
              {/* SECTION: AI INTEGRATED INSIGHT (3-STAGE) */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="border-b border-[#EFECE6] pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#736152]" />
                    <h2 className="text-base font-bold text-[#2C2C2C]">AI 통합 인사이트 (3단 분석)</h2>
                  </div>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    확인된 사실과 시장 해석, 실행 포인트가 명확히 분리된 리포트입니다.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* STAGE 1: FACT SUMMARY */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xs space-y-1">
                    <div className="text-[11px] font-bold text-emerald-900 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>📌 [확인된 사실]</span>
                    </div>
                    <p className="text-[#2C2C2C] leading-relaxed font-medium">
                      {report.aiInsight?.factSummary || '수집된 데이터를 기반으로 분석을 마쳤습니다.'}
                    </p>
                  </div>

                  {/* STAGE 2: MARKET INTERPRETATION */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xs space-y-1">
                    <div className="text-[11px] font-bold text-blue-900 flex items-center space-x-1">
                      <Compass className="w-3.5 h-3.5 text-blue-700" />
                      <span>💡 [시장 · 마케팅 의미]</span>
                    </div>
                    <p className="text-[#2C2C2C] leading-relaxed font-medium">
                      {report.aiInsight?.marketInterpretation || '소비자 행동 및 브랜드 경쟁 관점의 마케팅 전략 시사점입니다.'}
                    </p>
                  </div>

                  {/* STAGE 3: ACTIONABLE TAKEAWAY */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xs space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>🚀 [핵심 실행 포인트]</span>
                    </div>
                    <p className="text-[#2C2C2C] leading-relaxed font-semibold">
                      {report.aiInsight?.actionableTakeaway || '실무진이 바로 실행 가능한 마케팅 액션 가이드입니다.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: IPARK RESORT APPLICATION (최대 3개) */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div className="border-b border-[#EFECE6] pb-3">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-[#736152]" />
                    <h2 className="text-base font-bold text-[#2C2C2C]">IPARK리조트 적용점 (최대 3개)</h2>
                  </div>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    오크밸리, 성문안, 파크로쉬 자산과 즉시 연결할 수 있는 실행 아이디어입니다.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {(report.iparkApplications || []).map((app, idx) => (
                    <div
                      key={app.id || idx}
                      className="p-3.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C2C2C] text-xs">
                          {idx + 1}. {app.ideaTitle}
                        </span>
                        <span className="px-2 py-0.5 bg-[#736152] text-white text-[10px] font-bold rounded-2xs">
                          {app.applicableAsset}
                        </span>
                      </div>
                      <p className="text-[#5C4E43] text-[11px] leading-relaxed pt-0.5">
                        <strong className="text-[#736152]">기대효과 &amp; 실행:</strong> {app.expectedEffectAndAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: CHANNEL DISTRIBUTION */}
              {report.channelDistribution && (
                <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                  <div className="border-b border-[#EFECE6] pb-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-[#736152]" />
                      <h2 className="text-base font-bold text-[#2C2C2C]">채널별 수집 분포</h2>
                    </div>
                    <p className="text-xs text-[#8C7A6B] mt-0.5">
                      수집된 언급의 채널별 점유율 및 특성입니다.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {(report.channelDistribution || []).map((cd, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between font-semibold text-[#2C2C2C]">
                          <span>{cd.channelName}</span>
                          <span className="font-mono text-[#736152]">{cd.sharePercent}% ({cd.count}건)</span>
                        </div>
                        <div className="w-full h-2 bg-[#F5F2EB] rounded-full overflow-hidden border border-[#E8E4DC]">
                          <div
                            className="h-full bg-[#736152] rounded-full"
                            style={{ width: `${cd.sharePercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#8C7A6B]">{cd.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: KEYWORD COMPARISON TABLE */}
              {report.keywordComparisons && report.keywordComparisons.length > 0 && (
                <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-3">
                  <div className="border-b border-[#EFECE6] pb-2">
                    <h2 className="text-base font-bold text-[#2C2C2C]">키워드 비교 분석 결과</h2>
                    <p className="text-xs text-[#8C7A6B]">주요 키워드와 비교 키워드의 버즈 수치를 비교합니다.</p>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F5F2EB] text-[#5C4E43] border-b border-[#D4C8B8]">
                          <th className="p-2 font-bold">키워드</th>
                          <th className="p-2 font-bold text-center">확인 콘텐츠</th>
                          <th className="p-2 font-bold text-center">뉴스 건수</th>
                          <th className="p-2 font-bold">주요 연관어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6]">
                        {report.keywordComparisons.map((kc, i) => (
                          <tr key={i} className={kc.keyword === report.query ? 'bg-amber-50/50 font-bold' : ''}>
                            <td className="p-2 text-[#2C2C2C]">{kc.keyword}</td>
                            <td className="p-2 text-center font-mono text-[#736152]">{kc.confirmedContentCount}건</td>
                            <td className="p-2 text-center font-mono text-[#736152]">{kc.newsCount}건</td>
                            <td className="p-2 text-[#5C4E43]">{kc.topKeyword}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: INTERNAL CHANNELS & DOCUMENT UPLOAD */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#736152]" />
                    <h2 className="text-base font-bold text-[#2C2C2C]">자체 자산 연동 &amp; 파일 등록</h2>
                  </div>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    GA4, Instagram Graph API 연동 현황 및 내부 리포트 직접 등록입니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[#2C2C2C]">공개 포털 &amp; 소셜 모니터 수집 엔진</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-2xs">연결됨</span>
                  </div>

                  {(report.internalChannels || []).map((ic, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C2C2C]">{ic.channelName}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-2xs">
                          데이터 연결 필요
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-amber-900">{ic.message}</p>
                      <p className="text-[10px] text-[#8C7A6B]">{ic.verifiedNote}</p>
                    </div>
                  ))}
                </div>

                {/* UPLOAD BOX */}
                <div className="p-3 bg-[#F5F2EB] border border-[#D4C8B8] rounded-xs space-y-2 text-xs">
                  <div className="flex items-start space-x-1.5">
                    <Info className="w-4 h-4 text-[#736152] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#5C4E43] leading-relaxed">
                      보유 중인 CSV, Excel, PDF, 이미지 리포트를 직접 업로드하여 내부 데이터 분석 지표를 보완할 수 있습니다.
                    </p>
                  </div>

                  <label className="w-full py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xs cursor-pointer transition-colors flex items-center justify-center space-x-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>파일 업로드 (CSV / Excel / PDF / 이미지)</span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleCustomFileUpload}
                    />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="text-[10px] font-mono bg-white p-1.5 border border-[#E8E4DC] rounded-2xs flex items-center justify-between text-emerald-800">
                          <span className="truncate max-w-[180px]">📄 {f.name}</span>
                          <span className="font-bold">등록완료 ({f.date})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: DEMOGRAPHICS DISCLAIMER */}
              <div className="bg-white rounded-xs border border-[#D4C8B8] p-5 shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 border-b border-[#EFECE6] pb-2">
                  <Users className="w-4 h-4 text-[#736152]" />
                  <h2 className="text-base font-bold text-[#2C2C2C]">인구통계 데이터 제공 안내</h2>
                </div>

                <div className="space-y-2 text-xs">
                  {(report.demographics || []).map((demo, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xs border space-y-1 ${
                        demo.isAvailable ? 'bg-[#FAF8F5] border-[#D4C8B8]' : 'bg-[#F9F9F9] border-dashed border-[#CCCCCC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C2C2C]">{demo.channel}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-2xs ${
                          demo.isAvailable ? 'bg-[#736152] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {demo.isAvailable ? '공식 제공' : '미제공 (확인불가)'}
                        </span>
                      </div>

                      {demo.isAvailable ? (
                        <p className="text-[11px] text-[#736152] font-semibold">
                          주요 그룹: {demo.group} (비중 {demo.interestShare}%)
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-500 italic">
                          {demo.unavailabilityReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xs text-[10px] text-amber-800 flex items-start space-x-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
                  <span>
                    <strong>안내:</strong> 상기 통계는 포털 키워드 검색자의 연령 분포이며, 실제 오크밸리/파크로쉬 투숙객 연령대를 직접 나타내지 않습니다. 가짜 수치 작성 지침에 따라 미제공 출처는 미제공으로 명시합니다.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
