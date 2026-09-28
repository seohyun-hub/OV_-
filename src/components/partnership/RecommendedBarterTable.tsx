import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  X,
  Edit2,
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  BarterPackageResult,
  RecommendedBarterItem,
  OakValleyBarterAsset,
} from '../../types';

interface RecommendedBarterTableProps {
  proposal: BarterPackageResult;
  registeredAssets: OakValleyBarterAsset[];
  onUpdateProposal: (updated: BarterPackageResult) => void;
  onReGenerate: (customTargetValue?: number) => void;
  isGenerating: boolean;
}

export const RecommendedBarterTable: React.FC<RecommendedBarterTableProps> = ({
  proposal,
  registeredAssets,
  onUpdateProposal,
  onReGenerate,
  isGenerating,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editRowForm, setEditRowForm] = useState<RecommendedBarterItem | null>(null);
  const [customTargetInput, setCustomTargetInput] = useState<number>(
    proposal.targetProvidedValue || proposal.partnerRecognizedValue
  );

  // Alternative Item Recommendation Modal
  const [alternativeModalItem, setAlternativeModalItem] = useState<RecommendedBarterItem | null>(null);
  const [alternativesList, setAlternativesList] = useState<any[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState<boolean>(false);

  // Recalculate proposal metrics strictly using code logic
  const recalculateMetrics = (items: RecommendedBarterItem[], newTargetValue?: number) => {
    const oakValleyProvidedValue = items.reduce(
      (sum, item) => sum + (Number(item.providedValue) || 0),
      0
    );
    const partnerVal = proposal.partnerRecognizedValue;
    const diff = oakValleyProvidedValue - partnerVal;
    const rate = partnerVal > 0 ? (oakValleyProvidedValue / partnerVal) * 100 : 100;

    onUpdateProposal({
      ...proposal,
      targetProvidedValue: newTargetValue ?? proposal.targetProvidedValue,
      oakValleyProvidedValue,
      difference: diff,
      matchRate: rate,
      items,
    });
  };

  // Row Item Change
  const handleItemFieldChange = (
    id: string,
    field: keyof RecommendedBarterItem,
    value: any
  ) => {
    const updatedItems = proposal.items.map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'unitPrice' || field === 'quantityNum') {
          const uPrice = Number(field === 'unitPrice' ? value : newItem.unitPrice) || 0;
          const qNum = Number(field === 'quantityNum' ? value : newItem.quantityNum) || 1;
          newItem.providedValue = uPrice * qNum;
        }
        return newItem;
      }
      return item;
    });

    recalculateMetrics(updatedItems);
  };

  // Delete Row
  const handleDeleteRow = (id: string) => {
    const updatedItems = proposal.items.filter((i) => i.id !== id);
    recalculateMetrics(updatedItems);
  };

  // Start Edit Row Modal
  const handleStartEditRow = (item: RecommendedBarterItem) => {
    setEditingRowId(item.id);
    setEditRowForm({ ...item });
  };

  // Save Edit Row
  const handleSaveEditRow = () => {
    if (!editRowForm) return;
    const uPrice = Number(editRowForm.unitPrice) || 0;
    const qNum = Number(editRowForm.quantityNum) || 1;
    const providedValue = uPrice * qNum;

    const updatedItems = proposal.items.map((i) =>
      i.id === editRowForm.id ? { ...editRowForm, providedValue } : i
    );
    recalculateMetrics(updatedItems);
    setEditingRowId(null);
    setEditRowForm(null);
  };

  // Add Asset from Step 1 List
  const handleAddAssetFromList = (asset: OakValleyBarterAsset) => {
    const newItem: RecommendedBarterItem = {
      id: `rec-added-${Date.now()}`,
      assetId: asset.id,
      itemName: asset.itemName,
      location: asset.location,
      type: asset.type,
      specification: asset.specification,
      unitPrice: asset.unitPrice,
      unitPriceText: asset.unitPriceText || '',
      quantityPeriod: asset.period || '1회',
      quantityNum: 1,
      providedValue: asset.unitPrice * 1,
      notes: asset.notes || '',
    };

    recalculateMetrics([...proposal.items, newItem]);
    setShowAddModal(false);
  };

  // Get Alternative Recommendations
  const handleFetchAlternatives = async (item: RecommendedBarterItem) => {
    setAlternativeModalItem(item);
    setLoadingAlternatives(true);
    try {
      const res = await fetch('/api/recommend-alternative-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetList: registeredAssets,
          removedItemName: item.itemName,
          removedValue: item.providedValue,
        }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.alternatives)) {
        setAlternativesList(json.alternatives);
      } else {
        setAlternativesList([]);
      }
    } catch (err) {
      console.error(err);
      setAlternativesList([]);
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Replace Item with Alternative
  const handleReplaceWithAlternative = (alt: any) => {
    if (!alternativeModalItem) return;

    const newItem: RecommendedBarterItem = {
      id: alternativeModalItem.id,
      assetId: alt.assetId,
      itemName: alt.itemName,
      location: alt.location,
      type: alt.type,
      specification: alt.specification,
      unitPrice: alt.unitPrice,
      quantityPeriod: alt.suggestedQuantityPeriod || alt.period,
      quantityNum: alt.suggestedQuantityNum || 1,
      providedValue: alt.suggestedProvidedValue || alt.unitPrice,
      notes: alt.notes || '',
    };

    const updatedItems = proposal.items.map((i) =>
      i.id === alternativeModalItem.id ? newItem : i
    );
    recalculateMetrics(updatedItems);
    setAlternativeModalItem(null);
    setAlternativesList([]);
  };

  // Excel Download (.xlsx)
  const handleExcelDownload = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: BARTER SUMMARY
    const summaryRows = [
      ['PARTNERSHIP BARTER PROPOSAL SUMMARY'],
      [],
      ['항목', '내용'],
      ['업체명 (Company / Brand)', proposal.companyName || '파트너사'],
      ['현금 지원금액 (Cash Support)', `${proposal.cashSupport.toLocaleString()}원`],
      ['현물 지원금액 (Product / In-kind Support)', `${proposal.productSupport.toLocaleString()}원`],
      ['현물 인정률 (In-kind Recognition Rate)', `${proposal.inKindRecognitionRate}%`],
      ['파트너 인정가치 (Partner Recognized Value)', `${proposal.partnerRecognizedValue.toLocaleString()}원`],
      ['Oak Valley 제공가치 (Oak Valley Provided Value)', `${proposal.oakValleyProvidedValue.toLocaleString()}원`],
      ['차액 (Difference)', `${proposal.difference >= 0 ? '+' : ''}${proposal.difference.toLocaleString()}원`],
      ['바터 매칭률 (Barter Match Rate)', `${proposal.matchRate.toFixed(1)}%`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'BARTER SUMMARY');

    // Sheet 2: BARTER DETAIL
    const detailHeaders = [
      '광고매체 및 바터 리스트',
      '위치',
      '형태',
      '규격',
      '단가',
      '수량/기간',
      '제공가치',
      '비고',
    ];
    const detailRows = proposal.items.map((item) => [
      item.itemName,
      item.location,
      item.type,
      item.specification,
      item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : item.unitPriceText || '별도 산정',
      item.quantityPeriod,
      item.providedValue > 0 ? `${item.providedValue.toLocaleString()}원` : '별도 산정',
      item.notes,
    ]);

    // Add TOTAL Row
    detailRows.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      '',
      `${proposal.oakValleyProvidedValue.toLocaleString()}원`,
      `차액: ${proposal.difference >= 0 ? '+' : ''}${proposal.difference.toLocaleString()}원 (매칭률: ${proposal.matchRate.toFixed(1)}%)`,
    ]);

    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'BARTER DETAIL');

    const filename = `${proposal.companyName || 'OakValley'}_Barter_Proposal_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xs">
              STEP 3
            </span>
            <h2 className="text-lg font-serif font-bold text-white">
              RECOMMENDED BARTER TABLE
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            등록된 OAK VALLEY BARTER ASSET LIST 기반의 바터 제안 조합입니다. 수량 및 항목을 수정한 후 Excel 파일로 다운로드하세요.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExcelDownload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>[Excel 다운로드] (.xlsx)</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* KPI Metrics Dashboard Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
              파트너 지원가치
            </span>
            <div className="text-lg font-mono font-bold text-slate-900">
              {proposal.partnerRecognizedValue.toLocaleString()}원
            </div>
            <p className="text-[10px] text-slate-400">
              {proposal.companyName || '파트너사'} 현금+현물 인정가
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 space-y-1">
            <span className="text-[11px] font-mono font-bold text-blue-700 uppercase">
              Oak Valley 제공가치
            </span>
            <div className="text-lg font-mono font-bold text-blue-900">
              {proposal.oakValleyProvidedValue.toLocaleString()}원
            </div>
            <p className="text-[10px] text-blue-600">
              제안 바터 항목 제공가치 총합
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
              차액 (Difference)
            </span>
            <div
              className={`text-lg font-mono font-bold ${
                proposal.difference >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {proposal.difference >= 0 ? '+' : ''}
              {proposal.difference.toLocaleString()}원
            </div>
            <p className="text-[10px] text-slate-400">
              제공가치 - 파트너 지원가치
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800 text-white rounded-sm p-4 space-y-1">
            <span className="text-[11px] font-mono font-bold text-amber-300 uppercase">
              바터 매칭률 (Match Rate)
            </span>
            <div className="text-xl font-mono font-bold text-amber-300">
              {proposal.matchRate.toFixed(1)}%
            </div>
            <p className="text-[10px] text-slate-300">
              목표: 95% ~ 105% 매칭
            </p>
          </div>

        </div>

        {/* Custom Target Value Adjustment Bar */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-900">
              목표 제공가 변경 재조합 (Target Value Adjustment)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-mono">목표 제공가:</span>
            <input
              type="number"
              step={500000}
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(Number(e.target.value) || 0)}
              className="w-32 px-2.5 py-1 bg-white border border-amber-300 rounded-xs font-mono font-bold text-xs text-slate-900 text-right"
            />
            <span className="text-xs font-bold text-slate-600">원</span>

            <button
              onClick={() => onReGenerate(customTargetInput)}
              disabled={isGenerating}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xs flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>재조합</span>
            </button>
          </div>
        </div>

        {/* Recommended Barter Table */}
        <div className="border border-slate-200 rounded-sm overflow-hidden">
          
          <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              RECOMMENDED BARTER PACKAGE TABLE
            </h3>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xs flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>[+ 자산 추가]</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-mono font-bold border-b border-slate-200 text-[11px] uppercase">
                  <th className="p-3">제공 항목</th>
                  <th className="p-3 w-28">위치</th>
                  <th className="p-3 w-20">형태</th>
                  <th className="p-3 w-28">규격</th>
                  <th className="p-3 w-28 text-right">단가</th>
                  <th className="p-3 w-28">수량/기간</th>
                  <th className="p-3 w-32 text-right">제공가치</th>
                  <th className="p-3">비고</th>
                  <th className="p-3 w-28 text-center">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proposal.items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      제안된 바터 항목이 없습니다. [+ 자산 추가] 버튼을 눌러 항목을 추가해주세요.
                    </td>
                  </tr>
                ) : (
                  proposal.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors text-slate-800 border-b border-slate-100">
                      <td className="p-3 font-bold text-slate-900">
                        {item.itemName}
                      </td>
                      <td className="p-3 text-slate-600">{item.location}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{item.specification}</td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : item.unitPriceText || '별도 산정'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min={1}
                            value={item.quantityNum || 1}
                            onChange={(e) =>
                              handleItemFieldChange(item.id, 'quantityNum', Number(e.target.value) || 1)
                            }
                            className="w-12 px-1.5 py-0.5 border border-slate-300 rounded-xs font-mono font-bold text-center text-xs text-slate-900"
                          />
                          <span className="text-xs text-slate-500">{item.quantityPeriod}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900">
                        {item.providedValue > 0 ? `${item.providedValue.toLocaleString()}원` : '별도 산정'}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">{item.notes}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleFetchAlternatives(item)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xs cursor-pointer"
                            title="대체 항목 추천"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(item.id)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xs cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* TOTAL Row */}
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="p-3.5" colSpan={6}>
                    TOTAL (총 오크밸리 제공가치)
                  </td>
                  <td className="p-3.5 text-right font-mono text-amber-300 text-sm font-bold">
                    {proposal.oakValleyProvidedValue.toLocaleString()}원
                  </td>
                  <td className="p-3.5 text-xs text-slate-300 font-mono" colSpan={2}>
                    차액: {proposal.difference >= 0 ? '+' : ''}
                    {proposal.difference.toLocaleString()}원 ({proposal.matchRate.toFixed(1)}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendation Reason */}
        <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-900 font-serif font-bold text-xs">
            <Info className="w-4 h-4 text-blue-600" />
            <span>추천 구성 이유</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans pl-6">
            {proposal.recommendationReason}
          </p>
        </div>

      </div>

      {/* MODAL 1: [+ 자산 추가] Pick Asset from STEP 1 List */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-serif font-bold text-slate-900">
                OAK VALLEY BARTER ASSET LIST에서 자산 추가
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                STEP 1에 등록된 오크밸리 바터 자산 중 추천 테이블에 추가할 항목을 선택하세요:
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xs">
                {registeredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 hover:bg-[#FAF8F5] flex items-center justify-between transition-colors cursor-pointer"
                    onClick={() => handleAddAssetFromList(asset)}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#2C2C2C]">{asset.itemName}</span>
                        <span className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] font-mono text-[10px] rounded-xs font-semibold">
                          {asset.type}
                        </span>
                        <span className="text-xs text-[#786658] font-mono">📍 {asset.location}</span>
                      </div>
                      <p className="text-[11px] text-[#786658]">
                        규격: {asset.specification} | 기간: {asset.period}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-[#736152]">
                        {asset.unitPrice > 0 ? `${asset.unitPrice.toLocaleString()}원` : asset.unitPriceText || '별도 산정'}
                      </span>
                      <button className="px-2.5 py-1 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-xs cursor-pointer">
                        추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: [대체 항목 추천] Alternatives Modal */}
      {alternativeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-serif font-bold text-slate-900">
                  대체 항목 추천 ({alternativeModalItem.itemName})
                </h3>
              </div>
              <button
                onClick={() => setAlternativeModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              현재 항목 ({alternativeModalItem.itemName}, 가치: {alternativeModalItem.providedValue.toLocaleString()}원)을 대체할 수 있는 오크밸리 등록 자산입니다:
            </p>

            {loadingAlternatives ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
                <span className="text-xs text-slate-500">대체 등록 자산을 탐색 중입니다...</span>
              </div>
            ) : alternativesList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                대체 가능한 자산이 등록되어 있지 않습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {alternativesList.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-xs flex items-center justify-between transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">{alt.itemName}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-xs">
                          {alt.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        위치: {alt.location} | 규격: {alt.specification}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-blue-900">
                          {alt.suggestedProvidedValue?.toLocaleString()}원
                        </div>
                        <div className="text-[10px] text-slate-400">
                          수량: {alt.suggestedQuantityPeriod}
                        </div>
                      </div>

                      <button
                        onClick={() => handleReplaceWithAlternative(alt)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xs cursor-pointer"
                      >
                        이 항목으로 교체
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
