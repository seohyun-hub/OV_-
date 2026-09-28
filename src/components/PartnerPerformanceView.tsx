import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Sparkles,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  Search,
  FileText,
  X,
  PieChart as PieChartIcon,
  Layers,
  ArrowRight,
  Handshake,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import * as XLSX from 'xlsx';
import {
  PartnerPerformanceActivity,
  MonthlyPerformanceKPI,
  PartnerActivityType,
  PartnerStageType,
  PartnershipKind,
  OFFICIAL_MANAGERS,
} from '../types';

interface PartnerPerformanceViewProps {
  onNavigateToPipeline?: () => void;
}

const ACTIVITY_TYPES: PartnerActivityType[] = [
  '신규 컨택',
  '제안 발송',
  '미팅',
  '행사 실행',
  '계약 체결',
  '기타',
];

const STAGES: PartnerStageType[] = [
  '컨택중',
  '제안',
  '미팅',
  '협상',
  '진행확정',
  '완료',
  '보류/드롭',
];

const PARTNERSHIP_KINDS: PartnershipKind[] = [
  '현금 협찬',
  '현물 협찬',
  '공동 마케팅',
  '장소 대관',
  '티켓/샘플링',
  '기타',
];

const MANAGER_OPTIONS = ['전체', '박서현', '전시현', '신현연'];

