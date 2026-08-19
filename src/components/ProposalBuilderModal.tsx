import React, { useState, useEffect } from 'react';
import {
  ProposalData,
  ProposalMode,
  ProposalSection,
  CompanyReport,
  DealProfitabilityResult,
  PartnerTargetInput,
} from '../types';
import {
  exportProposalToPPTX,
  exportProposalToDOCX,
  exportProposalToXLSX,
} from '../utils/exportHelpers';
import {
  FileText,
  X,
  Sparkles,
  Download,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Send,
  Sliders,
} from 'lucide-react';

interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyReport: CompanyReport | null;
  barterPackage: any | null;
  profitabilityData: DealProfitabilityResult | null;
  projectInput: PartnerTargetInput | null;
}

export const ProposalBuilderModal: React.FC<ProposalBuilderModalProps> = ({
  isOpen,
  onClose,
  companyReport,
  barterPackage,
  profitabilityData,
  projectInput,
}) => {
  const [proposalMode, setProposalMode] = useState<ProposalMode>('INTERNAL');
  const [userInstructions, setUserInstructions] = useState<string>('');
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  const companyName =
    companyReport?.companyName ||
    barterPackage?.companyName ||
    projectInput?.projectName ||
    'Garmin';

  // Fetch / Generate proposal when modal opens or mode changes
  const fetchProposal = async (mode: ProposalMode, customInstruction?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalMode: mode,
          companyReport,
          barterPackage,
          profitabilityData,
          projectInput,
          userInstructions: customInstruction || userInstructions,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.proposal) {
        setProposalData(data.proposal);
      }
    } catch (err) {
      console.error('Error generating proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProposal(proposalMode);
    }
  }, [isOpen, proposalMode]);

  if (!isOpen) return null;

  // Section Editing Helpers
  const handleStartEdit = (sec: ProposalSection) => {
    setEditingSectionId(sec.id);
    setEditingContent(sec.content);
  };

  const handleSaveEdit = (secId: string) => {
    if (!proposalData) return;
    const updatedSections = proposalData.sections.map((s) =>
      s.id === secId ? { ...s, content: editingContent } : s
    );
    setProposalData({ ...proposalData, sections: updatedSections });
    setEditingSectionId(null);
  };

  const handleDeleteSection = (secId: string) => {
    if (!proposalData) return;
    const updatedSections = proposalData.sections.filter((s) => s.id !== secId);
    setProposalData({ ...proposalData, sections: updatedSections });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!proposalData) return;
    const sections = [...proposalData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    setProposalData({ ...proposalData, sections });
  };

  // Export handlers
  const handleExportPPTX = async () => {
    if (!proposalData) return;
    await exportProposalToPPTX(proposalData);
  };

  const handleExportDOCX = async () => {
    if (!proposalData) return;
    await exportProposalToDOCX(proposalData);
  };

  const handleExportXLSX = () => {
    if (!proposalData) return;
    exportProposalToXLSX(proposalData, barterPackage, profitabilityData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#EFECE6] border-b border-[#D4C8B8] flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-[#736152] text-white font-medium mb-1">
              <Sparkles className="w-3 h-3 text-[#D4C8B8]" />
              <span>PROPOSAL BUILDER ENGINE</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
              <span>{companyName} X Oak Valley 제휴 제안서 초안</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Selector Toggle */}
            <div className="bg-[#E5DFD5] p-1 rounded-xs flex items-center space-x-1 border border-[#D4C8B8]">
              <button
                type="button"
                onClick={() => setProposalMode('INTERNAL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer flex items-center space-x-1 ${
                  proposalMode === 'INTERNAL'
                    ? 'bg-[#736152] text-white shadow-xs'
                    : 'text-[#66584C] hover:text-[#2C2C2C]'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>내부 보고용 (INTERNAL)</span>
              </button>

              <button
                type="button"
                onClick={() => setProposalMode('PARTNER')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer flex items-center space-x-1 ${
                  proposalMode === 'PARTNER'
                    ? 'bg-[#736152] text-white shadow-xs'
                    : 'text-[#66584C] hover:text-[#2C2C2C]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>외부 파트너 제시용 (PARTNER)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#786658] hover:text-[#2C2C2C] hover:bg-[#E5DFD5] rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 grow">
          
          {/* Export Action Bar & Mode Warning */}
          <div className="bg-white border border-[#E8E4DC] p-4 rounded-xs shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#66584C] font-mono">
              {proposalMode === 'INTERNAL' ? (
                <span className="text-[#736152] font-semibold flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>내부 보고용: 원가/기회비용/Deal Margin/협상 리스크 포함 (14개 섹션 전체)</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>외부 파트너용: 내부 원가/마진 자동 제외, 파트너 ROI/가치 제고 서술로 전환</span>
                </span>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleExportPPTX}
                disabled={loading || !proposalData}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#D4C8B8]" />
                <span>PPTX 다운로드 (.pptx)</span>
              </button>

              <button
                onClick={handleExportDOCX}
                disabled={loading || !proposalData}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#2C2C2C] border border-[#D4C8B8] text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-[#736152]" />
                <span>Word 다운로드 (.docx)</span>
              </button>

              <button
                onClick={handleExportXLSX}
                disabled={loading || !proposalData}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#2C2C2C] border border-[#D4C8B8] text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Excel 다운로드 (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Prompt Instruction Bar */}
          <div className="bg-white border border-[#E8E4DC] p-4 rounded-xs shadow-xs space-y-2">
            <label className="block text-xs font-mono uppercase font-semibold text-[#2C2C2C] flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-[#736152]" />
              <span>AI 제안서 수정 및 프롬프트 지도 (Natural Language Instruction)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="예: '상부 보고용으로 13번 손익 부분을 핵심 요약해줘', '브랜드 Benefit을 더 강조해줘'"
                className="grow px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              />
              <button
                type="button"
                onClick={() => fetchProposal(proposalMode, userInstructions)}
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4C8B8]" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-[#D4C8B8]" />
                )}
                <span>제안서 재구성</span>
              </button>
            </div>
          </div>

          {/* Proposal Section Cards */}
          {loading ? (
            <div className="p-16 bg-white border border-[#E8E4DC] rounded-xs text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#736152]" />
              <div className="text-sm font-semibold font-serif text-[#2C2C2C]">
                통합 분석 데이터 및 제휴 조건 반영 중...
              </div>
              <p className="text-xs text-[#8C7A6B] font-mono">
                Knowledge Base 규격, 손익 수치, 매체 구좌 데이터 통합 14개 섹션 생성 중
              </p>
            </div>
          ) : proposalData ? (
            <div className="space-y-4">
              {proposalData.sections.map((sec, idx) => {
                const isEditing = editingSectionId === sec.id;
                const isInternalOnly = sec.isInternalOnly;

                // If in partner mode and section is internal only, skip rendering
                if (proposalMode === 'PARTNER' && isInternalOnly) {
                  return null;
                }

                return (
                  <div
                    key={sec.id}
                    className={`bg-white border rounded-xs p-5 shadow-xs transition-all ${
                      isInternalOnly
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-[#E8E4DC] hover:border-[#D4C8B8]'
                    }`}
                  >
                    {/* Section Top Header */}
                    <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold font-serif text-[#2C2C2C]">
                          {sec.title}
                        </h3>

                        {isInternalOnly && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-semibold rounded-xs flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>내부 전용 (Internal Only)</span>
                          </span>
                        )}
                      </div>

                      {/* Section Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleMoveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] disabled:opacity-30 cursor-pointer"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSection(idx, 'down')}
                          disabled={idx === proposalData.sections.length - 1}
                          className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] disabled:opacity-30 cursor-pointer"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {!isEditing ? (
                          <button
                            onClick={() => handleStartEdit(sec)}
                            className="p-1 text-[#736152] hover:text-[#2C2C2C] cursor-pointer"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveEdit(sec.id)}
                            className="px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-semibold rounded-xs cursor-pointer"
                          >
                            저장
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Body */}
                    {isEditing ? (
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-[#FAF8F5] border border-[#736152] rounded-xs text-xs text-[#2C2C2C] font-mono leading-relaxed focus:outline-none"
                      />
                    ) : (
                      <div className="text-xs text-[#2C2C2C] leading-relaxed whitespace-pre-line font-sans">
                        {sec.content}
                      </div>
                    )}

                    {/* Fact / Strategic Proposal / Source Badges */}
                    <div className="mt-4 pt-3 border-t border-[#F5F2EB] grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      {sec.factSummary && (
                        <div className="bg-[#FAF8F5] p-2.5 rounded-xs border border-[#E8E4DC]">
                          <span className="font-mono uppercase text-[#736152] font-semibold block mb-0.5">
                            ✓ FACT SUMMARY (확인된 데이터)
                          </span>
                          <span className="text-[#2C2C2C]">{sec.factSummary}</span>
                        </div>
                      )}

                      {sec.strategicProposal && (
                        <div className="bg-[#F5F2EB] p-2.5 rounded-xs border border-[#D4C8B8]">
                          <span className="font-mono uppercase text-[#2C2C2C] font-semibold block mb-0.5">
                            ★ STRATEGIC PROPOSAL (AI 제안 방향)
                          </span>
                          <span className="text-[#5C4E43]">{sec.strategicProposal}</span>
                        </div>
                      )}
                    </div>

                    {sec.sourceCitation && (
                      <div className="mt-2 text-[10px] text-[#8C7A6B] font-mono italic text-right">
                        Source: {sec.sourceCitation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#EFECE6] border-t border-[#D4C8B8] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#786658] font-mono">
            Oak Valley & PARK ROCHE Partnership Proposal Builder v2.0
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer"
          >
            닫기 (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
