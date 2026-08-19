import React, { useState, useEffect } from 'react';
import {
  Calculator,
  RotateCcw,
  Building2,
  CheckCircle2,
  TrendingUp,
  FileText,
  Scale,
  Download,
  Handshake,
  Layers,
  Coins,
  Target
} from 'lucide-react';
import {
  OakValleyBarterAsset,
  PartnerContributionInput,
  CompanyReport,
  PartnerTargetInput,
  DealCalculationRow,
  BarterPackageResult,
  DealProfitabilityResult
} from '../types';
import { DEFAULT_OAK_VALLEY_BARTER_ASSETS } from '../data/defaultBarterAssets';
import { DealCalculationTable } from './partnership/DealCalculationTable';
import { PartnerContributionSection } from './partnership/PartnerContributionSection';
import { DealProfitabilitySection } from './partnership/DealProfitabilitySection';
import { DealRecommendationSection } from './partnership/DealRecommendationSection';
import { ProposalBuilderModal } from './ProposalBuilderModal';
import { exportDealToExcel } from '../utils/excelExporter';

interface PartnershipBuilderViewProps {
  initialCompanyReport?: CompanyReport | null;
  initialProjectInput?: PartnerTargetInput | null;
}

// Initial default calculation rows for real business evaluation
const INITIAL_DEAL_CALCULATION_ROWS: DealCalculationRow[] = [
  {
    id: 'ov-calc-1',
    date: '2026.08.15 ~ 2026.08.16',
    location: '밸리빌리지 잔디광장',
    itemName: '야외 브랜드 팝업 & 체험존 전용 구좌',
    quantityPeriod: '2일간 (주말)',
    quantityNum: 1,
    normalPrice: 5000000,
    appliedPrice: 0,
    discountRate: 100,
    discountAmount: 5000000,
    totalNormal: 5000000,
    totalApplied: 0,
    notes: '행사 메인 팝업 설치 공간 무상 제공',
  },
  {
    id: 'ov-calc-2',
    date: '2026.08.01 ~ 2026.08.31',
    location: '빌리지센터 LED 스크린',
    itemName: '광고 영상 송출 (1일 100회 이상)',
    quantityPeriod: '1개월',
    quantityNum: 1,
    normalPrice: 3000000,
    appliedPrice: 1000000,
    discountRate: 66.7,
    discountAmount: 2000000,
    totalNormal: 3000000,
    totalApplied: 1000000,
    notes: '제휴 특별가 100만원 적용 (할인 200만원)',
  },
  {
    id: 'ov-calc-3',
    date: '2026.08.15 ~ 2026.08.16',
    location: '오크밸리 리조트',
    itemName: '노블 객실 (31평형)',
    quantityPeriod: '1박 5실',
    quantityNum: 5,
    normalPrice: 350000,
    appliedPrice: 150000,
    discountRate: 57.1,
    discountAmount: 1000000,
    totalNormal: 1750000,
    totalApplied: 750000,
    notes: '행사 운영 인력 및 VIP 숙박 지원 (실당 20만원 할인)',
  }
];

