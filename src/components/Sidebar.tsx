import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Layers,
  Sparkles,
  Instagram,
  Handshake,
  FileSpreadsheet,
  FileText,
  Database,
  ListOrdered,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building,
  Target,
  BarChart3,
  Search,
  Megaphone,
  QrCode,
  Newspaper,
  FolderKanban,
  Globe,
  Gift,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab, AuthUser, isMenuAllowed } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenProposalBuilder?: () => void;
  onOpenQRCodeModal?: () => void;
  currentUser?: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenProposalBuilder,
  onOpenQRCodeModal,
  currentUser,
}) => {
  // Collapsible menu groups states (default open)
  const [trendsOpen, setTrendsOpen] = useState(true);
  const [marketingOpen, setMarketingOpen] = useState(true);
  const [partnershipsOpen, setPartnershipsOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);

  const isTrendGroupActive = ['trend', 'company', 'competitor', 'activation', 'interest', 'partnertarget'].includes(activeTab);
  const isMarketingGroupActive = ['weeklyplanner', 'pressrelease', 'instagram_event'].includes(activeTab);
  const isPartnershipGroupActive = ['partnerperformance', 'partnerpipeline', 'postevent', 'partnership', 'proposal'].includes(activeTab);
  const isResourceGroupActive = ['knowledge', 'ratecard', 'partnerdb', 'partnerlist', 'referencesite'].includes(activeTab);

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleProposalClick = () => {
    setActiveTab('proposal');
    if (onOpenProposalBuilder) {
      onOpenProposalBuilder();
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#F5F2EB] border-r border-[#D4C8B8] flex flex-col justify-between shrink-0 select-none z-30 font-sans">
      
      {/* 1. BRAND HEADER */}
      <div className="p-5 border-b border-[#D4C8B8]">
        <div
          onClick={() => handleNav('home')}
          className="cursor-pointer group flex items-start space-x-3"
        >
          <div className="w-9 h-9 bg-[#736152] text-white flex items-center justify-center rounded-xs font-bold text-sm tracking-wider shadow-2xs group-hover:bg-[#5C4E43] transition-colors shrink-0">
            OV
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-[#2C2C2C]">
                OAK VALLEY
              </span>
            </div>
            <div className="text-xs text-[#736152] font-semibold tracking-tight">
              Marketing Target
            </div>
            <div className="text-[10px] text-[#8C7A6B] font-mono">
              IPARK RESORT
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION MENU TREE */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        
        {/* DASHBOARD */}
        {isMenuAllowed(currentUser, 'home') && (
          <div>
            <button
              id="sidebar-tab-home"
              onClick={() => handleNav('home')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xs text-xs transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                  : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'home' ? 'text-white' : 'text-[#736152]'}`} />
              <span>대시보드</span>
            </button>
          </div>
        )}

        {/* 1. 트렌드 & 인사이트 (TREND & INSIGHTS GROUP) */}
        {(isMenuAllowed(currentUser, 'trend') || isMenuAllowed(currentUser, 'company') || isMenuAllowed(currentUser, 'competitor') || isMenuAllowed(currentUser, 'activation') || isMenuAllowed(currentUser, 'interest') || isMenuAllowed(currentUser, 'partnertarget')) && (
          <div className="space-y-1">
            <button
              onClick={() => setTrendsOpen(!trendsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider hover:text-[#2C2C2C] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <span>트렌드 & 인사이트</span>
                {isTrendGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#736152]" />
                )}
              </div>
              {trendsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {trendsOpen && (
              <div className="pl-1 space-y-0.5 animate-in fade-in duration-150">
                
                {/* 1. 트렌드 탐색 */}
                {isMenuAllowed(currentUser, 'trend') && (
                  <button
                    id="sidebar-tab-trend"
                    onClick={() => handleNav('trend')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'trend'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'trend' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>트렌드 탐색</span>
                    </div>
                  </button>
                )}

                {/* 2. 기업 트렌드 */}
                {isMenuAllowed(currentUser, 'company') && (
                  <button
                    id="sidebar-tab-company"
                    onClick={() => handleNav('company')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'company'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className={`w-3.5 h-3.5 ${activeTab === 'company' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>기업 트렌드</span>
                    </div>
                  </button>
                )}

                {/* 3. 동종업계 트렌드 */}
                {isMenuAllowed(currentUser, 'competitor') && (
                  <button
                    id="sidebar-tab-competitor"
                    onClick={() => handleNav('competitor')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'competitor'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Layers className={`w-3.5 h-3.5 ${activeTab === 'competitor' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>동종업계 트렌드</span>
                    </div>
                  </button>
                )}

                {/* 4. 행사·팝업 */}
                {isMenuAllowed(currentUser, 'activation') && (
                  <button
                    id="sidebar-tab-activation"
                    onClick={() => handleNav('activation')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'activation'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'activation' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>행사·팝업</span>
                    </div>
                  </button>
                )}

                {/* 5. 관심도 분석 */}
                {isMenuAllowed(currentUser, 'interest') && (
                  <button
                    id="sidebar-tab-interest"
                    onClick={() => handleNav('interest')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'interest'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Search className={`w-3.5 h-3.5 ${activeTab === 'interest' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>관심도 분석</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'interest' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      NEW
                    </span>
                  </button>
                )}

                {/* 6. 파트너 타깃 찾기 */}
                {isMenuAllowed(currentUser, 'partnertarget') && (
                  <button
                    id="sidebar-tab-partnertarget"
                    onClick={() => handleNav('partnertarget')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnertarget'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Target className={`w-3.5 h-3.5 ${activeTab === 'partnertarget' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>파트너 타깃 찾기</span>
                    </div>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* 2. MARKETING (마케팅 실행 GROUP) */}
        {(isMenuAllowed(currentUser, 'weeklyplanner') || isMenuAllowed(currentUser, 'pressrelease') || isMenuAllowed(currentUser, 'instagram_event')) && (
          <div className="space-y-1">
            <button
              onClick={() => setMarketingOpen(!marketingOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider hover:text-[#2C2C2C] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <span>MARKETING</span>
                {isMarketingGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#736152]" />
                )}
              </div>
              {marketingOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {marketingOpen && (
              <div className="pl-1 space-y-0.5 animate-in fade-in duration-150">
                
                {/* 1. 콘텐츠 랩 */}
                {isMenuAllowed(currentUser, 'weeklyplanner') && (
                  <button
                    id="sidebar-tab-weeklyplanner"
                    onClick={() => handleNav('weeklyplanner')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'weeklyplanner'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'weeklyplanner' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>콘텐츠 랩</span>
                    </div>
                  </button>
                )}

                {/* 2. 보도자료 작성 */}
                {isMenuAllowed(currentUser, 'pressrelease') && (
                  <button
                    id="sidebar-tab-pressrelease"
                    onClick={() => handleNav('pressrelease')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'pressrelease'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Newspaper className={`w-3.5 h-3.5 ${activeTab === 'pressrelease' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>보도자료 작성</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'pressrelease' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      NEW
                    </span>
                  </button>
                )}

                {/* 3. Instagram 이벤트 */}
                {isMenuAllowed(currentUser, 'instagram_event') && (
                  <button
                    id="sidebar-tab-instagram_event"
                    onClick={() => handleNav('instagram_event')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'instagram_event'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Instagram className={`w-3.5 h-3.5 ${activeTab === 'instagram_event' ? 'text-white' : 'text-[#736152]'}`} />
                      <span className="font-medium">Instagram 이벤트</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'instagram_event' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      BETA
                    </span>
                  </button>
                )}

                {/* 4. 고객이벤트관리 (외부 도구) */}
                <button
                  id="sidebar-tab-customer_event"
                  onClick={() => window.open('https://iparkgolf.ai.studio/#admin', '_blank', 'noopener,noreferrer')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer text-[#2C2C2C] hover:bg-[#EFECE6] font-normal"
                  title="고객이벤트관리 (새 탭에서 열기)"
                >
                  <div className="flex items-center space-x-2.5">
                    <Gift className="w-3.5 h-3.5 text-[#736152]" />
                    <span className="font-medium">고객이벤트관리</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none bg-[#E5DFD3] text-[#5C4E43]">
                      EXT
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#8C7A6B]" />
                  </div>
                </button>

                {/* QR 코드 만들기 */}
                {onOpenQRCodeModal && (
                  <button
                    id="sidebar-tab-qrcode"
                    onClick={onOpenQRCodeModal}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer text-[#2C2C2C] hover:bg-[#EFECE6] font-normal"
                  >
                    <div className="flex items-center space-x-2.5">
                      <QrCode className="w-3.5 h-3.5 text-[#736152]" />
                      <span>QR 코드 만들기</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none bg-[#E5DFD3] text-[#5C4E43]">
                      TOOL
                    </span>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* 3. 제휴 분석 & 제안 (PARTNERSHIP GROUP) */}
        {(isMenuAllowed(currentUser, 'partnerperformance') || isMenuAllowed(currentUser, 'partnerpipeline') || isMenuAllowed(currentUser, 'postevent') || isMenuAllowed(currentUser, 'partnership') || isMenuAllowed(currentUser, 'proposal')) && (
          <div className="space-y-1">
            <button
              onClick={() => setPartnershipsOpen(!partnershipsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider hover:text-[#2C2C2C] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <span>제휴 분석 & 제안</span>
                {isPartnershipGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#736152]" />
                )}
              </div>
              {partnershipsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {partnershipsOpen && (
              <div className="pl-1 space-y-0.5 animate-in fade-in duration-150">
                
                {/* 1. 제휴 성과 */}
                {isMenuAllowed(currentUser, 'partnerperformance') && (
                  <button
                    id="sidebar-tab-partnerperformance"
                    onClick={() => handleNav('partnerperformance')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnerperformance'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'partnerperformance' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>제휴 성과</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'partnerperformance' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      KPI
                    </span>
                  </button>
                )}

                {/* 2. 제휴 진행관리 */}
                {isMenuAllowed(currentUser, 'partnerpipeline') && (
                  <button
                    id="sidebar-tab-partnerpipeline"
                    onClick={() => handleNav('partnerpipeline')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnerpipeline'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FolderKanban className={`w-3.5 h-3.5 ${activeTab === 'partnerpipeline' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>제휴 진행관리</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'partnerpipeline' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      NEW
                    </span>
                  </button>
                )}

                {/* 3. 행사 후 성과 */}
                {isMenuAllowed(currentUser, 'postevent') && (
                  <button
                    id="sidebar-tab-postevent"
                    onClick={() => handleNav('postevent')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'postevent'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'postevent' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>행사 후 성과</span>
                    </div>
                  </button>
                )}

                {/* 4. 제휴 조건 계산 */}
                {isMenuAllowed(currentUser, 'partnership') && (
                  <button
                    id="sidebar-tab-partnership"
                    onClick={() => handleNav('partnership')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnership'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Handshake className={`w-3.5 h-3.5 ${activeTab === 'partnership' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>제휴 조건 계산</span>
                    </div>
                  </button>
                )}

                {/* 5. 제안서 만들기 */}
                {(isMenuAllowed(currentUser, 'proposal') || isMenuAllowed(currentUser, 'partnership')) && (
                  <button
                    id="sidebar-tab-proposal"
                    onClick={handleProposalClick}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'proposal'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className={`w-3.5 h-3.5 ${activeTab === 'proposal' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>제안서 만들기</span>
                    </div>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

        {/* 4. 자료 (RESOURCES GROUP) */}
        {(isMenuAllowed(currentUser, 'knowledge') || isMenuAllowed(currentUser, 'ratecard') || isMenuAllowed(currentUser, 'partnerdb') || isMenuAllowed(currentUser, 'partnerlist') || isMenuAllowed(currentUser, 'referencesite')) && (
          <div className="space-y-1">
            <button
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider hover:text-[#2C2C2C] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-1.5">
                <span>자료</span>
                {isResourceGroupActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#736152]" />
                )}
              </div>
              {resourcesOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {resourcesOpen && (
              <div className="pl-1 space-y-0.5 animate-in fade-in duration-150">
                
                {/* 1. Knowledge Base */}
                {isMenuAllowed(currentUser, 'knowledge') && (
                  <button
                    id="sidebar-tab-knowledge"
                    onClick={() => handleNav('knowledge')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'knowledge'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Database className={`w-3.5 h-3.5 ${activeTab === 'knowledge' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>Knowledge Base</span>
                    </div>
                  </button>
                )}

                {/* 2. 가격자료 DB */}
                {isMenuAllowed(currentUser, 'ratecard') && (
                  <button
                    id="sidebar-tab-ratecard"
                    onClick={() => handleNav('ratecard')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'ratecard'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'ratecard' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>가격자료 DB</span>
                    </div>
                  </button>
                )}

                {/* 3. 파트너 DB */}
                {(isMenuAllowed(currentUser, 'partnerdb') || isMenuAllowed(currentUser, 'partnerpipeline') || isMenuAllowed(currentUser, 'partnerlist')) && (
                  <button
                    id="sidebar-tab-partnerdb"
                    onClick={() => handleNav('partnerdb')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnerdb'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className={`w-3.5 h-3.5 ${activeTab === 'partnerdb' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>파트너 DB</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wider leading-none ${
                      activeTab === 'partnerdb' ? 'bg-[#FAF8F5] text-[#5C4E43]' : 'bg-[#E5DFD3] text-[#5C4E43]'
                    }`}>
                      NEW
                    </span>
                  </button>
                )}

                {/* 4. 제휴 제안 관리 히스토리 */}
                {isMenuAllowed(currentUser, 'partnerlist') && (
                  <button
                    id="sidebar-tab-partnerlist"
                    onClick={() => handleNav('partnerlist')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'partnerlist'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <ListOrdered className={`w-3.5 h-3.5 ${activeTab === 'partnerlist' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>제휴 제안 관리 히스토리</span>
                    </div>
                  </button>
                )}

                {/* 5. 참고 사이트 */}
                {isMenuAllowed(currentUser, 'referencesite') && (
                  <button
                    id="sidebar-tab-referencesite"
                    onClick={() => handleNav('referencesite')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition-all cursor-pointer ${
                      activeTab === 'referencesite'
                        ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                        : 'text-[#2C2C2C] hover:bg-[#EFECE6] font-normal'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Globe className={`w-3.5 h-3.5 ${activeTab === 'referencesite' ? 'text-white' : 'text-[#736152]'}`} />
                      <span>참고 사이트</span>
                    </div>
                  </button>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. SETTINGS & SYSTEM STATUS FOOTER */}
      <div className="p-3 border-t border-[#D4C8B8] space-y-2 bg-[#EFECE6]/50">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs text-[#5C4E43] hover:text-[#2C2C2C] hover:bg-[#EFECE6] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#8C7A6B]" />
            <span className="font-medium">시스템 설정</span>
          </div>
          <span className="text-[10px] font-mono text-[#8C7A6B]">v2026.8</span>
        </button>

        <div className="px-3 py-1 flex items-center justify-between text-[10px] font-mono text-[#8C7A6B]">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 inline-block"></span>
            <span>시스템 정상</span>
          </span>
          <span>Oak Valley &middot; HDC</span>
        </div>
      </div>

    </aside>
  );
};
