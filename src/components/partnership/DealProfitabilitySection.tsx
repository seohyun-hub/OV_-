import React from 'react';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Percent,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  PlusCircle,
  Coins
} from 'lucide-react';

interface DealProfitabilitySectionProps {
  oakValleyDiscountValue: number; // 당사 할인 지원가치 (STEP 1: 정상가 총액 - 제휴가 총액)
  partnerCash: number; // 파트너 현금 유입 (STEP 2)
  partnerInKindRecognized: number; // 파트너 현물 실질 인정가 (STEP 2: 현물 소비자가 × 현물 인정률)
  partnerOtherSupport?: number; // 기타 실제 지원가치 (STEP 2)
  actualVariableCost: number; // 추가 실비용 (식음, 원재료, 인쇄 등)
  onChangeActualVariableCost: (val: number) => void;
  opportunityCost: number; // Opportunity Cost (객실/골프 미판매 손실)
  onChangeOpportunityCost: (val: number) => void;
  expectedAdditionalRevenue: number; // 예상 추가매출 (F&B, 부대시설)
  onChangeExpectedAdditionalRevenue: (val: number) => void;
  additionalOperatingCost: number; // 현장 설치 및 운영비
  onChangeAdditionalOperatingCost: (val: number) => void;
  targetSurplusRate: number; // 목표 추가가치율 (기본 20%)
  onChangeTargetSurplusRate: (val: number) => void;
}

