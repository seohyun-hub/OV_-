import React, { useState } from 'react';
import { Plus, X, Tag, DollarSign, Building2 } from 'lucide-react';
import {
  PartnerConditionLineItem,
  ItemProvider,
  LineItemCategory,
  LINE_ITEM_CATEGORIES,
  ITEM_PROVIDERS,
} from '../../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  projectName: string;
  onAddItem: (
    item: Omit<PartnerConditionLineItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  projectName,
  onAddItem,
}) => {
  const [itemName, setItemName] = useState<string>('');
  const [provider, setProvider] = useState<ItemProvider>('IPARK리조트');
  const [category, setCategory] = useState<LineItemCategory>('객실');
  const [quantityPeriod, setQuantityPeriod] = useState<string>('1식');
  const [quantityNum, setQuantityNum] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(1000000);
  const [normalPrice, setNormalPrice] = useState<number>(1000000);
  const [recognizedPrice, setRecognizedPrice] = useState<number>(1000000);
  const [costPrice, setCostPrice] = useState<number>(200000);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem({
      partnerName,
      projectName,
      itemName: itemName.trim(),
      provider,
      category,
      quantityPeriod,
      quantityNum: quantityNum || 1,
      unitPrice: unitPrice || 0,
      normalPrice: normalPrice || 0,
      recognizedPrice: recognizedPrice || 0,
      costPrice: costPrice || 0,
      totalAmount: (recognizedPrice || 0) * (quantityNum || 1),
      notes: notes.trim(),
      isActive: true,
    });

    // Reset form
    setItemName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-lg w-full p-6 shadow-2xl font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
          <div>
            <span className="text-[10px] font-bold text-[#736152] bg-[#FAF8F5] px-2 py-0.5 border border-[#D4C8B8] rounded">
              {partnerName} · {projectName}
            </span>
            <h3 className="text-base font-extrabold text-[#2C2C2C] mt-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-700" />
              신규 제휴 조건 항목 추가
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4 text-xs font-sans">
          <div>
            <label className="block text-xs font-bold text-[#736152] mb-1">
              항목명 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 밸리빌리지 잔디광장 팝업스토어 공간 무상지원"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                제공주체
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as ItemProvider)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {ITEM_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                유형
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LineItemCategory)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {LINE_ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                수량/기간 표기
              </label>
              <input
                type="text"
                placeholder="예: 2일, 30실, 3,000개"
                value={quantityPeriod}
                onChange={(e) => setQuantityPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                수량 계수 (계산용)
              </label>
              <input
                type="number"
                min="1"
                value={quantityNum}
                onChange={(e) => setQuantityNum(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                정상가 (원)
              </label>
              <input
                type="number"
                value={normalPrice}
                onChange={(e) => setNormalPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1 text-amber-900">
                인정과 (원)
              </label>
              <input
                type="number"
                value={recognizedPrice}
                onChange={(e) => setRecognizedPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-black text-amber-950 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#736152] mb-1">
                원가 (원)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#736152] mb-1">비고</label>
            <input
              type="text"
              placeholder="특이사항 및 제휴 조건 메모"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-bold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DDD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF8F5] text-[#736152] font-bold text-xs rounded-xl border border-[#D4C8B8]"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
