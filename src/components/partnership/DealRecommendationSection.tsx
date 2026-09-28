import React, { useState } from 'react';
import {
  ShieldAlert,
  Target,
  FileCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calculator
} from 'lucide-react';

interface DealRecommendationSectionProps {
  companyName: string;
  oakValleyDiscountValue: number; // 당사 할인 지원가치 (STEP 1: 정상가 총액 - 제휴가 총액)
  partnerCash: number; // 파트너 현금 지원금 (STEP 2)
  partnerInKindRetail: number; // 파트너 현물 소비자가 (STEP 2)
  inKindRecognitionRate: number; // 현물 인정률 % (STEP 2)
  partnerInKindRecognized: number; // 현물 실질 인정가 (STEP 2)
  partnerOtherSupport: number; // 기타 실제 지원가치 (STEP 2)
  actualVariableCost: number; // 추가 실비용 (STEP 3 수동입력)
  opportunityCost: number; // Opportunity Cost (STEP 3 수동입력)
  additionalOperatingCost: number; // 현장 설치 및 운영비 (STEP 3 수동입력)
  expectedAdditionalRevenue: number; // 예상 추가매출 (STEP 3 수동입력)
  targetSurplusRate: number; // 목표 추가가치율 % (STEP 3, e.g. 20%)
  onOpenProposalModal: () => void;
  onExportTable: () => void;
}

