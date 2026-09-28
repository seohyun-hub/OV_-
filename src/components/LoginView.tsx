import React, { useState, useEffect } from 'react';
import { Shield, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';
import { AuthUser } from '../types';
import { getBrandImages, BRAND_IMAGE_EVENT } from '../utils/brandImageStore';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasAdmin, setHasAdmin] = useState<boolean>(true);
  const [loginImage, setLoginImage] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Initial admin setup extra fields
  const [name, setName] = useState('');
  const [team, setTeam] = useState('Revenue');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    loadBrandImage();

    const handleUpdate = () => loadBrandImage();
    window.addEventListener(BRAND_IMAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(BRAND_IMAGE_EVENT, handleUpdate);
  }, []);

  const loadBrandImage = () => {
    const imgs = getBrandImages();
    setLoginImage(imgs.loginImage);
  };

  const checkAuthStatus = async () => {
    try {
      setCheckingStatus(true);
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.success) {
        setHasAdmin(data.hasAdmin);
      }
    } catch (err) {
      console.error('Failed to check auth status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('아이디 또는 비밀번호를 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMessage(data.error || '아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (err) {
      setErrorMessage('아이디 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || !username.trim() || !team.trim() || !password.trim()) {
      setErrorMessage('모든 항목(이름, 아이디, 팀, 비밀번호)을 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup-initial-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          team: team.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        setSuccessMessage(data.message || '관리자 계정이 등록되었습니다.');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 800);
      } else {
        setErrorMessage(data.error || '관리자 계정 생성에 실패했습니다.');
      }
    } catch (err) {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#736152] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#8C7A6B] font-mono">시스템 보안 인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-[#736152] selection:text-white">
      {/* Top Header / Branding */}
      <div className="w-full max-w-4xl pt-4 sm:pt-6 text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#F5F2EB] border border-[#E8E4DC] rounded-full text-xs font-mono text-[#736152]">
          <Shield className="w-3.5 h-3.5 text-[#736152]" />
          <span>IPARK리조트 · OAK VALLEY MARKETING LAB</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2C2C2C] font-serif">
          IPARK리조트
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#736152] uppercase tracking-wider">
          OAK VALLEY MARKETING LAB
        </p>
      </div>

      {/* Main Container: Split or Card depending on loginImage presence */}
      <div className="w-full max-w-4xl my-auto py-6">
        <div className="bg-white border border-[#E8E4DC] rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left / Top Banner Side (Brand Image or Custom Warm Ivory Card) */}
          <div className="md:col-span-5 bg-[#2C2C2C] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[180px] md:min-h-[420px]">
            {loginImage ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={loginImage}
                  alt="IPARK Resort Brand"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-[#2C2C2C]/50 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#3D332B] via-[#2C2C2C] to-[#1A1A1A]">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#736152]/30 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#8C7A6B]/20 rounded-full blur-2xl pointer-events-none" />
              </div>
            )}

            <div className="relative z-10 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4C8B8]">
                Professional Resort Marketing
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                오크밸리 / 파크로쉬<br />마케팅 실무 포털
              </h2>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 hidden md:block space-y-1">
              <p className="text-[11px] text-[#D4C8B8] leading-relaxed">
                시장 트렌드, 파트너십 발굴, 제휴 조건 산정 및 분석 리포트 생성을 지원하는 통합 업무 시스템입니다.
              </p>
              <div className="text-[10px] text-[#A09385] font-mono pt-1">
                IPARK RESORT ENTERPRISE
              </div>
            </div>
          </div>

          {/* Right / Main Login Form Side */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6 bg-white">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#2C2C2C]">
                {hasAdmin ? '사내 사용자 로그인' : '최초 시스템 관리자 등록'}
              </h3>
              <p className="text-xs text-[#736152]">
                {hasAdmin
                  ? '인증된 계정 정보로 로그인해 주세요.'
                  : '시스템을 총괄할 최초 관리자 계정을 생성합니다.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2.5 text-xs text-rose-800 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2.5 text-xs text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {hasAdmin ? (
              /* STANDARD LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* ID Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    아이디
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="사내 아이디 입력"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152] transition-colors"
                    />
                  </div>
                </div>

                {/* Password / PIN Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    비밀번호
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호 또는 4자리 PIN 입력"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152] transition-colors"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>로그인 처리 중...</span>
                    </>
                  ) : (
                    <>
                      <span>로그인</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* INITIAL ADMIN SETUP FORM */
              <form onSubmit={handleInitialAdminSubmit} className="space-y-4">
                <div className="p-3 bg-[#F5F2EB] border border-[#E8E4DC] rounded-lg text-xs text-[#736152] space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-[#2C2C2C]">
                    <KeyRound className="w-3.5 h-3.5 text-[#736152]" />
                    <span>최초 시스템 설정</span>
                  </div>
                  <p className="text-[11px] text-[#8C7A6B]">
                    등록된 관리자 계정이 없습니다. 최초 1회 시스템 전체 사용자를 관리할 관리자 계정을 생성해 주세요.
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    관리자 이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 박서현"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152]"
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    관리자 아이디 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="예: admin 또는 seohyun"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152]"
                  />
                </div>

                {/* Team Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    부서 / 팀 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="예: Revenue, Marketing, 경영기획"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152]"
                  />
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2C2C2C]">
                    비밀번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 또는 4자리 이상 PIN"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] placeholder-[#A09385] focus:outline-none focus:ring-2 focus:ring-[#736152]/30 focus:border-[#736152]"
                  />
                  <p className="text-[10px] text-[#8C7A6B]">
                    * 단순 연속번호(예: 1234, 0000)는 제한됩니다.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? '관리자 생성 중...' : '최초 관리자 등록 & 시스템 시작'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="w-full max-w-md pt-4 text-center">
        <p className="text-[11px] text-[#8C7A6B] font-medium">
          승인된 사내 사용자만 이용할 수 있습니다.
        </p>
      </div>
    </div>
  );
};
