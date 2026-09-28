import React, { useState, useEffect } from 'react';
import {
  Building2,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Clock,
  Filter,
  Bookmark,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Compass,
  Layers,
  Flag,
  Palmtree,
  DollarSign,
  Tag,
  Handshake,
  Sparkle
} from 'lucide-react';
import {
  CompetitorMainCategory,
  CompetitorTimeframe,
  CompetitorTrendType,
  CompetitorRadarItem,
  CompetitorWatchListItem,
  CompetitorTabType,
  CompetitorKPIs,
  CompetitorSignalCardItem,
  ActiveTab
} from '../types';
import { CompetitorKPICards } from './competitor/CompetitorKPICards';
import { CompetitorSignalCard } from './competitor/CompetitorSignalCard';
import { CompetitorWatchListGroup } from './competitor/CompetitorWatchListGroup';
import { CompetitorFilterBar } from './competitor/CompetitorFilterBar';
import { CompetitorRadarCard } from './competitor/CompetitorRadarCard';
import { CompetitorDetailModal } from './competitor/CompetitorDetailModal';
import { CompetitorWatchListModal } from './competitor/CompetitorWatchListModal';
import { filterOutInternalBrands } from '../utils/internalBrandFilter';
import { ALL_COMPETITOR_WATCHLIST, VERIFIED_COMPETITOR_SIGNALS, getOfficialKPIs } from '../data/competitorWatchData';

interface CompetitorIntelligenceViewProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  onCreatePartnershipProposal?: (companyName: string) => void;
  isAdmin?: boolean;
}

