import React, { useState } from 'react';
import { MapPin, Building2, Flame, ArrowRight, Layers, Navigation } from 'lucide-react';
import { ActivationItem } from '../types';

interface ActivationMapViewProps {
  activations: ActivationItem[];
  onOpenBenchmark: (activation: ActivationItem) => void;
}

export const ActivationMapView: React.FC<ActivationMapViewProps> = ({
  activations = [],
  onOpenBenchmark,
}) => {
  const safeActivations = activations || [];

  const hotspots = [
    { name: '전체 핫스팟', code: 'ALL' },
    { name: '성수', code: '성수' },
    { name: '한남', code: '한남' },
    { name: '더현대 서울', code: '더현대 서울' },
    { name: '코엑스', code: '코엑스' },
    { name: '신세계 강남', code: '신세계 강남' },
    { name: '롯데월드몰', code: '롯데월드몰' },
    { name: '서울숲', code: '서울숲' },
    { name: 'DDP', code: 'DDP' },
    { name: '부산', code: '부산' },
    { name: '제주', code: '제주' },
    { name: '강원', code: '강원' },
  ];

  const [selectedHotspot, setSelectedHotspot] = useState<string>('ALL');

  const filteredActivations = safeActivations.filter((act) => {
    if (selectedHotspot === 'ALL') return true;
    return (
      act.hotspot === selectedHotspot ||
      (act.location || '').includes(selectedHotspot) ||
      (act.city || '').includes(selectedHotspot)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Hotspot Selector Header */}
      <div className="bg-slate-900 text-white p-6 rounded-sm space-y-4 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-serif font-bold text-white">
              HOTSPOT LOCATION RADAR (주요 거점별 액티베이션 탐색)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            브랜드 경험이 집중되는 10대 트렌드 핫스팟 클러스터
          </span>
        </div>

        {/* Hotspot Buttons Grid */}
        <div className="flex flex-wrap gap-2">
          {hotspots.map((hs) => {
            const count = safeActivations.filter(
              (a) =>
                hs.code === 'ALL' ||
                a.hotspot === hs.code ||
                (a.location || '').includes(hs.code) ||
                (a.city || '').includes(hs.code)
            ).length;

            return (
              <button
                key={hs.code}
                onClick={() => setSelectedHotspot(hs.code)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xs border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  selectedHotspot === hs.code
                    ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-2xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>📍 {hs.name}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-xs font-bold ${
                  selectedHotspot === hs.code ? 'bg-slate-900 text-amber-300' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hotspot Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivations.map((act) => (
          <div
            key={act.id}
            className="bg-white border border-slate-200 rounded-xs p-5 space-y-3 shadow-xs hover:border-slate-400 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-bold rounded-xs">
                  {act.eventType}
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  📍 {act.hotspot || act.city}
                </span>
              </div>

              <h4 className="text-base font-serif font-bold text-slate-900 leading-snug">
                {act.eventName}
              </h4>

              <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2 rounded-xs border border-slate-200">
                🏢 {act.brand} | 📅 {act.periodText}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                {act.whatIsIt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Fit: OV <strong className="text-emerald-700">{act.oakValleyParkRocheInsight.oakValleyFit}</strong> / PR <strong className="text-blue-700">{act.oakValleyParkRocheInsight.parkRocheFit}</strong>
              </span>

              <button
                onClick={() => onOpenBenchmark(act)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>분석 보기</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
