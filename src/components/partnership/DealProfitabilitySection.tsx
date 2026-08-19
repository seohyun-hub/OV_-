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
  Activity
} from 'lucide-react';

interface DealProfitabilitySectionProps {
  oakValleyDiscountValue: number; // 당사 할인 지원가치 (STEP 1)
  partnerCash: number; // 파트너 현금 (STEP 2)
  partnerInKindRecognized: number; // 파트너 현물 실질 인정가 (STEP 2)
  partnerOtherSupport?: number; // 기타 지원가치 (STEP 2)
  actualVariableCost: number; // 추가 실제비용 (식음, 원재료, 인쇄 등)
  onChangeActualVariableCost: (val: number) => void;
  opportunityCost: number; // Opportunity Cost (객실/골프 미판매 손실)
  onChangeOpportunityCost: (val: number) => void;
  expectedAdditionalRevenue: number; // 예상 추가매출 (F&B, 부대시설)
  onChangeExpectedAdditionalRevenue: (val: number) => void;
  additionalOperatingCost: number; // 추가 제작/운영 인건비
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
  // Total direct costs
  const totalOutflowCosts = actualVariableCost + opportunityCost + additionalOperatingCost;

  // Total partner & secondary inflows
  const partnerEffectiveValue = partnerCash + partnerInKindRecognized + partnerOtherSupport;
  const totalInflowValue = partnerCash + partnerInKindRecognized + partnerOtherSupport + expectedAdditionalRevenue;

  // Expected Net Economic Benefit
  const netEconomicBenefit = totalInflowValue - totalOutflowCosts;

  // Cash Net Benefit (Strict cash only: Cash in + Upsell - Variable costs - Operating costs)
  const netCashBenefit = (partnerCash + expectedAdditionalRevenue) - (actualVariableCost + additionalOperatingCost);

  // Recovery Rate vs Oak Valley Support Value (%)
  const valueRecoveryRate = oakValleyDiscountValue > 0
    ? (partnerEffectiveValue / oakValleyDiscountValue) * 100
    : 0;

  // Target Required Effective Value with target surplus rate
  const targetRequiredPartnerValue = Math.round(oakValleyDiscountValue * (1 + targetSurplusRate / 100));

  // Risk & Health Checks
  const warningFlags: string[] = [];
  if (actualVariableCost > partnerCash && partnerCash > 0) {
    warningFlags.push('실제 변동비(식음/제작 실비)가 파트너 현금 지원액을 초과하여 현금 적자 리스크가 있습니다.');
  }
  if (opportunityCost > (partnerCash + expectedAdditionalRevenue) * 0.5) {
    warningFlags.push('성수기 객실/골프장 미판매 기회비용 비중이 높아 행사 일정 조율(주중 또는 비수기)을 권장합니다.');
  }
  if (valueRecoveryRate < 100) {
    warningFlags.push(`현재 파트너 실질 제공가치가 당사 할인 지원가치에 미달합니다. (회수율 ${valueRecoveryRate.toFixed(1)}%)`);
  }

  // Overall Verdict
  let verdictBadge = {
    title: 'PROFITABLE (수익성 우수)',
    bg: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    desc: '원가 회수 및 목표 추가 가치를 충분히 달성하는 유리한 제휴 조건입니다.',
  };

  if (warningFlags.length >= 2 || netEconomicBenefit < 0) {
    verdictBadge = {
      title: 'CONDITIONAL / RE-NEGOTIATE (재협상 필요)',
      bg: 'bg-rose-900 text-rose-100 border-rose-700',
      desc: '실제 원가 또는 기회비용 대비 이익이 부족하여 현금 상향 또는 자산 조정이 필요합니다.',
    };
  } else if (warningFlags.length === 1 || valueRecoveryRate < 100) {
    verdictBadge = {
      title: 'ACCEPTABLE (수용 가능)',
      bg: 'bg-amber-900 text-amber-100 border-amber-700',
      desc: '기본 손실은 방지되나 목표 추가가치율 달성을 위한 일부 조건 보완이 권장됩니다.',
    };
  }

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-emerald-800 text-white font-medium mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-200" />
            <span>STEP 3 &middot; OAK VALLEY DEAL PROFITABILITY ANALYSIS</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            3. 수익성 분석 (Deal Profitability)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            당사의 할인 지원가치, 실제 투입비용, 기회비용과 파트너의 유입가치를 종합 대조하여 <strong>오크밸리 관점의 경제성</strong>을 분석합니다.
          </p>
        </div>

