import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Handshake,
  Database,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Building2,
  Layers,
  Instagram,
  Target,
  FileSpreadsheet,
  ListOrdered,
  QrCode,
  Newspaper,
  FolderKanban,
  FileText,
  Gift,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickSearch: () => void;
  onOpenSettings: () => void;
  onOpenQRCodeModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickSearch,
  onOpenSettings,
  onOpenQRCodeModal,
}) => {
  // Determine which primary bottom tab is active
  const isHome = activeTab === 'home';
  const isDiscover = ['trend', 'company', 'competitor', 'activation', 'interest', 'partnertarget', 'weeklyplanner', 'pressrelease', 'instagram_event'].includes(activeTab);
  const isPartnership = ['partnerperformance', 'partnerpipeline', 'postevent', 'partnership', 'proposal'].includes(activeTab);
  const isResource = ['knowledge', 'ratecard', 'partnerdb', 'partnerlist', 'referencesite'].includes(activeTab);

  const handleBottomTabClick = (category: 'home' | 'discover' | 'partnership' | 'resource') => {
    switch (category) {
      case 'home':
        setActiveTab('home');
        break;
      case 'discover':
        // If already in discover, stay, else default to trend
        if (!isDiscover) setActiveTab('trend');
        break;
      case 'partnership':
        if (!isPartnership) setActiveTab('partnerperformance');
        break;
      case 'resource':
        if (!isResource) setActiveTab('knowledge');
        break;
    }
  };

  return (
    <>
      {/* 1. STICKY TOP HEADER (MOBILE ONLY) */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#D4C8B8] px-4 py-3 flex items-center justify-between font-sans">
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 bg-[#736152] text-white flex items-center justify-center rounded-xs font-bold text-xs">
            OV
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#2C2C2C]">
              OAK VALLEY
            </span>
            <span className="ml-1.5 text-[10px] font-mono text-[#736152] font-semibold">
              Marketing Target
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onOpenQRCodeModal && (
            <button
              onClick={onOpenQRCodeModal}
              className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors"
              title="QR 만들기"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenQuickSearch}
            className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors"
            title="검색"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors"
            title="설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION PILLS FOR ACTIVE CATEGORY (MOBILE ONLY) */}
      {isDiscover && (
        <div className="md:hidden sticky top-[53px] z-30 bg-[#F5F2EB] border-b border-[#D4C8B8] px-3 py-2 overflow-x-auto scrollbar-none flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'trend'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            트렌드 탐색
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'company'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            기업 트렌드
          </button>
          <button
            onClick={() => setActiveTab('competitor')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'competitor'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            동종업계 트렌드
          </button>
          <button
            onClick={() => setActiveTab('activation')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'activation'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            행사·팝업
          </button>
          <button
            onClick={() => setActiveTab('interest')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'interest'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Search className="w-3 h-3 text-[#736152]" />
            <span>관심도 분석</span>
          </button>
          <button
            onClick={() => setActiveTab('partnertarget')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'partnertarget'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Target className="w-3 h-3 text-[#736152]" />
            <span>파트너 타깃 찾기</span>
          </button>
          <button
            onClick={() => setActiveTab('weeklyplanner')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'weeklyplanner'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#736152]" />
            <span>콘텐츠 랩</span>
          </button>
          <button
            onClick={() => setActiveTab('pressrelease')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'pressrelease'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Newspaper className="w-3 h-3 text-[#736152]" />
            <span>보도자료 작성</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram_event')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'instagram_event'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Instagram className={`w-3 h-3 ${activeTab === 'instagram_event' ? 'text-white' : 'text-[#736152]'}`} />
            <span>Instagram 이벤트</span>
          </button>
          <button
            onClick={() => window.open('https://iparkgolf.ai.studio/#admin', '_blank', 'noopener,noreferrer')}
            className="px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 bg-white text-[#5C4E43] border border-[#E8E4DC] hover:bg-[#EFECE6] cursor-pointer"
            title="고객이벤트관리 (새 탭에서 열기)"
          >
            <Gift className="w-3 h-3 text-[#736152]" />
            <span>고객이벤트관리</span>
            <ExternalLink className="w-2.5 h-2.5 text-[#8C7A6B] ml-0.5" />
          </button>
        </div>
      )}

      {isPartnership && (
        <div className="md:hidden sticky top-[53px] z-30 bg-[#F5F2EB] border-b border-[#D4C8B8] px-3 py-2 overflow-x-auto scrollbar-none flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('partnerperformance')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'partnerperformance'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <span>제휴 성과</span>
          </button>
          <button
            onClick={() => setActiveTab('partnerpipeline')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'partnerpipeline'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <FolderKanban className="w-3 h-3 text-[#736152]" />
            <span>제휴 진행관리</span>
          </button>
          <button
            onClick={() => setActiveTab('postevent')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'postevent'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            행사 후 성과
          </button>
          <button
            onClick={() => setActiveTab('partnership')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'partnership'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            제휴 조건 계산
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'proposal'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            제안서 만들기
          </button>
        </div>
      )}

      {isResource && (
        <div className="md:hidden sticky top-[53px] z-30 bg-[#F5F2EB] border-b border-[#D4C8B8] px-3 py-2 overflow-x-auto scrollbar-none flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'knowledge'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('ratecard')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'ratecard'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            가격자료 DB
          </button>
          <button
            onClick={() => setActiveTab('partnerdb')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 flex items-center space-x-1 ${
              activeTab === 'partnerdb'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            <Building2 className="w-3 h-3 text-[#736152]" />
            <span>파트너 DB</span>
          </button>
          <button
            onClick={() => setActiveTab('partnerlist')}
            className={`px-3 py-1.5 rounded-xs text-xs whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'partnerlist'
                ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5C4E43] border border-[#E8E4DC]'
            }`}
          >
            제휴 제안 관리 히스토리
          </button>
        </div>
      )}

      {/* 3. FIXED BOTTOM NAVIGATION BAR (MOBILE ONLY - 4 TABS) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5] border-t border-[#D4C8B8] px-2 py-1.5 flex items-center justify-around shadow-lg font-sans">
        
        {/* 1. 홈 */}
        <button
          id="mobile-bottom-home"
          onClick={() => handleBottomTabClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs min-h-[44px] min-w-[60px] cursor-pointer transition-colors ${
            isHome ? 'text-[#736152] font-semibold' : 'text-[#8C7A6B] hover:text-[#2C2C2C]'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${isHome ? 'text-[#736152]' : 'text-[#8C7A6B]'}`} />
          <span className="text-[11px] mt-0.5">홈</span>
        </button>

        {/* 2. 탐색 */}
        <button
          id="mobile-bottom-discover"
          onClick={() => handleBottomTabClick('discover')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs min-h-[44px] min-w-[60px] cursor-pointer transition-colors ${
            isDiscover ? 'text-[#736152] font-semibold' : 'text-[#8C7A6B] hover:text-[#2C2C2C]'
          }`}
        >
          <Compass className={`w-5 h-5 ${isDiscover ? 'text-[#736152]' : 'text-[#8C7A6B]'}`} />
          <span className="text-[11px] mt-0.5">탐색</span>
        </button>

        {/* 3. 제휴 */}
        <button
          id="mobile-bottom-partnership"
          onClick={() => handleBottomTabClick('partnership')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs min-h-[44px] min-w-[60px] cursor-pointer transition-colors ${
            isPartnership ? 'text-[#736152] font-semibold' : 'text-[#8C7A6B] hover:text-[#2C2C2C]'
          }`}
        >
          <Handshake className={`w-5 h-5 ${isPartnership ? 'text-[#736152]' : 'text-[#8C7A6B]'}`} />
          <span className="text-[11px] mt-0.5">제휴</span>
        </button>

        {/* 4. 자료 */}
        <button
          id="mobile-bottom-resource"
          onClick={() => handleBottomTabClick('resource')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xs min-h-[44px] min-w-[60px] cursor-pointer transition-colors ${
            isResource ? 'text-[#736152] font-semibold' : 'text-[#8C7A6B] hover:text-[#2C2C2C]'
          }`}
        >
          <Database className={`w-5 h-5 ${isResource ? 'text-[#736152]' : 'text-[#8C7A6B]'}`} />
          <span className="text-[11px] mt-0.5">자료</span>
        </button>

      </nav>
    </>
  );
};
