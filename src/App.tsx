import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ActiveTab, TrendReport, CompanyReport, TrendFilter, PartnerTargetInput, AuthUser, isMenuAllowed } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HomeDashboard } from './components/HomeDashboard';
import { QuickSearchModal } from './components/QuickSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginView } from './components/LoginView';
import { UserManagementModal } from './components/UserManagementModal';
import { ProposalBuilderModal } from './components/ProposalBuilderModal';
import { QRCodeGeneratorModal } from './components/QRCodeGeneratorModal';
import { Loader2, ShieldAlert } from 'lucide-react';
import { createInitialTrendReport, createInitialCompanyReport } from './utils/reportHelpers';


// Lazy-loaded Views for High-Performance Code Splitting
const TrendIntelligenceView = lazy(() =>
  import('./components/TrendIntelligenceView').then((m) => ({ default: m.TrendIntelligenceView }))
);
const CompanyIntelligenceView = lazy(() =>
  import('./components/CompanyIntelligenceView').then((m) => ({ default: m.CompanyIntelligenceView }))
);
const CompetitorIntelligenceView = lazy(() =>
  import('./components/CompetitorIntelligenceView').then((m) => ({ default: m.CompetitorIntelligenceView }))
);
const PartnerTargetListView = lazy(() =>
  import('./components/PartnerTargetListView').then((m) => ({ default: m.PartnerTargetListView }))
);
const PartnershipBuilderView = lazy(() =>
  import('./components/PartnershipBuilderView').then((m) => ({ default: m.PartnershipBuilderView }))
);
const ActivationRadarView = lazy(() =>
  import('./components/ActivationRadarView').then((m) => ({ default: m.ActivationRadarView }))
);
const KnowledgeBaseView = lazy(() =>
  import('./components/KnowledgeBaseView').then((m) => ({ default: m.KnowledgeBaseView }))
);
const WeeklyContentPlanner = lazy(() =>
  import('./components/WeeklyContentPlanner').then((m) => ({ default: m.WeeklyContentPlanner }))
);
const PressReleaseWriter = lazy(() =>
  import('./components/PressReleaseWriter').then((m) => ({ default: m.PressReleaseWriter }))
);
const RateCardView = lazy(() =>
  import('./components/RateCardView').then((m) => ({ default: m.RateCardView }))
);
const PartnerListView = lazy(() =>
  import('./components/PartnerListView').then((m) => ({ default: m.PartnerListView }))
);
const PostEventTrackerView = lazy(() =>
  import('./components/PostEventTrackerView').then((m) => ({ default: m.PostEventTrackerView }))
);
const InterestMonitorView = lazy(() =>
  import('./components/InterestMonitorView').then((m) => ({ default: m.InterestMonitorView }))
);
const PartnerPipelineView = lazy(() =>
  import('./components/PartnerPipelineView').then((m) => ({ default: m.PartnerPipelineView }))
);
const PartnerPerformanceView = lazy(() =>
  import('./components/PartnerPerformanceView').then((m) => ({ default: m.PartnerPerformanceView }))
);
const PartnerDBView = lazy(() =>
  import('./components/PartnerDBView').then((m) => ({ default: m.PartnerDBView }))
);
const ReferenceSiteView = lazy(() =>
  import('./components/ReferenceSiteView').then((m) => ({ default: m.ReferenceSiteView }))
);
const InstagramEventView = lazy(() =>
  import('./components/InstagramEventView').then((m) => ({ default: m.InstagramEventView }))
);

