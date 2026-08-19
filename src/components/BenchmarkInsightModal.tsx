import React from 'react';
import { X, Sparkles, CheckCircle2, Layers, MapPin, Tag, Building2, Lightbulb, Compass } from 'lucide-react';
import { ActivationItem } from '../types';

interface BenchmarkInsightModalProps {
  activation: ActivationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkInsightModal: React.FC<BenchmarkInsightModalProps> = ({
  activation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !activation) return null;

  const { benchmark } = activation;

  const benchmarkItems = [
    { label: 'Concept (컨셉)', value: benchmark.concept, icon: '💡' },
    { label: 'Customer Journey (고객 여정)', value: benchmark.customerJourney, icon: '🗺️' },
    { label: 'Space Design (공간 연출)', value: benchmark.spaceDesign, icon: '🏛️' },
    { label: 'Content (체험 콘텐츠)', value: benchmark.content, icon: '🎨' },
    { label: 'Product Experience (제품 시착/체험)', value: benchmark.productExperience, icon: '👟' },
    { label: 'F&B (식음 연계)', value: benchmark.fnb, icon: '☕' },
    { label: 'Membership (멤버십 혜택)', value: benchmark.membership, icon: '💳' },
    { label: 'SNS (소셜 미디어 확산)', value: benchmark.sns, icon: '📱' },
    { label: 'Influencer (인플루언서 제휴)', value: benchmark.influencer, icon: '🌟' },
    { label: 'Sales Connection (매출/구매 연결)', value: benchmark.salesConnection, icon: '🛍️' },
    { label: 'Photo Zone (포토존 구성)', value: benchmark.photoZone, icon: '📸' },
    { label: 'Gift / Sampling (기프트 & 샘플링)', value: benchmark.giftSampling, icon: '🎁' },
    { label: 'Community (팬덤 커뮤니티)', value: benchmark.community, icon: '🤝' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-sm shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between shrink-0 border-b border-slate-800">
          <div className="space-y-1.5 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold rounded-xs uppercase">
                BENCHMARK ANALYSIS
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono rounded-xs">
                {activation.brand}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activation.location} ({activation.periodText})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {activation.eventName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xs transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-800">
          
          {/* Key Learnings Box (What Oak Valley can learn) */}
          <section className="bg-amber-50/80 border border-amber-300/80 rounded-xs p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-base font-serif font-bold">
                What Oak Valley & Park Roche Can Learn (3대 시사점)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {benchmark.whatOakValleyCanLearn.map((learnItem, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xs border border-amber-200/80 space-y-1.5 shadow-2xs">
                  <span className="w-6 h-6 bg-amber-400 text-slate-900 text-xs font-mono font-bold rounded-full flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </span>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed pt-1">
                    {learnItem}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 13 Benchmark Dimensions Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>13 BENCHMARK EXPERIENCE DIMENSIONS (13대 체험 구성 요소 분석)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Detailed Analysis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benchmarkItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/90 border border-slate-200 rounded-xs p-4 space-y-1.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans pl-6 border-l-2 border-slate-300">
                    {item.value || '해당 항목 분석 데이터 작성 완료'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Adaptation Reference Bar */}
          <section className="bg-slate-900 text-white p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                OAK VALLEY & PARK ROCHE ADAPTATION QUICK REF
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Oak Valley Fit: {activation.oakValleyParkRocheInsight.oakValleyFit} | Park Roche Fit: {activation.oakValleyParkRocheInsight.parkRocheFit}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xs border border-slate-700">
                <span className="text-blue-300 font-mono font-bold block mb-1">⚡ Quick Win (빠른 실행)</span>
                <p className="text-slate-200 leading-relaxed">{activation.oakValleyParkRocheInsight.quickWin}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xs border border-slate-700">
                <span className="text-amber-300 font-mono font-bold block mb-1">🏆 Signature Version (시그니처 확장)</span>
                <p className="text-slate-200 leading-relaxed">{activation.oakValleyParkRocheInsight.signatureVersion}</p>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Source: {activation.source.title} ({activation.source.refDate})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
