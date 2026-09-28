import React, { useState } from 'react';
import { Search, X, TrendingUp, Building2, ArrowRight } from 'lucide-react';
import { ActiveTab } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchTrend: (query: string) => void;
  onSearchCompany: (name: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSearchTrend,
  onSearchCompany,
}) => {
  const [mode, setMode] = useState<'trend' | 'company'>('trend');
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (mode === 'trend') {
      onSearchTrend(query.trim());
    } else {
      onSearchCompany(query.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="bg-white border border-slate-200 rounded-sm shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold font-serif text-slate-900">빠른 마케팅 인텔리전스 분석</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border border-slate-200 rounded-xs p-1 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('trend')}
            className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 rounded-xs transition-colors cursor-pointer ${
              mode === 'trend'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>트렌드 빠른 검색</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('company')}
            className={`flex-1 py-1.5 flex items-center justify-center space-x-1.5 rounded-xs transition-colors cursor-pointer ${
              mode === 'company'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>기업 정보 빠른 검색</span>
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'trend'
                  ? '예: 2026 웰니스 트렌드, 최근 골프 산업 트렌드'
                  : '예: Nike, Snow Peak, On Running, National Geographic'
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-sm focus:outline-none focus:border-slate-900 focus:bg-white text-slate-900 font-medium"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xs border border-slate-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xs flex items-center space-x-1"
            >
              <span>분석 보고서 생성</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