// Loading Skeleton Fallback
const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 font-sans">
    <Loader2 className="w-8 h-8 text-[#736152] animate-spin" />
    <span className="text-xs font-mono text-[#8C7A6B]">모듈을 불러오는 중입니다...</span>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [userManagementOpen, setUserManagementOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  
  // Real data state - starts null until user searches
  const [trendReport, setTrendReport] = useState<TrendReport | null>(null);
  const [companyReport, setCompanyReport] = useState<CompanyReport | null>(null);
  const [selectedProjectInput, setSelectedProjectInput] = useState<PartnerTargetInput | null>(null);

  const [loadingTrend, setLoadingTrend] = useState<boolean>(false);
  const [loadingCompany, setLoadingCompany] = useState<boolean>(false);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  
  const [quickSearchOpen, setQuickSearchOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [qrModalInitialUrl, setQrModalInitialUrl] = useState<string>('https://oakvalley.co.kr');
  const [qrModalInitialName, setQrModalInitialName] = useState<string>('오크밸리 프로모션 QR');

  const handleOpenQRModal = (url?: string, name?: string) => {
    if (url) setQrModalInitialUrl(url);
    if (name) setQrModalInitialName(name);
    setQrModalOpen(true);
  };

  // Restore authenticated session on mount or refresh
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => null);
      }
      if (res.ok && data && data.success && data.user) {
        setCurrentUser(data.user);
      } else if (res.status === 401 || (data && data.success === false)) {
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
      }
    } catch (err) {
      console.warn('Session restore deferred:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // ignore network error on logout
      }
    }
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setUserManagementOpen(false);
  };

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search Trend (Trend Discovery)
  const handleSearchTrend = async (
    query: string,
    filtersOrCardData?: Partial<TrendFilter> | any,
    forceRefresh = false,
    cardDataParam?: any
  ) => {
    setActiveTab('trend');
    setTrendError(null);

    let filters: Partial<TrendFilter> | undefined = undefined;
    let cardData: any = undefined;

    if (
      filtersOrCardData &&
      typeof filtersOrCardData === 'object' &&
      ('title' in filtersOrCardData || 'whyNotable' in filtersOrCardData || 'id' in filtersOrCardData || 'trend' in filtersOrCardData)
    ) {
      cardData = filtersOrCardData;
    } else if (filtersOrCardData) {
      filters = filtersOrCardData;
      cardData = cardDataParam;
    }

    if (cardData || query) {
      const initialReport = createInitialTrendReport(cardData, query);
      setTrendReport(initialReport);
    } else if (forceRefresh) {
      setTrendReport(null);
    }

    setLoadingTrend(true);

    try {
      const res = await fetch('/api/analyze-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          period: filters?.period || '최근 7일',
          region: filters?.region || '한국',
          category: filters?.category || cardData?.category || '전체',
          forceRefresh,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (data && data.success && data.report) {
        setTrendReport(data.report);
        setTrendError(null);
      } else {
        if (cardData || query) {
          setTrendError('추가 분석을 불러오지 못했습니다. 대시보드에서 확인된 기본 정보는 아래에 표시합니다.');
        } else if (data?.errorType === 'NO_RESULTS') {
          setTrendError('현재 조건에서 확인 가능한 결과가 없습니다.');
        } else {
          setTrendError(data?.error || '검색 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } catch (err) {
      console.error('Error fetching trend report:', err);
      if (cardData || query) {
        setTrendError('추가 분석을 불러오지 못했습니다. 대시보드에서 확인된 기본 정보는 아래에 표시합니다.');
      } else {
        setTrendError('검색 연결 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoadingTrend(false);
    }
  };

  // Search Company
  const handleSearchCompany = async (
    companyName: string,
    deepAnalysisOrCardData?: boolean | any,
    cardDataParam?: any
  ) => {
    setActiveTab('company');
    setCompanyError(null);

    let deepAnalysis = false;
    let cardData: any = undefined;

    if (typeof deepAnalysisOrCardData === 'boolean') {
      deepAnalysis = deepAnalysisOrCardData;
      cardData = cardDataParam;
    } else if (deepAnalysisOrCardData && typeof deepAnalysisOrCardData === 'object') {
      cardData = deepAnalysisOrCardData;
    }

    const nameToUse = companyName || cardData?.brandName || cardData?.companyName || cardData?.facilityName;

    if (cardData || nameToUse) {
      const initialReport = createInitialCompanyReport(cardData, nameToUse);
      setCompanyReport(initialReport);
    } else if (!deepAnalysis) {
      setCompanyReport(null);
    }

    setLoadingCompany(true);

    try {
      const res = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: nameToUse, deepAnalysis }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (data && data.success && data.report) {
        setCompanyReport(data.report);
        setCompanyError(null);
      } else {
        if (cardData || nameToUse) {
          setCompanyError('추가 분석을 불러오지 못했습니다. 대시보드에서 확인된 기본 정보는 아래에 표시합니다.');
        } else {
          setCompanyError(data?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } catch (err) {
      console.error('Error fetching company report:', err);
      if (cardData || nameToUse) {
        setCompanyError('추가 분석을 불러오지 못했습니다. 대시보드에서 확인된 기본 정보는 아래에 표시합니다.');
      } else {
        setCompanyError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleCreatePartnershipProposal = (targetName: string) => {
    if (targetName && (!companyReport || companyReport.companyName.toLowerCase() !== targetName.toLowerCase())) {
      handleSearchCompany(targetName);
    }
    setActiveTab('partnership');
  };

  const handleStartPartnershipWithCompany = (companyName: string, projectContext?: PartnerTargetInput) => {
    if (projectContext) {
      setSelectedProjectInput(projectContext);
    }
    if (companyName && (!companyReport || companyReport.companyName.toLowerCase() !== companyName.toLowerCase())) {
      handleSearchCompany(companyName);
    }
    setActiveTab('partnership');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#736152] animate-spin" />
        <span className="text-xs font-mono text-[#8C7A6B]">사용자 인증 세션을 확인하는 중입니다...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user, token) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2C2C] font-sans antialiased selection:bg-[#736152] selection:text-white flex flex-col md:flex-row">
      
      {/* 1. PC Fixed Left Sidebar (Option 1) */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProposalBuilder={() => setActiveTab('proposal')}
          onOpenQRCodeModal={() => handleOpenQRModal()}
          currentUser={currentUser}
        />
      </div>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header & Sticky Category Tabs */}
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickSearch={() => setQuickSearchOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenQRCodeModal={() => handleOpenQRModal()}
        />

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSearchTrend={handleSearchTrend}
            onSearchCompany={handleSearchCompany}
            onOpenQuickSearch={() => setQuickSearchOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenQRCodeModal={() => handleOpenQRModal()}
            currentUser={currentUser}
            onOpenUserManagement={() => setUserManagementOpen(true)}
            onLogout={handleLogout}
          />
        </div>


        {/* Main Routed Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {!isMenuAllowed(currentUser, activeTab) ? (
            <div className="bg-white border border-[#D4C8B8] rounded-xl p-8 max-w-lg mx-auto text-center space-y-4 my-12 shadow-xs">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2C2C2C]">메뉴 접근 권한 제한</h3>
                <p className="text-xs text-[#736152]">
                  현재 계정({currentUser?.name})은 이 메뉴에 대한 접근 권한이 설정되어 있지 않습니다.
                </p>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">
                이용이 필요한 경우 사내 시스템 관리자에게 메뉴 권한 요청을 전달해주세요.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                대시보드로 돌아가기
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  currentUser={currentUser}
                  onNavigateTab={setActiveTab}
                  onSearchTrend={handleSearchTrend}
                  onSearchCompany={handleSearchCompany}
                />
              )}

              <Suspense fallback={<ViewLoadingFallback />}>
                {activeTab === 'trend' && (
                  <TrendIntelligenceView
                    report={trendReport}
                    loading={loadingTrend}
                    error={trendError}
                    onSearch={handleSearchTrend}
                    onAnalyzeCompany={handleSearchCompany}
                    onCreatePartnershipProposal={handleCreatePartnershipProposal}
                    onNavigateToKnowledge={() => setActiveTab('knowledge')}
                  />
                )}

                {activeTab === 'company' && (
                  <CompanyIntelligenceView
                    report={companyReport}
                    loading={loadingCompany}
                    error={companyError}
                    onSearchCompany={handleSearchCompany}
                    onSearchTrend={handleSearchTrend}
                    onCreatePartnershipProposal={handleCreatePartnershipProposal}
                  />
                )}

                {activeTab === 'competitor' && (
                  <CompetitorIntelligenceView
                    onNavigateTab={setActiveTab}
                    onCreatePartnershipProposal={handleCreatePartnershipProposal}
                  />
                )}

                {activeTab === 'activation' && (
                  <ActivationRadarView
                    onCreatePartnershipProposal={handleCreatePartnershipProposal}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'interest' && (
                  <InterestMonitorView
                    onNavigateTab={setActiveTab}
                    onSendTopicToWeeklyPlanner={(topic) => {
                      setActiveTab('weeklyplanner');
                    }}
                  />
                )}

                {activeTab === 'weeklyplanner' && (
                  <WeeklyContentPlanner
                    onSearchTrend={handleSearchTrend}
                    onSearchCompany={handleSearchCompany}
                    onNavigateTab={setActiveTab}
                    onOpenQRCodeModal={handleOpenQRModal}
                  />
                )}

                {activeTab === 'pressrelease' && (
                  <PressReleaseWriter
                    onOpenQRCodeModal={handleOpenQRModal}
                  />
                )}

                {activeTab === 'postevent' && (
                  <PostEventTrackerView />
                )}

                {activeTab === 'instagram_event' && (
                  <InstagramEventView currentUser={currentUser} />
                )}

                {activeTab === 'partnerpipeline' && (
                  <PartnerPipelineView currentUser={currentUser} />
                )}

                {activeTab === 'partnerperformance' && (
                  <PartnerPerformanceView onNavigateToPipeline={() => setActiveTab('partnerpipeline')} />
                )}

                {activeTab === 'partnerdb' && (
                  <PartnerDBView
                    onSelectPartnerForTarget={(comp) => {
                      setActiveTab('partnertarget');
                    }}
                    onSelectPartnerForPipeline={(comp) => {
                      setActiveTab('partnerpipeline');
                    }}
                  />
                )}

                {activeTab === 'partnertarget' && (
                  <PartnerTargetListView
                    onAnalyzeCompany={handleSearchCompany}
                    onStartPartnershipWithCompany={handleStartPartnershipWithCompany}
                  />
                )}

                {activeTab === 'partnership' && (
                  <PartnershipBuilderView
                    initialCompanyReport={companyReport}
                    initialProjectInput={selectedProjectInput}
                  />
                )}

                {activeTab === 'proposal' && (
                  <ProposalBuilderModal
                    isOpen={true}
                    onClose={() => setActiveTab('partnertarget')}
                    companyReport={companyReport}
                    projectInput={selectedProjectInput}
                  />
                )}

                {activeTab === 'knowledge' && (
                  <KnowledgeBaseView />
                )}

                {activeTab === 'ratecard' && (
                  <RateCardView />
                )}

                {activeTab === 'partnerlist' && (
                  <PartnerListView
                    currentUser={currentUser}
                    onAnalyzeCompany={handleSearchCompany}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'referencesite' && (
                  <ReferenceSiteView currentUser={currentUser} />
                )}
              </Suspense>
            </>
          )}
        </main>

        {/* System Enterprise Footer */}
        <footer className="border-t border-[#D4C8B8] bg-[#FAF8F5] py-4 px-4 sm:px-8 mt-auto mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7A6B] font-mono gap-2">
            <div>
              &copy; 2026 Oak Valley &middot; PARK ROCHE Marketing Target Enterprise Platform.
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span>검증된 실무 데이터</span>
              <span>&bull;</span>
              <span>단가 산정 및 바터 매트릭스</span>
              <span>&bull;</span>
              <span>IPARK 리조트</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Quick Search Modal (Cmd+K) */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSearchTrend={handleSearchTrend}
        onSearchCompany={handleSearchCompany}
      />

      {/* Enterprise System Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Admin User Management Modal */}
      {currentUser && currentUser.isAdmin && (
        <UserManagementModal
          isOpen={userManagementOpen}
          onClose={() => setUserManagementOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* QR Code Generator Modal with Center Logo Support */}
      <QRCodeGeneratorModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        initialUrl={qrModalInitialUrl}
        initialName={qrModalInitialName}
      />

    </div>
  );
}

