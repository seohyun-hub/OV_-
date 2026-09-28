import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Database,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Server,
  ShieldCheck,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import {
  getBrandImages,
  setBrandHeroImage,
  setBrandLoginImage
} from '../utils/brandImageStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [cacheClearSuccess, setCacheClearSuccess] = useState<string | null>(null);
  const [heroImg, setHeroImg] = useState<string | null>(null);
  const [loginImg, setLoginImg] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const imgs = getBrandImages();
      setHeroImg(imgs.heroImage);
      setLoginImg(imgs.loginImage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB 이하이어야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandHeroImage(result);
      setHeroImg(result);
      setCacheClearSuccess('대시보드 히어로 이미지가 설정되었습니다.');
      setTimeout(() => setCacheClearSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB 이하이어야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBrandLoginImage(result);
      setLoginImg(result);
      setCacheClearSuccess('로그인 화면 이미지가 설정되었습니다.');
      setTimeout(() => setCacheClearSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveHero = () => {
    setBrandHeroImage(null);
    setHeroImg(null);
    setCacheClearSuccess('대시보드 히어로 이미지가 삭제되었습니다.');
    setTimeout(() => setCacheClearSuccess(null), 3000);
  };

  const handleRemoveLogin = () => {
    setBrandLoginImage(null);
    setLoginImg(null);
    setCacheClearSuccess('로그인 화면 이미지가 삭제되었습니다.');
    setTimeout(() => setCacheClearSuccess(null), 3000);
  };

  const handleClearTrendCache = () => {
    localStorage.removeItem('oakvalley_todays_signals_cache');
    setCacheClearSuccess('오늘의 시그널 및 트렌드 캐시가 초기화되었습니다.');
    setTimeout(() => setCacheClearSuccess(null), 3000);
  };

  const handleClearAllStorage = () => {
    if (confirm('모든 로컬 저장 데이터(브랜드 이미지, 바터 자산, 계산표, 캐시)를 초기화하시겠습니까?')) {
      localStorage.clear();
      setCacheClearSuccess('로컬 스토리지 데이터가 전체 초기화되었습니다.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2C2C]/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs shadow-xl max-w-lg w-full p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D4C8B8] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#736152] text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2C2C]">
                시스템 설정 및 캐시 관리
              </h3>
              <p className="text-xs text-[#8C7A6B] font-mono">
                Oak Valley Marketing Target Enterprise Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {cacheClearSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cacheClearSuccess}</span>
          </div>
        )}

        {/* Settings Body */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* 0. Brand Image Management */}
          <div className="p-3.5 bg-white border border-[#E8E4DC] rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2C2C2C]">
              <ImageIcon className="w-4 h-4 text-[#736152]" />
              <span>브랜드 이미지 관리</span>
            </div>
            <p className="text-xs text-[#786658] leading-relaxed">
              오크밸리 / 파크로쉬 실제 브랜드 이미지를 업로드하여 대시보드 히어로 및 로그인 화면 배경으로 등록할 수 있습니다. (이미지가 등록되지 않은 경우 고품격 기본 디자인이 유지됩니다)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Dashboard Hero Image */}
              <div className="p-3 border border-[#E5DDD3] bg-[#FAF8F5] rounded-lg space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#2C2C2C] block">
                    Dashboard Hero 이미지
                  </span>
                  {heroImg ? (
                    <div className="mt-2 relative w-full h-20 rounded-md overflow-hidden border border-[#D4C8B8]">
                      <img src={heroImg} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="mt-2 w-full h-20 rounded-md border border-dashed border-[#D4C8B8] bg-white flex flex-col items-center justify-center text-[#8C7A6B] text-[10px] space-y-1">
                      <ImageIcon className="w-5 h-5 opacity-40" />
                      <span>등록된 이미지 없음 (기본 배경 사용)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={heroInputRef}
                    accept="image/*"
                    onChange={handleHeroUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{heroImg ? '교체' : '업로드'}</span>
                  </button>
                  {heroImg && (
                    <button
                      type="button"
                      onClick={handleRemoveHero}
                      className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {/* Login Image */}
              <div className="p-3 border border-[#E5DDD3] bg-[#FAF8F5] rounded-lg space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#2C2C2C] block">
                    Login 화면 이미지
                  </span>
                  {loginImg ? (
                    <div className="mt-2 relative w-full h-20 rounded-md overflow-hidden border border-[#D4C8B8]">
                      <img src={loginImg} alt="Login Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="mt-2 w-full h-20 rounded-md border border-dashed border-[#D4C8B8] bg-white flex flex-col items-center justify-center text-[#8C7A6B] text-[10px] space-y-1">
                      <ImageIcon className="w-5 h-5 opacity-40" />
                      <span>등록된 이미지 없음 (기본 디자인 사용)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={loginInputRef}
                    accept="image/*"
                    onChange={handleLoginUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => loginInputRef.current?.click()}
                    className="flex-1 py-1.5 px-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-medium rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{loginImg ? '교체' : '업로드'}</span>
                  </button>
                  {loginImg && (
                    <button
                      type="button"
                      onClick={handleRemoveLogin}
                      className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 1. System Info */}
          <div className="p-3.5 bg-white border border-[#E8E4DC] rounded-xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2C2C2C]">
              <Server className="w-4 h-4 text-[#736152]" />
              <span>시스템 & 엔진 정보</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#786658] font-mono pt-1">
              <div>플랫폼 버전: <span className="font-bold text-[#2C2C2C]">v2026.08.21</span></div>
              <div>연동 상태: <span className="text-emerald-700 font-bold">정상 가동</span></div>
              <div>리조트 자산: <span className="text-[#2C2C2C]">Oak Valley & PARK ROCHE</span></div>
              <div>검증 엔진: <span className="text-[#2C2C2C]">실시간 사실 검증 분석</span></div>
            </div>
          </div>

          {/* 2. Cache Management */}
          <div className="p-3.5 bg-white border border-[#E8E4DC] rounded-xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#2C2C2C]">
              <Database className="w-4 h-4 text-[#736152]" />
              <span>로컬 캐시 및 데이터 관리</span>
            </div>
            <p className="text-xs text-[#786658] leading-relaxed">
              빠른 응답 속도를 위해 브라우저에 저장된 시그널 및 분석 캐시를 관리하거나 최신 데이터로 새로고침합니다.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearTrendCache}
                className="px-3 py-2 bg-[#EFECE6] hover:bg-[#D4C8B8] text-[#2C2C2C] text-xs font-medium rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#736152]" />
                <span>트렌드 시그널 캐시 초기화</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllStorage}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>전체 스토리지 초기화</span>
              </button>
            </div>
          </div>

          {/* 3. Guidelines & Support */}
          <div className="p-3.5 bg-[#EFECE6]/50 border border-[#D4C8B8] rounded-xs text-xs text-[#786658] space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold text-[#2C2C2C]">
              <ShieldCheck className="w-4 h-4 text-[#736152]" />
              <span>보안 및 데이터 정책</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              본 시스템에서 처리되는 모든 제휴 단가, 바터 산정 기준, 기회비용 및 기업 분석 자료는 IPARK리조트 마케팅 기획 전용 정보로 보호됩니다.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#D4C8B8]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-medium rounded-xs transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
