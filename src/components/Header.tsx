import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Command,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  Handshake,
  Database,
  FileSpreadsheet,
  FileText,
  Instagram,
  Settings,
  Bell,
  Menu,
  User as UserIcon,
  Shield,
  Users,
  LogOut,
  QrCode
} from 'lucide-react';
import { ActiveTab, AuthUser } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
  onOpenQuickSearch: () => void;
  onOpenSettings: () => void;
  onOpenQRCodeModal?: () => void;
  currentUser?: AuthUser | null;
  onOpenUserManagement?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSearchTrend,
  onSearchCompany,
  onOpenQuickSearch,
  onOpenSettings,
  onOpenQRCodeModal,
  currentUser,
  onOpenUserManagement,
  onLogout,
}) => {

  const [searchInput, setSearchInput] = useState('');

  const getPageMeta = (tab: ActiveTab) => {
    switch (tab) {
      case 'home':
        return { group: 'Executive Home', title: '마케팅 현황 대시보드' };
      case 'trend':
        return { group: '트렌드 & 인사이트', title: '트렌드 탐색' };
      case 'company':
        return { group: '트렌드 & 인사이트', title: '기업 트렌드' };
      case 'competitor':
        return { group: '트렌드 & 인사이트', title: '동종업계 트렌드' };
      case 'activation':
        return { group: '트렌드 & 인사이트', title: '행사 · 팝업' };
      case 'interest':
        return { group: '트렌드 & 인사이트', title: '관심도 분석' };
      case 'partnertarget':
        return { group: '트렌드 & 인사이트', title: '파트너 타깃 찾기' };
      case 'weeklyplanner':
        return { group: 'MARKETING', title: '콘텐츠 랩' };
      case 'pressrelease':
        return { group: 'MARKETING', title: '보도자료 작성' };
      case 'instagram_event':
        return { group: 'MARKETING', title: 'Instagram 이벤트' };
      case 'partnerperformance':
        return { group: '제휴 분석 & 제안', title: '제휴 성과' };
      case 'partnerpipeline':
        return { group: '제휴 분석 & 제안', title: '제휴 진행관리' };
      case 'postevent':
        return { group: '제휴 분석 & 제안', title: '행사 후 성과' };
      case 'partnership':
        return { group: '제휴 분석 & 제안', title: '제휴 조건 계산' };
      case 'proposal':
        return { group: '제휴 분석 & 제안', title: '제안서 만들기' };
      case 'knowledge':
        return { group: '자료', title: 'Knowledge Base' };
      case 'ratecard':
        return { group: '자료', title: '가격자료 DB' };
      case 'partnerdb':
        return { group: '자료', title: '파트너 DB' };
      case 'partnerlist':
        return { group: '자료', title: '제휴 제안 관리 히스토리' };
      case 'referencesite':
        return { group: '자료', title: '참고 사이트' };
      default:
        return { group: '마케팅', title: '마케팅 통합 대시보드' };
    }
  };

  const currentMeta = getPageMeta(activeTab);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    const lower = query.toLowerCase();

    // 1. Check if event/popup keyword
    if (
      lower.includes('행사') ||
      lower.includes('팝업') ||
      lower.includes('전시') ||
      lower.includes('박람회') ||
      lower.includes('페스티벌') ||
      lower.includes('activation') ||
      lower.includes('popup')
    ) {
      setActiveTab('activation');
      setSearchInput('');
      return;
    }

    // 2. Check if known or likely company/brand
    const companyKeywords = [
      'nike', 'garmin', 'snow peak', 'lululemon', '아모레퍼시픽', '현대백화점',
      '삼성', 'lg', '포르쉐', '제네시스', '테슬라', '하이트진로', '신세계',
      '카카오', '네이버', '아디다스', '호카', '온러닝', '살로몬', 'patagonia'
    ];

    const isCompany = companyKeywords.some(c => lower.includes(c)) || (query.length <= 10 && /^[A-Za-z0-9\s]+$/.test(query) && !['golf', 'wellness', 'running', 'travel', 'hotel'].includes(lower));

    if (isCompany) {
      onSearchCompany(query);
    } else {
      onSearchTrend(query);
    }
    setSearchInput('');
  };

  return (
    <header className="sticky top-0 z-20 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#D4C8B8] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 font-sans">
      
      {/* 1. Left Breadcrumb / Page Title */}
      <div className="flex items-center space-x-3 shrink-0">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#8C7A6B]">
            <span>{currentMeta.group}</span>
            <span>&rsaquo;</span>
            <span className="text-[#736152] font-semibold">{currentMeta.title}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#2C2C2C] tracking-tight">
            {currentMeta.title}
          </h2>
        </div>
      </div>

      {/* 2. Universal Integrated Search Bar (Desktop) */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center bg-white border border-[#D4C8B8] rounded-xs shadow-2xs focus-within:border-[#736152] focus-within:ring-1 focus-within:ring-[#736152]/30 transition-all">
            <Search className="w-4 h-4 text-[#8C7A6B] ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="기업·브랜드·트렌드·행사 검색 (예: 웰니스, Garmin, 팝업스토어)"
              className="w-full px-3 py-2 text-xs text-[#2C2C2C] placeholder:text-[#8C7A6B]/70 bg-transparent border-none focus:outline-none"
            />
            
            {/* Quick Submit or Cmd+K Hint */}
            <div className="flex items-center space-x-1 mr-1.5">
              {searchInput.trim() ? (
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-medium rounded-xs transition-colors cursor-pointer"
                >
                  검색
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenQuickSearch}
                  className="hidden lg:flex items-center space-x-1 px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-[10px] font-mono text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] transition-colors"
                  title="빠른 검색창 열기"
                >
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 3. Right Status & Action Controls */}
      <div className="flex items-center space-x-2 shrink-0">
        
        {/* Quick Search Modal Button */}
        <button
          onClick={onOpenQuickSearch}
          className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors md:hidden cursor-pointer"
          title="검색"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* QR Code Generator Button */}
        {onOpenQRCodeModal && (
          <button
            onClick={onOpenQRCodeModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-[#EFECE6] border border-[#D4C8B8] text-[#736152] hover:text-[#2C2C2C] text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-2xs"
            title="고화질 QR 코드 만들기 (중앙 로고 삽입 지원)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR 만들기</span>
          </button>
        )}

        {/* Date Stamp */}
        <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-[#EFECE6]/60 border border-[#D4C8B8] rounded-xs text-[11px] font-mono text-[#786658]">
          <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
          <span>{new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</span>
        </div>

        {/* System Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors cursor-pointer"
          title="시스템 설정"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Identity Display (박서현 | Revenue) */}
        {currentUser && (
          <div className="flex items-center space-x-2 pl-2 border-l border-[#D4C8B8]">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#F5F2EB] border border-[#E8E4DC] rounded-xs text-xs">
              <UserIcon className="w-3.5 h-3.5 text-[#736152]" />
              <span className="font-bold text-[#2C2C2C]">{currentUser.name}</span>
              <span className="text-[#8C7A6B]">|</span>
              <span className="text-[#736152] font-medium">{currentUser.team}</span>
            </div>

            {/* Admin User Management Button */}
            {currentUser.isAdmin && onOpenUserManagement && (
              <button
                onClick={onOpenUserManagement}
                className="px-2.5 py-1 bg-[#FAF8F5] border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] hover:text-[#2C2C2C] text-xs font-medium rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
                title="사용자 관리 (Admin)"
              >
                <Users className="w-3.5 h-3.5 text-[#736152]" />
                <span className="hidden sm:inline">사용자 관리</span>
              </button>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-2 py-1 bg-white border border-[#E8E4DC] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-[#8C7A6B] text-xs font-medium rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            )}
          </div>
        )}
      </div>


    </header>
  );
};
