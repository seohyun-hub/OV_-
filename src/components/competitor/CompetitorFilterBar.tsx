import React from 'react';
import { Search, RefreshCw, Filter, ShieldCheck } from 'lucide-react';

interface CompetitorFilterBarProps {
  regionFilter: string;
  setRegionFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  timeframeFilter: string;
  setTimeframeFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const CompetitorFilterBar: React.FC<CompetitorFilterBarProps> = ({
  regionFilter,
  setRegionFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  timeframeFilter,
  setTimeframeFilter,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">우선순위:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 Priority</option>
              <option value="PRIORITY_1">PRIORITY 1 (원주·횡성)</option>
              <option value="PRIORITY_2">PRIORITY 2 (춘천·강촌)</option>
              <option value="PRIORITY_3">PRIORITY 3 (홍천·평창·강릉)</option>
              <option value="PRIORITY_4">PRIORITY 4 (수도권 프리미엄)</option>
              <option value="RESORT_COMPETITOR">RESORT WATCH</option>
            </select>
          </div>

          {/* Region */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">권역:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 권역</option>
              <option value="원주·횡성">원주·횡성</option>
              <option value="춘천·강촌">춘천·강촌</option>
              <option value="홍천·평창">홍천·평창·강릉·고성</option>
              <option value="수도권">수도권 프리미엄</option>
              <option value="전국">전국 복합 리조트</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">업종:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">전체 (골프+리조트)</option>
              <option value="GOLF">골프장 중심</option>
              <option value="RESORT">복합 리조트 중심</option>
            </select>
          </div>

          {/* Timeframe */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 font-medium">검색 기간:</span>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
            </select>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="경쟁사명 또는 키워드..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>
        </div>
      </div>

      {/* Internal Asset Exclusion Notice */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>자사 브랜드(오크밸리CC / 오크힐스CC / 월송리CC / 성문안CC)는 자동 배제 설정됨</span>
        </div>
        <span className="text-slate-400">출처 우선순위: 공식 홈페이지 &gt; 공식 공지 &gt; 예약페이지 &gt; 공식 SNS</span>
      </div>
    </div>
  );
};
