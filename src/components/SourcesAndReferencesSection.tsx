import React from 'react';
import { ReferenceSource } from '../types';
import { ShieldCheck, ExternalLink, BookOpen, Layers, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface SourcesAndReferencesSectionProps {
  references?: ReferenceSource[];
  overallEvidenceLevel?: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'EMERGING SIGNAL';
  title?: string;
  description?: string;
}

export const SourcesAndReferencesSection: React.FC<SourcesAndReferencesSectionProps> = ({
  references = [],
  overallEvidenceLevel = 'HIGH CONFIDENCE',
  title = 'Sources & References',
  description = '경영진 보고용 인텔리전스를 위해 검증된 Tier 1~3 출처만을 기반으로 작성된 근거 자료 목록입니다.',
}) => {
  if (!references || references.length === 0) {
    return null;
  }

  const getTierBadgeStyle = (tier: string) => {
    if (tier.includes('Tier 1')) {
      return 'bg-emerald-900/10 text-emerald-800 border-emerald-300 font-semibold';
    }
    if (tier.includes('Tier 2')) {
      return 'bg-blue-900/10 text-blue-800 border-blue-300 font-semibold';
    }
    return 'bg-amber-900/10 text-amber-800 border-amber-300 font-medium';
  };

  const getConfidenceBadgeStyle = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH CONFIDENCE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MEDIUM CONFIDENCE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EMERGING SIGNAL':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-serif font-bold text-white">{title}</h3>
            {overallEvidenceLevel && (
              <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-xs border uppercase tracking-wider ${getConfidenceBadgeStyle(overallEvidenceLevel)}`}>
                {overallEvidenceLevel}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            {description}
          </p>
        </div>

        {/* Tier Priority Explanation */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xs border border-slate-700/60 font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Tier 1: 정부·공식IR / Tier 2: 컨설팅·연구 / Tier 3: 주요 경제지</span>
        </div>
      </div>

      {/* References Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {references.map((ref, idx) => (
          <div
            key={ref.id || `ref-${idx}`}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xs transition-colors space-y-2.5 relative flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded-xs border ${getTierBadgeStyle(ref.tier)}`}>
                  {ref.tier}
                </span>

                <div className="flex items-center space-x-1.5">
                  {ref.confidence && (
                    <span className={`px-2 py-0.5 text-[10px] font-mono rounded-xs border ${getConfidenceBadgeStyle(ref.confidence)}`}>
                      {ref.confidence}
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-xs">
                    {ref.year}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white leading-snug flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{ref.title}</span>
                </h4>
                <p className="text-xs font-medium text-slate-300 mt-1">
                  발행/조사 기관: <span className="text-emerald-300 font-semibold">{ref.institution}</span>
                </p>
              </div>

              {ref.appliedTo && (
                <p className="text-[11px] text-slate-400 leading-normal bg-slate-900/60 p-2 rounded-xs border border-slate-800/50">
                  <span className="text-slate-300 font-semibold font-mono">분석 활용:</span> {ref.appliedTo}
                </p>
              )}

              {ref.note && (
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-300/90 bg-amber-950/40 px-2 py-1 rounded-xs border border-amber-900/40">
                  <Info className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{ref.note}</span>
                </div>
              )}
            </div>

            {ref.url && (
              <div className="pt-2 border-t border-slate-900 flex justify-end">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono underline hover:no-underline transition-colors"
                >
                  <span>원문/공식 자료 보기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Research Philosophy Note Footer */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>Verification Principles:</strong> 수치·통계 데이터는 Tier 1/2 원문 조사보고서 복수 검증을 거쳤으며, 추정치 불일치 시 보수적 기준값을 적용하였습니다.
          </span>
        </div>
      </div>
    </div>
  );
};
