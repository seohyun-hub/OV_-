import React, { useState } from 'react';
import { ActiveTab, TrendReport, CompanyReport, TrendFilter, PartnerTargetInput } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { TrendIntelligenceView } from './components/TrendIntelligenceView';
import { CompanyIntelligenceView } from './components/CompanyIntelligenceView';
import { PartnerTargetListView } from './components/PartnerTargetListView';
import { PartnershipBuilderView } from './components/PartnershipBuilderView';
import { ActivationRadarView } from './components/ActivationRadarView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { QuickSearchModal } from './components/QuickSearchModal';

export default function App() {
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

  // Search Trend
  const handleSearchTrend = async (query: string, filters?: Partial<TrendFilter>, deepAnalysis = false) => {
    setActiveTab('trend');
    setLoadingTrend(true);
    setTrendError(null);
    if (!deepAnalysis) setTrendReport(null); // Clear previous search results if new query

    try {
      const res = await fetch('/api/analyze-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          period: filters?.period || '최근 1년',
          region: filters?.region || '한국',
          category: filters?.category || 'Wellness',
          deepAnalysis,
        }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (data && data.success && data.report) {
        setTrendReport(data.report);
      } else {
        setTrendError(data?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error fetching trend report:', err);
      setTrendError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoadingTrend(false);
    }
  };

  // Search Company
  const handleSearchCompany = async (companyName: string, deepAnalysis = false) => {
    setActiveTab('company');
    setLoadingCompany(true);
    setCompanyError(null);
    if (!deepAnalysis) setCompanyReport(null); // Clear previous search results if new search

    try {
      const res = await fetch('/api/analyze-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, deepAnalysis }),
      });

      let data: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      if (data && data.success && data.report) {
        setCompanyReport(data.report);
      } else {
        setCompanyError(data?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error fetching company report:', err);
      setCompanyError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C2C2C] font-sans antialiased selection:bg-[#736152] selection:text-white">
      
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickSearch={() => setQuickSearchOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'home' && (
          <HomeDashboard
            onNavigateTab={setActiveTab}
            onSearchTrend={handleSearchTrend}
            onSearchCompany={handleSearchCompany}
          />
        )}

        {activeTab === 'trend' && (
          <TrendIntelligenceView
            report={trendReport}
            loading={loadingTrend}
            error={trendError}
            onSearch={handleSearchTrend}
            onAnalyzeCompany={handleSearchCompany}
          />
        )}

        {activeTab === 'partnertarget' && (
          <PartnerTargetListView
            onAnalyzeCompany={handleSearchCompany}
            onStartPartnershipWithCompany={handleStartPartnershipWithCompany}
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

        {activeTab === 'activation' && (
          <ActivationRadarView
            onCreatePartnershipProposal={handleCreatePartnershipProposal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'partnership' && (
          <PartnershipBuilderView
            initialCompanyReport={companyReport}
            initialProjectInput={selectedProjectInput}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <div>
            © 2026 Oak Valley & PARK ROCHE Marketing Target Platform. Enterprise Edition.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span>Trend Intelligence</span>
            <span>•</span>
            <span>Partner Target Discovery</span>
            <span>•</span>
            <span>Deal Profitability</span>
            <span>•</span>
            <span>Proposal Builder</span>
          </div>
        </div>
      </footer>

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onSearchTrend={handleSearchTrend}
        onSearchCompany={handleSearchCompany}
      />

    </div>
  );
}

