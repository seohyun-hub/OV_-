import React, { useState, useEffect } from 'react';
import { X, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { CompetitorWatchListItem, CompetitorSectorType } from '../../types';

interface CompetitorWatchListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: CompetitorWatchListItem | null;
  onSave: (itemData: Partial<CompetitorWatchListItem>) => void;
  isAdmin?: boolean;
}

export const CompetitorWatchListModal: React.FC<CompetitorWatchListModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
  isAdmin = true,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState<CompetitorSectorType>('호텔·리조트');
  const [region, setRegion] = useState<'국내' | '해외'>('국내');
  const [country, setCountry] = useState('한국');
  const [officialUrl, setOfficialUrl] = useState('');
  const [memo, setMemo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingItem) {
      setCompanyName(editingItem.companyName || '');
      setCategory(editingItem.category || '호텔·리조트');
      setRegion(editingItem.region || '국내');
      setCountry(editingItem.country || '한국');
      setOfficialUrl(editingItem.officialUrl || '');
      setMemo(editingItem.memo || '');
      setIsActive(editingItem.isActive !== undefined ? editingItem.isActive : true);
    } else {
      setCompanyName('');
      setCategory('호텔·리조트');
      setRegion('국내');
      setCountry('한국');
      setOfficialUrl('');
      setMemo('');
      setIsActive(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    onSave({
      id: editingItem?.id,
      companyName: companyName.trim(),
      category,
      region,
      country,
      officialUrl,
      memo,
      isActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] rounded-xs max-w-lg w-full shadow-xl border border-[#423C36] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-[#2C2C2C] text-[#FAF8F5] flex items-center justify-between border-b border-[#423C36]">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#D4C8B8]" />
            <h2 className="text-lg font-bold text-[#FAF8F5]">
              {editingItem ? '경쟁사 Watch List 수정' : '신규 경쟁사 Watch List 등록'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#C2B7AC] hover:text-white rounded-2xs hover:bg-[#423C36] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#9E2A2B] mx-auto" />
            <div className="text-base font-bold text-[#2C2C2C]">관리자 권한이 필요합니다</div>
            <p className="text-xs text-[#786658]">
              경쟁사 Watch List 등록 및 수정은 관리자 계정만 가능합니다.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2C2C2C] text-white text-xs font-semibold rounded-2xs cursor-pointer"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Company Name */}
            <div className="space-y-1">
              <label className="font-bold text-[#2C2C2C] block">
                경쟁사 / 시설명 <span className="text-[#9E2A2B]">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: 카스카디아 CC, 해비치 리조트"
                className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
              />
            </div>

            {/* Category & Region */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2C] block">분야 (카테고리)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CompetitorSectorType)}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
                >
                  <option value="호텔·리조트">호텔·리조트</option>
                  <option value="골프">골프</option>
                  <option value="복합">복합 (호텔+골프)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2C] block">지역 구분</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as '국내' | '해외')}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
                >
                  <option value="국내">국내</option>
                  <option value="해외">해외</option>
                </select>
              </div>
            </div>

            {/* Country & Official URL */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2C] block">국가명</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="한국, 일본, 미국 등"
                  className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2C2C2C] block">공식 홈페이지 URL</label>
                <input
                  type="url"
                  value={officialUrl}
                  onChange={(e) => setOfficialUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
                />
              </div>
            </div>

            {/* Memo */}
            <div className="space-y-1">
              <label className="font-bold text-[#2C2C2C] block">관찰 메모 및 주요 특징</label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="해당 시설의 주요 벤치마킹 자산 및 모니터링 포인트를 적어주세요."
                className="w-full px-3 py-2 bg-white border border-[#E8E4DC] rounded-2xs text-[#2C2C2C] focus:outline-none focus:border-[#8C5D28]"
              />
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-2xs border-[#E8E4DC] text-[#8C5D28] focus:ring-[#8C5D28]"
              />
              <label htmlFor="isActive" className="text-xs font-semibold text-[#2C2C2C] cursor-pointer">
                활성 상태 (트렌드 레이더 모니터링에 포함)
              </label>
            </div>

            {/* Controls */}
            <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#E8E4DC] text-[#2C2C2C] font-semibold rounded-2xs hover:bg-[#D4C8B8] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#8C5D28] text-white font-semibold rounded-2xs hover:bg-[#734a1e] transition-colors cursor-pointer"
              >
                저장하기
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