export const CompetitorIntelligenceView: React.FC<CompetitorIntelligenceViewProps> = ({
  onNavigateTab,
  onCreatePartnershipProposal,
  isAdmin = true,
}) => {
  // Main Tab Selection (7 Tabs as requested)
  const [activeTab, setActiveTab] = useState<CompetitorTabType>('ALL');

  // Filters State
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('30d');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data States
  const [watchList, setWatchList] = useState<CompetitorWatchListItem[]>([]);
  const [signals, setSignals] = useState<CompetitorSignalCardItem[]>(VERIFIED_COMPETITOR_SIGNALS);
  const [radarItems, setRadarItems] = useState<CompetitorRadarItem[]>([]);
  const [savedItems, setSavedItems] = useState<CompetitorRadarItem[]>([]);
  const [kpis, setKpis] = useState<CompetitorKPIs>(getOfficialKPIs());

  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<CompetitorRadarItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [editingWatchListItem, setEditingWatchListItem] = useState<CompetitorWatchListItem | null>(null);
  const [isWatchListModalOpen, setIsWatchListModalOpen] = useState<boolean>(false);

  // Load Initial Data
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load WatchList & Saved Cases
      const wlRes = await fetch('/api/competitor-watchlist');
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        if (wlData.success) {
          const cleanList = filterOutInternalBrands(wlData.watchList || ALL_COMPETITOR_WATCHLIST);
          setWatchList(cleanList);
          setSavedItems(wlData.savedCases || []);
        }
      } else {
        setWatchList(filterOutInternalBrands(ALL_COMPETITOR_WATCHLIST));
      }

      // Load Radar Trends
      const radarRes = await fetch('/api/competitor-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'ALL', timeframe: timeframeFilter }),
      });

      if (radarRes.ok) {
        const radarData = await radarRes.json();
        if (radarData.success) {
          setRadarItems(filterOutInternalBrands(radarData.allItems || []));
        }
      }
    } catch (err: any) {
      console.warn('Fallback to official verified dataset:', err?.message);
      setWatchList(filterOutInternalBrands(ALL_COMPETITOR_WATCHLIST));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [timeframeFilter]);

  // Tab definitions (8 Tabs as requested)
  const tabs: { id: CompetitorTabType; label: string; icon: React.ElementType }[] = [
    { id: 'ALL', label: '전체', icon: Layers },
    { id: 'GOLF_WATCH', label: '골프 경쟁사 Watch', icon: Flag },
    { id: 'RESORT_WATCH', label: '호텔·리조트 Watch', icon: Palmtree },
    { id: 'WELLNESS_WATCH', label: '웰니스·스파 Watch', icon: Sparkles },
    { id: 'PRICE_CHANGE', label: '요금/가격 변화', icon: DollarSign },
    { id: 'PROMOTION_PACKAGE', label: '프로모션/패키지', icon: Tag },
    { id: 'EVENT_PARTNERSHIP', label: '이벤트/제휴', icon: Handshake },
    { id: 'NEW_SERVICE', label: '신규 서비스/시설', icon: Sparkle },
  ];

  // Filter Signals by Active Tab & Search
  const filteredSignals = signals
    .filter((sig) => {
      if (activeTab === 'GOLF_WATCH') {
        return sig.watchCategory === 'GOLF' || sig.category === 'GOLF';
      }
      if (activeTab === 'RESORT_WATCH') {
        return (
          sig.watchCategory === 'RESORT' ||
          sig.category === 'RESORT' ||
          sig.category === 'HOTEL_RESORT' ||
          sig.changeType === 'HOTEL'
        );
      }
      if (activeTab === 'WELLNESS_WATCH') {
        return (
          sig.watchCategory === 'WELLNESS' ||
          sig.category === 'WELLNESS' ||
          sig.category === 'WELLNESS_SPA' ||
          sig.changeType === 'WELLNESS' ||
          sig.changeType === 'SPA'
        );
      }
      if (activeTab === 'PRICE_CHANGE') {
        return sig.changeType.includes('PRICE') || sig.changeType.includes('OPERATING');
      }
      if (activeTab === 'PROMOTION_PACKAGE') {
        return (
          sig.changeType.includes('PROMOTION') ||
          sig.changeType.includes('PACKAGE') ||
          sig.changeType === 'HOTEL' ||
          sig.changeType === 'WELLNESS' ||
          sig.changeType === 'SPA'
        );
      }
      if (activeTab === 'EVENT_PARTNERSHIP') {
        return sig.changeType.includes('PARTNERSHIP');
      }
      if (activeTab === 'NEW_SERVICE') {
        return (
          sig.changeType.includes('SERVICE') ||
          sig.changeType.includes('FACILITY') ||
          sig.changeType.includes('EXPERIENCE')
        );
      }
      return true;
    })
    .filter((sig) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const name = (sig.companyName || sig.competitorName || '').toLowerCase();
      const summary = (sig.summary || sig.changeTitle || '').toLowerCase();
      const details = (sig.details || sig.changeDetails || '').toLowerCase();
      const region = (sig.region || '').toLowerCase();
      return name.includes(q) || summary.includes(q) || details.includes(q) || region.includes(q);
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Main Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  COMPETITOR WATCH v1.0
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  공식 Source 우선검색 &amp; 변화감지 레이더
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                동종업계 트렌드 레이더
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                원주·횡성, 춘천·강촌, 홍천·평창, 수도권 프리미엄 및 주요 리조트 경쟁사 공식 변화 실시간 통합 모니터링
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingWatchListItem(null);
                  setIsWatchListModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>경쟁사 Watch List 신규 등록</span>
              </button>
            )}
          </div>

          {/* 7 Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pt-6 border-t border-slate-100 mt-6 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI Dashboard Section */}
        <CompetitorKPICards kpis={kpis} />

        {/* Global Filter Bar */}
        <CompetitorFilterBar
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          timeframeFilter={timeframeFilter}
          setTimeframeFilter={setTimeframeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={loadInitialData}
          isLoading={loading}
        />

        {/* TODAY'S COMPETITOR SIGNALS */}
        {filteredSignals.length > 0 ? (
          <CompetitorSignalCard signals={filteredSignals} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-4">
            <p className="text-sm font-semibold text-slate-700">해당 조건에 부합하는 실시간 공식 Signal이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">상단 검색어 또는 필터 조건을 초기화해보세요.</p>
          </div>
        )}

        {/* Watch List Groups view */}
        {(activeTab === 'ALL' ||
          activeTab === 'GOLF_WATCH' ||
          activeTab === 'RESORT_WATCH' ||
          activeTab === 'WELLNESS_WATCH') && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                경쟁사 Watch List 공식 통합 데이터베이스
              </h2>
              <span className="text-xs text-slate-500">
                골프장 37개 / 호텔·리조트 17개 / 웰니스·스파 10개 시설 (IPARK리조트 내부 자산 자동 배제)
              </span>
            </div>

            <CompetitorWatchListGroup
              watchList={watchList}
              categoryMode={
                activeTab === 'GOLF_WATCH'
                  ? 'GOLF'
                  : activeTab === 'RESORT_WATCH'
                  ? 'RESORT'
                  : activeTab === 'WELLNESS_WATCH'
                  ? 'WELLNESS'
                  : 'ALL'
              }
              selectedPriority={priorityFilter}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedItemForModal && (
        <CompetitorDetailModal
          item={selectedItemForModal}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onCreatePartnershipProposal={onCreatePartnershipProposal}
        />
      )}

      {isWatchListModalOpen && (
        <CompetitorWatchListModal
          item={editingWatchListItem}
          isOpen={isWatchListModalOpen}
          onClose={() => setIsWatchListModalOpen(false)}
          onSaved={loadInitialData}
        />
      )}
    </div>
  );
};
