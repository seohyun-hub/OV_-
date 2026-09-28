import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Lightbulb,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import {
  PackageOption,
  SelectedMediaItem,
  RateCardItem,
  PartnerInput,
  BarterRecognitionRates,
} from '../../types';
import { exportPartnershipProposalToExcel } from '../../utils/excelExporter';

interface PackageComparisonProps {
  packages: PackageOption[];
  rateCard: RateCardItem[];
  partnerInput: PartnerInput;
  recognitionRates: BarterRecognitionRates;
  onUpdatePackage: (pkgIndex: number, updatedPkg: PackageOption) => void;
}

export const PackageComparison: React.FC<PackageComparisonProps> = ({
  packages,
  rateCard,
  partnerInput,
  recognitionRates,
  onUpdatePackage,
}) => {
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(1); // Default to BALANCED (1)
  const [addingMediaModalOpen, setAddingMediaModalOpen] = useState<boolean>(false);

  const activePkg = packages[selectedPkgIndex] || packages[0];

  const fmtWon = (num: number) => `${Math.round(num).toLocaleString()}원`;
  const fmtPct = (num: number) => `${num.toFixed(1)}%`;

  // Recalculate package metrics after user edits media items
  const recalculatePackageMetrics = (mediaItems: SelectedMediaItem[]): PackageOption => {
    const oakValleyMediaValue = mediaItems.reduce((acc, it) => acc + (it.providedValue || 0), 0);
    const partnerAdjustedValue = activePkg.partnerAdjustedValue;
    const difference = oakValleyMediaValue - partnerAdjustedValue;
    const valueRatio = partnerAdjustedValue > 0 ? (oakValleyMediaValue / partnerAdjustedValue) * 100 : 100;
    const estimatedActualCost = mediaItems.reduce((acc, it) => acc + (it.requiredCost || 0), 0);

    const hasActualCostData = mediaItems.some((it) => it.requiredCost > 0);
    const warnings: string[] = [];

    if (valueRatio > 130) {
      warnings.push(`Partner Value 대비 제공가치가 높습니다. (Value Ratio: ${valueRatio.toFixed(1)}%)`);
    }
    const totalPartnerNominal =
      partnerInput.cashInvestment +
      partnerInput.productSponsorship +
      partnerInput.marketingSupport +
      partnerInput.otherSupport;

    if (totalPartnerNominal > 0 && partnerInput.productSponsorship / totalPartnerNominal > 0.6) {
      warnings.push(`현물 협찬 비중이 높습니다. (전체 파트너 제공금액의 ${Math.round((partnerInput.productSponsorship / totalPartnerNominal) * 100)}%가 현물)`);
    }
    if (partnerInput.cashInvestment > 0 && estimatedActualCost > partnerInput.cashInvestment) {
      warnings.push(`실비 부담(${Math.round(estimatedActualCost / 10000)}만원)이 파트너 현금 투자금(${Math.round(partnerInput.cashInvestment / 10000)}만원)을 초과합니다.`);
    }
    if (mediaItems.some((it) => it.category === 'Golf')) {
      warnings.push(`골프장 관련 매체 조합으로 성수기 Opportunity Cost 검토가 필요합니다.`);
    }

    return {
      ...activePkg,
      oakValleyMediaValue,
      difference,
      valueRatio,
      estimatedActualCost,
      mediaItems,
      profitabilityAnalysis: {
        ...activePkg.profitabilityAnalysis,
        valueRatio,
        hasActualCostData,
        warnings,
      },
    };
  };

  // Modify Media Item Quantity
  const handleQuantityChange = (itemIdx: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    const updatedMedia = activePkg.mediaItems.map((item, idx) => {
      if (idx === itemIdx) {
        const providedValue = item.partnershipPrice * qty;
        const requiredCost = (item.requiredCost / (item.quantity || 1)) * qty;
        return { ...item, quantity: qty, providedValue, requiredCost };
      }
      return item;
    });

    const updatedPkg = recalculatePackageMetrics(updatedMedia);
    onUpdatePackage(selectedPkgIndex, updatedPkg);
  };

  // Modify Media Item Period
  const handlePeriodChange = (itemIdx: number, newPeriod: string) => {
    const updatedMedia = activePkg.mediaItems.map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, period: newPeriod };
      }
      return item;
    });

    const updatedPkg = recalculatePackageMetrics(updatedMedia);
    onUpdatePackage(selectedPkgIndex, updatedPkg);
  };

  // Delete Media Item
  const handleDeleteMediaItem = (itemIdx: number) => {
    if (activePkg.mediaItems.length <= 1) {
      alert('최소 1개 이상의 매체가 패키지에 포함되어야 합니다.');
      return;
    }
    const updatedMedia = activePkg.mediaItems.filter((_, idx) => idx !== itemIdx);
    const updatedPkg = recalculatePackageMetrics(updatedMedia);
    onUpdatePackage(selectedPkgIndex, updatedPkg);
  };

  // Add Media Item from Rate Card
  const handleAddMediaFromRateCard = (rateCardItem: RateCardItem) => {
    const newItem: SelectedMediaItem = {
      rateCardItemId: rateCardItem.id,
      mediaName: rateCardItem.mediaName,
      category: rateCardItem.category,
      location: rateCardItem.location,
      quantity: 1,
      period: rateCardItem.period || '1개월',
      normalPrice: rateCardItem.normalPrice,
      partnershipPrice: rateCardItem.partnershipPrice,
      providedValue: rateCardItem.partnershipPrice,
      requiredCost: rateCardItem.requiredCost || 0,
      reasonForSelection: `추가 선택된 ${rateCardItem.category} 자산`,
    };

    const updatedMedia = [...activePkg.mediaItems, newItem];
    const updatedPkg = recalculatePackageMetrics(updatedMedia);
    onUpdatePackage(selectedPkgIndex, updatedPkg);
    setAddingMediaModalOpen(false);
  };

  // Handle Excel Download
  const handleExcelExport = () => {
    exportPartnershipProposalToExcel(partnerInput, recognitionRates, activePkg, packages);
  };

  const getPackageBadgeStyle = (type: string) => {
    switch (type) {
      case 'SAFE':
        return 'bg-[#2C2C2C] text-white';
      case 'BALANCED':
        return 'bg-[#736152] text-white border border-[#5C4E43]';
      case 'IMPACT':
        return 'bg-[#5C4E43] text-white';
      default:
        return 'bg-[#2C2C2C] text-white';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION HEADER */}
      <div className="bg-[#2C2C2C] text-white p-4 sm:p-5 rounded-sm shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#736152] text-white flex items-center justify-center rounded-xs font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
              5 & 6. AI PACKAGE MATCHING & MEDIA DETAIL
            </h2>
            <p className="text-xs text-[#EFECE6] font-sans mt-0.5">
              SAFE / BALANCED / IMPACT 3가지 패키지안 비교 및 커스텀 미디어 재구성
            </p>
          </div>
        </div>

        {/* Excel Export Button */}
        <button
          onClick={handleExcelExport}
          className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-2 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel 다운로드 (.xlsx)</span>
        </button>
      </div>

      {/* 3 PACKAGE COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg, idx) => {
          const isSelected = selectedPkgIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => setSelectedPkgIndex(idx)}
              className={`bg-white border rounded-sm p-5 sm:p-6 transition-all cursor-pointer relative flex flex-col justify-between space-y-5 shadow-2xs hover:border-slate-400 ${
                isSelected
                  ? 'border-blue-900 ring-2 ring-blue-900/20 bg-blue-50/10'
                  : 'border-slate-200'
              }`}
            >
              {/* Top Row Badges */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase rounded-xs ${getPackageBadgeStyle(
                    pkg.type
                  )}`}
                >
                  {pkg.type}
                </span>

                {pkg.isRecommended && (
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold uppercase rounded-xs flex items-center space-x-1 shadow-2xs animate-pulse">
                    <Sparkles className="w-3 h-3 text-slate-900" />
                    <span>RECOMMENDED</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 font-serif leading-snug">
                  {pkg.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {pkg.description}
                </p>
              </div>

              {/* Financial Metrics Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xs p-3.5 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Partner Adjusted Value:</span>
                  <span className="font-semibold text-slate-900">{fmtWon(pkg.partnerAdjustedValue)}</span>
                </div>

                <div className="flex justify-between items-center text-blue-900 font-bold pt-1 border-t border-slate-200">
                  <span>Oak Valley Media Value:</span>
                  <span className="text-sm">{fmtWon(pkg.oakValleyMediaValue)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600 text-[11px]">
                  <span>가치 차액 (Difference):</span>
                  <span className={pkg.difference >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                    {pkg.difference >= 0 ? `+${fmtWon(pkg.difference)}` : fmtWon(pkg.difference)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-200">
                  <span className="font-bold">Value Ratio (%):</span>
                  <span className="text-base font-bold text-blue-900">{fmtPct(pkg.valueRatio)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-500 text-[11px] pt-0.5">
                  <span>Estimated Actual Cost:</span>
                  <span>
                    {pkg.estimatedActualCost > 0 ? (
                      fmtWon(pkg.estimatedActualCost)
                    ) : (
                      <span className="text-amber-800 font-sans font-medium">Actual Cost 데이터 필요</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Fit & Difficulty */}
              <div className="space-y-2 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">실행 난이도:</span>
                  <span className="font-bold text-slate-900">{pkg.executionDifficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">포함 매체 수:</span>
                  <span className="font-bold text-slate-900">{pkg.mediaItems.length}개 자산</span>
                </div>
              </div>

              {/* Select Button */}
              <button
                className={`w-full py-2 text-xs font-bold rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-blue-900 text-white'
                    : 'bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-300'
                }`}
              >
                <span>{isSelected ? '선택된 패키지 (상세보기)' : '패키지 선택'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* SELECTED PACKAGE MEDIA DETAILS & EDITING TABLE */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-8 space-y-6 shadow-2xs">
        
        {/* Detail Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span
                className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase rounded-xs ${getPackageBadgeStyle(
                  activePkg.type
                )}`}
              >
                {activePkg.type}
              </span>
              <h3 className="text-lg font-bold font-serif text-slate-900">
                {activePkg.title} — 매체 구성 세부내역
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              각 매체의 수량, 기간을 직접 변경하거나 새로운 매체를 추가할 수 있습니다. (수정 시 실시간 재계산)
            </p>
          </div>

          <button
            onClick={() => setAddingMediaModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>매체 추가 / 교체</span>
          </button>
        </div>

        {/* Media Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase font-mono text-[11px]">
                <th className="p-3">매체/자산명</th>
                <th className="p-3">카테고리</th>
                <th className="p-3">위치</th>
                <th className="p-3 text-center">수량</th>
                <th className="p-3">기간</th>
                <th className="p-3 text-right">제휴 단가</th>
                <th className="p-3 text-right text-blue-900">제공 가치</th>
                <th className="p-3">선정 사유</th>
                <th className="p-3 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activePkg.mediaItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 max-w-[180px] truncate" title={item.mediaName}>
                    {item.mediaName}
                  </td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xs font-mono text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 max-w-[140px] truncate" title={item.location}>
                    {item.location}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-14 bg-white border border-slate-300 rounded-xs p-1 text-center font-mono font-bold text-xs"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.period}
                      onChange={(e) => handlePeriodChange(idx, e.target.value)}
                      className="w-20 bg-white border border-slate-300 rounded-xs p-1 text-xs"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {fmtWon(item.partnershipPrice)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-blue-900">
                    {fmtWon(item.providedValue)}
                  </td>
                  <td className="p-3 text-slate-600 text-[11px] max-w-[200px] truncate" title={item.reasonForSelection}>
                    {item.reasonForSelection}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteMediaItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                <td className="p-3 text-slate-900">제공 매체 총합 (TOTAL)</td>
                <td className="p-3 font-mono text-slate-500">-</td>
                <td className="p-3 font-mono text-slate-500">-</td>
                <td className="p-3 text-center font-mono">{activePkg.mediaItems.reduce((acc, i) => acc + i.quantity, 0)}</td>
                <td className="p-3 font-mono text-slate-500">-</td>
                <td className="p-3 font-mono text-slate-500">-</td>
                <td className="p-3 text-right font-mono text-blue-900 text-sm">{fmtWon(activePkg.oakValleyMediaValue)}</td>
                <td className="p-3 text-slate-500 text-[11px]">Value Ratio: {fmtPct(activePkg.valueRatio)}</td>
                <td className="p-3 text-center">-</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      {/* PROFITABILITY CHECK & RISK WARNINGS (Requirement 7) */}
      <div className="bg-slate-900 text-white rounded-sm p-6 space-y-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              7. PROFITABILITY & RISK CHECK (오크밸리 수익성 검토)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">FINANCIAL HEALTH & RISK</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
              Profitability Grade
            </span>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {activePkg.profitabilityAnalysis.profitabilityLevel}
            </div>
            <p className="text-[11px] text-slate-300">
              Value Ratio {fmtPct(activePkg.valueRatio)} 기준 오크밸리 이익률
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
              Actual Cost Status
            </span>
            <div className="text-sm font-bold text-white font-mono">
              {activePkg.estimatedActualCost > 0 ? (
                fmtWon(activePkg.estimatedActualCost)
              ) : (
                <span className="text-amber-400">Actual Cost 데이터 필요</span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              {activePkg.profitabilityAnalysis.hasActualCostData
                ? '단가표 기준 추정 실비'
                : '파일 내 실비 항목 미기재'}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xs space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
              Opportunity Cost Note
            </span>
            <p className="text-xs text-slate-200 leading-snug">
              {activePkg.profitabilityAnalysis.opportunityCostNote}
            </p>
          </div>
        </div>

        {/* Risk Warnings List */}
        {activePkg.profitabilityAnalysis.warnings.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-800/80 rounded-xs p-4 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>PROPOSAL RISK WARNINGS (위험 요소 경고)</span>
            </span>

            <ul className="space-y-1 text-xs text-amber-100 list-disc list-inside">
              {activePkg.profitabilityAnalysis.warnings.map((warn, widx) => (
                <li key={widx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI RECOMMENDATION & STRATEGY (Requirement 8) */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center space-x-2.5 border-b border-slate-200 pb-3">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold font-serif text-slate-900 tracking-tight">
            8. AI STRATEGIC RECOMMENDATION (협상 및 제안 전략)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* WHY THIS PACKAGE */}
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-5 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase block border-b border-slate-200 pb-2">
              WHY THIS PACKAGE (추천 이유 3선)
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {activePkg.aiRecommendation.whyThisPackage.map((reason, ridx) => (
                <li key={ridx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NEGOTIATION POINT */}
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-5 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase block border-b border-slate-200 pb-2">
              NEGOTIATION POINT (협상 포인트)
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {activePkg.aiRecommendation.negotiationPoints.map((point, pidx) => (
                <li key={pidx} className="flex items-start space-x-2">
                  <Handshake className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ADDITIONAL ASK */}
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-5 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-900 uppercase block border-b border-slate-200 pb-2">
              ADDITIONAL ASK (추가 요청 가능 사항)
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {activePkg.aiRecommendation.additionalAsks.map((ask, aidx) => (
                <li key={aidx} className="flex items-start space-x-2">
                  <Plus className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{ask}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ADD MEDIA MODAL */}
      {addingMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-300 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif">Rate Card에서 매체 추가하기</h3>
              <button
                onClick={() => setAddingMediaModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-600">
                현재 등록된 Oak Valley Rate Card 항목 중 패키지에 추가할 매체를 선택하세요.
              </p>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xs">
                {rateCard.map((rcItem) => (
                  <div
                    key={rcItem.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{rcItem.mediaName}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-mono rounded-xs border">
                          {rcItem.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rcItem.location} | {rcItem.period} | 제휴단가: {fmtWon(rcItem.partnershipPrice)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddMediaFromRateCard(rcItem)}
                      className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xs cursor-pointer"
                    >
                      추가
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
