import React, { useState } from 'react';
import {
  PartnerTargetInput,
  PartnerDiscoveryResult,
  ProjectType,
  RequiredPartnershipType,
  TargetCandidateItem,
} from '../types';
import {
  Search,
  Building2,
  Calendar,
  MapPin,
  Users,
  Target,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Handshake,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface PartnerTargetListViewProps {
  onAnalyzeCompany: (companyName: string) => void;
  onStartPartnershipWithCompany: (companyName: string, projectContext?: PartnerTargetInput) => void;
}

const PROJECT_TYPE_OPTIONS: ProjectType[] = [
  'Running',
  'Golf',
  'Wellness',
  'Hospitality',
  'F&B',
  'Outdoor',
  'Family',
  'Culture',
  'Exhibition',
  'Festival',
  'Membership',
];

const PARTNERSHIP_TYPE_OPTIONS: RequiredPartnershipType[] = [
  'Cash Sponsorship',
  'Product Sponsorship',
  'Brand Experience',
  'Joint Marketing',
  'Content',
  'VIP',
  'Sampling',
  'Sales',
  'Membership',
];

export const PartnerTargetListView: React.FC<PartnerTargetListViewProps> = ({
  onAnalyzeCompany,
  onStartPartnershipWithCompany,
}) => {
  // Input State
  const [projectName, setProjectName] = useState<string>('2026 Oak Valley Night Run');
  const [projectType, setProjectType] = useState<ProjectType>('Running');
  const [eventDate, setEventDate] = useState<string>('2026.08.20');
  const [location, setLocation] = useState<string>('오크밸리 야외 잔디광장 & 참나무 숲길');
  const [expectedParticipants, setExpectedParticipants] = useState<string>('1,000명');
  const [targetCustomer, setTargetCustomer] = useState<string>('20~40대 러너 및 트렌디 라이프스타일 애호가');
  const [selectedPartnershipTypes, setSelectedPartnershipTypes] = useState<RequiredPartnershipType[]>([
    'Cash Sponsorship',
    'Brand Experience',
  ]);
  const [desiredCashSponsorship, setDesiredCashSponsorship] = useState<number>(30000000);

  // Discovery Result State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [discoveryResult, setDiscoveryResult] = useState<PartnerDiscoveryResult | null>(null);

  const togglePartnershipType = (pType: RequiredPartnershipType) => {
    if (selectedPartnershipTypes.includes(pType)) {
      setSelectedPartnershipTypes(selectedPartnershipTypes.filter((t) => t !== pType));
    } else {
      setSelectedPartnershipTypes([...selectedPartnershipTypes, pType]);
    }
  };

  const handleDiscover = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectName.trim()) {
      setError('프로젝트 또는 행사명을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/discover-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          projectType,
          eventDate,
          location,
          expectedParticipants,
          targetCustomer,
          requiredPartnershipTypes: selectedPartnershipTypes,
          desiredCashSponsorship,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.result) {
        setDiscoveryResult(data.result);
      } else {
        setError(data?.error || '데이터 조회에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      console.error('Error discovering partner targets:', err);
      setError('데이터 조회에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      
      {/* Header Banner */}
      <div className="bg-[#EFECE6] border border-[#D4C8B8] rounded-xs p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-xs text-[11px] font-mono uppercase bg-[#736152] text-white font-medium mb-3">
              <Sparkles className="w-3 h-3 text-[#D4C8B8]" />
              <span>DISCOVER &rarr; PARTNER TARGET LIST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2C2C2C] tracking-tight">
              프로젝트 기반 파트너 타깃 리스트 발굴
            </h1>
            <p className="text-sm text-[#66584C] mt-2 font-light max-w-3xl">
              행사·프로젝트 조건(타깃, 규모, 필요 협찬 유형)을 입력하면, 실제 협찬 이력·마케팅 캠페인 근거가 입증된 
              최적의 스폰서십 & 제휴 후보 기업을 자동 추천합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 border-b border-[#E8E4DC] pb-4 mb-6">
          <Sliders className="w-5 h-5 text-[#736152]" />
          <h2 className="text-lg font-bold font-serif text-[#2C2C2C]">
            1. 프로젝트 & 행사 조건 입력
          </h2>
        </div>

        <form onSubmit={handleDiscover} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Project / Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="예: 2026 Oak Valley Night Run"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                required
              />
            </div>

            {/* Project Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              >
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Event Date
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="예: 2026.08.20"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 오크밸리 잔디광장 & 참나무 숲길"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              />
            </div>

            {/* Expected Participants */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Expected Participants
              </label>
              <input
                type="text"
                value={expectedParticipants}
                onChange={(e) => setExpectedParticipants(e.target.value)}
                placeholder="예: 1,000명"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              />
            </div>

            {/* Target Customer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Target Customer
              </label>
              <input
                type="text"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                placeholder="예: 20~40대 러너 및 라이프스타일 애호가"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
              />
            </div>

            {/* Desired Cash Sponsorship */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Desired Cash Sponsorship (목표 현금 스폰서십)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-[#8C7A6B]">₩</span>
                <input
                  type="number"
                  value={desiredCashSponsorship}
                  onChange={(e) => setDesiredCashSponsorship(Number(e.target.value))}
                  step={5000000}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-sm text-[#2C2C2C] font-semibold focus:outline-none focus:border-[#736152]"
                />
              </div>
              <div className="text-[11px] text-[#786658] font-mono">
                {desiredCashSponsorship > 0 ? `(약 ${(desiredCashSponsorship / 10000).toLocaleString()}만원)` : '0원'}
              </div>
            </div>

            {/* Required Partnership Type Selector */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-[#2C2C2C] uppercase tracking-wider font-mono">
                Required Partnership Type (희망 제휴 형태 선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {PARTNERSHIP_TYPE_OPTIONS.map((pType) => {
                  const isSelected = selectedPartnershipTypes.includes(pType);
                  return (
                    <button
                      key={pType}
                      type="button"
                      onClick={() => togglePartnershipType(pType)}
                      className={`px-3 py-1.5 text-xs rounded-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#736152] text-white border-[#736152] font-semibold shadow-xs'
                          : 'bg-[#FAF8F5] text-[#66584C] border-[#E8E4DC] hover:border-[#D4C8B8]'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{pType}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xs text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Search Button */}
          <div className="flex justify-end pt-2 border-t border-[#E8E4DC]">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-[#736152] hover:bg-[#5C4E43] text-white font-medium text-sm rounded-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4C8B8]" />
                  <span>실제 마케팅/스폰서십 근거 조사 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#D4C8B8]" />
                  <span>실제 스폰서/제휴 후보 기업 검색</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Discovery Results Section */}
      {discoveryResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Classified Industries Overview Bar */}
          <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-[#8C7A6B] font-semibold tracking-wider">
                TARGET CLASSIFIED INDUSTRIES (연계 추천 산업군)
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {discoveryResult.classifiedIndustries.map((ind, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#EFECE6] text-[#736152] border border-[#D4C8B8] text-xs font-medium rounded-xs"
                  >
                    #{ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-[#786658] text-right">
              검색 프로젝트: <strong className="text-[#2C2C2C]">{discoveryResult.projectInput.projectName}</strong>
              <br />
              후보 발굴 수: <strong className="text-[#736152] font-bold">{discoveryResult.candidates.length}개 기업</strong>
            </div>
          </div>

          {/* Candidates Result Table */}
          <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E4DC] flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-[#2C2C2C] flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#736152]" />
                <span>2. TARGET COMPANY DISCOVERY RESULT (실제 영업 검토용 파트너 테이블)</span>
              </h3>
              <span className="text-xs font-mono text-[#8C7A6B]">
                근거 입증 자료만 표시 (가짜 Score/임의 금액 금지)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EFECE6] text-[#66584C] font-mono uppercase tracking-wider text-[11px] border-b border-[#E8E4DC]">
                    <th className="py-3 px-4 font-semibold w-40">기업명 / 브랜드</th>
                    <th className="py-3 px-4 font-semibold w-28">산업</th>
                    <th className="py-3 px-4 font-semibold min-w-[180px]">최근 주요 마케팅 활동</th>
                    <th className="py-3 px-4 font-semibold min-w-[180px]">확인된 스폰서십 사례</th>
                    <th className="py-3 px-4 font-semibold min-w-[150px]">Oak Valley 접점</th>
                    <th className="py-3 px-4 font-semibold min-w-[160px]">추천 제안 방향</th>
                    <th className="py-3 px-4 font-semibold min-w-[170px]">Cash Sponsorship 가능성 근거</th>
                    <th className="py-3 px-4 font-semibold min-w-[150px]">공식 문의 채널</th>
                    <th className="py-3 px-4 font-semibold w-28">Source / Date</th>
                    <th className="py-3 px-4 font-semibold text-right w-44">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC]">
                  {discoveryResult.candidates.map((cand) => {
                    const isEvidenceMissing = cand.cashSponsorshipEvidence.includes('확인 자료 부족');

                    return (
                      <tr key={cand.id} className="hover:bg-[#FAF8F5] transition-colors">
                        
                        {/* Company & Brand */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-[#2C2C2C] text-sm">{cand.companyName}</div>
                          <div className="text-[11px] text-[#736152] font-mono mt-0.5">{cand.brand}</div>
                        </td>

                        {/* Industry */}
                        <td className="py-4 px-4 align-top">
                          <span className="inline-block px-2 py-0.5 bg-[#EFECE6] text-[#66584C] text-[10px] rounded-xs font-mono">
                            {cand.industry}
                          </span>
                        </td>

                        {/* Recent Marketing */}
                        <td className="py-4 px-4 align-top text-[#2C2C2C] leading-relaxed">
                          {cand.recentMarketingActivity}
                        </td>

                        {/* Verified Sponsorship Cases */}
                        <td className="py-4 px-4 align-top text-[#5C4E43] leading-relaxed">
                          {cand.verifiedSponsorshipCases}
                        </td>

                        {/* Touchpoint */}
                        <td className="py-4 px-4 align-top text-[#2C2C2C] font-medium">
                          {cand.oakValleyTouchpoint}
                        </td>

                        {/* Recommended Direction */}
                        <td className="py-4 px-4 align-top text-[#736152] font-semibold">
                          {cand.recommendedDirection}
                        </td>

                        {/* Cash Sponsorship Evidence */}
                        <td className="py-4 px-4 align-top">
                          {isEvidenceMissing ? (
                            <div className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-300 rounded-xs font-mono text-[11px] font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                              <span>확인 자료 부족</span>
                            </div>
                          ) : (
                            <div className="text-[#2C2C2C] bg-[#F5F2EB] p-2 rounded-xs border border-[#E8E4DC]">
                              <div className="text-[11px] font-semibold text-[#736152] mb-0.5">✓ 실적 입증</div>
                              {cand.cashSponsorshipEvidence}
                            </div>
                          )}
                        </td>

                        {/* Contact Inquiry */}
                        <td className="py-4 px-4 align-top text-[11px] text-[#5C4E43] font-mono">
                          {cand.contactInquiry}
                        </td>

                        {/* Source */}
                        <td className="py-4 px-4 align-top text-[10px] font-mono text-[#8C7A6B]">
                          <div>{cand.source}</div>
                          <div className="text-[#786658] mt-0.5">{cand.sourceDate}</div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 align-top text-right space-y-2">
                          <button
                            onClick={() => onAnalyzeCompany(cand.companyName)}
                            className="w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-[#EFECE6] hover:bg-[#E5DFD5] text-[#2C2C2C] border border-[#D4C8B8] text-[11px] font-medium rounded-xs transition-colors cursor-pointer"
                          >
                            <Building2 className="w-3 h-3 text-[#736152]" />
                            <span>기업 상세 분석</span>
                          </button>

                          <button
                            onClick={() => onStartPartnershipWithCompany(cand.companyName, discoveryResult.projectInput)}
                            className="w-full flex items-center justify-center space-x-1 px-2.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-medium rounded-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <Handshake className="w-3 h-3 text-[#D4C8B8]" />
                            <span>제휴 검토 시작</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
