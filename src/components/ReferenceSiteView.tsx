import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Check,
  ShieldCheck,
  Loader2,
  Bookmark,
  Building2,
  Users,
} from 'lucide-react';
import { ReferenceSiteItem, ReferenceCategory, AuthUser } from '../types';
import { InfluencerListView } from './InfluencerListView';

const CATEGORIES: ReferenceCategory[] = [
  '전체',
  '검색 & 트렌드',
  '시장조사',
  '마케팅 리서치',
  '글로벌 리서치',
  '웰니스',
  '관광',
  '정부·공공기관',
  '강원특별자치도',
  '원주시',
  '소비자 정보',
  '법률·규정',
  '리조트',
  '호텔',
  '골프',
  '스포츠',
  '미디어',
  '브랜드',
  '기타',
];

interface ReferenceSiteViewProps {
  currentUser?: AuthUser | null;
}

export const ReferenceSiteView: React.FC<ReferenceSiteViewProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'referencesite' | 'influencer'>('referencesite');

  const [sites, setSites] = useState<ReferenceSiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Override Mode toggle (allows admin features for admin users or explicit toggle)
  const isAdminUser = currentUser?.isAdmin ?? true; // Default to true if standalone or logged in as admin

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<ReferenceSiteItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    category: ReferenceCategory;
    description: string;
    url: string;
    isOfficial: boolean;
  }>({
    name: '',
    category: '검색 & 트렌드',
    description: '',
    url: '',
    isOfficial: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);

  // Fetch Reference Sites from API
  const fetchSites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reference-sites');
      const data = await res.json();
      if (res.ok && data.success) {
        setSites(data.sites || []);
        window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
      } else {
        setError(data.error || '참고 사이트 목록을 불러오지 못했습니다.');
      }
    } catch (err: any) {
      console.error('Error fetching reference sites:', err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      category: '검색 & 트렌드',
      description: '',
      url: '',
      isOfficial: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (site: ReferenceSiteItem) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      category: site.category,
      description: site.description,
      url: site.url,
      isOfficial: site.isOfficial ?? true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('사이트명을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('간단 설명을 입력해주세요.');
      return;
    }
    if (!formData.url.trim()) {
      setFormError('URL 주소를 입력해주세요.');
      return;
    }

    // Basic URL format validation
    let formattedUrl = formData.url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setSubmitting(true);
      if (editingSite) {
        // PUT update
        const res = await fetch(`/api/reference-sites/${editingSite.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            url: formattedUrl,
            isOfficial: formData.isOfficial,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSites(data.sites);
          setIsModalOpen(false);
        } else {
          setFormError(data.error || '수정에 실패했습니다.');
        }
      } else {
        // POST create
        const res = await fetch('/api/reference-sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            description: formData.description,
            url: formattedUrl,
            isOfficial: formData.isOfficial,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSites(data.sites);
          setIsModalOpen(false);
        } else {
          setFormError(data.error || '등록에 실패했습니다.');
        }
      }
    } catch (err: any) {
      console.error('Error saving reference site:', err);
      setFormError('저장 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Site
  const handleDeleteSite = async (id: string) => {
    try {
      const res = await fetch(`/api/reference-sites/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSites(data.sites);
        setDeletingSiteId(null);
      } else {
        alert(data.error || '삭제 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error deleting reference site:', err);
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  // Filtered Sites Computation
  const filteredSites = sites.filter((site) => {
    // Category match
    const matchesCategory = selectedCategory === '전체' || site.category === selectedCategory;
    // Search query match
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      site.name.toLowerCase().includes(q) ||
      site.description.toLowerCase().includes(q) ||
      site.category.toLowerCase().includes(q) ||
      site.url.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* TOP SUB-TAB NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-[#D4C8B8] pb-2">
        <button
          id="subtab-referencesite"
          onClick={() => setActiveSubTab('referencesite')}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'referencesite'
              ? 'bg-[#736152] text-white shadow-2xs'
              : 'bg-[#FAF8F5] text-[#2C2C2C] hover:bg-[#EFECE6] border border-[#D4C8B8]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>참고 사이트</span>
        </button>

        <button
          id="subtab-influencer"
          onClick={() => setActiveSubTab('influencer')}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'influencer'
              ? 'bg-[#736152] text-white shadow-2xs'
              : 'bg-[#FAF8F5] text-[#2C2C2C] hover:bg-[#EFECE6] border border-[#D4C8B8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>인플루언서</span>
        </button>
      </div>

      {activeSubTab === 'influencer' ? (
        <InfluencerListView currentUser={currentUser} />
      ) : (
        <>
          {/* 1. HEADER SECTION */}
          <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#736152] text-white rounded-2xs">
                <Globe className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-[#2C2C2C] tracking-tight">
                참고 사이트 (Resource Directory)
              </h1>
              {isAdminUser && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#8C5D28]/10 text-[#8C5D28] border border-[#8C5D28]/30 rounded-2xs font-semibold">
                  관리자 권한 보유
                </span>
              )}
            </div>
            <p className="text-xs text-[#736152]">
              마케팅 및 제휴 업무에서 자주 참고하는 분야별 외부 공식 전문 사이트 모음입니다.
            </p>
          </div>

          {/* Admin Action Button */}
          {isAdminUser && (
            <button
              id="add-reference-site-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>사이트 추가</span>
            </button>
          )}
        </div>

        {/* 2. SEARCH BAR */}
        <div className="mt-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#736152]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="사이트명, 간단 설명, 분야로 검색하세요..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D4C8B8] rounded-xs text-xs text-[#2C2C2C] placeholder-[#8C7A6B] focus:outline-hidden focus:ring-1 focus:ring-[#736152] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CATEGORY FILTER TABS */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-3">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === '전체'
                ? sites.length
                : sites.filter((s) => s.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xs text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                    : 'bg-white/60 text-[#2C2C2C] hover:bg-[#EFECE6] border border-[#D4C8B8]/60'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-2xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#D4C8B8]/30 text-[#736152]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CONTENT DIRECTORY LIST */}
      {loading ? (
        <div className="bg-white border border-[#D4C8B8] rounded-xs p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#8C7A6B]">참고 사이트 디렉토리를 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xs text-xs text-center space-y-2">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchSites}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-2xs font-mono"
          >
            다시 시도
          </button>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="bg-white border border-[#D4C8B8] rounded-xs p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-[#8C7A6B] mx-auto opacity-50" />
          <p className="text-sm font-semibold text-[#2C2C2C]">검색 결과가 없습니다.</p>
          <p className="text-xs text-[#736152]">
            선택한 분야 및 검색어 조건에 맞는 참고 사이트가 존재하지 않습니다.
          </p>
          {(selectedCategory !== '전체' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('전체');
                setSearchQuery('');
              }}
              className="mt-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#D4C8B8] hover:bg-[#EFECE6] text-xs text-[#2C2C2C] rounded-xs transition-colors cursor-pointer font-medium"
            >
              전체 보기로 리셋
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="bg-white border border-[#D4C8B8] rounded-xs p-4 flex flex-col justify-between hover:border-[#736152] transition-all shadow-2xs group relative"
            >
              <div className="space-y-3">
                {/* Card Header: Category Badge & Official Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[#736152] text-[10px] font-medium rounded-2xs">
                    {site.category}
                  </span>
                  {site.isOfficial && (
                    <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>공식 기관</span>
                    </span>
                  )}
                </div>

                {/* Site Name & Description */}
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C] group-hover:text-[#736152] transition-colors leading-snug">
                    {site.name}
                  </h3>
                  <p className="text-xs text-[#736152] mt-1.5 line-clamp-3 leading-relaxed">
                    {site.description}
                  </p>
                </div>

                {/* URL String */}
                <div className="text-[11px] font-mono text-slate-500 truncate bg-[#FAF8F5] px-2 py-1 rounded-2xs border border-[#E8E4DC]">
                  {site.url}
                </div>
              </div>

              {/* Card Footer: Direct Link & Admin Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex items-center justify-between gap-2">
                {/* External Link Button */}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#736152] hover:text-[#5C4E43] hover:underline cursor-pointer"
                >
                  <span>사이트 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Admin CRUD Actions */}
                {isAdminUser && (
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(site)}
                      title="수정"
                      className="p-1.5 text-gray-500 hover:text-[#736152] hover:bg-[#FAF8F5] rounded-2xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingSiteId(site.id)}
                      title="삭제"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-lg overflow-hidden shadow-xl">
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] border-b border-[#D4C8B8] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#736152]" />
                <h2 className="text-sm font-bold text-[#2C2C2C]">
                  {editingSite ? '참고 사이트 수정' : '참고 사이트 추가'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xs">
                  {formError}
                </div>
              )}

              {/* 사이트명 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  사이트명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 네이버 데이터랩 (Naver DataLab)"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                />
              </div>

              {/* 분야 선택 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  분야 (카테고리) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ReferenceCategory })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                >
                  {CATEGORIES.filter((c) => c !== '전체').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 간단 설명 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  간단 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="사이트의 주요 특징 및 용도를 간단히 설명해 주세요."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152] resize-none"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  웹사이트 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://datalab.naver.com"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs font-mono text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                />
                <p className="text-[10px] text-gray-500">
                  ※ 반드시 실제 접속 가능한 공식 URL을 입력하세요.
                </p>
              </div>

              {/* 공식 기관 배지 여부 */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isOfficial"
                  checked={formData.isOfficial}
                  onChange={(e) => setFormData({ ...formData, isOfficial: e.target.checked })}
                  className="rounded-2xs border-[#D4C8B8] text-[#736152] focus:ring-[#736152]"
                />
                <label htmlFor="isOfficial" className="text-xs font-medium text-[#2C2C2C] cursor-pointer">
                  공식 정부/기관/공공 포털 배지 표시
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D4C8B8] bg-white hover:bg-[#FAF8F5] text-[#2C2C2C] rounded-2xs transition-colors cursor-pointer font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-2xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSite ? '수정 완료' : '사이트 등록'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingSiteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#2C2C2C]">참고 사이트 삭제</h3>
              <p className="text-xs text-[#736152]">
                해당 참고 사이트를 디렉토리에서 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => setDeletingSiteId(null)}
                className="px-3 py-1.5 border border-[#D4C8B8] text-xs text-[#2C2C2C] hover:bg-[#FAF8F5] rounded-2xs cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteSite(deletingSiteId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-2xs transition-colors cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
};
