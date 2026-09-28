import React, { useState } from 'react';
import { CompanyReport } from '../types';
import {
  Search, Building2, TrendingUp, Star, Award, Clock, Target,
  ArrowRight, RefreshCw, Download, Sparkles, X,
  TreePine, Flame, BadgeCheck, Compass, Zap, ShieldCheck, AlertTriangle, FileCheck
} from 'lucide-react';
import { exportCompanyReportToPPTX } from '../utils/pptExporter';
import { SourcesAndReferencesSection } from './SourcesAndReferencesSection';
import { KnowledgeBaseBadge } from './KnowledgeBaseBadge';

interface CompanyIntelligenceViewProps {
  report: CompanyReport | null;
  loading: boolean;
  error?: string | null;
  onSearchCompany: (name: string) => void;
  onSearchTrend: (trendQuery: string) => void;
  onCreatePartnershipProposal?: (companyName: string) => void;
}

export const CompanyIntelligenceView: React.FC<CompanyIntelligenceViewProps> = ({
  report,
  loading,
  error,
  onSearchCompany,
  onSearchTrend,
  onCreatePartnershipProposal,
}) => {
  const [companyInput, setCompanyInput] = useState(report?.companyName || '');
  const [selectedTimelineFilter, setSelectedTimelineFilter] = useState<string>('전체');
  const [showWhyOakValleyModal, setShowWhyOakValleyModal] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  interface RecommendedBrand {
    brand: string;
    category: string;
    recentActivity: string;
    oakValleyTouchpoint: string;
    recommendationReason: string;
    source: string;
  }

  const [recommendedBrands, setRecommendedBrands] = useState<RecommendedBrand[]>([
    {
      brand: 'On Running',
      category: 'Running & Outdoor',
      recentActivity: '글로벌 웰니스 러닝 클럽 세션 확대 및 트레일 러닝 신발 라인업 강화',
      oakValleyTouchpoint: '오크밸리 참나무 숲길 둘레길 & 파크로쉬 트레일 코스 연계 모닝 런 스폰서십',
      recommendationReason: '3040 고소득 트렌디 액티브 라이프스타일 소비층 선호도 급증',
      source: 'On Running Official IR / Newsroom',
    },
    {
      brand: 'Garmin',
      category: 'Golf & Mobility',
      recentActivity: '프리미엄 골프 스마트워치 Marq Golf 시리즈 출시 및 생체 웰니스 데이터 플랫폼 연동',
      oakValleyTouchpoint: '오크밸리 36홀 라운딩 코스 데이터 및 파크로쉬 웰니스 바이오 스파 룸 구축',
      recommendationReason: '데이터 기반 골퍼 및 스마트 웰니스 케어 애호가의 핵심 타깃 접점',
      source: 'Garmin Global Press Release',
    },
    {
      brand: 'Lululemon',
      category: 'Wellness & Lifestyle',
      recentActivity: '마인드풀니스 & 메디테이션 야외 클래스 리트릿 전국 팝업 개최',
      oakValleyTouchpoint: '파크로쉬 마인드풀니스 요가 홀 & 오크밸리 잔디광장 야외 웰니스 클래스',
      recommendationReason: '2040 프리미엄 웰니스 소비층 유입 및 하이엔드 어메니티 제휴 효과 극대화',
      source: 'Lululemon Brand Experience Report',
    },
    {
      brand: 'Snow Peak',
      category: 'Outdoor & Family',
      recentActivity: '아웃도어 필드 클래스 및 친환경 럭셔리 캠핑 라운지 연계 프로모션',
      oakValleyTouchpoint: '오크밸리 야외 잔디광장 럭셔리 글램핑 & 필드 팝업 브랜딩',
      recommendationReason: '패밀리 고소득 아웃도어 캠퍼 및 프리미엄 레저 회원 유치 적합',
      source: 'Snow Peak Korea Press',
    },
  ]);

  React.useEffect(() => {
    if (report?.companyName) {
      setCompanyInput(report.companyName);
    }
  }, [report?.companyName]);

  React.useEffect(() => {
    fetch('/api/recommended-brands')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.brands) && data.brands.length > 0) {
          setRecommendedBrands(data.brands);
        }
      })
      .catch((err) => console.warn('Failed to load dynamic recommended brands:', err));
  }, []);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyInput.trim()) {
      onSearchCompany(companyInput.trim());
    }
  };

  const handleBrandClick = (name: string) => {
    setCompanyInput(name);
    onSearchCompany(name);
  };

  const filteredTimeline = report?.recentActivities
    ? selectedTimelineFilter === '전체'
      ? report.recentActivities
      : report.recentActivities.filter((a) => a.type === selectedTimelineFilter)
    : [];

  const renderFitBadge = (level?: 'HIGH' | 'MEDIUM' | 'LOW') => {
    if (!level) return null;
    switch (level) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xs inline-flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>HIGH</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-xs inline-flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>MEDIUM</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 rounded-xs inline-flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>LOW</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded-xs uppercase tracking-wider">
                Brand & Company Radar
              </span>
              <h1 className="text-2xl font-serif font-bold text-slate-900">Brand & Company Radar</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              기업 브랜드 아이덴티티, 최근 마케팅 동향 및 오크밸리 리조트·골프 맞춤 파트너십 평가
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-mono text-slate-400">분석 시스템:</span>
            <span className="inline-flex items-center space-x-1 text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Oak Valley Partnership AI</span>
            </span>
          </div>
        </div>

        {/* Large Search Input */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative flex flex-col sm:block">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="분석할 기업 또는 브랜드를 검색하세요."
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-32 py-3.5 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 font-medium shadow-2xs min-h-[48px]"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 sm:left-4 top-3.5 sm:top-4" />
            <button
              id="company-search-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-5 py-3 sm:py-0 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px] sm:min-h-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" />
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <span>기업 보고서 생성</span>
                  <ArrowRight className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Recommended Brands (Dynamic Verified Candidates) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8C7A6B] font-mono uppercase tracking-wider">
                실시간 추천 제휴 브랜드 후보:
              </span>
              <span className="text-[10px] text-[#8C7A6B] font-mono">시장의 검증된 실제 기업 정보 기반</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendedBrands.map((item, idx) => (
                <button
                  key={`rec-btn-${item.brand}-${idx}`}
                  type="button"
                  onClick={() => handleBrandClick(item.brand)}
                  className={`px-3 py-1.5 text-xs border rounded-xs transition-all cursor-pointer font-medium flex items-center space-x-1.5 ${
                    report?.companyName?.toLowerCase() === item.brand.toLowerCase()
                      ? 'bg-[#736152] text-white border-[#736152]'
                      : 'bg-[#FAF8F5] text-[#2C2C2C] border-[#D4C8B8] hover:border-[#8C7A6B] hover:bg-[#EFECE6]'
                  }`}
                >
                  <span className="font-bold">{item.brand}</span>
                  <span className="text-[10px] opacity-75 font-mono">({item.category})</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Loading View */}
      {loading && !report && (
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-8 space-y-6 text-center animate-pulse">
          <div className="inline-flex items-center space-x-2 text-[#736152] text-sm font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-[#736152]" />
            <span>AI 가 기업 마케팅 히스토리 및 파트너십 기회를 정밀 분석 중입니다...</span>
          </div>
          <div className="h-4 bg-[#EFECE6] rounded w-2/3 mx-auto"></div>
          <div className="h-32 bg-[#EFECE6] rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-[#EFECE6] rounded"></div>
            <div className="h-48 bg-[#EFECE6] rounded"></div>
          </div>
        </div>
      )}

      {/* Loading Top Banner when initial report is already displayed */}
      {loading && report && (
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-3.5 flex items-center justify-center space-x-2 text-xs font-semibold text-[#736152] animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-[#736152]" />
          <span>분석 데이터를 불러오는 중입니다...</span>
        </div>
      )}

      {/* Error Message View */}
      {!loading && error && !report && (
        <div className="bg-white border border-[#D4C8B8] rounded-xs p-8 text-center space-y-3 shadow-2xs">
          <div className="text-amber-800 font-semibold text-base">
            {error}
          </div>
          <p className="text-xs text-[#8C7A6B]">
            기업명을 확인하시고 다시 시도하시거나 아래 추천 브랜드를 선택해 주세요.
          </p>
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

      {/* Empty Initial State View with Dynamic Brand Cards */}
      {!loading && !report && !error && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D4C8B8] rounded-xs p-8 text-center space-y-4 shadow-2xs">
            <div className="w-12 h-12 bg-[#FAF8F5] text-[#736152] rounded-full flex items-center justify-center mx-auto border border-[#D4C8B8]">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold font-serif text-[#2C2C2C]">
                분석할 기업 또는 브랜드명을 입력해주세요
              </h3>
              <p className="text-xs text-[#8C7A6B] leading-relaxed font-sans">
                검색창에 타깃 기업명(예: On Running, Garmin, Lululemon, Samsung)을 입력하시면 AI가 브랜드 아이덴티티, 최근 마케팅 동향, 오크밸리 리조트/골프 제휴 적합도를 다각도로 검증하여 보고서를 생성합니다.
              </p>
            </div>
          </div>

          {/* Dynamic Candidate Brand Dossiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#736152]" />
              <span>추천 제휴 후보 브랜드 상세 검증 리스트</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedBrands.map((b, idx) => (
                <div key={`rec-card-${b.brand}-${idx}`} className="bg-white border border-[#D4C8B8] rounded-xs p-5 space-y-3 shadow-2xs hover:border-[#736152] transition-all">
                  <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono text-[#8C7A6B] uppercase">{b.category}</span>
                      <h5 className="text-base font-bold text-[#2C2C2C] font-serif">{b.brand}</h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBrandClick(b.brand)}
                      className="px-3 py-1.5 bg-[#736152] text-white text-xs font-semibold rounded-xs hover:bg-[#5C4E43] transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <span>리서치 실행</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-[#2C2C2C]">
                    <div>
                      <span className="font-semibold text-[#736152] font-mono">최근 주요 활동: </span>
                      <span>{b.recentActivity}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#736152] font-mono">오크밸리·파크로쉬 접점: </span>
                      <span>{b.oakValleyTouchpoint}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#736152] font-mono">추천 이유: </span>
                      <span>{b.recommendationReason}</span>
                    </div>
                    <div className="text-[10px] text-[#8C7A6B] font-mono pt-1 border-t border-[#EFECE6]">
                      출처: {b.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Company Report Content */}
      {report && (
        <div className="space-y-8">
          
          {/* Knowledge Base Usage Evidence Badge */}
          <KnowledgeBaseBadge metadata={report.knowledgeBaseMetadata} />

          {/* Header Banner */}
          <div className="bg-[#736152] text-white p-6 sm:p-8 rounded-xs border border-[#5C4E43] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-[#EFECE6]">OAK VALLEY COMPANY DOSSIER</span>
                <span className="px-2 py-0.5 text-[10px] bg-[#5C4E43] text-white border border-[#483C33] rounded-xs font-mono">
                  {report.overview.marketPosition}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {report.overview.companyName}
              </h2>
              <p className="text-xs text-[#EFECE6] leading-relaxed max-w-3xl">
                {report.overview.summary}
              </p>
            </div>

            {/* Action Buttons: Why Oak Valley, Partnership Proposal, PPT Download & Cross-Link */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 md:pt-0">
              <button
                id="create-partnership-proposal-btn"
                onClick={() => onCreatePartnershipProposal ? onCreatePartnershipProposal(report.companyName) : null}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-medium text-[#FAF8F5] bg-[#736152] hover:bg-[#5C4E43] border border-[#5C4E43] rounded-xs transition-colors shadow-2xs cursor-pointer font-sans"
              >
                <span>이 기업으로 제휴안 만들기 &rarr;</span>
              </button>

              <button
                id="why-oak-valley-trigger-btn"
                onClick={() => setShowWhyOakValleyModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-medium text-[#736152] bg-[#EFECE6] hover:bg-[#E2DDD5] border border-[#D4C8B8] rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8C7A6B]" />
                <span>WHY OAK VALLEY?</span>
              </button>

              <button
                id="export-company-ppt-btn"
                onClick={() => exportCompanyReportToPPTX(report)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-medium text-[#2C2C2C] bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#736152]" />
                <span>PPT 다운로드</span>
              </button>

              <button
                id="view-related-trend-btn"
                onClick={() => onSearchTrend(report.relatedTrends[0] || `${report.companyName} 관련 트렌드`)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-medium text-[#2C2C2C] bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-[#736152]" />
                <span>관련 트렌드 보기</span>
              </button>
            </div>
          </div>

          {/* Modal / Popup: WHY OAK VALLEY? */}
          {showWhyOakValleyModal && report.whyOakValley && (
            <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-300 rounded-sm w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-amber-900 text-amber-200 text-[10px] font-mono font-bold rounded-xs uppercase">
                        Partnership Rationale
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Oak Valley × {report.companyName}</span>
                    </div>
                    <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center space-x-2">
                      <span>WHY OAK VALLEY?</span>
                      <span className="text-xs font-sans font-normal text-slate-500">오크밸리 협업 제휴 핵심 근거</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowWhyOakValleyModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 3~5 Core Reasons */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    KEY PARTNERSHIP REASONS (핵심 협업 명분)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {report.whyOakValley.reasons.map((r, idx) => (
                      <div key={`why-reason-${r.category}-${r.title || idx}-${idx}`} className="bg-slate-50 border border-slate-200 rounded-xs p-4 space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-xs">
                            {r.category}
                          </span>
                          <h5 className="text-sm font-bold text-slate-900 font-serif">
                            {r.title}
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-1">
                          {r.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Partnership Direction */}
                <div className="bg-[#2C2C2C] text-white p-5 rounded-xs space-y-2 border border-[#D4C8B8]">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[#D4C8B8]" />
                    <span className="text-xs font-mono text-[#EFECE6] font-bold uppercase">Recommended Partnership Direction</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-relaxed font-serif">
                    "{report.whyOakValley.recommendedPartnershipDirection}"
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowWhyOakValleyModal(false)}
                    className="px-5 py-2 bg-[#736152] text-white text-xs font-semibold rounded-xs hover:bg-[#5C4E43] transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OAK VALLEY × BRAND FIT Section - Evidence First Dynamic Evaluation */}
          {report.oakValleyFit && (
            <section className="bg-slate-900 text-white rounded-sm p-6 sm:p-8 space-y-6 shadow-md border border-slate-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold rounded-xs uppercase">
                      분석 결과 평가
                    </span>
                    <span className="text-xs text-slate-400 font-mono">검증 데이터 기반 동적 분석</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                    OAK VALLEY × BRAND FIT
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    추측이 아닌 실제 확인 가능한 공식 자료(IR·보도자료·공식 웹사이트) 기반의 동적 적합도 산출 결과
                  </p>
                </div>

                {/* Evidence Coverage Indicator Badge */}
                <div className="shrink-0">
                  {report.oakValleyFit.isScoreAvailable ? (
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-xs font-mono text-xs font-bold shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {report.oakValleyFit.coverageText ||
                          `Evidence Coverage: ${report.oakValleyFit.verifiedFactorsCount || report.oakValleyFit.factors?.length || 0} / ${report.oakValleyFit.totalPossibleFactors || 7} factors verified`}
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-amber-950/80 text-amber-300 border border-amber-700/60 rounded-xs font-mono text-xs font-bold shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Insufficient Evidence</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Overall Verified Score Card */}
                <div className="md:col-span-2 bg-slate-800/90 border border-slate-700 rounded-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">OVERALL FIT SCORE</span>
                      {report.oakValleyFit.isScoreAvailable ? (
                        <span className="px-2 py-0.5 bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold rounded-xs">
                          VERIFIED EVALUATION
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-semibold rounded-xs">
                          INSUFFICIENT DATA
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white font-serif">
                      {report.oakValleyFit.isScoreAvailable ? '근거 검증 완료 브랜드 종합 적합도' : '검증 근거 부족 (점수 미산출)'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {report.oakValleyFit.isScoreAvailable
                        ? `실제 공식 IR, 보도자료, 웹사이트 등으로 확인된 ${report.oakValleyFit.verifiedFactorsCount || report.oakValleyFit.factors?.length || 0}개 검증 항목의 가중 평균 점수입니다.`
                        : '추측으로 점수를 생성하지 않습니다. 객관적 근거 자료가 2개 미만이어서 종합 점수를 표시하지 않습니다.'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    {report.oakValleyFit.isScoreAvailable && (report.oakValleyFit.overallFitScore || report.oakValleyFit.brandFitScore) ? (
                      <div>
                        <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400">
                          {report.oakValleyFit.overallFitScore || report.oakValleyFit.brandFitScore}
                          <span className="text-sm text-slate-400 font-normal"> / 100</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono tracking-wider block mt-0.5 uppercase">
                          VERIFIED FIT
                        </span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-2 bg-slate-900/90 border border-amber-700/60 text-amber-300 font-mono text-xs font-bold rounded-xs text-center">
                        Insufficient Evidence
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Evidence First Principle Card */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-xs p-5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-[#D4C8B8]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-mono font-bold text-[#EFECE6] uppercase">EVIDENCE FIRST POLICY</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">의사결정 지원 원칙</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    • 근거 없는 추측 평가 지양
                    <br />• 근거 부족 항목 0점 미처리 & 카드 제외
                    <br />• 검증 자료가 존재하는 항목만 동적 노출
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-700/60 block">
                    Ref: Company IR / Press / Public Records
                  </span>
                </div>
              </div>

              {/* Dynamic Verified Factor Cards Grid */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>DYNAMIC EVALUATION MATRIX (검증 자료 기반 동적 평가 카탈로그)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-sans">
                    * 실제로 확인 가능한 자료가 있는 항목만 노출됩니다 ({report.oakValleyFit.factors?.length || 0}개 항목 검증)
                  </span>
                </div>

                {report.oakValleyFit.factors && report.oakValleyFit.factors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.oakValleyFit.factors.map((factor, idx) => (
                      <div
                        key={`factor-${factor.factorKey || factor.factorName || idx}-${idx}`}
                        className="bg-slate-800/90 border border-slate-700/90 rounded-xs p-5 space-y-3.5 hover:border-slate-600 transition-colors"
                      >
                        {/* Factor Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-slate-400 uppercase">{factor.factorKey || 'EVALUATION'}</span>
                              <span className="px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-700/60 text-[10px] font-mono font-semibold rounded-xs">
                                검증 데이터
                              </span>
                            </div>
                            <h5 className="text-base font-serif font-bold text-white mt-0.5">{factor.factorName}</h5>
                          </div>

                          <div className="text-right shrink-0">
                            {renderFitBadge(factor.grade)}
                            {factor.score !== undefined && (
                              <span className="text-xs font-mono font-bold text-amber-300 block mt-1">
                                {factor.score}점
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 판단 이유 (Reasoning) */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono text-slate-400 font-semibold block uppercase tracking-wide">
                            ■ 판단 이유 (Reasoning)
                          </span>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-xs border border-slate-800">
                            {factor.reasoning}
                          </p>
                        </div>

                        {/* 사용된 근거 (Evidence) & 출처 (Source) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                          <div className="bg-slate-900/80 p-2.5 rounded-xs border border-slate-800 space-y-1">
                            <span className="text-emerald-400 font-mono font-bold block">✓ EVIDENCE (사용된 근거)</span>
                            <p className="text-slate-300 leading-normal">{factor.evidenceSummary}</p>
                          </div>

                          <div className="bg-slate-900/80 p-2.5 rounded-xs border border-slate-800 space-y-1">
                            <span className="text-blue-300 font-mono font-bold block">🔗 SOURCE (출처 / 기준일)</span>
                            <p className="text-slate-300 leading-normal">
                              {factor.source}
                              {factor.verifiedDate && <span className="text-slate-400 font-mono block text-[10px] mt-0.5">자료 기준일: {factor.verifiedDate}</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* If factors array is empty or legacy format without factors array */
                  <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-xs text-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                    <h5 className="text-sm font-bold text-white font-serif">동적 노출 가능한 검증 근거 항목 부족</h5>
                    <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                      객관적이고 신뢰할 수 있는 공시·IR·보도자료 등의 근거가 충분하지 않아 개별 평가 카드가 생성되지 않았습니다.
                      (추측에 의한 평가는 의사결정 혼선을 줄이기 위해 제공되지 않습니다)
                    </p>
                  </div>
                )}
              </div>

              {/* Recommended Oak Valley Assets List */}
              {report.oakValleyFit.recommendedAssets && report.oakValleyFit.recommendedAssets.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <TreePine className="w-4 h-4 text-emerald-400" />
                    <span>RECOMMENDED OAK VALLEY ASSETS (활용 권장 오크밸리 주요 자산)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {report.oakValleyFit.recommendedAssets.map((assetItem, idx) => (
                      <div key={`asset-${assetItem.asset || idx}-${idx}`} className="bg-slate-800/90 border border-slate-700 rounded-xs p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold rounded-xs">
                            PRIORITY {assetItem.priority}
                          </span>
                          <span className="text-xs font-bold text-white font-mono uppercase">
                            [{assetItem.asset}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {assetItem.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>
          )}

          {/* 1. Company Overview */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-6 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('companyOverview')}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">1. Company Overview</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">기업 개요 및 사업 구조</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['companyOverview'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['companyOverview'] && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xs space-y-1">
                  <span className="text-slate-500 font-mono block">주요 사업</span>
                  <div className="font-semibold text-slate-900 space-y-0.5">
                    {report.overview.mainBusinesses.map((b, i) => (
                      <div key={`mb-${b}-${i}`}>• {b}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xs space-y-1">
                  <span className="text-slate-500 font-mono block">주요 브랜드</span>
                  <div className="font-semibold text-slate-900 space-y-0.5">
                    {report.overview.mainBrands.map((b, i) => (
                      <div key={`mbr-${b}-${i}`}>• {b}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xs space-y-1">
                  <span className="text-slate-500 font-mono block">주요 상품/서비스</span>
                  <div className="font-semibold text-slate-900 space-y-0.5">
                    {report.overview.productsServices.map((p, i) => (
                      <div key={`ps-${p}-${i}`}>• {p}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xs space-y-1">
                  <span className="text-slate-500 font-mono block">주요 타깃 고객</span>
                  <p className="font-semibold text-slate-900 leading-relaxed">
                    {report.overview.targetCustomers}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* 2. Brand Identity */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-6 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('brandIdentity')}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">2. Brand Identity</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">브랜드 정체성 & 5대 키워드</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['brandIdentity'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['brandIdentity'] && (
              <>
                {/* 5 Core Keywords Pills */}
                <div className="bg-slate-900 text-white p-4 rounded-xs flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-400 uppercase">Core Brand Keywords (5):</span>
                  <div className="flex flex-wrap gap-2">
                    {report.brandIdentity.keywords.map((kw, idx) => (
                      <span key={`kw-${kw}-${idx}`} className="px-3 py-1 bg-slate-800 text-white font-mono text-xs font-semibold rounded-xs border border-slate-700">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="p-4 border border-slate-200 rounded-xs space-y-2">
                    <strong className="text-slate-900 block font-serif text-sm">■ Brand Positioning</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">{report.brandIdentity.positioning}</p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xs space-y-2">
                    <strong className="text-slate-900 block font-serif text-sm">■ Core Message</strong>
                    <p className="text-slate-900 font-bold italic text-sm leading-relaxed">"{report.brandIdentity.coreMessage}"</p>
                    <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">Personality: {report.brandIdentity.personality}</p>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-xs space-y-2">
                    <strong className="text-slate-900 block font-serif text-sm">■ Visual Identity</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">{report.brandIdentity.visualIdentity}</p>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* 3. Recent Marketing Activity (Timeline Format) */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-6 shadow-2xs">
            <div 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('recentActivity')}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">3. Recent Marketing Activity</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">타임라인</span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                {/* Activity Filter Tabs */}
                <div className="flex flex-wrap gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                  {['전체', '캠페인', '콜라보레이션', '팝업스토어', '이벤트', '스폰서십', '신제품'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedTimelineFilter(type)}
                      className={`px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
                        selectedTimelineFilter === type
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                  {collapsedSections['recentActivity'] ? '펼치기 ▲' : '접기 ▼'}
                </button>
              </div>
            </div>

            {!collapsedSections['recentActivity'] && (
              /* Timeline UI */
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {filteredTimeline.map((item, idx) => (
                  <div key={item.id || `tl-${item.yearMonth}-${item.title || idx}-${idx}`} className="relative space-y-1">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-200"></span>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200">
                        {item.yearMonth}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200 rounded-xs">
                        {item.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Marketing Direction */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-4 shadow-2xs">
            <div 
              className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('marketingDirection')}
            >
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-slate-800" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">4. Marketing Direction</h3>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">핵심 마케팅 지향점 분석</span>
              </div>
              <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                {collapsedSections['marketingDirection'] ? '펼치기 ▲' : '접기 ▼'}
              </button>
            </div>

            {!collapsedSections['marketingDirection'] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 font-mono">주요 집중 분야:</span>
                  {report.marketingDirection.focusAreas.map((area, idx) => (
                    <span key={`fa-${area}-${idx}`} className="px-2.5 py-0.5 bg-white text-slate-900 font-semibold border border-slate-300 rounded-xs text-xs shadow-2xs">
                      {area}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium pt-2 border-t border-slate-200">
                  {report.marketingDirection.strategicAnalysis}
                </p>
              </div>
            )}
          </section>

          {/* 5. Partnership Opportunity (Crucial Core Section!) */}
          <section className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 space-y-6 shadow-2xs">
            <div 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('partnershipOpportunities')}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-slate-900" />
                  <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">5. Partnership Opportunities</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  호텔·리조트·골프·레저 분야 맞춤 마케팅 제휴 아이디어 제안
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2">
                <span className="text-xs font-mono text-slate-400">{report.partnerships?.length || 0} IDEAS GENERATED</span>
                <button className="sm:hidden text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xs">
                  {collapsedSections['partnershipOpportunities'] ? '펼치기 ▲' : '접기 ▼'}
                </button>
              </div>
            </div>

            {!collapsedSections['partnershipOpportunities'] && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(report.partnerships || []).map((p, idx) => (
                  <div key={p.id || `partnership-${p.domain}-${idx}`} className="bg-slate-50 border border-slate-200 rounded-xs p-4 sm:p-6 space-y-4 flex flex-col justify-between hover:border-slate-400 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-mono font-medium rounded-xs">
                          {p.domain}
                        </span>
                        <div className="flex items-center space-x-2 text-xs font-mono">
                          <span className="text-slate-500">난이도: <strong className="text-slate-900">{p.difficulty}</strong></span>
                          <span>•</span>
                          <span className="text-slate-500">확장성: <strong className="text-blue-900">{p.potential}</strong></span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 font-serif leading-snug">
                        {p.idea}
                      </h4>

                    <div className="space-y-2 text-xs text-slate-700">
                      <div>
                        <strong className="text-slate-900 block mb-0.5">■ 왜 이 기업과 잘 맞는가? (Why)</strong>
                        <p className="leading-relaxed">{p.whyThisBrand}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                        <div className="bg-white p-2.5 rounded-xs border border-slate-200">
                          <strong className="text-slate-900 block text-[11px] mb-0.5">상대 기업 혜택 (Brand):</strong>
                          <p className="leading-relaxed text-[11px] text-slate-700">{p.brandBenefit}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-xs border border-slate-200">
                          <strong className="text-slate-900 block text-[11px] mb-0.5">우리 회사 혜택 (Business):</strong>
                          <p className="leading-relaxed text-[11px] text-slate-700">{p.businessBenefit}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-900">타깃 고객: </span>
                        {p.targetCustomer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* 6. AI Recommendation */}
          <section className="bg-slate-900 text-white rounded-sm p-6 sm:p-8 space-y-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-[#D4C8B8] uppercase tracking-widest block">AI TOP RECOMMENDATIONS</span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5">6. AI 최우선 협업 제휴 추천 (Top 3)</h3>
              </div>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(report.recommendations || []).map((rec, idx) => (
                <div key={`rec-top3-${rec.rank || idx}-${idx}`} className="bg-slate-800/90 border border-slate-700 rounded-xs p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-[#736152] text-white text-xs font-mono font-bold rounded-xs border border-[#5C4E43]">
                        {rec.rank}
                      </span>
                      <span className="text-[11px] text-amber-300 font-mono">{rec.badgeText}</span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {rec.ideaTitle}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                      {rec.reasoning}
                    </p>
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
              title="7. 기업 분석 출처 및 참고 데이터"
              description={`"${report.companyName}" 기업 데이터는 기업 공식 IR/보도자료(1차 출처), 컨설팅 그룹 및 주요 경제지(2~3차 출처)의 검증된 출처를 기반으로 작성되었습니다.`}
            />
          )}

          {/* Bottom Trend Navigation Link */}
          <div className="bg-slate-100 border border-slate-200 rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">관련 연관 시장 트렌드가 궁금하신가요?</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {report.companyName} 관련 트렌드로 이동하여 연관 시장 분석 보고서를 바로 확인하세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(report.relatedTrends || []).map((rt, idx) => (
                <button
                  key={`rt-${rt}-${idx}`}
                  onClick={() => onSearchTrend(rt)}
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>{rt} 보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
