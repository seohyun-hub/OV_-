import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  User,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  FileText,
  Upload,
  Link as LinkIcon,
  Search,
  Filter,
  X,
  ChevronRight,
  Check,
  Info,
  HelpCircle,
  Tag,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ScheduleItem,
  ScheduleType,
  ScheduleStatus,
  SCHEDULE_TYPES,
  SCHEDULE_STATUSES,
  ExtractedScheduleCandidate,
  AuthUser,
  OFFICIAL_MANAGERS,
  PartnerDealItem,
  PartnerDealStage,
  PARTNER_DEAL_STAGES
} from '../types';

interface ScheduleSectionProps {
  currentUser?: AuthUser | null;
  compactMode?: boolean; // If true, show compact dashboard widget
}

// Display Wrapper interface combining PartnerDeal schedule items and General Schedule items
export interface DisplayScheduleItem {
  id: string;
  dealId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string; // Action title / schedule name
  company: string; // Company / Brand
  projectName?: string;
  scheduleType: string;
  location: string;
  assignee: string;
  status: string; // Stage or Status
  memo: string;
  isPartnerDeal: boolean; // True if source is partnerDeals, False if schedules
  originalDeal?: PartnerDealItem;
  originalSchedule?: ScheduleItem;
}

const STAGE_BADGE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  '컨택중': { bg: 'bg-[#F9F7F4]', text: 'text-[#6B5A4D]', border: 'border-[#E6DFD5]' },
  '제안': { bg: 'bg-[#FAF5F8]', text: 'text-[#6C3483]', border: 'border-[#EBDCF0]' },
  '미팅': { bg: 'bg-[#F3F7FA]', text: 'text-[#1B4F72]', border: 'border-[#D4E6F1]' },
  '결과': { bg: 'bg-[#FEF9E7]', text: 'text-[#7D6608]', border: 'border-[#FCF3CF]' },
  '결과대기': { bg: 'bg-[#FEF9E7]', text: 'text-[#7D6608]', border: 'border-[#FCF3CF]' },
  '진행확정': { bg: 'bg-[#F0F7F2]', text: 'text-[#1E6B24]', border: 'border-[#D1E7D5]' },
  '보류': { bg: 'bg-[#F6F6F6]', text: 'text-[#707B7C]', border: 'border-[#E5E7E9]' },
  '종료': { bg: 'bg-[#F8F9F9]', text: 'text-[#99A3A4]', border: 'border-[#E5E8E8]' },
  '예정': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  '진행중': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  '완료': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  currentUser,
  compactMode = false,
}) => {
  // Source Selection Tab: 'PARTNER_DEALS' (Single Source of Truth) or 'GENERAL_SCHEDULES'
  const [activeSourceTab, setActiveSourceTab] = useState<'PARTNER_DEALS' | 'GENERAL_SCHEDULES'>('PARTNER_DEALS');

  // Main Data States
  const [partnerDeals, setPartnerDeals] = useState<PartnerDealItem[]>([]);
  const [generalSchedules, setGeneralSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterMode, setFilterMode] = useState<'ALL' | 'MY'>('ALL');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('ALL');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DisplayScheduleItem | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [isFullViewModalOpen, setIsFullViewModalOpen] = useState<boolean>(false);

  // Form State for Partner Deal Action / Schedule
  const [formData, setFormData] = useState<{
    companyName: string;
    brandName: string;
    projectName: string;
    nextAction: string;
    date: string;
    time: string;
    location: string;
    assignee: string;
    stage: string;
    memo: string;
    scheduleType: ScheduleType;
  }>({
    companyName: '',
    brandName: '',
    projectName: '',
    nextAction: '',
    date: new Date().toISOString().substring(0, 10),
    time: '14:00',
    location: '오크밸리',
    assignee: currentUser?.name && OFFICIAL_MANAGERS.includes(currentUser.name as any) ? currentUser.name : '박서현',
    stage: '제안',
    memo: '',
    scheduleType: '미팅',
  });

  // AI Import State
  const [aiImportType, setAiImportType] = useState<'IMAGE' | 'FILE' | 'URL'>('IMAGE');
  const [aiUrl, setAiUrl] = useState<string>('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [isRestrictedUrlNotice, setIsRestrictedUrlNotice] = useState<boolean>(false);

  // Verification Candidates State
  const [candidates, setCandidates] = useState<ExtractedScheduleCandidate[]>([]);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);

  // Fetch Partner Deals (Source of Truth for Partnership Schedule)
  const fetchPartnerDeals = async () => {
    try {
      const res = await fetch('/api/partner-pipeline/deals');
      const data = await res.json();
      if (data.success && Array.isArray(data.deals)) {
        setPartnerDeals(data.deals);
      }
    } catch (e) {
      console.error('Failed to load partner deals:', e);
    }
  };

  // Fetch General Schedules
  const fetchGeneralSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      const data = await res.json();
      if (data.success && Array.isArray(data.schedules)) {
        setGeneralSchedules(data.schedules);
      }
    } catch (e) {
      console.error('Failed to load general schedules:', e);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPartnerDeals(), fetchGeneralSchedules()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();

    // Listen for data updates across components
    const handleDataUpdated = () => {
      fetchPartnerDeals();
      fetchGeneralSchedules();
    };

    window.addEventListener('oakvalley_data_updated', handleDataUpdated);
    return () => {
      window.removeEventListener('oakvalley_data_updated', handleDataUpdated);
    };
  }, []);

  // Date & Week Bounds Calculation
  const formatYMD = (dt: Date) => {
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const date = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getWeekBounds = (now: Date = new Date()) => {
    const d = new Date(now);
    const day = d.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diffToMon);
    mon.setHours(0, 0, 0, 0);

    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);

    return {
      startOfWeekStr: formatYMD(mon),
      endOfWeekStr: formatYMD(sun),
    };
  };

  const todayStr = formatYMD(new Date());
  const { startOfWeekStr, endOfWeekStr } = getWeekBounds(new Date());

  const COMPLETED_STATUSES = ['완료', '종료', '취소', '무산'];
  const isCompletedStatus = (st: string) => COMPLETED_STATUSES.includes(st);

  // Map Partner Deals to DisplayScheduleItems
  const partnerDealScheduleItems: DisplayScheduleItem[] = partnerDeals
    .filter((d) => d.nextActionDate && d.nextActionDate.trim() !== '' && d.nextAction && d.nextAction.trim() !== '')
    .map((deal) => ({
      id: `pd-${deal.id}`,
      dealId: deal.id,
      date: deal.nextActionDate,
      time: deal.nextActionTime || '14:00',
      title: deal.nextAction,
      company: deal.companyName,
      projectName: deal.projectName || deal.brandName,
      scheduleType: deal.stage || '제휴 협의',
      location: deal.location || '오크밸리',
      assignee: deal.internalAssignee || '미지정',
      status: deal.stage || '제안',
      memo: deal.latestProgress || deal.expectedCollaboration || deal.notes || '',
      isPartnerDeal: true,
      originalDeal: deal,
    }));

  // Map General Schedules to DisplayScheduleItems
  const generalScheduleItems: DisplayScheduleItem[] = generalSchedules.map((sch) => ({
    id: `gs-${sch.id}`,
    date: sch.date,
    time: sch.time || '14:00',
    title: sch.title,
    company: sch.company || '내부 업무',
    scheduleType: sch.scheduleType || '일반',
    location: sch.location || '오크밸리',
    assignee: sch.assignee || '미지정',
    status: sch.status || '예정',
    memo: sch.memo || '',
    isPartnerDeal: false,
    originalSchedule: sch,
  }));

  // Select current active schedule list based on active tab
  const activeRawItems = activeSourceTab === 'PARTNER_DEALS' ? partnerDealScheduleItems : generalScheduleItems;

  // Filter schedules
  const displayedSchedules = activeRawItems.filter((s) => {
    // 1. Assignee Filter
    if (selectedAssigneeFilter !== 'ALL') {
      if (s.assignee !== selectedAssigneeFilter) return false;
    } else if (filterMode === 'MY') {
      const myName = currentUser?.name || '박서현';
      if (!s.assignee.includes(myName) && !myName.includes(s.assignee)) return false;
    }

    const completed = isCompletedStatus(s.status);
    const isOverdue = s.date < todayStr && !completed;
    const isInCurrentWeek = s.date >= startOfWeekStr && s.date <= endOfWeekStr;

    // 2. Hide completed schedules unless showCompleted toggle is active
    if (!showCompleted) {
      if (completed) return false;
      return isOverdue || isInCurrentWeek;
    } else {
      return isOverdue || isInCurrentWeek;
    }
  });

  // Sort Order:
  // 1) 지연/후속 필요 (Past incomplete: date < todayStr)
  // 2) 오늘 일정 (date === todayStr)
  // 3) 이번 주 예정 일정 (date > todayStr)
  // 4) 완료 일정 (if showCompleted is active)
  const getItemPriority = (item: DisplayScheduleItem) => {
    const completed = isCompletedStatus(item.status);
    if (item.date < todayStr && !completed) return 1; // 지연/후속 필요
    if (item.date === todayStr && !completed) return 2; // 오늘 일정
    if (item.date > todayStr && !completed) return 3; // 이번 주 예정 일정
    return 4; // 완료 일정
  };

  const sortedSchedules = [...displayedSchedules].sort((a, b) => {
    const prioA = getItemPriority(a);
    const prioB = getItemPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.time.localeCompare(b.time);
  });

  // Quick Action: "내가 담당"
  const handleSetMyAssignee = () => {
    const myName = currentUser?.name && OFFICIAL_MANAGERS.includes(currentUser.name as any) ? currentUser.name : '박서현';
    setFormData((prev) => ({ ...prev, assignee: myName }));
  };

  // Open Form Modal for Create / Edit
  const handleOpenAddModal = (item?: DisplayScheduleItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        companyName: item.company,
        brandName: item.projectName || '',
        projectName: item.projectName || '',
        nextAction: item.title,
        date: item.date,
        time: item.time,
        location: item.location,
        assignee: item.assignee,
        stage: item.status,
        memo: item.memo,
        scheduleType: (SCHEDULE_TYPES.includes(item.scheduleType as any) ? item.scheduleType : '미팅') as ScheduleType,
      });
    } else {
      setEditingItem(null);
      setFormData({
        companyName: '',
        brandName: '',
        projectName: '',
        nextAction: '',
        date: new Date().toISOString().substring(0, 10),
        time: '14:00',
        location: '오크밸리',
        assignee: currentUser?.name || '박서현',
        stage: '제안',
        memo: '',
        scheduleType: '미팅',
      });
    }
    setIsAddEditModalOpen(true);
  };

  // Save Schedule Handler (Updates partnerDeals directly if in PARTNER_DEALS mode)
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nextAction.trim() || !formData.date) {
      alert('일정/다음 액션 내용과 날짜를 입력해주세요.');
      return;
    }

    try {
      if (activeSourceTab === 'PARTNER_DEALS') {
        // Save to partnerDeals collection!
        if (editingItem && editingItem.dealId) {
          // Update existing deal
          const res = await fetch(`/api/partner-pipeline/deals/${editingItem.dealId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: formData.companyName || editingItem.company,
              brandName: formData.brandName || editingItem.projectName,
              projectName: formData.projectName,
              nextAction: formData.nextAction,
              nextActionDate: formData.date,
              nextActionTime: formData.time,
              location: formData.location,
              internalAssignee: formData.assignee,
              stage: formData.stage,
              latestProgress: formData.memo,
              updatedBy: currentUser?.name || '사용자',
            }),
          });
          const data = await res.json();
          if (data.success) {
            setIsAddEditModalOpen(false);
            fetchPartnerDeals();
            window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
          } else {
            alert(data.error || '제휴 일정 수정 실패');
          }
        } else {
          // Create new deal
          const res = await fetch('/api/partner-pipeline/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: formData.companyName || '신규 제휴 파트너',
              brandName: formData.brandName || formData.companyName || '신규 제휴',
              projectName: formData.projectName,
              nextAction: formData.nextAction,
              nextActionDate: formData.date,
              nextActionTime: formData.time,
              location: formData.location,
              internalAssignee: formData.assignee,
              stage: formData.stage as PartnerDealStage,
              industry: '기타',
              externalContactPerson: '담당자 미지정',
              externalContactInfo: '-',
              firstContactDate: formData.date,
              latestProgress: formData.memo || '금주 제휴 일정 신규 등록',
              expectedCollaboration: formData.nextAction,
              notes: 'Dashboard 금주 제휴 일정에서 직접 등록됨',
              createdBy: currentUser?.name || '사용자',
            }),
          });
          const data = await res.json();
          if (data.success) {
            setIsAddEditModalOpen(false);
            fetchPartnerDeals();
            window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
          } else {
            alert(data.error || '제휴 일정 등록 실패');
          }
        }
      } else {
        // Save to general schedules collection!
        if (editingItem && editingItem.originalSchedule) {
          const res = await fetch(`/api/schedules/${editingItem.originalSchedule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: formData.date,
              time: formData.time,
              title: formData.nextAction,
              company: formData.companyName || '내부 업무',
              scheduleType: formData.scheduleType,
              location: formData.location,
              assignee: formData.assignee,
              status: formData.stage,
              memo: formData.memo,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setIsAddEditModalOpen(false);
            fetchGeneralSchedules();
            window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
          } else {
            alert(data.error || '일정 수정 실패');
          }
        } else {
          const res = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: formData.date,
              time: formData.time,
              title: formData.nextAction,
              company: formData.companyName || '일반 업무',
              scheduleType: formData.scheduleType,
              location: formData.location,
              assignee: formData.assignee,
              status: formData.stage,
              memo: formData.memo,
              source: 'MANUAL',
            }),
          });
          const data = await res.json();
          if (data.success) {
            setIsAddEditModalOpen(false);
            fetchGeneralSchedules();
            window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
          } else {
            alert(data.error || '일정 등록 실패');
          }
        }
      }
    } catch (err) {
      console.error('Error saving schedule item:', err);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  // Toggle Status directly
  const handleStatusToggle = async (item: DisplayScheduleItem, nextStatus: string) => {
    try {
      if (item.isPartnerDeal && item.dealId) {
        // Update deal stage in partnerDeals
        const res = await fetch(`/api/partner-pipeline/deals/${item.dealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: nextStatus, updatedBy: currentUser?.name || '사용자' }),
        });
        const data = await res.json();
        if (data.success) {
          fetchPartnerDeals();
          window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
        }
      } else if (item.originalSchedule) {
        // Update general schedule status
        const res = await fetch(`/api/schedules/${item.originalSchedule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        const data = await res.json();
        if (data.success) {
          fetchGeneralSchedules();
          window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (item: DisplayScheduleItem) => {
    if (!window.confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    try {
      if (item.isPartnerDeal && item.dealId) {
        // Clear next action or delete deal
        const res = await fetch(`/api/partner-pipeline/deals/${item.dealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nextAction: '', nextActionDate: '', updatedBy: currentUser?.name || '사용자' }),
        });
        const data = await res.json();
        if (data.success) {
          fetchPartnerDeals();
          window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
        }
      } else if (item.originalSchedule) {
        const res = await fetch(`/api/schedules/${item.originalSchedule.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchGeneralSchedules();
          window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
        }
      }
    } catch (e) {
      console.error('Failed to delete schedule:', e);
    }
  };

  // Run AI Schedule Analysis
  const handleRunAiAnalysis = async () => {
    setAiAnalyzing(true);
    setAiErrorMsg(null);
    setIsRestrictedUrlNotice(false);

    try {
      let bodyData: any = {};

      if (aiImportType === 'URL') {
        if (!aiUrl.trim().startsWith('http')) {
          setAiErrorMsg('http:// 또는 https:// 로 시작하는 유효한 URL을 입력해주세요.');
          setAiAnalyzing(false);
          return;
        }
        bodyData = { inputType: 'url', url: aiUrl.trim() };
      } else {
        if (!aiFile) {
          setAiErrorMsg('분석할 파일을 선택해주세요.');
          setAiAnalyzing(false);
          return;
        }

        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(aiFile);
        });

        bodyData = {
          inputType: aiImportType === 'IMAGE' ? 'image' : 'file',
          fileData: fileBase64,
          fileName: aiFile.name,
          mimeType: aiFile.type,
        };
      }

      const res = await fetch('/api/schedules/analyze-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const json = await res.json();

      if (!json.success) {
        if (json.isRestrictedUrl) {
          setIsRestrictedUrlNotice(true);
          setAiErrorMsg('접근이 제한된 링크입니다. 해당 화면을 캡처하거나 파일로 업로드해주세요.');
        } else {
          let msg = json.error || '일정 분석에 실패했습니다. 잠시 후 다시 시도해주세요.';
          setAiErrorMsg(msg);
        }
        setAiAnalyzing(false);
        return;
      }

      if (Array.isArray(json.candidateSchedules) && json.candidateSchedules.length > 0) {
        const formattedCandidates: ExtractedScheduleCandidate[] = json.candidateSchedules.map((c: any, idx: number) => ({
          id: `cand-${Date.now()}-${idx}`,
          date: c.date || new Date().toISOString().substring(0, 10),
          time: c.time || '10:00',
          title: c.title || '제휴 일정',
          company: c.company || '미지정 파트너',
          scheduleType: (SCHEDULE_TYPES.includes(c.scheduleType) ? c.scheduleType : '기타') as ScheduleType,
          location: c.location || '오크밸리',
          assignee: c.assignee || currentUser?.name || '박서현',
          status: '예정' as ScheduleStatus,
          memo: c.memo || '',
          needsVerification: c.needsVerification ?? (!c.date || !c.time),
          verificationNote: c.verificationNote || (c.needsVerification ? '확인 필요' : ''),
        }));

        setCandidates(formattedCandidates);
        setIsAiModalOpen(false);
        setIsVerifyModalOpen(true);
      } else {
        setAiErrorMsg('일정 정보가 추출되지 않았습니다. 다른 캡처 이미지나 파일을 선택해주세요.');
      }
    } catch (err: any) {
      console.error('Error during AI schedule analysis:', err);
      setAiErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Save Candidates Batch
  const handleSaveVerifiedBatch = async () => {
    if (candidates.length === 0) {
      alert('저장할 일정이 없습니다.');
      return;
    }

    setIsSavingBatch(true);
    try {
      if (activeSourceTab === 'PARTNER_DEALS') {
        // Save as partnerDeals!
        for (const cand of candidates) {
          await fetch('/api/partner-pipeline/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: cand.company || '추출 파트너',
              brandName: cand.company || '제휴',
              nextAction: cand.title,
              nextActionDate: cand.date,
              nextActionTime: cand.time,
              location: cand.location,
              internalAssignee: cand.assignee,
              stage: '제안',
              industry: '기타',
              externalContactPerson: '담당자 미지정',
              externalContactInfo: '-',
              firstContactDate: cand.date,
              latestProgress: cand.memo || 'AI 일괄 추출 저장',
              expectedCollaboration: cand.title,
              createdBy: currentUser?.name || 'AI 추출',
            }),
          });
        }
        setIsVerifyModalOpen(false);
        setCandidates([]);
        fetchPartnerDeals();
        window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
      } else {
        const res = await fetch('/api/schedules/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: candidates }),
        });
        const json = await res.json();
        if (json.success) {
          setIsVerifyModalOpen(false);
          setCandidates([]);
          fetchGeneralSchedules();
          window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
        } else {
          alert(json.error || '일정 저장 중 오류가 발생했습니다.');
        }
      }
    } catch (e) {
      console.error('Failed to save batch schedules:', e);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleCandidateChange = (id: string, field: keyof ExtractedScheduleCandidate, value: any) => {
    setCandidates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white border border-[#D4C8B8] rounded-2xl p-6 shadow-xs space-y-5 font-sans">
      
      {/* 1. Source Selection Tabs & Header Bar */}
      <div className="space-y-4 border-b border-[#E5DDD3] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#2C2C2C] flex items-center gap-2 break-keep">
                <Calendar className="w-5 h-5 text-[#736152]" />
                금주 제휴 일정
              </h2>
              <span className="px-2.5 py-0.5 bg-[#F5F0EB] text-[#736152] text-xs font-bold rounded-full border border-[#D4C8B8]">
                {sortedSchedules.length}건
              </span>
            </div>
            <p className="text-xs text-[#736152] break-keep">
              이번 주 챙겨야 할 제휴 진행건의 다음 액션, 파트너 미팅, 제안 및 협의 일정
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Assignee Filter Dropdown */}
            <div className="bg-[#FAF8F5] border border-[#E5DDD3] p-1 rounded-xl flex items-center text-xs font-bold text-[#736152]">
              <select
                value={selectedAssigneeFilter}
                onChange={(e) => {
                  setSelectedAssigneeFilter(e.target.value);
                  if (e.target.value !== 'ALL') setFilterMode('ALL');
                }}
                className="px-2 py-1 bg-transparent text-xs font-bold text-[#2C2C2C] focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 담당자</option>
                {OFFICIAL_MANAGERS.map((m) => (
                  <option key={m} value={m}>
                    담당: {m}
                  </option>
                ))}
              </select>
            </div>

            {/* My Filter Toggle */}
            <div className="bg-[#FAF8F5] border border-[#E5DDD3] p-1 rounded-xl flex items-center text-xs font-bold text-[#736152]">
              <button
                onClick={() => {
                  setFilterMode('ALL');
                  setSelectedAssigneeFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterMode === 'ALL' && selectedAssigneeFilter === 'ALL'
                    ? 'bg-[#736152] text-white shadow-xs'
                    : 'hover:text-[#2C2C2C]'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => {
                  setFilterMode('MY');
                  setSelectedAssigneeFilter('ALL');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  filterMode === 'MY'
                    ? 'bg-[#736152] text-white shadow-xs'
                    : 'hover:text-[#2C2C2C]'
                }`}
              >
                <User className="w-3 h-3" />
                내 담당
              </button>
            </div>

            {/* Toggle Completed Schedules */}
            <button
              onClick={() => setShowCompleted((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                showCompleted
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F5F0EB] text-[#736152] border-[#D4C8B8]'
              }`}
              title={showCompleted ? '완료/종료된 일정을 숨깁니다' : '완료/종료된 일정을 함께 표시합니다'}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${showCompleted ? 'text-white' : 'text-emerald-600'}`} />
              <span>{showCompleted ? '완료 숨김' : '완료 포함'}</span>
            </button>

            {/* AI Extraction Button */}
            <button
              onClick={() => {
                setAiErrorMsg(null);
                setIsRestrictedUrlNotice(false);
                setIsAiModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5F0EB] hover:bg-[#EAE4D9] text-[#736152] border border-[#D4C8B8] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>자료 불러오기</span>
            </button>

            {/* Direct Add Button */}
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ {activeSourceTab === 'PARTNER_DEALS' ? '제휴 일정 등록' : '일반 일정 등록'}</span>
            </button>
          </div>
        </div>

        {/* Source Navigation Tabs: Single Source of Truth for Partnership Schedule */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F0ECE1]">
          <button
            onClick={() => setActiveSourceTab('PARTNER_DEALS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              activeSourceTab === 'PARTNER_DEALS'
                ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                : 'bg-[#FAF8F5] text-[#736152] border-[#E5DDD3] hover:bg-[#F5F0EB]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>제휴 일정 (partnerDeals 원본)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSourceTab === 'PARTNER_DEALS' ? 'bg-white/20 text-white' : 'bg-[#EAE4D9] text-[#736152]'
            }`}>
              {partnerDealScheduleItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSourceTab('GENERAL_SCHEDULES')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
              activeSourceTab === 'GENERAL_SCHEDULES'
                ? 'bg-[#736152] text-white border-[#5C4E43] shadow-xs'
                : 'bg-[#FAF8F5] text-[#736152] border-[#E5DDD3] hover:bg-[#F5F0EB]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>개인 / 일반 일정 (schedules)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSourceTab === 'GENERAL_SCHEDULES' ? 'bg-white/20 text-white' : 'bg-[#EAE4D9] text-[#736152]'
            }`}>
              {generalScheduleItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Schedule List View */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-[#8C7A6B] animate-pulse">
          일정 및 제휴 파이프라인 데이터를 불러오는 중입니다...
        </div>
      ) : sortedSchedules.length === 0 ? (
        <div className="py-10 text-center bg-[#FAF8F5] border border-dashed border-[#D4C8B8] rounded-xl space-y-3">
          <Calendar className="w-8 h-8 text-[#8C7A6B] mx-auto opacity-50" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#2C2C2C]">
              {activeSourceTab === 'PARTNER_DEALS'
                ? '제휴 진행관리(partnerDeals)에 예정된 다음 액션이 없습니다.'
                : '등록된 개인/일반 일정이 없습니다.'}
            </p>
            <p className="text-xs text-[#8C7A6B]">
              {activeSourceTab === 'PARTNER_DEALS'
                ? '제휴 진행관리에서 다음 액션/예정일을 등록하면 Dashboard에 실시간 연동됩니다.'
                : '+ 일정 추가 버튼을 눌러 업무 일정을 생성하세요.'}
            </p>
          </div>
          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1 px-3.5 py-2 bg-white border border-[#D4C8B8] text-[#736152] text-xs font-bold rounded-lg hover:border-[#736152] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeSourceTab === 'PARTNER_DEALS' ? '제휴 일정 생성하기' : '일반 일정 생성하기'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSchedules.slice(0, compactMode ? 4 : 10).map((item) => {
            const isCompleted = isCompletedStatus(item.status);
            const isOverdue = item.date < todayStr && !isCompleted;
            const isToday = item.date === todayStr;
            const badgeStyle = STAGE_BADGE_STYLE[item.status] || STAGE_BADGE_STYLE['예정'];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isOverdue
                    ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                    : isToday && !isCompleted
                    ? 'bg-[#FAF8F5] border-[#736152] shadow-xs'
                    : 'bg-white border-[#E5DDD3] hover:border-[#D4C8B8]'
                }`}
              >
                {/* Left Info Column */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Today / Overdue Badge / Date Column */}
                  <div className={`flex flex-col items-center justify-center bg-white border rounded-lg p-2 min-w-[85px] shrink-0 text-center ${
                    isOverdue ? 'border-rose-300 bg-rose-50/50' : 'border-[#E5DDD3]'
                  }`}>
                    {isOverdue && (
                      <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-extrabold rounded-md mb-1 animate-pulse flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" />
                        지연 / 후속 필요
                      </span>
                    )}
                    {isToday && !isCompleted && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-md mb-1 animate-pulse">
                        TODAY
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold rounded-md mb-1">
                        완료
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#2C2C2C] font-mono">
                      {item.date}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8C7A6B] font-mono">
                      {item.time || '14:00'}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-md border bg-rose-100 text-rose-800 border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          지연 / 후속 필요
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                      >
                        {item.status}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#2C2C2C] truncate">
                        {item.title}
                      </h3>
                      {item.isPartnerDeal && (
                        <span className="px-1.5 py-0.5 bg-[#F5F0EB] text-[#736152] text-[10px] font-bold rounded-md border border-[#D4C8B8]">
                          partnerDeals 원본
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#736152]">
                      <span className="flex items-center gap-1 font-semibold text-[#2C2C2C]">
                        <Building2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                        {item.company}
                        {item.projectName && <span className="text-[#8C7A6B] font-normal">({item.projectName})</span>}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8C7A6B]" />
                          {item.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#8C7A6B]" />
                        담당: <strong className="text-[#2C2C2C]">{item.assignee}</strong>
                      </span>
                    </div>

                    {item.memo && (
                      <p className="text-xs text-[#8C7A6B] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#E5DDD3] inline-block max-w-full truncate">
                        {item.memo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5DDD3] shrink-0">
                  {/* Inline Stage/Status Selector */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusToggle(item, e.target.value)}
                    className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border cursor-pointer ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                  >
                    {item.isPartnerDeal
                      ? PARTNER_DEAL_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))
                      : SCHEDULE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddModal(item)}
                      className="p-1.5 text-[#736152] hover:bg-[#F5F0EB] rounded-lg transition-colors cursor-pointer"
                      title="일정 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(item)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="일정 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {compactMode && sortedSchedules.length > 4 && (
            <button
              onClick={() => setIsFullViewModalOpen(true)}
              className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#F5F0EB] border border-[#D4C8B8] text-[#736152] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>전체 일정 보기 ({sortedSchedules.length}건)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT SCHEDULE MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#736152]" />
                  {editingItem
                    ? activeSourceTab === 'PARTNER_DEALS'
                      ? '제휴 진행 일정 수정 (partnerDeals)'
                      : '일반 일정 수정'
                    : activeSourceTab === 'PARTNER_DEALS'
                    ? '신규 제휴 일정 등록 (partnerDeals 원본 저장)'
                    : '신규 일반 일정 등록'}
                </h3>
                <p className="text-[11px] text-[#736152]">
                  {activeSourceTab === 'PARTNER_DEALS'
                    ? '✦ 등록/수정 시 제휴 진행관리(partnerDeals)에 실시간 원본 업데이트됩니다.'
                    : '✦ 일반/내부 업무 일정(schedules)으로 저장됩니다.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Row 1: Company & Project */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">업체명 *</label>
                  <input
                    type="text"
                    placeholder="예: Garmin / 르무통"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs focus:outline-none focus:border-[#736152]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">프로젝트/브랜드명</label>
                  <input
                    type="text"
                    placeholder="예: 윈터 하프 마라톤"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value, projectName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              {/* Row 2: Next Action Title */}
              <div>
                <label className="block font-bold text-[#2C2C2C] mb-1">일정 / 다음 액션 내용 *</label>
                <input
                  type="text"
                  placeholder="예: 온러닝 트레일러닝 부스 팝업 현장 실사 및 미팅"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs focus:outline-none focus:border-[#736152]"
                  required
                />
              </div>

              {/* Row 3: Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">다음 예정일 (날짜) *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-mono text-xs focus:outline-none focus:border-[#736152]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">시간 (HH:mm)</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-mono text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              {/* Row 4: Location & Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">장소</label>
                  <input
                    type="text"
                    placeholder="예: 성문안 클럽하우스"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#2C2C2C]">담당자</label>
                    <button
                      type="button"
                      onClick={handleSetMyAssignee}
                      className="text-[10px] text-[#736152] font-bold underline cursor-pointer hover:text-[#2C2C2C]"
                    >
                      내가 담당
                    </button>
                  </div>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs font-bold text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  >
                    {OFFICIAL_MANAGERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Stage / Status & Memo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">진행 단계</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs font-bold text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
                  >
                    {activeSourceTab === 'PARTNER_DEALS'
                      ? PARTNER_DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))
                      : SCHEDULE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2C2C2C] mb-1">진행 메모 / 비고</label>
                  <input
                    type="text"
                    placeholder="참고사항"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl text-xs focus:outline-none focus:border-[#736152]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 border border-[#D4C8B8] text-[#736152] font-bold rounded-xl hover:bg-[#FAF8F5] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingItem ? '수정 완료' : '일정 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AI IMPORT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8C7A6B]" />
                <h3 className="text-base font-extrabold text-[#2C2C2C]">일정 자료 AI 분석 및 불러오기</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtab Selector */}
            <div className="grid grid-cols-3 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DDD3] text-xs font-bold text-[#736152]">
              <button
                onClick={() => {
                  setAiImportType('IMAGE');
                  setAiErrorMsg(null);
                  setIsRestrictedUrlNotice(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                  aiImportType === 'IMAGE' ? 'bg-[#736152] text-white shadow-xs' : 'hover:text-[#2C2C2C]'
                }`}
              >
                📷 캘린더 캡처
              </button>
              <button
                onClick={() => {
                  setAiImportType('FILE');
                  setAiErrorMsg(null);
                  setIsRestrictedUrlNotice(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                  aiImportType === 'FILE' ? 'bg-[#736152] text-white shadow-xs' : 'hover:text-[#2C2C2C]'
                }`}
              >
                📄 Excel / PDF
              </button>
              <button
                onClick={() => {
                  setAiImportType('URL');
                  setAiErrorMsg(null);
                  setIsRestrictedUrlNotice(false);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer text-center ${
                  aiImportType === 'URL' ? 'bg-[#736152] text-white shadow-xs' : 'hover:text-[#2C2C2C]'
                }`}
              >
                🔗 일정 링크 URL
              </button>
            </div>

            {/* Input Form based on Subtab */}
            <div className="space-y-4 text-xs">
              {aiImportType === 'IMAGE' && (
                <div className="space-y-2">
                  <label className="block font-bold text-[#2C2C2C]">
                    캘린더 화면 캡처 또는 일정 이미지 파일 업로드
                  </label>
                  <div className="border-2 border-dashed border-[#D4C8B8] rounded-2xl p-6 text-center hover:border-[#736152] bg-[#FAF8F5] transition-all">
                    <Upload className="w-8 h-8 text-[#8C7A6B] mx-auto mb-2" />
                    <p className="font-bold text-[#2C2C2C]">이미지 파일 선택 (PNG, JPG, WebP)</p>
                    <p className="text-[11px] text-[#8C7A6B] mt-1">
                      캘린더 앱 / 모바일 일정 화면 캡처본을 올려주시면 AI가 날짜, 시간, 파트너, 장소를 추출합니다.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      className="mt-3 text-xs cursor-pointer block mx-auto text-[#736152]"
                    />
                  </div>
                </div>
              )}

              {aiImportType === 'FILE' && (
                <div className="space-y-2">
                  <label className="block font-bold text-[#2C2C2C]">
                    일정표 Excel / XLSX / CSV / PDF 파일 업로드
                  </label>
                  <div className="border-2 border-dashed border-[#D4C8B8] rounded-2xl p-6 text-center hover:border-[#736152] bg-[#FAF8F5] transition-all">
                    <FileText className="w-8 h-8 text-[#8C7A6B] mx-auto mb-2" />
                    <p className="font-bold text-[#2C2C2C]">문서 파일 선택 (.xlsx, .csv, .pdf)</p>
                    <p className="text-[11px] text-[#8C7A6B] mt-1">
                      행사 일정표, 파트너십 추진 리스트, 월간 마케팅 캘린더 문서를 분석합니다.
                    </p>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv, .pdf, .txt"
                      onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                      className="mt-3 text-xs cursor-pointer block mx-auto text-[#736152]"
                    />
                  </div>
                </div>
              )}

              {aiImportType === 'URL' && (
                <div className="space-y-2">
                  <label className="block font-bold text-[#2C2C2C]">공개 일정 페이지 URL 붙여넣기</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/event-schedule"
                      value={aiUrl}
                      onChange={(e) => setAiUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xl font-mono text-xs focus:outline-none focus:border-[#736152]"
                    />
                  </div>
                </div>
              )}

              {isRestrictedUrlNotice && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>접근이 제한된 링크입니다.</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-5">
                    해당 화면을 캡처하여 '캘린더 캡처' 탭에서 이미지로 업로드 해주세요.
                  </p>
                </div>
              )}

              {aiErrorMsg && !isRestrictedUrlNotice && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{aiErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-xl hover:bg-[#FAF8F5] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={aiAnalyzing}
                className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiAnalyzing ? 'animate-spin' : ''}`} />
                <span>{aiAnalyzing ? 'AI 일정 분석 중...' : 'AI 일정 분석 실행'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VERIFY & EDIT EXTRACTED SCHEDULES MODAL */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-extrabold text-[#2C2C2C]">
                    추출 일정 검토 ({candidates.length}건)
                  </h3>
                </div>
                <p className="text-xs text-[#736152]">
                  저장 대상 선택: <strong>{activeSourceTab === 'PARTNER_DEALS' ? '제휴 진행관리 (partnerDeals 원본)' : '개인/일반 일정 (schedules)'}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidates List */}
            <div className="overflow-y-auto py-4 space-y-4 flex-1 my-2 pr-1">
              {candidates.map((cand, index) => (
                <div
                  key={cand.id}
                  className="p-4 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5DDD3] pb-2">
                    <span className="font-extrabold text-xs text-[#2C2C2C]">
                      #{index + 1} {cand.company} - {cand.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(cand.id)}
                      className="text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 삭제
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#736152] mb-1">날짜</label>
                      <input
                        type="date"
                        value={cand.date}
                        onChange={(e) => handleCandidateChange(cand.id, 'date', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#736152] mb-1">시간</label>
                      <input
                        type="time"
                        value={cand.time}
                        onChange={(e) => handleCandidateChange(cand.id, 'time', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-lg font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#736152] mb-1">담당자</label>
                      <input
                        type="text"
                        value={cand.assignee}
                        onChange={(e) => handleCandidateChange(cand.id, 'assignee', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#D4C8B8] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5DDD3] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#8C7A6B]">
                저장 건수: <strong>{candidates.length}건</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-4 py-2 border border-[#D4C8B8] text-[#736152] font-bold text-xs rounded-xl hover:bg-[#FAF8F5] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveVerifiedBatch}
                  disabled={isSavingBatch || candidates.length === 0}
                  className="px-6 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isSavingBatch ? '저장 중...' : '확인한 일정 저장'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL SCHEDULE LIST MODAL */}
      {isFullViewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#D4C8B8] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3 shrink-0">
              <h3 className="text-base font-extrabold text-[#2C2C2C] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#736152]" />
                전체 일정 목록 ({sortedSchedules.length}건)
              </h3>
              <button
                onClick={() => setIsFullViewModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              {sortedSchedules.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#2C2C2C] shrink-0">
                      {item.date} {item.time}
                    </span>
                    <span className="font-extrabold text-[#2C2C2C]">{item.title}</span>
                    <span className="text-[#8C7A6B]">({item.company})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#736152]">담당: {item.assignee}</span>
                    <span className="px-2 py-0.5 font-extrabold rounded-md border bg-amber-50 text-amber-800 border-amber-200">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E5DDD3] flex justify-end shrink-0">
              <button
                onClick={() => setIsFullViewModalOpen(false)}
                className="px-5 py-2 bg-[#736152] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
