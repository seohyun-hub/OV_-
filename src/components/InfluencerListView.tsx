import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Loader2,
  Sparkles,
  Lock,
  Phone,
  Mail,
  Instagram,
  Youtube,
  MessageCircle,
  FileText,
  Video,
  Globe,
  UserCheck,
  Check,
  Eye,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import {
  InfluencerItem,
  InfluencerPlatform,
  InfluencerCategory,
  InfluencerRecommendationResult,
  AuthUser,
} from '../types';

const PLATFORMS: InfluencerPlatform[] = [
  'Instagram',
  'YouTube',
  'Threads',
  'Blog',
  'TikTok',
  '기타',
];

const CATEGORIES: InfluencerCategory[] = [
  '골프',
  '러닝',
  '웰니스',
  '여행',
  '호텔·리조트',
  '맛집·F&B',
  '가족·육아',
  '아웃도어',
  '뷰티',
  '패션',
  '스포츠',
  '라이프스타일',
  '기타',
];

interface InfluencerListViewProps {
  currentUser?: AuthUser | null;
}

export const InfluencerListView: React.FC<InfluencerListViewProps> = ({ currentUser }) => {
  const [influencers, setInfluencers] = useState<InfluencerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<InfluencerPlatform[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<InfluencerCategory[]>([]);

  // Admin Privilege check
  const isAdminUser = currentUser?.isAdmin ?? true;

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfluencerItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    handle: string;
    platform: InfluencerPlatform;
    profileUrl: string;
    categories: InfluencerCategory[];
    notes: string;
    followers: string;
    phone: string;
    email: string;
    memo: string;
  }>({
    name: '',
    handle: '',
    platform: 'Instagram',
    profileUrl: '',
    categories: ['골프'],
    notes: '',
    followers: '',
    phone: '',
    email: '',
    memo: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail View Modal State
  const [detailItem, setDetailItem] = useState<InfluencerItem | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Recommendation Search Modal State
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [recommendParams, setRecommendParams] = useState<{
    platform: string;
    category: string;
    region: string;
    keyword: string;
  }>({
    platform: 'Instagram',
    category: '골프',
    region: '국내',
    keyword: '',
  });
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [recommendResults, setRecommendResults] = useState<InfluencerRecommendationResult[]>([]);
  const [addedHandles, setAddedHandles] = useState<Set<string>>(new Set());

  // Fetch Saved Influencers
  const fetchInfluencers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/influencers');
      const data = await res.json();
      if (res.ok && data.success) {
        setInfluencers(data.influencers || []);
      } else {
        setError(data.error || '인플루언서 목록을 불러오지 못했습니다.');
      }
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  // Filter Toggle Handlers
  const togglePlatformFilter = (p: InfluencerPlatform) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const toggleCategoryFilter = (c: InfluencerCategory) => {
    if (selectedCategories.includes(c)) {
      setSelectedCategories(selectedCategories.filter((item) => item !== c));
    } else {
      setSelectedCategories([...selectedCategories, c]);
    }
  };

  const resetFilters = () => {
    setSelectedPlatforms([]);
    setSelectedCategories([]);
    setSearchQuery('');
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      handle: '',
      platform: 'Instagram',
      profileUrl: '',
      categories: ['골프'],
      notes: '',
      followers: '',
      phone: '',
      email: '',
      memo: '',
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: InfluencerItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      handle: item.handle,
      platform: item.platform,
      profileUrl: item.profileUrl,
      categories: item.categories,
      notes: item.notes,
      followers: item.followers || '',
      phone: item.phone || '',
      email: item.email || '',
      memo: item.memo || '',
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Form Category Toggle (Modal)
  const toggleFormCategory = (cat: InfluencerCategory) => {
    if (formData.categories.includes(cat)) {
      if (formData.categories.length === 1) return; // Must have at least 1 category
      setFormData({
        ...formData,
        categories: formData.categories.filter((c) => c !== cat),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, cat],
      });
    }
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('이름 또는 활동명을 입력해주세요.');
      return;
    }
    if (!formData.profileUrl.trim()) {
      setFormError('프로필 URL 주소를 입력해주세요.');
      return;
    }

    let formattedUrl = formData.profileUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        // PUT update
        const res = await fetch(`/api/influencers/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            handle: formData.handle,
            platform: formData.platform,
            profileUrl: formattedUrl,
            categories: formData.categories,
            notes: formData.notes,
            followers: formData.followers,
            phone: formData.phone,
            email: formData.email,
            memo: formData.memo,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setInfluencers(data.influencers);
          setIsFormModalOpen(false);
        } else {
          setFormError(data.error || '수정에 실패했습니다.');
        }
      } else {
        // POST create
        const res = await fetch('/api/influencers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            handle: formData.handle,
            platform: formData.platform,
            profileUrl: formattedUrl,
            categories: formData.categories,
            notes: formData.notes,
            followers: formData.followers,
            phone: formData.phone,
            email: formData.email,
            memo: formData.memo,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setInfluencers(data.influencers);
          setIsFormModalOpen(false);
        } else {
          setFormError(data.error || '등록에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('Error saving influencer:', err);
      setFormError('저장 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Influencer
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/influencers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfluencers(data.influencers);
        setDeletingId(null);
        if (detailItem?.id === id) setDetailItem(null);
      } else {
        alert(data.error || '삭제하지 못했습니다.');
      }
    } catch (err) {
      console.error('Error deleting influencer:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // Execute Recommended Influencer Search
  const handleExecuteRecommendSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecommendLoading(true);
    setRecommendError(null);
    setRecommendResults([]);

    try {
      const res = await fetch('/api/influencers/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendParams),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecommendResults(data.results || []);
        if ((data.results || []).length === 0) {
          setRecommendError('검색 조건에 해당되는 공개 크리에이터를 찾지 못했습니다.');
        }
      } else {
        setRecommendError(data.error || '실시간 인플루언서 검색 연결이 필요합니다.');
      }
    } catch (err) {
      console.error('Error executing recommend search:', err);
      setRecommendError('실시간 인플루언서 검색 연결이 필요합니다.');
    } finally {
      setRecommendLoading(false);
    }
  };

  // Add Recommended Creator to Saved List
  const handleAddRecommendedToList = async (rec: InfluencerRecommendationResult) => {
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rec.name,
          handle: rec.handle,
          platform: rec.platform,
          profileUrl: rec.profileUrl,
          categories: rec.categories,
          notes: rec.features,
          followers: rec.followers,
          memo: `추천 인플루언서 찾기로 추가됨 (${rec.verifiedDate})`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfluencers(data.influencers);
        setAddedHandles((prev) => new Set([...prev, rec.handle || rec.name]));
      } else {
        alert(data.error || '리스트 추가에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error adding recommended to list:', err);
      alert('리스트 추가 중 오류가 발생했습니다.');
    }
  };

  // Filtered List Computation
  const filteredInfluencers = influencers.filter((item) => {
    // Platform Filter Match
    const matchesPlatform =
      selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform);

    // Category Filter Match
    const matchesCategory =
      selectedCategories.length === 0 ||
      item.categories.some((c) => selectedCategories.includes(c));

    // Search Query Match
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.handle && item.handle.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      item.categories.some((c) => c.toLowerCase().includes(q)) ||
      item.platform.toLowerCase().includes(q);

    return matchesPlatform && matchesCategory && matchesSearch;
  });

  // Render Platform Icon Helper
  const renderPlatformIcon = (platform: InfluencerPlatform) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'YouTube':
        return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'Threads':
        return <MessageCircle className="w-3.5 h-3.5 text-slate-800" />;
      case 'Blog':
        return <FileText className="w-3.5 h-3.5 text-emerald-700" />;
      case 'TikTok':
        return <Video className="w-3.5 h-3.5 text-[#2C2C2C]" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#736152]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 1. HEADER SECTION & SEARCH BUTTONS */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#736152] text-white rounded-2xs">
                <Users className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-[#2C2C2C] tracking-tight">
                인플루언서 디렉토리 (Creator Directory)
              </h1>
            </div>
            <p className="text-xs text-[#736152]">
              마케팅·제휴·행사 초청 시 활용 가능한 크리에이터 정보 수기 관리 및 추천 검색
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Recommend Creator Search Trigger */}
            <button
              id="find-recommended-influencers-btn"
              onClick={() => {
                setIsRecommendModalOpen(true);
                setRecommendError(null);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8C5D28]" />
              <span>추천 인플루언서 찾기</span>
            </button>

            {/* Admin Add Button */}
            {isAdminUser && (
              <button
                id="add-influencer-btn"
                onClick={handleOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ 인플루언서 등록</span>
              </button>
            )}
          </div>
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
            placeholder="이름, 계정 ID, 주요 분야, 특징으로 검색하세요..."
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

      {/* 3. MULTI-SELECT FILTERS (Platform & Category) */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-4 space-y-3">
        {/* Platform Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-[#2C2C2C] w-14 shrink-0">플랫폼:</span>
          {PLATFORMS.map((p) => {
            const isSelected = selectedPlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePlatformFilter(p)}
                className={`px-2.5 py-1 rounded-xs text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                    : 'bg-white text-[#2C2C2C] hover:bg-[#EFECE6] border border-[#D4C8B8]'
                }`}
              >
                {renderPlatformIcon(p)}
                <span>{p}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-2 border-t border-[#D4C8B8]/60">
          <span className="text-[11px] font-bold text-[#2C2C2C] w-14 shrink-0">주요 분야:</span>
          {CATEGORIES.map((c) => {
            const isSelected = selectedCategories.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCategoryFilter(c)}
                className={`px-2 py-0.5 rounded-2xs text-[11px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#736152] text-white font-semibold shadow-2xs'
                    : 'bg-white/80 text-[#736152] hover:bg-[#EFECE6] border border-[#D4C8B8]/70'
                }`}
              >
                {c}
              </button>
            );
          })}

          {(selectedPlatforms.length > 0 || selectedCategories.length > 0 || searchQuery) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-[10px] text-gray-500 hover:text-[#736152] underline cursor-pointer"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 4. INFLUENCER CARDS DIRECTORY GRID */}
      {loading ? (
        <div className="bg-white border border-[#D4C8B8] rounded-xs p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#8C7A6B]">인플루언서 디렉토리를 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xs text-xs text-center space-y-2">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchInfluencers}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-2xs font-mono"
          >
            다시 시도
          </button>
        </div>
      ) : filteredInfluencers.length === 0 ? (
        <div className="bg-white border border-[#D4C8B8] rounded-xs p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-[#8C7A6B] mx-auto opacity-50" />
          <p className="text-sm font-semibold text-[#2C2C2C]">
            등록된 인플루언서가 없거나 검색 조건에 맞는 결과가 없습니다.
          </p>
          <p className="text-xs text-[#736152]">
            직접 인플루언서를 등록하거나 상단의 <span className="font-semibold text-[#8C5D28]">추천 인플루언서 찾기</span>를 실행해보세요.
          </p>
          {isAdminUser && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 인플루언서 등록하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfluencers.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#D4C8B8] rounded-xs p-4 flex flex-col justify-between hover:border-[#736152] transition-all shadow-2xs group relative"
            >
              <div className="space-y-3">
                {/* Header: Platform & Followers */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 bg-[#FAF8F5] border border-[#D4C8B8] px-2 py-0.5 rounded-2xs text-xs font-medium text-[#736152]">
                    {renderPlatformIcon(item.platform)}
                    <span>{item.platform}</span>
                  </div>

                  <span className="text-[11px] font-mono text-[#736152] bg-amber-50/70 border border-amber-200/60 px-2 py-0.5 rounded-2xs">
                    팔로워: <strong className="text-[#2C2C2C]">{item.followers || '확인 필요'}</strong>
                  </span>
                </div>

                {/* Name & Handle */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => setDetailItem(item)}
                      className="text-[11px] text-[#736152] hover:underline flex items-center space-x-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>상세보기</span>
                    </button>
                  </div>
                  {item.handle && (
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{item.handle}</p>
                  )}
                </div>

                {/* Category Badges */}
                <div className="flex flex-wrap gap-1">
                  {item.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8]/80 px-1.5 py-0.2 rounded-2xs"
                    >
                      #{cat}
                    </span>
                  ))}
                </div>

                {/* Notes / Features */}
                {item.notes && (
                  <p className="text-xs text-[#736152] line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2 rounded-2xs border border-[#E8E4DC]">
                    {item.notes}
                  </p>
                )}

                {/* Contact Info (Masked if not logged in user) */}
                <div className="pt-2 border-t border-[#E8E4DC] text-[11px] space-y-1">
                  {currentUser ? (
                    <div className="flex items-center space-x-3 text-slate-600">
                      {item.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[#736152]" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center space-x-1 truncate">
                          <Mail className="w-3 h-3 text-[#736152]" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      )}
                      {!item.phone && !item.email && (
                        <span className="text-gray-400 italic">연락처 정보 미등록</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-gray-400 italic">
                      <Lock className="w-3 h-3 text-gray-400" />
                      <span>연락처/이메일은 로그인 사용자에게만 표시됩니다.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#E8E4DC] flex items-center justify-between gap-2">
                <a
                  href={item.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#736152] hover:text-[#5C4E43] hover:underline cursor-pointer truncate max-w-[200px]"
                >
                  <span className="truncate">프로필 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                {isAdminUser && (
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="수정"
                      className="p-1.5 text-gray-500 hover:text-[#736152] hover:bg-[#FAF8F5] rounded-2xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
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

      {/* 5. ADD / EDIT INFLUENCER MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-lg overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] border-b border-[#D4C8B8] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#736152]" />
                <h2 className="text-sm font-bold text-[#2C2C2C]">
                  {editingItem ? '인플루언서 정보 수정' : '신규 인플루언서 수기 등록'}
                </h2>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 text-xs overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xs">
                  {formError}
                </div>
              )}

              {/* 이름/활동명 & 계정 ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">
                    이름 / 활동명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 골프킹 민우"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">계정 ID (Handle)</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="예: @golfking_mw"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs font-mono text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  />
                </div>
              </div>

              {/* 플랫폼 & 팔로워 수 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">
                    플랫폼 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value as InfluencerPlatform })
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">팔로워 / 구독자 수</label>
                  <input
                    type="text"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    placeholder="예: 2.5만 또는 120,000"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  />
                </div>
              </div>

              {/* 프로필 URL */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  프로필 URL 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.profileUrl}
                  onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                  placeholder="https://www.instagram.com/golfking_mw"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs font-mono text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                />
              </div>

              {/* 주요 분야 (복수 선택) */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">
                  주요 분야 (복수 선택 가능) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs">
                  {CATEGORIES.map((cat) => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleFormCategory(cat)}
                        className={`px-2 py-1 rounded-2xs text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#736152] text-white font-semibold'
                            : 'bg-white text-[#736152] border border-[#D4C8B8]'
                        }`}
                      >
                        {cat} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 특징 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">최근 활동 특징 / 스타일</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="예: 3040 골프 및 주말 리조트 라이프스타일 릴스 전문 크리에이터"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                />
              </div>

              {/* 연락처 & 이메일 (승인 사용자만 조회 가능) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#E8E4DC]">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">연락처 (선택)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs font-mono text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">이메일 (선택)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="creator@example.com"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs font-mono text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic">
                ※ 입력한 전화번호 및 이메일은 승인된 로그인 사용자에게만 표시되며 외부 검색에 노출되지 않습니다.
              </p>

              {/* 메모 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">업무 메모 (선택)</label>
                <textarea
                  rows={2}
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="초청 진행 이력, 단가 정보, 담당자 메모 등"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[#2C2C2C] focus:outline-hidden focus:ring-1 focus:ring-[#736152] resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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
                  <span>{editingItem ? '수정 완료' : '등록 완료'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DETAIL VIEW MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC]">
              <div className="flex items-center space-x-2">
                {renderPlatformIcon(detailItem.platform)}
                <h2 className="text-sm font-bold text-[#2C2C2C]">{detailItem.name}</h2>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#FAF8F5] p-2.5 rounded-2xs border border-[#E8E4DC]">
                <span className="text-[#736152] font-semibold">플랫폼 & 계정:</span>
                <span className="font-mono text-[#2C2C2C] font-semibold">
                  {detailItem.platform} {detailItem.handle}
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] p-2.5 rounded-2xs border border-[#E8E4DC]">
                <span className="text-[#736152] font-semibold">팔로워 / 구독자:</span>
                <span className="font-bold text-[#2C2C2C]">
                  {detailItem.followers || '확인 필요'}
                </span>
              </div>

              <div>
                <span className="text-[#736152] font-semibold block mb-1">주요 분야:</span>
                <div className="flex flex-wrap gap-1">
                  {detailItem.categories.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] bg-[#FAF8F5] text-[#736152] border border-[#D4C8B8] px-1.5 py-0.2 rounded-2xs"
                    >
                      #{c}
                    </span>
                  ))}
                </div>
              </div>

              {detailItem.notes && (
                <div>
                  <span className="text-[#736152] font-semibold block mb-1">최근 활동 특징:</span>
                  <p className="p-2.5 bg-[#FAF8F5] rounded-2xs border border-[#E8E4DC] text-[#2C2C2C] leading-relaxed">
                    {detailItem.notes}
                  </p>
                </div>
              )}

              {/* Private Contact Section */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xs space-y-1.5">
                <span className="font-semibold text-[#8C5D28] block text-[11px]">
                  연락처 및 이메일 (업무 담당자)
                </span>
                {currentUser ? (
                  <div className="space-y-1 text-slate-700 font-mono">
                    <div>전화번호: {detailItem.phone || '미등록'}</div>
                    <div>이메일: {detailItem.email || '미등록'}</div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-amber-800 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>승인된 로그인 사용자에게만 노출됩니다.</span>
                  </div>
                )}
              </div>

              {detailItem.memo && (
                <div>
                  <span className="text-[#736152] font-semibold block mb-1">업무 메모:</span>
                  <p className="p-2.5 bg-[#FAF8F5] rounded-2xs border border-[#E8E4DC] text-[#2C2C2C] leading-relaxed">
                    {detailItem.memo}
                  </p>
                </div>
              )}

              <div className="pt-2 text-[10px] font-mono text-gray-400">
                등록일: {detailItem.createdAt} | 수정일: {detailItem.updatedAt}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E4DC] flex items-center justify-between">
              <a
                href={detailItem.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-bold text-[#736152] hover:underline"
              >
                <span>프로필 바로가기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-1.5 bg-[#736152] text-white text-xs font-semibold rounded-2xs hover:bg-[#5C4E43]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. RECOMMEND INFLUENCER SEARCH MODAL */}
      {isRecommendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#FAF8F5] border-b border-[#D4C8B8] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#8C5D28]" />
                <h2 className="text-sm font-bold text-[#2C2C2C]">
                  실시간 추천 인플루언서 찾기 (출처 / 근거 자료 기반)
                </h2>
              </div>
              <button
                onClick={() => setIsRecommendModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Search Filter Inputs */}
            <form onSubmit={handleExecuteRecommendSearch} className="p-5 border-b border-[#E8E4DC] space-y-3 bg-[#FAF8F5]/50 text-xs shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 플랫폼 */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">플랫폼</label>
                  <select
                    value={recommendParams.platform}
                    onChange={(e) => setRecommendParams({ ...recommendParams, platform: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-2xs text-[#2C2C2C]"
                  >
                    <option value="전체">전체 플랫폼</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 분야 */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">주요 분야</label>
                  <select
                    value={recommendParams.category}
                    onChange={(e) => setRecommendParams({ ...recommendParams, category: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-2xs text-[#2C2C2C]"
                  >
                    <option value="전체">전체 분야</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 국내 / 해외 */}
                <div className="space-y-1">
                  <label className="block font-semibold text-[#2C2C2C]">지역 구분</label>
                  <select
                    value={recommendParams.region}
                    onChange={(e) => setRecommendParams({ ...recommendParams, region: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-2xs text-[#2C2C2C]"
                  >
                    <option value="국내">국내 (대한민국)</option>
                    <option value="해외">해외 (Global)</option>
                    <option value="전체">전체</option>
                  </select>
                </div>
              </div>

              {/* 검색 키워드 */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#2C2C2C]">상세 검색 키워드</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={recommendParams.keyword}
                    onChange={(e) => setRecommendParams({ ...recommendParams, keyword: e.target.value })}
                    placeholder="예: 마라톤 서포터즈, 리조트 힐링, 골프 레슨 숏폼 등"
                    className="flex-1 px-3 py-1.5 bg-white border border-[#D4C8B8] rounded-2xs text-[#2C2C2C]"
                  />
                  <button
                    type="submit"
                    disabled={recommendLoading}
                    className="px-4 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-semibold rounded-2xs transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    {recommendLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>실제 웹검색 실행</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Modal Body: Results Display */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {recommendLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
                  <p className="text-xs font-mono text-[#8C7A6B]">
                    공개 웹 검색으로 실제 존재하는 크리에이터 정보를 검증하고 있습니다...
                  </p>
                </div>
              ) : recommendError ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xs text-xs space-y-2 text-center">
                  <ShieldAlert className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="font-bold text-[#2C2C2C]">{recommendError}</p>
                  <p className="text-[11px] text-[#736152]">
                    ※ 가상의 크리에이터 정보 생성을 엄격히 차단하며 실제 확인된 공개 프로필만 제공합니다.
                  </p>
                </div>
              ) : recommendResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#736152] space-y-1">
                  <p className="font-semibold text-[#2C2C2C]">
                    상단 조건을 입력한 후 [실제 웹검색 실행] 버튼을 눌러주세요.
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    실제 존재하는 인플루언서 정보만 검색되어 결과에 노출됩니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#2C2C2C] flex items-center justify-between">
                    <span>실제 공개 웹 검색으로 확인된 크리에이터 ({recommendResults.length}건)</span>
                    <span className="text-[10px] font-mono text-[#8C5D28]">가상 정보 생성 엄격 차단됨</span>
                  </div>

                  {recommendResults.map((rec, idx) => {
                    const isAdded = addedHandles.has(rec.handle || rec.name);
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-[#D4C8B8] rounded-xs p-3.5 space-y-2 hover:border-[#736152] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-[#2C2C2C]">{rec.name}</span>
                            <span className="text-[11px] font-mono text-gray-500">{rec.handle}</span>
                            <span className="px-1.5 py-0.2 bg-[#FAF8F5] border border-[#D4C8B8] text-[10px] text-[#736152] rounded-2xs">
                              {rec.platform}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-2xs">
                            검증일: {rec.verifiedDate}
                          </span>
                        </div>

                        <p className="text-xs text-[#736152] bg-[#FAF8F5] p-2 rounded-2xs border border-[#E8E4DC]">
                          {rec.features}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[11px] text-[#736152]">
                            팔로워/구독자: <strong className="text-[#2C2C2C]">{rec.followers}</strong>
                          </span>

                          <div className="flex items-center space-x-2">
                            <a
                              href={rec.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-[#736152] hover:underline inline-flex items-center space-x-0.5"
                            >
                              <span>Profile 바로가기</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => handleAddRecommendedToList(rec)}
                              disabled={isAdded}
                              className={`px-3 py-1 rounded-2xs text-xs font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1 ${
                                isAdded
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                  : 'bg-[#736152] hover:bg-[#5C4E43] text-white shadow-2xs'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>추가됨</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>내 리스트에 추가</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF8F5] border-t border-[#D4C8B8] px-5 py-3 flex justify-end shrink-0">
              <button
                onClick={() => setIsRecommendModalOpen(false)}
                className="px-4 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-2xs cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white border border-[#D4C8B8] rounded-xs w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#2C2C2C]">인플루언서 삭제</h3>
              <p className="text-xs text-[#736152]">
                선택한 인플루언서를 목록에서 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 border border-[#D4C8B8] text-xs text-[#2C2C2C] hover:bg-[#FAF8F5] rounded-2xs cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-2xs transition-colors cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
