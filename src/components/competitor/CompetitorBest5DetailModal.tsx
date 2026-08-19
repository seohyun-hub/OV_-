import React from 'react';
import { X, ExternalLink, Building2, Calendar, DollarSign, Tag, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CompetitorBest5Item } from '../../types';

const getCategoryTagLabel = (tag: string): string => {
  const map: Record<string, string> = {
    'PACKAGE': '패키지',
    'PARTNERSHIP': '브랜드 제휴',
    'NEW EXPERIENCE': '신규 콘텐츠',
    'GOLF & SPORTS': '골프·스포츠',
    'WELLNESS': '웰니스',
    'F&B': 'F&B',
    'FAMILY': '패밀리',
    'PET': '펫',
    'CULTURE': '문화·콘텐츠',
    'SEASONAL': '시즌 프로모션',
  };
  return map[tag] || tag;
};

interface CompetitorBest5DetailModalProps {
  item: CompetitorBest5Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CompetitorBest5DetailModal: React.FC<CompetitorBest5DetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-[#FAF8F5] text-[#2C2C2C] w-full max-w-3xl rounded-xs shadow-2xl border border-[#D4C8B8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 sm:p-8 flex items-start justify-between border-b border-[#423C36] relative">
          <div className="space-y-2 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#8C5D28] text-[#FAF8F5] text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider">
                BEST {item.rank}
              </span>
              <span className="px-2 py-0.5 bg-[#423C36] text-[#EFECE6] text-[10px] font-mono rounded-2xs border border-[#59514A]">
                {item.regionText}
              </span>
              {item.categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#1E3A2B] text-[#B8E2C8] text-[10px] font-medium rounded-2xs border border-[#2E5A42]"
                >
                  #{getCategoryTagLabel(tag)}
                </span>
              ))}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#FAF8F5] leading-snug">
              {item.title}
            </h2>

            <div className="flex items-center space-x-2 text-xs text-[#C2B7AC]">
              <Building2 className="w-4 h-4 text-[#8C5D28]" />
              <span className="font-semibold text-[#EFECE6]">{item.hotelResortName}</span>
              <span>({item.companyBrand})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#C2B7AC] hover:text-white hover:bg-[#423C36] rounded-2xs transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: 실제 사례 (Real Case Verified Data) */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#E8E4DC]">
              <ShieldCheck className="w-5 h-5 text-[#8C5D28]" />
              <h3 className="text-base font-bold text-[#2C2C2C] tracking-tight">
                1. 실제 사례 검증 정보
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 sm:p-5 rounded-2xs border border-[#E8E4DC] text-xs">
              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">운영사 / 브랜드</span>
                <p className="font-semibold text-[#2C2C2C]">{item.companyBrand}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">호텔·리조트</span>
                <p className="font-semibold text-[#2C2C2C]">{item.hotelResortName}</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">프로그램 또는 프로모션명</span>
                <p className="font-bold text-[#2C2C2C] text-sm">{item.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">운영 기간</span>
                <p className="font-medium text-[#2C2C2C] flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>{item.period}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">공식 가격</span>
                <p className="font-medium text-[#2C2C2C] flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>{item.priceInfo || '공식 문의 / 패키지 변동 가격'}</span>
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">프로그램 세부 구성</span>
                <p className="text-[#423C36] leading-relaxed bg-[#FAF8F5] p-3 rounded-2xs border border-[#E8E4DC]">
                  {item.programDetails}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">브랜드 협업 여부</span>
                <p className="font-medium text-[#2C2C2C]">
                  {item.isBrandPartnership ? (
                    <span className="text-[#1E5647] font-bold">협업 진행 ({item.partnerBrandName || '제휴 브랜드'})</span>
                  ) : (
                    <span className="text-slate-600">리조트 자체 기획</span>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[#786658] font-mono uppercase text-[10px] block">정보 확인일</span>
                <p className="font-mono text-[#5C4E43]">{item.verificationDate}</p>
              </div>

              <div className="space-y-1 md:col-span-2 pt-2 border-t border-[#E8E4DC] flex items-center justify-between">
                <div className="text-[11px] text-[#786658] truncate pr-2">
                  <span className="font-semibold text-[#2C2C2C]">공식 출처:</span> {item.officialSourceTitle}
                </div>
                <a
                  href={item.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <span>공식 출처 확인</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>

          {/* Section 2: 주목 포인트 (Analysis) */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#E8E4DC]">
              <Sparkles className="w-5 h-5 text-[#8C5D28]" />
              <h3 className="text-base font-bold text-[#2C2C2C] tracking-tight">
                2. 왜 주목했는가? (차별점 및 시장 분석)
              </h3>
            </div>
            <div className="bg-[#F5F2EB] p-4 sm:p-5 rounded-2xs border border-[#D4C8B8] text-xs sm:text-sm text-[#423C36] leading-relaxed">
              {item.featureAnalysis}
            </div>
          </section>

          {/* Section 3: Oak Valley / PARK ROCHE 적용 아이디어 */}
          {(item.oakValleyApplicability || item.parkRocheApplicability) && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#E8E4DC]">
                <CheckCircle2 className="w-5 h-5 text-[#1E5647]" />
                <h3 className="text-base font-bold text-[#2C2C2C] tracking-tight">
                  3. 사업 적용 및 실무 참고 아이디어
                </h3>
              </div>

              <div className="space-y-3">
                {/* Oak Valley Applicable */}
                {item.oakValleyApplicability && (
                  <div className="bg-white p-4 rounded-2xs border-l-4 border-l-[#8C5D28] border border-[#E8E4DC] space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-[#EFECE6] text-[#736152] text-[10px] font-mono font-bold rounded-2xs uppercase">
                        Oak Valley 적용
                      </span>
                      <span className="text-xs text-[#786658] font-medium">(골프 / 객실 / F&B / 액티비티 / 시즌 이벤트)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2C2C2C] font-medium leading-relaxed pt-1">
                      {item.oakValleyApplicability}
                    </p>
                  </div>
                )}

                {/* PARK ROCHE Applicable */}
                {item.parkRocheApplicability && (
                  <div className="bg-white p-4 rounded-2xs border-l-4 border-l-[#1E5647] border border-[#E8E4DC] space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-[#E2ECE9] text-[#1E5647] text-[10px] font-mono font-bold rounded-2xs uppercase">
                        PARK ROCHE 적용
                      </span>
                      <span className="text-xs text-[#786658] font-medium">(웰니스 / 리커버리 / 수면 / 명상 / 자연 / F&B)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#2C2C2C] font-medium leading-relaxed pt-1">
                      {item.parkRocheApplicability}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#F5F2EB] px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#786658]">
          <div className="flex items-center space-x-1 font-mono">
            <span>Oak Valley & PARK ROCHE Resort Intelligence Case Analysis</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2C2C2C] hover:bg-[#423C36] text-white font-medium rounded-2xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
