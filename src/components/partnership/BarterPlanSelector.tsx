import React, { useState } from 'react';
import {
  Building2,
  FolderGit2,
  Layers,
  Plus,
  FileSpreadsheet,
  History,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { BarterPlan } from '../../types';

interface BarterPlanSelectorProps {
  partnerNames: string[];
  selectedPartner: string;
  onSelectPartner: (partner: string) => void;

  projectNames: string[];
  selectedProject: string;
  onSelectProject: (project: string) => void;

  plans: BarterPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;

  onAddNewPartner: (partnerName: string, projectName: string) => void;
  onAddNewPlan: (planName: string, description: string) => void;
  onOpenUploadModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenAddItemModal: () => void;
  onResetSelectionState: () => void;
}

export const BarterPlanSelector: React.FC<BarterPlanSelectorProps> = ({
  partnerNames,
  selectedPartner,
  onSelectPartner,
  projectNames,
  selectedProject,
  onSelectProject,
  plans,
  selectedPlanId,
  onSelectPlan,
  onAddNewPartner,
  onAddNewPlan,
  onOpenUploadModal,
  onOpenHistoryModal,
  onOpenAddItemModal,
  onResetSelectionState,
}) => {
  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [newPartnerInput, setNewPartnerInput] = useState<string>('');
  const [newProjectInput, setNewProjectInput] = useState<string>('');

  const [showAddPlanModal, setShowAddPlanModal] = useState<boolean>(false);
  const [newPlanNameInput, setNewPlanNameInput] = useState<string>('');
  const [newPlanDescInput, setNewPlanDescInput] = useState<string>('');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleCreatePartner = () => {
    if (!newPartnerInput.trim()) return;
    const projName = newProjectInput.trim() || '2026 오크밸리 신규 제휴 프로젝트';
    onAddNewPartner(newPartnerInput.trim(), projName);
    setShowAddPartnerModal(false);
    setNewPartnerInput('');
    setNewProjectInput('');
  };

  const handleCreatePlan = () => {
    if (!newPlanNameInput.trim()) return;
    onAddNewPlan(newPlanNameInput.trim(), newPlanDescInput.trim());
    setShowAddPlanModal(false);
    setNewPlanNameInput('');
    setNewPlanDescInput('');
  };

  return (
    <div className="bg-white border border-[#E5DDD3] rounded-2xl p-5 shadow-xs mb-6 font-sans">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0ECE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8] text-xs font-bold rounded-lg flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#8C7A6B]" />
              제휴 조건 DB & 바터 협의안 관리 Engine
            </span>
            <span className="text-xs text-[#8C7A6B] font-medium">
              * 기존 DB는 항상 안전하게 보존됩니다.
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#2C2C2C] mt-1.5 flex items-center gap-2">
            조회 및 협의안 선택
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddItemModal}
            className="px-3.5 py-2 bg-[#2C2C2C] hover:bg-[#1A1A1A] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ 신규 조건 추가</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="PDF, Excel 등 파일에서 새로운 제휴 조건을 추출하여 기존 DB를 보완합니다"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
            <span>📁 파일로 조건 보완</span>
          </button>

          <button
            onClick={onOpenHistoryModal}
            className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F5F0EB] text-[#736152] border border-[#D4C8B8] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="조건 변경 이력을 조회합니다"
          >
            <History className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <span>변경 이력</span>
          </button>

          <button
            onClick={onResetSelectionState}
            className="px-2.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            title="조회 선택 상태만 초기화합니다 (저장된 파트너 DB는 그대로 유지됩니다)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>조회 리셋</span>
          </button>
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Partner Dropdown */}
        <div>
          <label className="block text-xs font-bold text-[#736152] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
              1. 파트너 선택
            </span>
            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 underline cursor-pointer"
            >
              + 파트너 등록
            </button>
          </label>
          <select
            value={selectedPartner}
            onChange={(e) => onSelectPartner(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs font-extrabold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {partnerNames.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Project Dropdown */}
        <div>
          <label className="block text-xs font-bold text-[#736152] mb-1.5 flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
            2. 프로젝트 선택
          </label>
          <select
            value={selectedProject}
            onChange={(e) => onSelectProject(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs font-extrabold text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {projectNames.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Barter Plan Dropdown */}
        <div>
          <label className="block text-xs font-bold text-[#736152] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-700" />
              3. 바터 협의안 선택
            </span>
            <button
              onClick={() => setShowAddPlanModal(true)}
              className="text-[11px] font-extrabold text-amber-700 hover:text-amber-800 underline cursor-pointer"
            >
              + 새 협의안 작성
            </button>
          </label>
          <select
            value={selectedPlanId}
            onChange={(e) => onSelectPlan(e.target.value)}
            className="w-full px-3 py-2.5 bg-amber-50/70 border border-amber-300 rounded-xl text-xs font-extrabold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.planName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currently Selected Barter Plan Description Banner */}
      {selectedPlan && (
        <div className="mt-4 p-3 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-amber-600 text-white font-extrabold rounded-md text-[10px] shrink-0">
              선택된 협의안
            </span>
            <span className="font-extrabold text-[#2C2C2C] truncate">
              {selectedPlan.planName}
            </span>
            {selectedPlan.description && (
              <span className="text-[#736152] truncate hidden md:inline">
                ({selectedPlan.description})
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#8C7A6B] shrink-0">
            포함 항목: {selectedPlan.includedItemIds.length}개
          </span>
        </div>
      )}

      {/* MODAL 1: ADD NEW PARTNER */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-md w-full p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <h3 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-700" />
                신규 파트너 및 프로젝트 등록
              </h3>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-[#736152] mb-1">
                  파트너사 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 스노우피크 코리아"
                  value={newPartnerInput}
                  onChange={(e) => setNewPartnerInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs text-[#2C2C2C] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#736152] mb-1">
                  프로젝트 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 2026 가을 오토캠핑 페스티벌"
                  value={newProjectInput}
                  onChange={(e) => setNewProjectInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs text-[#2C2C2C] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DDD3]">
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="px-4 py-2 bg-[#FAF8F5] text-[#736152] font-bold text-xs rounded-xl border border-[#D4C8B8]"
              >
                취소
              </button>
              <button
                onClick={handleCreatePartner}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW BARTER PLAN */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-md w-full p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <h3 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-700" />
                신규 바터 협의안 추가
              </h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-bold text-[#736152] mb-1">
                  협의안 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 협의안 D (홍보+보장매출 결합형)"
                  value={newPlanNameInput}
                  onChange={(e) => setNewPlanNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs text-[#2C2C2C] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#736152] mb-1">
                  협의안 요약 설명
                </label>
                <input
                  type="text"
                  placeholder="예: 객실 20실 및 앱 배너 구좌 조합안"
                  value={newPlanDescInput}
                  onChange={(e) => setNewPlanDescInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs text-[#2C2C2C] font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DDD3]">
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="px-4 py-2 bg-[#FAF8F5] text-[#736152] font-bold text-xs rounded-xl border border-[#D4C8B8]"
              >
                취소
              </button>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                협의안 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
