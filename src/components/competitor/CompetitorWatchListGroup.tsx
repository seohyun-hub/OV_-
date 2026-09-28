import React, { useState } from 'react';
import { CompetitorWatchListItem } from '../../types';
import { ExternalLink, Globe, FileText, CalendarCheck, Tag, Gift, ChevronDown, ChevronUp, MapPin, Check, X, HelpCircle } from 'lucide-react';

interface CompetitorWatchListGroupProps {
  watchList: CompetitorWatchListItem[];
  categoryMode?: 'GOLF' | 'RESORT' | 'WELLNESS' | 'ALL';
  selectedPriority?: string;
  searchQuery?: string;
}

export const CompetitorWatchListGroup: React.FC<CompetitorWatchListGroupProps> = ({
  watchList,
  categoryMode = 'ALL',
  selectedPriority = 'ALL',
  searchQuery = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter list
  let filtered = watchList || [];

  if (categoryMode === 'GOLF') {
    filtered = filtered.filter(
      (item) => item.category === 'GOLF' || item.category === '골프' || item.watchCategory === 'GOLF'
    );
  } else if (categoryMode === 'RESORT') {
    filtered = filtered.filter(
      (item) =>
        (item.category === 'RESORT' ||
          item.category === 'HOTEL_RESORT' ||
          item.category === 'HOTEL' ||
          item.category === '호텔·리조트' ||
          item.category === '리조트' ||
          item.category === '복합' ||
          item.watchCategory === 'RESORT') &&
        item.category !== 'WELLNESS_SPA'
    );
  } else if (categoryMode === 'WELLNESS') {
    filtered = filtered.filter(
      (item) =>
        item.category === 'WELLNESS_SPA' ||
        item.category === 'WELLNESS' ||
        item.category === 'SPA' ||
        item.category === '웰니스' ||
        item.category === '스파' ||
        item.watchCategory === 'WELLNESS'
    );
  }

  if (selectedPriority !== 'ALL') {
    filtered = filtered.filter((item) => {
      if (selectedPriority === 'PRIORITY_1') return item.priority === 1 || item.priorityTier === 'PRIORITY_1';
      if (selectedPriority === 'PRIORITY_2') return item.priority === 2 || item.priorityTier === 'PRIORITY_2';
      if (selectedPriority === 'PRIORITY_3') return item.priority === 3 || item.priorityTier === 'PRIORITY_3';
      if (selectedPriority === 'PRIORITY_4') return item.priority === 4 || item.priorityTier === 'PRIORITY_4';
      if (selectedPriority === 'RESORT_COMPETITOR') {
        return (
          item.category === 'RESORT' ||
          item.category === 'HOTEL_RESORT' ||
          item.priorityTier === 'RESORT_COMPETITOR'
        );
      }
      return item.priorityTier === selectedPriority;
    });
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        (item.companyName || item.competitorName || '').toLowerCase().includes(q) ||
        (item.region || '').toLowerCase().includes(q) ||
        (item.memo && item.memo.toLowerCase().includes(q))
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Grouping
  const priority1List = filtered.filter(
    (item) =>
      (item.category === 'GOLF' || item.category === '골프' || item.watchCategory === 'GOLF') &&
      (item.priority === 1 || item.priorityTier === 'PRIORITY_1')
  );
  const priority2List = filtered.filter(
    (item) =>
      (item.category === 'GOLF' || item.category === '골프' || item.watchCategory === 'GOLF') &&
      (item.priority === 2 || item.priorityTier === 'PRIORITY_2')
  );
  const priority3List = filtered.filter(
    (item) =>
      (item.category === 'GOLF' || item.category === '골프' || item.watchCategory === 'GOLF') &&
      (item.priority === 3 || item.priorityTier === 'PRIORITY_3')
  );
  const priority4List = filtered.filter(
    (item) =>
      (item.category === 'GOLF' || item.category === '골프' || item.watchCategory === 'GOLF') &&
      (item.priority === 4 || item.priorityTier === 'PRIORITY_4')
  );

  const resortList = filtered.filter(
    (item) =>
      (item.category === 'RESORT' ||
        item.category === 'HOTEL_RESORT' ||
        item.category === 'HOTEL' ||
        item.category === '호텔·리조트' ||
        item.category === '리조트' ||
        item.category === '복합' ||
        item.priorityTier === 'RESORT_COMPETITOR' ||
        item.watchCategory === 'RESORT') &&
      item.category !== 'WELLNESS_SPA'
  );

  const wellnessList = filtered.filter(
    (item) =>
      item.category === 'WELLNESS_SPA' ||
      item.category === 'WELLNESS' ||
      item.category === 'SPA' ||
      item.category === '웰니스' ||
      item.category === '스파' ||
      item.watchCategory === 'WELLNESS'
  );

  const otherList = filtered.filter(
    (item) =>
      !priority1List.includes(item) &&
      !priority2List.includes(item) &&
      !priority3List.includes(item) &&
      !priority4List.includes(item) &&
      !resortList.includes(item) &&
      !wellnessList.includes(item)
  );

  const renderCard = (item: CompetitorWatchListItem) => {
    const isExpanded = expandedId === item.id;
    const name = item.companyName || item.competitorName || '경쟁사';
    const mainUrl = item.officialWebsite || item.officialUrl;
    const pricingUrl = item.pricingUrl;
    const reservationUrl = item.reservationUrl;
    const isGolf = item.category === 'GOLF' || item.watchCategory === 'GOLF' || item.category === '골프';
    const isWellness =
      item.category === 'WELLNESS_SPA' ||
      item.category === 'WELLNESS' ||
      item.category === 'SPA' ||
      item.watchCategory === 'WELLNESS';

    return (
      <div
        key={item.id}
        className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all text-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  {item.region}
                </span>
                {isWellness ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                    웰니스·스파
                  </span>
                ) : !isGolf ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    호텔·리조트
                  </span>
                ) : null}
              </div>
              {item.memo && <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{item.memo}</p>}
            </div>

            <button
              onClick={() => toggleExpand(item.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 flex-shrink-0"
              title="상세 펼치기"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Pricing Summary Grid for Golf */}
          {isGolf && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">주중 그린피</span>
                <span className="font-bold text-slate-800">
                  {item.weekdayGreenFee
                    ? typeof item.weekdayGreenFee === 'number'
                      ? `${item.weekdayGreenFee.toLocaleString()}원`
                      : item.weekdayGreenFee
                    : '확인 필요'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">토요일 그린피</span>
                <span className="font-bold text-slate-800">
                  {item.saturdayGreenFee
                    ? typeof item.saturdayGreenFee === 'number'
                      ? `${item.saturdayGreenFee.toLocaleString()}원`
                      : item.saturdayGreenFee
                    : '확인 필요'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">일요일 그린피</span>
                <span className="font-bold text-slate-800">
                  {item.sundayGreenFee
                    ? typeof item.sundayGreenFee === 'number'
                      ? `${item.sundayGreenFee.toLocaleString()}원`
                      : item.sundayGreenFee
                    : '확인 필요'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">카트/캐디피</span>
                <span className="font-medium text-slate-700">
                  {item.cartFee
                    ? `카트 ${typeof item.cartFee === 'number' ? `${item.cartFee.toLocaleString()}원` : item.cartFee}`
                    : '확인 필요'}
                </span>
              </div>
            </div>
          )}

          {/* Operating Badges for Golf */}
          {isGolf && (
            <div className="flex flex-wrap items-center gap-1.5 my-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  item.twoPlayerAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.twoPlayerAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 2인 플레이
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  item.threePlayerAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.threePlayerAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 3인 플레이
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  item.nightGolf
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.nightGolf ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 야간 3부
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  item.selfGolf
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.selfGolf ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 노캐디 셀프
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                  item.packageAvailable
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.packageAvailable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 숙박 패키지
              </span>
            </div>
          )}

          {/* Facility Tags for Hotel / Wellness */}
          {!isGolf && item.wellnessFacilities && item.wellnessFacilities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 my-2.5">
              {item.wellnessFacilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {fac}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Official Direct Links */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 mt-2">
            {mainUrl && (
              <a
                href={mainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
              >
                <Globe className="w-3 h-3" />
                <span>공식 홈</span>
              </a>
            )}
            {pricingUrl && (
              <a
                href={pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
              >
                <FileText className="w-3 h-3" />
                <span>요금 안내</span>
              </a>
            )}
            {reservationUrl && (
              <a
                href={reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors"
              >
                <CalendarCheck className="w-3 h-3" />
                <span>예약 안내</span>
              </a>
            )}
            {item.promotionUrl && (
              <a
                href={item.promotionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded transition-colors"
              >
                <Tag className="w-3 h-3" />
                <span>프로모션</span>
              </a>
            )}
            {item.packageUrl && (
              <a
                href={item.packageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded transition-colors"
              >
                <Gift className="w-3 h-3" />
                <span>패키지</span>
              </a>
            )}
          </div>

          {/* Expanded Info */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-slate-600 space-y-1.5 bg-slate-50/50 p-3 rounded-lg">
              {isGolf ? (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">금요일 그린피:</span>
                    <span className="font-medium text-slate-800">
                      {item.fridayGreenFee
                        ? typeof item.fridayGreenFee === 'number'
                          ? `${item.fridayGreenFee.toLocaleString()}원`
                          : item.fridayGreenFee
                        : '확인 필요'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">캐디피:</span>
                    <span className="font-medium text-slate-800">
                      {item.caddieFee
                        ? typeof item.caddieFee === 'number'
                          ? `${item.caddieFee.toLocaleString()}원`
                          : item.caddieFee
                        : '확인 필요'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">분류:</span>
                    <span className="font-semibold text-slate-800">
                      {isWellness ? '웰니스·스파 전문 시설' : '호텔·리조트 복합 자산'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">지역 권역:</span>
                    <span className="font-medium text-slate-800">{item.region}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200/60">
                <span className="text-slate-400">공식 검증일:</span>
                <span className="font-medium text-slate-800">
                  {item.lastCheckedAt || item.lastVerifiedDate || '2026.09.21'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (title: string, subtitle: string, list: CompetitorWatchListItem[], badgeColor: string) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${badgeColor}`}>{title}</span>
          <span className="text-xs text-slate-500 font-medium">({list.length}개 대상)</span>
          <span className="text-xs text-slate-400">• {subtitle}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((item) => renderCard(item))}
        </div>
      </div>
    );
  };

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center my-6">
        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700 mb-1">현재 확인 가능한 공식 정보 없음</p>
        <p className="text-xs text-slate-400">검색 조건에 맞는 경쟁사 Watch List 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority 1 (Golf) */}
      {(categoryMode === 'ALL' || categoryMode === 'GOLF') &&
        renderSection(
          'PRIORITY 1 — 원주·횡성 권역',
          '직접 권역 최우선 모니터링',
          priority1List,
          'bg-rose-100 text-rose-800 border border-rose-200'
        )}

      {/* Priority 2 (Golf) */}
      {(categoryMode === 'ALL' || categoryMode === 'GOLF') &&
        renderSection(
          'PRIORITY 2 — 춘천·강촌 권역',
          '강원 영서권 주요 골프장',
          priority2List,
          'bg-amber-100 text-amber-800 border border-amber-200'
        )}

      {/* Priority 3 (Golf) */}
      {(categoryMode === 'ALL' || categoryMode === 'GOLF') &&
        renderSection(
          'PRIORITY 3 — 홍천·평창·강릉·고성 권역',
          '강원 체류형 & 프리미엄 레저',
          priority3List,
          'bg-blue-100 text-blue-800 border border-blue-200'
        )}

      {/* Priority 4 (Golf) */}
      {(categoryMode === 'ALL' || categoryMode === 'GOLF') &&
        renderSection(
          'PRIORITY 4 — 수도권 프리미엄 36홀+',
          '수도권 하이엔드 비교군',
          priority4List,
          'bg-purple-100 text-purple-800 border border-purple-200'
        )}

      {/* Hotel & Resort List */}
      {(categoryMode === 'ALL' || categoryMode === 'RESORT') &&
        renderSection(
          'HOTEL & RESORT WATCH — 호텔·리조트 경쟁사',
          '국내 주요 17개 호텔·리조트 그룹 (조선호텔, 아난티, 소노, 휘닉스, 용평, 하이원, 곤지암, 리솜, 파라다이스, 설해원, WE호텔, 반얀트리)',
          resortList,
          'bg-blue-100 text-blue-800 border border-blue-200'
        )}

      {/* Wellness & Spa List */}
      {(categoryMode === 'ALL' || categoryMode === 'WELLNESS') &&
        renderSection(
          'WELLNESS & SPA WATCH — 웰니스·스파 전문 Watch',
          '스파, 온천, 수(水) 테라피, 명상, 숲 치유, 웰니스 프로그램 특화 10개 시설',
          wellnessList,
          'bg-teal-100 text-teal-800 border border-teal-200'
        )}

      {/* Other List */}
      {otherList.length > 0 &&
        renderSection('기타 경쟁사', '추가 모니터링 등록 대상', otherList, 'bg-slate-100 text-slate-800 border border-slate-200')}
    </div>
  );
};
