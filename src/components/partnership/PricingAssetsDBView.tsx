import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Plus,
  Search,
  Filter,
  History,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  FileText,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PricingAssetItem,
  PricingAssetCategory,
  PriceHistoryRecord,
} from '../../types';

const CATEGORIES: PricingAssetCategory[] = [
  '객실',
  '골프',
  '공간',
  '사우나',
  '클래스',
  '광고',
  'F&B',
  '기타',
];

export const PricingAssetsDBView: React.FC = () => {
  const [items, setItems] = useState<PricingAssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<PricingAssetItem> | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<PricingAssetItem | null>(null);

  // Upload & Extraction States
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateIndices, setSelectedCandidateIndices] = useState<number[]>([]);
  const [duplicateResolutionMap, setDuplicateResolutionMap] = useState<Record<number, 'keep' | 'update' | 'separate'>>({});

  useEffect(() => {
    fetchPricingAssets();
  }, []);

  const fetchPricingAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pricing-assets');
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      }
    } catch (e) {
      console.error('Failed to fetch pricing assets:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveAllItems = async (newItems: PricingAssetItem[]) => {
    setItems(newItems);
    try {
      await fetch('/api/pricing-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems }),
      });
    } catch (e) {
      console.error('Failed to save pricing assets:', e);
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updated = { ...target, isActive: !target.isActive };
    try {
      const res = await fetch(`/api/pricing-assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: updated.isActive }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === id ? updated : i)));
      }
    } catch (e) {
      console.error('Failed to toggle active state:', e);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 가격 변경 이력도 함께 제거됩니다.')) return;
    try {
      const res = await fetch(`/api/pricing-assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete item:', e);
    }
  };

  // Save or Update Single Item
  const handleSaveSingleItem = async (itemData: Partial<PricingAssetItem>) => {
    try {
      const res = await fetch('/api/pricing-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemData }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      }
      setShowAddEditModal(false);
      setEditingItem(null);
    } catch (e) {
      console.error('Save single item error:', e);
    }
  };

  // Upload File & Extract AI Candidates
  const handleFileUploadAndExtract = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/pricing-assets/upload-extract', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.candidates && Array.isArray(data.candidates)) {
          setCandidates(data.candidates);
          // Select all candidates by default
          setSelectedCandidateIndices(data.candidates.map((_: any, idx: number) => idx));

          // Check duplicates against current items
          const initialResolutions: Record<number, 'keep' | 'update' | 'separate'> = {};
          data.candidates.forEach((cand: any, idx: number) => {
            const isDup = items.some(
              (item) => item.itemName.trim().toLowerCase() === cand.itemName.trim().toLowerCase()
            );
            if (isDup) {
              initialResolutions[idx] = 'update'; // Default duplicate choice: update
            } else {
              initialResolutions[idx] = 'separate';
            }
          });
          setDuplicateResolutionMap(initialResolutions);
        }
      } else {
        alert('파일에서 가격 데이터를 추출하지 못했습니다.');
      }
    } catch (e) {
      console.error('Upload extract error:', e);
      alert('파일 업로드 처리 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // Confirm Approved Candidates
  const handleConfirmCandidates = async () => {
    if (selectedCandidateIndices.length === 0) {
      alert('저장할 항목을 1개 이상 선택해 주세요.');
      return;
    }

    let updatedItems = [...items];

    selectedCandidateIndices.forEach((idx) => {
      const cand = candidates[idx];
      const resolution = duplicateResolutionMap[idx] || 'separate';

      const existingIdx = updatedItems.findIndex(
        (i) => i.itemName.trim().toLowerCase() === cand.itemName.trim().toLowerCase()
      );

      if (existingIdx >= 0) {
        if (resolution === 'keep') {
          // Do nothing (keep existing value)
          return;
        } else if (resolution === 'update') {
          // Update existing item value & record history
          const old = updatedItems[existingIdx];
          const historyEntry: PriceHistoryRecord = {
            id: `hist-${Date.now()}-${idx}`,
            changeDate: new Date().toISOString().substring(0, 10),
            oldNormalPrice: old.normalPrice,
            newNormalPrice: Number(cand.normalPrice) || old.normalPrice,
            oldPartnerPrice: old.partnerPrice,
            newPartnerPrice: Number(cand.partnerPrice) || old.partnerPrice,
            reasonOrFile: cand.sourceFile || uploadFile?.name || '신규 단가표 업로드 반영',
          };

          updatedItems[existingIdx] = {
            ...old,
            category: cand.category || old.category,
            specCondition: cand.specCondition || old.specCondition,
            unit: cand.unit || old.unit,
            normalPrice: Number(cand.normalPrice) || old.normalPrice,
            partnerPrice: Number(cand.partnerPrice) || old.partnerPrice,
            costPrice: Number(cand.costPrice) || old.costPrice,
            notes: cand.notes || old.notes,
            sourceFile: cand.sourceFile || uploadFile?.name || old.sourceFile,
            updatedAt: new Date().toISOString(),
            history: [historyEntry, ...(old.history || [])],
          };
          return;
        }
      }

      // Add as separate item
      const newItem: PricingAssetItem = {
        id: `pa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: (cand.category as PricingAssetCategory) || '기타',
        itemName: cand.itemName || '추출 항목',
        specCondition: cand.specCondition || '-',
        unit: cand.unit || '1식',
        normalPrice: Number(cand.normalPrice) || 0,
        partnerPrice: Number(cand.partnerPrice) || 0,
        costPrice: Number(cand.costPrice) || 0,
        notes: cand.notes || '',
        sourceFile: cand.sourceFile || uploadFile?.name || '업로드 파일',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      };
      updatedItems.unshift(newItem);
    });

    await saveAllItems(updatedItems);
    setShowUploadModal(false);
    setUploadFile(null);
    setCandidates([]);
    alert('가격자료 DB에 추출된 항목이 정상적으로 반영되었습니다.');
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specCondition && item.specCondition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.sourceFile && item.sourceFile.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? item.isActive
        : !item.isActive;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#736152] uppercase">
              <FileSpreadsheet className="w-4 h-4" />
              <span>IPARK RESORT &middot; MASTER PRICING ASSETS DB</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mt-1">
              가격자료 DB
            </h1>
            <p className="text-xs sm:text-sm text-[#786658] font-light max-w-3xl leading-relaxed mt-1">
              오크밸리와 파크로쉬 리조트의 객실, 골프, 공간, F&amp;B, 광고 등 단가표 자료를 체계적으로 관리합니다. 파일 업로드 시 기존 데이터는 보존되며 누적 관리됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setUploadFile(null);
                setCandidates([]);
                setShowUploadModal(true);
              }}
              className="px-4 py-2 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>단가표 파일 업로드</span>
            </button>
            <button
              onClick={() => {
                setEditingItem({
                  category: '객실',
                  itemName: '',
                  specCondition: '',
                  unit: '1실',
                  normalPrice: 0,
                  partnerPrice: 0,
                  costPrice: 0,
                  notes: '',
                  sourceFile: '수동 직접 입력',
                  isActive: true,
                });
                setShowAddEditModal(true);
              }}
              className="px-4 py-2 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>항목 직접 추가</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1 pt-2 overflow-x-auto scrollbar-none border-t border-[#E8E4DC]">
          <button
            onClick={() => setSelectedCategory('전체')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === '전체'
                ? 'bg-[#736152] text-white font-semibold'
                : 'text-[#5C4E43] hover:bg-[#EFECE6]'
            }`}
          >
            전체 ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#736152] text-white font-semibold'
                    : 'text-[#5C4E43] hover:bg-[#EFECE6]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="항목명, 규격, 출처파일 검색..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1 bg-[#FAF8F5] p-1 border border-[#D4C8B8] rounded-xs text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-2xs text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#736152] text-white' : 'text-[#786658] hover:text-[#2C2C2C]'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-2xs text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-[#736152] text-white' : 'text-[#786658] hover:text-[#2C2C2C]'
              }`}
            >
              활성 항목
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-1 rounded-2xs text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-[#736152] text-white' : 'text-[#786658] hover:text-[#2C2C2C]'
              }`}
            >
              비활성
            </button>
          </div>
        </div>
      </div>

      {/* Cumulative Table */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-20">카테고리</th>
                <th className="py-3 px-4 min-w-[160px]">항목명</th>
                <th className="py-3 px-4 min-w-[140px]">규격/조건</th>
                <th className="py-3 px-4 w-20 text-center">단위</th>
                <th className="py-3 px-4 text-right">정상가</th>
                <th className="py-3 px-4 text-right">제휴가</th>
                <th className="py-3 px-4 text-right">원가</th>
                <th className="py-3 px-4 min-w-[120px]">비고</th>
                <th className="py-3 px-4 min-w-[140px]">출처파일</th>
                <th className="py-3 px-4 text-center w-20">상태</th>
                <th className="py-3 px-4 text-center w-24">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#8C7A6B]">
                    가격자료 DB 데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#8C7A6B]">
                    등록된 가격 항목이 없습니다. 단가표 파일(PDF, XLSX, CSV 등)을 업로드해 보세요.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#FAF8F5] transition-colors ${
                      !item.isActive ? 'opacity-50 bg-gray-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-[#736152]">
                      <span className="px-2 py-0.5 bg-[#F5F2EB] rounded-2xs border border-[#D4C8B8] text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2C2C2C]">{item.itemName}</td>
                    <td className="py-3 px-4 text-[#5C4E43]">{item.specCondition || '-'}</td>
                    <td className="py-3 px-4 text-center text-[#786658] font-mono">{item.unit || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-[#2C2C2C]">
                      {item.normalPrice ? item.normalPrice.toLocaleString() + '원' : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#736152]">
                      {item.partnerPrice ? item.partnerPrice.toLocaleString() + '원' : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#8C7A6B]">
                      {item.costPrice ? item.costPrice.toLocaleString() + '원' : '-'}
                    </td>
                    <td className="py-3 px-4 text-[#786658] max-w-[180px] truncate" title={item.notes}>
                      {item.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-[#8C7A6B] max-w-[150px] truncate font-mono text-[11px]" title={item.sourceFile}>
                      {item.sourceFile || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-2 py-0.5 rounded-2xs text-[10px] font-bold cursor-pointer transition-colors ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {item.isActive ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {item.history && item.history.length > 0 && (
                          <button
                            onClick={() => setShowHistoryModal(item)}
                            title="가격 변경 이력 보기"
                            className="p-1 text-[#736152] hover:text-[#2C2C2C] rounded-2xs hover:bg-[#EFECE6]"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowAddEditModal(true);
                          }}
                          title="수정"
                          className="p-1 text-[#5C4E43] hover:text-[#2C2C2C] rounded-2xs hover:bg-[#EFECE6]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="삭제"
                          className="p-1 text-rose-600 hover:text-rose-800 rounded-2xs hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Upload & Extract Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-4xl p-6 space-y-5 animate-in fade-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-4">
              <div className="flex items-center space-x-2 text-[#736152] font-bold text-sm">
                <Upload className="w-4 h-4" />
                <span>가격자료 단가표 업로드 및 AI 테이블 추출</span>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Upload File */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#2C2C2C]">
                지원 파일 포맷: PDF, XLSX, XLS, CSV, DOCX
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-[#5C4E43] file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#736152] file:text-white hover:file:bg-[#5C4E43] cursor-pointer"
                />
                <button
                  onClick={handleFileUploadAndExtract}
                  disabled={!uploadFile || isUploading}
                  className={`px-4 py-2 rounded-xs text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    !uploadFile || isUploading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#736152] text-white hover:bg-[#5C4E43]'
                  }`}
                >
                  {isUploading ? 'AI 추출 중...' : '파일 분석 및 항목 추출'}
                </button>
              </div>
            </div>

            {/* Step 2: Review Extracted Candidate Table */}
            {candidates.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3 pt-2">
                <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC]">
                  <span className="text-xs font-bold text-[#2C2C2C]">
                    AI가 추출한 항목 후보 ({candidates.length}건) - 검토 후 저장할 항목을 선택해 주세요.
                  </span>
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => setSelectedCandidateIndices(candidates.map((_, i) => i))}
                      className="text-[#736152] underline font-medium cursor-pointer"
                    >
                      전체 선택
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => setSelectedCandidateIndices([])}
                      className="text-[#786658] underline font-medium cursor-pointer"
                    >
                      전체 해제
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#E8E4DC] rounded-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold">
                      <tr>
                        <th className="p-2.5 text-center w-10">선택</th>
                        <th className="p-2.5 w-20">카테고리</th>
                        <th className="p-2.5">항목명</th>
                        <th className="p-2.5">규격/조건</th>
                        <th className="p-2.5 text-center w-16">단위</th>
                        <th className="p-2.5 text-right">정상가</th>
                        <th className="p-2.5 text-right">제휴가</th>
                        <th className="p-2.5 text-right">원가</th>
                        <th className="p-2.5">중복 처리 옵션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4DC]">
                      {candidates.map((cand, idx) => {
                        const isSelected = selectedCandidateIndices.includes(idx);
                        const isDup = items.some(
                          (i) => i.itemName.trim().toLowerCase() === cand.itemName?.trim().toLowerCase()
                        );

                        return (
                          <tr key={idx} className={isSelected ? 'bg-amber-50/40' : 'bg-gray-50/50'}>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCandidateIndices([...selectedCandidateIndices, idx]);
                                  } else {
                                    setSelectedCandidateIndices(selectedCandidateIndices.filter((i) => i !== idx));
                                  }
                                }}
                                className="accent-[#736152]"
                              />
                            </td>
                            <td className="p-2.5">
                              <select
                                value={cand.category || '기타'}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].category = e.target.value;
                                  setCandidates(next);
                                }}
                                className="bg-white border border-[#D4C8B8] rounded-2xs px-1 py-0.5 text-xs"
                              >
                                {CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={cand.itemName || ''}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].itemName = e.target.value;
                                  setCandidates(next);
                                }}
                                className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-1.5 py-0.5 font-bold"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={cand.specCondition || ''}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].specCondition = e.target.value;
                                  setCandidates(next);
                                }}
                                className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-1.5 py-0.5"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="text"
                                value={cand.unit || ''}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].unit = e.target.value;
                                  setCandidates(next);
                                }}
                                className="w-16 bg-white border border-[#D4C8B8] rounded-2xs px-1 text-center font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={cand.normalPrice || 0}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].normalPrice = Number(e.target.value);
                                  setCandidates(next);
                                }}
                                className="w-24 bg-white border border-[#D4C8B8] rounded-2xs px-1.5 py-0.5 text-right font-mono"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={cand.partnerPrice || 0}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].partnerPrice = Number(e.target.value);
                                  setCandidates(next);
                                }}
                                className="w-24 bg-white border border-[#D4C8B8] rounded-2xs px-1.5 py-0.5 text-right font-mono font-bold text-[#736152]"
                              />
                            </td>
                            <td className="p-2.5 text-right">
                              <input
                                type="number"
                                value={cand.costPrice || 0}
                                onChange={(e) => {
                                  const next = [...candidates];
                                  next[idx].costPrice = Number(e.target.value);
                                  setCandidates(next);
                                }}
                                className="w-20 bg-white border border-[#D4C8B8] rounded-2xs px-1.5 py-0.5 text-right font-mono text-[#8C7A6B]"
                              />
                            </td>
                            <td className="p-2.5">
                              {isDup ? (
                                <select
                                  value={duplicateResolutionMap[idx] || 'update'}
                                  onChange={(e) => {
                                    setDuplicateResolutionMap({
                                      ...duplicateResolutionMap,
                                      [idx]: e.target.value as any,
                                    });
                                  }}
                                  className="bg-amber-100 border border-amber-300 rounded-2xs px-1.5 py-0.5 text-[11px] font-bold text-amber-900"
                                >
                                  <option value="update">새값으로 업데이트</option>
                                  <option value="keep">기존값 유지</option>
                                  <option value="separate">별도 항목으로 추가</option>
                                </select>
                              ) : (
                                <span className="text-[11px] text-gray-500 font-medium">신규 항목</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 border-t border-[#E8E4DC] pt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-[#D4C8B8] text-[#5C4E43] hover:bg-[#F5F2EB] rounded-xs text-xs font-semibold cursor-pointer"
              >
                취소
              </button>
              {candidates.length > 0 && (
                <button
                  onClick={handleConfirmCandidates}
                  className="px-5 py-2 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold shadow-2xs cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>검토 완료 및 가격자료 DB에 저장 ({selectedCandidateIndices.length}건)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add / Edit Single Item Modal */}
      {showAddEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="font-bold text-sm text-[#2C2C2C]">
                {editingItem.id ? '가격 항목 수정' : '신규 가격 항목 직접 추가'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEditModal(false);
                  setEditingItem(null);
                }}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#736152] mb-1">카테고리</label>
                <select
                  value={editingItem.category || '객실'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#736152] mb-1">단위</label>
                <input
                  type="text"
                  value={editingItem.unit || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  placeholder="예: 1실, 1팀, 1회"
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#736152] mb-1">항목명</label>
                <input
                  type="text"
                  value={editingItem.itemName || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                  placeholder="예: 밸리빌리지 31평형 객실"
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#736152] mb-1">규격 / 조건</label>
                <input
                  type="text"
                  value={editingItem.specCondition || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, specCondition: e.target.value })}
                  placeholder="예: 주중 (일~목) / 클린타입"
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#736152] mb-1">정상가 (원)</label>
                <input
                  type="number"
                  value={editingItem.normalPrice || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, normalPrice: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#736152] mb-1">제휴가 (원)</label>
                <input
                  type="number"
                  value={editingItem.partnerPrice || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, partnerPrice: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-mono font-bold text-[#736152]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#736152] mb-1">원가 (원)</label>
                <input
                  type="number"
                  value={editingItem.costPrice || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, costPrice: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-mono text-[#8C7A6B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#736152] mb-1">출처 파일</label>
                <input
                  type="text"
                  value={editingItem.sourceFile || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, sourceFile: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-[#736152] mb-1">비고</label>
                <input
                  type="text"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="특이사항 및 이용 조건 메모"
                  className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E4DC]">
              <button
                onClick={() => {
                  setShowAddEditModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-[#D4C8B8] text-[#5C4E43] hover:bg-[#F5F2EB] rounded-xs text-xs font-semibold cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleSaveSingleItem(editingItem)}
                className="px-4 py-2 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold shadow-2xs cursor-pointer"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Price History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div className="flex items-center space-x-2 text-[#736152] font-bold text-sm">
                <History className="w-4 h-4" />
                <span>가격 변경 이력 - {showHistoryModal.itemName}</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(null)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {showHistoryModal.history && showHistoryModal.history.length > 0 ? (
                showHistoryModal.history.map((hist) => (
                  <div key={hist.id} className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#786658]">
                      <span>변경일: {hist.changeDate}</span>
                      <span>출처/사유: {hist.reasonOrFile}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8E4DC]/60">
                      <div>
                        <span className="text-[#8C7A6B]">기존 정상가:</span>{' '}
                        <span className="line-through">{hist.oldNormalPrice.toLocaleString()}원</span> &rarr;{' '}
                        <span className="font-bold text-[#2C2C2C]">{hist.newNormalPrice.toLocaleString()}원</span>
                      </div>
                      {hist.newPartnerPrice !== undefined && (
                        <div>
                          <span className="text-[#8C7A6B]">제휴가:</span>{' '}
                          <span className="font-bold text-[#736152]">{hist.newPartnerPrice.toLocaleString()}원</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[#8C7A6B] text-xs">
                  가격 변경 이력이 없습니다.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => setShowHistoryModal(null)}
                className="px-4 py-2 bg-[#736152] text-white rounded-xs text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
