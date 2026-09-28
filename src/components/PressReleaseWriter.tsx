import React, { useState } from 'react';
import {
  PressReleaseInput,
  PressReleaseResult,
  PressReleaseArticle,
} from '../types';
import {
  generatePressRelease,
  polishExistingPressRelease,
} from '../utils/pressReleaseEngine';
import {
  Newspaper,
  Edit3,
  Sparkles,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Tag,
  Users,
  Info,
  Phone,
  Mail,
  QrCode,
  ArrowRight,
} from 'lucide-react';

interface PressReleaseWriterProps {
  onOpenQRCodeModal?: (url?: string, name?: string) => void;
}

export const PressReleaseWriter: React.FC<PressReleaseWriterProps> = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'polish'>('create');

  // Mode 1: Create New Press Release State
  const [subject, setSubject] = useState<string>('');
  const [issuer, setIssuer] = useState<string>('IPARK리조트 오크밸리');
  const [moodTone, setMoodTone] = useState<string>('공식적 / 정보형');
  const [keyHighlight, setKeyHighlight] = useState<string>('');
  const [briefDescription, setBriefDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [participatingBrands, setParticipatingBrands] = useState<string>('');
  const [extraInfo, setExtraInfo] = useState<string>('');

  // Mode 2: Polish Existing Draft State
  const [rawDraftInput, setRawDraftInput] = useState<string>('');

  // Generation Results
  const [result, setResult] = useState<PressReleaseResult | null>(null);
  const [langTab, setLangTab] = useState<'KR' | 'EN'>('KR');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !keyHighlight.trim()) return;

    const res = generatePressRelease({
      subject,
      issuer,
      moodTone,
      keyHighlight,
      briefDescription,
      eventInfo: {
        date,
        location,
        targetAudience,
        price,
        participatingBrands,
        extraInfo,
      },
    });
    setResult(res);
    setLangTab('KR');
  };

  const handlePolish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDraftInput.trim()) return;

    const res = polishExistingPressRelease(rawDraftInput);
    setResult(res);
    setLangTab('KR');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* 1. HEADER */}
      <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#736152] bg-[#FAF8F5] px-2.5 py-0.5 border border-[#D4C8B8]">
                MEDIA RELATIONS &amp; PR
              </span>
              <span className="text-[11px] text-[#8C7A6B] font-medium">
                언론 배포용 프레스 릴리즈
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] tracking-tight">
              보도자료 작성
            </h1>
            <p className="text-xs sm:text-sm text-[#5C4E43] leading-relaxed max-w-3xl">
              행사·제휴·신규 서비스 등 전달하고 싶은 내용을 입력하면 언론 배포에 적합한 보도자료 형식으로 작성하고 문장·맞춤법·표현을 점검합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2. MODE SELECTOR (새 보도자료 작성 vs 기존 보도자료 다듬기) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => {
            setActiveTab('create');
            setResult(null);
          }}
          className={`p-4 text-left border transition-all cursor-pointer flex items-center space-x-3 ${
            activeTab === 'create'
              ? 'bg-white border-[#736152] ring-2 ring-[#736152]/20 shadow-sm'
              : 'bg-[#FAF8F5] border-[#D4C8B8] hover:bg-white'
          }`}
        >
          <div className="w-8 h-8 bg-[#FAF8F5] border border-[#D4C8B8] flex items-center justify-center text-[#736152] shrink-0">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C2C2C]">새 보도자료 작성</div>
            <div className="text-[11px] text-[#8C7A6B]">기본 정보 입력으로 표준 보도자료 및 영문 릴리즈 생성</div>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('polish');
            setResult(null);
          }}
          className={`p-4 text-left border transition-all cursor-pointer flex items-center space-x-3 ${
            activeTab === 'polish'
              ? 'bg-white border-[#736152] ring-2 ring-[#736152]/20 shadow-sm'
              : 'bg-[#FAF8F5] border-[#D4C8B8] hover:bg-white'
          }`}
        >
          <div className="w-8 h-8 bg-[#FAF8F5] border border-[#D4C8B8] flex items-center justify-center text-[#736152] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C2C2C]">기존 보도자료 다듬기</div>
            <div className="text-[11px] text-[#8C7A6B]">작성한 초안을 붙여넣어 언론사 규격 문체로 워싱</div>
          </div>
        </button>
      </div>

      {/* 3. INPUT FORM */}
      {activeTab === 'create' ? (
        <form onSubmit={handleGenerate} className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="border-b border-[#E8E4DC] pb-3">
            <h2 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <Newspaper className="w-4 h-4 text-[#736152]" />
              <span>보도자료 기본 정보 입력</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2C]">
                주제 <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: 오크밸리 봄맞이 참나무 숲길 트레킹 챌린지 론칭"
                required
                className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
            </div>

            {/* Issuer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">
                발표 주체
              </label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="예: IPARK리조트 오크밸리, 파크로쉬 리조트앤웰니스"
                className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
            </div>

            {/* Mood / Tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C2C2C]">
                무드 / 톤
              </label>
              <select
                value={moodTone}
                onChange={(e) => setMoodTone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              >
                <option value="공식적 / 정보형">공식적 / 객관적 정보 전달형 (권장)</option>
                <option value="프리미엄 / 하이엔드">프리미엄 / 하이엔드 럭셔리</option>
                <option value="트렌디 / 역동적">트렌디 / 아웃도어 &amp; 라이프스타일</option>
                <option value="웰니스 / 힐링">웰니스 / 마인드풀 힐링</option>
              </select>
            </div>

            {/* Key Highlight */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#2C2C2C]">
                가장 강조하고 싶은 내용 <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={keyHighlight}
                onChange={(e) => setKeyHighlight(e.target.value)}
                placeholder="예: 울창한 참나무 숲 피톤치드 코스와 전문 인스트럭터 맞춤 케어"
                required
                className="w-full px-3 py-2 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
            </div>

            {/* Brief Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#2C2C2C]">
                간략 설명 <span className="text-[10px] text-[#8C7A6B]">(선택)</span>
              </label>
              <textarea
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                rows={3}
                placeholder="기획 배경이나 프로그램 의도를 자유롭게 기재하세요."
                className="w-full p-3 text-xs border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Event / Service Info */}
          <div className="bg-[#FAF8F5] border border-[#E8E4DC] p-4 space-y-3">
            <div className="text-xs font-bold text-[#736152]">
              행사 / 서비스 기본 정보 <span className="text-[10px] text-[#8C7A6B] font-normal">(입력된 사실만 보도자료에 반영됩니다)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">일정/날짜</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="예: 2026년 4월 1일 ~ 5월 31일"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">장소</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="예: 오크밸리 리조트 참나무 숲길"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">대상</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="예: 투숙객 및 방문 고객"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">이용 요금 / 가격</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예: 투숙객 무료"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">참여/제휴 브랜드</label>
                <input
                  type="text"
                  value={participatingBrands}
                  onChange={(e) => setParticipatingBrands(e.target.value)}
                  placeholder="예: IPARK리조트"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#5C4E43]">기타/예약 안내</label>
                <input
                  type="text"
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  placeholder="예: 사전 온라인 예약 필수"
                  className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-[#D4C8B8] focus:outline-none focus:border-[#736152]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold tracking-wider flex items-center justify-center space-x-2 shadow-2xs cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>언론 배포용 보도자료 생성하기</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePolish} className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="border-b border-[#E8E4DC] pb-3">
            <h2 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#736152]" />
              <span>기존 보도자료 초안 붙여넣기</span>
            </h2>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              원문 내용과 사실관계는 100% 유지하며, 기자들이 사용하는 표준 보도체(~밝혔다, ~전했다) 및 단락 구조로 워싱합니다.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2C2C2C]">
              보도자료 초안 원문 <span className="text-red-700">*</span>
            </label>
            <textarea
              value={rawDraftInput}
              onChange={(e) => setRawDraftInput(e.target.value)}
              rows={8}
              placeholder="작성해 둔 보도자료 초안 또는 행사 개요 텍스트를 붙여넣으세요."
              required
              className="w-full p-4 text-xs sm:text-sm border border-[#D4C8B8] focus:outline-none focus:border-[#736152] bg-[#FAF8F5] leading-relaxed font-sans"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!rawDraftInput.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-[#736152] hover:bg-[#5C4E43] disabled:opacity-50 text-white text-xs font-bold tracking-wider flex items-center justify-center space-x-2 shadow-2xs cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>보도자료용으로 다듬기</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. RESULT DISPLAY */}
      {result && (
        <div className="bg-white border border-[#D4C8B8] p-5 sm:p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
          
          {/* Header of Results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold bg-[#FAF8F5] text-[#736152] px-2 py-0.5 border border-[#D4C8B8]">
                  PRESS RELEASE
                </span>
                <span className="text-xs text-[#8C7A6B]">
                  {result.mode === 'CREATE' ? '신규 작성 모드' : '초안 워싱 모드'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2C2C2C]">
                완성된 언론 배포용 보도자료
              </h3>
            </div>

            {/* Language Switcher (KR / EN) */}
            <div className="flex items-center bg-[#FAF8F5] border border-[#D4C8B8] p-0.5 text-xs font-bold">
              <button
                onClick={() => setLangTab('KR')}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  langTab === 'KR'
                    ? 'bg-[#736152] text-white shadow-2xs'
                    : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                }`}
              >
                <span>KR (국문 보도자료)</span>
              </button>
              <button
                onClick={() => setLangTab('EN')}
                className={`px-3 py-1.5 transition-colors cursor-pointer flex items-center space-x-1 ${
                  langTab === 'EN'
                    ? 'bg-[#736152] text-white shadow-2xs'
                    : 'text-[#5C4E43] hover:text-[#2C2C2C]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>EN (영문 보도자료)</span>
              </button>
            </div>
          </div>

          {/* Article View */}
          {(() => {
            const article: PressReleaseArticle =
              langTab === 'KR' ? result.koreanRelease : result.englishRelease;

            const fullTextToCopy = `[보도자료]\n\n${article.recommendedHeadline}\n\n${article.subtitle}\n\n${article.leadParagraph}\n\n${article.bodySections
              .map((s) => `${s.sectionTitle}\n${s.paragraphs.join('\n\n')}`)
              .join('\n\n')}\n\n[핵심 요약]\n${article.keyHighlights.join('\n')}\n\n[회사 소개]\n${article.aboutCompany}\n\n[보도 문의]\n${article.pressContact.department} | ${article.pressContact.contactPerson}\n이메일: ${article.pressContact.email} | 전화: ${article.pressContact.phone}`;

            return (
              <div className="space-y-6">
                
                {/* Headline Candidates Box */}
                <div className="bg-[#FAF8F5] border border-[#D4C8B8] p-4 space-y-2.5">
                  <div className="text-xs font-bold text-[#736152] flex items-center space-x-1.5">
                    <span>💡 언론사 배포용 제목 후보 3종</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#2C2C2C]">
                    {article.headlineCandidates.map((cand, idx) => (
                      <div
                        key={idx}
                        className={`p-2 border flex items-center justify-between ${
                          idx === 0
                            ? 'bg-white border-[#736152] font-bold text-[#736152]'
                            : 'bg-white/60 border-[#E8E4DC]'
                        }`}
                      >
                        <span>{cand}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-[#736152] text-white px-1.5 py-0.2 font-mono">
                            추천
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Article Document Box */}
                <div className="bg-[#FAF8F5] border border-[#D4C8B8] p-5 sm:p-8 space-y-6">
                  
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-4">
                    <span className="text-[11px] font-mono text-[#8C7A6B]">
                      배포 일시: 즉시 배포 가능
                    </span>
                    <button
                      onClick={() => handleCopy(fullTextToCopy, `pr-${langTab}`)}
                      className="px-3 py-1.5 bg-white border border-[#D4C8B8] text-[#5C4E43] hover:text-[#2C2C2C] text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      {copiedKey === `pr-${langTab}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-emerald-700 font-bold">복사 완료</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#736152]" />
                          <span>보도자료 전체 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Headline & Subtitle */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-[#2C2C2C] leading-snug">
                      {article.recommendedHeadline}
                    </h2>
                    <div className="text-xs sm:text-sm text-[#5C4E43] whitespace-pre-line leading-relaxed bg-white p-3 border border-[#E8E4DC]">
                      {article.subtitle}
                    </div>
                  </div>

                  {/* Lead Paragraph */}
                  <div className="text-xs sm:text-sm text-[#2C2C2C] font-medium leading-relaxed bg-white p-4 border border-[#E8E4DC]">
                    <span className="font-bold text-[#736152] block mb-1">[리드문]</span>
                    {article.leadParagraph}
                  </div>

                  {/* Body Sections */}
                  <div className="space-y-4">
                    {article.bodySections.map((sec, i) => (
                      <div key={i} className="bg-white p-4 border border-[#E8E4DC] space-y-2">
                        <h4 className="text-xs font-bold text-[#736152]">
                          {sec.sectionTitle}
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm text-[#2C2C2C] leading-relaxed">
                          {sec.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="whitespace-pre-line">
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Key Highlights */}
                  <div className="bg-white p-4 border border-[#E8E4DC] space-y-2">
                    <h4 className="text-xs font-bold text-[#736152]">
                      ■ 핵심 내용 요약 (Key Highlights)
                    </h4>
                    <ul className="space-y-1 text-xs text-[#5C4E43]">
                      {article.keyHighlights.map((hl, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-[#736152]">&bull;</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* About Company & Press Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 border border-[#E8E4DC] space-y-1.5">
                      <div className="font-bold text-[#736152]">회사 및 시설 소개</div>
                      <p className="text-[#5C4E43] leading-relaxed">
                        {article.aboutCompany}
                      </p>
                    </div>

                    <div className="bg-white p-4 border border-[#E8E4DC] space-y-1.5">
                      <div className="font-bold text-[#736152]">보도 및 취재 문의</div>
                      <div className="space-y-1 text-[#5C4E43]">
                        <div>• 담당: {article.pressContact.department} ({article.pressContact.contactPerson})</div>
                        <div>• 이메일: {article.pressContact.email}</div>
                        <div>• 유선: {article.pressContact.phone}</div>
                        {article.pressContact.note && (
                          <div className="text-[10px] text-[#8C7A6B] pt-1">
                            {article.pressContact.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspection Checklist Report */}
                <div className="bg-[#F5F2EB] border border-[#D4C8B8] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#736152]" />
                      <span className="text-xs font-bold text-[#2C2C2C]">
                        저널리즘 규격 &amp; 사실관계 검수 리포트
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      {result.inspectionChecklist.factIntegrityCheck}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                      <div className="font-bold text-[#736152]">맞춤법 &amp; 보도 표기법</div>
                      <ul className="text-[#5C4E43] space-y-0.5">
                        {result.inspectionChecklist.spellingGrammar.map((item, i) => (
                          <li key={i}>&bull; {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 border border-[#E8E4DC] space-y-1">
                      <div className="font-bold text-[#736152]">보도체 어조 평가</div>
                      <p className="text-[#5C4E43]">{result.inspectionChecklist.journalismToneEvaluation}</p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
