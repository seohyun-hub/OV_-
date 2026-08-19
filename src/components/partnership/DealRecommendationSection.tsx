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
  Scale
} from 'lucide-react';
import { DealNegotiationCriteria } from '../../types';

interface DealRecommendationSectionProps {
  companyName: string;
  oakValleyDiscountValue: number; // 당사 할인 지원가치 (STEP 1)
  partnerCash: number; // 파트너 현금 (STEP 2)
  partnerInKindRetail: number; // 파트너 현물 소비자가 (STEP 2)
  inKindRecognitionRate: number; // 현물 인정률 (STEP 2)
  partnerInKindRecognized: number; // 현물 실질 인정가 (STEP 2)
  partnerOtherSupport: number; // 기타 지원가치 (STEP 2)
  actualVariableCost: number; // 추가 실제비용 (STEP 3)
  opportunityCost: number; // 기회비용 (STEP 3)
  additionalOperatingCost: number; // 추가 제작/운영비 (STEP 3)
  expectedAdditionalRevenue: number; // 예상 추가매출 (STEP 3)
  targetSurplusRate: number; // 목표 추가가치율 (STEP 3, e.g. 20%)
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

  // 1. Current Partner Effective Value
  const currentPartnerEffective = partnerCash + partnerInKindRecognized + partnerOtherSupport;

  // 2. MINIMUM (손실 방지를 위한 최소 조건)
  // 최소 조건 = 실제 지출 원가 + 기회비용 + 운영비 (원가 100% 회수선)
  // 단, 당사 할인 지원가치가 존재할 경우 최소 30%의 원가 상당액 회수를 최소선으로 설정
  const minDirectCosts = actualVariableCost + opportunityCost + additionalOperatingCost;
  const minRequiredValue = Math.max(minDirectCosts, Math.round(oakValleyDiscountValue * 0.35));
  const minInKindRetailEquivalent = inKindRecognitionRate > 0
    ? Math.round(minRequiredValue / (inKindRecognitionRate / 100))
    : minRequiredValue;

  // 3. TARGET (목표 수익을 반영한 권장 조건)
  // 권장 조건 = 당사 총 할인 지원가치 * (1 + targetSurplusRate / 100)
  const targetRequiredValue = Math.round(oakValleyDiscountValue * (1 + targetSurplusRate / 100));
  const targetInKindRetailEquivalent = inKindRecognitionRate > 0
    ? Math.round(targetRequiredValue / (inKindRecognitionRate / 100))
    : targetRequiredValue;

  // 4. Achievement & Status vs Criteria
  const isMeetingMinimum = currentPartnerEffective >= minRequiredValue;
  const achievementRateVsTarget = targetRequiredValue > 0
    ? (currentPartnerEffective / targetRequiredValue) * 100
    : 100;
  const gapToTarget = targetRequiredValue - currentPartnerEffective;

  // 5. Code-calculated Recommendation Summary Text (Strictly deterministic math figures)
  const discountInTenThousand = Math.round(oakValleyDiscountValue / 10000);
  const targetInTenThousand = Math.round(targetRequiredValue / 10000);
  const inKindRetailInTenThousand = Math.round(targetInKindRetailEquivalent / 10000);
  const minInTenThousand = Math.round(minRequiredValue / 10000);

