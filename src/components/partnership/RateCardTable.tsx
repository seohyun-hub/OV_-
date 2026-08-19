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
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { RateCardItem } from '../../types';
import { DEFAULT_OAK_VALLEY_RATE_CARD } from '../../data/defaultRateCard';

interface RateCardTableProps {
  rateCard: RateCardItem[];
  onUpdateRateCard: (newItems: RateCardItem[]) => void;
  onSaveToLocalStorage: () => void;
  onResetToDefault: () => void;
  hasSavedCard: boolean;
}

export const RateCardTable: React.FC<RateCardTableProps> = ({
  rateCard,
  onUpdateRateCard,
  onSaveToLocalStorage,
  onResetToDefault,
  hasSavedCard,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RateCardItem | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmtWon = (num: number) => {
    if (!num) return '0원';
    return `${Math.round(num).toLocaleString()}원`;
  };

  // Handle File Upload & Parse
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setUploadMessage(`"${file.name}" 분석 중...`);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

        // Convert array rows to text format for AI or direct row mapping
        const fileText = jsonRows.map((r: any) => (Array.isArray(r) ? r.join(' | ') : String(r))).join('\n');

        await parseTextWithServerAI(fileText, file.name);
      } else {
        // For PDF, PPT, Word - read as text or arraybuffer and send to server AI
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileText = (event.target?.result as string) || '';
          await parseTextWithServerAI(fileText, file.name);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('File read error:', err);
      setUploadMessage('파일 읽기 오류가 발생했습니다. AI 텍스트 추출을 시도합니다.');
      setIsParsing(false);
    }
  };

  const parseTextWithServerAI = async (fileText: string, fileName: string) => {
    try {
      // Trim text to reasonable limit (e.g. 150,000 characters)
      const trimmedText = fileText.length > 150000 ? fileText.slice(0, 150000) : fileText;

      const res = await fetch('/api/parse-ratecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileText: trimmedText, fileName }),
      });

      let json: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const errorText = await res.text();
        console.error('Server returned non-JSON response:', errorText);
      }

      if (json && json.success && Array.isArray(json.rateCard) && json.rateCard.length > 0) {
        onUpdateRateCard(json.rateCard);
        setUploadMessage(`✓ "${fileName}"에서 ${json.rateCard.length}개 매체 항목을 성공적으로 추출하였습니다.`);
      } else {
        setUploadMessage(json?.error ? `오류: ${json.error}` : 'AI 분석으로 매체 구조화에 실패했습니다. 기본 단가표를 유지합니다.');
      }
    } catch (err) {
      console.error('API parse error:', err);
      setUploadMessage('AI 단가표 추출 중 오류가 발생했습니다.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start Editing Row
  const handleStartEdit = (item: RateCardItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // Save Editing Row
  const handleSaveEdit = () => {
    if (!editForm) return;
    const updated = rateCard.map((it) => (it.id === editForm.id ? editForm : it));
    onUpdateRateCard(updated);
    setEditingId(null);
    setEditForm(null);
  };

  // Delete Row
  const handleDeleteRow = (id: string) => {
    if (confirm('해당 매체 항목을 단가표에서 삭제하시겠습니까?')) {
      const updated = rateCard.filter((it) => it.id !== id);
      onUpdateRateCard(updated);
    }
  };

  // Add New Item Row
  const handleAddNewItem = () => {
    const newItem: RateCardItem = {
      id: `custom-${Date.now()}`,
      mediaName: '신규 매체/자산명',
      category: 'Outdoor',
      location: '오크밸리 지정 장소',
      description: '새로운 광고 매체 상세 설명',
      normalPrice: 10000000,
      partnershipPrice: 8000000,
      period: '1개월',
      quantity: 1,
      exposure: '월 10,000명',
      productionCost: 0,
      requiredCost: 0,
      restrictions: '정보 없음',
      notes: '사용자 직접 추가 매체',
    };
    onUpdateRateCard([...rateCard, newItem]);
    handleStartEdit(newItem);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center rounded-xs font-bold shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
                1. OAK VALLEY ASSET LIBRARY
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-blue-300 rounded-xs border border-slate-700">
                {rateCard.length}개 매체 등록됨
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              오크밸리 공식 광고매체 및 자산 단가표 (Excel, CSV, PDF, PPT, Word 업로드 지원)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv,.pdf,.ppt,.pptx,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isParsing ? '분석 중...' : '파일 업로드 (단가표)'}</span>
          </button>

          <button
            onClick={onSaveToLocalStorage}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            title="현재 단가표를 브라우저에 저장"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Rate Card 저장</span>
          </button>

          <button
            onClick={onResetToDefault}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
            title="기본 오크밸리 단가표로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xs transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Upload Notification Message */}
      {uploadMessage && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
          <button onClick={() => setUploadMessage(null)} className="text-blue-500 hover:text-blue-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="overflow-x-auto border border-slate-200 rounded-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase font-mono text-[11px] whitespace-nowrap">
                  <th className="p-2.5">매체명 (Media Name)</th>
                  <th className="p-2.5">카테고리</th>
                  <th className="p-2.5">위치 (Location)</th>
                  <th className="p-2.5 text-right">정상 단가</th>
                  <th className="p-2.5 text-right text-blue-900">제휴 단가</th>
                  <th className="p-2.5">기간</th>
                  <th className="p-2.5">노출수</th>
                  <th className="p-2.5 text-right">실비 비용</th>
                  <th className="p-2.5">제약/비고</th>
                  <th className="p-2.5 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rateCard.map((item) => {
                  const isEditing = editingId === item.id;

                  if (isEditing && editForm) {
                    return (
                      <tr key={item.id} className="bg-amber-50/80">
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.mediaName}
                            onChange={(e) => setEditForm({ ...editForm, mediaName: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editForm.normalPrice}
                            onChange={(e) => setEditForm({ ...editForm, normalPrice: Number(e.target.value) })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs text-right font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editForm.partnershipPrice}
                            onChange={(e) => setEditForm({ ...editForm, partnershipPrice: Number(e.target.value) })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs text-right font-mono font-bold text-blue-900"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.period}
                            onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.exposure}
                            onChange={(e) => setEditForm({ ...editForm, exposure: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={editForm.requiredCost}
                            onChange={(e) => setEditForm({ ...editForm, requiredCost: Number(e.target.value) })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs text-right font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={editForm.restrictions}
                            onChange={(e) => setEditForm({ ...editForm, restrictions: e.target.value })}
                            className="w-full bg-white border border-amber-300 rounded-xs p-1 text-xs"
                          />
                        </td>
                        <td className="p-2 text-center whitespace-nowrap space-x-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 bg-emerald-600 text-white rounded-xs hover:bg-emerald-700"
                            title="저장"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(null);
                            }}
                            className="p-1 bg-slate-300 text-slate-700 rounded-xs hover:bg-slate-400"
                            title="취소"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 max-w-[180px] truncate" title={item.mediaName}>
                        {item.mediaName}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xs font-mono text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 max-w-[150px] truncate" title={item.location}>
                        {item.location}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-500 line-through">
                        {fmtWon(item.normalPrice)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-blue-900">
                        {fmtWon(item.partnershipPrice)}
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium">{item.period}</td>
                      <td className="p-2.5 text-slate-600 max-w-[120px] truncate" title={item.exposure}>
                        {item.exposure || '정보 없음'}
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-700">
                        {item.requiredCost > 0 ? fmtWon(item.requiredCost) : <span className="text-slate-400">0원</span>}
                      </td>
                      <td className="p-2.5 text-slate-500 max-w-[140px] truncate text-[11px]" title={item.restrictions}>
                        {item.restrictions || '정보 없음'}
                      </td>
                      <td className="p-2.5 text-center whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xs transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xs transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="flex justify-between items-center pt-1">
            <button
              onClick={handleAddNewItem}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xs transition-colors flex items-center space-x-1.5 border border-slate-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 매체 항목 직접 추가</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400">
              * 업로드된 파일에 정보가 없는 항목은 "정보 없음"으로 표시됩니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
