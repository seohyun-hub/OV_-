import React, { useState } from 'react';
import { KnowledgeBaseMetadata, ActiveTab } from '../types';
import { Database, CheckCircle2, AlertCircle, ExternalLink, ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

interface KnowledgeBaseBadgeProps {
  metadata?: KnowledgeBaseMetadata | null;
  onNavigateToKnowledge?: () => void;
  className?: string;
}

export const KnowledgeBaseBadge: React.FC<KnowledgeBaseBadgeProps> = ({
  metadata,
  onNavigateToKnowledge,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasDocs = metadata && metadata.used && metadata.activeDocCount > 0;

  return (
    <div className={`border rounded-sm bg-white overflow-hidden transition-all shadow-2xs ${className} ${
      hasDocs ? 'border-emerald-200 hover:border-emerald-300' : 'border-amber-200 bg-amber-50/30'
    }`}>
      {/* Header Badge Strip */}
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Status Indicator */}
        <div className="flex items-start sm:items-center space-x-2.5">
          <div className={`p-1.5 rounded-xs shrink-0 ${
            hasDocs ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            <Database className="w-4 h-4" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                AI Intelligence Source Evidence
              </span>

              {hasDocs ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Oak Valley / PARK ROCHE Internal Knowledge Used ✓
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                  등록된 내부자료가 없습니다. 회사소개서를 업로드해주세요.
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-0.5">
              {hasDocs
                ? `내부 공식자료 ${metadata.activeDocCount}건 (1순위) + 외부 공식 검증자료 ${metadata.externalSourceCount || 5}건 결합 분석`
                : '현재 공개 웹 정보 기반으로 분석되었습니다. 정확도 향상을 위해 공식 자료를 등록해주세요.'}
            </p>
          </div>
        </div>

        {/* Right Info Tags & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-600">
            <span className="px-2 py-1 bg-slate-100 rounded-xs border border-slate-200 font-medium">
              External Sources: <strong className="text-slate-900">{metadata?.externalSourceCount || 5}</strong>
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded-xs border border-slate-200 font-medium">
              Last Updated: <strong className="text-slate-900">{metadata?.lastUpdated || '2026.08'}</strong>
            </span>
          </div>

          {hasDocs && metadata.usedDocs && metadata.usedDocs.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xs border border-slate-200 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? '접기' : '참고문서 보기'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {onNavigateToKnowledge && (
            <button
              onClick={onNavigateToKnowledge}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xs transition-colors cursor-pointer shrink-0"
            >
              <span>Knowledge Base 관리</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Active Document List */}
      {hasDocs && isExpanded && metadata.usedDocs && (
        <div className="px-4 py-3 bg-slate-50 border-t border-emerald-100 space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>이번 분석에 직접 우선 적용된 공식 내부 자료 목록 (1순위):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {metadata.usedDocs.map((doc, idx) => (
              <div
                key={idx}
                className="p-2 bg-white rounded-xs border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2 truncate pr-1">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-slate-900 text-xs truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {doc.brand} • {doc.version}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{doc.uploadDate?.substring(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
