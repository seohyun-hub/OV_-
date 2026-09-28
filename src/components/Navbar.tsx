import React, { useState } from 'react';
import { ActiveTab } from '../types';
import {
  TrendingUp,
  Building2,
  LayoutDashboard,
  Handshake,
  Search,
  Menu,
  X,
  Compass,
  Layers,
  Database,
  ChevronDown,
  Sparkles,
  FileText,
  Instagram
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const [buildDropdownOpen, setBuildDropdownOpen] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setDiscoverDropdownOpen(false);
    setBuildDropdownOpen(false);
  };

  const isDiscoverActive = ['trend', 'company', 'partnertarget', 'competitor', 'activation'].includes(activeTab);
  const isBuildActive = ['partnership', 'ratecard'].includes(activeTab);

  return (
    <>
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Platform Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleTabClick('home')}
            >
              <div className="w-10 h-10 bg-[#736152] text-[#FAF8F5] flex items-center justify-center rounded-xs font-serif text-sm font-semibold tracking-wider shadow-xs group-hover:bg-[#5C4E43] transition-colors shrink-0">
                OV
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#2C2C2C] text-base sm:text-lg tracking-tight font-serif whitespace-nowrap">
                    Oak Valley Marketing Target
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-medium bg-[#EFECE6] text-[#736152] border border-[#D4C8B8] tracking-wider shrink-0">
                    IPARK리조트
                  </span>
                </div>
                <p className="text-xs text-[#786658] font-light hidden sm:block">
                  2026 기업 & 브랜드 트렌드 조사 · 파트너십 오퍼레이션
                </p>
              </div>
            </div>

            {/* Desktop Navigation Structure: DASHBOARD | DISCOVER | BUILD | KNOWLEDGE */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              
              {/* 1. DASHBOARD */}
              <button
                id="nav-tab-home"
                onClick={() => handleTabClick('home')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-sm transition-all border-b-2 cursor-pointer ${
                  activeTab === 'home'
                    ? 'border-[#736152] text-[#2C2C2C] font-semibold bg-[#F5F2EB]'
                    : 'border-transparent text-[#66584C] hover:text-[#2C2C2C] hover:bg-[#F5F2EB]/60 font-normal'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#8C7A6B]" />
                <span>DASHBOARD</span>
              </button>

              {/* 2. DISCOVER Dropdown Group */}
              <div className="relative group/discover" onMouseLeave={() => setDiscoverDropdownOpen(false)}>
                <button
                  id="nav-tab-discover"
                  onClick={() => handleTabClick('trend')}
                  onMouseEnter={() => setDiscoverDropdownOpen(true)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-sm transition-all border-b-2 cursor-pointer ${
                    isDiscoverActive
                      ? 'border-[#736152] text-[#2C2C2C] font-semibold bg-[#F5F2EB]'
                      : 'border-transparent text-[#66584C] hover:text-[#2C2C2C] hover:bg-[#F5F2EB]/60 font-normal'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#8C7A6B]" />
                  <span>DISCOVER</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C7A6B] transition-transform group-hover/discover:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                {discoverDropdownOpen && (
                  <div className="absolute top-full left-0 w-60 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs shadow-lg py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8C7A6B] font-medium border-b border-[#E8E4DC]/60 mb-1">
                      DISCOVER RESEARCH
                    </div>
                    
                    <button
                      onClick={() => handleTabClick('trend')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeTab === 'trend' ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 text-[#8C7A6B]" />
                      <div>
                        <div className="font-medium text-sm">트렌드 탐색</div>
                        <div className="text-[10px] text-[#8C7A6B]">사회·소비·범산업 변화 발견</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabClick('company')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        ['company', 'partnertarget'].includes(activeTab) ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#8C7A6B]" />
                      <div>
                        <div className="font-medium text-sm">기업 트렌드</div>
                        <div className="text-[10px] text-[#8C7A6B]">기업·브랜드 현황 및 제휴 기회</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabClick('competitor')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeTab === 'competitor' ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-[#8A8768]" />
                      <div>
                        <div className="font-medium text-sm">동종업계 트렌드</div>
                        <div className="text-[10px] text-[#8C7A6B]">국내외 호텔·리조트 현황 및 프로모션</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabClick('activation')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeTab === 'activation' ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-[#736152]" />
                      <div>
                        <div className="font-medium text-sm">행사·팝업</div>
                        <div className="text-[10px] text-[#8C7A6B]">팝업·전시·박람회·브랜드 행사</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. WEEKLY PLANNER */}
              <button
                id="nav-tab-weekly-planner"
                onClick={() => handleTabClick('weeklyplanner')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-sm transition-all border-b-2 cursor-pointer ${
                  activeTab === 'weeklyplanner'
                    ? 'border-[#736152] text-[#2C2C2C] font-semibold bg-[#F5F2EB]'
                    : 'border-transparent text-[#66584C] hover:text-[#2C2C2C] hover:bg-[#F5F2EB]/60 font-normal'
                }`}
              >
                <Instagram className="w-4 h-4 text-[#736152]" />
                <span>WEEKLY PLANNER</span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#736152] text-white rounded-xs">
                  NEW
                </span>
              </button>

              {/* 4. BUILD Dropdown Group */}
              <div className="relative group/build" onMouseLeave={() => setBuildDropdownOpen(false)}>
                <button
                  id="nav-tab-build"
                  onClick={() => handleTabClick('partnership')}
                  onMouseEnter={() => setBuildDropdownOpen(true)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-sm transition-all border-b-2 cursor-pointer ${
                    isBuildActive
                      ? 'border-[#736152] text-[#2C2C2C] font-semibold bg-[#F5F2EB]'
                      : 'border-transparent text-[#66584C] hover:text-[#2C2C2C] hover:bg-[#F5F2EB]/60 font-normal'
                  }`}
                >
                  <Handshake className="w-4 h-4 text-[#8C7A6B]" />
                  <span>BUILD</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C7A6B] transition-transform group-hover/build:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                {buildDropdownOpen && (
                  <div className="absolute top-full left-0 w-60 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs shadow-lg py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8C7A6B] font-medium border-b border-[#E8E4DC]/60 mb-1">
                      BUILD &middot; DEAL BUILDER
                    </div>

                    <button
                      onClick={() => handleTabClick('partnership')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeTab === 'partnership' ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <Handshake className="w-4 h-4 text-[#8C7A6B]" />
                      <div>
                        <div className="font-medium">Partnership Deal Builder</div>
                        <div className="text-[10px] text-[#8C7A6B]">제휴 조건 &middot; 수익성 분석</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTabClick('ratecard')}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        activeTab === 'ratecard' ? 'bg-[#F5F2EB] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#F5F2EB]/80'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-[#8C7A6B]" />
                      <div>
                        <div className="font-medium">Asset / Rate Card</div>
                        <div className="text-[10px] text-[#8C7A6B]">오크밸리 제공 자산 리스트</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. KNOWLEDGE */}
              <button
                id="nav-tab-knowledge"
                onClick={() => handleTabClick('knowledge')}
                className={`flex items-center space-x-1.5 px-3 py-2 text-sm transition-all border-b-2 cursor-pointer ${
                  activeTab === 'knowledge'
                    ? 'border-[#736152] text-[#2C2C2C] font-semibold bg-[#F5F2EB]'
                    : 'border-transparent text-[#66584C] hover:text-[#2C2C2C] hover:bg-[#F5F2EB]/60 font-normal'
                }`}
              >
                <Database className="w-4 h-4 text-[#8C7A6B]" />
                <span>KNOWLEDGE</span>
              </button>

            </nav>

            {/* Right Quick Action Button */}
            <div className="flex items-center space-x-2">
              <button
                id="quick-search-btn"
                onClick={onOpenQuickSearch}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-[#2C2C2C] bg-[#EFECE6] hover:bg-[#E5DFD5] border border-[#D4C8B8] rounded-xs transition-all cursor-pointer shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-[#736152]" />
                <span className="hidden sm:inline font-medium">통합 퀵 서치</span>
                <span className="inline sm:hidden font-medium">검색</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs border border-[#E8E4DC] transition-colors cursor-pointer"
                aria-label="메뉴 열기"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#2C2C2C]" /> : <Menu className="w-5 h-5 text-[#2C2C2C]" />}
              </button>
            </div>

          </div>
        </div>

        {/* Secondary Navigation UI for DISCOVER (4-Tab Card Navigation) */}
        {isDiscoverActive && (
          <div className="bg-[#FAF8F5] border-t border-b border-[#E8E4DC] py-3 px-4 sm:px-6 lg:px-8 shadow-2xs">
            <div className="max-w-7xl mx-auto space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#736152]">
                <Compass className="w-4 h-4 text-[#736152]" />
                <span className="font-bold text-[#2C2C2C] tracking-wide">DISCOVER</span>
                <span className="text-[#8C7A6B]">›</span>
                <span className="text-[#786658] font-normal">탐색 & 리서치 기능 선택</span>
              </div>

              {/* 4 Horizontal Tab Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                {/* 1. 트렌드 탐색 */}
                <button
                  onClick={() => handleTabClick('trend')}
                  className={`p-3 text-left rounded-2xs border transition-all cursor-pointer flex flex-col justify-between group ${
                    activeTab === 'trend'
                      ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                      : 'bg-white hover:bg-[#F5F2EB] text-[#2C2C2C] border-[#E8E4DC] hover:border-[#736152]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${activeTab === 'trend' ? 'text-white' : 'text-[#2C2C2C] group-hover:text-[#736152]'}`}>
                      트렌드 탐색
                    </span>
                    <TrendingUp className={`w-4 h-4 ${activeTab === 'trend' ? 'text-[#EFECE6]' : 'text-[#8C7A6B]'}`} />
                  </div>
                  <span className={`text-[11px] mt-1 line-clamp-1 ${activeTab === 'trend' ? 'text-[#EFECE6]/90' : 'text-[#786658]'}`}>
                    사회·소비·범산업 변화 발견
                  </span>
                </button>

                {/* 2. 기업 트렌드 */}
                <button
                  onClick={() => handleTabClick('company')}
                  className={`p-3 text-left rounded-2xs border transition-all cursor-pointer flex flex-col justify-between group ${
                    ['company', 'partnertarget'].includes(activeTab)
                      ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                      : 'bg-white hover:bg-[#F5F2EB] text-[#2C2C2C] border-[#E8E4DC] hover:border-[#736152]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${['company', 'partnertarget'].includes(activeTab) ? 'text-white' : 'text-[#2C2C2C] group-hover:text-[#736152]'}`}>
                      기업 트렌드
                    </span>
                    <Building2 className={`w-4 h-4 ${['company', 'partnertarget'].includes(activeTab) ? 'text-[#EFECE6]' : 'text-[#8C7A6B]'}`} />
                  </div>
                  <span className={`text-[11px] mt-1 line-clamp-1 ${['company', 'partnertarget'].includes(activeTab) ? 'text-[#EFECE6]/90' : 'text-[#786658]'}`}>
                    기업·브랜드 현황 및 제휴 기회
                  </span>
                </button>

                {/* 3. 동종업계 트렌드 */}
                <button
                  onClick={() => handleTabClick('competitor')}
                  className={`p-3 text-left rounded-2xs border transition-all cursor-pointer flex flex-col justify-between group ${
                    activeTab === 'competitor'
                      ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                      : 'bg-white hover:bg-[#F5F2EB] text-[#2C2C2C] border-[#E8E4DC] hover:border-[#736152]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${activeTab === 'competitor' ? 'text-white' : 'text-[#2C2C2C] group-hover:text-[#736152]'}`}>
                      동종업계 트렌드
                    </span>
                    <Layers className={`w-4 h-4 ${activeTab === 'competitor' ? 'text-[#EFECE6]' : 'text-[#8C7A6B]'}`} />
                  </div>
                  <span className={`text-[11px] mt-1 line-clamp-1 ${activeTab === 'competitor' ? 'text-[#EFECE6]/90' : 'text-[#786658]'}`}>
                    국내외 호텔·리조트 현황 및 프로모션
                  </span>
                </button>

                {/* 4. 행사·팝업 */}
                <button
                  onClick={() => handleTabClick('activation')}
                  className={`p-3 text-left rounded-2xs border transition-all cursor-pointer flex flex-col justify-between group ${
                    activeTab === 'activation'
                      ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                      : 'bg-white hover:bg-[#F5F2EB] text-[#2C2C2C] border-[#E8E4DC] hover:border-[#736152]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${activeTab === 'activation' ? 'text-white' : 'text-[#2C2C2C] group-hover:text-[#736152]'}`}>
                      행사·팝업
                    </span>
                    <Sparkles className={`w-4 h-4 ${activeTab === 'activation' ? 'text-[#EFECE6]' : 'text-[#736152]'}`} />
                  </div>
                  <span className={`text-[11px] mt-1 line-clamp-1 ${activeTab === 'activation' ? 'text-[#EFECE6]/90' : 'text-[#786658]'}`}>
                    팝업·전시·박람회·브랜드 행사
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Slide-down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E4DC] bg-[#FAF8F5] px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            
            {/* 1. DASHBOARD */}
            <div>
              <button
                onClick={() => handleTabClick('home')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-sm transition-colors ${
                  activeTab === 'home' ? 'bg-[#736152] text-[#FAF8F5] font-medium' : 'text-[#2C2C2C] hover:bg-[#EFECE6]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>DASHBOARD</span>
                </div>
              </button>
            </div>

            {/* 2. WEEKLY PLANNER */}
            <div>
              <button
                onClick={() => handleTabClick('weeklyplanner')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-sm transition-colors ${
                  activeTab === 'weeklyplanner' ? 'bg-[#736152] text-[#FAF8F5] font-medium' : 'text-[#2C2C2C] hover:bg-[#EFECE6]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Instagram className="w-4 h-4 text-[#736152]" />
                  <span>WEEKLY CONTENT PLANNER</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#736152] text-white px-1.5 py-0.2 rounded-xs">
                  NEW
                </span>
              </button>
            </div>

            {/* 2. DISCOVER GROUP */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-medium text-[#8C7A6B] uppercase tracking-wider px-3 pt-1">
                DISCOVER
              </div>
              <button
                onClick={() => handleTabClick('trend')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'trend' ? 'bg-[#736152] text-white font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>트렌드 탐색</span>
                </div>
                <span className="text-[10px] opacity-80">사회·소비·범산업 변화 발견</span>
              </button>
              <button
                onClick={() => handleTabClick('company')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-colors ${
                  ['company', 'partnertarget'].includes(activeTab) ? 'bg-[#736152] text-white font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>기업 트렌드</span>
                </div>
                <span className="text-[10px] opacity-80">기업·브랜드 현황 및 제휴 기회</span>
              </button>
              <button
                onClick={() => handleTabClick('competitor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'competitor' ? 'bg-[#736152] text-white font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>동종업계 트렌드</span>
                </div>
                <span className="text-[10px] opacity-80">국내외 호텔·리조트</span>
              </button>
              <button
                onClick={() => handleTabClick('activation')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'activation' ? 'bg-[#736152] text-white font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#736152]" />
                  <span>행사·팝업</span>
                </div>
                <span className="text-[10px] opacity-80">팝업·전시·박람회</span>
              </button>
            </div>

            {/* 3. BUILD GROUP */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-medium text-[#8C7A6B] uppercase tracking-wider px-3 pt-1">
                BUILD
              </div>
              <button
                onClick={() => handleTabClick('partnership')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'partnership' ? 'bg-[#EFECE6] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <Handshake className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span>Partnership Deal Builder (제휴 조건 · 수익성)</span>
              </button>
              <button
                onClick={() => handleTabClick('ratecard')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'ratecard' ? 'bg-[#EFECE6] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span>Asset / Rate Card</span>
              </button>
            </div>

            {/* 4. KNOWLEDGE */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] font-mono font-medium text-[#8C7A6B] uppercase tracking-wider px-3">
                KNOWLEDGE
              </div>
              <button
                onClick={() => handleTabClick('knowledge')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xs text-xs transition-colors ${
                  activeTab === 'knowledge' ? 'bg-[#EFECE6] text-[#2C2C2C] font-semibold' : 'text-[#5C4E43] hover:bg-[#EFECE6]/60'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span>Oak Valley / PARK ROCHE Knowledge Base</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuickSearch();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-colors"
              >
                <Search className="w-4 h-4 text-[#D4C8B8]" />
                <span>통합 퀵 분석 검색</span>
              </button>
            </div>

          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E4DC] flex items-center justify-around h-16 px-1 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#2C2C2C] font-bold' : 'text-[#786658]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">DASHBOARD</span>
        </button>

        <button
          onClick={() => setActiveTab('trend')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs transition-colors cursor-pointer ${
            isDiscoverActive ? 'text-[#2C2C2C] font-bold' : 'text-[#786658]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">DISCOVER</span>
        </button>

        <button
          onClick={() => setActiveTab('partnership')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs transition-colors cursor-pointer ${
            isBuildActive ? 'text-[#2C2C2C] font-bold' : 'text-[#786658]'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">BUILD</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs transition-colors cursor-pointer ${
            activeTab === 'knowledge' ? 'text-[#2C2C2C] font-bold' : 'text-[#786658]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">KNOWLEDGE</span>
        </button>
      </div>
    </>
  );
};