  const formatManWon = (num: number) => {
    if (num >= 10000) {
      const eok = Math.floor(num / 10000);
      const man = num % 10000;
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    return `${num.toLocaleString()}만원`;
  };

  const calculatedSummary = `현재 당사 지원가치는 ${formatManWon(discountInTenThousand)}이며, 목표 추가가치율 ${targetSurplusRate}% 적용 시 파트너 실질 제공가치는 최소 ${formatManWon(targetInTenThousand)}(현물 인정률 ${inKindRecognitionRate}% 기준 소비자가 약 ${formatManWon(inKindRetailInTenThousand)} 상당 또는 현금 ${formatManWon(targetInTenThousand)} 이상)을 기준으로 협의하는 것이 적정합니다. 손실 방지를 위한 절대 최소 한도는 ${formatManWon(minInTenThousand)}입니다.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(calculatedSummary);
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
            <span>STEP 4 &middot; DEAL NEGOTIATION BENCHMARKS & RECOMMENDATION</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            4. 권장 협의안 (Negotiation Standards)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            손실 방지 최소 조건(MINIMUM), 목표 수익 권장 조건(TARGET), 현재 파트너 제안(CURRENT OFFER)의 3대 기준을 비교하고 실행 가능한 협의안을 제시합니다.
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

      {/* 3 Criteria Benchmark Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: MINIMUM (최소 조건) */}
        <div className="bg-[#FAF8F5] border border-rose-200 rounded-xs p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold rounded-xs uppercase">
              MINIMUM
            </span>
            <span className="text-[10px] font-mono text-rose-700 font-bold">손실 방지 최소 조건</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">최소 필요 파트너 실질가</div>
            <div className="text-2xl font-mono font-bold text-rose-900 mt-1">
              ₩ {minRequiredValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C7A6B] mt-0.5">
              (약 {formatManWon(minInTenThousand)})
            </div>
          </div>

          <div className="bg-white p-3 rounded-xs border border-rose-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-[#66584C]">
              <span>현금 기준 최소 요구:</span>
              <strong className="font-mono text-rose-900">₩{minRequiredValue.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-[#66584C]">
              <span>현물 소비자가 상당액 ({inKindRecognitionRate}% 인정):</span>
              <strong className="font-mono text-rose-900">약 ₩{minInKindRetailEquivalent.toLocaleString()}</strong>
            </div>
          </div>

          <p className="text-[11px] text-[#786658] leading-relaxed">
            당사의 실제 변동비(식음/인쇄 실비) 및 기회비용을 온전히 상쇄하여 <strong>현금 순손실을 방지</strong>하기 위한 마지노선 조건입니다.
          </p>
        </div>

        {/* Card 2: TARGET (권장 조건) */}
        <div className="bg-[#FAF8F5] border-2 border-[#736152] rounded-xs p-5 space-y-4 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-[#736152] text-white font-mono text-[10px] font-bold rounded-xs uppercase">
              TARGET (권장)
            </span>
            <span className="text-[10px] font-mono text-[#736152] font-bold">목표 수익 반영 조건 (+{targetSurplusRate}%)</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">목표 파트너 권장 실질가</div>
            <div className="text-2xl font-mono font-bold text-[#736152] mt-1">
              ₩ {targetRequiredValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C7A6B] mt-0.5">
              (약 {formatManWon(targetInTenThousand)})
            </div>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#D4C8B8] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#2C2C2C]">
              <span>현금 기준 권장 제안:</span>
              <strong className="font-mono text-[#736152]">₩{targetRequiredValue.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-[#2C2C2C]">
              <span>현물 소비자가 상당액 ({inKindRecognitionRate}% 인정):</span>
              <strong className="font-mono text-[#736152]">약 ₩{targetInKindRetailEquivalent.toLocaleString()}</strong>
            </div>
          </div>

          <p className="text-[11px] text-[#5C4E43] leading-relaxed">
            당사 지원가치({formatManWon(discountInTenThousand)}) 대비 <strong>목표 가치율 {targetSurplusRate}%를 달성</strong>하여 양사 윈-윈(Win-Win) 구조를 만드는 최적의 협상 목표입니다.
          </p>
        </div>

        {/* Card 3: CURRENT OFFER (현재 파트너 제안) */}
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-5 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] font-bold rounded-xs uppercase">
              CURRENT OFFER
            </span>
            <span className="text-[10px] font-mono text-[#8C7A6B] font-bold">현재 파트너 제안가</span>
          </div>

          <div>
            <div className="text-xs text-[#786658]">파트너 실질 제공가치</div>
            <div className="text-2xl font-mono font-bold text-[#2C2C2C] mt-1">
              ₩ {currentPartnerEffective.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#8C7A6B] mt-0.5">
              (현금 ₩{partnerCash.toLocaleString()} + 현물실질 ₩{partnerInKindRecognized.toLocaleString()})
            </div>
          </div>

          <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#66584C]">
              <span>최소 조건 충족 여부:</span>
              <strong className={`font-mono ${isMeetingMinimum ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isMeetingMinimum ? '✓ 충족 (PASS)' : '✗ 미달 (손실 리스크)'}
              </strong>
            </div>
            <div className="flex justify-between text-[#66584C]">
              <span>권장 목표 달성률:</span>
              <strong className="font-mono text-[#2C2C2C]">{achievementRateVsTarget.toFixed(1)}%</strong>
            </div>
          </div>

          <div className="text-[11px] text-[#786658] leading-relaxed">
            {gapToTarget <= 0 ? (
              <span className="text-emerald-800 font-semibold">
                ✓ 목표 조건을 ₩{(-gapToTarget).toLocaleString()}원 초과 달성하여 우수한 수익성을 제공합니다.
              </span>
            ) : (
              <span className="text-amber-900">
                목표 가치 달성을 위해 파트너로부터 <strong>₩{gapToTarget.toLocaleString()}원</strong> 상당의 추가 현금/현물 협찬을 확보하는 협의가 권장됩니다.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Final Synthesized Recommendation Box (Calculated Text) */}
      <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 rounded-xs border border-[#5C4E43] space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#5C4E43] pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4C8B8]">
              EXECUTIVE NEGOTIATION RECOMMENDATION (최종 권장 협의안)
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
        <div className="bg-[#1F1F1F] p-4 rounded-xs border border-[#5C4E43] text-sm leading-relaxed text-[#FAF8F5] font-light">
          {calculatedSummary}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#D4C8B8] gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>수치 조작 없는 100% 코드 기반 산출식 적용 &middot; {companyName || '파트너'} 협상 미팅 시 즉시 활용 가능</span>
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
