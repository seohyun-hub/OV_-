import React from 'react';
import { X, Sparkles, MapPin, Calendar, ExternalLink, ShieldCheck, Building2, Layers, CheckCircle2, Lightbulb, Compass, Award } from 'lucide-react';
import { ActivationItem } from '../types';
import { calculateActivationStatus } from '../utils/activationUtils';

interface ActivationDetailModalProps {
  activation: ActivationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatePartnershipProposal?: (brandName: string) => void;
}

export const ActivationDetailModal: React.FC<ActivationDetailModalProps> = ({
  activation,
  isOpen,
  onClose,
  onCreatePartnershipProposal,
}) => {
  if (!isOpen || !activation) return null;

  const currentStatus = calculateActivationStatus(activation.startDate, activation.endDate);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'bg-[#E2ECE9] text-[#1E5647] border-[#B2D3C9]';
      case 'UPCOMING':
        return 'bg-[#EBF2FA] text-[#225082] border-[#BACEE6]';
      case 'ENDED':
        return 'bg-[#F2EFEA] text-[#706458] border-[#D9D3C7]';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return '● ONGOING (진행 중)';
      case 'UPCOMING':
        return '▲ UPCOMING (진행 예정)';
      case 'ENDED':
        return '■ ENDED (종료됨)';
      default:
        return status;
    }
  };

  const { oakValleyParkRocheInsight, benchmark, source } = activation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1816]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#FAF8F5] rounded-xs shadow-2xl border border-[#D4C8B8] flex flex-col overflow-hidden text-[#2C2C2C]">
        
        {/* Modal Header */}
        <div className="bg-[#2C2C2C] text-[#FAF8F5] p-6 flex items-start justify-between shrink-0 border-b border-[#423C36]">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-0.5 border font-mono font-bold rounded-2xs text-[10px] ${getStatusBadge(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </span>
              <span className="px-2.5 py-0.5 bg-[#423C36] text-[#E8E4DC] border border-[#59514A] text-[10px] font-mono rounded-2xs">
                #{activation.eventType}
              </span>
              <span className="px-2.5 py-0.5 bg-[#736152] text-[#FAF8F5] text-[10px] font-mono font-medium rounded-2xs">
                {activation.brand}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-[#FAF8F5] tracking-tight leading-snug">
              {activation.eventName}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#C2B7AC] font-mono pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#D4C8B8]" />
                <span>{activation.location} ({activation.city})</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4C8B8]" />
                <span>{activation.periodText}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#C2B7AC] hover:text-[#FAF8F5] hover:bg-[#423C36] rounded-2xs transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* SECTION 1: Event Basic Information */}
          <section className="bg-white p-5 rounded-xs border border-[#E8E4DC] space-y-4 shadow-2xs">
            <div className="border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-[#736152] uppercase tracking-wider flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-[#736152]" />
                <span>행사 개요 & 주요 고객 경험</span>
              </h3>
              <span className="text-[11px] font-mono text-[#8C7A6B]">Verifiable Real Event Data</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#2C2C2C]">
              <div>
                <span className="font-mono text-[11px] text-[#8C7A6B] uppercase font-bold block mb-1">■ 행사 소개</span>
                <p className="leading-relaxed text-[#423C36] bg-[#FAF8F5] p-3 rounded-2xs border border-[#E8E4DC]">
                  {activation.whatIsIt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-[#FAF8F5] p-3 rounded-2xs border border-[#E8E4DC]">
                  <span className="font-mono text-[11px] text-[#8C7A6B] uppercase font-bold block mb-1">■ 주요 프로그램 / 고객 경험</span>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed">
                    {activation.experiencePoint}
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-3 rounded-2xs border border-[#E8E4DC]">
                  <span className="font-mono text-[11px] text-[#8C7A6B] uppercase font-bold block mb-1">■ 타깃 고객</span>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed">
                    {activation.targetCustomer}
                  </p>
                </div>
              </div>

              {/* Official Citation Source & Link */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-[#E8E4DC]">
                <div className="flex items-center space-x-2 text-[#736152] font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-[#1E5647]" />
                  <span>검증 출처: <strong>{source?.title || '공식 보도자료 및 웹사이트'}</strong> ({source?.refDate || '2026.08'})</span>
                </div>
                {source?.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#EFECE6] hover:bg-[#E8E4DC] text-[#2C2C2C] border border-[#D4C8B8] rounded-2xs text-[11px] font-mono transition-colors shrink-0"
                  >
                    <span>공식 웹사이트 바로가기</span>
                    <ExternalLink className="w-3 h-3 text-[#736152]" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 2: Dedicated OAK VALLEY / PARK ROCHE APPLICATION */}
          <section className="bg-[#EFECE6] border-2 border-[#8C7A6B] p-6 rounded-xs space-y-6 shadow-sm relative">
            
            {/* Header Badge & Disclaimer */}
            <div className="space-y-2 border-b border-[#D4C8B8] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E5647] animate-pulse" />
                  <h3 className="text-base sm:text-lg font-serif-display font-bold text-[#2C2C2C] tracking-tight">
                    OAK VALLEY / PARK ROCHE APPLICATION
                  </h3>
                </div>

                <span className="px-2.5 py-1 bg-[#2C2C2C] text-[#FAF8F5] text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#D4C8B8]" />
                  <span>AI Strategic Interpretation</span>
                </span>
              </div>

              <p className="text-xs text-[#5C4E43] font-light leading-relaxed">
                * 본 영역은 실제 확인된 행사 데이터를 기반으로 오크밸리 및 파크로쉬 리조트의 공간·고객·브랜드 자산과 연계 가능성을 분석한 <strong>AI 전략적 재해석(AI Strategic Interpretation)</strong> 보고서입니다.
              </p>
            </div>

            {/* Strategic Fit Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oak Valley Fit */}
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif-display font-bold text-[#2C2C2C]">Oak Valley 적용 가능성</span>
                  <span className="px-2 py-0.5 bg-[#E2ECE9] text-[#1E5647] font-mono text-[10px] font-bold rounded-2xs">
                    FIT: {oakValleyParkRocheInsight?.oakValleyFit || 'HIGH'}
                  </span>
                </div>
                <p className="text-xs text-[#423C36] leading-relaxed font-sans">
                  {oakValleyParkRocheInsight?.adaptationIdea}
                </p>
              </div>

              {/* Park Roche Fit */}
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif-display font-bold text-[#2C2C2C]">PARK ROCHE 적용 가능성</span>
                  <span className="px-2 py-0.5 bg-[#EBF2FA] text-[#225082] font-mono text-[10px] font-bold rounded-2xs">
                    FIT: {oakValleyParkRocheInsight?.parkRocheFit || 'HIGH'}
                  </span>
                </div>
                <p className="text-xs text-[#423C36] leading-relaxed font-sans">
                  {oakValleyParkRocheInsight?.adaptationIdea}
                </p>
              </div>
            </div>

            {/* Usable Assets Tags */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono text-[#736152] font-bold uppercase tracking-wider block">
                ■ 활용 가능한 자산 (Usable Assets)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(oakValleyParkRocheInsight?.applicableAssets || ['Golf', 'Forest', 'Stay', 'Wellness']).map((asset, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white text-[#2C2C2C] border border-[#D4C8B8] text-[11px] font-mono rounded-2xs"
                  >
                    ✓ {asset}
                  </span>
                ))}
              </div>
            </div>

            {/* Benchmarking Points & Quick Win / Signature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Quick Win */}
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[#1E5647]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase">Quick Win (단기 제안)</span>
                </div>
                <p className="text-xs text-[#2C2C2C] leading-relaxed pt-1">
                  {oakValleyParkRocheInsight?.quickWin}
                </p>
              </div>

              {/* Signature Idea */}
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[#8C5D28]">
                  <Award className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase">Signature Idea (시그니처 기획)</span>
                </div>
                <p className="text-xs text-[#2C2C2C] leading-relaxed pt-1">
                  {oakValleyParkRocheInsight?.signatureVersion}
                </p>
              </div>

              {/* Partnership Direction */}
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[#225082]">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase">추천 파트너십 방향</span>
                </div>
                <p className="text-xs text-[#2C2C2C] leading-relaxed pt-1">
                  {oakValleyParkRocheInsight?.potentialPartner || activation.brand}
                </p>
              </div>

            </div>

            {/* 3 Key Takeaways / Benchmarking Points */}
            {benchmark?.whatOakValleyCanLearn && benchmark.whatOakValleyCanLearn.length > 0 && (
              <div className="bg-white p-4 rounded-xs border border-[#D4C8B8] space-y-2">
                <span className="text-xs font-mono font-bold text-[#736152] uppercase block">
                  ■ 벤치마킹 핵심 시사점 (Benchmarking Points)
                </span>
                <ul className="space-y-1.5 text-xs text-[#423C36] list-disc list-inside leading-relaxed">
                  {benchmark.whatOakValleyCanLearn.map((item, idx) => (
                    <li key={idx} className="pl-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Partnership Proposal CTA Button */}
            {onCreatePartnershipProposal && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    onClose();
                    onCreatePartnershipProposal(activation.brand);
                  }}
                  className="px-5 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-[#FAF8F5] text-xs font-medium rounded-2xs transition-colors cursor-pointer inline-flex items-center space-x-2"
                >
                  <Building2 className="w-4 h-4 text-[#FAF8F5]" />
                  <span>{activation.brand} 제휴 제안서 작성하기 →</span>
                </button>
              </div>
            )}

          </section>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#EFECE6] px-6 py-3 border-t border-[#D4C8B8] flex items-center justify-between shrink-0 text-xs text-[#8C7A6B] font-mono">
          <div>
            Verified Event ID: {activation.id}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2C2C2C] hover:bg-[#423C36] text-[#FAF8F5] text-xs font-medium rounded-2xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
