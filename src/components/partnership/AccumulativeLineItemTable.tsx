import React, { useState } from 'react';
import {
  Check,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Building2,
  UserCheck,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  PartnerConditionLineItem,
  BarterPlan,
  ItemProvider,
  LineItemCategory,
  LINE_ITEM_CATEGORIES,
  ITEM_PROVIDERS,
} from '../../types';

interface AccumulativeLineItemTableProps {
  lineItems: PartnerConditionLineItem[];
  selectedPlan: BarterPlan | undefined;
  onToggleItemIncludedInPlan: (itemId: string) => void;
  onUpdateLineItem: (id: string, updates: Partial<PartnerConditionLineItem>) => void;
  onDeleteLineItem: (id: string) => void;
  onAddNewLineItem: () => void;
}

export const AccumulativeLineItemTable: React.FC<AccumulativeLineItemTableProps> = ({
  lineItems,
  selectedPlan,
  onToggleItemIncludedInPlan,
  onUpdateLineItem,
  onDeleteLineItem,
  onAddNewLineItem,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PartnerConditionLineItem>>({});

  const isIncluded = (itemId: string) => {
    return selectedPlan?.includedItemIds.includes(itemId) ?? false;
  };

  const handleStartEdit = (item: PartnerConditionLineItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.itemName?.trim()) return;
    const qty = editForm.quantityNum || 1;
    const recPrice = editForm.recognizedPrice || 0;
    const totalAmount = qty * recPrice;

    onUpdateLineItem(id, {
      ...editForm,
      totalAmount,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Totals calculation for items included in selected barter plan
  const includedItems = lineItems.filter((i) => i.isActive && isIncluded(i.id));

  const iparkProvidedValue = includedItems
    .filter((i) => i.provider === 'IPARK리조트')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const partnerProvidedValue = includedItems
    .filter((i) => i.provider === '파트너')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const guaranteedRevenueValue = includedItems
    .filter((i) => i.category === '보장매출')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalCostValue = includedItems.reduce((sum, i) => sum + i.costPrice * i.quantityNum, 0);

  return (
    <div className="bg-white border border-[#E5DDD3] rounded-2xl p-5 shadow-xs mb-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#F0ECE6]">
        <div>
          <h3 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2">
            <span>제휴 조건 Line Item 누적 관리 테이블</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-xs font-bold">
              총 {lineItems.length}개 항목 보유
            </span>
          </h3>
          <p className="text-xs text-[#736152] mt-0.5">
            체크 박스로 선택된 항목만 <strong className="text-amber-800">[{selectedPlan?.planName || '현재 협의안'}]</strong> 계산에 반영됩니다.
          </p>
        </div>

        <button
          onClick={onAddNewLineItem}
          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ 항목 추가</span>
        </button>
      </div>

      {/* Line Item Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5DDD3]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] text-[#736152] font-extrabold border-b border-[#E5DDD3]">
              <th className="p-3 text-center w-12">포함</th>
              <th className="p-3 min-w-[140px]">항목명</th>
              <th className="p-3 w-28">제공주체</th>
              <th className="p-3 w-24">유형</th>
              <th className="p-3 w-24 text-center">수량/기간</th>
              <th className="p-3 w-24 text-right">정상가(단가)</th>
              <th className="p-3 w-28 text-right text-amber-900">인정과(단가)</th>
              <th className="p-3 w-24 text-right">원가</th>
              <th className="p-3 w-28 text-right font-black text-[#2C2C2C]">총액</th>
              <th className="p-3 min-w-[120px]">비고</th>
              <th className="p-3 w-20 text-center">사용여부</th>
              <th className="p-3 w-20 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE6]">
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-[#8C7A6B] bg-[#FAF8F5]/50">
                  등록된 제휴 조건 항목이 없습니다. 상단 [+ 항목 추가] 또는 [📁 파일로 조건 보완]을 이용해 등록해주세요.
                </td>
              </tr>
            ) : (
              lineItems.map((item) => {
                const included = isIncluded(item.id);
                const isEditing = editingId === item.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      !item.isActive
                        ? 'opacity-40 bg-gray-50'
                        : included
                        ? 'bg-amber-50/40 hover:bg-amber-50/70'
                        : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {/* Checkbox for Barter Plan inclusion */}
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => onToggleItemIncludedInPlan(item.id)}
                        disabled={!item.isActive}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                        title={included ? '협의안에서 제외' : '협의안에 포함'}
                      />
                    </td>

                    {/* Item Name */}
                    <td className="p-3 font-extrabold text-[#2C2C2C]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.itemName || ''}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, itemName: e.target.value }))
                          }
                          className="w-full px-2 py-1 bg-white border border-amber-400 rounded text-xs"
                        />
                      ) : (
                        item.itemName
                      )}
                    </td>

                    {/* Provider */}
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          value={editForm.provider || 'IPARK리조트'}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              provider: e.target.value as ItemProvider,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs"
                        >
                          {ITEM_PROVIDERS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${
                            item.provider === 'IPARK리조트'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          }`}
                        >
                          {item.provider}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      {isEditing ? (
                        <select
                          value={editForm.category || '기타'}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              category: e.target.value as LineItemCategory,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs"
                        >
                          {LINE_ITEM_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8] rounded text-[11px] font-bold">
                          {item.category}
                        </span>
                      )}
                    </td>

                    {/* Quantity & Period */}
                    <td className="p-3 text-center font-bold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.quantityPeriod || ''}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              quantityPeriod: e.target.value,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs text-center"
                        />
                      ) : (
                        item.quantityPeriod
                      )}
                    </td>

                    {/* Normal Price */}
                    <td className="p-3 text-right font-mono text-[#736152]">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.normalPrice || 0}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              normalPrice: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs text-right"
                        />
                      ) : (
                        `${item.normalPrice.toLocaleString()}원`
                      )}
                    </td>

                    {/* Recognized Price */}
                    <td className="p-3 text-right font-mono font-extrabold text-amber-900 bg-amber-50/50">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.recognizedPrice || 0}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              recognizedPrice: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs text-right font-bold"
                        />
                      ) : (
                        `${item.recognizedPrice.toLocaleString()}원`
                      )}
                    </td>

                    {/* Cost Price */}
                    <td className="p-3 text-right font-mono text-[#8C7A6B]">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.costPrice || 0}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              costPrice: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs text-right"
                        />
                      ) : (
                        `${item.costPrice.toLocaleString()}원`
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="p-3 text-right font-mono font-black text-[#2C2C2C]">
                      {item.totalAmount.toLocaleString()}원
                    </td>

                    {/* Notes */}
                    <td className="p-3 text-[#736152] truncate max-w-[160px]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.notes || ''}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                          }
                          className="w-full px-1.5 py-1 bg-white border border-amber-400 rounded text-xs"
                        />
                      ) : (
                        item.notes || '-'
                      )}
                    </td>

                    {/* Is Active Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          onUpdateLineItem(item.id, { isActive: !item.isActive })
                        }
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer border ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-gray-200 text-gray-600 border-gray-300'
                        }`}
                      >
                        {item.isActive ? 'ON' : 'OFF'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 bg-emerald-600 text-white rounded cursor-pointer"
                            title="저장"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-gray-400 text-white rounded cursor-pointer"
                            title="취소"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] rounded cursor-pointer"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLineItem(item.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Metrics Bar */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-center">
          <span className="text-[11px] font-bold text-[#736152] block">
            IPARK리조트 제공가치
          </span>
          <span className="text-base font-black text-amber-900 mt-0.5 block font-mono">
            {iparkProvidedValue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-center">
          <span className="text-[11px] font-bold text-[#736152] block">
            파트너 제공가치
          </span>
          <span className="text-base font-black text-indigo-900 mt-0.5 block font-mono">
            {partnerProvidedValue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-center">
          <span className="text-[11px] font-bold text-[#736152] block">
            포함 보장매출
          </span>
          <span className="text-base font-black text-emerald-900 mt-0.5 block font-mono">
            {guaranteedRevenueValue.toLocaleString()} 원
          </span>
        </div>

        <div className="p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl text-center">
          <span className="text-[11px] font-bold text-[#736152] block">
            가치 차이 (파트너 - 리조트)
          </span>
          <span
            className={`text-base font-black mt-0.5 block font-mono ${
              partnerProvidedValue - iparkProvidedValue >= 0
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {(partnerProvidedValue - iparkProvidedValue).toLocaleString()} 원
          </span>
        </div>
      </div>
    </div>
  );
};