const COLORS = ['#736152', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const PartnerPerformanceView: React.FC<PartnerPerformanceViewProps> = ({
  onNavigateToPipeline,
}) => {
  const [activities, setActivities] = useState<PartnerPerformanceActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & AI State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<PartnerPerformanceActivity | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [syncingDeals, setSyncingDeals] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    activityDate: new Date().toISOString().split('T')[0],
    partnerName: '',
    activityType: '신규 컨택' as PartnerActivityType,
    assignee: '박서현',
    stage: '컨택중' as PartnerStageType,
    partnershipType: '현금 협찬' as PartnershipKind,
    cashAmount: 0,
    inKindValue: 0,
    details: '',
  });

  // Load activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/partner-performance/activities?year=${selectedYear}&month=${selectedMonth}&assignee=${encodeURIComponent(
          selectedAssignee
        )}`
      );
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
        window.dispatchEvent(new CustomEvent('oakvalley_data_updated'));
      }
    } catch (err) {
      console.error('Failed to load partner performance activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedYear, selectedMonth, selectedAssignee]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Sync deals from partner pipeline
  const handleSyncDeals = async () => {
    setSyncingDeals(true);
    try {
      const res = await fetch('/api/partner-performance/sync-deals', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
        showFeedback('success', data.message || `${data.addedCount}건의 진행관리 데이터가 불러와졌습니다.`);
      } else {
        showFeedback('error', data.error || '진행관리 불러오기에 실패했습니다.');
      }
    } catch (err) {
      showFeedback('error', '서버 통신 오류가 발생했습니다.');
    } finally {
      setSyncingDeals(false);
    }
  };

  // KPI Calculation for current filtered view
  const currentKPI: MonthlyPerformanceKPI = useMemo(() => {
    const targetYearStr = String(selectedYear);
    const targetMonthStr = String(selectedMonth).padStart(2, '0');

    const filtered = activities.filter((a) => {
      if (!a.activityDate) return false;
      const [y, m] = a.activityDate.split('-');
      if (y !== targetYearStr || m !== targetMonthStr) return false;
      if (selectedAssignee !== '전체' && a.assignee !== selectedAssignee) return false;
      return true;
    });

    let newContactsCount = 0;
    let proposalsSentCount = 0;
    let meetingsCount = 0;
    let confirmedCount = 0;
    let completedCount = 0;
    let cashAmountTotal = 0;
    let inKindValueTotal = 0;

    filtered.forEach((a) => {
      if (a.activityType === '신규 컨택' || a.stage === '컨택중') newContactsCount += 1;
      if (a.activityType === '제안 발송' || a.stage === '제안') proposalsSentCount += 1;
      if (a.activityType === '미팅' || a.stage === '미팅') meetingsCount += 1;
      if (a.stage === '진행확정') confirmedCount += 1;
      if (a.stage === '완료' || a.activityType === '행사 실행') completedCount += 1;

      cashAmountTotal += Number(a.cashAmount || 0);
      inKindValueTotal += Number(a.inKindValue || a.inKindListPrice || 0);
    });

    return {
      newContactsCount,
      proposalsSentCount,
      meetingsCount,
      confirmedCount,
      completedCount,
      cashAmountTotal,
      inKindValueTotal,
      totalPartnershipValue: cashAmountTotal + inKindValueTotal,
    };
  }, [activities, selectedYear, selectedMonth, selectedAssignee]);

  // Monthly trend chart data (Jan~Dec for selected year)
  const monthlyTrendData = useMemo(() => {
    const yearStr = String(selectedYear);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return months.map((m) => {
      const monthStr = String(m).padStart(2, '0');
      const monthActivities = activities.filter((a) => {
        if (!a.activityDate) return false;
        const [y, mon] = a.activityDate.split('-');
        if (y !== yearStr || mon !== monthStr) return false;
        if (selectedAssignee !== '전체' && a.assignee !== selectedAssignee) return false;
        return true;
      });

      let cash = 0;
      let inKind = 0;
      monthActivities.forEach((a) => {
        cash += Number(a.cashAmount || 0);
        inKind += Number(a.inKindValue || 0);
      });

      return {
        month: `${m}월`,
        activityCount: monthActivities.length,
        cashValue: cash / 10000, // 만원 단위
        inKindValue: inKind / 10000,
        totalValue: (cash + inKind) / 10000,
      };
    });
  }, [activities, selectedYear, selectedAssignee]);

  // Stage Funnel data for current month
  const funnelData = useMemo(() => {
    const targetYearStr = String(selectedYear);
    const targetMonthStr = String(selectedMonth).padStart(2, '0');

    const filtered = activities.filter((a) => {
      if (!a.activityDate) return false;
      const [y, m] = a.activityDate.split('-');
      if (y !== targetYearStr || m !== targetMonthStr) return false;
      if (selectedAssignee !== '전체' && a.assignee !== selectedAssignee) return false;
      return true;
    });

    const counts = {
      컨택: 0,
      제안: 0,
      미팅: 0,
      진행확정: 0,
      완료: 0,
    };

    filtered.forEach((a) => {
      if (a.stage === '컨택중' || a.activityType === '신규 컨택') counts.컨택 += 1;
      if (a.stage === '제안' || a.activityType === '제안 발송') counts.제안 += 1;
      if (a.stage === '미팅' || a.activityType === '미팅') counts.미팅 += 1;
      if (a.stage === '진행확정') counts.진행확정 += 1;
      if (a.stage === '완료' || a.activityType === '행사 실행') counts.완료 += 1;
    });

    return [
      { name: '1. 컨택중', count: counts.컨택, fill: '#8C7A6B' },
      { name: '2. 제안발송', count: counts.제안, fill: '#3B82F6' },
      { name: '3. 미팅진행', count: counts.미팅, fill: '#F59E0B' },
      { name: '4. 진행확정', count: counts.진행확정, fill: '#10B981' },
      { name: '5. 최종완료', count: counts.완료, fill: '#736152' },
    ];
  }, [activities, selectedYear, selectedMonth, selectedAssignee]);

  // Partnership Type breakdown
  const partnershipTypeData = useMemo(() => {
    const targetYearStr = String(selectedYear);
    const targetMonthStr = String(selectedMonth).padStart(2, '0');

    const filtered = activities.filter((a) => {
      if (!a.activityDate) return false;
      const [y, m] = a.activityDate.split('-');
      if (y !== targetYearStr || m !== targetMonthStr) return false;
      if (selectedAssignee !== '전체' && a.assignee !== selectedAssignee) return false;
      return true;
    });

    const typeMap: Record<string, { count: number; value: number }> = {};
    PARTNERSHIP_KINDS.forEach((k) => {
      typeMap[k] = { count: 0, value: 0 };
    });

    filtered.forEach((a) => {
      const kind = a.partnershipType || '기타';
      if (!typeMap[kind]) typeMap[kind] = { count: 0, value: 0 };
      typeMap[kind].count += 1;
      typeMap[kind].value += Number(a.cashAmount || 0) + Number(a.inKindValue || 0);
    });

    return Object.entries(typeMap).map(([name, stat]) => ({
      name,
      count: stat.count,
      value: stat.value / 10000, // 만원 단위
    }));
  }, [activities, selectedYear, selectedMonth, selectedAssignee]);

  // Filtered Activity List for Table
  const filteredActivities = useMemo(() => {
    const targetYearStr = String(selectedYear);
    const targetMonthStr = String(selectedMonth).padStart(2, '0');

    return activities.filter((a) => {
      if (a.activityDate) {
        const [y, m] = a.activityDate.split('-');
        if (y !== targetYearStr || m !== targetMonthStr) return false;
      }
      if (selectedAssignee !== '전체' && a.assignee !== selectedAssignee) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = a.partnerName?.toLowerCase().includes(q);
        const matchType = a.activityType?.toLowerCase().includes(q);
        const matchKind = a.partnershipType?.toLowerCase().includes(q);
        const matchAssignee = a.assignee?.toLowerCase().includes(q);
        const matchDetails = a.details?.toLowerCase().includes(q);
        return matchName || matchType || matchKind || matchAssignee || matchDetails;
      }

      return true;
    });
  }, [activities, selectedYear, selectedMonth, selectedAssignee, searchQuery]);

  // Modal open helpers
  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormData({
      activityDate: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
        new Date().getDate()
      ).padStart(2, '0')}`,
      partnerName: '',
      activityType: '신규 컨택',
      assignee: selectedAssignee !== '전체' ? selectedAssignee : '박서현',
      stage: '컨택중',
      partnershipType: '현금 협찬',
      cashAmount: 0,
      inKindValue: 0,
      details: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: PartnerPerformanceActivity) => {
    setEditingActivity(act);
    setFormData({
      activityDate: act.activityDate || '',
      partnerName: act.partnerName || '',
      activityType: act.activityType || '신규 컨택',
      assignee: act.assignee || '박서현',
      stage: act.stage || '컨택중',
      partnershipType: act.partnershipType || '현금 협찬',
      cashAmount: act.cashAmount || 0,
      inKindValue: act.inKindValue || 0,
      details: act.details || '',
    });
    setIsModalOpen(true);
  };

  // Submit Activity Add/Edit
  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partnerName.trim()) {
      showFeedback('error', '제휴사/브랜드명을 입력해주세요.');
      return;
    }

    try {
      let res;
      if (editingActivity) {
        res = await fetch(`/api/partner-performance/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/partner-performance/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
        setIsModalOpen(false);
        showFeedback('success', data.message || '저장되었습니다.');
      } else {
        showFeedback('error', data.error || '저장 실패');
      }
    } catch (err) {
      showFeedback('error', '서버 통신 오류가 발생했습니다.');
    }
  };

  // Delete Activity
  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('해당 제휴 Activity를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/partner-performance/activities/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
        showFeedback('success', 'Activity가 삭제되었습니다.');
      } else {
        showFeedback('error', data.error || '삭제 실패');
      }
    } catch (err) {
      showFeedback('error', '서버 통신 오류가 발생했습니다.');
    }
  };

  // Generate AI Executive Summary
  const handleGenerateAiSummary = async () => {
    setIsAiLoading(true);
    setShowAiModal(true);
    try {
      const res = await fetch('/api/partner-performance/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          assignee: selectedAssignee,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSummary(data.summary);
      } else {
        showFeedback('error', data.error || 'AI 성과 요약 생성 실패');
      }
    } catch (err) {
      showFeedback('error', 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      // Sheet 1: KPI Summary
      const kpiRows = [
        { KPI: '조회 연도', Value: `${selectedYear}년` },
        { KPI: '조회 월', Value: `${selectedMonth}월` },
        { KPI: '담당자', Value: selectedAssignee },
        { KPI: '신규 컨택 수', Value: `${currentKPI.newContactsCount}건` },
        { KPI: '제안 발송 건수', Value: `${currentKPI.proposalsSentCount}건` },
        { KPI: '미팅 진행 건수', Value: `${currentKPI.meetingsCount}건` },
        { KPI: '진행 확정 건수', Value: `${currentKPI.confirmedCount}건` },
        { KPI: '완료 프로젝트 수', Value: `${currentKPI.completedCount}건` },
        { KPI: '현금 유치 금액', Value: `${currentKPI.cashAmountTotal.toLocaleString()}원` },
        { KPI: '현물 협찬 가치', Value: `${currentKPI.inKindValueTotal.toLocaleString()}원` },
        { KPI: '총 제휴 가치', Value: `${currentKPI.totalPartnershipValue.toLocaleString()}원` },
      ];

      // Sheet 2: Activity List
      const actRows = filteredActivities.map((a, idx) => ({
        No: idx + 1,
        활동일자: a.activityDate,
        '제휴사/브랜드': a.partnerName,
        활동유형: a.activityType,
        진행단계: a.stage,
        제휴유형: a.partnershipType,
        담당자: a.assignee,
        '현금 유치금액(원)': a.cashAmount || 0,
        '현물 협찬가치(원)': a.inKindValue || 0,
        '총 제휴가치(원)': (a.cashAmount || 0) + (a.inKindValue || 0),
        '비고/내용': a.details || '',
      }));

      const wb = XLSX.utils.book_new();
      const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
      const wsAct = XLSX.utils.json_to_sheet(actRows);

      XLSX.utils.book_append_sheet(wb, wsKpi, '월별 KPI 요약');
      XLSX.utils.book_append_sheet(wb, wsAct, 'Activity 상세 목록');

      const filename = `OakValley_제휴성과_${selectedYear}년_${selectedMonth}월_${selectedAssignee}.xlsx`;
      XLSX.writeFile(wb, filename);
      showFeedback('success', `${filename} 엑셀 파일이 다운로드되었습니다.`);
    } catch (err) {
      console.error('Excel Export error:', err);
      showFeedback('error', '엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-md shadow-lg flex items-center space-x-2 text-sm font-medium transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-[#10B981] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* HEADER & FILTERS */}
      <div className="bg-white rounded-lg border border-[#E8E4DC] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#F0ECE1] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#736152]" />
              <h1 className="text-xl font-bold text-[#2C2C2C] tracking-tight">
                제휴 Activity & 성과관리 Dashboard
              </h1>
            </div>
            <p className="text-xs text-[#736152] mt-1 font-medium">
              IPARK RESORT (오크밸리·파크로쉬) 제휴 파트의 월별 활동량, 진행 단계, 유치 성과 및 경제적 가치를 실시간 기록·집계합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-sync-deals"
              onClick={handleSyncDeals}
              disabled={syncingDeals}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#F5F2EB] hover:bg-[#EAE4D8] text-[#5C4E43] text-xs font-semibold rounded-md border border-[#D4C8B8] transition-colors cursor-pointer"
              title="제휴 진행관리 파이프라인 데이터 자동 동기화"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingDeals ? 'animate-spin' : ''}`} />
              <span>{syncingDeals ? '불러오는 중...' : '진행관리 불러오기'}</span>
            </button>

            <button
              id="btn-[#btn-add-activity]"
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Activity 등록</span>
            </button>

            <button
              id="btn-ai-summary"
              onClick={handleGenerateAiSummary}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#2C2C2C] hover:bg-black text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI 월간 성과 요약</span>
            </button>

            <button
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel 다운로드</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-md border border-[#EFECE6]">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#736152]" />
              <span className="font-semibold text-[#5C4E43]">조회 조건:</span>
            </div>

            {/* Year Select */}
            <div className="flex items-center space-x-1">
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-white border border-[#D4C8B8] rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#736152]"
              >
                <option value={2026}>2026년</option>
                <option value={2025}>2025년</option>
              </select>
            </div>

            {/* Month Select */}
            <div className="flex items-center space-x-1">
              <select
                id="filter-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-white border border-[#D4C8B8] rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#736152]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Select */}
            <div className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-[#736152] ml-2" />
              <span className="font-semibold text-[#5C4E43]">담당자:</span>
              <select
                id="filter-assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="bg-white border border-[#D4C8B8] rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#2C2C2C] focus:outline-none focus:ring-1 focus:ring-[#736152]"
              >
                {MANAGER_OPTIONS.map((mgr) => (
                  <option key={mgr} value={mgr}>
                    {mgr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-[#8C7A6B] font-mono">
            선택 기간 Activity 총 <span className="font-bold text-[#736152]">{filteredActivities.length}</span>건
          </div>
        </div>
      </div>

      {/* KPI CARDS GRID (월별 KPI 자동 집계) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>신규 컨택</span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-black text-[#2C2C2C] font-mono">
            {currentKPI.newContactsCount} <span className="text-xs font-normal text-gray-500">건</span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">발굴 및 최초 접근 업체</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>제안 발송</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-black text-[#2C2C2C] font-mono">
            {currentKPI.proposalsSentCount} <span className="text-xs font-normal text-gray-500">건</span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">공식 제안서/조건서 전달</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>미팅 진행</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#2C2C2C] font-mono">
            {currentKPI.meetingsCount} <span className="text-xs font-normal text-gray-500">건</span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">대면/대관 현장 답사 포함</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>진행 확정 / 완료</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {currentKPI.confirmedCount + currentKPI.completedCount}{' '}
            <span className="text-xs font-normal text-gray-500">
              (확정 {currentKPI.confirmedCount} / 완료 {currentKPI.completedCount})
            </span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">계약체결 및 행사 성료 건</div>
        </div>

        {/* FINANCIAL KPI CARDS */}
        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>현금 유치 금액</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-900 font-mono">
            {currentKPI.cashAmountTotal.toLocaleString()} <span className="text-xs font-normal text-gray-500">원</span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">스폰서십 & 대관 수익</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-1">
          <div className="text-[11px] font-semibold text-[#8C7A6B] flex items-center justify-between">
            <span>현물 협찬 가치</span>
            <Package className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-900 font-mono">
            {currentKPI.inKindValueTotal.toLocaleString()} <span className="text-xs font-normal text-gray-500">원</span>
          </div>
          <div className="text-[10px] text-[#8C7A6B]">물품/바터 시가 가치</div>
        </div>

        <div className="col-span-2 bg-[#FAF7F2] p-4 rounded-lg border border-[#D4C8B8] shadow-2xs space-y-1">
          <div className="text-[11px] font-bold text-[#736152] flex items-center justify-between uppercase tracking-wider">
            <span>총 제휴 가치 (현금 + 현물)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#736152] text-white rounded-full font-semibold">
              TOTAL KPI
            </span>
          </div>
          <div className="text-2xl font-black text-[#736152] font-mono">
            {currentKPI.totalPartnershipValue.toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#5C4E43]">원</span>
          </div>
          <div className="text-[11px] text-[#736152] font-medium">
            {selectedYear}년 {selectedMonth}월 ({selectedAssignee}) 기준 경제적 창출 가치 총계
          </div>
        </div>
      </div>

      {/* CHARTS GRID (월별 Activity, 현금/현물 가치, Funnel, 제휴 유형별) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: 월별 Activity 건수 추이 */}
        <div className="bg-white p-5 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#736152]" />
              <span>{selectedYear}년 월별 Activity 건수 추이</span>
            </h3>
            <span className="text-[11px] text-[#8C7A6B]">단위: 건</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE1" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#736152' }} />
                <YAxis tick={{ fontSize: 11, fill: '#736152' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#D4C8B8', borderRadius: '6px' }}
                  formatter={(value: any) => [`${value}건`, '활동 건수']}
                />
                <Bar dataKey="activityCount" fill="#736152" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: 현금 / 현물 제휴가치 추이 */}
        <div className="bg-white p-5 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>{selectedYear}년 현금 vs 현물 제휴가치 추이</span>
            </h3>
            <span className="text-[11px] text-[#8C7A6B]">단위: 만원</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0ECE1" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#736152' }} />
                <YAxis tick={{ fontSize: 11, fill: '#736152' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#D4C8B8', borderRadius: '6px' }}
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()}만원`,
                    name === 'cashValue' ? '현금 유치' : '현물 가치',
                  ]}
                />
                <Legend tick={{ fontSize: 11 }} />
                <Bar dataKey="cashValue" name="현금 유치" stackId="a" fill="#3B82F6" />
                <Bar dataKey="inKindValue" name="현물 가치" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: 제휴 진행 Funnel (단계별 건수) */}
        <div className="bg-white p-5 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#736152]" />
              <span>{selectedMonth}월 제휴 진행 Funnel 분석</span>
            </h3>
            <span className="text-[11px] text-[#8C7A6B]">단계별 전환 현황</span>
          </div>
          <div className="space-y-3 pt-2">
            {funnelData.map((item, idx) => {
              const maxCount = Math.max(...funnelData.map((d) => d.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#2C2C2C]">{item.name}</span>
                    <span className="font-bold font-mono text-[#736152]">{item.count}건</span>
                  </div>
                  <div className="w-full bg-[#F5F2EB] h-5 rounded-xs overflow-hidden flex items-center">
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end px-2"
                      style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: item.fill }}
                    >
                      {pct > 15 && <span className="text-[10px] text-white font-bold">{pct}%</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: 제휴 유형별 성과 (비중) */}
        <div className="bg-white p-5 rounded-lg border border-[#E8E4DC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              <span>{selectedMonth}월 제휴 유형별 성과 비중</span>
            </h3>
            <span className="text-[11px] text-[#8C7A6B]">단위: 건수 및 가치</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {partnershipTypeData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={partnershipTypeData.filter((d) => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, count }) => `${name} (${count}건)`}
                  >
                    {partnershipTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#D4C8B8', borderRadius: '6px' }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}건 (가치: ${item.payload.value.toLocaleString()}만원)`,
                      item.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#8C7A6B] italic">해당 월 등록된 유형별 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVITY TABLE SECTION */}
      <div className="bg-white rounded-lg border border-[#E8E4DC] shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
              <Handshake className="w-4 h-4 text-[#736152]" />
              <span>월별 Activity 상세 기록 ({filteredActivities.length}건)</span>
            </h3>
            <p className="text-xs text-[#8C7A6B]">
              {selectedYear}년 {selectedMonth}월 ({selectedAssignee}) 검색 조건에 해당하는 제휴활동 목록입니다.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C7A6B]" />
            <input
              type="text"
              placeholder="제휴사, 담당자, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border border-[#EFECE6] rounded-md">
          <table className="w-full text-left text-xs text-[#2C2C2C]">
            <thead className="bg-[#FAF7F2] border-b border-[#E8E4DC] text-[11px] font-semibold text-[#736152] uppercase">
              <tr>
                <th className="py-2.5 px-3">일자</th>
                <th className="py-2.5 px-3">제휴사 / 브랜드</th>
                <th className="py-2.5 px-3">활동 유형</th>
                <th className="py-2.5 px-3">진행 단계</th>
                <th className="py-2.5 px-3">제휴 유형</th>
                <th className="py-2.5 px-3">담당자</th>
                <th className="py-2.5 px-3 text-right">현금 가치</th>
                <th className="py-2.5 px-3 text-right">현물 가치</th>
                <th className="py-2.5 px-3">비고 / 내용</th>
                <th className="py-2.5 px-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#8C7A6B]">
                    데이터를 로딩 중입니다...
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#8C7A6B] space-y-2">
                    <div>선택 조건에 해당하는 제휴 Activity 기록이 없습니다.</div>
                    <button
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#736152] text-white text-xs font-medium rounded-md hover:bg-[#5C4E43] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>신규 Activity 추가하기</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5C4E43] whitespace-nowrap">
                      {act.activityDate}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#2C2C2C] whitespace-nowrap">
                      {act.partnerName}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-medium bg-[#F5F2EB] text-[#736152] border border-[#E8E4DC]">
                        {act.activityType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                          act.stage === '진행확정'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : act.stage === '완료'
                            ? 'bg-slate-200 text-slate-800'
                            : act.stage === '보류/드롭'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {act.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#5C4E43] whitespace-nowrap">{act.partnershipType}</td>
                    <td className="py-2.5 px-3 font-medium text-[#2C2C2C] whitespace-nowrap">{act.assignee}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-blue-900 whitespace-nowrap">
                      {act.cashAmount ? `${act.cashAmount.toLocaleString()}원` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-900 whitespace-nowrap">
                      {act.inKindValue ? `${act.inKindValue.toLocaleString()}원` : '-'}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-[#5C4E43]" title={act.details}>
                      {act.details || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(act)}
                          className="p-1 text-[#736152] hover:bg-[#EFECE6] rounded-xs transition-colors"
                          title="수정"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-xs transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT ACTIVITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D4C8B8] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#FAF7F2] px-5 py-4 border-b border-[#E8E4DC] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#736152]" />
                <span>{editingActivity ? '제휴 Activity 수정' : '신규 제휴 Activity 등록'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">활동 일자 *</label>
                  <input
                    type="date"
                    required
                    value={formData.activityDate}
                    onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">담당자 *</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  >
                    <option value="박서현">박서현</option>
                    <option value="전시현">전시현</option>
                    <option value="신현연">신현연</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">제휴사 / 브랜드명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 룰루레몬, 카카오VX, 하이트진로"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">활동 유형</label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value as PartnerActivityType })}
                    className="w-full px-2.5 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">진행 단계</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as PartnerStageType })}
                    className="w-full px-2.5 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">제휴 유형</label>
                  <select
                    value={formData.partnershipType}
                    onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value as PartnershipKind })}
                    className="w-full px-2.5 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  >
                    {PARTNERSHIP_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">현금 유치금액 (원)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.cashAmount}
                    onChange={(e) => setFormData({ ...formData, cashAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">현물 협찬가치 (원)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.inKindValue}
                    onChange={(e) => setFormData({ ...formData, inKindValue: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">비고 및 세부 내용</label>
                <textarea
                  rows={3}
                  placeholder="미팅 내용, 제안 주요 항목, 후속 조치 사항 등"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#736152]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold rounded-md shadow-2xs"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI MONTHLY SUMMARY MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#D4C8B8] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#2C2C2C] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold tracking-tight">
                  Gemini AI 경영진 월간 성과 보고서 ({selectedYear}년 {selectedMonth}월)
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="p-1 text-gray-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans text-xs">
              {isAiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#736152] animate-spin mx-auto" />
                  <div className="text-sm font-semibold text-[#2C2C2C]">
                    {selectedYear}년 {selectedMonth}월 제휴 성과 데이터를 종합 분석 중입니다...
                  </div>
                  <p className="text-xs text-[#8C7A6B]">
                    활동 건수, 컨택-확정 conversion rate, 현금/현물 유치 비율을 Gemini AI가 검토하고 있습니다.
                  </p>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  <div className="bg-[#FAF7F2] p-4 rounded-md border border-[#D4C8B8]">
                    <h4 className="font-bold text-sm text-[#736152]">{aiSummary.summaryTitle}</h4>
                  </div>

                  {/* Key Achievements */}
                  {aiSummary.keyAchievements && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-[#2C2C2C]"> 핵심 성과 하이라이트:</div>
                      <ul className="list-disc pl-5 space-y-1 text-[#5C4E43]">
                        {aiSummary.keyAchievements.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Funnel Evaluation */}
                  {aiSummary.funnelEvaluation && (
                    <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 space-y-1">
                      <div className="font-bold text-blue-900"> 파이프라인 Funnel 평가:</div>
                      <p className="text-blue-800 leading-relaxed">{aiSummary.funnelEvaluation}</p>
                    </div>
                  )}

                  {/* Financial Value Insight */}
                  {aiSummary.financialValueInsight && (
                    <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100 space-y-1">
                      <div className="font-bold text-amber-900"> 경제적 유치가치 (현금 & 현물) 분석:</div>
                      <p className="text-amber-800 leading-relaxed">{aiSummary.financialValueInsight}</p>
                    </div>
                  )}

                  {/* Actionable Advice */}
                  {aiSummary.nextMonthActionableAdvice && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-[#2C2C2C]"> 차월 실행전략 권고사항:</div>
                      <ul className="list-decimal pl-5 space-y-1 text-[#5C4E43]">
                        {aiSummary.nextMonthActionableAdvice.map((adv: string, idx: number) => (
                          <li key={idx}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">생성된 AI 성과 요약이 없습니다.</div>
              )}
            </div>

            <div className="bg-[#FAF8F5] px-5 py-3 border-t border-[#E8E4DC] flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 bg-[#736152] text-white text-xs font-bold rounded-md"
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