export const DealRecommendationSection: React.FC<DealRecommendationSectionProps> = ({
  companyName,
  oakValleyDiscountValue,
  partnerCash,
  partnerInKindRetail,
  inKindRecognitionRate,
  partnerInKindRecognized,
  partnerOtherSupport,
  actualVariableCost,
  opportunityCost,
  additionalOperatingCost,
  expectedAdditionalRevenue,
  targetSurplusRate,
  onOpenProposalModal,
  onExportTable,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // 1. 당사 부담가치 = 할인 지원가치 + 추가 실비용 + Opportunity Cost + 현장 설치 및 운영비
  const ourBurdenValue = oakValleyDiscountValue + actualVariableCost + opportunityCost + additionalOperatingCost;

  // 2. 파트너 실질 제공가치 = 현금 지원금 + 현물 실질 인정가 + 기타 실제 지원가치
  const partnerEffectiveValue = partnerCash + partnerInKindRecognized + partnerOtherSupport;

  // 3. 예상 순효익 = 파트너 실질 제공가치 + 예상 추가매출 - 당사 부담가치
  const expectedNetBenefit = partnerEffectiveValue + expectedAdditionalRevenue - ourBurdenValue;

  // 4. MINIMUM 필요가치 = 당사 부담가치
  const minRequiredValue = ourBurdenValue;

  // 5. TARGET 필요가치 = 당사 부담가치 × (1 + 목표 추가가치율 / 100)
  const targetRequiredValue = Math.round(ourBurdenValue * (1 + targetSurplusRate / 100));

  // 6. CURRENT OFFER = 파트너 실질 제공가치
  const currentOffer = partnerEffectiveValue;

  // 7. 부족/초과 금액 = CURRENT OFFER - TARGET 필요가치
  const gapAmount = currentOffer - targetRequiredValue;

  // Helper for formatting Korean Money (e.g. 170만원, 1억 2,000만원)
  const formatKoreanMoney = (num: number): string => {
    if (isNaN(num) || num === 0) return '0원';
    const abs = Math.abs(num);
    const isNeg = num < 0;

    let text = '';
    if (abs >= 100000000) {
      const eok = Math.floor(abs / 100000000);
      const man = Math.round((abs % 100000000) / 10000);
      text = man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    } else if (abs >= 10000) {
      const man = Math.round(abs / 10000);
      text = `${man.toLocaleString()}만원`;
    } else {
      text = `${abs.toLocaleString()}원`;
    }

    return isNeg ? `-${text}` : text;
  };

  // Helper for generating in-kind retail equivalent gap text
  const gapAbs = Math.abs(gapAmount);
  const gapShortfallMan = formatKoreanMoney(gapAbs);
  const inKindRetailShortageEquivalent = inKindRecognitionRate > 0
    ? Math.round(gapAbs / (inKindRecognitionRate / 100))
    : gapAbs;
  const inKindRetailShortageMan = formatKoreanMoney(inKindRetailShortageEquivalent);

  // 8. Generate Executive Recommendation Statement (2-3 lines based 100% on calculations)
  let recommendationText = '';
  if (gapAmount < 0) {
    recommendationText = `현재 파트너 제공가치는 목표 기준 대비 ${gapShortfallMan} 부족합니다. 현금 기준 최소 ${gapShortfallMan} 추가 또는 현물 인정률 ${inKindRecognitionRate}% 기준 약 ${inKindRetailShortageMan} 상당의 추가 현물 확보가 필요합니다.`;
  } else if (gapAmount > 0) {
    recommendationText = `현재 파트너 제공가치는 목표 기준 대비 ${gapShortfallMan} 초과하여 우수합니다. 현금 ${formatKoreanMoney(partnerCash)} 및 현물 인정률 ${inKindRecognitionRate}% 기준 제휴 조건을 승인하여 계약을 진행할 수 있습니다.`;
  } else {
    recommendationText = `현재 파트너 제공가치가 목표 기준과 정확히 일치합니다. 현금 ${formatKoreanMoney(partnerCash)} 및 현물 인정률 ${inKindRecognitionRate}% 기준 협찬 조건으로 제휴 계약 체결을 추천합니다.`;
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(recommendationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-[#736152] text-white font-medium mb-1">
            <Target className="w-3 h-3 text-[#D4C8B8]" />
            <span>STEP 4 &middot; RECOMMENDATION & FINAL SUMMARY</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            4. 권장 협의안 (Executive Recommendation)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            당사 부담가치, 파트너 실질가, 목표 가치 기준을 대조하여 산출된 <strong>최종 결과 및 권장 협의안</strong>입니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportTable}
            className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#D4C8B8] text-[#2C2C2C] border border-[#D4C8B8] rounded-xs text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
            title="산정표 Excel 다운로드 (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-[#736152]" />
            <span>산정표 Excel 다운로드</span>
          </button>

          <button
            onClick={onOpenProposalModal}
            className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#D4C8B8]" />
            <span>이 조건으로 제안서 만들기</span>
          </button>
        </div>
      </div>

      {/* 3 Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: MINIMUM 필요가치 */}
        <div className="bg-[#FAF8F5] border border-rose-200 rounded-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold rounded-xs uppercase">
              MINIMUM 필요가치
            </span>
            <span className="text-[10px] font-mono text-rose-700 font-bold">손실 방지 마지노선</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">최소 필요 파트너 가치</div>
            <div className="text-2xl font-mono font-bold text-rose-900 mt-1">
              ₩ {minRequiredValue.toLocaleString()}원
            </div>
            <div className="text-[11px] text-rose-800 font-medium mt-0.5">
              ({formatKoreanMoney(minRequiredValue)})
            </div>
          </div>

          <p className="text-[11px] text-[#786658] leading-relaxed pt-1 border-t border-rose-100">
            할인 지원가치 및 직접 실비/기회비용을 온전히 상쇄하기 위한 최소 필요 조건 (= 당사 부담가치)
          </p>
        </div>

        {/* Card 2: TARGET 필요가치 */}
        <div className="bg-[#FAF8F5] border-2 border-[#736152] rounded-xs p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-[#736152] text-white font-mono text-[10px] font-bold rounded-xs uppercase">
              TARGET 필요가치
            </span>
            <span className="text-[10px] font-mono text-[#736152] font-bold">목표가치율 +{targetSurplusRate}%</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">목표 파트너 권장 가치</div>
            <div className="text-2xl font-mono font-bold text-[#736152] mt-1">
              ₩ {targetRequiredValue.toLocaleString()}원
            </div>
            <div className="text-[11px] text-[#736152] font-bold mt-0.5">
              ({formatKoreanMoney(targetRequiredValue)})
            </div>
          </div>

          <p className="text-[11px] text-[#5C4E43] leading-relaxed pt-1 border-t border-[#D4C8B8]">
            당사 부담가치 ₩{ourBurdenValue.toLocaleString()}원에 목표 추가가치율 {targetSurplusRate}%를 반영한 권장 협상 목표
          </p>
        </div>

        {/* Card 3: CURRENT OFFER */}
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold rounded-xs uppercase">
              CURRENT OFFER
            </span>
            <span className="text-[10px] font-mono text-[#8C7A6B] font-bold">현재 파트너 실질가</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">파트너 실질 제공가치</div>
            <div className="text-2xl font-mono font-bold text-[#2C2C2C] mt-1">
              ₩ {currentOffer.toLocaleString()}원
            </div>
            <div className="text-[11px] text-[#2C2C2C] font-bold mt-0.5">
              ({formatKoreanMoney(currentOffer)})
            </div>
          </div>

          <div className="pt-1 border-t border-[#E8E4DC] text-[11px] leading-relaxed">
            {gapAmount >= 0 ? (
              <span className="text-emerald-800 font-bold">
                ✓ TARGET 대비 {formatKoreanMoney(gapAmount)} 초과 달성
              </span>
            ) : (
              <span className="text-rose-700 font-bold">
                ✗ TARGET 대비 {formatKoreanMoney(Math.abs(gapAmount))} 부족
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Required Final Summary Table Display Box */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-4 h-4 text-[#736152]" />
            <h3 className="text-sm font-bold font-serif text-[#2C2C2C]">
              수익성 및 협상 지표 최종 요약 (Profitability Summary)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8C7A6B]">수식 기반 자동 계산 결과</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          
          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">당사 부담가치</span>
            <span className="text-sm font-bold text-rose-900 mt-1 block">
              ₩ {ourBurdenValue.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(ourBurdenValue)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">파트너 실질 제공가치</span>
            <span className="text-sm font-bold text-emerald-800 mt-1 block">
              ₩ {partnerEffectiveValue.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(partnerEffectiveValue)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">예상 추가매출</span>
            <span className="text-sm font-bold text-[#2C2C2C] mt-1 block">
              ₩ {expectedAdditionalRevenue.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(expectedAdditionalRevenue)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">예상 순효익</span>
            <span className={`text-sm font-bold mt-1 block ${expectedNetBenefit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              ₩ {expectedNetBenefit.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(expectedNetBenefit)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">MINIMUM 필요가치</span>
            <span className="text-sm font-bold text-rose-900 mt-1 block">
              ₩ {minRequiredValue.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(minRequiredValue)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">TARGET 필요가치</span>
            <span className="text-sm font-bold text-[#736152] mt-1 block">
              ₩ {targetRequiredValue.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(targetRequiredValue)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">CURRENT OFFER</span>
            <span className="text-sm font-bold text-[#2C2C2C] mt-1 block">
              ₩ {currentOffer.toLocaleString()}원
            </span>
            <span className="text-[10px] text-[#8C7A6B]">({formatKoreanMoney(currentOffer)})</span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC]">
            <span className="text-[10px] text-[#8C7A6B] block">부족 / 초과 금액</span>
            <span className={`text-sm font-bold mt-1 block ${gapAmount >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {gapAmount >= 0 ? '+' : ''}₩ {gapAmount.toLocaleString()}원
            </span>
            <span className="text-[10px] font-bold">{gapAmount >= 0 ? '초과' : '부족'} ({formatKoreanMoney(gapAmount)})</span>
          </div>

        </div>
      </div>

      {/* Executive Recommendation Box */}
      <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 rounded-xs border border-[#5C4E43] space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#5C4E43] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold tracking-wider text-[#D4C8B8]">
              최종 제휴 협상 권장안
            </span>
          </div>

          <button
            onClick={handleCopyText}
            className="px-3 py-1 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#FAF8F5] rounded-xs text-xs font-mono flex items-center space-x-1 cursor-pointer transition-colors border border-[#5C4E43]"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#D4C8B8]" />}
            <span>{copied ? '복사됨' : '협의안 텍스트 복사'}</span>
          </button>
        </div>

        {/* The Exact Calculated Recommendation Statement */}
        <div className="bg-[#1F1F1F] p-4 rounded-xs border border-[#5C4E43] text-sm leading-relaxed text-[#FAF8F5] font-normal">
          {recommendationText}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#D4C8B8] gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>수치 조작 없는 100% 코드 기반 수식 산출 결과 &middot; {companyName || '파트너'} 미팅 즉시 활용 가능</span>
          </div>

          <button
            onClick={onOpenProposalModal}
            className="px-6 py-2.5 bg-[#736152] hover:bg-[#8C7A6B] text-white font-bold rounded-xs transition-colors shadow-xs cursor-pointer flex items-center space-x-2 shrink-0"
          >
            <FileText className="w-4 h-4 text-[#D4C8B8]" />
            <span>제휴 제안서 작성 (Proposal Builder) &rarr;</span>
          </button>
        </div>

      </div>

    </div>
  );
};
