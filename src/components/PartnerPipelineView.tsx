import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Send,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Archive,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  History,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
  Users,
  Check,
  HelpCircle,
  LayoutGrid,
  List as ListIcon,
  AlertTriangle,
} from 'lucide-react';
import {
  PartnerDealItem,
  PartnerDealStage,
  WeeklyReportData,
  WeeklyReportRecipient,
  WeeklyPipelineAggregation,
  EmailServerStatus,
  AuthUser,
  OFFICIAL_MANAGERS,
  ActiveTab,
} from '../types';

interface PartnerPipelineViewProps {
  currentUser?: AuthUser | null;
  onNavigateTab?: (tab: ActiveTab) => void;
}

// Stage Normalization Helper
export function normalizeDealStage(stage: string, deal?: Partial<PartnerDealItem>): PartnerDealStage {
  if (!stage) return '신규 컨택';
  const trimmed = stage.trim();
  if (
    trimmed === '신규 컨택' ||
    trimmed === '제안 발송' ||
    trimmed === '미팅 예정' ||
    trimmed === '미팅 완료' ||
    trimmed === '결과 대기' ||
    trimmed === '조건 조율' ||
    trimmed === '진행 확정' ||
    trimmed === '보류' ||
    trimmed === '종료'
  ) {
    return trimmed as PartnerDealStage;
  }
  if (trimmed === '컨택중') return '신규 컨택';
  if (trimmed === '제안') return '제안 발송';
  if (trimmed === '결과' || trimmed === '결과대기') return '결과 대기';
  if (trimmed === '진행확정') return '진행 확정';
  if (trimmed === '미팅') {
    if (deal?.nextActionDate) {
      const today = new Date().toISOString().split('T')[0];
      if (deal.nextActionDate >= today || deal.nextAction?.includes('예정')) {
        return '미팅 예정';
      }
    }
    return '미팅 완료';
  }
  return '신규 컨택';
}

// Result Waiting Candidate Detection (Badge logic)
export function isResultWaitingCandidate(deal: PartnerDealItem): boolean {
  if (deal.stage === '진행 확정' || deal.stage === '보류' || deal.stage === '종료' || deal.stage === '결과 대기') {
    return false;
  }
  const now = new Date();
  const lastUpdate = deal.lastUpdatedDate ? new Date(deal.lastUpdatedDate) : new Date(deal.createdAt || Date.now());
  const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  if (deal.stage === '미팅 완료') return true;
  if (deal.stage === '제안 발송' && diffDays >= 5) return true;
  if (deal.nextAction && deal.nextAction.trim() !== '') {
    if (deal.nextActionDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (deal.nextActionDate <= todayStr) return true;
    }
  }
  return false;
}

