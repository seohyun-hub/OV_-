import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCw,
  TrendingUp,
  Building2,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Tag,
  Layers,
} from 'lucide-react';
import { TodaysSignalsData, ActiveTab } from '../types';
import { SourcesAndReferencesSection } from './SourcesAndReferencesSection';
import { TODAY_ACTIVATION_SIGNALS_DATA } from '../data/sampleActivations';

interface TodaysSignalsSectionProps {
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

const LOCAL_STORAGE_KEY = 'oakvalley_todays_signals_cache';

export const TodaysSignalsSection: React.FC<TodaysSignalsSectionProps> = ({
  onSearchTrend,
  onSearchCompany,
  onNavigateTab,
}) => {
  const [signals, setSignals] = useState<TodaysSignalsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTodayFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const todayStr = getTodayFormatted();

  const fetchSignals = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/todays-signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRefresh }),
      });

      let json: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        json = await res.json();
      }
      if (json && json.success && json.signals) {
        setSignals(json.signals);
        // Cache in localStorage with date tag
        try {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({
              date: todayStr,
              timestamp: Date.now(),
              data: json.signals,
            })
          );
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }
      } else {
        setError(json?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error fetching Todays Signals:', err);
      setError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.date === todayStr && parsed.data) {
          setSignals(parsed.data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    // Otherwise fetch from server
    fetchSignals(false);
  }, []);

  const handleRefresh = () => {
    fetchSignals(true);
  };

  const getRelevanceBadgeStyle = (level: 'HIGH' | 'MEDIUM' | 'LOW' | string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-[#EFECE6] text-[#736152] border-[#D4C8B8] font-bold';
      case 'MEDIUM':
        return 'bg-[#F5F2EB] text-[#8C7A6B] border-[#E8E4DC]';
      default:
        return 'bg-[#FAF8F5] text-[#786658] border-[#E8E4DC]';
    }
  };

  const getOpportunityBadgeStyle = (type: string) => {
    switch (type) {
      case 'QUICK WIN':
        return 'bg-[#736152] text-[#FAF8F5] border-[#5C4E43]';
      case 'SIGNATURE':
        return 'bg-[#8C7A6B] text-[#FAF8F5] border-[#736152]';
      case 'FUTURE BET':
        return 'bg-[#8A8768] text-[#FAF8F5] border-[#706E52]';
      default:
        return 'bg-[#5C4E43] text-[#FAF8F5] border-[#2C2C2C]';
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-6 sm:p-8 space-y-8 shadow-2xs relative">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-5 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#736152] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#2C2C2C] tracking-tight">
              오늘의 트렌드
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-mono font-medium text-[#736152] bg-[#EFECE6] rounded-xs border border-[#D4C8B8]">
              {signals?.date || todayStr}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#786658] font-light">
            오늘의 트렌드 및 오크밸리 제휴 기회
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-[#8C7A6B] hidden md:inline">
            DAILY UPDATE
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-all cursor-pointer disabled:opacity-50"
            title="최신 분석 데이터로 새로고침"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* SKELETON LOADING STATE */}
      {loading && (
        <div className="space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-xs w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-xs border border-slate-200" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded-xs w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-xs border border-slate-200" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xs p-6 text-center space-y-3">
          <p className="text-sm text-rose-700 font-semibold">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xs hover:bg-slate-800 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      )}

      {/* SIGNALS CONTENT */}
      {!loading && !error && signals && (
        <div className="space-y-10">
          
          {/* ① MARKET SIGNALS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold font-serif text-slate-900 tracking-tight">
                  ① 주목할 트렌드 3
                </h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  (주목할 최신 시장 트렌드)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">TREND UPDATE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.trendSignals.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-xs p-5 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs border ${getRelevanceBadgeStyle(
                          item.oakValleyRelevance
                        )}`}
                      >
                        {item.oakValleyRelevance === 'HIGH' ? '오크밸리 연계 높음' : item.oakValleyRelevance === 'MEDIUM' ? '오크밸리 연계 보통' : item.oakValleyRelevance === 'LOW' ? '오크밸리 연계 낮음' : `오크밸리 연계 ${item.oakValleyRelevance}`}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                        {item.trend}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xs p-2.5 text-[11px] text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block text-[10px] font-mono text-slate-500">
                        주목 이유
                      </span>
                      <p className="leading-normal">{item.whyNow}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.tags.map((tag, tidx) => (
                        <span
                          key={tidx}
                          className="px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded-xs font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => onSearchTrend(item.trend)}
                      className="w-full py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>자세히 분석</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ② BRAND MOVES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold font-serif text-slate-900 tracking-tight">
                  ② 주목할 브랜드 3
                </h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  (주목할 제휴 제안 브랜드)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">BRAND UPDATE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.brandWatch.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/70 border border-slate-200 rounded-xs p-5 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                        {item.brand}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white rounded-xs">
                        {item.recommendedTouchpoint}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-[11px]">최근 움직임:</span>
                        <p className="text-slate-700 leading-relaxed mt-0.5">
                          {item.recentMovement}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xs p-2.5 space-y-1">
                        <span className="font-bold text-slate-900 block text-[10px] font-mono text-slate-500">
                          주목 이유
                        </span>
                        <p className="text-slate-700 text-[11px] leading-normal">{item.whyWatch}</p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 text-[11px]">오크밸리 연계 가능성:</span>
                        <p className="text-slate-600 text-[11px] leading-normal mt-0.5">
                          {item.oakValleyFit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => onSearchCompany(item.brand)}
                      className="w-full py-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-900 text-xs font-bold rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>기업 분석</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ③ OAK OPPORTUNITIES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold font-serif text-slate-900 tracking-tight">
                  ③ 오크밸리 적용 아이디어 3
                </h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  (오크밸리 맞춤 실행 아이디어)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">ACTION IDEAS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.opportunities.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xs p-5 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs border ${getOpportunityBadgeStyle(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        난이도: <strong className="text-slate-900">{item.executionDifficulty}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.idea}
                    </h4>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xs border border-slate-100 leading-relaxed">
                      {item.concept}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">타깃:</span>
                        <span className="font-medium text-slate-800 text-[11px] text-right">
                          {item.targetCustomer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">파트너:</span>
                        <span className="font-medium text-slate-800 text-[11px] text-right">
                          {item.recommendedPartnerCategory}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">연계자산:</span>
                        <span className="font-medium text-slate-900 text-[11px] text-right">
                          {item.oakValleyAsset}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-3.5 rounded-b-xs">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">
                      기대 효과
                    </span>
                    <p className="text-xs text-slate-900 font-medium leading-snug mt-0.5">
                      {item.expectedBenefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ④ TODAY'S ACTIVATION SIGNALS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-900" />
                <h3 className="text-base font-bold font-serif text-slate-900 tracking-tight">
                  ④ 주요 브랜드 팝업·행사
                </h3>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  (최근 진행 중인 주요 브랜딩 행사)
                </span>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('activation')}
                className="text-xs font-mono font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>Activation Radar 전체보기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Grid for 9 Activation items (3 Popups, 3 Exhibitions, 3 Events) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ...(TODAY_ACTIVATION_SIGNALS_DATA?.popups || []),
                ...(TODAY_ACTIVATION_SIGNALS_DATA?.exhibitionsFairs || TODAY_ACTIVATION_SIGNALS_DATA?.exhibitions || []),
                ...(TODAY_ACTIVATION_SIGNALS_DATA?.brandEvents || [])
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xs p-5 hover:border-slate-400 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-amber-300 rounded-xs uppercase">
                        {item.eventType}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        📍 {item.location}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                        {item.event}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Brand: {item.brand} | Period: {item.period}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xs p-2.5 space-y-1">
                      <span className="font-bold text-slate-900 block text-[10px] font-mono text-slate-500">
                        주목 이유
                      </span>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{item.whyWatch}</p>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xs p-2.5 space-y-1">
                      <span className="font-bold text-amber-900 block text-[10px] font-mono">
                        오크밸리 연계 포인트
                      </span>
                      <p className="text-slate-800 text-[11px] leading-relaxed font-sans">
                        {item.relevance}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('activation')}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Activation Radar에서 자세히 보기</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY THIS MATTERS */}
          <div className="bg-slate-900 text-white rounded-sm p-6 space-y-4 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Compass className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-200">
                  오늘의 핵심 요약
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">KEY TAKEAWAY</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-mono text-blue-300 font-bold block mb-1">
                  "오늘 가장 주목해야 할 한 가지"
                </span>
                <p className="text-sm sm:text-base font-serif font-semibold text-white leading-relaxed">
                  {signals.whyThisMatters.keyTakeaway}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/80 border border-slate-700 p-3.5 rounded-xs gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300 font-mono font-bold">
                    추천 실행 방안:
                  </span>
                  <span className="text-xs text-white font-medium">
                    {signals.whyThisMatters.recommendedAction}
                  </span>
                </div>

                <button
                  onClick={() => onSearchTrend(signals.trendSignals[0]?.trend || '2026 웰니스 트렌드')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto shadow-2xs"
                >
                  관련 트렌드 Deep Research &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Sources & References */}
          {signals.references && signals.references.length > 0 && (
            <SourcesAndReferencesSection
              references={signals.references}
              title="오늘의 트렌드 출처 및 참고자료"
              description="오늘 수집 및 분석된 트렌드 및 브랜드 정보의 검증된 출처 목록입니다."
            />
          )}

        </div>
      )}

    </div>
  );
};
