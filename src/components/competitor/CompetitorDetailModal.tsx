import React from 'react';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { CompetitorRadarItem } from '../../types';

interface CompetitorDetailModalProps {
  item: CompetitorRadarItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSave?: (item: CompetitorRadarItem) => void;
  onCreateProposalForCompany?: (companyName: string) => void;
}

export const CompetitorDetailModal: React.FC<CompetitorDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onToggleSave,
  onCreateProposalForCompany,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] rounded-xs max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#423C36] flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#2C2C2C] text-[#FAF8F5] rounded-t-xs border-b border-[#423C36] space-y-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-2xs uppercase ${
                item.category === '골프'
                  ? 'bg-[#1B4D3E] text-white'
                  : item.category === '복합'
                  ? 'bg-[#8C5D28] text-white'
                  : 'bg-[#59514A] text-white'
              }`}>
                {item.category}
              </span>
              <span className="text-xs text-[#C2B7AC] font-mono">
                {item.region} ({item.country})
              </span>
              {item.isBest10 && (
                <span className="px-2 py-0.5 bg-[#8C5D28] text-white text-[10px] font-mono font-bold rounded-2xs">
                  BEST #{item.best10Rank}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#C2B7AC] hover:text-white rounded-2xs hover:bg-[#423C36] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="text-xs font-mono text-[#D4C8B8]">{item.companyName}</div>
            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#FAF8F5] mt-0.5">
              {item.whatWasDone}
            </h2>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-4">
          
          {/* ① 확인된 사실 (FACT) */}
          <div className="bg-white p-4 rounded-2xs border border-[#E8E4DC] space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-2">
              <span className="font-bold text-[#736152] flex items-center space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#736152] text-white text-[9px] flex items-center justify-center font-mono">1</span>
                <span>확인된 사실 [FACT]</span>
              </span>
              <span className="text-[10px] text-[#8C7A6B] font-mono">
                작성일: {item.dataDate} | 검증일: {item.verificationDate}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-[#786658] font-bold">경쟁사 / 브랜드명</div>
                <div className="text-[#2C2C2C] font-semibold">{item.companyName}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[#786658] font-bold">진행 내용 / 프로그램</div>
                <div className="text-[#2C2C2C] font-semibold">{item.whatWasDone}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[#786658] font-bold">진행 기간 & 가격</div>
                <div className="text-[#2C2C2C] flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8C5D28]" />
                  <span>{item.periodText} ({item.priceInfo})</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[#786658] font-bold">주요 타깃층</div>
                <div className="text-[#2C2C2C]">{item.targetCustomer}</div>
              </div>
            </div>
          </div>

          {/* ② 변화 포인트 */}
          <div className="bg-white p-4 rounded-2xs border border-[#E8E4DC] space-y-2 text-xs">
            <h3 className="font-bold text-[#2C2C2C] flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-[#8C7A6B] text-white text-[9px] flex items-center justify-center font-mono">2</span>
              <span>변화 포인트 (무엇이 달라졌는가)</span>
            </h3>
            <div className="space-y-1.5 text-[#423C36] pl-5">
              {item.keyFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-[#8C5D28] font-bold">•</span>
                  <span className="leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ③ 시장·소비 의미 (INSIGHT) */}
          <div className="bg-amber-50/60 p-4 rounded-2xs border border-amber-200/80 space-y-1.5 text-xs">
            <h3 className="font-bold text-amber-900 flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-800 text-white text-[9px] flex items-center justify-center font-mono">3</span>
              <span>시장·소비 의미 [INSIGHT]</span>
            </h3>
            <p className="text-[#332211] leading-relaxed pl-5 font-normal">
              {item.whyNotable}
            </p>
          </div>

          {/* ④ 근거 및 출처 */}
          <div className="bg-white p-3.5 rounded-2xs border border-[#E8E4DC] space-y-1.5 text-xs">
            <div className="font-bold text-[#5C4E43] flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-[#5C4E43] text-white text-[9px] flex items-center justify-center font-mono">4</span>
                <span>근거 및 출처</span>
              </span>
              <span className="text-[10px] font-mono text-[#786658]">
                최종 확인일: {item.verificationDate}
              </span>
            </div>

            <div className="flex items-center justify-between pl-5 pt-1">
              <div className="text-[#5C4E43]">
                출처 구분: <strong>공식 발표/언론</strong> ({item.sourceTitle})
              </div>
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-2xs text-[#8C5D28] font-bold flex items-center space-x-1"
                >
                  <span>원문링크</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* ⑤ IPARK리조트 영향 & ⑥ 실행 포인트 */}
          <div className="p-5 bg-[#2C2C2C] text-[#FAF8F5] rounded-2xs space-y-3 shadow-md">
            <div className="space-y-1 border-b border-[#423C36] pb-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#EFECE6]">
                <span className="w-4 h-4 rounded-full bg-[#8C5D28] text-white text-[9px] flex items-center justify-center font-mono">5</span>
                <span>IPARK리조트 영향 (오크밸리 & 파크로쉬)</span>
              </div>
              <p className="text-xs text-[#D4C8B8] font-light leading-relaxed pl-5">
                {item.aiOakValleyPoint || '경쟁사 전략 벤치마킹을 통한 객단가 상승 및 패키지 상품성 강화 필요.'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[9px] flex items-center justify-center font-mono">6</span>
                <span>실행 포인트 (벤치마킹 실행 제안 1~3안)</span>
              </div>
              <p className="text-xs text-[#FAF8F5] leading-relaxed pl-5 font-medium">
                1. 동종사 패키지 구성을 고려한 차별화 패키지 기획
                <br />
                2. 리조트 유휴 공간 및 팝업 존을 활용한 스폰서십 이벤트 유치
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#F5F2EB] rounded-b-xs border-t border-[#E8E4DC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(item)}
                className={`px-3 py-2 rounded-2xs text-xs font-semibold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  item.isSaved
                    ? 'bg-[#8C5D28] text-white border-[#8C5D28]'
                    : 'bg-white text-[#2C2C2C] border-[#E8E4DC] hover:bg-[#FAF8F5]'
                }`}
              >
                {item.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{item.isSaved ? '관심 사례 저장됨' : '관심 사례 저장'}</span>
              </button>
            )}

            {onCreateProposalForCompany && (
              <button
                onClick={() => {
                  onClose();
                  onCreateProposalForCompany(item.companyName);
                }}
                className="px-3 py-2 bg-[#2C2C2C] text-white rounded-2xs text-xs font-semibold hover:bg-[#423C36] transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Building2 className="w-4 h-4" />
                <span>제안서 만들기 연동</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#E8E4DC] text-[#2C2C2C] rounded-2xs text-xs font-semibold hover:bg-[#D4C8B8] transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