export const PartnershipBuilderView: React.FC<PartnershipBuilderViewProps> = ({
  initialCompanyReport,
  initialProjectInput,
}) => {
  // 1. Registered Oak Valley Barter / Rate Card Assets State
  const [registeredAssets, setRegisteredAssets] = useState<OakValleyBarterAsset[]>(() => {
    try {
      const saved = localStorage.getItem('oakvalley_barter_assets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('LocalStorage load error:', e);
    }
    return DEFAULT_OAK_VALLEY_BARTER_ASSETS;
  });

  const handleUpdateAssets = (newAssets: OakValleyBarterAsset[]) => {
    setRegisteredAssets(newAssets);
    try {
      localStorage.setItem('oakvalley_barter_assets_v2', JSON.stringify(newAssets));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  };

  const handleResetAssetsToDefault = () => {
    if (confirm('오크밸리 기본 바터 자산 리스트로 초기화하시겠습니까?')) {
      setRegisteredAssets(DEFAULT_OAK_VALLEY_BARTER_ASSETS);
      localStorage.removeItem('oakvalley_barter_assets_v2');
    }
  };

  // 2. STEP 1: Deal Calculation Rows State
  const [dealRows, setDealRows] = useState<DealCalculationRow[]>(() => {
    try {
      const saved = localStorage.getItem('oakvalley_deal_rows_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Deal rows load error:', e);
    }
    return INITIAL_DEAL_CALCULATION_ROWS;
  });

  const handleUpdateDealRows = (newRows: DealCalculationRow[]) => {
    setDealRows(newRows);
    try {
      localStorage.setItem('oakvalley_deal_rows_v1', JSON.stringify(newRows));
    } catch (e) {
      console.error('Deal rows save error:', e);
    }
  };

  // Step 1 calculated total discount value (Oak Valley Support Value)
  const oakValleyDiscountValue = dealRows.reduce((acc, r) => acc + (r.discountAmount || 0), 0);

  // 3. STEP 2: Partner Contribution Input State
  const [partnerInput, setPartnerInput] = useState<PartnerContributionInput>(() => {
    return {
      companyName: initialCompanyReport?.companyName || initialProjectInput?.projectName || 'Nike Korea',
      cashSupport: initialProjectInput?.desiredCashSponsorship || 10000000,
      productSupport: 6000000,
      inKindRecognitionRate: 70,
      otherSupportValue: 1000000,
      otherSupportDesc: '공식 SNS 홍보 및 참가자 선물 키트 패키징 지원',
    };
  });

  // Sync partner input if initial report changes
  useEffect(() => {
    if (initialCompanyReport?.companyName) {
      setPartnerInput((prev) => ({
        ...prev,
        companyName: initialCompanyReport.companyName,
      }));
    }
  }, [initialCompanyReport]);

  const partnerInKindRecognized = Math.round(
    ((partnerInput.productSupport || 0) * (partnerInput.inKindRecognitionRate ?? 70)) / 100
  );

  // 4. STEP 3: Profitability Parameters State
  const [actualVariableCost, setActualVariableCost] = useState<number>(2000000); // 실비 지출
  const [opportunityCost, setOpportunityCost] = useState<number>(1000000); // 기회비용
  const [additionalOperatingCost, setAdditionalOperatingCost] = useState<number>(500000); // 현장 운영비
  const [expectedAdditionalRevenue, setExpectedAdditionalRevenue] = useState<number>(3000000); // 기대 추가매출
  const [targetSurplusRate, setTargetSurplusRate] = useState<number>(20); // 목표 추가가치율 (기본 20%)

  // Calculation Trigger / Loading state
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const handleCalculateDeal = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 300);
  };

  // 5. Proposal Modal Open State
  const [isProposalModalOpen, setIsProposalModalOpen] = useState<boolean>(false);

  // Excel Export Handler (.xlsx generation)
  const handleExportExcel = async () => {
    const currentPartnerEffective = (partnerInput.cashSupport || 0) + partnerInKindRecognized + (partnerInput.otherSupportValue || 0);
    const minDirectCosts = actualVariableCost + opportunityCost + additionalOperatingCost;
    const minRequiredValue = Math.max(minDirectCosts, Math.round(oakValleyDiscountValue * 0.35));
    const targetRequiredValue = Math.round(oakValleyDiscountValue * (1 + targetSurplusRate / 100));
    const targetInKindRetailEquivalent = (partnerInput.inKindRecognitionRate || 70) > 0
      ? Math.round(targetRequiredValue / ((partnerInput.inKindRecognitionRate || 70) / 100))
      : targetRequiredValue;

    const gap = targetRequiredValue - currentPartnerEffective;
    const gapTenThousand = Math.abs(Math.round(gap / 10000));
    const targetTenThousand = Math.round(targetRequiredValue / 10000);
    const inKindRetailTenThousand = Math.round(targetInKindRetailEquivalent / 10000);

    const formatManWon = (num: number) => {
      if (num >= 10000) {
        const eok = Math.floor(num / 10000);
        const man = num % 10000;
        return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
      }
      return `${num.toLocaleString()}만원`;
    };

    let recText = '';
    if (gap > 0) {
      recText = `현재 당사 지원가치 대비 파트너 제공가치가 ${formatManWon(gapTenThousand)} 부족합니다. 현금 ${formatManWon(targetTenThousand)} 이상 또는 현물 인정률 ${partnerInput.inKindRecognitionRate || 70}% 기준 소비자가 ${formatManWon(inKindRetailTenThousand)} 상당 이상을 기준으로 협의하는 것이 적정합니다.`;
    } else if (gap < 0) {
      recText = `현재 파트너 제공가치가 목표 조건보다 ${formatManWon(gapTenThousand)} 우수합니다. 현금 ${formatManWon(targetTenThousand)} 이상 및 현물 인정률 ${partnerInput.inKindRecognitionRate || 70}% 기준 소비자가 ${formatManWon(inKindRetailTenThousand)} 상당 스폰서십 제안을 유지하여 승인 절차를 진행하는 것이 적정합니다.`;
    } else {
      recText = `현재 파트너 제공가치가 목표 조건과 일치합니다. 현금 ${formatManWon(targetTenThousand)} 및 현물 인정률 ${partnerInput.inKindRecognitionRate || 70}% 기준 소비자가 ${formatManWon(inKindRetailTenThousand)} 상당 협찬으로 계약을 진행하는 것이 적정합니다.`;
    }

    try {
      await exportDealToExcel({
        companyName: partnerInput.companyName || '파트너',
        eventName: initialProjectInput?.projectName || '오크밸리 브랜드 제휴 프로젝트',
        writtenDate: new Date().toISOString().substring(0, 10).replace(/-/g, '.'),
        partnerCash: partnerInput.cashSupport || 0,
        partnerInKindRetail: partnerInput.productSupport || 0,
        inKindRecognitionRate: partnerInput.inKindRecognitionRate || 70,
        partnerInKindRecognized,
        partnerOtherSupport: partnerInput.otherSupportValue || 0,
        dealRows,
        actualVariableCost,
        opportunityCost,
        additionalOperatingCost,
        targetSurplusRate,
        minRequiredValue,
        targetRequiredValue,
        currentPartnerEffective,
        targetInKindRetailEquivalent,
        recommendationText: recText,
      });
    } catch (e) {
      console.error('Excel Export error:', e);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // Convert current deal calculation to BarterPackageResult & ProfitabilityResult for Proposal Builder
  const barterPackageForProposal: BarterPackageResult = {
    companyName: partnerInput.companyName,
    cashSupport: partnerInput.cashSupport || 0,
    productSupport: partnerInput.productSupport || 0,
    inKindRecognitionRate: partnerInput.inKindRecognitionRate || 70,
    partnerRecognizedValue: (partnerInput.cashSupport || 0) + partnerInKindRecognized + (partnerInput.otherSupportValue || 0),
    oakValleyProvidedValue: oakValleyDiscountValue,
    difference: ((partnerInput.cashSupport || 0) + partnerInKindRecognized + (partnerInput.otherSupportValue || 0)) - oakValleyDiscountValue,
    matchRate: oakValleyDiscountValue > 0 ? (((partnerInput.cashSupport || 0) + partnerInKindRecognized) / oakValleyDiscountValue) * 100 : 100,
    items: dealRows.map((r) => ({
      id: r.id,
      itemName: r.itemName,
      location: r.location,
      type: '제휴 지원',
      specification: r.notes || '',
      unitPrice: r.normalPrice,
      quantityPeriod: r.quantityPeriod,
      quantityNum: r.quantityNum,
      providedValue: r.discountAmount,
      notes: r.notes,
    })),
    recommendationReason: `당사 할인 지원가치 ${Math.round(oakValleyDiscountValue / 10000).toLocaleString()}만원 대비 목표 추가가치율 ${targetSurplusRate}%를 적용한 제휴 조건 산정 결과입니다.`,
  };

  const profitabilityForProposal: DealProfitabilityResult = {
    hasSufficientCostData: true,
    partnerCashInflow: partnerInput.cashSupport || 0,
    partnerInKindValue: partnerInKindRecognized,
    oakValleyMediaValue: oakValleyDiscountValue,
    actualVariableCost,
    opportunityCost,
    expectedAdditionalRevenue,
    additionalProductionCost: additionalOperatingCost,
    operatingCost: additionalOperatingCost,
    totalOutflowCost: actualVariableCost + opportunityCost + additionalOperatingCost,
    totalInflowValue: (partnerInput.cashSupport || 0) + partnerInKindRecognized + expectedAdditionalRevenue,
    expectedNetBenefit: ((partnerInput.cashSupport || 0) + partnerInKindRecognized + expectedAdditionalRevenue) - (actualVariableCost + opportunityCost + additionalOperatingCost),
    dealMarginPercent: (partnerInput.cashSupport || 0) > 0 ? (((partnerInput.cashSupport || 0) + expectedAdditionalRevenue - actualVariableCost) / (partnerInput.cashSupport || 0)) * 100 : 0,
    costToValueRatioPercent: oakValleyDiscountValue > 0 ? ((actualVariableCost + opportunityCost) / oakValleyDiscountValue) * 100 : 0,
    evaluationSummary: `순 경제적 이익: ₩${(((partnerInput.cashSupport || 0) + partnerInKindRecognized + expectedAdditionalRevenue) - (actualVariableCost + opportunityCost + additionalOperatingCost)).toLocaleString()}원`,
    warningFlags: [],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 font-sans">
      
      {/* Top Banner: Partnership Deal Builder Header */}
      <div className="bg-[#2C2C2C] border border-[#5C4E43] rounded-xs text-[#FAF8F5] p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 text-[#D4C8B8] font-mono text-xs uppercase tracking-wider font-bold">
              <Handshake className="w-4 h-4 text-[#736152]" />
              <span>OAK VALLEY &middot; PARTNERSHIP DEAL BUILDER</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif-display font-bold text-[#FAF8F5] tracking-tight">
              Partnership Deal Builder
            </h1>
            
            <p className="text-xs font-mono text-[#D4C8B8]">
              제휴 조건 &middot; 수익성 분석 (Deal Profitability & Negotiation Matrix)
            </p>

            <p className="text-sm text-[#EFECE6] leading-relaxed font-light pt-1">
              오크밸리 제공가치와 파트너 지원가치를 비교하여 적정 제휴 조건과 협상 기준을 산정합니다. 
              단순 바터 매칭을 넘어 당사 실비, 기회비용, 목표 가치율을 대조하여 <strong>우리가 얼마를 제공하고, 상대에게 최소 얼마를 받아야 하는가?</strong>를 신속하게 판단합니다.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {initialCompanyReport && (
              <div className="px-3.5 py-2 bg-[#3A3A3A] border border-[#5C4E43] rounded-xs flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#D4C8B8]" />
                <span className="text-xs font-semibold text-[#FAF8F5]">
                  {initialCompanyReport.companyName}
                </span>
              </div>
            )}

            <button
              onClick={handleResetAssetsToDefault}
              className="px-3 py-2 bg-[#3A3A3A] hover:bg-[#4A4A4A] text-[#FAF8F5] font-mono text-xs rounded-xs border border-[#5C4E43] flex items-center space-x-1.5 cursor-pointer transition-colors"
              title="오크밸리 기본 바터 자산 리스트로 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 자산 초기화</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Visual Workflow Steps Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Step 1 Indicator */}
        <div className="bg-[#FAF8F5] border-l-4 border-l-[#736152] border-y border-r border-[#E8E4DC] p-4 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#736152] uppercase">STEP 1</span>
            <span className="text-xs font-mono text-[#8C7A6B]">{dealRows.length}개 산정</span>
          </div>
          <h3 className="text-sm font-serif-display font-bold text-[#2C2C2C] mt-1">
            제휴 산정표
          </h3>
          <p className="text-[11px] text-[#786658] mt-0.5">
            정상가 &middot; 제휴가 &middot; 할인 지원가치
          </p>
        </div>

        {/* Step 2 Indicator */}
        <div className="bg-[#FAF8F5] border-l-4 border-l-[#8C7A6B] border-y border-r border-[#E8E4DC] p-4 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#8C7A6B] uppercase">STEP 2</span>
            <span className="text-xs font-mono text-[#8C7A6B]">현금 &middot; 현물</span>
          </div>
          <h3 className="text-sm font-serif-display font-bold text-[#2C2C2C] mt-1">
            파트너 제공가치
          </h3>
          <p className="text-[11px] text-[#786658] mt-0.5">
            현물 인정률 반영 실질 제공가
          </p>
        </div>

        {/* Step 3 Indicator */}
        <div className="bg-[#FAF8F5] border-l-4 border-l-emerald-700 border-y border-r border-[#E8E4DC] p-4 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase">STEP 3</span>
            <span className="text-xs font-mono text-emerald-700">실비 &middot; 기회비용</span>
          </div>
          <h3 className="text-sm font-serif-display font-bold text-[#2C2C2C] mt-1">
            수익성 분석
          </h3>
          <p className="text-[11px] text-[#786658] mt-0.5">
            오크밸리 실질 경제성 판정
          </p>
        </div>

        {/* Step 4 Indicator */}
        <div className="bg-[#FAF8F5] border-l-4 border-l-[#2C2C2C] border-y border-r border-[#E8E4DC] p-4 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#2C2C2C] uppercase">STEP 4</span>
            <span className="text-xs font-mono text-[#736152] font-bold">3대 기준</span>
          </div>
          <h3 className="text-sm font-serif-display font-bold text-[#2C2C2C] mt-1">
            권장 협의안
          </h3>
          <p className="text-[11px] text-[#786658] mt-0.5">
            MINIMUM &middot; TARGET 협상 기준
          </p>
        </div>

      </div>

      {/* STEP 1 · 제휴 산정표 */}
      <section className="space-y-3">
        <DealCalculationTable
          rows={dealRows}
          onUpdateRows={handleUpdateDealRows}
          registeredAssets={registeredAssets}
          onUpdateAssets={handleUpdateAssets}
          onExportExcel={handleExportExcel}
        />
      </section>

      {/* STEP 2 · 파트너 제공가치 */}
      <section className="space-y-3">
        <PartnerContributionSection
          input={partnerInput}
          onChangeInput={setPartnerInput}
          onCalculateDeal={handleCalculateDeal}
          isCalculating={isCalculating}
        />
      </section>

      {/* STEP 3 · 수익성 분석 */}
      <section className="space-y-3">
        <DealProfitabilitySection
          oakValleyDiscountValue={oakValleyDiscountValue}
          partnerCash={partnerInput.cashSupport || 0}
          partnerInKindRecognized={partnerInKindRecognized}
          partnerOtherSupport={partnerInput.otherSupportValue || 0}
          actualVariableCost={actualVariableCost}
          onChangeActualVariableCost={setActualVariableCost}
          opportunityCost={opportunityCost}
          onChangeOpportunityCost={setOpportunityCost}
          expectedAdditionalRevenue={expectedAdditionalRevenue}
          onChangeExpectedAdditionalRevenue={setExpectedAdditionalRevenue}
          additionalOperatingCost={additionalOperatingCost}
          onChangeAdditionalOperatingCost={setAdditionalOperatingCost}
          targetSurplusRate={targetSurplusRate}
          onChangeTargetSurplusRate={setTargetSurplusRate}
        />
      </section>

      {/* STEP 4 · 권장 협의안 */}
      <section className="space-y-3">
        <DealRecommendationSection
          companyName={partnerInput.companyName}
          oakValleyDiscountValue={oakValleyDiscountValue}
          partnerCash={partnerInput.cashSupport || 0}
          partnerInKindRetail={partnerInput.productSupport || 0}
          inKindRecognitionRate={partnerInput.inKindRecognitionRate || 70}
          partnerInKindRecognized={partnerInKindRecognized}
          partnerOtherSupport={partnerInput.otherSupportValue || 0}
          actualVariableCost={actualVariableCost}
          opportunityCost={opportunityCost}
          additionalOperatingCost={additionalOperatingCost}
          expectedAdditionalRevenue={expectedAdditionalRevenue}
          targetSurplusRate={targetSurplusRate}
          onOpenProposalModal={() => setIsProposalModalOpen(true)}
          onExportTable={handleExportExcel}
        />
      </section>

      {/* Proposal Builder Modal */}
      <ProposalBuilderModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        companyReport={initialCompanyReport || null}
        barterPackage={barterPackageForProposal}
        profitabilityData={profitabilityForProposal}
        projectInput={initialProjectInput || null}
      />

    </div>
  );
};
