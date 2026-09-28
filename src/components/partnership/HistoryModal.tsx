import React from 'react';
import { History, X, Clock, ArrowRight, Tag } from 'lucide-react';
import { PartnerConditionHistory } from '../../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  histories: PartnerConditionHistory[];
  partnerName: string;
  projectName: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  histories,
  partnerName,
  projectName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-xl w-full p-6 shadow-2xl font-sans max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3] shrink-0">
          <div>
            <span className="px-2.5 py-0.5 bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8] rounded text-[10px] font-bold">
              {partnerName} · {projectName}
            </span>
            <h3 className="text-lg font-extrabold text-[#2C2C2C] mt-1 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-700" />
              제휴 조건 변경 이력 (History Log)
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
        <div className="overflow-y-auto my-4 space-y-3 pr-1 text-xs">
          {histories.length === 0 ? (
            <div className="p-8 text-center text-[#8C7A6B] bg-[#FAF8F5] rounded-xl border border-[#E5DDD3]">
              기존 데이터 변경 이력이 없습니다.
            </div>
          ) : (
            histories.map((h) => (
              <div
                key={h.id}
                className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#2C2C2C] text-sm font-extrabold">
                    {h.itemName}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px]">
                    {h.fieldChanged}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#736152] my-1">
                  <span className="bg-white px-2 py-1 rounded border border-[#E5DDD3] font-mono text-gray-600">
                    {h.previousValue}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="bg-amber-50 px-2 py-1 rounded border border-amber-300 font-mono text-amber-950 font-black">
                    {h.newValue}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] pt-1 border-t border-[#F0ECE6]">
                  <span>사유/출처: {h.reason || '조건 조정'}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-[#8C7A6B]" />
                    {h.changedAt}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-[#E5DDD3] shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2C2C2C] hover:bg-[#1A1A1A] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
