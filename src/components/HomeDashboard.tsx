import React, { useState } from 'react';
import {
  TrendingUp,
  Building2,
  ArrowRight,
  Search,
  Clock,
  Sparkles,
  Compass,
  Handshake,
  ChevronRight,
  ShieldCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ActiveTab } from '../types';
import { TodaysSignalsSection } from './TodaysSignalsSection';

interface HomeDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateTab,
  onSearchTrend,
  onSearchCompany,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [searchMode, setSearchMode] = useState<'auto' | 'trend' | 'company'>('auto');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickInput.trim();
    if (!query) {
      onNavigateTab('trend');
      return;
    }

    if (searchMode === 'company') {
      onSearchCompany(query);
    } else if (searchMode === 'trend') {
      onSearchTrend(query);
    } else {
      // Auto detect or default
      const knownCompanies = ['nike', 'snow peak', 'garmin', 'national geographic', '아모레퍼시픽', '현대백화점', '삼성', 'lg'];
      if (knownCompanies.some(c => query.toLowerCase().includes(c))) {
        onSearchCompany(query);
      } else {
        onSearchTrend(query);
      }
    }
  };

  const recentTrends = [
    { title: '2026 웰니스 & 수면 투어리즘', category: 'Wellness', period: '최근 1년', date: '2026.08.11' },
    { title: '럭셔리 리조트 & 골프 마케팅', category: 'Hospitality', period: '최근 6개월', date: '2026.08.10' },
    { title: '하이엔드 프리미엄 골프 트렌드', category: 'Golf', period: '최근 3개월', date: '2026.08.09' },
    { title: '시니어 웰니스 & 액티브 리조트', category: 'Retail', period: '최근 1년', date: '2026.08.08' },
  ];

  const recentCompanies = [
    { name: 'Garmin', englishName: 'Garmin Ltd.', industry: 'Sports Wearable & GPS', keywords: ['Golf', 'Bio-Data', 'Performance'] },
    { name: 'Nike', englishName: 'Nike, Inc.', industry: 'Athletic Footwear & Apparel', keywords: ['Running', 'Community', 'Golf'] },
    { name: 'Snow Peak', englishName: 'Snow Peak Inc.', industry: 'Outdoor & Glamping Luxury', keywords: ['Outdoor', 'Nature', 'Stay'] },
    { name: 'National Geographic', englishName: 'National Geographic', industry: 'Outdoor Apparel & Media', keywords: ['Explore', 'Kids', 'Lifestyle'] },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">

      {/* 1. EXECUTIVE HERO BANNER */}
      <div className="bg-[#EFECE6] border border-[#D4C8B8] rounded-xs p-8 sm:p-12 relative overflow-hidden shadow-2xs">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-xs bg-[#FAF8F5] text-[#736152] text-xs font-mono uppercase tracking-wider border border-[#D4C8B8]">
            <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>EXECUTIVE HOME · OAK VALLEY INTELLIGENCE PLATFORM</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-serif-display font-bold text-[#2C2C2C] tracking-tight leading-snug">
            Oak Valley Marketing Target
          </h1>
          
          <div className="space-y-1">
            <p className="text-[#2C2C2C] font-medium text-sm sm:text-base">
              2026 기업 & 브랜드 트렌드 조사 · 파트너십 기회 분석 시스템
            </p>
            <p className="text-[#5C4E43] text-xs sm:text-sm leading-relaxed font-light max-w-2xl">
              오크밸리·파크로쉬와 연계 가능한 시장 트렌드와 기업·브랜드를 조사하고, 새로운 제휴 기회를 발굴합니다.
            </p>
          </div>

          {/* Quick Integrated Search Input */}
          <div className="pt-4">
            <form onSubmit={handleQuickSubmit} className="space-y-2 max-w-2xl">
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs shadow-2xs focus-within:border-[#736152] transition-all">
                <Search className="w-5 h-5 text-[#8C7A6B] ml-4 shrink-0" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="트렌드·산업·기업·브랜드 검색 (예: 웰니스, 러닝, Garmin, Nike)"
                  className="w-full px-3 py-3.5 text-sm bg-transparent border-none focus:outline-none text-[#2C2C2C] placeholder:text-[#8C7A6B]/70 font-normal"
                />
                <button
                  type="submit"
                  className="mr-1.5 px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-medium rounded-xs transition-colors shrink-0 cursor-pointer flex items-center space-x-1"
                >
                  <span>검색 · 분석</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#786658] pt-1">
                <span className="font-mono text-[11px] text-[#8C7A6B]">추천 검색:</span>
                <button
                  type="button"
                  onClick={() => onSearchTrend('웰니스')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  웰니스
                </button>
                <button
                  type="button"
                  onClick={() => onSearchTrend('러닝')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  러닝
                </button>
                <button
                  type="button"
                  onClick={() => onSearchTrend('프리미엄 F&B')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  프리미엄 F&B
                </button>
                <button
                  type="button"
                  onClick={() => onSearchTrend('골프 산업')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  골프 산업
                </button>
                <button
                  type="button"
                  onClick={() => onSearchCompany('Garmin')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  Garmin
                </button>
                <button
                  type="button"
                  onClick={() => onSearchCompany('Snow Peak')}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xs text-[11px] font-normal text-[#2C2C2C] transition-colors"
                >
                  Snow Peak
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* 2. THREE PRIMARY HIGHLIGHTED CTAs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
          <h2 className="text-lg font-serif-display font-semibold text-[#2C2C2C] tracking-tight">
            CORE PLATFORM WORKFLOWS
          </h2>
          <span className="text-xs font-mono text-[#8C7A6B] uppercase">DISCOVER & BUILD</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CTA 1: Trend 탐색 */}
          <div
            onClick={() => onNavigateTab('trend')}
            className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-6 hover:border-[#8C7A6B] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xs bg-[#EFECE6] text-[#736152] flex items-center justify-center border border-[#D4C8B8]">
                  <TrendingUp className="w-5 h-5 text-[#736152]" />
                </div>
                <span className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider">
                  01 DISCOVER
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif-display font-bold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                  Trend 탐색
                </h3>
                <p className="text-xs text-[#786658] font-light leading-relaxed mt-1">
                  2026 웰니스, 하이엔드 골프, 럭셔리 호스피탈리티, 라이프스타일 트렌드 및 오크밸리 기회 요인을 수집·분석합니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#736152] font-medium">
              <span>Market & Trend Radar</span>
              <div className="w-7 h-7 rounded-full bg-[#EFECE6] flex items-center justify-center group-hover:bg-[#736152] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* CTA 2: 기업 탐색 */}
          <div
            onClick={() => onNavigateTab('company')}
            className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-6 hover:border-[#8C7A6B] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xs bg-[#EFECE6] text-[#736152] flex items-center justify-center border border-[#D4C8B8]">
                  <Building2 className="w-5 h-5 text-[#736152]" />
                </div>
                <span className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider">
                  02 ANALYZE
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif-display font-bold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                  기업 탐색
                </h3>
                <p className="text-xs text-[#786658] font-light leading-relaxed mt-1">
                  타깃 브랜드의 정체성, 콜라보레이션 역사, 오크밸리 리조트 자산과의 적합도를 정밀 분석합니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#736152] font-medium">
              <span>Brand & Company Radar</span>
              <div className="w-7 h-7 rounded-full bg-[#EFECE6] flex items-center justify-center group-hover:bg-[#736152] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* CTA 3: 제휴안 만들기 */}
          <div
            onClick={() => onNavigateTab('partnership')}
            className="bg-[#F5F2EB] border border-[#D4C8B8] rounded-xs p-6 hover:border-[#736152] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xs bg-[#736152] text-white flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-mono text-[#736152] uppercase tracking-wider font-semibold">
                  03 BUILD
                </span>
              </div>

              <div>
                <h3 className="text-lg font-serif-display font-bold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                  제휴 조건 · 수익성 분석
                </h3>
                <p className="text-xs text-[#5C4E43] font-light leading-relaxed mt-1">
                  오크밸리 제공가치와 파트너 지원가치를 비교하여 적정 제휴 조건과 협상 기준을 산정합니다.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D4C8B8] flex items-center justify-between text-xs text-[#736152] font-semibold">
              <span>Partnership Deal Builder</span>
              <div className="w-7 h-7 rounded-full bg-[#736152] text-white flex items-center justify-center group-hover:bg-[#5C4E43] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. TODAY'S SIGNALS SECTION */}
      <TodaysSignalsSection
        onSearchTrend={onSearchTrend}
        onSearchCompany={onSearchCompany}
        onNavigateTab={onNavigateTab}
      />

      {/* 4. RECENT INTELLIGENCE REPORTS */}
      <div className="space-y-6 pt-6 border-t border-[#E8E4DC]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-[#8C7A6B]" />
            <h3 className="text-lg font-serif-display font-semibold text-[#2C2C2C]">
              최근 분석 리포트 (Recent Signals)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8C7A6B]">INTELLIGENCE HISTORY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Trend Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-[#8C7A6B] uppercase font-medium">Market Trends</span>
              <button
                onClick={() => onNavigateTab('trend')}
                className="text-xs text-[#736152] hover:underline font-medium"
              >
                전체보기 &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTrends.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSearchTrend(item.title)}
                  className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 hover:border-[#8C7A6B] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                        {item.title}
                      </span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-[#EFECE6] text-[#786658] border border-[#D4C8B8] rounded-xs font-mono">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#786658] font-light">기준: {item.period} 인텔리전스</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-[#8C7A6B]">{item.date}</span>
                    <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Company Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-[#8C7A6B] uppercase font-medium">Target Companies</span>
              <button
                onClick={() => onNavigateTab('company')}
                className="text-xs text-[#736152] hover:underline font-medium"
              >
                전체보기 &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {recentCompanies.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSearchCompany(item.name)}
                  className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 hover:border-[#8C7A6B] transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[#8C7A6B] font-mono">({item.englishName})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.map((kw, kidx) => (
                        <span key={kidx} className="text-[10px] px-1.5 py-0.2 bg-[#EFECE6] text-[#786658] border border-[#E8E4DC] rounded-xs font-light">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-[#8C7A6B] hidden sm:inline">{item.industry}</span>
                    <ArrowRight className="w-4 h-4 text-[#8C7A6B] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

