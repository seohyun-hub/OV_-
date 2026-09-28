import React from 'react';
import { Building2, Sparkles, DollarSign, Target, CheckCircle2, Award } from 'lucide-react';
import { PartnerInput, CompanyReport } from '../../types';
import { SAMPLE_COMPANY_REPORTS } from '../../data/sampleData';

interface PartnerInputSectionProps {
  partnerInput: PartnerInput;
  onChangePartnerInput: (newInput: PartnerInput) => void;
  activeCompanyReport?: CompanyReport | null;
  onApplyCompanyReport?: (report: CompanyReport) => void;
}

export const OBJECTIVE_OPTIONS = [
  'Brand Awareness',
  'Product Experience',
  'Sales',
  'VIP Marketing',
  'Golf',
  'Wellness',
  'Event',
  'Sampling',
  'Content',
  'Membership',
  'Customer Acquisition',
];

export const PartnerInputSection: React.FC<PartnerInputSectionProps> = ({
  partnerInput,
  onChangePartnerInput,
  activeCompanyReport,
  onApplyCompanyReport,
}) => {

  const handleCompanySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (!selectedName) return;

    const report = SAMPLE_COMPANY_REPORTS[selectedName];
    if (report && onApplyCompanyReport) {
      onApplyCompanyReport(report);
    } else {
      onChangePartnerInput({ ...partnerInput, companyName: selectedName });
    }
  };

  const updateNumberField = (field: keyof PartnerInput, value: string) => {
    const num = Number(value.replace(/[^0-9]/g, '')) || 0;
    onChangePartnerInput({ ...partnerInput, [field]: num });
  };

  const fmtInputWon = (num: number) => {
    if (!num) return '';
    return num.toLocaleString();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
      {/* Section Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center rounded-xs font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
              2. PARTNER INPUT & OBJECTIVES
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              제휴 파트너 기업 정보 및 파트너 제안 가치 (Cash & Barter) 입력
            </p>
          </div>
        </div>

        {/* Quick Select Analyzed Companies */}
        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-300">분석된 기업 불러오기:</span>
          <select
            onChange={handleCompanySelect}
            className="bg-slate-800 text-white text-xs border border-slate-700 rounded-xs px-2.5 py-1.5 focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            <option value="">-- 기업 선택 --</option>
            {Object.keys(SAMPLE_COMPANY_REPORTS).map((cName) => (
              <option key={cName} value={cName}>
                {cName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Company Intelligence Auto-Reflected Banner */}
        {activeCompanyReport && (
          <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-4 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#736152]" />
                <span className="font-bold text-[#2C2C2C]">
                  기업 분석 데이터 자동 연동: [{activeCompanyReport.companyName}]
                </span>
              </div>
              <span className="px-2 py-0.5 bg-[#736152] text-white font-mono text-[10px] rounded-xs font-bold">
                연동 완료
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700 pt-1">
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Brand Identity:</span>
                <p className="truncate font-medium">{activeCompanyReport.brandIdentity?.positioning}</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Target Customer:</span>
                <p className="truncate font-medium">{activeCompanyReport.brandIdentity?.targetCustomer}</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Oak Valley Fit:</span>
                <p className="truncate font-medium">{activeCompanyReport.whyOakValley?.recommendedPartnershipDirection}</p>
              </div>
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Fit Score:</span>
                <p className="font-bold text-blue-800">{activeCompanyReport.oakValleyFit?.brandFitScore}점 / 100점</p>
              </div>
            </div>
          </div>
        )}

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Company & Objective */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 font-mono mb-1">
                Company / Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={partnerInput.companyName}
                onChange={(e) => onChangePartnerInput({ ...partnerInput, companyName: e.target.value })}
                placeholder="예: On Running, Blue Bottle, Garmin, TaylorMade"
                className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 font-mono mb-1">
                Partnership Objective (제휴 주요 목적) <span className="text-rose-500">*</span>
              </label>
              <select
                value={partnerInput.partnershipObjective}
                onChange={(e) => onChangePartnerInput({ ...partnerInput, partnershipObjective: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs p-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {OBJECTIVE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Financial Investment Breakdown */}
          <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-xs p-4">
            <span className="text-xs font-bold font-mono text-slate-900 block border-b border-slate-200 pb-2">
              PARTNER PROPOSED CONTRIBUTIONS (제안 금액)
            </span>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Cash Investment (현금)
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={fmtInputWon(partnerInput.cashInvestment)}
                    onChange={(e) => updateNumberField('cashInvestment', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xs p-2 pr-7 text-xs font-bold font-mono text-right text-slate-900"
                  />
                  <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">원</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Product Sponsorship (현물)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fmtInputWon(partnerInput.productSponsorship)}
                    onChange={(e) => updateNumberField('productSponsorship', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xs p-2 pr-7 text-xs font-bold font-mono text-right text-slate-900"
                  />
                  <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">원</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Marketing Support (마케팅)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fmtInputWon(partnerInput.marketingSupport)}
                    onChange={(e) => updateNumberField('marketingSupport', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xs p-2 pr-7 text-xs font-bold font-mono text-right text-slate-900"
                  />
                  <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">원</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Other Support (기타 지원)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fmtInputWon(partnerInput.otherSupport)}
                    onChange={(e) => updateNumberField('otherSupport', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xs p-2 pr-7 text-xs font-bold font-mono text-right text-slate-900"
                  />
                  <span className="absolute right-2 top-2 text-xs font-mono text-slate-400">원</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
