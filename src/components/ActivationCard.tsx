import React from 'react';
import {
  MapPin, Calendar, ExternalLink, Bookmark, Check, Sparkles,
  Award, Target, HelpCircle, Lightbulb, Zap, ShieldCheck, ArrowRight, Layers
} from 'lucide-react';
import { ActivationItem } from '../types';

interface ActivationCardProps {
  activation: ActivationItem;
  onToggleSave: (id: string) => void;
  onOpenBenchmark: (activation: ActivationItem) => void;
  onCreatePartnershipProposal?: (brandName: string) => void;
}

export const ActivationCard: React.FC<ActivationCardProps> = ({
  activation,
  onToggleSave,
  onOpenBenchmark,
  onCreatePartnershipProposal,
}) => {
  const { oakValleyParkRocheInsight: insight } = activation;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-xs flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            <span>진행중</span>
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-bold rounded-xs flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            <span>예정</span>
          </span>
        );
      case 'ENDED':
      default:
        return (
          <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold rounded-xs">
            종료
          </span>
        );
    }
  };

  const renderFitBadge = (fit: 'HIGH' | 'MEDIUM' | 'LOW') => {
    if (fit === 'HIGH') {
      return (
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold rounded-xs">
          HIGH FIT
        </span>
      );
    }
    if (fit === 'MEDIUM') {
      return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded-xs">
          MEDIUM FIT
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-mono font-bold rounded-xs">
        LOW FIT
      </span>
    );
  };

  return (
    <article className="bg-white border border-slate-200/90 rounded-sm shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Top Header Row */}
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-xs uppercase tracking-wider">
              {activation.eventType}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-semibold rounded-xs">
              {activation.brand}
            </span>
            {activation.hotspot && (
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded-xs">
                📍 {activation.hotspot}
              </span>
            )}
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-900 leading-snug">
            {activation.eventName}
          </h3>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
          {renderStatusBadge(activation.status)}

          <button
            onClick={() => onToggleSave(activation.id)}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xs border transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activation.isSaved
                ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${activation.isSaved ? 'fill-slate-900' : ''}`} />
            <span>{activation.isSaved ? 'SAVED' : 'SAVE'}</span>
          </button>
        </div>
      </div>

      {/* Card Key Meta Grid */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* Location & Period Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xs border border-slate-200/80 font-sans">
          <div className="flex items-center space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong className="font-semibold text-slate-900">LOCATION:</strong> {activation.location} ({activation.city})
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong className="font-semibold text-slate-900">PERIOD:</strong> {activation.periodText || '기간 확인 필요'}
            </span>
          </div>
        </div>

        {/* WHAT IS IT? */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
            ■ WHAT IS IT?
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-sans bg-slate-50 p-3 rounded-xs border border-slate-200/60">
            {activation.whatIsIt}
          </p>
        </div>

        {/* 3 Detail Key Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          <div className="bg-slate-50/70 p-3 rounded-xs border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-mono font-bold text-blue-800 block">
              ✨ EXPERIENCE POINT
            </span>
            <p className="text-slate-700 leading-normal">{activation.experiencePoint}</p>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xs border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-mono font-bold text-emerald-800 block">
              🎯 TARGET CUSTOMER
            </span>
            <p className="text-slate-700 leading-normal">{activation.targetCustomer}</p>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xs border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-mono font-bold text-amber-800 block">
              💡 WHY IT MATTERS
            </span>
            <p className="text-slate-700 leading-normal">{activation.whyItMatters}</p>
          </div>

        </div>

        {/* Source Box */}
        <div className="text-[11px] text-slate-600 font-sans flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-xs border border-slate-200/50">
          <div className="flex flex-wrap items-center gap-2">
            {(activation.source.isOfficial || activation.source.sourceRole === 'OFFICIAL' || activation.source.title.includes('COEX') || activation.source.title.includes('공식') || activation.source.title.includes('홈페이지')) ? (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded-xs flex items-center space-x-1 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>공식 확인</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-xs flex items-center space-x-1 shrink-0">
                <span>추가 확인 필요</span>
              </span>
            )}
            <span className="text-slate-500 font-bold">출처:</span>
            <span className="text-slate-800 font-medium">{activation.source.title}</span>
            {activation.source.refDate && <span className="text-slate-400 text-[10px]">({activation.source.refDate} 확인)</span>}
          </div>
          {activation.source.url && (
            <a
              href={activation.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-medium text-[11px] hover:underline shrink-0"
            >
              <span>원문 보기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* OAK VALLEY & PARK ROCHE INSIGHT SECTION */}
        <div className="bg-slate-900 text-white rounded-xs p-5 space-y-4 mt-4 shadow-sm border border-slate-800">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold rounded-xs uppercase">
                INSIGHT TRANSLATION
              </span>
              <h4 className="text-sm font-serif font-bold text-white">
                Oak Valley & Park Roche Insight
              </h4>
            </div>
            
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Oak Valley:</span>
                {renderFitBadge(insight.oakValleyFit)}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-slate-400">Park Roche:</span>
                {renderFitBadge(insight.parkRocheFit)}
              </div>
            </div>
          </div>

          {/* Applicable Assets Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              APPLICABLE ASSETS (적용 가능 보유 자산)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {insight.applicableAssets.map((asset, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 text-[10px] font-mono rounded-xs"
                >
                  #{asset}
                </span>
              ))}
            </div>
          </div>

          {/* Adaptation Idea & Partner */}
          <div className="space-y-2 text-xs">
            <div className="bg-slate-800/90 p-3 rounded-xs border border-slate-700 space-y-1">
              <span className="text-amber-300 font-mono font-bold block">💡 ADAPTATION IDEA (자산 맞춤 재해석)</span>
              <p className="text-slate-200 leading-relaxed font-sans">{insight.adaptationIdea}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700 space-y-1">
                <span className="text-emerald-400 font-mono font-bold block">⚡ QUICK WIN (빠른 실행방식)</span>
                <p className="text-slate-300 leading-normal font-sans">{insight.quickWin}</p>
              </div>

              <div className="bg-slate-800/80 p-2.5 rounded-xs border border-slate-700 space-y-1">
                <span className="text-blue-300 font-mono font-bold block">🏆 SIGNATURE VERSION (차별화 확장)</span>
                <p className="text-slate-300 leading-normal font-sans">{insight.signatureVersion}</p>
              </div>
            </div>

            <div className="pt-1 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>🤝 POTENTIAL PARTNER: <strong className="text-white">{insight.potentialPartner}</strong></span>
            </div>
          </div>

          {/* Benchmark & Build Partnership Button Bar */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => onCreatePartnershipProposal ? onCreatePartnershipProposal(activation.brand) : null}
              className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs font-sans"
            >
              <span>오크밸리 적용안 만들기 &rarr;</span>
            </button>

            <button
              onClick={() => onOpenBenchmark(activation)}
              className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E2DDD5] text-[#2C2C2C] text-xs font-medium rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#736152]" />
              <span>BENCHMARK ANALYSIS (13대 체험 요소)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#736152]" />
            </button>
          </div>

        </div>

      </div>

    </article>
  );
};
