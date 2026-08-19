import React from 'react';
import { Calendar as CalendarIcon, MapPin, Sparkles, Building2, ExternalLink, Award, ChevronRight, Layers } from 'lucide-react';
import { ActivationItem } from '../types';
import {
  calculateActivationStatus,
  formatMonthHeader,
  getStartDayOfMonth,
  getEndDayOfMonth,
  isEventInMonth,
  getTodayDateStr
} from '../utils/activationUtils';

interface ActivationCalendarViewProps {
  yearMonth: string; // e.g. "2026.08"
  activations: ActivationItem[]; // Already filtered for month and active category/region
  allMonthActivations: ActivationItem[]; // All events in month for summary counts
  onSelectEvent: (event: ActivationItem) => void;
}

export const ActivationCalendarView: React.FC<ActivationCalendarViewProps> = ({
  yearMonth,
  activations = [],
  allMonthActivations = [],
  onSelectEvent,
}) => {
  const safeAllMonth = allMonthActivations || [];
  const safeActivations = activations || [];

  const [yearStr, monthStr] = (yearMonth || '2026.08').split('.');
  const year = parseInt(yearStr, 10) || 2026;
  const month = parseInt(monthStr, 10) || 8;

  // Days in month calculation
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat

  // Calendar cells array
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  const calendarDays = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - firstDayOfWeek + 1;
    const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
    return {
      cellIndex: i,
      dayNum: isCurrentMonth ? dayNum : null,
      isCurrentMonth,
      dateStr: isCurrentMonth ? `${yearStr}.${monthStr.padStart(2, '0')}.${String(dayNum).padStart(2, '0')}` : '',
    };
  });

  // Calculate top summary numbers based on safeAllMonth
  const totalCount = safeAllMonth.length;
  const popupCount = safeAllMonth.filter(a => matchesType(a, ['pop-up', 'popup', '팝업'])).length;
  const exhibitionCount = safeAllMonth.filter(a => matchesType(a, ['exhibition', 'expo', 'fair', '전시', '박람회'])).length;
  const sportsWellnessCount = safeAllMonth.filter(a => matchesType(a, ['sports', 'wellness', 'golf', 'running', 'outdoor'])).length;
  const otherCount = Math.max(0, totalCount - popupCount - exhibitionCount - sportsWellnessCount);

  function matchesType(item: ActivationItem, keywords: string[]): boolean {
    const t = (item.eventType || '').toLowerCase();
    const tags = (item.tags || []).map(x => x.toLowerCase());
    return keywords.some(k => t.includes(k) || tags.some(tag => tag.includes(k)));
  }

  // Top 5 Featured Events for Oak Valley for this month
  const featuredTop5 = [...safeAllMonth]
    .sort((a, b) => {
      const fitScore = (item: ActivationItem) => (item.oakValleyParkRocheInsight?.oakValleyFit === 'HIGH' ? 3 : 2);
      return fitScore(b) - fitScore(a);
    })
    .slice(0, 5);

  const getEventTypeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('golf') || t.includes('sports') || t.includes('run')) {
      return 'bg-[#EEF5F0] text-[#2B6040] border-[#C3DEC8]';
    }
    if (t.includes('well') || t.includes('outdoor')) {
      return 'bg-[#F4F2EC] text-[#595243] border-[#D8D2C4]';
    }
    if (t.includes('pop')) {
      return 'bg-[#FAF4EB] text-[#8C5D28] border-[#E8D8C3]';
    }
    if (t.includes('exhib') || t.includes('expo')) {
      return 'bg-[#F0F2F5] text-[#3E4A5B] border-[#CAD2DE]';
    }
    return 'bg-[#EFECE6] text-[#2C2C2C] border-[#D4C8B8]';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Monthly Summary Header Bar */}
      <section className="bg-white p-6 rounded-xs border border-[#E8E4DC] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E8E4DC] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#8C7A6B] uppercase tracking-wider font-bold block">
              MONTHLY ACTIVATION SUMMARY
            </span>
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#2C2C2C]">
              {formatMonthHeader(yearMonth)} ACTIVATION SUMMARY
            </h2>
          </div>

          {/* Stats Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 bg-[#2C2C2C] text-[#FAF8F5] rounded-2xs font-bold">
              전체 행사 {totalCount}개
            </span>
            <span className="px-3 py-1.5 bg-[#FAF4EB] text-[#8C5D28] border border-[#E8D8C3] rounded-2xs">
              팝업 {popupCount}
            </span>
            <span className="px-3 py-1.5 bg-[#F0F2F5] text-[#3E4A5B] border border-[#CAD2DE] rounded-2xs">
              전시/박람회 {exhibitionCount}
            </span>
            <span className="px-3 py-1.5 bg-[#EEF5F0] text-[#2B6040] border border-[#C3DEC8] rounded-2xs">
              스포츠/웰니스 {sportsWellnessCount}
            </span>
            <span className="px-3 py-1.5 bg-[#F4F2EC] text-[#595243] border border-[#D8D2C4] rounded-2xs">
              기타 {otherCount}
            </span>
          </div>
        </div>

        {/* 2. Oak Valley Featured Top 5 Events Spotlight */}
        {featuredTop5.length > 0 && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8C5D28]" />
              <h3 className="text-xs font-mono font-bold text-[#2C2C2C] uppercase tracking-wider">
                OAK VALLEY 주목 행사 5 (OAK VALLEY FEATURED TOP 5)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {featuredTop5.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectEvent(item)}
                  className="bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E4DC] hover:border-[#8C7A6B] p-3.5 rounded-2xs cursor-pointer transition-all space-y-2 flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-full bg-[#736152] text-[#FAF8F5] text-[10px] font-mono font-bold flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-[#1E5647] bg-[#E2ECE9] px-1.5 py-0.5 rounded-2xs font-bold">
                        FIT: {item.oakValleyParkRocheInsight?.oakValleyFit || 'HIGH'}
                      </span>
                    </div>

                    <h4 className="text-xs font-serif-display font-bold text-[#2C2C2C] line-clamp-1 group-hover:text-[#736152]">
                      {item.eventName}
                    </h4>
                    <p className="text-[11px] font-mono text-[#736152] line-clamp-1">
                      {item.brand}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E4DC] text-[10px] text-[#8C7A6B] font-mono space-y-1">
                    <div className="line-clamp-1">📍 {item.location}</div>
                    <div className="text-[#2C2C2C] line-clamp-1 font-sans">
                      💡 {item.oakValleyParkRocheInsight?.quickWin || item.whatIsIt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Monthly Calendar Grid */}
      <section className="bg-white rounded-xs border border-[#E8E4DC] shadow-2xs overflow-hidden">
        
        {/* Day of Week Labels Bar */}
        <div className="grid grid-cols-7 bg-[#2C2C2C] text-[#FAF8F5] text-center font-mono text-xs py-2.5 font-medium border-b border-[#423C36]">
          <div className="text-red-300">SUN (일)</div>
          <div>MON (월)</div>
          <div>TUE (화)</div>
          <div>WED (수)</div>
          <div>THU (목)</div>
          <div>FRI (금)</div>
          <div className="text-blue-300">SAT (토)</div>
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E4DC]">
          {calendarDays.map((cell) => {
            if (!cell.isCurrentMonth || cell.dayNum === null) {
              return (
                <div key={cell.cellIndex} className="bg-[#FAF8F5]/60 min-h-[110px] p-2 text-slate-300 font-mono text-xs">
                  {/* Empty cell for padding */}
                </div>
              );
            }

            const dayNum = cell.dayNum;
            const todayStr = getTodayDateStr();
            const isToday = cell.dateStr === todayStr;

            // Find events running on this day
            const eventsOnDay = safeActivations.filter((act) => {
              const startDay = getStartDayOfMonth(act, yearMonth);
              const endDay = getEndDayOfMonth(act, yearMonth);
              return dayNum >= startDay && dayNum <= endDay;
            });

            return (
              <div
                key={cell.cellIndex}
                className={`min-h-[125px] p-2 space-y-1.5 transition-colors ${
                  isToday ? 'bg-[#FAF4EB]/80 border-2 border-[#8C5D28]' : 'bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                {/* Cell Day Header */}
                <div className="flex items-center justify-between font-mono">
                  <span className={`text-xs font-bold ${isToday ? 'text-[#8C5D28]' : 'text-[#2C2C2C]'}`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="px-1.5 py-0.2 bg-[#8C5D28] text-[#FAF8F5] text-[9px] font-bold rounded-2xs">
                      TODAY
                    </span>
                  )}
                  {eventsOnDay.length > 0 && (
                    <span className="text-[10px] text-[#8C7A6B]">
                      {eventsOnDay.length}건
                    </span>
                  )}
                </div>

                {/* Event Pills on this Day */}
                <div className="space-y-1">
                  {eventsOnDay.slice(0, 3).map((act) => {
                    const status = calculateActivationStatus(act.startDate, act.endDate);
                    return (
                      <div
                        key={act.id}
                        onClick={() => onSelectEvent(act)}
                        className={`p-1.5 rounded-2xs border text-[11px] font-sans leading-snug cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${getEventTypeStyle(act.eventType)}`}
                        title={`${act.eventName} (${act.brand}) - ${act.periodText}`}
                      >
                        <div className="font-bold truncate text-[#2C2C2C]">
                          {act.eventName}
                        </div>
                        <div className="text-[10px] font-mono text-[#736152] truncate flex items-center justify-between pt-0.5">
                          <span>{act.brand}</span>
                          <span>{act.hotspot || act.city}</span>
                        </div>
                      </div>
                    );
                  })}

                  {eventsOnDay.length > 3 && (
                    <div className="text-[10px] text-[#8C7A6B] font-mono text-center pt-0.5">
                      + 외 {eventsOnDay.length - 3}개 더보기
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
};