// Follow-up & Delay Detection Helper
export function getFollowupStatus(deal: PartnerDealItem): {
  status: '정상 진행' | '후속 필요' | '지연';
  bg: string;
  text: string;
  border: string;
  reason: string;
} {
  if (deal.stage === '진행 확정' || deal.stage === '종료') {
    return {
      status: '정상 진행',
      bg: 'bg-[#F0F7F2]',
      text: 'text-[#1E6B24]',
      border: 'border-[#D1E7D5]',
      reason: '협약 확정/종료',
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const lastUpdate = deal.lastUpdatedDate ? new Date(deal.lastUpdatedDate) : new Date(deal.createdAt || Date.now());
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  const isPastActionDate = Boolean(deal.nextActionDate && deal.nextActionDate < todayStr);
  const hasNoNextAction = !deal.nextAction || deal.nextAction.trim() === '';

  if (daysSinceUpdate >= 10 || (isPastActionDate && daysSinceUpdate >= 7)) {
    return {
      status: '지연',
      bg: 'bg-[#FADBD8]',
      text: 'text-[#78281F]',
      border: 'border-[#F5B7B1]',
      reason: isPastActionDate ? '예정일 초과 지연' : `업데이트 ${daysSinceUpdate}일 경과`,
    };
  }

  if (hasNoNextAction || daysSinceUpdate >= 7 || isPastActionDate || isResultWaitingCandidate(deal)) {
    return {
      status: '후속 필요',
      bg: 'bg-[#FCF3CF]',
      text: 'text-[#7D6608]',
      border: 'border-[#F9E79F]',
      reason: hasNoNextAction
        ? '다음 액션 미지정'
        : isPastActionDate
        ? '예정일 도달/확인'
        : `후속 필요 (${daysSinceUpdate}일)`,
    };
  }

  return {
    status: '정상 진행',
    bg: 'bg-[#E8F8F5]',
    text: 'text-[#117864]',
    border: 'border-[#A3E4D7]',
    reason: '일정 준수 진행 중',
  };
}

const STAGE_CONFIG: Record<
  PartnerDealStage,
  { label: string; bg: string; text: string; border: string; badgeBg: string }
> = {
  '신규 컨택': {
    label: '신규 컨택',
    bg: 'bg-[#F9F7F4]',
    text: 'text-[#6B5A4D]',
    border: 'border-[#E6DFD5]',
    badgeBg: 'bg-[#EAE4D9]',
  },
  '제안 발송': {
    label: '제안 발송',
    bg: 'bg-[#FAF5F8]',
    text: 'text-[#6C3483]',
    border: 'border-[#EBDCF0]',
    badgeBg: 'bg-[#F2E4F7]',
  },
  '미팅 예정': {
    label: '미팅 예정',
    bg: 'bg-[#F3F7FA]',
    text: 'text-[#1B4F72]',
    border: 'border-[#D4E6F1]',
    badgeBg: 'bg-[#E1EFF8]',
  },
  '미팅 완료': {
    label: '미팅 완료',
    bg: 'bg-[#EBF5FB]',
    text: 'text-[#21618C]',
    border: 'border-[#AED6F1]',
    badgeBg: 'bg-[#D4E6F1]',
  },
  '결과 대기': {
    label: '결과 대기',
    bg: 'bg-[#FEF9E7]',
    text: 'text-[#7D6608]',
    border: 'border-[#FCF3CF]',
    badgeBg: 'bg-[#F9E79F]',
  },
  '조건 조율': {
    label: '조건 조율',
    bg: 'bg-[#FEF5E7]',
    text: 'text-[#7E5109]',
    border: 'border-[#FDEBD0]',
    badgeBg: 'bg-[#FADBD8]',
  },
  '진행 확정': {
    label: '진행 확정',
    bg: 'bg-[#F0F7F2]',
    text: 'text-[#1E6B24]',
    border: 'border-[#D1E7D5]',
    badgeBg: 'bg-[#D4EFDF]',
  },
  '보류': {
    label: '보류',
    bg: 'bg-[#F6F6F6]',
    text: 'text-[#707B7C]',
    border: 'border-[#E5E7E9]',
    badgeBg: 'bg-[#EAEDED]',
  },
  '종료': {
    label: '종료',
    bg: 'bg-[#F8F9F9]',
    text: 'text-[#99A3A4]',
    border: 'border-[#E5E8E8]',
    badgeBg: 'bg-[#E5E8E8]',
  },

  // Legacy mappings
  '컨택중': {
    label: '신규 컨택',
    bg: 'bg-[#F9F7F4]',
    text: 'text-[#6B5A4D]',
    border: 'border-[#E6DFD5]',
    badgeBg: 'bg-[#EAE4D9]',
  },
  '제안': {
    label: '제안 발송',
    bg: 'bg-[#FAF5F8]',
    text: 'text-[#6C3483]',
    border: 'border-[#EBDCF0]',
    badgeBg: 'bg-[#F2E4F7]',
  },
  '미팅': {
    label: '미팅 진행/예정',
    bg: 'bg-[#F3F7FA]',
    text: 'text-[#1B4F72]',
    border: 'border-[#D4E6F1]',
    badgeBg: 'bg-[#E1EFF8]',
  },
  '결과': {
    label: '결과 대기',
    bg: 'bg-[#FEF9E7]',
    text: 'text-[#7D6608]',
    border: 'border-[#FCF3CF]',
    badgeBg: 'bg-[#F9E79F]',
  },
  '결과대기': {
    label: '결과 대기',
    bg: 'bg-[#FEF9E7]',
    text: 'text-[#7D6608]',
    border: 'border-[#FCF3CF]',
    badgeBg: 'bg-[#F9E79F]',
  },
  '진행확정': {
    label: '진행 확정',
    bg: 'bg-[#F0F7F2]',
    text: 'text-[#1E6B24]',
    border: 'border-[#D1E7D5]',
    badgeBg: 'bg-[#D4EFDF]',
  },
};

const ALL_STAGES: PartnerDealStage[] = [
  '신규 컨택',
  '제안 발송',
  '미팅 예정',
  '미팅 완료',
  '결과 대기',
  '조건 조율',
  '진행 확정',
  '보류',
  '종료',
];

export const PartnerPipelineView: React.FC<PartnerPipelineViewProps> = ({ currentUser, onNavigateTab }) => {
  // Main Data States
  const [deals, setDeals] = useState<PartnerDealItem[]>([]);
  const [aggregation, setAggregation] = useState<WeeklyPipelineAggregation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('ALL');

  // Modals & Panels
  const [isDealModalOpen, setIsDealModalOpen] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<PartnerDealItem | null>(null);
  const [selectedDealForDetail, setSelectedDealForDetail] = useState<PartnerDealItem | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState<boolean>(false);
  const [isArchivesModalOpen, setIsArchivesModalOpen] = useState<boolean>(false);

  // Weekly Report Preview & Dispatch
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isDispatchingEmail, setIsDispatchingEmail] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{ success: boolean; message: string } | null>(null);

  // Recipients
  const [recipients, setRecipients] = useState<WeeklyReportRecipient[]>([]);
  const [newRecipientName, setNewRecipientName] = useState<string>('');
  const [newRecipientEmail, setNewRecipientEmail] = useState<string>('');
  const [newRecipientDept, setNewRecipientDept] = useState<string>('마케팅제휴팀');
  const [emailServerStatus, setEmailServerStatus] = useState<EmailServerStatus | null>(null);

  // Archives
  const [archives, setArchives] = useState<WeeklyReportData[]>([]);

  // Deal Form State
  const [formState, setFormState] = useState<Partial<PartnerDealItem>>({
    companyName: '',
    brandName: '',
    projectName: '',
    industry: '스포츠·애슬레저',
    externalContactPerson: '',
    externalContactInfo: '',
    internalAssignee: currentUser?.name || '김민우',
    stage: '신규 컨택',
    firstContactDate: new Date().toISOString().split('T')[0],
    latestProgress: '',
    nextAction: '',
    nextActionDate: '',
    nextActionTime: '14:00',
    location: '오크밸리',
    expectedCollaboration: '',
    notes: '',
  });

  // Fetch Deals & Aggregation
  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/partner-pipeline/deals');
      const data = await res.json();
      if (data.success) {
        const rawDeals: PartnerDealItem[] = data.deals || [];
        const normalizedDeals = rawDeals.map((d) => ({
          ...d,
          stage: normalizeDealStage(d.stage, d),
        }));
        setDeals(normalizedDeals);
        setAggregation(data.aggregation || null);
        window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
      }
    } catch (err) {
      console.error('Failed to fetch partner deals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Recipients
  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/partner-pipeline/recipients');
      const data = await res.json();
      if (data.success) {
        setRecipients(data.recipients || []);
      }
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    }
  };

  // Fetch Email Server Status
  const fetchEmailStatus = async () => {
    try {
      const res = await fetch('/api/partner-pipeline/email-status');
      const data = await res.json();
      if (data.success) {
        setEmailServerStatus(data.emailStatus || null);
      }
    } catch (err) {
      console.error('Failed to fetch email status:', err);
    }
  };

  // Fetch Archives
  const fetchArchives = async () => {
    try {
      const res = await fetch('/api/partner-pipeline/report/archives');
      const data = await res.json();
      if (data.success) {
        setArchives(data.archives || []);
      }
    } catch (err) {
      console.error('Failed to fetch archives:', err);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchRecipients();
    fetchEmailStatus();
  }, []);

  // Open Form Modal for New Deal
  const handleOpenNewDealModal = () => {
    setEditingDeal(null);
    setFormState({
      companyName: '',
      brandName: '',
      projectName: '',
      industry: '스포츠·애슬레저',
      externalContactPerson: '',
      externalContactInfo: '',
      internalAssignee: currentUser?.name || '김민우',
      stage: '신규 컨택',
      firstContactDate: new Date().toISOString().split('T')[0],
      latestProgress: '',
      nextAction: '',
      nextActionDate: '',
      nextActionTime: '14:00',
      location: '오크밸리',
      expectedCollaboration: '',
      notes: '',
    });
    setIsDealModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditDealModal = (deal: PartnerDealItem) => {
    setEditingDeal(deal);
    setFormState({
      companyName: deal.companyName,
      brandName: deal.brandName,
      projectName: deal.projectName || '',
      industry: deal.industry,
      externalContactPerson: deal.externalContactPerson,
      externalContactInfo: deal.externalContactInfo,
      internalAssignee: deal.internalAssignee,
      stage: deal.stage,
      firstContactDate: deal.firstContactDate,
      latestProgress: deal.latestProgress,
      nextAction: deal.nextAction,
      nextActionDate: deal.nextActionDate,
      nextActionTime: deal.nextActionTime || '14:00',
      location: deal.location || '오크밸리',
      expectedCollaboration: deal.expectedCollaboration,
      notes: deal.notes,
    });
    setIsDealModalOpen(true);
  };

  // Submit Deal Form (Create / Update)
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.companyName || formState.companyName.trim() === '') {
      alert('업체명을 입력해주세요.');
      return;
    }

    try {
      if (editingDeal) {
        // Update
        const res = await fetch(`/api/partner-pipeline/deals/${editingDeal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formState,
            updatedBy: currentUser?.name || '사용자',
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsDealModalOpen(false);
          fetchDeals();
        } else {
          alert(data.error || '수정 중 오류가 발생했습니다.');
        }
      } else {
        // Create
        const res = await fetch('/api/partner-pipeline/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formState,
            createdBy: currentUser?.name || '사용자',
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsDealModalOpen(false);
          fetchDeals();
        } else {
          alert(data.error || '등록 중 오류가 발생했습니다.');
        }
      }
    } catch (err) {
      console.error('Error saving deal:', err);
      alert('저장 중 네트워크 오류가 발생했습니다.');
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (id: string, name: string) => {
    if (!confirm(`'${name}' 제휴 건을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/partner-pipeline/deals/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (selectedDealForDetail?.id === id) {
          setSelectedDealForDetail(null);
        }
        fetchDeals();
      }
    } catch (err) {
      console.error('Failed to delete deal:', err);
    }
  };

  // Quick Stage Change (Drag or Dropdown)
  const handleQuickStageChange = async (deal: PartnerDealItem, newStage: PartnerDealStage) => {
    if (deal.stage === newStage) return;
    try {
      const res = await fetch(`/api/partner-pipeline/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: newStage,
          updatedBy: currentUser?.name || '사용자',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDeals();
      }
    } catch (err) {
      console.error('Failed to change stage:', err);
    }
  };

  // Generate & Preview Weekly Report
  const handleOpenWeeklyReport = async () => {
    setIsReportModalOpen(true);
    setIsGeneratingReport(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/partner-pipeline/report/preview');
      const data = await res.json();
      if (data.success) {
        setWeeklyReport(data.report);
        setEmailServerStatus(data.emailStatus);
      }
    } catch (err) {
      console.error('Failed to generate weekly report preview:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Trigger Instant Email Dispatch
  const handleDispatchEmailNow = async () => {
    if (!weeklyReport) return;
    setIsDispatchingEmail(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/partner-pipeline/report/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: weeklyReport }),
      });
      const data = await res.json();
      setDispatchResult({
        success: data.success,
        message: data.message,
      });
      if (data.report) {
        setWeeklyReport(data.report);
      }
      fetchArchives();
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: err?.message || '발송 요청 중 네트워크 오류가 발생했습니다.',
      });
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  // Add Recipient
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientName.trim() || !newRecipientEmail.trim()) {
      alert('이름과 이메일을 모두 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('/api/partner-pipeline/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRecipientName.trim(),
          email: newRecipientEmail.trim(),
          department: newRecipientDept.trim(),
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewRecipientName('');
        setNewRecipientEmail('');
        fetchRecipients();
      }
    } catch (err) {
      console.error('Failed to add recipient:', err);
    }
  };

  // Toggle Recipient Active
  const handleToggleRecipient = async (recipient: WeeklyReportRecipient) => {
    try {
      const res = await fetch(`/api/partner-pipeline/recipients/${recipient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !recipient.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRecipients();
      }
    } catch (err) {
      console.error('Failed to toggle recipient:', err);
    }
  };

  // Delete Recipient
  const handleDeleteRecipient = async (id: string) => {
    if (!confirm('해당 수신자를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/partner-pipeline/recipients/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchRecipients();
      }
    } catch (err) {
      console.error('Failed to delete recipient:', err);
    }
  };

  // Filtered Deals
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      deal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.internalAssignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.latestProgress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.nextAction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStageFilter === 'ALL' || deal.stage === selectedStageFilter;
    const matchesAssignee =
      selectedAssigneeFilter === 'ALL' || deal.internalAssignee === selectedAssigneeFilter;

    return matchesSearch && matchesStage && matchesAssignee;
  });

  // Assignee list for filter dropdown
  const allAssignees = Array.from(new Set([...OFFICIAL_MANAGERS, ...deals.map((d) => d.internalAssignee).filter(Boolean)]));

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* 1. HEADER BANNER */}
      <div className="bg-white border border-[#E8E4DC] rounded-sm p-5 md:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#736152] tracking-wider uppercase bg-[#F5F2EB] px-2 py-0.5 rounded-2xs border border-[#E8E4DC]">
                PARTNER WORKFLOW MANAGEMENT
              </span>
              <span className="text-xs text-[#8C7A6B] font-mono">
                {emailServerStatus?.cronSchedule || '매주 금요일 18:00 자동 리포트'}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2C2C2C] tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-[#736152]" />
              제휴 진행관리
            </h1>
            <p className="text-xs md:text-sm text-[#736152] max-w-3xl leading-relaxed">
              이번 주 어떤 업체와 연락했고 어디까지 진행됐으며 다음 액션이 무엇인지 실시간으로 관리하는 내부 업무 보드입니다.
              기록된 진행 데이터와 외부 시장 트렌드를 결합하여 주간 리포트를 자동 생성·발송합니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                fetchArchives();
                setIsArchivesModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold cursor-pointer transition-colors"
            >
              <Archive className="w-3.5 h-3.5 text-[#736152]" />
              <span>리포트 보관함</span>
            </button>

            <button
              onClick={() => setIsRecipientModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold cursor-pointer transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#736152]" />
              <span>수신자 관리 ({recipients.filter((r) => r.isActive).length})</span>
            </button>

            <button
              onClick={handleOpenWeeklyReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#FAF5F0] text-[#736152] hover:bg-[#F2ECE4] border border-[#D4C8B8] rounded-xs text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-[#736152]" />
              <span>주간 리포트 생성 · 발송</span>
            </button>

            <button
              onClick={handleOpenNewDealModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>신규 제휴 등록</span>
            </button>
          </div>
        </div>

        {/* 2. REAL-TIME STATS ROW (STRICTLY FROM SAVED DEALS) */}
        {(() => {
          const totalCount = deals.length;
          const newContactCount = deals.filter((d) => d.stage === '신규 컨택').length;
          const proposalCount = deals.filter((d) => d.stage === '제안 발송').length;
          const meetingUpcomingCount = deals.filter((d) => d.stage === '미팅 예정').length;
          const meetingCompletedCount = deals.filter((d) => d.stage === '미팅 완료').length;
          const awaitingResultCount = deals.filter((d) => d.stage === '결과 대기').length;
          const negotiationCount = deals.filter((d) => d.stage === '조건 조율').length;
          const confirmedCount = deals.filter((d) => d.stage === '진행 확정').length;
          const holdCount = deals.filter((d) => d.stage === '보류').length;
          const closedCount = deals.filter((d) => d.stage === '종료').length;

          const resultWaitingCandidates = deals.filter(isResultWaitingCandidate);
          const followupNeededDeals = deals.filter((d) => getFollowupStatus(d).status !== '정상 진행');
          const noResponse7DaysDeals = deals.filter((d) => {
            const days = Math.floor((Date.now() - new Date(d.lastUpdatedDate || d.createdAt).getTime()) / 86400000);
            return days >= 7 && (d.stage === '신규 컨택' || d.stage === '제안 발송' || d.stage === '미팅 완료');
          });

          return (
            <>
              {/* Top KPI Cards (6 columns) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-[#E8E4DC]">
                <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC]">
                  <div className="text-[11px] text-[#8C7A6B] font-medium">전체 관리 제휴</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#2C2C2C]">{totalCount}</span>
                    <span className="text-[10px] text-[#736152] font-mono">건</span>
                  </div>
                </div>

                <div className="bg-[#F9F7F4] p-3 rounded-xs border border-[#E6DFD5]">
                  <div className="text-[11px] text-[#6B5A4D] font-medium">신규 컨택 / 제안</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#6B5A4D]">{newContactCount + proposalCount}</span>
                    <span className="text-[10px] text-[#6B5A4D] font-mono">건 ({newContactCount}/{proposalCount})</span>
                  </div>
                </div>

                <div className="bg-[#F3F7FA] p-3 rounded-xs border border-[#D4E6F1]">
                  <div className="text-[11px] text-[#1B4F72] font-medium">미팅 예정 / 완료</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#1B4F72]">{meetingUpcomingCount + meetingCompletedCount}</span>
                    <span className="text-[10px] text-[#1B4F72] font-mono">건 ({meetingUpcomingCount}/{meetingCompletedCount})</span>
                  </div>
                </div>

                <div className="bg-[#FEF9E7] p-3 rounded-xs border border-[#FCF3CF]">
                  <div className="text-[11px] text-[#7D6608] font-medium flex items-center space-x-1">
                    <span>결과 대기</span>
                    {resultWaitingCandidates.length > 0 && (
                      <span className="text-[9px] bg-[#F9E79F] px-1 py-0.2 rounded-2xs text-[#7D6608]">
                        후보 {resultWaitingCandidates.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#7D6608]">{awaitingResultCount}</span>
                    <span className="text-[10px] text-[#7D6608] font-mono">건</span>
                  </div>
                </div>

                <div className="bg-[#FEF5E7] p-3 rounded-xs border border-[#FDEBD0]">
                  <div className="text-[11px] text-[#7E5109] font-medium">조건 조율 / 확정</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#1E6B24]">{negotiationCount + confirmedCount}</span>
                    <span className="text-[10px] text-[#1E6B24] font-mono">건 ({negotiationCount}/{confirmedCount})</span>
                  </div>
                </div>

                <div className="bg-[#F6F6F6] p-3 rounded-xs border border-[#E5E7E9]">
                  <div className="text-[11px] text-[#707B7C] font-medium">보류 / 종료</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-bold text-[#707B7C]">{holdCount + closedCount}</span>
                    <span className="text-[10px] text-[#707B7C] font-mono">건</span>
                  </div>
                </div>
              </div>

              {/* Weekly Analysis Summary Banner */}
              <div className="mt-4 p-4 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#736152]" />
                    <h3 className="text-xs font-bold text-[#2C2C2C]">주간 제휴 진행 및 후속 분석 요약</h3>
                  </div>
                  <span className="text-[10px] text-[#8C7A6B] font-mono">
                    실제 제휴 DB {deals.length}건 실시간 연동
                  </span>
                </div>

                {/* 5 Key Metrics Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-2xs border border-[#E8E4DC]">
                    <div className="text-[10px] text-[#8C7A6B]">결과 대기 건수</div>
                    <div className="text-base font-bold text-[#7D6608] mt-0.5">
                      {awaitingResultCount}건 <span className="text-[10px] font-normal text-[#8C7A6B]">(후보 {resultWaitingCandidates.length}건)</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xs border border-[#E8E4DC]">
                    <div className="text-[10px] text-[#8C7A6B]">7일 이상 미회신</div>
                    <div className="text-base font-bold text-[#78281F] mt-0.5">
                      {noResponse7DaysDeals.length}건
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xs border border-[#E8E4DC]">
                    <div className="text-[10px] text-[#8C7A6B]">후속 필요 건수</div>
                    <div className="text-base font-bold text-[#7D6608] mt-0.5">
                      {followupNeededDeals.length}건
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xs border border-[#E8E4DC]">
                    <div className="text-[10px] text-[#8C7A6B]">이번 주 미팅 (예정/완료)</div>
                    <div className="text-base font-bold text-[#1B4F72] mt-0.5">
                      {meetingUpcomingCount + meetingCompletedCount}건
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xs border border-[#E8E4DC]">
                    <div className="text-[10px] text-[#8C7A6B]">진행 확정 신규</div>
                    <div className="text-base font-bold text-[#1E6B24] mt-0.5">
                      {confirmedCount}건
                    </div>
                  </div>
                </div>

                {/* Real Deal AI Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  {/* Box 1: Followup needed */}
                  <div className="bg-white p-2.5 rounded-2xs border border-[#F9E79F] space-y-1.5">
                    <div className="font-bold text-[#7D6608] text-[11px] flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 text-[#7D6608]" />
                        <span>지연 / 후속 필요 제휴</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#8C7A6B]">{followupNeededDeals.length}건</span>
                    </div>
                    {followupNeededDeals.length === 0 ? (
                      <p className="text-[11px] text-[#8C7A6B]">지연 건 없이 정상 진행 중입니다.</p>
                    ) : (
                      <ul className="space-y-1 text-[11px]">
                        {followupNeededDeals.slice(0, 3).map((d) => {
                          const st = getFollowupStatus(d);
                          return (
                            <li key={d.id} className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-2xs">
                              <span className="font-semibold text-[#2C2C2C] truncate max-w-[130px]">{d.companyName}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-2xs ${st.bg} ${st.text}`}>
                                {st.reason}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Box 2: Result waiting */}
                  <div className="bg-white p-2.5 rounded-2xs border border-[#FCF3CF] space-y-1.5">
                    <div className="font-bold text-[#7D6608] text-[11px] flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-[#7D6608]" />
                        <span>결과 대기 & 후보 업체</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#8C7A6B]">
                        {awaitingResultCount + resultWaitingCandidates.length}건
                      </span>
                    </div>
                    {deals.filter((d) => d.stage === '결과 대기' || isResultWaitingCandidate(d)).length === 0 ? (
                      <p className="text-[11px] text-[#8C7A6B]">결과 대기 중인 건이 없습니다.</p>
                    ) : (
                      <ul className="space-y-1 text-[11px]">
                        {deals
                          .filter((d) => d.stage === '결과 대기' || isResultWaitingCandidate(d))
                          .slice(0, 3)
                          .map((d) => (
                            <li key={d.id} className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-2xs">
                              <span className="font-semibold text-[#2C2C2C] truncate max-w-[130px]">{d.companyName}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FEF9E7] text-[#7D6608] rounded-2xs border border-[#FCF3CF]">
                                {d.stage === '결과 대기' ? '결과 대기' : '결과대기 후보'}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>

                  {/* Box 3: High potential */}
                  <div className="bg-white p-2.5 rounded-2xs border border-[#D1E7D5] space-y-1.5">
                    <div className="font-bold text-[#1E6B24] text-[11px] flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-[#1E6B24]" />
                        <span>조건 조율 & 진행 확정</span>
                      </span>
                      <span className="text-[10px] font-mono text-[#8C7A6B]">
                        {negotiationCount + confirmedCount}건
                      </span>
                    </div>
                    {deals.filter((d) => d.stage === '진행 확정' || d.stage === '조건 조율').length === 0 ? (
                      <p className="text-[11px] text-[#8C7A6B]">조율/확정 제휴 건이 없습니다.</p>
                    ) : (
                      <ul className="space-y-1 text-[11px]">
                        {deals
                          .filter((d) => d.stage === '진행 확정' || d.stage === '조건 조율')
                          .slice(0, 3)
                          .map((d) => (
                            <li key={d.id} className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-2xs">
                              <span className="font-semibold text-[#2C2C2C] truncate max-w-[130px]">{d.companyName}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#F0F7F2] text-[#1E6B24] rounded-2xs border border-[#D1E7D5]">
                                {d.stage}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* 3. TOOLBAR: SEARCH & FILTER & VIEW TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-[#E8E4DC] rounded-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="업체명, 브랜드, 담당자, 진행내용 검색..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#2C2C2C]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
          >
            <option value="ALL">전체 단계 ({deals.length})</option>
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s} ({deals.filter((d) => d.stage === s).length})
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          {allAssignees.length > 0 && (
            <select
              value={selectedAssigneeFilter}
              onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            >
              <option value="ALL">전체 담당자</option>
              {allAssignees.map((a) => (
                <option key={a} value={a}>
                  담당: {a}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchDeals}
            className="p-1.5 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#FAF8F5] rounded-xs transition-colors border border-[#E8E4DC]"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* View Toggle (Kanban vs List) */}
        <div className="flex items-center space-x-1 border border-[#E8E4DC] p-0.5 rounded-xs bg-[#FAF8F5]">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xs text-xs font-semibold transition-colors ${
              viewMode === 'kanban' ? 'bg-[#736152] text-white shadow-2xs' : 'text-[#736152] hover:bg-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>칸반 보드</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xs text-xs font-semibold transition-colors ${
              viewMode === 'list' ? 'bg-[#736152] text-white shadow-2xs' : 'text-[#736152] hover:bg-white'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>리스트</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN BOARD: KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-3.5 min-w-[1200px]">
            {ALL_STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage);
              const conf = STAGE_CONFIG[stage];

              return (
                <div
                  key={stage}
                  className={`flex-1 min-w-[260px] max-w-[320px] rounded-sm border ${conf.border} bg-[#FAF9F6] flex flex-col`}
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b ${conf.border} ${conf.bg} flex items-center justify-between`}>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${conf.text}`}>{conf.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${conf.badgeBg} ${conf.text}`}>
                        {stageDeals.length}
                      </span>
                    </div>
                  </div>

                  {/* Deals Container */}
                  <div className="p-2.5 space-y-2.5 flex-1 min-h-[450px]">
                    {stageDeals.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 border border-dashed border-[#E8E4DC] rounded-xs text-[#8C7A6B]">
                        <p className="text-[11px]">등록된 제휴 없음</p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          onClick={() => setSelectedDealForDetail(deal)}
                          className="bg-white border border-[#E8E4DC] rounded-xs p-3 hover:border-[#736152] hover:shadow-2xs transition-all cursor-pointer space-y-2 relative group"
                        >
                          {/* Card Top: Company & Industry */}
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="text-[10px] font-medium text-[#8C7A6B]">{deal.industry}</div>
                              <h4 className="text-xs font-bold text-[#2C2C2C] leading-snug hover:text-[#736152]">
                                {deal.companyName}
                              </h4>
                            </div>

                            {/* Stage Quick Changer */}
                            <select
                              value={deal.stage}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleQuickStageChange(deal, e.target.value as PartnerDealStage)}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-2xs bg-[#F5F2EB] border border-[#E8E4DC] text-[#5C4E43] focus:outline-none cursor-pointer"
                            >
                              {ALL_STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Latest Progress */}
                          <p className="text-[11px] text-[#555555] line-clamp-2 leading-relaxed bg-[#FAF8F5] p-2 rounded-xs border border-[#F0EBE3]">
                            {deal.latestProgress || '진행내용 작성 대기'}
                          </p>

                          {/* Next Action */}
                          {deal.nextAction && (
                            <div className="text-[10px] text-[#1B4F72] flex items-center space-x-1 font-medium">
                              <Calendar className="w-3 h-3 shrink-0 text-[#1B4F72]" />
                              <span className="truncate">
                                {deal.nextActionDate ? `[${deal.nextActionDate}] ` : ''}
                                {deal.nextAction}
                              </span>
                            </div>
                          )}

                          {/* Status & Candidate Badges */}
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            {isResultWaitingCandidate(deal) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-2xs bg-[#FEF9E7] text-[#7D6608] border border-[#FCF3CF] flex items-center space-x-0.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-[#7D6608]" />
                                <span>결과대기 후보</span>
                              </span>
                            )}
                            {(() => {
                              const st = getFollowupStatus(deal);
                              return (
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-2xs border ${st.bg} ${st.text} ${st.border}`}
                                  title={st.reason}
                                >
                                  {st.status}: {st.reason}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Card Footer: Assignee & Date */}
                          <div className="flex items-center justify-between text-[10px] text-[#8C7A6B] pt-1.5 border-t border-[#F5F2EB]">
                            <span className="flex items-center space-x-1 font-medium text-[#5C4E43]">
                              <User className="w-2.5 h-2.5" />
                              <span>{deal.internalAssignee}</span>
                            </span>
                            <span>{deal.lastUpdatedDate ? `업데이트: ${deal.lastUpdatedDate}` : ''}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 5. LIST VIEW */
        <div className="bg-white border border-[#E8E4DC] rounded-sm overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[11px] font-bold text-[#5C4E43]">
                  <th className="py-2.5 px-3">업체명 / 브랜드</th>
                  <th className="py-2.5 px-3">산업군</th>
                  <th className="py-2.5 px-3 text-center">진행단계</th>
                  <th className="py-2.5 px-3">최근 진행내용</th>
                  <th className="py-2.5 px-3">다음 액션 (예정일)</th>
                  <th className="py-2.5 px-3">외부 담당자</th>
                  <th className="py-2.5 px-3">내부 담당</th>
                  <th className="py-2.5 px-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC] text-xs text-[#2C2C2C]">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#8C7A6B] text-xs">
                      검색 조건에 일치하는 제휴 건이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const conf = STAGE_CONFIG[deal.stage];
                    return (
                      <tr
                        key={deal.id}
                        onClick={() => setSelectedDealForDetail(deal)}
                        className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#2C2C2C]">{deal.companyName}</div>
                          {deal.brandName && deal.brandName !== deal.companyName && (
                            <div className="text-[10px] text-[#8C7A6B]">{deal.brandName}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#555555]">{deal.industry}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-2xs text-[10px] font-bold ${conf.badgeBg} ${conf.text} border ${conf.border}`}
                            >
                              {deal.stage}
                            </span>
                            {isResultWaitingCandidate(deal) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-2xs bg-[#FEF9E7] text-[#7D6608] border border-[#FCF3CF]">
                                결과대기 후보
                              </span>
                            )}
                            {(() => {
                              const st = getFollowupStatus(deal);
                              return (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded-2xs border ${st.bg} ${st.text} ${st.border}`}
                                >
                                  {st.status}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-xs text-[#555555]">
                          <div className="line-clamp-2">{deal.latestProgress}</div>
                        </td>
                        <td className="py-3 px-3 text-[#1B4F72]">
                          <div className="font-medium">{deal.nextAction || '-'}</div>
                          {deal.nextActionDate && (
                            <div className="text-[10px] text-[#8C7A6B]">예정: {deal.nextActionDate}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-[#555555]">
                          <div>{deal.externalContactPerson || '-'}</div>
                          {deal.externalContactInfo && (
                            <div className="text-[10px] text-[#8C7A6B] truncate max-w-[120px]">
                              {deal.externalContactInfo}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#5C4E43]">{deal.internalAssignee}</td>
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleOpenEditDealModal(deal)}
                              className="p-1 text-[#736152] hover:bg-[#EFECE6] rounded-xs transition-colors"
                              title="수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeal(deal.id, deal.companyName)}
                              className="p-1 text-[#A93226] hover:bg-[#FADBD8] rounded-xs transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. DETAIL VIEW MODAL / DRAWER (WHEN A CARD IS CLICKED) */}
      {/* ======================================================== */}
      {selectedDealForDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E8E4DC] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#8C7A6B] font-medium">{selectedDealForDetail.industry}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-2xs ${
                      STAGE_CONFIG[selectedDealForDetail.stage].badgeBg
                    } ${STAGE_CONFIG[selectedDealForDetail.stage].text}`}
                  >
                    {selectedDealForDetail.stage}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mt-1">{selectedDealForDetail.companyName}</h2>
                {selectedDealForDetail.brandName && (
                  <p className="text-xs text-[#736152]">브랜드: {selectedDealForDetail.brandName}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      onNavigateTab('partnerlist');
                    }}
                    className="px-3 py-1.5 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>과거 제안자료 보기</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleOpenEditDealModal(selectedDealForDetail);
                    setSelectedDealForDetail(null);
                  }}
                  className="px-3 py-1.5 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>수정</span>
                </button>
                <button
                  onClick={() => setSelectedDealForDetail(null)}
                  className="p-1.5 text-[#8C7A6B] hover:text-[#2C2C2C] rounded-xs cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] space-y-1.5">
                <div className="font-bold text-[#736152]">외부 담당자 정보</div>
                <div>담당자: <span className="font-medium text-[#2C2C2C]">{selectedDealForDetail.externalContactPerson || '미기재'}</span></div>
                <div>연락처/이메일: <span className="font-medium text-[#2C2C2C]">{selectedDealForDetail.externalContactInfo || '미기재'}</span></div>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] space-y-1.5">
                <div className="font-bold text-[#736152]">내부 관리 정보</div>
                <div>내부 담당자: <span className="font-medium text-[#2C2C2C]">{selectedDealForDetail.internalAssignee}</span></div>
                <div>최초 컨택일: <span className="font-medium text-[#2C2C2C]">{selectedDealForDetail.firstContactDate}</span></div>
                <div>최근 업데이트: <span className="font-medium text-[#2C2C2C]">{selectedDealForDetail.lastUpdatedDate}</span></div>
              </div>
            </div>

            {/* Progress & Next Action */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5C4E43] block mb-1">최근 진행내용</label>
                <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] text-[#2C2C2C] leading-relaxed">
                  {selectedDealForDetail.latestProgress || '내용 없음'}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1B4F72] block mb-1">다음 액션 & 예정일</label>
                <div className="bg-[#F3F7FA] p-3 rounded-xs border border-[#D4E6F1] text-[#1B4F72] leading-relaxed">
                  <strong>[{selectedDealForDetail.nextActionDate || '일정 미정'}]</strong> {selectedDealForDetail.nextAction || '다음 액션 미지정'}
                </div>
              </div>

              {selectedDealForDetail.expectedCollaboration && (
                <div>
                  <label className="font-bold text-[#5C4E43] block mb-1">예상 협업내용 / 바터 조건</label>
                  <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] text-[#2C2C2C] leading-relaxed">
                    {selectedDealForDetail.expectedCollaboration}
                  </div>
                </div>
              )}

              {selectedDealForDetail.notes && (
                <div>
                  <label className="font-bold text-[#8C7A6B] block mb-1">비고 / 내부 메모</label>
                  <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] text-[#555555] leading-relaxed">
                    {selectedDealForDetail.notes}
                  </div>
                </div>
              )}
            </div>

            {/* History Timeline */}
            {selectedDealForDetail.history && selectedDealForDetail.history.length > 0 && (
              <div className="border-t border-[#E8E4DC] pt-4">
                <h4 className="text-xs font-bold text-[#736152] mb-3 flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>진행 이력 히스토리 ({selectedDealForDetail.history.length}건)</span>
                </h4>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {selectedDealForDetail.history.map((h) => (
                    <div
                      key={h.id}
                      className="text-xs bg-[#FAF8F5] border-l-2 border-[#736152] p-2.5 rounded-2xs flex flex-col space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
                        <span className="font-bold text-[#2C2C2C]">{h.date} — {h.stage}</span>
                        <span>작성: {h.author}</span>
                      </div>
                      <p className="text-[#555555]">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. CREATE / EDIT DEAL MODAL */}
      {/* ======================================================== */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-sm max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C]">
                {editingDeal ? '제휴 건 수정' : '신규 제휴 건 등록'}
              </h3>
              <button onClick={() => setIsDealModalOpen(false)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">
                    업체명 (기업명) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 룰루레몬 코리아"
                    value={formState.companyName || ''}
                    onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">브랜드명</label>
                  <input
                    type="text"
                    placeholder="예: lululemon"
                    value={formState.brandName || ''}
                    onChange={(e) => setFormState({ ...formState, brandName: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">산업군</label>
                  <select
                    value={formState.industry || '기타'}
                    onChange={(e) => setFormState({ ...formState, industry: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  >
                    <option value="스포츠·애슬레저">스포츠·애슬레저</option>
                    <option value="러닝·풋웨어">러닝·풋웨어</option>
                    <option value="골프용품·액세서리">골프용품·액세서리</option>
                    <option value="뷰티·스킨케어">뷰티·스킨케어</option>
                    <option value="F&B·주류·음료">F&B·주류·음료</option>
                    <option value="모빌리티·차량">모빌리티·차량</option>
                    <option value="가전·IT·음향">가전·IT·음향</option>
                    <option value="키즈·패밀리">키즈·패밀리</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">진행단계</label>
                  <select
                    value={formState.stage || '신규 컨택'}
                    onChange={(e) => setFormState({ ...formState, stage: e.target.value as PartnerDealStage })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  >
                    {ALL_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">내부 담당자</label>
                  <select
                    value={formState.internalAssignee || '미지정'}
                    onChange={(e) => setFormState({ ...formState, internalAssignee: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs font-bold text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  >
                    {OFFICIAL_MANAGERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">외부 담당자명 / 직책</label>
                  <input
                    type="text"
                    placeholder="예: 홍길동 팀장"
                    value={formState.externalContactPerson || ''}
                    onChange={(e) => setFormState({ ...formState, externalContactPerson: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">외부 연락처 / 이메일</label>
                  <input
                    type="text"
                    placeholder="예: contact@brand.com / 010-1234-5678"
                    value={formState.externalContactInfo || ''}
                    onChange={(e) => setFormState({ ...formState, externalContactInfo: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5C4E43] mb-1">최근 진행내용</label>
                <textarea
                  rows={2}
                  placeholder="이번 주 어떤 대화가 오갔는지 상세 내용을 기록하세요."
                  value={formState.latestProgress || ''}
                  onChange={(e) => setFormState({ ...formState, latestProgress: e.target.value })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#1B4F72] mb-1">다음 액션</label>
                  <input
                    type="text"
                    placeholder="예: 현장 실사 미팅 진행 / 제안서 보완 발송"
                    value={formState.nextAction || ''}
                    onChange={(e) => setFormState({ ...formState, nextAction: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1B4F72] mb-1">다음 예정일</label>
                  <input
                    type="date"
                    value={formState.nextActionDate || ''}
                    onChange={(e) => setFormState({ ...formState, nextActionDate: e.target.value })}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5C4E43] mb-1">예상 협업내용 / 바터 조건</label>
                <input
                  type="text"
                  placeholder="예: 객실 패키지 바터 + 성문안 웰니스 팝업 클래스 운영"
                  value={formState.expectedCollaboration || ''}
                  onChange={(e) => setFormState({ ...formState, expectedCollaboration: e.target.value })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#8C7A6B] mb-1">비고</label>
                <input
                  type="text"
                  placeholder="추가 참고사항"
                  value={formState.notes || ''}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF8F5] border border-[#E8E4DC] text-[#5C4E43] rounded-xs text-xs font-semibold hover:bg-[#EFECE6]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs text-xs font-bold shadow-2xs"
                >
                  {editingDeal ? '수정 완료' : '제휴 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. WEEKLY REPORT PREVIEW & DISPATCH MODAL */}
      {/* ======================================================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-sm max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E4DC] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-[#736152] uppercase tracking-wider bg-[#EFECE6] px-2 py-0.5 rounded-2xs">
                    주간 제휴 리포트
                  </span>
                  <span className="text-xs text-[#8C7A6B]">
                    {weeklyReport?.periodLabel || '주간 리포트 자동 집계'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#2C2C2C] mt-1 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-[#736152]" />
                  <span>주간 제휴 진행현황 및 시장 동향 리포트</span>
                </h3>
              </div>

              <button onClick={() => setIsReportModalOpen(false)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Dispatch Status Notification Bar */}
            <div
              className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
                emailServerStatus?.isConfigured
                  ? 'bg-[#F0F7F2] text-[#1E6B24] border-[#D1E7D5]'
                  : 'bg-[#FEF9E7] text-[#7D6608] border-[#FCF3CF]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {emailServerStatus?.isConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1E6B24] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#7D6608] shrink-0" />
                )}
                <span>
                  {emailServerStatus?.isConfigured
                    ? `SMTP 이메일 서버 연결 완료 (매주 금 18:00 자동 발송 활성, 수신자 ${
                        recipients.filter((r) => r.isActive).length
                      }명)`
                    : '자동 이메일 발송 기능 연결 필요 — SMTP 환경변수(SMTP_HOST, SMTP_USER 등) 미설정 상태입니다.'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsRecipientModalOpen(true)}
                  className="underline font-bold hover:opacity-80 cursor-pointer"
                >
                  수신자 목록 확인
                </button>
              </div>
            </div>

            {/* Dispatch Result Feedback */}
            {dispatchResult && (
              <div
                className={`p-3 text-xs border-b ${
                  dispatchResult.success
                    ? 'bg-[#EBF5EB] text-[#1E6B24] border-[#C3E6CB]'
                    : 'bg-[#FDF2E9] text-[#A04000] border-[#F5CBA7]'
                }`}
              >
                <div className="font-bold flex items-center space-x-1.5">
                  {dispatchResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{dispatchResult.message}</span>
                </div>
              </div>
            )}

            {/* Report Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              {isGeneratingReport ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-[#8C7A6B]">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#736152]" />
                  <p className="text-xs">실제 제휴 파이프라인 및 검증 트렌드 데이터를 집계하는 중...</p>
                </div>
              ) : weeklyReport ? (
                <div className="space-y-6">
                  {/* KPI Status Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                    <div className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC]">
                      <div className="text-[10px] text-[#8C7A6B]">신규 컨택</div>
                      <div className="text-lg font-bold text-[#2C2C2C] mt-0.5">
                        {weeklyReport.pipelineAggregation.newContactCount}
                      </div>
                    </div>
                    <div className="bg-[#FAF5F8] p-3 rounded-xs border border-[#EBDCF0]">
                      <div className="text-[10px] text-[#6C3483]">제안 발송</div>
                      <div className="text-lg font-bold text-[#6C3483] mt-0.5">
                        {weeklyReport.pipelineAggregation.proposalCount}
                      </div>
                    </div>
                    <div className="bg-[#F3F7FA] p-3 rounded-xs border border-[#D4E6F1]">
                      <div className="text-[10px] text-[#1B4F72]">미팅 진행</div>
                      <div className="text-lg font-bold text-[#1B4F72] mt-0.5">
                        {weeklyReport.pipelineAggregation.meetingCount}
                      </div>
                    </div>
                    <div className="bg-[#FEF9E7] p-3 rounded-xs border border-[#FCF3CF]">
                      <div className="text-[10px] text-[#7D6608]">결과 대기</div>
                      <div className="text-lg font-bold text-[#7D6608] mt-0.5">
                        {weeklyReport.pipelineAggregation.awaitingResultCount}
                      </div>
                    </div>
                    <div className="bg-[#F0F7F2] p-3 rounded-xs border border-[#D1E7D5] col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-[#1E6B24]">진행 확정</div>
                      <div className="text-lg font-bold text-[#1E6B24] mt-0.5">
                        {weeklyReport.pipelineAggregation.confirmedCount}
                      </div>
                    </div>
                  </div>

                  {/* 1. 이번 주 핵심 요약 (3~5줄) */}
                  <div className="border border-[#E8E4DC] rounded-xs p-4 bg-[#FAF8F5]">
                    <h4 className="text-xs font-bold text-[#736152] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>1. 이번 주 핵심 요약 (Executive Summary)</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#2C2C2C] list-disc list-inside leading-relaxed">
                      {weeklyReport.executiveSummary.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. 금주 시장·동종사 동향 (외부 트렌드) */}
                  <div className="border border-[#E8E4DC] rounded-xs p-4 bg-white space-y-3">
                    <h4 className="text-xs font-bold text-[#736152] uppercase tracking-wider flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>2. 금주 시장 · 동종사 동향 (실시간 검증 데이터)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {weeklyReport.externalTrends.marketTrends.map((t, i) => (
                        <div key={i} className="bg-[#FAF8F5] p-3 rounded-xs border border-[#E8E4DC] space-y-1">
                          <span className="text-[10px] font-bold text-[#736152] bg-white px-1.5 py-0.5 rounded-2xs border border-[#E8E4DC]">
                            {t.category}
                          </span>
                          <h5 className="text-xs font-bold text-[#2C2C2C] mt-1">{t.title}</h5>
                          <p className="text-[11px] text-[#666666] leading-relaxed">{t.summary}</p>
                          <div className="text-[9px] text-[#8C7A6B] pt-1">출처: {t.source}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3 & 4. 주요 제휴 건 진행현황 */}
                  <div className="border border-[#E8E4DC] rounded-xs overflow-hidden">
                    <div className="p-3 bg-[#FAF8F5] border-b border-[#E8E4DC]">
                      <h4 className="text-xs font-bold text-[#736152] uppercase tracking-wider flex items-center space-x-1.5">
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>3 & 4. 주요 제휴 건 진행현황 (총 {weeklyReport.keyDeals.length}건)</span>
                      </h4>
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF9F6] border-b border-[#E8E4DC] text-[11px] text-[#5C4E43]">
                        <tr>
                          <th className="p-2.5">업체명</th>
                          <th className="p-2.5 text-center">단계</th>
                          <th className="p-2.5">최근 진행내용</th>
                          <th className="p-2.5">다음 액션 (예정일)</th>
                          <th className="p-2.5 text-center">담당</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E4DC]">
                        {weeklyReport.keyDeals.map((deal) => {
                          const conf = STAGE_CONFIG[deal.stage];
                          return (
                            <tr key={deal.id} className="hover:bg-[#FAF8F5]">
                              <td className="p-2.5 font-bold text-[#2C2C2C]">{deal.companyName}</td>
                              <td className="p-2.5 text-center">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded-2xs text-[10px] font-bold ${conf.badgeBg} ${conf.text}`}
                                >
                                  {deal.stage}
                                </span>
                              </td>
                              <td className="p-2.5 text-[#555555] max-w-xs leading-relaxed">
                                {deal.latestProgress}
                              </td>
                              <td className="p-2.5 text-[#1B4F72] font-medium">
                                {deal.nextAction} <span className="text-[#8C7A6B] text-[10px]">({deal.nextActionDate})</span>
                              </td>
                              <td className="p-2.5 text-center text-[#5C4E43]">{deal.internalAssignee}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 5. 다음 주 업무 및 미팅 예정 */}
                  <div className="border border-[#E8E4DC] rounded-xs p-4 bg-[#FAF8F5] space-y-2">
                    <h4 className="text-xs font-bold text-[#736152] uppercase tracking-wider flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>5. 다음 주 예정 일정 (Next Week Schedule)</span>
                    </h4>
                    <div className="space-y-1.5">
                      {weeklyReport.nextWeekSchedule.length === 0 ? (
                        <p className="text-xs text-[#8C7A6B]">다음 주 예정된 일정이 없습니다.</p>
                      ) : (
                        weeklyReport.nextWeekSchedule.map((s, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-xs border-l-3 border-[#736152] border border-[#E8E4DC] text-xs flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-[#2C2C2C]">[{s.dueDate}] {s.companyName}</strong> —{' '}
                              <span className="text-[#555555]">{s.description}</span>
                            </div>
                            <span className="text-[11px] text-[#8C7A6B] shrink-0 ml-2">담당: {s.assignee}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 6. AI 추천 (다음 주 우선 처리할 업무 3개 - 실제 데이터 기반) */}
                  <div className="border border-[#D4C8B8] rounded-xs p-4 bg-[#FAF5F0] space-y-2.5">
                    <h4 className="text-xs font-bold text-[#736152] uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#736152]" />
                      <span>6. AI 우선 처리 추천 업무 (실제 저장된 제휴 DB 기반)</span>
                    </h4>
                    <div className="space-y-2">
                      {weeklyReport.aiPriorityRecommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-xs border border-[#E8E4DC] text-xs text-[#2C2C2C] leading-relaxed flex items-start space-x-2"
                        >
                          <span className="font-bold text-[#736152] shrink-0">0{idx + 1}.</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8E4DC] bg-[#FAF8F5] flex items-center justify-between">
              <div className="text-xs text-[#8C7A6B]">
                정기 발송: 매주 금요일 18:00 KST 자동 실행
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E8E4DC] text-[#5C4E43] rounded-xs text-xs font-semibold hover:bg-[#EFECE6]"
                >
                  닫기
                </button>
                <button
                  onClick={handleDispatchEmailNow}
                  disabled={isDispatchingEmail || isGeneratingReport}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isDispatchingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>발송 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>지금 수신자 전원에게 즉시 발송</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. RECIPIENTS MANAGEMENT MODAL */}
      {/* ======================================================== */}
      {isRecipientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#736152]" />
                <span>주간 리포트 이메일 수신자 관리</span>
              </h3>
              <button onClick={() => setIsRecipientModalOpen(false)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Recipient */}
            <form onSubmit={handleAddRecipient} className="bg-[#FAF8F5] p-3.5 border border-[#E8E4DC] rounded-xs space-y-2.5 text-xs">
              <div className="font-bold text-[#736152]">신규 수신자 추가</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="이름 (예: 마케팅본부장)"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  className="p-2 bg-white border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                />
                <input
                  type="email"
                  required
                  placeholder="이메일 주소"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  className="p-2 bg-white border border-[#E8E4DC] rounded-xs text-xs focus:outline-none focus:border-[#736152]"
                />
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="소속 부서 (선택)"
                  value={newRecipientDept}
                  onChange={(e) => setNewRecipientDept(e.target.value)}
                  className="p-2 bg-white border border-[#E8E4DC] rounded-xs text-xs flex-1 mr-2 focus:outline-none focus:border-[#736152]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-xs text-xs font-bold cursor-pointer shrink-0"
                >
                  수신자 추가
                </button>
              </div>
            </form>

            {/* Current Recipients List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#5C4E43]">
                등록된 수신자 목록 ({recipients.length}명)
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {recipients.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#2C2C2C]">
                        {r.name} <span className="text-[10px] text-[#8C7A6B] font-normal">({r.department || '마케팅'})</span>
                      </div>
                      <div className="text-[11px] text-[#555555] font-mono">{r.email}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRecipient(r)}
                        className={`px-2 py-1 rounded-2xs text-[10px] font-bold cursor-pointer transition-colors ${
                          r.isActive
                            ? 'bg-[#D4EFDF] text-[#1E6B24]'
                            : 'bg-[#EAEDED] text-[#707B7C]'
                        }`}
                      >
                        {r.isActive ? '발송 활성' : '발송 일시정지'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRecipient(r.id)}
                        className="p-1 text-[#A93226] hover:bg-[#FADBD8] rounded-xs transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. PAST REPORT ARCHIVES MODAL */}
      {/* ======================================================== */}
      {isArchivesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
                <Archive className="w-4 h-4 text-[#736152]" />
                <span>주간 리포트 발송 보관함 (아카이브)</span>
              </h3>
              <button onClick={() => setIsArchivesModalOpen(false)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {archives.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8C7A6B] bg-[#FAF8F5] border border-dashed border-[#E8E4DC] rounded-xs">
                  아직 보관된 과거 리포트가 없습니다. 주간 리포트 생성 및 발송 시 자동으로 보관됩니다.
                </div>
              ) : (
                archives.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs flex items-start justify-between text-xs hover:border-[#736152] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#2C2C2C]">{rep.periodLabel}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-2xs ${
                            rep.dispatchStatus === 'SUCCESS'
                              ? 'bg-[#D4EFDF] text-[#1E6B24]'
                              : rep.dispatchStatus === 'NOT_CONFIGURED'
                              ? 'bg-[#FEF9E7] text-[#7D6608]'
                              : 'bg-[#FADBD8] text-[#A93226]'
                          }`}
                        >
                          {rep.dispatchStatus === 'SUCCESS'
                            ? '발송 완료'
                            : rep.dispatchStatus === 'NOT_CONFIGURED'
                            ? '발송 대기보관'
                            : '발송 실패'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#555555]">
                        확정: {rep.pipelineAggregation.confirmedCount}건 / 미팅: {rep.pipelineAggregation.meetingCount}건 / 제안: {rep.pipelineAggregation.proposalCount}건
                      </p>
                      <div className="text-[10px] text-[#8C7A6B]">
                        생성일시: {new Date(rep.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setWeeklyReport(rep);
                        setIsArchivesModalOpen(false);
                        setIsReportModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-[#E8E4DC] text-[#5C4E43] hover:bg-[#EFECE6] rounded-xs text-xs font-semibold shrink-0"
                    >
                      열람
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