export const DealProfitabilitySection: React.FC<DealProfitabilitySectionProps> = ({
  oakValleyDiscountValue,
  partnerCash,
  partnerInKindRecognized,
  partnerOtherSupport = 0,
  actualVariableCost,
  onChangeActualVariableCost,
  opportunityCost,
  onChangeOpportunityCost,
  expectedAdditionalRevenue,
  onChangeExpectedAdditionalRevenue,
  additionalOperatingCost,
  onChangeAdditionalOperatingCost,
  targetSurplusRate,
  onChangeTargetSurplusRate,
}) => {
  // 1. 당사 부담가치 = 할인 지원가치 + 추가 실비용 + Opportunity Cost + 현장 설치 및 운영비
  const ourBurdenValue = oakValleyDiscountValue + actualVariableCost + opportunityCost + additionalOperatingCost;

  // 2. 파트너 실질 제공가치 = 현금 지원금 + 현물 실질 인정가 + 기타 실제 지원가치
  const partnerEffectiveValue = partnerCash + partnerInKindRecognized + partnerOtherSupport;

  // 3. 예상 순효익 = 파트너 실질 제공가치 + 예상 추가매출 - 당사 부담가치
  const expectedNetBenefit = partnerEffectiveValue + expectedAdditionalRevenue - ourBurdenValue;

  // 4. TARGET 필요가치 = 당사 부담가치 × (1 + 목표 추가가치율 / 100)
  const targetRequiredPartnerValue = Math.round(ourBurdenValue * (1 + targetSurplusRate / 100));

  // Risk & Health Checks
  const warningFlags: string[] = [];
  if (actualVariableCost > partnerCash && partnerCash > 0) {
    warningFlags.push('실제 변동비(식음/제작 실비)가 파트너 현금 지원액을 초과하여 현금 적자 리스크가 있습니다.');
  }
  if (opportunityCost > (partnerCash + expectedAdditionalRevenue) * 0.5 && opportunityCost > 0) {
    warningFlags.push('성수기 객실/골프장 미판매 기회비용 비중이 높아 행사 일정 조율(주중 또는 비수기)을 권장합니다.');
  }
  if (partnerEffectiveValue < ourBurdenValue) {
    warningFlags.push(`현재 파트너 실질 제공가치가 당사 부담가치에 미달합니다. (부족액: ₩${(ourBurdenValue - partnerEffectiveValue).toLocaleString()}원)`);
  }

  // Verdict Badge
  let verdictBadge = {
    title: 'PROFITABLE (수익성 우수)',
    bg: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    desc: '원가 회수 및 목표 추가 가치를 달성하는 유리한 제휴 구조입니다.',
  };

  if (expectedNetBenefit < 0) {
    verdictBadge = {
      title: 'DEFICIT / RE-NEGOTIATE (손실 / 재협상 필요)',
      bg: 'bg-rose-900 text-rose-100 border-rose-700',
      desc: '당사 부담가치 대비 파트너 유입 및 매출 가치가 부족하여 조건 조율이 필요합니다.',
    };
  } else if (partnerEffectiveValue < targetRequiredPartnerValue) {
    verdictBadge = {
      title: 'CONDITIONAL (조건부 충족)',
      bg: 'bg-amber-900 text-amber-100 border-amber-700',
      desc: '당사 원가는 상쇄되나 목표 추가가치율 달성을 위한 일부 현금/현물 추가 확보가 권장됩니다.',
    };
  }

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-emerald-800 text-white font-medium mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-200" />
            <span>STEP 3 &middot; PROFITABILITY ANALYSIS</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            3. 수익성 분석 (Deal Profitability)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            STEP 1 지원가치 및 STEP 2 파트너 제공가치와 수동 입력 실비/기회비용/추가매출을 실시간 대조하여 <strong>당사 관점의 수익성</strong>을 정밀 분석합니다.
          </p>
        </div>

        {/* Target Surplus Rate input control */}
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2.5 flex items-center space-x-3 shrink-0">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-[#736152] uppercase block">
              목표 추가가치율 (Target Rate)
            </span>
            <span className="text-[10px] text-[#8C7A6B]">당사 부담가치 대비 목표 비율</span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={0}
              max={200}
              value={targetSurplusRate}
              onChange={(e) => onChangeTargetSurplusRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-16 px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
            <span className="font-mono text-xs font-bold text-[#736152]">%</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Our Burden vs Partner & Upsell Inflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: 당사 부담가치 구성 항목 (Outflows) */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-5 space-y-4">
          <div className="border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>당사 부담가치 구성 항목</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8C7A6B]">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* 1. 당사 할인 지원가치 (STEP 1 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#2C2C2C]">1. 할인 지원가치</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-2xs font-bold">
                    STEP 1 자동연동
                  </span>
                </div>
                <span className="text-[10px] text-[#8C7A6B]">정상가 총액 - 최종 제휴가 총액</span>
              </div>
              <span className="font-mono font-bold text-[#2C2C2C] text-sm">
                ₩ {oakValleyDiscountValue.toLocaleString()}
              </span>
            </div>

            {/* 2. 추가 실비용 (Out-of-Pocket Cost) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                  <span>2. 추가 실비용 (식음·원재료·인쇄)</span>
                  {actualVariableCost === 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono rounded-2xs">
                      추가 입력 가능
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={100000}
                    value={actualVariableCost || ''}
                    placeholder="0"
                    onChange={(e) => onChangeActualVariableCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">오크밸리가 직접 현금 지출하는 식음료, 원자재, 인쇄물 실비</span>
            </div>

            {/* 3. Opportunity Cost (기회비용) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                  <span>3. Opportunity Cost (기회비용)</span>
                  {opportunityCost === 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono rounded-2xs">
                      추가 입력 가능
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={100000}
                    value={opportunityCost || ''}
                    placeholder="0"
                    onChange={(e) => onChangeOpportunityCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">성수기/주말 객실 및 골프장 일반 판매 불가로 인한 기대 매출 손실</span>
            </div>

            {/* 4. 현장 설치 및 운영비 */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                  <span>4. 현장 설치 및 운영비</span>
                  {additionalOperatingCost === 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono rounded-2xs">
                      추가 입력 가능
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={100000}
                    value={additionalOperatingCost || ''}
                    placeholder="0"
                    onChange={(e) => onChangeAdditionalOperatingCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">임시 부스 설치, 무대 설치, 철거 및 인건비</span>
            </div>

          </div>

          <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-xs font-mono">
            <span className="text-[#2C2C2C] font-bold">당사 부담가치 합계:</span>
            <span className="text-base font-bold text-rose-900">
              ₩ {ourBurdenValue.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* Right Column: 파트너 실질 제공가치 & 예상 추가매출 (Inflows) */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-5 space-y-4">
          <div className="border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>파트너 제공가치 및 부가 매출</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8C7A6B]">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* 1. 파트너 현금 유입 (STEP 2 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#2C2C2C]">1. 현금 지원금</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-2xs font-bold">
                    STEP 2 자동연동
                  </span>
                </div>
                <span className="text-[10px] text-[#8C7A6B]">파트너 제공 현금 스폰서십</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                ₩ {partnerCash.toLocaleString()}원
              </span>
            </div>

            {/* 2. 파트너 현물 실질 인정가 (STEP 2 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#2C2C2C]">2. 현물 실질 인정가</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-2xs font-bold">
                    STEP 2 자동연동
                  </span>
                </div>
                <span className="text-[10px] text-[#8C7A6B]">현물 소비자가 × 현물 인정률</span>
              </div>
              <span className="font-mono font-bold text-[#2C2C2C] text-sm">
                ₩ {partnerInKindRecognized.toLocaleString()}원
              </span>
            </div>

            {/* 3. 기타 실제 지원가치 (STEP 2 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#2C2C2C]">3. 기타 실제 지원가치</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono rounded-2xs font-bold">
                    STEP 2 자동연동
                  </span>
                </div>
                <span className="text-[10px] text-[#8C7A6B]">홍보 지원 및 인력 직접 지원가</span>
              </div>
              <span className="font-mono font-bold text-[#2C2C2C] text-sm">
                ₩ {partnerOtherSupport.toLocaleString()}원
              </span>
            </div>

            {/* 4. 예상 추가매출 (Upsell Revenue) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                  <span>4. 예상 추가매출 (Upsell)</span>
                  {expectedAdditionalRevenue === 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-mono rounded-2xs">
                      추가 입력 가능
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={100000}
                    value={expectedAdditionalRevenue || ''}
                    placeholder="0"
                    onChange={(e) => onChangeExpectedAdditionalRevenue(Math.max(0, Number(e.target.value) || 0))}
                    className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">행사 방문 고객의 리조트 내 현장 F&B, 부대시설 유료 결제 예상액</span>
            </div>

          </div>

          <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-xs font-mono">
            <span className="text-[#2C2C2C] font-bold">파트너 실질 제공가치 합계:</span>
            <span className="text-base font-bold text-emerald-800">
              ₩ {partnerEffectiveValue.toLocaleString()}원
            </span>
          </div>
        </div>

      </div>

      {/* Summary Profitability Banner */}
      <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 rounded-xs border border-[#5C4E43] space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5C4E43] pb-3 gap-3">
          <div>
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase tracking-wider">OAK VALLEY DEAL PROFITABILITY SUMMARY</div>
            <div className="text-lg font-serif font-bold text-white mt-0.5">
              수익성 분석 종합 평가
            </div>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xs border text-xs font-mono font-bold shrink-0 ${verdictBadge.bg}`}>
            {verdictBadge.title}
          </div>
        </div>

        {/* 3 Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">당사 부담가치</div>
            <div className="text-xl font-mono font-bold text-rose-300 mt-1">
              ₩ {ourBurdenValue.toLocaleString()}원
            </div>
            <div className="text-[10px] text-[#C2B7AC] mt-1">
              할인가 ₩{oakValleyDiscountValue.toLocaleString()} + 수동입력 실비/손실
            </div>
          </div>

          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">파트너 실질 제공가치</div>
            <div className="text-xl font-mono font-bold text-emerald-300 mt-1">
              ₩ {partnerEffectiveValue.toLocaleString()}원
            </div>
            <div className="text-[10px] text-[#C2B7AC] mt-1">
              현금 ₩{partnerCash.toLocaleString()} + 현물실질 ₩{partnerInKindRecognized.toLocaleString()} + 기타
            </div>
          </div>

          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">예상 순효익 (Net Benefit)</div>
            <div className={`text-xl font-mono font-bold mt-1 ${expectedNetBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₩ {expectedNetBenefit.toLocaleString()}원
            </div>
            <div className="text-[10px] text-[#C2B7AC] mt-1">
              파트너 실질가 + 추가매출 - 당사 부담가치
            </div>
          </div>

        </div>

        {warningFlags.length > 0 && (
          <div className="bg-amber-950/50 border border-amber-600/40 p-3 rounded-xs text-xs text-amber-200 space-y-1">
            <div className="font-mono font-bold uppercase text-amber-400 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>수익성 리스크 알림</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {warningFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
};
