import React, { useState } from 'react';
import {
  Calculator,
  PieChart,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  PartnerConditionLineItem,
  BarterPlan,
  BarterCalculationResult,
} from '../../types';

interface BarterResultDisplayProps {
  selectedPlan: BarterPlan | undefined;
  lineItems: PartnerConditionLineItem[];
  partnerName: string;
  projectName: string;
}

export const BarterResultDisplay: React.FC<BarterResultDisplayProps> = ({
  selectedPlan,
  lineItems,
  partnerName,
  projectName,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'comparison' | 'guaranteed' | 'profitability' | 'recommendation'
  >('summary');

  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [result, setResult] = useState<BarterCalculationResult | null>(null);

  // Perform Calculation on selected barter plan items only
  const handleCalculate = () => {
    if (!selectedPlan) return;

    // Filter only items included in selected plan and active
    const planItems = lineItems.filter(
      (item) => item.isActive && selectedPlan.includedItemIds.includes(item.id)
    );

    const iparkItems = planItems.filter((i) => i.provider === 'IPARK리조트');
    const partnerItems = planItems.filter((i) => i.provider === '파트너');

    const iparkTotalValue = iparkItems.reduce((acc, i) => acc + i.totalAmount, 0);
    const partnerTotalValue = partnerItems.reduce((acc, i) => acc + i.totalAmount, 0);

    const guaranteedRevenue = planItems
      .filter((i) => i.category === '보장매출')
      .reduce((acc, i) => acc + i.totalAmount, 0);

    const expectedCosts = planItems.reduce(
      (acc, i) => acc + i.costPrice * i.quantityNum,
      0
    );

    // Cash Inflows to Resort = Partner Cash + Guaranteed Revenue
    const partnerCash = partnerItems
      .filter((i) => i.category === '현금')
      .reduce((acc, i) => acc + i.totalAmount, 0);

    const expectedProfit = partnerCash + guaranteedRevenue - expectedCosts;
    const valueDifference = partnerTotalValue - iparkTotalValue;

    // Construct Result Object
    const calcResult: any = {
      planName: selectedPlan.planName,
      partnerName,
      projectName,
      iparkTotalValue,
      partnerTotalValue,
      guaranteedRevenue,
      expectedCosts,
      expectedProfit,
      valueDifference,
      iparkItems,
      partnerItems,
      summaryNotes: `${partnerName}와의 ${projectName} [${selectedPlan.planName}] 협의안은 IPARK리조트가 ${iparkTotalValue.toLocaleString()}원 상당의 공간/숙박/홍보 자산을 제공하고, 파트너사가 ${partnerTotalValue.toLocaleString()}원 상당의 현금/현물/마케팅/보장매출을 제공하는 조건입니다.`,
      valueComparisonSummary:
        valueDifference >= 0
          ? `파트너 제공가치(${partnerTotalValue.toLocaleString()}원)가 IPARK리조트 지원가치(${iparkTotalValue.toLocaleString()}원)보다 ${valueDifference.toLocaleString()}원 높아 우량한 가치 교환 비율을 보입니다.`
          : `IPARK리조트 지원가치(${iparkTotalValue.toLocaleString()}원)가 파트너 제공가치(${partnerTotalValue.toLocaleString()}원)보다 ${Math.abs(valueDifference).toLocaleString()}원 높으므로 현금 지원이나 협찬 현물 추가 확보를 권장합니다.`,
      guaranteedRevenueDetails:
        guaranteedRevenue > 0
          ? `총 ${guaranteedRevenue.toLocaleString()}원의 객실 및 상품 보장매출이 설정되어 리조트 가동률 및 매출 기여가 안정적입니다.`
          : `설정된 보장매출 금액이 0원입니다. 비수기 객실 예약 보장 조건 추가를 고려해보세요.`,
      profitabilityDetails: `예상 수입(현금 ${partnerCash.toLocaleString()}원 + 보장매출 ${guaranteedRevenue.toLocaleString()}원) 대비 원가(${expectedCosts.toLocaleString()}원) 차감 시 예상 순손익은 ${expectedProfit.toLocaleString()}원입니다.`,
      negotiationRecommendation:
        valueDifference >= 0
          ? `[승인 권장] 파트너 제공가치가 지원 가치를 상회하며, 마진율이 양호한 최적 협의안입니다.`
          : `[협상 조정 필요] 지원 가치 차액 ${Math.abs(valueDifference).toLocaleString()}원에 대해 추가 협찬 현물 또는 보장매출 확약을 유도하세요.`,
    };

    setResult(calcResult);
    setHasCalculated(true);
  };

  // Initial Calculation Run
  React.useEffect(() => {
    handleCalculate();
  }, [selectedPlan, lineItems]);

  if (!result) return null;

  return (
    <div className="bg-white border border-[#E5DDD3] rounded-2xl p-5 shadow-xs mb-8 font-sans">
      {/* Top Banner with Calculation Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-600 text-white font-extrabold text-[11px] rounded-md">
              {selectedPlan?.planName}
            </span>
            <span className="text-xs font-bold text-[#736152]">
              {partnerName} · {projectName}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#2C2C2C] mt-1 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-700" />
            선택 협의안 결과 계산 및 평가
          </h2>
        </div>

        <button
          onClick={handleCalculate}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>결과 계산하기</span>
        </button>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 my-5">
        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            IPARK리조트 제공가치
          </span>
          <span className="text-base font-black text-amber-900 mt-1 block font-mono">
            {result.iparkTotalValue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            파트너 제공가치
          </span>
          <span className="text-base font-black text-indigo-900 mt-1 block font-mono">
            {result.partnerTotalValue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            보장매출
          </span>
          <span className="text-base font-black text-emerald-900 mt-1 block font-mono">
            {result.guaranteedRevenue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            예상 비용(원가)
          </span>
          <span className="text-base font-black text-rose-900 mt-1 block font-mono">
            {result.expectedCosts.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            예상 손익
          </span>
          <span
            className={`text-base font-black mt-1 block font-mono ${
              result.expectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {result.expectedProfit.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
          <span className="text-[11px] font-bold text-[#736152] block">
            교환가치 차이
          </span>
          <span
            className={`text-base font-black mt-1 block font-mono ${
              result.valueDifference >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {result.valueDifference >= 0 ? '+' : ''}
            {result.valueDifference.toLocaleString()} 원
          </span>
        </div>
      </div>

      {/* 5 Tabs Navigation */}
      <div className="flex border-b border-[#E5DDD3] mb-5 overflow-x-auto font-extrabold text-xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'summary'
              ? 'border-amber-700 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-[#736152] hover:text-[#2C2C2C]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. 조건 요약</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'comparison'
              ? 'border-amber-700 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-[#736152] hover:text-[#2C2C2C]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>2. 가치 비교</span>
        </button>

        <button
          onClick={() => setActiveTab('guaranteed')}
          className={`px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'guaranteed'
              ? 'border-amber-700 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-[#736152] hover:text-[#2C2C2C]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. 보장매출</span>
        </button>

        <button
          onClick={() => setActiveTab('profitability')}
          className={`px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'profitability'
              ? 'border-amber-700 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-[#736152] hover:text-[#2C2C2C]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>4. 손익</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendation')}
          className={`px-4 py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'recommendation'
              ? 'border-amber-700 text-amber-900 bg-amber-50/50'
              : 'border-transparent text-[#736152] hover:text-[#2C2C2C]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>5. 협상 참고안</span>
        </button>
      </div>

      {/* Tab Content 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-xs text-[#2C2C2C] leading-relaxed">
            <h4 className="font-extrabold text-sm text-amber-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              [{result.planName}] 핵심 조건 요약
            </h4>
            <p className="text-[#2C2C2C] font-medium">{result.summaryNotes}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IPARK Provided List */}
            <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl">
              <h5 className="font-extrabold text-xs text-amber-900 mb-3 flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <span>IPARK리조트 제공 항목 ({result.iparkItems.length}개)</span>
                <span className="font-mono">{result.iparkTotalValue.toLocaleString()}원</span>
              </h5>
              <ul className="space-y-2 text-xs">
                {result.iparkItems.length === 0 ? (
                  <li className="text-[#8C7A6B]">포함된 항목이 없습니다.</li>
                ) : (
                  result.iparkItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-[#2C2C2C]">
                      <span>
                        • {item.itemName} ({item.quantityPeriod})
                      </span>
                      <span className="font-mono font-bold">{item.totalAmount.toLocaleString()}원</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Partner Provided List */}
            <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl">
              <h5 className="font-extrabold text-xs text-indigo-900 mb-3 flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <span>파트너 제공 항목 ({result.partnerItems.length}개)</span>
                <span className="font-mono">{result.partnerTotalValue.toLocaleString()}원</span>
              </h5>
              <ul className="space-y-2 text-xs">
                {result.partnerItems.length === 0 ? (
                  <li className="text-[#8C7A6B]">포함된 항목이 없습니다.</li>
                ) : (
                  result.partnerItems.map((item) => (
                    <li key={item.id} className="flex justify-between items-center text-[#2C2C2C]">
                      <span>
                        • {item.itemName} ({item.quantityPeriod})
                      </span>
                      <span className="font-mono font-bold">{item.totalAmount.toLocaleString()}원</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: VALUE COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl">
            <h4 className="font-extrabold text-xs text-[#2C2C2C] mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-700" />
              가치 비교 평가
            </h4>
            <p className="text-xs text-[#2C2C2C] font-medium leading-relaxed">
              {result.valueComparisonSummary}
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E5DDD3] rounded-xl">
            <h5 className="text-xs font-bold text-[#736152] mb-3">
              제공 가치 서열 및 균형 그래프
            </h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1">
                  <span className="text-amber-900">IPARK리조트 제공가치</span>
                  <span className="font-mono">{result.iparkTotalValue.toLocaleString()}원</span>
                </div>
                <div className="w-full h-3 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E5DDD3]">
                  <div
                    className="h-full bg-amber-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (result.iparkTotalValue /
                          Math.max(1, result.iparkTotalValue + result.partnerTotalValue)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-extrabold mb-1">
                  <span className="text-indigo-900">파트너 제공가치</span>
                  <span className="font-mono">{result.partnerTotalValue.toLocaleString()}원</span>
                </div>
                <div className="w-full h-3 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E5DDD3]">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (result.partnerTotalValue /
                          Math.max(1, result.iparkTotalValue + result.partnerTotalValue)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: GUARANTEED REVENUE */}
      {activeTab === 'guaranteed' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-950">
            <h4 className="font-extrabold text-xs mb-1 flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              보장매출 현황
            </h4>
            <p className="text-xs font-medium">{result.guaranteedRevenueDetails}</p>
          </div>

          <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl">
            <span className="text-xs font-bold text-[#736152] block mb-2">
              포함된 보장매출 항목 목록
            </span>
            <ul className="space-y-2 text-xs">
              {lineItems
                .filter(
                  (i) =>
                    i.isActive &&
                    selectedPlan?.includedItemIds.includes(i.id) &&
                    i.category === '보장매출'
                )
                .map((i) => (
                  <li
                    key={i.id}
                    className="flex justify-between items-center p-2 bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg"
                  >
                    <span className="font-extrabold text-[#2C2C2C]">
                      {i.itemName} ({i.quantityPeriod})
                    </span>
                    <span className="font-mono font-black text-emerald-800">
                      {i.totalAmount.toLocaleString()}원
                    </span>
                  </li>
                ))}
              {lineItems.filter(
                (i) =>
                  i.isActive &&
                  selectedPlan?.includedItemIds.includes(i.id) &&
                  i.category === '보장매출'
              ).length === 0 && (
                <li className="text-xs text-[#8C7A6B]">
                  현재 협의안에 등록된 보장매출 항목이 없습니다.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content 4: PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-[#E5DDD3] rounded-xl">
            <h4 className="font-extrabold text-xs text-[#2C2C2C] mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              손익 세부 명세
            </h4>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between p-2 bg-[#FAF8F5] rounded-lg">
                <span>파트너 현금 직접 지원</span>
                <span className="font-mono font-bold">
                  {result.partnerItems
                    .filter((i) => i.category === '현금')
                    .reduce((sum, i) => sum + i.totalAmount, 0)
                    .toLocaleString()}
                  원
                </span>
              </div>

              <div className="flex justify-between p-2 bg-[#FAF8F5] rounded-lg">
                <span>계약 보장매출</span>
                <span className="font-mono font-bold">
                  {result.guaranteedRevenue.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between p-2 bg-rose-50 text-rose-900 rounded-lg">
                <span>예상 원가 (제공자산 원가 + 직접 비용)</span>
                <span className="font-mono font-bold text-rose-700">
                  - {result.expectedCosts.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between p-3 bg-amber-50 border border-amber-300 rounded-lg text-sm font-black text-amber-950 mt-2">
                <span>예상 순손익</span>
                <span className="font-mono">{result.expectedProfit.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 5: RECOMMENDATION */}
      {activeTab === 'recommendation' && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl">
            <h4 className="font-extrabold text-sm text-amber-950 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-700" />
              협상 전략 및 최종 가이드
            </h4>
            <p className="text-xs font-bold text-[#2C2C2C] leading-relaxed">
              {result.negotiationRecommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
