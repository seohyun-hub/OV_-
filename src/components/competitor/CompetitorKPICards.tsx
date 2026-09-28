import React from 'react';
import { CompetitorKPIs } from '../../types';
import { Eye, TrendingDown, Tag, Package, Handshake, AlertTriangle } from 'lucide-react';

interface CompetitorKPICardsProps {
  kpis: CompetitorKPIs;
  onSelectKPIType?: (type: string) => void;
  activeFilterType?: string;
}

export const CompetitorKPICards: React.FC<CompetitorKPICardsProps> = ({
  kpis,
  onSelectKPIType,
  activeFilterType,
}) => {
  const cards = [
    {
      id: 'WATCH_COUNT',
      label: 'WATCH 경쟁사 수',
      value: `${kpis.watchCount}개`,
      sub: '골프 37 / 리조트 11',
      icon: Eye,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'PRICE_CHANGE',
      label: '이번 주 가격변동',
      value: `${kpis.priceChangeCount}건`,
      sub: 'PRICE DOWN 1 / UP 1 / 셀프 1',
      icon: TrendingDown,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 'NEW_PROMOTION',
      label: '신규 프로모션',
      value: `${kpis.newPromotionCount}건`,
      sub: '단풍·가을 얼리버드 중심',
      icon: Tag,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'NEW_PACKAGE',
      label: '신규 패키지',
      value: `${kpis.newPackageCount}건`,
      sub: 'VVIP 골프&다이닝 패키지',
      icon: Package,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'NEW_PARTNERSHIP',
      label: '신규 제휴',
      value: `${kpis.newPartnershipCount}건`,
      sub: '아웃도어·스포츠 브랜드',
      icon: Handshake,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'NOTABLE_COMPETITOR',
      label: '주목 필요 경쟁사',
      value: `${kpis.notableCompetitorCount}개`,
      sub: '원주 인근 / 소노 / 벨라스톤',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilterType === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectKPIType && onSelectKPIType(card.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              isActive
                ? 'ring-2 ring-emerald-500 shadow-md bg-white border-emerald-500'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 mb-0.5">{card.value}</div>
            <div className="text-[11px] text-slate-500 font-medium truncate">{card.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