        {/* Target Surplus Rate input control */}
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2.5 flex items-center space-x-3 shrink-0">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold text-[#736152] uppercase block">
              목표 추가가치율 (Target Surplus)
            </span>
            <span className="text-[10px] text-[#8C7A6B]">당사 지원 대비 목표 이익률</span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={0}
              max={100}
              value={targetSurplusRate}
              onChange={(e) => onChangeTargetSurplusRate(Math.max(0, Number(e.target.value) || 0))}
              className="w-16 px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
            />
            <span className="font-mono text-xs font-bold text-[#736152]">%</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Outflow vs Inflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: 당사 지출 및 원가/손실 항목 (Outflows) */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-5 space-y-4">
          <div className="border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>당사 지원 및 원가 지출 항목 (Costs & Outflows)</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8C7A6B]">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* 1. 당사 할인 지원가치 (STEP 1 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#2C2C2C] block">1. 당사 할인 지원가치</span>
                <span className="text-[10px] text-[#8C7A6B]">STEP 1 산정표에서 자동 연동된 총 할인액</span>
              </div>
              <span className="font-mono font-bold text-amber-900 text-sm">
                ₩ {oakValleyDiscountValue.toLocaleString()}
              </span>
            </div>

            {/* 2. 추가 실제비용 (Out-of-Pocket Cost) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C]">
                  2. 추가 실제비용 (식음·원재료·인쇄 실비)
                </label>
                <input
                  type="number"
                  step={1000000}
                  value={actualVariableCost}
                  onChange={(e) => onChangeActualVariableCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
                />
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">제휴 진행 시 오크밸리가 직접 현금 지출하는 실비 원가</span>
            </div>

            {/* 3. Opportunity Cost (기회비용) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C]">
                  3. 기회비용 (Opportunity Cost)
                </label>
                <input
                  type="number"
                  step={1000000}
                  value={opportunityCost}
                  onChange={(e) => onChangeOpportunityCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
                />
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">성수기/주말 객실 및 골프장 일반 판매 불가로 인한 기대 매출 손실</span>
            </div>

            {/* 4. 추가 제작 및 운영 인건비 */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C]">
                  4. 현장 설치 및 추가 운영비
                </label>
                <input
                  type="number"
                  step={500000}
                  value={additionalOperatingCost}
                  onChange={(e) => onChangeAdditionalOperatingCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
                />
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">임시 부스 설치, 철거, 진행 요원 인건비</span>
            </div>

          </div>

          <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-xs font-mono">
            <span className="text-[#786658] font-bold">실제 투입 원가 및 손실 합계:</span>
            <span className="text-sm font-bold text-rose-800">
              ₩ {totalOutflowCosts.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: 파트너 유입 및 부가 창출 가치 항목 (Inflows) */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-5 space-y-4">
          <div className="border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>파트너 유입 및 창출 가치 항목 (Inflows & Upsell)</span>
            </h3>
            <span className="text-[10px] font-mono text-[#8C7A6B]">단위: 원</span>
          </div>

          <div className="space-y-3 text-xs">
            
            {/* 1. 파트너 현금 지원 (STEP 2 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#2C2C2C] block">1. 파트너 현금 유입</span>
                <span className="text-[10px] text-[#8C7A6B]">STEP 2에서 입력된 현금 스폰서십</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                ₩ {partnerCash.toLocaleString()}
              </span>
            </div>

            {/* 2. 파트너 현물 실질 인정가 (STEP 2 Auto-linked) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#2C2C2C] block">2. 파트너 현물 실질 인정가</span>
                <span className="text-[10px] text-[#8C7A6B]">소비자가에 내부 인정률을 반영한 실질 가치</span>
              </div>
              <span className="font-mono font-bold text-amber-900 text-sm">
                ₩ {partnerInKindRecognized.toLocaleString()}
              </span>
            </div>

            {/* 3. 기타 지원가치 */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#2C2C2C] block">3. 기타 지원가치</span>
                <span className="text-[10px] text-[#8C7A6B]">마케팅 홍보 및 인력 직접 지원가</span>
              </div>
              <span className="font-mono font-bold text-sky-900 text-sm">
                ₩ {partnerOtherSupport.toLocaleString()}
              </span>
            </div>

            {/* 4. 예상 추가매출 (Upsell Revenue) */}
            <div className="bg-white p-3 rounded-xs border border-[#E8E4DC] space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#2C2C2C]">
                  4. 행사 연계 예상 추가매출 (Upsell)
                </label>
                <input
                  type="number"
                  step={1000000}
                  value={expectedAdditionalRevenue}
                  onChange={(e) => onChangeExpectedAdditionalRevenue(Math.max(0, Number(e.target.value) || 0))}
                  className="w-36 px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
                />
              </div>
              <span className="text-[10px] text-[#8C7A6B] block">행사 방문 고객의 리조트 내 현장 F&B, 추가 객실, 렌탈 유료 결제 매출</span>
            </div>

          </div>

          <div className="pt-2 border-t border-[#E8E4DC] flex items-center justify-between text-xs font-mono">
            <span className="text-[#786658] font-bold">총 유입 및 창출 가치 합계:</span>
            <span className="text-sm font-bold text-emerald-800">
              ₩ {totalInflowValue.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      {/* Economic Evaluation Dashboard Bar */}
      <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 rounded-xs border border-[#5C4E43] space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#5C4E43] pb-4 gap-3">
          <div>
            <div className="text-[11px] font-mono text-[#D4C8B8] uppercase">OAK VALLEY DEAL ECONOMICS</div>
            <div className="text-lg font-serif font-bold text-white mt-0.5">
              오크밸리 실질 경제성 종합 판정
            </div>
          </div>

          <div className={`px-3.5 py-1.5 rounded-xs border text-xs font-mono font-bold shrink-0 ${verdictBadge.bg}`}>
            {verdictBadge.title}
          </div>
        </div>

        {/* 4 Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Net Economic Benefit */}
          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">순 경제적 이익 (Net Benefit)</div>
            <div className={`text-xl font-mono font-bold mt-1 ${netEconomicBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₩ {netEconomicBenefit.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#EFECE6] mt-0.5">
              (총 유입 ₩{(totalInflowValue / 10000).toLocaleString()}만 - 실질원가 ₩{(totalOutflowCosts / 10000).toLocaleString()}만)
            </div>
          </div>

          {/* Net Cash Benefit */}
          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">순현금 흐름 (Net Cash)</div>
            <div className={`text-xl font-mono font-bold mt-1 ${netCashBenefit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₩ {netCashBenefit.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#EFECE6] mt-0.5">
              (현금 ₩{partnerCash.toLocaleString()} + 추가매출 - 실비원가)
            </div>
          </div>

          {/* Support Value Recovery Rate */}
          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">지원가치 회수율 (Recovery %)</div>
            <div className={`text-xl font-mono font-bold mt-1 ${valueRecoveryRate >= 100 ? 'text-amber-300' : 'text-rose-300'}`}>
              {valueRecoveryRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#EFECE6] mt-0.5">
              (당사 할인 ₩{(oakValleyDiscountValue / 10000).toLocaleString()}만 대비 파트너 제공가)
            </div>
          </div>

          {/* Target Required Partner Value */}
          <div className="bg-[#3A3A3A] p-4 rounded-xs border border-[#5C4E43]">
            <div className="text-[10px] font-mono text-[#D4C8B8] uppercase">목표 파트너 요구가 (+{targetSurplusRate}%)</div>
            <div className="text-xl font-mono font-bold text-sky-300 mt-1">
              ₩ {targetRequiredPartnerValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#EFECE6] mt-0.5">
              (당사 지원가 + {targetSurplusRate}% 목표 가치 가산액)
            </div>
          </div>

        </div>

        {/* Warning Flags Display */}
        {warningFlags.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-600/40 p-3.5 rounded-xs text-xs text-amber-200 space-y-1">
            <div className="font-mono font-bold uppercase text-amber-400 text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>DEAL RISK & NEGOTIATION NOTICE</span>
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
