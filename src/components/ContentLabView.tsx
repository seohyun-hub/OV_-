import React, { useState } from 'react';
import {
  ContentBrand,
  ContentChannel,
  ContentMoodTone,
  ContentGenerationResult,
  RecommendedTopicItem,
  ContentPolishResult,
  PolishChannelPurpose,
  PolishToneOption,
} from '../types';
import {
  DEFAULT_TOPICS,
  MOOD_TONE_OPTIONS,
  POLISH_TONE_OPTIONS,
  POLISH_CHANNEL_PURPOSES,
  ALL_CONTENT_CHANNELS,
  generateRecommendedTopics,
  generateContentVersions,
  polishUserDraft,
} from '../utils/contentLabEngine';
import {
  Sparkles,
  Layers,
  Edit3,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Instagram,
  ArrowRight,
  RotateCw,
  Globe,
  Camera,
  ShieldCheck,
  Tag,
  Share2,
  MessageSquare,
  FileText,
  Building2,
  Smartphone,
  Plus,
  X,
  AlertCircle,
  QrCode,
} from 'lucide-react';

interface ContentLabViewProps {
  onSearchTrend?: (query: string) => void;
  onSearchCompany?: (company: string) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenQRCodeModal?: (url?: string, name?: string) => void;
}

export const ContentLabView: React.FC<ContentLabViewProps> = ({
  onSearchTrend,
  onSearchCompany,
  onNavigateTab,
  onOpenQRCodeModal,
}) => {
  // 1. Initial Setup States
  const [selectedBrand, setSelectedBrand] = useState<ContentBrand>('오크밸리');
  const [selectedChannels, setSelectedChannels] = useState<ContentChannel[]>(['Instagram Feed']);
  const [activeWorkflow, setActiveWorkflow] = useState<'create' | 'recommend' | 'polish'>('create');

  // 2. "새 콘텐츠 만들기" States
  const [topicList, setTopicList] = useState<string[]>(DEFAULT_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<string>('골프');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [selectedMoodTone, setSelectedMoodTone] = useState<ContentMoodTone>('프리미엄');
  const [mustInclude, setMustInclude] = useState<string>('');
  const [promotionInfo, setPromotionInfo] = useState<string>('');
  const [ctaInput, setCtaInput] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<ContentGenerationResult | null>(null);
  const [activeResultVersion, setActiveResultVersion] = useState<'A' | 'B' | 'C'>('A');
  const [activeLangTab, setActiveLangTab] = useState<'KR' | 'EN'>('KR');

  // 3. "추천 주제 받기" States
  const recommendedTopics = generateRecommendedTopics(selectedBrand);
  const [selectedRecTopic, setSelectedRecTopic] = useState<RecommendedTopicItem | null>(null);

  // 4. "내가 쓴 문안 다듬기" States
  const [userDraftText, setUserDraftText] = useState<string>('');
  const [polishPurpose, setPolishPurpose] = useState<PolishChannelPurpose>('Instagram');
  const [polishTone, setPolishTone] = useState<PolishToneOption>('고급스럽게');
  const [polishResult, setPolishResult] = useState<ContentPolishResult | null>(null);
  const [activePolishLevel, setActivePolishLevel] = useState<'level1' | 'level2' | 'level3'>('level2');
  const [activePolishLangTab, setActivePolishLangTab] = useState<'KR' | 'EN'>('KR');

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle Channel Selection
  const handleToggleChannel = (channel: ContentChannel) => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  // Add Custom Topic
  const handleAddCustomTopic = () => {
    const trimmed = customTopicInput.trim();
    if (trimmed && !topicList.includes(trimmed)) {
      setTopicList([...topicList, trimmed]);
      setSelectedTopic(trimmed);
      setCustomTopicInput('');
      setShowCustomInput(false);
    }
  };

  // Trigger New Content Generation
  const handleGenerateNewContent = () => {
    const result = generateContentVersions({
      brand: selectedBrand,
      channels: selectedChannels,
      topic: selectedTopic,
      moodTone: selectedMoodTone,
      mustInclude: mustInclude.trim() || undefined,
      promotionInfo: promotionInfo.trim() || undefined,
      cta: ctaInput.trim() || undefined,
    });
    setGeneratedResult(result);
    setActiveResultVersion('A');
    setActiveLangTab('KR');
  };

  // Trigger Content Generation from Selected Recommended Topic
  const handleApplyRecommendedTopic = (rec: RecommendedTopicItem) => {
    setSelectedRecTopic(rec);
    setSelectedTopic(rec.topic);
    if (!topicList.includes(rec.topic)) {
      setTopicList([rec.topic, ...topicList]);
    }
    const result = generateContentVersions({
      brand: selectedBrand,
      channels: rec.recommendedChannels,
      topic: rec.topic,
      moodTone: '프리미엄',
      mustInclude: rec.promotionPoints.join(', '),
      cta: rec.brand === '파크로쉬' ? '프로필 링크에서 웰니스 일정을 확인하세요.' : '오크밸리 공식 사이트에서 확인해 보세요.',
    });
    setGeneratedResult(result);
    setActiveWorkflow('create');
    setActiveResultVersion('A');
    setActiveLangTab('KR');
  };

  // Trigger Draft Polishing
  const handlePolishDraft = () => {
    if (!userDraftText.trim()) return;
    const res = polishUserDraft(userDraftText, polishPurpose, polishTone);
    setPolishResult(res);
    setActivePolishLevel('level2');
    setActivePolishLangTab('KR');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* 1. TOP HEADER & INTRO */}
      <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#736152] bg-[#FAF8F5] px-2.5 py-0.5 border border-[#D4C8B8]">
                MARKETING CONTENT LAB
              </span>
              <span className="text-[11px] text-[#8C7A6B] font-medium">
                SNS 콘텐츠 기획 · 추천 · 문안 워싱
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] tracking-tight">
              콘텐츠 랩
            </h1>
            <p className="text-xs sm:text-sm text-[#5C4E43] leading-relaxed max-w-3xl">
              주간 트렌드에 맞는 SNS 홍보 포인트를 찾고, 원하는 주제와 채널에 맞춰 콘텐츠를 생성합니다. 
              이미 작성한 문안도 브랜드 무드와 톤에 맞게 교정·보완하여 바로 활용할 수 있도록 다듬어보세요.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
            {onOpenQRCodeModal && (
              <button
                onClick={() => onOpenQRCodeModal(window.location.href, `${selectedBrand} 콘텐츠 랩`)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] text-[#5C4E43] hover:text-[#2C2C2C] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-[#736152]" />
                <span>QR 생성</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. BASE CONFIGURATION BAR (BRAND & CHANNELS) */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] p-5 space-y-4 shadow-2xs">
        
        {/* Brand / Platform Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] pb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#736152]" />
            <span className="text-xs font-bold text-[#2C2C2C] tracking-tight">
              브랜드 / 플랫폼 선택
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedBrand('오크밸리');
                setGeneratedResult(null);
                setPolishResult(null);
              }}
              className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedBrand === '오크밸리'
                  ? 'bg-[#736152] text-white shadow-2xs'
                  : 'bg-white text-[#5C4E43] border border-[#D4C8B8] hover:bg-[#F5F2EB]'
              }`}
            >
              오크밸리 (Oak Valley)
            </button>
            <button
              onClick={() => {
                setSelectedBrand('파크로쉬');
                setGeneratedResult(null);
                setPolishResult(null);
              }}
              className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedBrand === '파크로쉬'
                  ? 'bg-[#736152] text-white shadow-2xs'
                  : 'bg-white text-[#5C4E43] border border-[#D4C8B8] hover:bg-[#F5F2EB]'
              }`}
            >
              파크로쉬 (PARK ROCHE)
            </button>
          </div>
        </div>

        {/* Channels Multi-Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2C2C2C]">
              게시 채널 <span className="text-[11px] font-normal text-[#8C7A6B]">(복수 선택 가능)</span>
            </span>
            <span className="text-[11px] text-[#736152] font-mono font-medium">
              선택됨: {selectedChannels.join(', ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_CONTENT_CHANNELS.map((ch) => {
              const isSelected = selectedChannels.includes(ch);
              return (
                <button
                  key={ch}
                  onClick={() => handleToggleChannel(ch)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#736152] text-white border-[#736152] shadow-2xs'
                      : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <span>{ch}</span>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. THREE PRIMARY WORKFLOW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Workflow 1: 새 콘텐츠 만들기 */}
        <button
          onClick={() => setActiveWorkflow('create')}
          className={`p-5 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeWorkflow === 'create'
              ? 'bg-white border-[#736152] ring-2 ring-[#736152]/20 shadow-md'
              : 'bg-white border-[#D4C8B8] hover:border-[#736152]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="space-y-2">
            <div className="w-9 h-9 bg-[#FAF8F5] border border-[#D4C8B8] flex items-center justify-center text-[#736152]">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">새 콘텐츠 만들기</h3>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                주제와 무드/톤을 설정해 A/B/C 버전의 맞춤 카피를 즉시 생성합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#736152]">
            <span>작업 시작</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* Workflow 2: 추천 주제 받기 */}
        <button
          onClick={() => setActiveWorkflow('recommend')}
          className={`p-5 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeWorkflow === 'recommend'
              ? 'bg-white border-[#736152] ring-2 ring-[#736152]/20 shadow-md'
              : 'bg-white border-[#D4C8B8] hover:border-[#736152]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="space-y-2">
            <div className="w-9 h-9 bg-[#FAF8F5] border border-[#D4C8B8] flex items-center justify-center text-[#736152]">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">추천 주제 받기 (TOP 3)</h3>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                주간 트렌드·시즌 관심도·실제 리조트 자산을 종합한 기획안을 확인합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#736152]">
            <span>TOP 3 제안 보기</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* Workflow 3: 내가 쓴 문안 다듬기 */}
        <button
          onClick={() => setActiveWorkflow('polish')}
          className={`p-5 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeWorkflow === 'polish'
              ? 'bg-white border-[#736152] ring-2 ring-[#736152]/20 shadow-md'
              : 'bg-white border-[#D4C8B8] hover:border-[#736152]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="space-y-2">
            <div className="w-9 h-9 bg-[#FAF8F5] border border-[#D4C8B8] flex items-center justify-center text-[#736152]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C2C2C]">내가 쓴 문안 다듬기</h3>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                작성한 초안의 맞춤법, 어색한 문맥, 브랜드 톤, SNS 형식을 교정합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-[#736152]">
            <span>문안 워싱</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. WORKFLOW SECTION 1: 새 콘텐츠 만들기 */}
      {/* ======================================================== */}
      {activeWorkflow === 'create' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-5 shadow-2xs">
            <div className="border-b border-[#E8E4DC] pb-3">
              <h2 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#736152]" />
                <span>새 콘텐츠 기획 &amp; 생성 조건</span>
              </h2>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C2C2C]">
                  주제 선택 <span className="text-red-700">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-xs text-[#736152] hover:text-[#5C4E43] font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>주제 직접 추가</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {topicList.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                      selectedTopic === t
                        ? 'bg-[#736152] text-white border-[#736152] shadow-2xs'
                        : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {showCustomInput && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="새로운 주제명 입력 (예: 피클볼, 가을단풍, 펫캉스)"
                    className="flex-1 px-3 py-1.5 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTopic();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTopic}
                    className="px-3 py-1.5 bg-[#736152] text-white text-xs font-bold hover:bg-[#5C4E43] cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              )}
            </div>

            {/* Mood / Tone Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C]">
                무드 / 톤 선택
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MOOD_TONE_OPTIONS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMoodTone(mood)}
                    className={`py-2 px-3 text-xs font-medium border text-center transition-all cursor-pointer ${
                      selectedMoodTone === mood
                        ? 'bg-[#FAF8F5] border-[#736152] text-[#736152] font-bold ring-1 ring-[#736152]'
                        : 'bg-white border-[#D4C8B8] text-[#5C4E43] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C2C2C]">
                  꼭 포함할 내용 <span className="text-[10px] text-[#8C7A6B]">(선택)</span>
                </label>
                <input
                  type="text"
                  value={mustInclude}
                  onChange={(e) => setMustInclude(e.target.value)}
                  placeholder="예: 참나무 숲길 피톤치드, 성문안 18홀"
                  className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C2C2C]">
                  행사 / 프로모션 정보 <span className="text-[10px] text-[#8C7A6B]">(선택)</span>
                </label>
                <input
                  type="text"
                  value={promotionInfo}
                  onChange={(e) => setPromotionInfo(e.target.value)}
                  placeholder="예: 주중 20% 얼리버드, 웰컴 드링크 제공"
                  className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2C2C2C]">
                  행동 유도 문구 (CTA) <span className="text-[10px] text-[#8C7A6B]">(선택)</span>
                </label>
                <input
                  type="text"
                  value={ctaInput}
                  onChange={(e) => setCtaInput(e.target.value)}
                  placeholder="예: 지금 프로필 링크에서 확인하세요"
                  className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleGenerateNewContent}
                className="w-full sm:w-auto px-6 py-3 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold tracking-wider flex items-center justify-center space-x-2 shadow-2xs cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>선택 조건으로 A / B / C 콘텐츠 3종 생성하기</span>
              </button>
            </div>
          </div>

          {/* GENERATION OUTPUT CONTAINER */}
          {generatedResult && (
            <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
              
              {/* Header of Result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-[#FAF8F5] text-[#736152] px-2 py-0.5 border border-[#D4C8B8]">
                      {generatedResult.brand} &middot; {generatedResult.topic}
                    </span>
                    <span className="text-xs text-[#8C7A6B]">
                      채널: {generatedResult.channels.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#2C2C2C]">
                    맞춤형 콘텐츠 생성 결과 (A / B / C 3종)
                  </h3>
                </div>

                {/* Language Switcher Tab (KR / EN) */}
                <div className="flex items-center bg-[#FAF8F5] border border-[#D4C8B8] p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setActiveLangTab('KR')}
                    className={`px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1 ${
                      activeLangTab === 'KR'
                        ? 'bg-[#736152] text-white shadow-2xs'
                        : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <span>KR (국문)</span>
                  </button>
                  <button
                    onClick={() => setActiveLangTab('EN')}
                    className={`px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1 ${
                      activeLangTab === 'EN'
                        ? 'bg-[#736152] text-white shadow-2xs'
                        : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>EN (영문 마케팅 카피)</span>
                  </button>
                </div>
              </div>

              {/* Version Switcher Tabs (A / B / C) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveResultVersion('A')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activeResultVersion === 'A'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">VERSION A</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">가장 추천하는 버전</div>
                  <div className="text-[10px] text-[#8C7A6B]">균형 잡힌 정보와 브랜드 무드</div>
                </button>

                <button
                  onClick={() => setActiveResultVersion('B')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activeResultVersion === 'B'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">VERSION B</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">감성·브랜드 무드 강화</div>
                  <div className="text-[10px] text-[#8C7A6B]">여운 있는 스토리텔링과 어조</div>
                </button>

                <button
                  onClick={() => setActiveResultVersion('C')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activeResultVersion === 'C'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">VERSION C</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">짧고 트렌디한 버전</div>
                  <div className="text-[10px] text-[#8C7A6B]">숏폼·빠른 스크롤 최적화</div>
                </button>
              </div>

              {/* Active Version Content Display */}
              {(() => {
                const currentVer =
                  activeResultVersion === 'A'
                    ? generatedResult.versionA
                    : activeResultVersion === 'B'
                    ? generatedResult.versionB
                    : generatedResult.versionC;

                const displayText = activeLangTab === 'KR' ? currentVer.krText : currentVer.enText;

                return (
                  <div className="space-y-4">
                    <div className="bg-[#FAF8F5] border border-[#D4C8B8] p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                        <span className="text-xs font-bold text-[#736152]">
                          {currentVer.label} &middot; {currentVer.channelNote}
                        </span>
                        <button
                          onClick={() => handleCopy(displayText, `ver-${activeResultVersion}-${activeLangTab}`)}
                          className="px-3 py-1 bg-white border border-[#D4C8B8] text-[#5C4E43] hover:text-[#2C2C2C] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                        >
                          {copiedKey === `ver-${activeResultVersion}-${activeLangTab}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-emerald-700 font-bold">복사 완료</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#736152]" />
                              <span>문안 전체 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#2C2C2C] leading-relaxed select-text">
                        {displayText}
                      </pre>
                    </div>

                    {/* Image Suggestions & Photography Direction */}
                    <div className="bg-[#F5F2EB] border border-[#D4C8B8] p-4 sm:p-5 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-[#736152]" />
                        <span className="text-xs font-bold text-[#2C2C2C]">
                          추천 이미지 &amp; 촬영 연출 가이드
                        </span>
                        {generatedResult.visualSuggestion.hasLibraryAsset && (
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                            회사 보유 이미지 라이브러리 연계
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5C4E43]">
                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="text-[11px] font-bold text-[#736152]">추천 이미지 무드 &amp; 채광</div>
                          <p>{generatedResult.visualSuggestion.mood}</p>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="text-[11px] font-bold text-[#736152]">촬영 구도 &amp; 앵글</div>
                          <p>{generatedResult.visualSuggestion.composition}</p>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="text-[11px] font-bold text-[#736152]">인물 / 공간 구성</div>
                          <p>{generatedResult.visualSuggestion.elements}</p>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="text-[11px] font-bold text-[#736152]">권장 이미지 스타일</div>
                          <p>{generatedResult.visualSuggestion.recommendedStyle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. WORKFLOW SECTION 2: 추천 주제 받기 (TOP 3) */}
      {/* ======================================================== */}
      {activeWorkflow === 'recommend' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="border-b border-[#E8E4DC] pb-3">
              <span className="text-[10px] font-mono font-bold text-[#736152] bg-[#FAF8F5] px-2 py-0.5 border border-[#D4C8B8]">
                REAL ASSET &amp; TREND CURATION
              </span>
              <h2 className="text-base font-bold text-[#2C2C2C] mt-1">
                {selectedBrand} 추천 콘텐츠 주제 TOP 3
              </h2>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                주간 시장 트렌드, 계절성, 레저 선호도와 {selectedBrand}의 검증된 실물 자산을 매칭한 3대 전략 주제입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {recommendedTopics.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-[#FAF8F5] border border-[#D4C8B8] p-5 space-y-4 transition-all hover:border-[#736152]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4DC] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-[#736152] text-white text-xs font-bold flex items-center justify-center">
                        {rec.rank}
                      </span>
                      <h3 className="text-sm font-bold text-[#2C2C2C]">
                        {rec.topic}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleApplyRecommendedTopic(rec)}
                      className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>이 주제로 A/B/C 콘텐츠 생성</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left Details */}
                    <div className="space-y-3 bg-white p-4 border border-[#E8E4DC]">
                      <div className="space-y-1">
                        <div className="font-bold text-[#736152]">💡 왜 지금 좋은지 (시의성 &amp; 데이터 근거)</div>
                        <p className="text-[#5C4E43] leading-relaxed">{rec.whyNow}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-[#736152]">🎯 핵심 홍보 포인트</div>
                        <ul className="space-y-1 text-[#5C4E43]">
                          {rec.promotionPoints.map((pt, i) => (
                            <li key={i} className="flex items-start space-x-1.5">
                              <span className="text-[#736152]">&bull;</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-[#8C7A6B] font-bold">추천 채널:</span>
                        {rec.recommendedChannels.map((ch) => (
                          <span key={ch} className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D4C8B8] text-[10px] text-[#5C4E43]">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Image Direction */}
                    <div className="space-y-3 bg-white p-4 border border-[#E8E4DC]">
                      <div className="flex items-center space-x-1.5 text-[#736152] font-bold">
                        <Camera className="w-3.5 h-3.5" />
                        <span>추천 이미지 / 촬영 가이드</span>
                      </div>

                      <div className="space-y-2 text-[#5C4E43]">
                        <div>
                          <span className="font-semibold text-[#2C2C2C]">무드:</span> {rec.imageDirection.mood}
                        </div>
                        <div>
                          <span className="font-semibold text-[#2C2C2C]">구도:</span> {rec.imageDirection.composition}
                        </div>
                        <div>
                          <span className="font-semibold text-[#2C2C2C]">공간/인물:</span> {rec.imageDirection.elements}
                        </div>
                        <div className="text-[11px] text-[#8C7A6B] bg-[#FAF8F5] p-2 border border-[#E8E4DC]">
                          자산 연계: {rec.connectedAsset}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. WORKFLOW SECTION 3: 내가 쓴 문안 다듬기 (문안 워싱) */}
      {/* ======================================================== */}
      {activeWorkflow === 'polish' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-5 shadow-2xs">
            <div className="border-b border-[#E8E4DC] pb-3">
              <span className="text-[10px] font-mono font-bold text-[#736152] bg-[#FAF8F5] px-2 py-0.5 border border-[#D4C8B8]">
                TEXT WASHING &amp; PROOFREADING
              </span>
              <h2 className="text-base font-bold text-[#2C2C2C] mt-1">
                내가 쓴 문안 다듬기
              </h2>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                데스크톱과 모바일 모두 동일하게 제공됩니다. 작성한 문안을 붙여넣으면 3가지 수준(원문 유지형, 추천 개선형, SNS 최적화형)으로 정돈합니다.
              </p>
            </div>

            {/* Large Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C]">
                작성한 문안을 붙여넣어주세요 <span className="text-red-700">*</span>
              </label>
              <textarea
                value={userDraftText}
                onChange={(e) => setUserDraftText(e.target.value)}
                placeholder="인스타그램 피드 카피, 블로그 초안, 공지 사항 등 교정하고 싶은 문안을 자유롭게 입력하세요."
                rows={6}
                className="w-full p-4 text-xs sm:text-sm border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5] leading-relaxed font-sans"
              />
            </div>

            {/* Purpose & Tone Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2C2C2C]">게시 목적 / 채널</label>
                <div className="flex flex-wrap gap-1.5">
                  {POLISH_CHANNEL_PURPOSES.map((pur) => (
                    <button
                      key={pur}
                      type="button"
                      onClick={() => setPolishPurpose(pur)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                        polishPurpose === pur
                          ? 'bg-[#736152] text-white border-[#736152] shadow-2xs'
                          : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {pur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2C2C2C]">다듬을 톤앤매너</label>
                <div className="flex flex-wrap gap-1.5">
                  {POLISH_TONE_OPTIONS.map((tn) => (
                    <button
                      key={tn}
                      type="button"
                      onClick={() => setPolishTone(tn)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                        polishTone === tn
                          ? 'bg-[#736152] text-white border-[#736152] shadow-2xs'
                          : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {tn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePolishDraft}
                disabled={!userDraftText.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-[#736152] hover:bg-[#5C4E43] disabled:opacity-50 text-white text-xs font-bold tracking-wider flex items-center justify-center space-x-2 shadow-2xs cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>문안 다듬기 실행</span>
              </button>
            </div>
          </div>

          {/* POLISH RESULTS SECTION */}
          {polishResult && (
            <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-[#FAF8F5] text-[#736152] px-2 py-0.5 border border-[#D4C8B8]">
                      워싱 결과
                    </span>
                    <span className="text-xs text-[#8C7A6B]">
                      채널: {polishResult.purpose} &middot; 톤: {polishResult.tone}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#2C2C2C]">
                    3단계 워싱 문안 및 검수 리포트
                  </h3>
                </div>

                {/* KR / EN Switcher for Polish */}
                <div className="flex items-center bg-[#FAF8F5] border border-[#D4C8B8] p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setActivePolishLangTab('KR')}
                    className={`px-3 py-1.5 transition-colors cursor-pointer ${
                      activePolishLangTab === 'KR'
                        ? 'bg-[#736152] text-white shadow-2xs'
                        : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <span>KR (국문)</span>
                  </button>
                  <button
                    onClick={() => setActivePolishLangTab('EN')}
                    className={`px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1 ${
                      activePolishLangTab === 'EN'
                        ? 'bg-[#736152] text-white shadow-2xs'
                        : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>EN (영문)</span>
                  </button>
                </div>
              </div>

              {/* 3 Polish Levels Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setActivePolishLevel('level1')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activePolishLevel === 'level1'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">LEVEL 1</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">원문 유지형</div>
                  <div className="text-[10px] text-[#8C7A6B]">오타·맞춤법·띄어쓰기 교정</div>
                </button>

                <button
                  onClick={() => setActivePolishLevel('level2')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activePolishLevel === 'level2'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">LEVEL 2</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">추천 개선형</div>
                  <div className="text-[10px] text-[#8C7A6B]">문장 흐름·전달력·브랜드 톤</div>
                </button>

                <button
                  onClick={() => setActivePolishLevel('level3')}
                  className={`p-3 text-left border transition-all cursor-pointer ${
                    activePolishLevel === 'level3'
                      ? 'bg-[#FAF8F5] border-[#736152] ring-1 ring-[#736152]'
                      : 'bg-white border-[#D4C8B8] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="text-[11px] font-bold text-[#736152]">LEVEL 3</div>
                  <div className="text-xs font-bold text-[#2C2C2C] mt-0.5">SNS 최적화형</div>
                  <div className="text-[10px] text-[#8C7A6B]">Hook·길이·CTA·해시태그</div>
                </button>
              </div>

              {/* Polish Text Display */}
              {(() => {
                const targetObj =
                  activePolishLevel === 'level1'
                    ? polishResult.level1_literal
                    : activePolishLevel === 'level2'
                    ? polishResult.level2_recommended
                    : polishResult.level3_optimized;

                const textToDisplay =
                  activePolishLangTab === 'KR' ? targetObj.text : targetObj.enText;

                return (
                  <div className="space-y-4">
                    <div className="bg-[#FAF8F5] border border-[#D4C8B8] p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                        <span className="text-xs font-bold text-[#736152]">
                          {targetObj.title}
                        </span>
                        <button
                          onClick={() => handleCopy(textToDisplay, `polish-${activePolishLevel}-${activePolishLangTab}`)}
                          className="px-3 py-1 bg-white border border-[#D4C8B8] text-[#5C4E43] hover:text-[#2C2C2C] text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                        >
                          {copiedKey === `polish-${activePolishLevel}-${activePolishLangTab}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-emerald-700 font-bold">복사 완료</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#736152]" />
                              <span>문안 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-[#2C2C2C] leading-relaxed select-text">
                        {textToDisplay}
                      </pre>

                      <div className="text-[11px] text-[#8C7A6B] bg-white p-3 border border-[#E8E4DC]">
                        {targetObj.summary}
                      </div>
                    </div>

                    {/* Text Inspection & Proofreading Breakdown */}
                    <div className="bg-[#F5F2EB] border border-[#D4C8B8] p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-[#736152]" />
                          <span className="text-xs font-bold text-[#2C2C2C]">
                            기본 문장 &amp; 사실관계 검수 결과
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          {polishResult.inspection.factPreservationNote}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="font-bold text-[#736152]">맞춤법 &amp; 띄어쓰기</div>
                          <ul className="text-[#5C4E43] space-y-0.5">
                            {polishResult.inspection.spellingSpacing.map((item, i) => (
                              <li key={i}>&bull; {item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="font-bold text-[#736152]">문법 &amp; 표현 정돈</div>
                          <ul className="text-[#5C4E43] space-y-0.5">
                            {polishResult.inspection.grammar.map((item, i) => (
                              <li key={i}>&bull; {item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="font-bold text-[#736152]">중복 표현 점검</div>
                          <ul className="text-[#5C4E43] space-y-0.5">
                            {polishResult.inspection.repetitivePhrases.map((item, i) => (
                              <li key={i}>&bull; {item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                          <div className="font-bold text-[#736152]">과장/AI 표현 필터링</div>
                          <ul className="text-[#5C4E43] space-y-0.5">
                            {polishResult.inspection.aiStylePhrases.map((item, i) => (
                              <li key={i}>&bull; {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
