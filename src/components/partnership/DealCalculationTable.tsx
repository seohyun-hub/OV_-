import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Building,
  Layers,
  Calendar,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { DealCalculationRow, OakValleyBarterAsset } from '../../types';
import { BarterAssetManager } from './BarterAssetManager';

interface DealCalculationTableProps {
  rows: DealCalculationRow[];
  onUpdateRows: (newRows: DealCalculationRow[]) => void;
  registeredAssets: OakValleyBarterAsset[];
  onUpdateAssets: (newAssets: OakValleyBarterAsset[]) => void;
  onExportExcel?: () => void;
}

export const DealCalculationTable: React.FC<DealCalculationTableProps> = ({
  rows,
  onUpdateRows,
  registeredAssets,
  onUpdateAssets,
  onExportExcel,
}) => {
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<DealCalculationRow | null>(null);
  const [showAssetManager, setShowAssetManager] = useState<boolean>(false);
  const [showAssetPicker, setShowAssetPicker] = useState<boolean>(false);

  // Totals calculations
  const totalNormalValue = rows.reduce((acc, r) => acc + (r.normalPrice * r.quantityNum), 0);
  const totalAppliedValue = rows.reduce((acc, r) => acc + (r.appliedPrice * r.quantityNum), 0);
  const totalDiscountValue = rows.reduce((acc, r) => acc + r.discountAmount, 0);
  const averageDiscountRate = totalNormalValue > 0 ? (totalDiscountValue / totalNormalValue) * 100 : 0;

  // Add new empty custom row
  const handleAddNewRow = () => {
    const newId = `deal-row-${Date.now()}`;
    const newRow: DealCalculationRow = {
      id: newId,
      date: '2026.08.15 ~ 2026.08.16',
      location: '밸리빌리지 잔디광장',
      itemName: '야외 브랜드 팝업존',
      quantityPeriod: '2일간 (주말)',
      quantityNum: 1,
      normalPrice: 5000000,
      appliedPrice: 0,
      discountRate: 100,
      discountAmount: 5000000,
      totalNormal: 5000000,
      totalApplied: 0,
      notes: '주말 팝업 행사 무상 지원 구좌',
    };
    onUpdateRows([...rows, newRow]);
    setEditingRowId(newId);
    setEditFormData(newRow);
  };

  // Add from Registered Oak Valley Asset
  const handleSelectAsset = (asset: OakValleyBarterAsset) => {
    const newId = `deal-row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRow: DealCalculationRow = {
      id: newId,
      date: '2026.08',
      location: asset.location || '오크밸리 전역',
      itemName: asset.itemName,
      quantityPeriod: asset.period || '1회',
      quantityNum: 1,
      normalPrice: asset.unitPrice || 1000000,
      appliedPrice: 0, // 기본 제휴가는 100% 무상지원 기준
      discountRate: 100,
      discountAmount: asset.unitPrice || 1000000,
      totalNormal: asset.unitPrice || 1000000,
      totalApplied: 0,
      notes: `${asset.type} | ${asset.specification} (${asset.notes || '기준가 적용'})`,
      assetId: asset.id,
    };
    onUpdateRows([...rows, newRow]);
    setShowAssetPicker(false);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    onUpdateRows(rows.filter((r) => r.id !== id));
    if (editingRowId === id) {
      setEditingRowId(null);
      setEditFormData(null);
    }
  };

  // Start editing row
  const handleStartEdit = (row: DealCalculationRow) => {
    setEditingRowId(row.id);
    setEditFormData({ ...row });
  };

  // Save edited row
  const handleSaveEdit = () => {
    if (!editFormData) return;
    const qNum = Math.max(1, Number(editFormData.quantityNum) || 1);
    const nPrice = Math.max(0, Number(editFormData.normalPrice) || 0);
    const aPrice = Math.max(0, Number(editFormData.appliedPrice) || 0);
    const discAmount = Math.max(0, (nPrice - aPrice) * qNum);
    const discRate = nPrice > 0 ? ((nPrice - aPrice) / nPrice) * 100 : 0;

    const updated: DealCalculationRow = {
      ...editFormData,
      quantityNum: qNum,
      normalPrice: nPrice,
      appliedPrice: aPrice,
      discountAmount: discAmount,
      discountRate: Math.max(0, Math.min(100, discRate)),
      totalNormal: nPrice * qNum,
      totalApplied: aPrice * qNum,
    };

    onUpdateRows(rows.map((r) => (r.id === updated.id ? updated : r)));
    setEditingRowId(null);
    setEditFormData(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditFormData(null);
  };

  // Export to CSV / Excel format (산정표 다운로드)
  const handleExportCSV = () => {
    if (rows.length === 0) {
      alert('다운로드할 제휴 산정표 항목이 없습니다.');
      return;
    }

    const headers = ['일자', '장소', '사용명', '시간·수량', '수량계수', '정상가(원)', '제휴가(원)', '할인율(%)', '할인금액(원)', '정상가총액(원)', '제휴가총액(원)', '비고'];
    const csvRows = [headers.join(',')];

    rows.forEach((r) => {
      csvRows.push(
        [
          `"${r.date.replace(/"/g, '""')}"`,
          `"${r.location.replace(/"/g, '""')}"`,
          `"${r.itemName.replace(/"/g, '""')}"`,
          `"${r.quantityPeriod.replace(/"/g, '""')}"`,
          r.quantityNum,
          r.normalPrice,
          r.appliedPrice,
          r.discountRate.toFixed(1),
          r.discountAmount,
          r.totalNormal,
          r.totalApplied,
          `"${(r.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      );
    });

    // Summary line
    csvRows.push([
      '"합계"',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      `"${averageDiscountRate.toFixed(1)}%"`,
      totalDiscountValue,
      totalNormalValue,
      totalAppliedValue,
      '"당사 할인 지원가치 합계"',
    ].join(','));

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `오크밸리_제휴산정표_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs p-6 space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-[#736152] text-white font-medium mb-1">
            <Building className="w-3 h-3 text-[#D4C8B8]" />
            <span>STEP 1 &middot; OAK VALLEY DEAL CALCULATION TABLE</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            1. 제휴 산정표 (Oak Valley 지원 및 할인 산정)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            오크밸리 기준 리스트에서 정상가를 불러오고, 파트너 적용가 및 할인 조건을 입력하여 <strong>당사 할인 지원가치</strong>를 자동 산정합니다.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          
          {/* Pick from standard ratecard */}
          <div className="relative">
            <button
              onClick={() => setShowAssetPicker(!showAssetPicker)}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#2C2C2C] border border-[#D4C8B8] rounded-xs text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#736152]" />
              <span>기준 리스트에서 불러오기</span>
              <ChevronDown className={`w-3 h-3 text-[#8C7A6B] transition-transform ${showAssetPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Asset Picker Dropdown */}
            {showAssetPicker && (
              <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 max-h-96 overflow-y-auto bg-white border border-[#D4C8B8] rounded-xs shadow-xl z-50 p-2 space-y-1">
                <div className="p-2 border-b border-[#E8E4DC] flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#736152] uppercase">
                    오크밸리 기준 자산 선택 ({registeredAssets.length}개)
                  </span>
                  <button
                    onClick={() => setShowAssetPicker(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-[#E8E4DC]/60 max-h-72 overflow-y-auto">
                  {registeredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="p-2.5 hover:bg-[#FAF8F5] cursor-pointer transition-colors text-left space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#2C2C2C] group-hover:text-[#736152]">
                          {asset.itemName}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#736152]">
                          {asset.unitPrice ? `₩${asset.unitPrice.toLocaleString()}` : asset.unitPriceText || '별도'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#8C7A6B]">
                        <span>{asset.location} &middot; {asset.type}</span>
                        <span>{asset.period}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add custom direct row */}
          <button
            onClick={handleAddNewRow}
            className="px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>항목 직접 추가</span>
          </button>

          {/* Download table */}
          <button
            onClick={onExportExcel || handleExportCSV}
            className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#D4C8B8] text-[#2C2C2C] border border-[#D4C8B8] rounded-xs text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
            title="산정표 Excel 다운로드 (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-[#736152]" />
            <span>산정표 Excel 다운로드</span>
          </button>

        </div>
      </div>

      {/* Main Calculation Table */}
      <div className="overflow-x-auto border border-[#E8E4DC] rounded-xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-[#FAF8F5] text-[#736152] font-mono border-b border-[#E8E4DC] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-28">일자</th>
              <th className="py-3 px-3 w-28">장소</th>
              <th className="py-3 px-3 min-w-[160px]">사용명 (항목)</th>
              <th className="py-3 px-3 w-24">시간·수량</th>
              <th className="py-3 px-3 text-right w-28">정상가 (원)</th>
              <th className="py-3 px-3 text-right w-28">제휴가 (원)</th>
              <th className="py-3 px-3 text-right w-36">할인율 · 할인금액</th>
              <th className="py-3 px-3 min-w-[140px]">비고</th>
              <th className="py-3 px-2 text-center w-16">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4DC]/80">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 font-mono text-xs">
                  등록된 제휴 산정 항목이 없습니다. 상단의 [기준 리스트에서 불러오기] 또는 [항목 직접 추가]를 클릭하세요.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isEditing = editingRowId === row.id;

                if (isEditing && editFormData) {
                  return (
                    <tr key={row.id} className="bg-amber-50/70">
                      <td className="p-2">
                        <input
                          type="text"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono text-[#2C2C2C]"
                          placeholder="2026.08"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editFormData.location}
                          onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs text-[#2C2C2C]"
                          placeholder="장소"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editFormData.itemName}
                          onChange={(e) => setEditFormData({ ...editFormData, itemName: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-semibold text-[#2C2C2C]"
                          placeholder="항목명"
                        />
                      </td>
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          value={editFormData.quantityPeriod}
                          onChange={(e) => setEditFormData({ ...editFormData, quantityPeriod: e.target.value })}
                          className="w-full px-2 py-0.5 bg-white border border-[#D4C8B8] rounded-xs text-[11px] text-[#2C2C2C]"
                          placeholder="예: 2일간"
                        />
                        <div className="flex items-center space-x-1 text-[10px] text-[#8C7A6B]">
                          <span>수량:</span>
                          <input
                            type="number"
                            value={editFormData.quantityNum}
                            onChange={(e) => setEditFormData({ ...editFormData, quantityNum: Math.max(1, Number(e.target.value)) })}
                            min={1}
                            className="w-12 px-1 py-0.5 bg-white border border-[#D4C8B8] rounded-xs text-[11px] font-mono text-[#2C2C2C]"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={editFormData.normalPrice}
                          onChange={(e) => setEditFormData({ ...editFormData, normalPrice: Math.max(0, Number(e.target.value)) })}
                          step={500000}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono text-right text-[#2C2C2C]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={editFormData.appliedPrice}
                          onChange={(e) => setEditFormData({ ...editFormData, appliedPrice: Math.max(0, Number(e.target.value)) })}
                          step={500000}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono text-right text-[#2C2C2C]"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <div className="font-mono font-bold text-amber-800 text-xs">
                          -₩{((editFormData.normalPrice - editFormData.appliedPrice) * editFormData.quantityNum).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono text-amber-700">
                          {editFormData.normalPrice > 0 ? (((editFormData.normalPrice - editFormData.appliedPrice) / editFormData.normalPrice) * 100).toFixed(0) : 0}% 할인
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#D4C8B8] rounded-xs text-[11px] text-[#2C2C2C]"
                          placeholder="비고"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs cursor-pointer"
                            title="저장"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xs cursor-pointer"
                            title="취소"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={row.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-[#66584C]">
                      {row.date}
                    </td>
                    <td className="py-3 px-3 text-[#2C2C2C]">
                      {row.location}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#2C2C2C]">
                      {row.itemName}
                    </td>
                    <td className="py-3 px-3 text-[#66584C]">
                      <div>{row.quantityPeriod}</div>
                      {row.quantityNum > 1 && (
                        <span className="text-[10px] font-mono text-[#8C7A6B]">(&times;{row.quantityNum})</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#66584C]">
                      ₩{(row.normalPrice * row.quantityNum).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-[#2C2C2C]">
                      {row.appliedPrice > 0 ? `₩${(row.appliedPrice * row.quantityNum).toLocaleString()}` : <span className="text-emerald-700 font-bold">무상 지원</span>}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <div className="font-bold text-[#8C5D28]">
                        -₩{row.discountAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#8C7A6B]">
                        ({row.discountRate.toFixed(0)}% 할인)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#786658] text-[11px] max-w-[200px] truncate" title={row.notes}>
                      {row.notes || '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleStartEdit(row)}
                          className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs cursor-pointer"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Step 1 Calculated Totals Summary Strip */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xs bg-[#736152] text-white flex items-center justify-center font-bold">
            OV
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#736152] uppercase">
              OAK VALLEY SUPPORT CALCULATION SUMMARY
            </div>
            <div className="text-xs text-[#66584C]">
              총 {rows.length}개 항목 산정 &middot; 평균 할인율: <strong className="font-mono text-[#2C2C2C]">{averageDiscountRate.toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-4 sm:gap-8">
          <div>
            <div className="text-[10px] font-mono text-[#8C7A6B] uppercase">총 정상가 합계</div>
            <div className="text-sm font-mono font-semibold text-[#66584C]">
              ₩ {totalNormalValue.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-[#8C7A6B] uppercase">총 적용 제휴가</div>
            <div className="text-sm font-mono font-semibold text-[#2C2C2C]">
              ₩ {totalAppliedValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-amber-100/60 border border-amber-300 px-4 py-2 rounded-xs">
            <div className="text-[10px] font-mono font-bold text-amber-900 uppercase">
              당사 할인 지원가치 (총 할인액)
            </div>
            <div className="text-lg font-mono font-bold text-amber-950">
              ₩ {totalDiscountValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Oak Valley Standard Asset Rate Card Manager */}
      <div className="border-t border-[#E8E4DC] pt-4">
        <button
          onClick={() => setShowAssetManager(!showAssetManager)}
          className="flex items-center space-x-2 text-xs font-semibold text-[#736152] hover:text-[#5C4E43] cursor-pointer"
        >
          <FolderOpen className="w-4 h-4" />
          <span>오크밸리 기준 바터·광고 자산 단가표 관리 ({registeredAssets.length}개 등록됨)</span>
          {showAssetManager ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAssetManager && (
          <div className="mt-4 pt-2">
            <BarterAssetManager
              assets={registeredAssets}
              onUpdateAssets={onUpdateAssets}
            />
          </div>
        )}
      </div>

    </div>
  );
};
