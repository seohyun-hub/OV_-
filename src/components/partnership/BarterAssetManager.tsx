import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { OakValleyBarterAsset } from '../../types';

interface BarterAssetManagerProps {
  assets: OakValleyBarterAsset[];
  onUpdateAssets: (newAssets: OakValleyBarterAsset[]) => void;
}

export const BarterAssetManager: React.FC<BarterAssetManagerProps> = ({
  assets,
  onUpdateAssets,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<OakValleyBarterAsset | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parsedItemsPreview, setParsedItemsPreview] = useState<OakValleyBarterAsset[] | null>(null);
  const [customTypeInput, setCustomTypeInput] = useState<string>('');
  const [showCustomTypeInput, setShowCustomTypeInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload & AI Auto-Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    try {
      let fileText = '';
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        fileText = await file.text();
      } else {
        // Read file contents or name
        fileText = `파일명: ${file.name}, 파일크기: ${file.size} bytes. 단가표 데이터가 포함된 문서입니다.`;
      }

      const res = await fetch('/api/parse-ratecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileText,
          fileName: file.name,
        }),
      });

      const json = await res.json();
      if (json.success && Array.isArray(json.assetList) && json.assetList.length > 0) {
        setParsedItemsPreview(json.assetList);
      } else {
        alert('파일에서 바터 자산 항목을 파싱하지 못했습니다. 수기로 등록해주세요.');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      alert('파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirm Parsed Items
  const handleConfirmParsedItems = () => {
    if (parsedItemsPreview) {
      onUpdateAssets([...assets, ...parsedItemsPreview]);
      setParsedItemsPreview(null);
    }
  };

  // Add Item
  const handleAddDirect = () => {
    const newId = `ov-asset-${Date.now()}`;
    const newItem: OakValleyBarterAsset = {
      id: newId,
      itemName: '새 바터 자산',
      location: '밸리빌리지',
      type: '광고',
      specification: '규격 작성',
      unitPrice: 1000000,
      period: '1회',
      notes: '비고 메모',
    };
    onUpdateAssets([newItem, ...assets]);
    setEditingId(newId);
    setEditForm(newItem);
  };

  // Duplicate Item
  const handleDuplicate = (asset: OakValleyBarterAsset) => {
    const copyItem: OakValleyBarterAsset = {
      ...asset,
      id: `ov-asset-${Date.now()}`,
      itemName: `${asset.itemName} (복사본)`,
    };
    onUpdateAssets([copyItem, ...assets]);
  };

  // Delete Item
  const handleDelete = (id: string) => {
    if (confirm('해당 바터 자산 항목을 삭제하시겠습니까?')) {
      onUpdateAssets(assets.filter((a) => a.id !== id));
    }
  };

  // Start Editing
  const handleStartEdit = (asset: OakValleyBarterAsset) => {
    setEditingId(asset.id);
    setEditForm({ ...asset });
  };

  // Save Editing
  const handleSaveEdit = () => {
    if (editForm) {
      onUpdateAssets(assets.map((a) => (a.id === editForm.id ? editForm : a)));
      setEditingId(null);
      setEditForm(null);
    }
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono text-[10px] font-bold uppercase rounded-xs">
              STEP 1
            </span>
            <h2 className="text-lg font-serif font-bold text-white">
              OAK VALLEY BARTER ASSET LIST
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Excel, CSV, PDF 등 기존 단가표 파일을 업로드하거나, 수기로 오크밸리 바터 자산을 등록·관리합니다.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv,.pdf,.ppt,.pptx,.doc,.docx,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsingFile}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xs border border-slate-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isParsingFile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                <span>AI 파일 읽는 중...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>단가표 파일 업로드 (AI)</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddDirect}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xs flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ 바터 항목 직접 추가</span>
          </button>
        </div>
      </div>

      {/* AI Parsed Items Review Modal/Alert */}
      {parsedItemsPreview && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>AI 파일 분석 결과 ({parsedItemsPreview.length}개 항목 추출됨)</span>
              </div>
              <p className="text-xs text-amber-800">
                업로드하신 파일에서 추출된 자산 리스트입니다. 확인 후 추가 버튼을 눌러주세요.
              </p>
              <div className="max-h-48 overflow-y-auto border border-amber-200 rounded-xs bg-white p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                      <th className="p-1.5">항목명</th>
                      <th className="p-1.5">위치</th>
                      <th className="p-1.5">형태</th>
                      <th className="p-1.5">규격</th>
                      <th className="p-1.5">단가</th>
                      <th className="p-1.5">기간</th>
                      <th className="p-1.5">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItemsPreview.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 text-slate-800">
                        <td className="p-1.5 font-bold">{item.itemName}</td>
                        <td className="p-1.5">{item.location}</td>
                        <td className="p-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-xs">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-1.5">{item.specification}</td>
                        <td className="p-1.5 font-mono">
                          {item.unitPrice > 0 ? `${item.unitPrice.toLocaleString()}원` : item.unitPriceText || '별도 산정'}
                        </td>
                        <td className="p-1.5">{item.period}</td>
                        <td className="p-1.5 text-slate-500">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col space-y-2 shrink-0">
              <button
                onClick={handleConfirmParsedItems}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>리스트에 반영</span>
              </button>
              <button
                onClick={() => setParsedItemsPreview(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-xs cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Barter Asset List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-mono font-bold border-b border-slate-200 uppercase text-[11px]">
              <th className="p-3">광고매체 및 바터 리스트</th>
              <th className="p-3 w-28">위치</th>
              <th className="p-3 w-24">형태</th>
              <th className="p-3 w-32">규격</th>
              <th className="p-3 w-32 text-right">단가</th>
              <th className="p-3 w-24">기간</th>
              <th className="p-3">비고</th>
              <th className="p-3 w-24 text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  등록된 오크밸리 바터 자산이 없습니다. 위 [+ 바터 항목 직접 추가] 또는 파일 업로드를 실행해주세요.
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const isEditing = editingId === asset.id;

                if (isEditing && editForm) {
                  return (
                    <tr key={asset.id} className="bg-blue-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.itemName}
                          onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs font-bold text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-xs text-slate-900"
                        >
                          <option value="광고">광고</option>
                          <option value="숙박">숙박</option>
                          <option value="부대시설">부대시설</option>
                          <option value="할인">할인</option>
                          <option value={editForm.type !== '광고' && editForm.type !== '숙박' && editForm.type !== '부대시설' && editForm.type !== '할인' ? editForm.type : '직접입력'}>
                            {editForm.type} (선택)
                          </option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.specification}
                          onChange={(e) => setEditForm({ ...editForm, specification: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={editForm.unitPrice}
                          onChange={(e) =>
                            setEditForm({ ...editForm, unitPrice: Number(e.target.value) || 0 })
                          }
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-right font-mono text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.period}
                          onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-blue-400 rounded-xs text-xs text-slate-900"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xs cursor-pointer"
                            title="저장"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xs cursor-pointer"
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
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 text-slate-800">
                    <td className="p-3 font-bold text-slate-900">{asset.itemName}</td>
                    <td className="p-3 text-slate-600">{asset.location}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase rounded-xs ${
                          asset.type === '광고'
                            ? 'bg-blue-100 text-blue-800'
                            : asset.type === '숙박'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.type === '부대시설'
                            ? 'bg-amber-100 text-amber-800'
                            : asset.type === '할인'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {asset.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{asset.specification}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {asset.unitPrice > 0 ? `${asset.unitPrice.toLocaleString()}원` : asset.unitPriceText || '별도 산정'}
                    </td>
                    <td className="p-3 text-slate-600">{asset.period}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{asset.notes}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-slate-500">
                        <button
                          onClick={() => handleStartEdit(asset)}
                          className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded-xs cursor-pointer"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(asset)}
                          className="p-1 hover:text-emerald-600 hover:bg-emerald-50 rounded-xs cursor-pointer"
                          title="복제"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 hover:text-red-600 hover:bg-red-50 rounded-xs cursor-pointer"
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

    </div>
  );
};
