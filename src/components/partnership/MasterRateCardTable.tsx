import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MasterRateCardItem } from '../../types';
import { DEFAULT_MASTER_RATE_CARD } from '../../data/defaultMasterRateCard';

interface MasterRateCardTableProps {
  items: MasterRateCardItem[];
  onUpdateItems: (newItems: MasterRateCardItem[]) => void;
  onSaveToLocalStorage: () => void;
  onResetToDefault: () => void;
}

export const MasterRateCardTable: React.FC<MasterRateCardTableProps> = ({
  items,
  onUpdateItems,
  onSaveToLocalStorage,
  onResetToDefault,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MasterRateCardItem | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Excel Download
  const handleExportExcel = () => {
    const data = items.map((it) => ({
      카테고리: it.category,
      '시설·항목명': it.itemName,
      단위: it.unit,
      '정상가(원)': it.normalPrice,
      적용조건: it.condition,
      비고: it.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master_Rate_Card');
    XLSX.writeFile(workbook, `OakValley_Master_Rate_Card_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  // Handle Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);

        const newItems: MasterRateCardItem[] = json.map((row: any, idx: number) => ({
          id: `mrc-upload-${Date.now()}-${idx}`,
          category: row['카테고리'] || row['Category'] || '공간',
          itemName: row['시설·항목명'] || row['항목명'] || row['Item'] || `업로드 자산 ${idx + 1}`,
          unit: row['단위'] || row['Unit'] || '1일',
          normalPrice: Number(row['정상가(원)'] || row['정상가'] || row['Price'] || 0),
          condition: row['적용조건'] || row['Condition'] || '정상가 기준',
          notes: row['비고'] || row['Notes'] || '-',
        }));

        if (newItems.length > 0) {
          onUpdateItems(newItems);
          alert(`✓ Excel 파일에서 총 ${newItems.length}개의 자산 단가 항목을 가져왔습니다.`);
        }
      } catch (err) {
        console.error('Excel parse error:', err);
        alert('Excel 파일 읽기 중 오류가 발생했습니다. 양식을 확인해 주세요.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = (item: MasterRateCardItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    onUpdateItems(items.map((it) => (it.id === editForm.id ? editForm : it)));
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteRow = (id: string) => {
    if (confirm('해당 자산 단가 항목을 삭제하시겠습니까?')) {
      onUpdateItems(items.filter((it) => it.id !== id));
    }
  };

  const handleAddNewItem = () => {
    const newItem: MasterRateCardItem = {
      id: `mrc-custom-${Date.now()}`,
      category: '공간',
      itemName: '신규 오크밸리 제공 자산',
      unit: '1일',
      normalPrice: 3000000,
      condition: '정상가 기준',
      notes: '사용자 직접 추가 자산',
    };
    onUpdateItems([...items, newItem]);
    handleStartEdit(newItem);
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-[#2C2C2C] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-[#736152] text-white flex items-center justify-center rounded-xs font-mono font-bold text-xs">
            RC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold font-serif text-white">
                1. MASTER RATE CARD (오크밸리 자산 정상가 기준표)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#736152] text-[#EFECE6] rounded-xs">
                {items.length}개 자산 등록됨
              </span>
            </div>
            <p className="text-xs text-[#D4C8B8] font-light">
              모든 금액 산정의 기준이 되는 오크밸리 자산 정상가 단가표입니다. (CODE MATH의 단일 진실 출처)
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel 업로드</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#2C2C2C] text-xs font-semibold rounded-xs flex items-center space-x-1 border border-[#D4C8B8] cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#736152]" />
            <span>Excel 다운로드</span>
          </button>

          <button
            onClick={onSaveToLocalStorage}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xs flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>저장</span>
          </button>

          <button
            onClick={onResetToDefault}
            className="px-2.5 py-1.5 bg-[#403B36] hover:bg-[#504A44] text-[#D4C8B8] text-xs font-medium rounded-xs cursor-pointer transition-colors"
            title="기본 오크밸리 자산 기준표 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-[#403B36] text-[#D4C8B8] rounded-xs cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Table Content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          <div className="overflow-x-auto border border-[#E8E4DC] rounded-xs">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#736152] font-mono border-b border-[#E8E4DC] uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 w-24">카테고리</th>
                  <th className="py-2.5 px-3 min-w-[180px]">시설 · 항목명</th>
                  <th className="py-2.5 px-3 w-28">단위</th>
                  <th className="py-2.5 px-3 text-right w-32">정상가 (원)</th>
                  <th className="py-2.5 px-3 min-w-[140px]">적용조건</th>
                  <th className="py-2.5 px-3 min-w-[180px]">비고</th>
                  <th className="py-2.5 px-2 text-center w-16">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC]">
                {items.map((item) => {
                  const isEditing = editingId === item.id;
                  if (isEditing && editForm) {
                    return (
                      <tr key={item.id} className="bg-amber-50">
                        <td className="p-2">
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs rounded-xs"
                          >
                            <option value="공간">공간</option>
                            <option value="객실">객실</option>
                            <option value="골프">골프</option>
                            <option value="F&B">F&B</option>
                            <option value="광고">광고</option>
                            <option value="스포츠">스포츠</option>
                            <option value="기타">기타</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.itemName}
                            onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs font-semibold rounded-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs rounded-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editForm.normalPrice}
                            onChange={(e) => setEditForm({ ...editForm, normalPrice: Number(e.target.value) })}
                            step={100000}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs font-mono text-right rounded-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.condition}
                            onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs rounded-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full bg-white border border-[#D4C8B8] p-1 text-xs rounded-xs"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 bg-[#736152] text-white rounded-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditForm(null);
                              }}
                              className="p-1 bg-slate-300 text-slate-700 rounded-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-[#EFECE6] border border-[#D4C8B8] text-[#736152] rounded-xs font-mono text-[10px] font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#2C2C2C]">
                        {item.itemName}
                      </td>
                      <td className="py-2.5 px-3 text-[#66584C]">
                        {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#2C2C2C]">
                        ₩{item.normalPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#66584C] text-[11px]">
                        {item.condition}
                      </td>
                      <td className="py-2.5 px-3 text-[#786658] text-[11px] truncate max-w-[200px]" title={item.notes}>
                        {item.notes || '-'}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs cursor-pointer"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(item.id)}
                            className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-xs cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleAddNewItem}
              className="px-3.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs flex items-center space-x-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기준가 자산 항목 추가</span>
            </button>
            <span className="text-[11px] font-mono text-[#8C7A6B]">
              * 본 단가표의 가격은 AI가 임의 생성하지 않으며, 제휴 산정표(Oak Valley Asset Selector)의 수량 계산 시 100% 동일하게 연동됩니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
