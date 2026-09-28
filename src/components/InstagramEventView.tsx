import React, { useState, useEffect } from 'react';
import {
  Instagram,
  AlertCircle,
  Link2,
  Calendar,
  MessageSquare,
  Users,
  Award,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Info,
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import { AuthUser } from '../types';

interface InstagramEventViewProps {
  currentUser?: AuthUser | null;
}

export const InstagramEventView: React.FC<InstagramEventViewProps> = ({ currentUser }) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTED' | 'LOADING'>('DISCONNECTED');
  const [apiInfo, setApiInfo] = useState<any>(null);

  // Safely check server connection status without breaking if API fails
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/instagram/status');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setApiInfo(data);
            if (data.isConnected) {
              setConnectionStatus('CONNECTED');
            } else {
              setConnectionStatus('DISCONNECTED');
            }
          }
        } else {
          if (isMounted) setConnectionStatus('DISCONNECTED');
        }
      } catch (err) {
        // Fallback safely to DISCONNECTED state, never crash or hide the screen
        if (isMounted) setConnectionStatus('DISCONNECTED');
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const flowSteps = [
    {
      step: 1,
      title: '이벤트 만들기',
      desc: '게시물 URL 및 응모 조건(댓글, 친구 태그, 키워드) 설정',
      icon: Calendar,
      statusLabel: '계정 연결 후 이용 가능'
    },
    {
      step: 2,
      title: '댓글 불러오기',
      desc: 'Meta Graph API를 통해 실시간 댓글 및 태그 정보 수집',
      icon: MessageSquare,
      statusLabel: '계정 연결 후 이용 가능'
    },
    {
      step: 3,
      title: '참여자 관리',
      desc: 'ID별 중복 제거, 조건 충족 여부 및 응모권 자동 집계',
      icon: Users,
      statusLabel: '계정 연결 후 이용 가능'
    },
    {
      step: 4,
      title: '당첨자 추첨',
      desc: '공정 난수 알고리즘 기반 무작위 추첨 및 회차별 기록',
      icon: Award,
      statusLabel: '계정 연결 후 이용 가능'
    },
    {
      step: 5,
      title: 'Excel 다운로드',
      desc: '전체 댓글, 참여자 집계, 당첨자 명단 원클릭 보고서 출력',
      icon: FileSpreadsheet,
      statusLabel: '계정 연결 후 이용 가능'
    }
  ];

  return (
    <div id="instagram-event-view" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DC] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-xs">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] tracking-tight">
                Instagram 이벤트
              </h1>
              <p className="text-xs sm:text-sm text-[#736152] mt-0.5">
                Instagram 이벤트 댓글을 불러와 참여자를 정리하고 추첨할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Top Status Pill */}
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F2EC] text-[#736152] border border-[#E0D9CE]">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            계정 연결 대기 중
          </span>
        </div>
      </div>

      {/* 2. Connection Status Card */}
      <div
        id="instagram-connection-card"
        className="bg-white rounded-lg border border-[#E0D9CE] p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>연결 상태: 미연결</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#2C2C2C]">
              Instagram 계정 연결이 필요합니다
            </h2>
            <p className="text-sm text-[#5C4E43] leading-relaxed">
              회사 또는 테스트용 Instagram 계정을 연결하면 게시물의 댓글을 불러올 수 있습니다.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="btn-instagram-connect"
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-md bg-[#736152] hover:bg-[#5C4E43] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4" />
              <span>Instagram 계정 연결</span>
            </button>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none hidden sm:block">
          <Instagram className="w-48 h-48 text-[#736152]" />
        </div>
      </div>

      {/* 3. Inactive Workflow Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#4A3E35] tracking-wide uppercase">
            이벤트 운영 프로세스
          </h3>
          <span className="text-xs text-[#8C7A6B]">계정 연결 완료 시 전체 프로세스가 활성화됩니다</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {flowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg p-4 flex flex-col justify-between opacity-70 transition-opacity hover:opacity-90"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#EBE7DF] text-[#736152] text-xs font-bold font-mono flex items-center justify-center">
                      0{step.step}
                    </span>
                    <Icon className="w-4 h-4 text-[#8C7A6B]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2C2C2C] mb-1">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#736152] leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8E4DC]">
                  <span className="inline-flex items-center text-[11px] font-medium text-[#8C7A6B] bg-[#EFECE6] px-2 py-0.5 rounded-sm">
                    {step.statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Meta Graph API Diagnostic Guidelines */}
      <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-lg p-5 text-xs text-[#5C4E43] space-y-3">
        <div className="flex items-center space-x-2 font-semibold text-[#2C2C2C]">
          <Info className="w-4 h-4 text-[#736152]" />
          <span>Meta Graph API 연결 가이드 및 데이터 기준 안내</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[#736152] leading-relaxed">
          <li>
            <strong>실데이터 전용 원칙:</strong> 가짜 mock 댓글을 생성하지 않으며, 공인 Meta Graph API(v19.0+)를 통해서만 실제 댓글을 안전하게 수집합니다.
          </li>
          <li>
            <strong>API 검증 한계 안내:</strong> 댓글 본문, 작성자 ID, 친구 태그 수 등은 API로 검증 가능하지만, 비즈니스 계정 권한 정책상 팔로우 여부나 개인 프로필 세부 사항은 &apos;확인 필요&apos; 상태로 관리됩니다.
          </li>
          <li>
            <strong>공정한 추첨:</strong> 모든 추첨은 클라이언트/서버 난수 알고리즘을 사용하여 투명하고 편향 없는 결과를 보장합니다.
          </li>
        </ul>
      </div>

      {/* Connection Procedure Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-[#E0D9CE] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <div className="flex items-center space-x-2">
                <Instagram className="w-5 h-5 text-[#DD2A7B]" />
                <h3 className="text-base font-bold text-[#2C2C2C]">Instagram 계정 연결 안내</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5C4E43] leading-relaxed">
              <p>
                실제 Instagram 게시물 댓글 수집을 위해 Meta for Developers 앱 등록 및 Instagram Professional 계정 연동이 필요합니다.
              </p>

              <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-md p-3.5 space-y-2">
                <div className="font-semibold text-[#2C2C2C] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>필요 설정 절차</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[#736152]">
                  <li>Meta for Developers(<span className="font-mono text-[#2C2C2C]">developers.facebook.com</span>)에서 앱 생성</li>
                  <li>Instagram Graph API 제품 추가 및 비즈니스 계정 연결</li>
                  <li>필수 권한 승인: <span className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">instagram_basic</span>, <span className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">instagram_manage_comments</span></li>
                  <li>서버 환경변수에 <span className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">INSTAGRAM_ACCESS_TOKEN</span> 및 <span className="font-mono bg-white px-1 py-0.5 rounded border text-[10px]">INSTAGRAM_BUSINESS_ACCOUNT_ID</span> 등록</li>
                </ol>
              </div>

              <div className="text-[11px] text-[#8C7A6B]">
                * 보안 정책에 따라 Access Token과 App Secret은 절대 프론트엔드 코드나 브라우저 화면에 노출되지 않으며 서버 측 환경변수로만 안전하게 취급됩니다.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#EFECE6]">
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 rounded-md bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
