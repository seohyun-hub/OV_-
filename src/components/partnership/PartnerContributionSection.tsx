import React from 'react';
import {
  Building2,
  Coins,
  Gift,
  Calculator,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  HelpCircle,
  Tag,
  Layers
} from 'lucide-react';
import { PartnerContributionInput } from '../../types';

interface PartnerContributionSectionProps {
  input: PartnerContributionInput;
  onChangeInput: (newInput: PartnerContributionInput) => void;
  onCalculateDeal: () => void;
  isCalculating?: boolean;
}

export const PartnerContributionSection: React.FC<PartnerContributionSectionProps> = ({
  input,
  onChangeInput,
  onCalculateDeal,
  isCalculating = false,
}) => {
  // Safe number conversions
  const cash = Number(input.cashSupport || 0);
  const productRetail = Number(input.productSupport || 0);
  const recognitionRate = Number(input.inKindRecognitionRate ?? 70);
  const otherSupport = Number(input.otherSupportValue || 0);

  // Math Calculations
  const inKindRecognizedValue = Math.round((productRetail * recognitionRate) / 100);
  const totalNominalValue = cash + productRetail + otherSupport;
  const partnerEffectiveValue = cash + inKindRecognizedValue + otherSupport;

  const handleChangeField = (field: keyof PartnerContributionInput, value: any) => {
    onChangeInput({
      ...input,
      [field]: value,
    });
  };

  return (
    <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E4DC] pb-4 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-mono uppercase bg-[#8C7A6B] text-white font-medium mb-1">
            <Coins className="w-3 h-3 text-[#D4C8B8]" />
            <span>STEP 2 &middot; PARTNER VALUE & CONTRIBUTION</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2C2C2C]">
            2. 파트너 제공가치 (Partner Value Input)
          </h2>
          <p className="text-xs text-[#66584C] mt-1 font-light">
            파트너사의 현금 지원, 현물 소비자가, 현물 인정률, 기타 지원가치를 입력하여 <strong>파트너 실질 제공가치</strong>를 산정합니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onCalculateDeal}
            disabled={isCalculating}
            className="px-6 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <Calculator className="w-4 h-4 text-[#D4C8B8]" />
            <span>{isCalculating ? '계산 중...' : '제휴 조건 계산'}</span>
          </button>
        </div>
      </div>

      {/* 4 Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Partner / Brand Name */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 space-y-2">
          <label className="text-xs font-mono font-bold text-[#736152] uppercase flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>업체 / 브랜드명</span>
            </span>
            <span className="text-[10px] text-[#8C7A6B]">필수</span>
          </label>
          <input
            type="text"
            value={input.companyName}
            onChange={(e) => handleChangeField('companyName', e.target.value)}
            placeholder="예: Nike Korea, Snow Peak"
            className="w-full px-3 py-2.5 bg-white border border-[#D4C8B8] rounded-xs font-semibold text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
          />
          <p className="text-[10px] text-[#8C7A6B]">제휴 검토 대상 파트너명</p>
        </div>

        {/* 2. Cash Support */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 space-y-2">
          <label className="text-xs font-mono font-bold text-[#736152] uppercase flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-700" />
              <span>현금 지원 (Cash)</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold">인정률 100%</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step={1000000}
              value={input.cashSupport || ''}
              onChange={(e) => handleChangeField('cashSupport', Number(e.target.value) || 0)}
              placeholder="30,000,000"
              className="w-full px-3 py-2.5 bg-white border border-[#D4C8B8] rounded-xs font-mono font-bold text-xs text-[#2C2C2C] text-right pr-8 focus:outline-none focus:border-[#736152]"
            />
            <span className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] font-bold">원</span>
          </div>
          <p className="text-[10px] text-[#8C7A6B]">행사/시설 협찬금 및 순수 현금 지원</p>
        </div>

        {/* 3. In-kind Retail Price & Recognition Rate */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 space-y-2">
          <label className="text-xs font-mono font-bold text-[#736152] uppercase flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-700" />
              <span>현물 소비자가</span>
            </span>
            <span className="text-[10px] text-amber-900 font-bold">소비자가 기준</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step={1000000}
              value={input.productSupport || ''}
              onChange={(e) => handleChangeField('productSupport', Number(e.target.value) || 0)}
              placeholder="15,000,000"
              className="w-full px-3 py-2.5 bg-white border border-[#D4C8B8] rounded-xs font-mono font-bold text-xs text-[#2C2C2C] text-right pr-8 focus:outline-none focus:border-[#736152]"
            />
            <span className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] font-bold">원</span>
          </div>

          {/* In-kind Recognition Rate slider & input */}
          <div className="pt-1 border-t border-[#E8E4DC] flex items-center justify-between text-[11px]">
            <span className="text-[#786658]">현물 인정률:</span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min={0}
                max={100}
                value={recognitionRate}
                onChange={(e) => handleChangeField('inKindRecognitionRate', Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-14 px-1.5 py-0.5 bg-white border border-[#D4C8B8] rounded-xs text-xs font-mono font-bold text-right text-[#2C2C2C]"
              />
              <span className="font-mono text-[#736152] font-bold">%</span>
            </div>
          </div>
        </div>

        {/* 4. Other Support Value */}
        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs p-4 space-y-2">
          <label className="text-xs font-mono font-bold text-[#736152] uppercase flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-700" />
              <span>기타 지원가치</span>
            </span>
            <span className="text-[10px] text-sky-800">마케팅/인력</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step={500000}
              value={input.otherSupportValue || ''}
              onChange={(e) => handleChangeField('otherSupportValue', Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2.5 bg-white border border-[#D4C8B8] rounded-xs font-mono font-bold text-xs text-[#2C2C2C] text-right pr-8 focus:outline-none focus:border-[#736152]"
            />
            <span className="absolute right-3 top-2.5 text-xs text-[#8C7A6B] font-bold">원</span>
          </div>
          <input
            type="text"
            value={input.otherSupportDesc || ''}
            onChange={(e) => handleChangeField('otherSupportDesc', e.target.value)}
            placeholder="내역: SNS 마케팅, 인플루언서 섭외 등"
            className="w-full px-2 py-1 bg-white border border-[#E8E4DC] rounded-xs text-[10px] text-[#2C2C2C]"
          />
        </div>

      </div>

      {/* Calculated Partner Valuation Summary Card */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        <div>
          <div className="text-[11px] font-mono font-bold text-[#736152] uppercase">
            현금 지원 (100%)
          </div>
          <div className="text-base font-mono font-bold text-emerald-800 mt-0.5">
            ₩ {cash.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono font-bold text-[#736152] uppercase">
            현물 실질 인정가 ({recognitionRate}%)
          </div>
          <div className="text-base font-mono font-bold text-amber-900 mt-0.5">
            ₩ {inKindRecognizedValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8C7A6B]">
            (소비자가 ₩{productRetail.toLocaleString()} &times; {recognitionRate}%)
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono font-bold text-[#736152] uppercase">
            기타 지원가치
          </div>
          <div className="text-base font-mono font-bold text-sky-900 mt-0.5">
            ₩ {otherSupport.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#736152] text-white p-4 rounded-xs border border-[#5C4E43] shadow-xs">
          <div className="text-[10px] font-mono text-[#D4C8B8] uppercase font-bold flex items-center justify-between">
            <span>파트너 실질 제공가치</span>
            <span className="text-amber-300 text-[11px]">총합</span>
          </div>
          <div className="text-xl font-mono font-bold text-white mt-1">
            ₩ {partnerEffectiveValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#EFECE6] mt-0.5">
            (명목 합계: ₩{totalNominalValue.toLocaleString()})
          </div>
        </div>

      </div>

    </div>
  );
};
