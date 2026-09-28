import React from 'react';
import {
  Building2,
  Calendar,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  PlusCircle,
  Clock,
  Tag,
  DollarSign
} from 'lucide-react';
import { CompetitorRadarItem, SourcePriorityTier } from '../../types';

interface CompetitorRadarCardProps {
  item: CompetitorRadarItem;
  onOpenDetail: (item: CompetitorRadarItem) => void;
  onToggleSave?: (item: CompetitorRadarItem) => void;
  onAddToWatchList?: (companyName: string, category: '호텔·리조트' | '골프' | '복합') => void;
  isAdmin?: boolean;
}

export const CompetitorRadarCard: React.FC<CompetitorRadarCardProps> = ({
  item,
  onOpenDetail,
  onToggleSave,
  onAddToWatchList,
  isAdmin = true,
}) => {
  const getStatusBadge = (status: 'ONGOING' | 'UPCOMING' | 'ENDED') => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="px-2 py-0.5 bg-[#1B4D3E]/10 text-[#1B4D3E] text-[11px] font-semibold rounded-2xs border border-[#1B4D3E]/20 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E] animate-pulse"></span>
            <span>진행 중</span>
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="px-2 py-0.5 bg-[#8C5D28]/10 text-[#8C5D28] text-[11px] font-semibold rounded-2xs border border-[#8C5D28]/20 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-[#8C5D28]" />
            <span>가까운 예정</span>
          </span>
        );
      case 'ENDED':
        return (
          <span className="px-2 py-0.5 bg-[#786658]/10 text-[#786658] text-[11px] font-medium rounded-2xs border border-[#786658]/20">
            종료
          </span>
        );
      default:
        return null;
    }
  };

  const getSourcePriorityBadge = (tier: SourcePriorityTier, title: string) => {
    switch (tier) {
      case '1ST_PARTY_OFFICIAL':
        return (
          <span className="px-2 py-0.5 bg-[#8C5D28]/15 text-[#8C5D28] text-[10px] font-medium rounded-2xs flex items-center space-x-1" title="1순위: 공식 홈페이지/보도자료">
            <ShieldCheck className="w-3 h-3 text-[#8C5D28]" />
            <span className="font-semibold">공식 출처</span>
            <span className="text-[#786658]">· {title}</span>
          </span>
        );
      case '2ND_PARTY_PRESS':
        return (
          <span className="px-2 py-0.5 bg-[#2C2C2C]/10 text-[#2C2C2C] text-[10px] font-medium rounded-2xs flex items-center space-x-1" title="2순위: 신뢰 언론/전문 매체">
            <span>신뢰 언론</span>
            <span className="text-[#786658]">· {title}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-[#F5F2EB] text-[#786658] text-[10px] font-medium rounded-2xs flex items-center space-x-1">
            <span>공개 매체</span>
            <span>· {title}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xs p-5 sm:p-6 shadow-2xs border border-[#E8E4DC] hover:border-[#8C5D28]/40 transition-all space-y-4 flex flex-col justify-between group relative">
      
      {/* Top Header Row */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Tag */}
            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-2xs ${
              item.category === '골프'
                ? 'bg-[#1B4D3E] text-white'
                : item.category === '복합'
                ? 'bg-[#8C5D28] text-white'
                : 'bg-[#2C2C2C] text-white'
            }`}>
              {item.category}
            </span>

            {/* Region Tag */}
            <span className="px-2 py-0.5 bg-[#F5F2EB] text-[#786658] text-[10px] font-medium rounded-2xs border border-[#E8E4DC]">
              {item.region} ({item.country})
            </span>

            {/* Status Badge */}
            {getStatusBadge(item.status)}

            {/* BEST 10 Badge */}
            {item.isBest10 && item.best10Rank && (
              <span className="px-2 py-0.5 bg-[#8C5D28] text-white text-[10px] font-mono font-bold rounded-2xs">
                BEST #{item.best10Rank}
              </span>
            )}

            {/* NEW Discovery Tag */}
            {item.isNewDiscovery && (
              <span className="px-2 py-0.5 bg-[#9E2A2B] text-white text-[10px] font-bold rounded-2xs uppercase tracking-wider animate-pulse">
                NEW 발견
              </span>
            )}
          </div>

          {/* Action Buttons: Save/Bookmark & Admin WatchList */}
          <div className="flex items-center space-x-1">
            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(item);
                }}
                className={`p-1.5 rounded-2xs border transition-colors cursor-pointer ${
                  item.isSaved
                    ? 'bg-[#8C5D28]/10 text-[#8C5D28] border-[#8C5D28]/30'
                    : 'bg-[#F5F2EB] text-[#786658] border-[#E8E4DC] hover:text-[#2C2C2C]'
                }`}
                title={item.isSaved ? '저장됨' : '관심 사례 저장'}
              >
                {item.isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            {item.isNewDiscovery && isAdmin && onAddToWatchList && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchList(item.companyName, item.category);
                }}
                className="px-2 py-1 bg-[#1B4D3E] text-white text-[10px] font-medium rounded-2xs hover:bg-[#153e32] transition-colors flex items-center space-x-1 cursor-pointer"
                title="Watch List 추가"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Watch List</span>
              </button>
            )}
          </div>
        </div>

        {/* Company / Facility Name */}
        <div>
          <div className="text-xs font-semibold text-[#8C5D28] uppercase tracking-wider">
            {item.companyName}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#2C2C2C] mt-0.5 line-clamp-2 leading-snug group-hover:text-[#8C5D28] transition-colors cursor-pointer" onClick={() => onOpenDetail(item)}>
            {item.whatWasDone}
          </h3>
        </div>

        {/* Best 10 Reason if applicable */}
        {item.isBest10 && item.best10Reason && (
          <div className="p-2.5 bg-[#8C5D28]/5 rounded-2xs border border-[#8C5D28]/15 text-xs text-[#8C5D28] font-medium leading-normal">
            <span className="font-bold mr-1">💡 BEST 선정 이유:</span>
            {item.best10Reason}
          </div>
        )}

        {/* Period & Target & Price Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5C4E43] bg-[#FAF8F5] p-3 rounded-2xs border border-[#E8E4DC]">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8C5D28] shrink-0" />
            <span className="truncate"><strong className="text-[#2C2C2C]">기간:</strong> {item.periodText}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#8C5D28] shrink-0" />
            <span className="truncate"><strong className="text-[#2C2C2C]">가격:</strong> {item.priceInfo}</span>
          </div>
        </div>

        {/* Key Features Bullet List */}
        <div className="space-y-1 pt-1">
          <div className="text-[11px] font-bold text-[#786658] uppercase tracking-wider">핵심 특징 & 구성</div>
          <ul className="space-y-1 text-xs text-[#423C36]">
            {item.keyFeatures.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-[#8C5D28] font-bold">•</span>
                <span className="line-clamp-2">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI INSIGHT: Oak Valley 참고 포인트 */}
        <div className="p-3 bg-[#2C2C2C] text-[#FAF8F5] rounded-2xs space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#C2B7AC]">
            <span className="flex items-center space-x-1 font-bold text-[#EFECE6]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4C8B8]" />
              <span>Oak Valley 참고 포인트</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#8C5D28] text-white rounded-2xs">AI INSIGHT</span>
          </div>
          <p className="text-xs text-[#FAF8F5] font-light leading-relaxed">
            {item.aiOakValleyPoint}
          </p>
        </div>
      </div>

      {/* Footer Meta & Detail Link */}
      <div className="pt-3 border-t border-[#E8E4DC] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#786658]">
        
        {/* Source & Date Info */}
        <div className="flex flex-wrap items-center gap-2">
          {getSourcePriorityBadge(item.sourcePriority, item.sourceTitle)}
          <span className="text-[10px] font-mono text-[#A89A8B]">
            자료일: {item.dataDate} | 확인일: {item.verificationDate}
          </span>
        </div>

        {/* Detail Modal Trigger */}
        <button
          onClick={() => onOpenDetail(item)}
          className="text-xs font-semibold text-[#8C5D28] hover:text-[#2C2C2C] flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <span>상세보기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
