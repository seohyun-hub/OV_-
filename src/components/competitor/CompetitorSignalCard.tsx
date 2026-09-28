import React from 'react';
import { CompetitorSignalCardItem } from '../../types';
import { ExternalLink, CheckCircle2, Lightbulb, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface CompetitorSignalCardProps {
  signals: CompetitorSignalCardItem[];
}

export const CompetitorSignalCard: React.FC<CompetitorSignalCardProps> = ({ signals }) => {
  const getTypeBadgeStyle = (changeType: string) => {
    switch (changeType) {
      case 'PRICE DOWN':
      case 'PRICE UP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PACKAGE':
      case 'NEW PACKAGE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'HOTEL':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WELLNESS':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'SPA':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'PARTNERSHIP':
      case 'NEW PARTNERSHIP':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'NEW EXPERIENCE':
      case 'SERVICE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'FACILITY':
      case 'NEW FACILITY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NEW PROMOTION':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'OPERATING CHANGE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityBadgeStyle = (tier?: string) => {
    switch (tier) {
      case 'PRIORITY_1':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PRIORITY_2':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PRIORITY_3':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityLabel = (tier?: string) => {
    switch (tier) {
      case 'PRIORITY_1':
        return 'PRIORITY 1 (원주·횡성)';
      case 'PRIORITY_2':
        return 'PRIORITY 2 (춘천·강촌)';
      case 'PRIORITY_3':
        return 'PRIORITY 3 (홍천·평창·강릉·고성)';
      case 'PRIORITY_4':
        return 'PRIORITY 4 (수도권 프리미엄)';
      case 'RESORT_COMPETITOR':
        return 'RESORT WATCH';
      default:
        return '경쟁사';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            TODAY'S COMPETITOR SIGNALS
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            검증된 주요 변화 {signals?.length || 0}건
          </span>
        </div>
        <span className="text-xs text-slate-500">공식 출처 1차 검증 완료 | 2026.09.21 기준</span>
      </div>

      <div className="space-y-4">
        {(signals || []).map((signal, index) => {
          const compName = signal.companyName || signal.competitorName || '경쟁사';
          const summaryText = signal.summary || signal.changeTitle || '';
          const detailsText = signal.details || signal.changeDetails || '';
          const srcTitle = signal.sourceTitle || signal.sourceName || signal.sourceType || '공식 출처';
          const dateEvent = signal.eventDate || signal.publishedAt || '2026.09.21';
          const dateVerified = signal.verifiedDate || signal.checkedAt || '2026.09.21';
          const urlSource = signal.officialSourceUrl || signal.sourceUrl;
          const tier = signal.priorityTier || (typeof signal.priority === 'number' ? `PRIORITY_${signal.priority}` : undefined);

          return (
            <div
              key={signal.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                  <span className="text-base font-extrabold text-slate-900">{compName}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${getPriorityBadgeStyle(tier)}`}>
                    {getPriorityLabel(tier)}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {signal.region}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${getTypeBadgeStyle(signal.changeType)}`}>
                    {signal.changeType}
                  </span>
                </div>
              </div>

              {/* Change Details */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {summaryText}
                </h3>

                {signal.previousValue && signal.currentValue && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 my-2 text-xs flex flex-wrap items-center gap-2">
                    <span className="text-slate-500 font-medium">이전: <span className="line-through text-slate-400">{signal.previousValue}</span></span>
                    <span className="text-slate-400">→</span>
                    <span className="text-slate-900 font-bold">현재: {signal.currentValue}</span>
                    {signal.priceDifference && (
                      <span className={`font-extrabold ml-auto px-2 py-0.5 rounded ${
                        signal.priceDifference.includes('-')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {signal.priceDifference}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-100">
                  {detailsText}
                </p>
              </div>

              {/* Source & Links */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-50/80 rounded-lg text-xs mb-3 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 flex-wrap">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    출처: {srcTitle}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    게시일: {dateEvent}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">검색확인: {dateVerified}</span>
                </div>

                {urlSource && (
                  <a
                    href={urlSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline bg-white px-2.5 py-1 rounded border border-emerald-200 transition-colors shadow-2xs"
                  >
                    <span>공식 원문 보기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

            {/* Analysis & Oak Valley Checkpoint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  💡 왜 중요한가
                </div>
                <p className="leading-snug">{signal.whyImportant}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
                  🎯 IPARK리조트 체크포인트
                </div>
                <p className="leading-snug">{signal.iparkCheckpoint || signal.oakValleyCheckpoint}</p>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};
