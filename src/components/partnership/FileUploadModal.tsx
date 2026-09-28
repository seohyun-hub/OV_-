import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PartnerConditionLineItem,
  FileUploadComparison,
  LineItemCategory,
  ItemProvider,
} from '../../types';
import { partnerConditionStore } from '../../data/partnerConditionStore';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  projectName: string;
  onApplySuccess: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  projectName,
  onApplySuccess,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [comparison, setComparison] = useState<FileUploadComparison | null>(null);

  // Selected checkboxes for updates & new items
  const [selectedUpdateIds, setSelectedUpdateIds] = useState<Set<string>>(new Set());
  const [selectedNewIndices, setSelectedNewIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  // Handle Mock File Parse & Extraction Simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    setTimeout(() => {
      // Generate realistic extracted comparison mock based on file name or default pattern
      const mockExtracted: Partial<PartnerConditionLineItem>[] = [
        // 1. Matched existing with change proposal (e.g. quantity room change)
        {
          itemName: '밸리빌리지 노블 31평형 객실',
          provider: 'IPARK리조트',
          category: '객실',
          quantityPeriod: '15실 1박', // Proposed change from 10실 -> 15실
          quantityNum: 15,
          normalPrice: 350000,
          recognizedPrice: 150000,
          notes: '스태프 15실 객실 확대안',
        },
        // 2. Brand new item extracted from file
        {
          itemName: '브랜드 SNS 채널 홍보 콘텐츠 게시',
          provider: '파트너',
          category: '홍보',
          quantityPeriod: '2회',
          quantityNum: 2,
          unitPrice: 2000000,
          normalPrice: 2000000,
          recognizedPrice: 2000000,
          costPrice: 0,
          notes: '팔로워 50만 아디다스 러닝 공식 인스타그램 피드 2회 포스팅',
        },
      ];

      const compResult = partnerConditionStore.compareExtractedItems(
        partnerName,
        projectName,
        mockExtracted
      );

      setComparison(compResult);

      // Auto check proposed changes and new items by default
      const initialUpdateIds = new Set<string>();
      compResult.proposedChanges.forEach((p) => initialUpdateIds.add(p.existingItem.id));
      setSelectedUpdateIds(initialUpdateIds);

      const initialNewIdxs = new Set<number>();
      compResult.newItems.forEach((_, idx) => initialNewIdxs.add(idx));
      setSelectedNewIndices(initialNewIdxs);

      setIsUploading(false);
    }, 1200);
  };

  const toggleUpdateSelection = (id: string) => {
    const next = new Set(selectedUpdateIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUpdateIds(next);
  };

  const toggleNewSelection = (idx: number) => {
    const next = new Set(selectedNewIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedNewIndices(next);
  };

  const handleApply = () => {
    if (!comparison) return;

    // Filter approved updates
    const updatesToApply = comparison.proposedChanges
      .filter((p) => selectedUpdateIds.has(p.existingItem.id))
      .map((p) => ({
        id: p.existingItem.id,
        updates: p.extractedItem,
      }));

    // Filter approved new items
    const newItemsToApply = comparison.newItems.filter((_, idx) =>
      selectedNewIndices.has(idx)
    );

    partnerConditionStore.applyUploadChanges(
      partnerName,
      projectName,
      {
        updateItemIds: updatesToApply,
        newItems: newItemsToApply,
      },
      fileName || '파일업로드'
    );

    alert('✓ 선택한 조건이 기존 제휴 조건 DB에 안전하게 반영되었습니다.');
    onApplySuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-sans max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3] shrink-0">
          <div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold">
              기존 DB 보완 전용
            </span>
            <h3 className="text-lg font-extrabold text-[#2C2C2C] mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-700" />
              자료 기반 제휴 조건 보완 (PDF/Excel/DOCX)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto my-4 space-y-4 pr-1 text-xs">
          {/* File Upload Box */}
          <div className="p-4 border-2 border-dashed border-[#D4C8B8] bg-[#FAF8F5] rounded-xl text-center cursor-pointer relative hover:bg-[#F5F0EB] transition-colors">
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-8 h-8 text-amber-700 mx-auto mb-2" />
            <p className="font-extrabold text-[#2C2C2C]">
              {fileName ? fileName : '제휴 제안서 또는 계약서 파일 업로드 (클릭 또는 드래그)'}
            </p>
            <p className="text-[11px] text-[#736152] mt-1">
              지원 형식: PDF, XLSX, CSV, DOCX (기존 파트너 조건 DB를 덮어쓰지 않고 변경 사항만 보완합니다)
            </p>
          </div>

          {isUploading && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-900 font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>파일 분석 및 기존 DB 비교 분석 진행 중...</span>
            </div>
          )}

          {/* Comparison Results */}
          {comparison && !isUploading && (
            <div className="space-y-4">
              {/* Category 1: Proposed Changes */}
              {comparison.proposedChanges.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    [변경 제안 항목] (기존 항목과의 차이점)
                  </h4>
                  <div className="space-y-2">
                    {comparison.proposedChanges.map((p) => (
                      <div
                        key={p.existingItem.id}
                        className="p-3 bg-white border border-amber-200 rounded-lg flex items-start gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUpdateIds.has(p.existingItem.id)}
                          onChange={() => toggleUpdateSelection(p.existingItem.id)}
                          className="mt-1 w-4 h-4 accent-amber-700 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="font-extrabold text-[#2C2C2C]">
                            {p.existingItem.itemName}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {p.changedFields.map((f, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-[11px] font-bold text-[#736152]"
                              >
                                <span>{f.field}:</span>
                                <span className="line-through text-gray-500">
                                  {f.oldVal}
                                </span>
                                <ArrowRight className="w-3 h-3 text-amber-700" />
                                <span className="text-amber-900 font-extrabold">
                                  {f.newVal}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 2: New Items */}
              {comparison.newItems.length > 0 && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    [신규 추가 항목] (DB에 없던 새로운 조건)
                  </h4>
                  <div className="space-y-2">
                    {comparison.newItems.map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-emerald-200 rounded-lg flex items-start gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={selectedNewIndices.has(idx)}
                          onChange={() => toggleNewSelection(idx)}
                          className="mt-1 w-4 h-4 accent-emerald-700 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#2C2C2C]">
                              {n.itemName}
                            </span>
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded text-[10px] font-bold">
                              {n.provider} · {n.category}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-emerald-800 mt-1">
                            수량/기간: {n.quantityPeriod} | 인정가:{' '}
                            {(n.recognizedPrice || 0).toLocaleString()}원
                          </p>
                          {n.notes && (
                            <p className="text-[10px] text-[#736152] mt-0.5">{n.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Matched Existing (No changes needed) */}
              {comparison.matchedExisting.length > 0 && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-[#736152]">
                  <span className="font-bold block mb-1">
                    ✓ 기존과 동일한 항목 ({comparison.matchedExisting.length}개 - 유지됨)
                  </span>
                  <p className="text-[11px]">
                    {comparison.matchedExisting.map((m) => m.existingItem.itemName).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD3] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF8F5] text-[#736152] font-bold text-xs rounded-xl border border-[#D4C8B8]"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={!comparison}
            className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs transition-all ${
              comparison
                ? 'bg-amber-700 hover:bg-amber-800 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            선택 내용 반영하기
          </button>
        </div>
      </div>
    </div>
  );
};
