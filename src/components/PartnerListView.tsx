import React, { useState, useEffect, useRef } from 'react';
import {
  ListOrdered,
  Building2,
  Calendar,
  Search,
  ArrowRight,
  Plus,
  Edit2,
  Eye,
  X,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  Clock,
  FileText,
  Building,
  UserCheck,
  Paperclip,
  Download,
  Upload,
  History,
  Tag,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FolderOpen,
  Send,
  FileSpreadsheet,
  FileCode,
  FileImage,
  Trash2,
  AlertTriangle,
  Cloud,
  CloudOff,
  Database,
  Check
} from 'lucide-react';
import {
  ActiveTab,
  AuthUser,
  OFFICIAL_MANAGERS,
  PartnerArchiveRecord,
  ProposalHistoryItem,
  ProposalAttachedFile,
  TimelineEntry,
  ArchiveProposalStatus
} from '../types';

interface PartnerListViewProps {
  currentUser?: AuthUser | null;
  onAnalyzeCompany: (name: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

const ALL_ARCHIVE_STATUSES: ArchiveProposalStatus[] = [
  '제안 준비',
  '제안 완료',
  '회신 대기',
  '미팅 예정',
  '협의 중',
  '조건 조율',
  '진행 확정',
  '완료',
  '보류',
  '무산',
  '재접촉 필요',
];

const STATUS_BADGE_STYLE: Record<ArchiveProposalStatus | string, { bg: string; text: string; border: string }> = {
  '제안 준비': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  '제안 완료': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  '회신 대기': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  '미팅 예정': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  '협의 중': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  '협의중': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  '조건 조율': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  '진행 확정': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  '진행중': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  '완료': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  '보류': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  '무산': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  '재접촉 필요': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
};

// Seed records (fallback)
const INITIAL_PARTNER_ARCHIVES: PartnerArchiveRecord[] = [
  {
    id: 'pa-1',
    companyName: '오크밸리 윈터 하프 마라톤 조직위',
    brandName: '윈터 하프 마라톤',
    industry: '스포츠·마라톤',
    internalAssignee: '박서현',
    contactPerson: '마라톤 사업국',
    contactTitle: '사무국장',
    contactPhone: '02-1234-5678',
    contactEmail: 'marathon@oakvalley.co.kr',
    currentStatus: '진행 확정',
    latestProjectName: '2026 오크밸리 윈터 하프 마라톤 메인 스폰서십',
    latestProposalDate: '2026-09-10',
    nextAction: '시설 및 안전 점검 최종 가이드 수립',
    notes: '브랜드 후원사 추가 유치 및 오크밸리 러닝코스 조율',
    proposals: [
      {
        id: 'prop-1-1',
        projectName: '2026 오크밸리 윈터 하프 마라톤 메인 스폰서십',
        proposalDate: '2026-09-10',
        proposalType: '스폰서십 & 공간대관',
        summary: '오크밸리 광장 및 러닝 코스를 활용한 동계 윈터 하프 마라톤 타이틀 제휴 패키지 제안',
        requests: '현금 후원금 3,000만원 + 리조트 객실 바터 50실',
        status: '진행 확정',
        result: '협약 체결 완료 및 코스 승인',
        files: [
          {
            id: 'file-1-1',
            fileName: '2026_Winter_Marathon_Sponsorship_Proposal_v1.pptx',
            version: 'v1.0',
            description: '윈터 마라톤 스폰서십 제안서 최종본',
            uploadDate: '2026-09-10',
            fileType: 'PPT',
            fileSizeFormatted: '12.4 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          },
          {
            id: 'file-1-2',
            fileName: '마라톤_코스안_및_안전점검표.pdf',
            version: 'v1.2',
            description: '오크밸리 슬로프 및 러닝코스 지도',
            uploadDate: '2026-09-12',
            fileType: 'PDF',
            fileSizeFormatted: '4.1 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-1-1', date: '2026-09-10', author: '박서현', content: '최초 제안서 및 코스 활용안 발송 완료' },
      { id: 'tl-1-2', date: '2026-09-12', author: '박서현', content: '스폰서십 패키지 최종 확정 및 유관 부서(시설·운영) 현장 점검 미팅 진행 완료' }
    ]
  },
  {
    id: 'pa-2',
    companyName: 'Garmin Korea',
    brandName: 'Garmin Golf',
    industry: '골프·스포츠IT',
    internalAssignee: '전시현',
    contactPerson: '가민코리아 제휴팀',
    contactTitle: '팀장',
    contactPhone: '02-987-6543',
    contactEmail: 'golf@garmin.co.kr',
    currentStatus: '조건 조율',
    latestProjectName: 'Garmin Golf Approach 라운지 & 3D 스윙 촬영',
    latestProposalDate: '2026-09-08',
    nextAction: '촬영 대관 렌탈 계약서 상호 서명',
    notes: '골프 앰버서더 초청 행사 연계',
    proposals: [
      {
        id: 'prop-2-1',
        projectName: 'Garmin Golf Approach 라운지 & 3D 스윙 촬영',
        proposalDate: '2026-09-08',
        proposalType: '골프 팝업 & 미디어 촬영',
        summary: '성문안 CC & 오크밸리 CC 스타트하우스 내 Approach 스마트워치 팝업 및 GPS 코스 체험존',
        requests: '골프존 팝업 무상 구좌 및 가민 스마트워치 20대 바터 협찬',
        status: '조건 조율',
        result: '1차 조건 합의 및 세부 계약서 검토 중',
        files: [
          {
            id: 'file-2-1',
            fileName: 'Garmin_Approach_Golf_Lounge_Proposal_v2.pptx',
            version: 'v2.0',
            description: '클럽하우스 내 스마트 팝업존 제안서',
            uploadDate: '2026-09-08',
            fileType: 'PPT',
            fileSizeFormatted: '18.2 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          },
          {
            id: 'file-2-2',
            fileName: '성문안CC_스타트하우스_도면.pdf',
            version: 'v1.0',
            description: '부스 설치 가능 구좌 평면도',
            uploadDate: '2026-09-09',
            fileType: 'PDF',
            fileSizeFormatted: '2.8 MB',
            hasOriginalFile: false,
            storageProvider: 'none'
          }
        ]
      }
    ],
    timeline: [
      { id: 'tl-2-1', date: '2026-09-08', author: '전시현', content: 'Garmin Golf 팝업 제안서 최초 전달' },
      { id: 'tl-2-2', date: '2026-09-11', author: '전시현', content: '행사 일정 협의 및 코스 대여 조건 1차 안 확정, 현장 촬영 렌탈 조율 중' }
    ]
  }
];

export const PartnerListView: React.FC<PartnerListViewProps> = ({
  currentUser,
  onAnalyzeCompany,
  onNavigateTab,
}) => {
  // Primary State
  const [archives, setArchives] = useState<PartnerArchiveRecord[]>(() => {
    try {
      const saved = localStorage.getItem('oak_partner_archive_records_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_PARTNER_ARCHIVES;
  });

  const [storageConnected, setStorageConnected] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch archives and backend status on mount
  useEffect(() => {
    let isMounted = true;
    const loadArchives = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/partner-archives');
        const data = await res.json();
        if (isMounted && data.success) {
          if (Array.isArray(data.archives) && data.archives.length > 0) {
            setArchives(data.archives);
          }
          setStorageConnected(!!data.storageConnected);
          setFirestoreConnected(!!data.firestoreConnected);
        }
      } catch (e) {
        console.warn('Backend archives API fetch fallback:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadArchives();
    return () => { isMounted = false; };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oak_partner_archive_records_v1', JSON.stringify(archives));
    } catch (e) {}
  }, [archives]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals & Active Selections
  const [selectedPartner, setSelectedPartner] = useState<PartnerArchiveRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PartnerArchiveRecord | null>(null);
  const [filesViewerRecord, setFilesViewerRecord] = useState<PartnerArchiveRecord | null>(null);

  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [isEditPartnerModalOpen, setIsEditPartnerModalOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);

  // Pending Attached Files for New Partner Form
  interface PendingFileItem {
    id: string;
    file: File;
    fileName: string;
    fileType: string;
    version: string;
    description: string;
    fileSizeFormatted: string;
  }
  const [pendingNewFiles, setPendingNewFiles] = useState<PendingFileItem[]>([]);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // New Company Registration Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    brandName: '',
    latestProjectName: '',
    industry: '스포츠 / 액티브',
    internalAssignee: currentUser?.name || '박서현',
    contactPerson: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
    latestProposalDate: new Date().toISOString().split('T')[0],
    proposalType: '스폰서십 & 바터',
    currentStatus: '제안 준비' as ArchiveProposalStatus,
    summary: '',
    lastDiscussion: '',
    nextAction: '',
    notes: '',
  });

  // New Proposal Form State (inside Detail view)
  const [newProposal, setNewProposal] = useState<Partial<ProposalHistoryItem>>({
    projectName: '',
    proposalDate: new Date().toISOString().split('T')[0],
    proposalType: '스폰서십 & 바터',
    summary: '',
    requests: '',
    status: '제안 준비',
    result: '회신 대기 중',
  });

  // Proposal File Upload State (for existing proposal inside Detail view)
  const [targetProposalForFile, setTargetProposalForFile] = useState<string | null>(null);
  const [newFileVersion, setNewFileVersion] = useState('v1.0');
  const [newFileDesc, setNewFileDesc] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Editing existing files inside Detail view
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [editFileVersion, setEditFileVersion] = useState('');
  const [editFileDesc, setEditFileDesc] = useState('');

  // Timeline New Entry Form State
  const [newTimelineDate, setNewTimelineDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTimelineAuthor, setNewTimelineAuthor] = useState(currentUser?.name || '박서현');
  const [newTimelineContent, setNewTimelineContent] = useState('');

  const isApprovedUser = !!currentUser && currentUser.isActive;

  const maskPhone = (phone?: string) => {
    if (!phone) return '미기재';
    if (isApprovedUser) return phone;
    return '010-****-**** (로그인 필요)';
  };

  const maskEmail = (email?: string) => {
    if (!email) return '미기재';
    if (isApprovedUser) return email;
    return '***@***.*** (로그인 필요)';
  };

  // Filtered Archive List
  const filteredArchives = archives.filter((p) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.companyName.toLowerCase().includes(q) ||
      (p.brandName && p.brandName.toLowerCase().includes(q)) ||
      p.contactPerson.toLowerCase().includes(q) ||
      p.internalAssignee.toLowerCase().includes(q) ||
      (p.latestProjectName && p.latestProjectName.toLowerCase().includes(q)) ||
      p.proposals.some((pr) => pr.projectName.toLowerCase().includes(q));

    const matchesStatus = filterStatus === 'all' || p.currentStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Helper to calculate total files
  const getTotalFilesCount = (p: PartnerArchiveRecord) => {
    return p.proposals.reduce((sum, pr) => sum + (pr.files ? pr.files.length : 0), 0);
  };

  // Helper to collect all files across proposals
  const getAllFilesForRecord = (p: PartnerArchiveRecord) => {
    const all: { file: ProposalAttachedFile; projectName: string; proposalDate: string }[] = [];
    p.proposals.forEach((pr) => {
      if (pr.files && pr.files.length > 0) {
        pr.files.forEach((f) => {
          all.push({ file: f, projectName: pr.projectName, proposalDate: pr.proposalDate });
        });
      }
    });
    return all;
  };

  // Backend Save Helper
  const syncRecordToBackend = async (record: PartnerArchiveRecord) => {
    try {
      await fetch('/api/partner-archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {
      console.error('Error syncing record to backend:', e);
    }
  };

  // Backend Delete Helper
  const deleteRecordFromBackend = async (id: string) => {
    try {
      await fetch(`/api/partner-archives/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Error deleting record from backend:', e);
    }
  };

  // Handler for Confirming Deletion
  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    const targetId = recordToDelete.id;

    // Delete from server / Firestore
    await deleteRecordFromBackend(targetId);

    // Update state & localStorage
    const updated = archives.filter((p) => p.id !== targetId);
    setArchives(updated);

    if (selectedPartner?.id === targetId) {
      setSelectedPartner(null);
    }
    setRecordToDelete(null);
  };

  // File Upload Helper to Server
  const uploadFilesToServer = async (fileList: File[]): Promise<ProposalAttachedFile[]> => {
    if (!fileList || fileList.length === 0) return [];

    const formData = new FormData();
    fileList.forEach((f) => formData.append('files', f));

    try {
      const res = await fetch('/api/partner-archives/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files;
      }
    } catch (e) {
      console.error('Server file upload error:', e);
    }

    // Fallback metadata generation if server call fails
    return fileList.map((f) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
      let fileType = 'DOCX';
      if (['PPT', 'PPTX'].includes(ext)) fileType = 'PPTX';
      else if (['PDF'].includes(ext)) fileType = 'PDF';
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) fileType = 'XLSX';
      else if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext)) fileType = 'IMG';

      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      const fileSizeFormatted = f.size >= 1024 * 1024 ? `${sizeMB} MB` : `${Math.ceil(f.size / 1024)} KB`;

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fileName: f.name,
        version: 'v1.0',
        description: '',
        uploadDate: new Date().toISOString().split('T')[0],
        fileType,
        fileSizeFormatted,
        hasOriginalFile: false,
        storageProvider: 'none',
        isStorageConnected: storageConnected
      };
    });
  };

  // Pending files selection in New Partner Form
  const handlePendingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = e.target.files;
    const selectedFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const item = fileList.item(i);
      if (item) selectedFiles.push(item);
    }

    const newPendingList: PendingFileItem[] = selectedFiles.map((f: File) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
      let fileType = 'DOCX';
      if (['PPT', 'PPTX'].includes(ext)) fileType = 'PPTX';
      else if (['PDF'].includes(ext)) fileType = 'PDF';
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) fileType = 'XLSX';
      else if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(ext)) fileType = 'IMG';

      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      const fileSizeFormatted = f.size >= 1024 * 1024 ? `${sizeMB} MB` : `${Math.ceil(f.size / 1024)} KB`;

      return {
        id: `pfile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        fileName: f.name,
        fileType,
        version: 'v1.0',
        description: '제안자료',
        fileSizeFormatted
      };
    });

    setPendingNewFiles((prev) => [...prev, ...newPendingList]);
    if (newFileInputRef.current) newFileInputRef.current.value = '';
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingNewFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePendingFileMeta = (id: string, key: 'version' | 'description', val: string) => {
    setPendingNewFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: val } : item))
    );
  };

  // Handler to Create New Company Archive / Edit
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.companyName?.trim()) {
      alert('업체명을 입력해 주세요.');
      return;
    }

    if (isEditPartnerModalOpen && selectedPartner) {
      const updatedRecord: PartnerArchiveRecord = {
        ...selectedPartner,
        companyName: companyForm.companyName.trim(),
        brandName: companyForm.brandName || '',
        industry: companyForm.industry || '기타',
        internalAssignee: companyForm.internalAssignee || '박서현',
        contactPerson: companyForm.contactPerson || '',
        contactTitle: companyForm.contactTitle || '',
        contactPhone: companyForm.contactPhone || '',
        contactEmail: companyForm.contactEmail || '',
        currentStatus: companyForm.currentStatus || '제안 준비',
        latestProjectName: companyForm.latestProjectName || selectedPartner.latestProjectName,
        latestProposalDate: companyForm.latestProposalDate || selectedPartner.latestProposalDate,
        nextAction: companyForm.nextAction || '',
        notes: companyForm.notes || '',
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const updatedList = archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p));
      setArchives(updatedList);
      setSelectedPartner(updatedRecord);
      setIsEditPartnerModalOpen(false);
      await syncRecordToBackend(updatedRecord);
    } else {
      setIsLoading(true);

      // Upload pending files if any
      let uploadedAttachedFiles: ProposalAttachedFile[] = [];
      if (pendingNewFiles.length > 0) {
        const fileObjects = pendingNewFiles.map((pf) => pf.file);
        const serverFiles = await uploadFilesToServer(fileObjects);

        uploadedAttachedFiles = serverFiles.map((sf, idx) => ({
          ...sf,
          version: pendingNewFiles[idx]?.version || 'v1.0',
          description: pendingNewFiles[idx]?.description || '제안자료'
        }));
      }

      const recordId = `pa-${Date.now()}`;
      const projName = companyForm.latestProjectName?.trim() || '신규 제안 안건';
      const propDate = companyForm.latestProposalDate || new Date().toISOString().split('T')[0];

      // Initial Proposal Item
      const initialProposal: ProposalHistoryItem = {
        id: `prop-${Date.now()}`,
        projectName: projName,
        proposalDate: propDate,
        proposalType: companyForm.proposalType || '스폰서십 & 바터',
        summary: companyForm.summary || '신규 제휴 이력 등록',
        requests: '상세 조건 검토 중',
        status: companyForm.currentStatus,
        result: '회신 대기',
        files: uploadedAttachedFiles
      };

      const initialTimeline: TimelineEntry[] = [
        {
          id: `tl-${Date.now()}`,
          date: propDate,
          author: companyForm.internalAssignee || currentUser?.name || '박서현',
          content: companyForm.lastDiscussion?.trim() || `신규 제휴사 [${companyForm.companyName}] 아카이브 등록 완료`
        }
      ];

      const newRecord: PartnerArchiveRecord = {
        id: recordId,
        companyName: companyForm.companyName.trim(),
        brandName: companyForm.brandName || '',
        industry: companyForm.industry || '스포츠 / 액티브',
        internalAssignee: companyForm.internalAssignee || currentUser?.name || '박서현',
        contactPerson: companyForm.contactPerson || '담당자 미정',
        contactTitle: companyForm.contactTitle || '',
        contactPhone: companyForm.contactPhone || '',
        contactEmail: companyForm.contactEmail || '',
        currentStatus: companyForm.currentStatus,
        latestProjectName: projName,
        latestProposalDate: propDate,
        nextAction: companyForm.nextAction || '초안 제안서 준비',
        notes: companyForm.notes || '',
        proposals: [initialProposal],
        timeline: initialTimeline,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      const updatedList = [newRecord, ...archives];
      setArchives(updatedList);
      setIsCreateCompanyModalOpen(false);
      setPendingNewFiles([]);
      setIsLoading(false);

      await syncRecordToBackend(newRecord);
    }
  };

  // Handler to Add Proposal Item
  const handleAddProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    if (!newProposal.projectName?.trim()) {
      alert('프로젝트명을 입력해 주세요.');
      return;
    }

    const item: ProposalHistoryItem = {
      id: `prop-${Date.now()}`,
      projectName: newProposal.projectName!,
      proposalDate: newProposal.proposalDate || new Date().toISOString().split('T')[0],
      proposalType: newProposal.proposalType || '스폰서십 & 바터',
      summary: newProposal.summary || '',
      requests: newProposal.requests || '',
      status: (newProposal.status as ArchiveProposalStatus) || '제안 준비',
      result: newProposal.result || '회신 대기',
      files: []
    };

    const updatedProposals = [item, ...selectedPartner.proposals];
    const updatedRecord: PartnerArchiveRecord = {
      ...selectedPartner,
      proposals: updatedProposals,
      latestProjectName: item.projectName,
      latestProposalDate: item.proposalDate,
      currentStatus: item.status,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: item.proposalDate,
          author: selectedPartner.internalAssignee,
          content: `[신규 제안] "${item.projectName}" 제안 등록 (${item.proposalType})`
        },
        ...selectedPartner.timeline
      ]
    };

    setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
    setSelectedPartner(updatedRecord);
    setIsNewProposalModalOpen(false);

    await syncRecordToBackend(updatedRecord);

    setNewProposal({
      projectName: '',
      proposalDate: new Date().toISOString().split('T')[0],
      proposalType: '스폰서십 & 바터',
      summary: '',
      requests: '',
      status: '제안 준비',
      result: '회신 대기 중',
    });
  };

  // Handler to Add File to Proposal in Detail View
  const handleFileUploadToProposal = async (proposalId: string) => {
    if (!selectedPartner || !selectedUploadFile) {
      alert('첨부할 파일을 선택해 주세요.');
      return;
    }

    setIsUploadingFile(true);
    const uploadedFiles = await uploadFilesToServer([selectedUploadFile]);
    const fileItem = uploadedFiles[0];

    if (fileItem) {
      fileItem.version = newFileVersion || 'v1.0';
      fileItem.description = newFileDesc || '제안 첨부 자료';

      const updatedProposals = selectedPartner.proposals.map((pr) => {
        if (pr.id === proposalId) {
          return {
            ...pr,
            files: [...(pr.files || []), fileItem]
          };
        }
        return pr;
      });

      const updatedRecord: PartnerArchiveRecord = {
        ...selectedPartner,
        proposals: updatedProposals,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            author: selectedPartner.internalAssignee,
            content: `[자료 업로드] "${selectedUploadFile.name}" (${fileItem.version}) 파일 첨부 완료`
          },
          ...selectedPartner.timeline
        ]
      };

      setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
      setSelectedPartner(updatedRecord);
      await syncRecordToBackend(updatedRecord);
    }

    setIsUploadingFile(false);
    setTargetProposalForFile(null);
    setSelectedUploadFile(null);
    setNewFileVersion('v1.0');
    setNewFileDesc('');
  };

  // Handler to Delete File from Proposal in Detail View
  const handleDeleteProposalFile = async (proposalId: string, fileId: string) => {
    if (!selectedPartner) return;
    if (!window.confirm('해당 첨부파일을 삭제하시겠습니까?')) return;

    const updatedProposals = selectedPartner.proposals.map((pr) => {
      if (pr.id === proposalId) {
        return {
          ...pr,
          files: (pr.files || []).filter((f) => f.id !== fileId)
        };
      }
      return pr;
    });

    const updatedRecord: PartnerArchiveRecord = {
      ...selectedPartner,
      proposals: updatedProposals,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
    setSelectedPartner(updatedRecord);
    await syncRecordToBackend(updatedRecord);
  };

  // Save File Edit
  const handleSaveFileMetaEdit = async (proposalId: string, fileId: string) => {
    if (!selectedPartner) return;

    const updatedProposals = selectedPartner.proposals.map((pr) => {
      if (pr.id === proposalId) {
        return {
          ...pr,
          files: (pr.files || []).map((f) => {
            if (f.id === fileId) {
              return {
                ...f,
                fileName: editFileName || f.fileName,
                version: editFileVersion || f.version,
                description: editFileDesc || f.description
              };
            }
            return f;
          })
        };
      }
      return pr;
    });

    const updatedRecord: PartnerArchiveRecord = {
      ...selectedPartner,
      proposals: updatedProposals,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
    setSelectedPartner(updatedRecord);
    setEditingFileId(null);
    await syncRecordToBackend(updatedRecord);
  };

  // Handler to Append Timeline Note
  const handleAddTimelineEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    if (!newTimelineContent.trim()) {
      alert('협의 히스토리 내용을 입력해 주세요.');
      return;
    }

    const newEntry: TimelineEntry = {
      id: `tl-${Date.now()}`,
      date: newTimelineDate || new Date().toISOString().split('T')[0],
      author: newTimelineAuthor || selectedPartner.internalAssignee,
      content: newTimelineContent.trim()
    };

    const updatedRecord: PartnerArchiveRecord = {
      ...selectedPartner,
      timeline: [newEntry, ...selectedPartner.timeline]
    };

    setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
    setSelectedPartner(updatedRecord);
    setNewTimelineContent('');
    await syncRecordToBackend(updatedRecord);
  };

  // Handler to Update Overall Status directly
  const handleUpdateStatus = async (newStatus: ArchiveProposalStatus) => {
    if (!selectedPartner) return;
    const updatedRecord: PartnerArchiveRecord = {
      ...selectedPartner,
      currentStatus: newStatus,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: selectedPartner.internalAssignee,
          content: `[상태 변경] 제휴 진행 상태가 "${selectedPartner.currentStatus}" → "${newStatus}"(으)로 변경됨`
        },
        ...selectedPartner.timeline
      ]
    };
    setArchives(archives.map((p) => (p.id === selectedPartner.id ? updatedRecord : p)));
    setSelectedPartner(updatedRecord);
    await syncRecordToBackend(updatedRecord);
  };

  return (
    <div id="partner-archive-main-container" className="space-y-6 pb-12">
      {/* Header Banner & Storage Connectivity Indicator */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 bg-[#736152] text-white text-[10px] font-mono font-bold rounded-2xs uppercase tracking-wider">
                PARTNERSHIP ARCHIVE
              </span>
              <span className="text-xs font-mono text-[#8C7A6B]">제휴 이력 & 제안자료 아카이브</span>

              {/* Firestore & Storage Status Badge */}
              {storageConnected ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-medium rounded-2xs">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  <span>Cloud Storage 연결됨 (원본 영구 보존)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-medium rounded-2xs" title="원본 파일 영구 저장을 위해 Cloud Storage 설정이 필요합니다.">
                  <CloudOff className="w-3 h-3 text-amber-600" />
                  <span>Cloud Storage 미연결 (Metadata 보존)</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mt-1 font-serif">
              기존 제휴사 제안자료 & 협의 이력 아카이브
            </h1>
            <p className="text-xs text-[#5C4E43] mt-1">
              업체별 제안 내역, 첨부 파일(PPT, PDF, Excel), 협의 타임라인 및 결과를 한곳에서 체계적으로 관리합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-add-new-company-archive"
              onClick={() => {
                setCompanyForm({
                  companyName: '',
                  brandName: '',
                  latestProjectName: '',
                  industry: '스포츠 / 액티브',
                  internalAssignee: currentUser?.name || '박서현',
                  contactPerson: '',
                  contactTitle: '',
                  contactPhone: '',
                  contactEmail: '',
                  latestProposalDate: new Date().toISOString().split('T')[0],
                  proposalType: '스폰서십 & 바터',
                  currentStatus: '제안 준비',
                  summary: '',
                  lastDiscussion: '',
                  nextAction: '',
                  notes: '',
                });
                setPendingNewFiles([]);
                setIsCreateCompanyModalOpen(true);
              }}
              className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-2xs transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ 신규 제휴 이력 등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="업체명, 브랜드명, 담당자, 프로젝트명 검색..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-xs text-[#2C2C2C] placeholder-[#8C7A6B] focus:outline-none focus:border-[#736152]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2 min-w-[200px]">
            <span className="text-xs font-semibold text-[#5C4E43] shrink-0">진행상태:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            >
              <option value="all">전체 상태 보기 ({archives.length})</option>
              {ALL_ARCHIVE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-mono font-semibold text-[11px]">
                <th className="py-3 px-3">업체명</th>
                <th className="py-3 px-3">브랜드명</th>
                <th className="py-3 px-3">프로젝트명</th>
                <th className="py-3 px-3">내부담당자</th>
                <th className="py-3 px-3">상대담당자</th>
                <th className="py-3 px-3">최근 제안일</th>
                <th className="py-3 px-3">현재상태</th>
                <th className="py-3 px-3 text-center">첨부파일</th>
                <th className="py-3 px-3 text-right min-w-[180px]">관리 / 삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6] text-[#2C2C2C]">
              {filteredArchives.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#8C7A6B]">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold">검색 조건에 일치하는 제휴 이력 기록이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                filteredArchives.map((record) => {
                  const style = STATUS_BADGE_STYLE[record.currentStatus] || STATUS_BADGE_STYLE['제안 준비'];
                  const filesCount = getTotalFilesCount(record);
                  const latestProp = record.proposals[0];

                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedPartner(record)}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    >
                      {/* 업체명 */}
                      <td className="py-3 px-3 font-semibold text-[#2C2C2C] group-hover:text-[#736152] transition-colors">
                        <div className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#736152] shrink-0" />
                          <span>{record.companyName}</span>
                        </div>
                      </td>

                      {/* 브랜드명 */}
                      <td className="py-3 px-3 text-[#5C4E43]">
                        {record.brandName || '-'}
                      </td>

                      {/* 프로젝트명 */}
                      <td className="py-3 px-3 font-medium text-[#2C2C2C] max-w-[200px] truncate" title={latestProp?.projectName || record.latestProjectName}>
                        {latestProp?.projectName || record.latestProjectName || '-'}
                      </td>

                      {/* 내부담당자 */}
                      <td className="py-3 px-3 text-[#5C4E43]">
                        <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs text-[11px]">
                          {record.internalAssignee}
                        </span>
                      </td>

                      {/* 상대담당자 */}
                      <td className="py-3 px-3 text-[#5C4E43]">
                        <div>
                          <span className="font-semibold text-[#2C2C2C]">{record.contactPerson}</span>
                          {record.contactTitle && <span className="text-[10px] text-[#8C7A6B] ml-1">({record.contactTitle})</span>}
                        </div>
                      </td>

                      {/* 최근 제안일 */}
                      <td className="py-3 px-3 text-[#8C7A6B] font-mono text-[11px]">
                        {latestProp?.proposalDate || record.latestProposalDate || '-'}
                      </td>

                      {/* 현재상태 */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-2xs inline-block ${style.bg} ${style.text} ${style.border}`}>
                          {record.currentStatus}
                        </span>
                      </td>

                      {/* 첨부파일 수 badge (클릭 시 첨부파일 전용 뷰어 열림) */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilesViewerRecord(record);
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#F5F2EC] hover:bg-[#EAE4D8] text-[#5C4E43] text-[11px] font-mono rounded-2xs font-semibold transition-colors border border-[#D4C8B8] cursor-pointer"
                          title="첨부파일 목록 열기"
                        >
                          <Paperclip className="w-3 h-3 text-[#736152]" />
                          <span>{filesCount}개</span>
                        </button>
                      </td>

                      {/* 다음액션 & 삭제 버튼 */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPartner(record);
                            }}
                            className="px-2 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] text-[#5C4E43] text-[11px] font-medium rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                            title="상세 보기"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#736152]" />
                            <span>상세</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordToDelete(record);
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                            title="제휴 이력 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>삭제</span>
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

      {/* ==================================================== */}
      {/* MODAL: CONFIRM DELETE PARTNER RECORD */}
      {/* ==================================================== */}
      {recordToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-rose-200 rounded-xs shadow-2xl w-full max-w-md p-6 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2C2C] font-serif">
                  이 제휴 이력을 삭제하시겠습니까?
                </h3>
                <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                  업체/프로젝트/협의 이력과 연결된 첨부파일 정보가 함께 삭제될 수 있습니다.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs p-3 space-y-1.5 text-xs text-[#5C4E43]">
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C2C2C]">업체명:</span>
                <span>{recordToDelete.companyName}</span>
              </div>
              {recordToDelete.brandName && (
                <div className="flex justify-between">
                  <span className="font-semibold text-[#2C2C2C]">브랜드명:</span>
                  <span>{recordToDelete.brandName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C2C2C]">프로젝트명:</span>
                <span className="truncate max-w-[200px]">{recordToDelete.latestProjectName || '미지정'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C2C2C]">진행상태:</span>
                <span className="font-bold text-[#736152]">{recordToDelete.currentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#2C2C2C]">연결된 첨부파일:</span>
                <span className="font-mono">{getTotalFilesCount(recordToDelete)}개</span>
              </div>
            </div>

            <p className="text-[11px] text-[#8C7A6B]">
              * 해당 제휴 이력 레코드만 삭제되며, 동일 업체의 다른 독립된 기록에는 영향을 주지 않습니다.
            </p>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] text-xs font-semibold rounded-2xs hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRecord}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-2xs transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제 확정</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ATTACHED FILES VIEWER (첨부파일 목록 열기) */}
      {/* ==================================================== */}
      {filesViewerRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-2xl p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-5 h-5 text-[#736152]" />
                <h3 className="font-bold text-[#2C2C2C] text-base font-serif">
                  [{filesViewerRecord.companyName}] 제안자료 첨부파일 목록 ({getTotalFilesCount(filesViewerRecord)}개)
                </h3>
              </div>
              <button onClick={() => setFilesViewerRecord(null)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Storage status banner in file viewer */}
            {!storageConnected && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xs text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Cloud Storage 연결 필요 안내:</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    현재 Cloud Storage가 연결되어 있지 않아 파일 메타데이터 위주로 보존되어 있습니다. 원본 파일 영구 보존 및 다운로드를 위해서는 Cloud Storage 연결이 필요합니다.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {getAllFilesForRecord(filesViewerRecord).length === 0 ? (
                <div className="py-8 text-center text-[#8C7A6B] text-xs">
                  등록된 첨부파일이 없습니다.
                </div>
              ) : (
                getAllFilesForRecord(filesViewerRecord).map(({ file, projectName, proposalDate }, idx) => (
                  <div key={file.id || idx} className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 bg-[#736152] text-white text-[10px] font-mono font-bold rounded-2xs">
                          {file.fileType || 'FILE'}
                        </span>
                        <span className="font-bold text-[#2C2C2C]">{file.fileName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white border border-[#D4C8B8] text-[#736152] font-mono rounded-2xs">
                          {file.version || 'v1.0'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5C4E43]">
                        {file.description || '제안 자료'}
                      </div>

                      <div className="flex items-center space-x-3 text-[10px] text-[#8C7A6B] font-mono">
                        <span>프로젝트: {projectName}</span>
                        <span>·</span>
                        <span>등록일: {file.uploadDate}</span>
                        <span>·</span>
                        <span>용량: {file.fileSizeFormatted || '미상세'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {file.fileUrl && (file.hasOriginalFile || file.fileUrl.startsWith('data:')) ? (
                        <>
                          <button
                            onClick={() => window.open(file.fileUrl, '_blank')}
                            className="px-2.5 py-1.5 bg-white border border-[#D4C8B8] text-[#2C2C2C] hover:bg-[#EFECE6] text-[11px] font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#736152]" />
                            <span>파일 열기</span>
                          </button>
                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            className="px-2.5 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>다운로드</span>
                          </a>
                        </>
                      ) : (
                        <div className="px-2.5 py-1 bg-gray-100 border border-gray-300 text-gray-500 text-[10px] rounded-2xs">
                          Metadata 보존됨 (Cloud Storage 미연결)
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E4DC]">
              <button
                onClick={() => setFilesViewerRecord(null)}
                className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] text-xs font-semibold rounded-2xs hover:bg-[#EFECE6] cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CREATE NEW PARTNER ARCHIVE (+ FILE UPLOADS) */}
      {/* ==================================================== */}
      {isCreateCompanyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-2xl p-6 space-y-5 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3 shrink-0">
              <div>
                <h3 className="font-bold text-[#2C2C2C] text-base font-serif">
                  신규 제휴 이력 등록
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  기본정보 및 관련 제안서/계약서/조건표 첨부파일을 등록합니다.
                </p>
              </div>
              <button
                onClick={() => setIsCreateCompanyModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Storage Connectivity Info Banner */}
              <div className={`p-3 border rounded-2xs text-xs flex items-start space-x-2 ${storageConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                {storageConnected ? (
                  <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <CloudOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold">
                    {storageConnected ? 'Cloud Storage 활성화' : 'Cloud Storage 미연결 상태 안내'}
                  </span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {storageConnected
                      ? '업로드하는 원본 파일이 Cloud Storage에 안전하게 영구 저장됩니다.'
                      : '현재 Cloud Storage가 연결되어 있지 않아 파일의 Metadata(파일명, 버전, 설명)가 저장됩니다.'}
                  </p>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#2C2C2C] text-xs border-b border-[#E8E4DC] pb-1 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-[#736152]" />
                  <span>기본 정보</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">업체명 *</label>
                    <input
                      type="text"
                      required
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                      placeholder="예: Garmin Korea"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs focus:border-[#736152]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">브랜드명</label>
                    <input
                      type="text"
                      value={companyForm.brandName}
                      onChange={(e) => setCompanyForm({ ...companyForm, brandName: e.target.value })}
                      placeholder="예: Garmin Golf"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs focus:border-[#736152]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">프로젝트명</label>
                    <input
                      type="text"
                      value={companyForm.latestProjectName}
                      onChange={(e) => setCompanyForm({ ...companyForm, latestProjectName: e.target.value })}
                      placeholder="예: 2026 가을 골프 테크 팝업"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs focus:border-[#736152]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">업종 / 분야</label>
                    <input
                      type="text"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                      placeholder="예: 골프·스포츠IT"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs focus:border-[#736152]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">내부 담당자</label>
                    <input
                      type="text"
                      value={companyForm.internalAssignee}
                      onChange={(e) => setCompanyForm({ ...companyForm, internalAssignee: e.target.value })}
                      placeholder="박서현"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">상대 담당자명</label>
                    <input
                      type="text"
                      value={companyForm.contactPerson}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                      placeholder="홍길동"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">상대 부서/직급</label>
                    <input
                      type="text"
                      value={companyForm.contactTitle}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactTitle: e.target.value })}
                      placeholder="마케팅팀 팀장"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">연락처</label>
                    <input
                      type="text"
                      value={companyForm.contactPhone}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                      placeholder="02-1234-5678"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">이메일</label>
                    <input
                      type="email"
                      value={companyForm.contactEmail}
                      onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">제안일</label>
                    <input
                      type="date"
                      value={companyForm.latestProposalDate}
                      onChange={(e) => setCompanyForm({ ...companyForm, latestProposalDate: e.target.value })}
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">제안 형태</label>
                    <input
                      type="text"
                      value={companyForm.proposalType}
                      onChange={(e) => setCompanyForm({ ...companyForm, proposalType: e.target.value })}
                      placeholder="스폰서십, 바터, 팝업"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">현재 상태</label>
                    <select
                      value={companyForm.currentStatus}
                      onChange={(e) => setCompanyForm({ ...companyForm, currentStatus: e.target.value as ArchiveProposalStatus })}
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    >
                      {ALL_ARCHIVE_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">제안 내용 요약</label>
                  <textarea
                    rows={2}
                    value={companyForm.summary}
                    onChange={(e) => setCompanyForm({ ...companyForm, summary: e.target.value })}
                    placeholder="제안서 주요 내용 및 상호 가치 요약"
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">마지막 협의 내용</label>
                    <input
                      type="text"
                      value={companyForm.lastDiscussion}
                      onChange={(e) => setCompanyForm({ ...companyForm, lastDiscussion: e.target.value })}
                      placeholder="예: 1차 미팅 진행 및 제안서 전달 완료"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5C4E43] mb-1">다음 액션</label>
                    <input
                      type="text"
                      value={companyForm.nextAction}
                      onChange={(e) => setCompanyForm({ ...companyForm, nextAction: e.target.value })}
                      placeholder="예: 2차 조건 협의 회신 수신"
                      className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">메모 / 특이사항</label>
                  <input
                    type="text"
                    value={companyForm.notes}
                    onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                    placeholder="기타 기업 정보 및 인맥 특이사항"
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              {/* 제안자료 첨부 영역 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-1">
                  <h4 className="font-bold text-[#2C2C2C] text-xs flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-[#736152]" />
                    <span>제안자료 첨부</span>
                    <span className="text-[11px] font-normal text-[#8C7A6B]">
                      (PPT, PPTX, PDF, XLS, XLSX, DOC, DOCX, JPG, PNG 지원)
                    </span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => newFileInputRef.current?.click()}
                    className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] text-[#5C4E43] text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#736152]" />
                    <span>+ 파일 추가</span>
                  </button>

                  <input
                    type="file"
                    ref={newFileInputRef}
                    onChange={handlePendingFileChange}
                    multiple
                    accept=".ppt,.pptx,.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </div>

                {pendingNewFiles.length === 0 ? (
                  <div className="p-4 bg-[#FAF8F5] border border-dashed border-[#D4C8B8] rounded-2xs text-center text-[#8C7A6B] text-xs">
                    첨부할 파일이 없습니다. 오른쪽 위 '+ 파일 추가' 버튼을 눌러 여러 자료를 업로드하세요.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-[#E8E4DC] rounded-2xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-mono text-[10px]">
                          <th className="py-2 px-2.5">파일명</th>
                          <th className="py-2 px-2.5">유형</th>
                          <th className="py-2 px-2.5">설명</th>
                          <th className="py-2 px-2.5">버전</th>
                          <th className="py-2 px-2.5 text-center">삭제</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EDE6] text-[#2C2C2C]">
                        {pendingNewFiles.map((pf) => (
                          <tr key={pf.id} className="hover:bg-[#FAF8F5]">
                            <td className="py-2 px-2.5 font-medium max-w-[180px] truncate" title={pf.fileName}>
                              {pf.fileName}
                              <span className="block text-[10px] text-[#8C7A6B] font-mono">{pf.fileSizeFormatted}</span>
                            </td>
                            <td className="py-2 px-2.5 font-mono text-[10px]">
                              <span className="px-1.5 py-0.5 bg-[#736152] text-white rounded-2xs">
                                {pf.fileType}
                              </span>
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                value={pf.description}
                                onChange={(e) => handleUpdatePendingFileMeta(pf.id, 'description', e.target.value)}
                                placeholder="자료 설명"
                                className="w-full px-2 py-1 border border-[#D4C8B8] rounded-2xs text-xs"
                              />
                            </td>
                            <td className="py-2 px-2.5 w-20">
                              <input
                                type="text"
                                value={pf.version}
                                onChange={(e) => handleUpdatePendingFileMeta(pf.id, 'version', e.target.value)}
                                placeholder="v1.0"
                                className="w-full px-2 py-1 border border-[#D4C8B8] rounded-2xs text-xs font-mono"
                              />
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePendingFile(pf.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-2xs cursor-pointer"
                                title="목록에서 제거"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsCreateCompanyModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] rounded-2xs text-xs font-semibold hover:bg-[#EFECE6] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white rounded-2xs text-xs font-semibold shadow-2xs cursor-pointer flex items-center space-x-1"
                >
                  {isLoading ? <span>저장 중...</span> : <span>저장하기</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DETAIL MODAL (제휴 이력 & 제안자료 아카이브 상세) */}
      {/* ==================================================== */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#736152] text-white rounded-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-[#2C2C2C] font-serif">
                      {selectedPartner.companyName}
                    </h2>
                    {selectedPartner.brandName && (
                      <span className="text-xs px-2 py-0.5 bg-white border border-[#D4C8B8] text-[#736152] font-semibold rounded-2xs">
                        {selectedPartner.brandName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8C7A6B]">
                    {selectedPartner.industry} · 담당자: {selectedPartner.internalAssignee}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCompanyForm({
                      companyName: selectedPartner.companyName,
                      brandName: selectedPartner.brandName || '',
                      latestProjectName: selectedPartner.latestProjectName || '',
                      industry: selectedPartner.industry,
                      internalAssignee: selectedPartner.internalAssignee,
                      contactPerson: selectedPartner.contactPerson,
                      contactTitle: selectedPartner.contactTitle || '',
                      contactPhone: selectedPartner.contactPhone || '',
                      contactEmail: selectedPartner.contactEmail || '',
                      latestProposalDate: selectedPartner.latestProposalDate || '',
                      proposalType: '스폰서십',
                      currentStatus: selectedPartner.currentStatus,
                      summary: '',
                      lastDiscussion: '',
                      nextAction: selectedPartner.nextAction || '',
                      notes: selectedPartner.notes || '',
                    });
                    setIsEditPartnerModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#D4C8B8] text-[#5C4E43] hover:bg-[#EFECE6] text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#736152]" />
                  <span>정보 수정</span>
                </button>

                <button
                  onClick={() => setRecordToDelete(selectedPartner)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>삭제</span>
                </button>

                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-1.5 text-[#8C7A6B] hover:text-[#2C2C2C] rounded-2xs transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
              {/* Partner Overview Stats & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs space-y-1 text-xs">
                  <span className="font-semibold text-[#8C7A6B] block">상대 담당자 정보</span>
                  <div className="font-bold text-[#2C2C2C]">
                    {selectedPartner.contactPerson} {selectedPartner.contactTitle && `(${selectedPartner.contactTitle})`}
                  </div>
                  <div className="text-[11px] text-[#5C4E43] space-y-0.5">
                    <div>전화: {maskPhone(selectedPartner.contactPhone)}</div>
                    <div>이메일: {maskEmail(selectedPartner.contactEmail)}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs space-y-1 text-xs">
                  <span className="font-semibold text-[#8C7A6B] block">현재 제휴 상태</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-xs font-bold border rounded-2xs ${STATUS_BADGE_STYLE[selectedPartner.currentStatus]?.bg} ${STATUS_BADGE_STYLE[selectedPartner.currentStatus]?.text} ${STATUS_BADGE_STYLE[selectedPartner.currentStatus]?.border}`}>
                      {selectedPartner.currentStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5C4E43] mt-1">
                    다음 액션: {selectedPartner.nextAction || '미지정'}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs space-y-1 text-xs flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-[#8C7A6B] block">아카이브 요약</span>
                    <div className="text-[#2C2C2C]">
                      총 {selectedPartner.proposals.length}건 제안 / {getTotalFilesCount(selectedPartner)}개 첨부파일
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onAnalyzeCompany) {
                        onAnalyzeCompany(selectedPartner.companyName);
                      }
                    }}
                    className="mt-2 w-full py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-[11px] font-semibold rounded-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 관심도 및 기업 심층 분석</span>
                  </button>
                </div>
              </div>

              {/* Proposals & Attachment Files List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-2">
                  <h3 className="font-bold text-[#2C2C2C] text-sm font-serif flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-[#736152]" />
                    <span>제안 내역 및 첨부파일 ({selectedPartner.proposals.length}건)</span>
                  </h3>

                  <button
                    onClick={() => setIsNewProposalModalOpen(true)}
                    className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] text-[#5C4E43] text-xs font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#736152]" />
                    <span>+ 신규 제안 추가</span>
                  </button>
                </div>

                {selectedPartner.proposals.length === 0 ? (
                  <div className="p-6 bg-[#FAF8F5] border border-dashed border-[#D4C8B8] rounded-2xs text-center text-[#8C7A6B] text-xs">
                    등록된 제안 내역이 없습니다. '+ 신규 제안 추가'를 클릭하여 기록하세요.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPartner.proposals.map((prop) => (
                      <div key={prop.id} className="bg-white border border-[#E8E4DC] rounded-2xs p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0EDE6] pb-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#2C2C2C] text-sm">{prop.projectName}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-2xs ${STATUS_BADGE_STYLE[prop.status]?.bg} ${STATUS_BADGE_STYLE[prop.status]?.text} ${STATUS_BADGE_STYLE[prop.status]?.border}`}>
                                {prop.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#8C7A6B] font-mono">
                              제안일: {prop.proposalDate} · 형태: {prop.proposalType}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setTargetProposalForFile(targetProposalForFile === prop.id ? null : prop.id);
                            }}
                            className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D4C8B8] text-[#5C4E43] text-[11px] font-semibold rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer self-start sm:self-center"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-[#736152]" />
                            <span>+ 파일 추가</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#5C4E43]">
                          <div>
                            <span className="font-semibold text-[#2C2C2C] block mb-0.5">제안 내용 요약</span>
                            <p className="bg-[#FAF8F5] p-2 rounded-2xs border border-[#F0EDE6] text-[11px] leading-relaxed">
                              {prop.summary || '내용 미기재'}
                            </p>
                          </div>
                          <div>
                            <span className="font-semibold text-[#2C2C2C] block mb-0.5">결과 / 협의 사항</span>
                            <p className="bg-[#FAF8F5] p-2 rounded-2xs border border-[#F0EDE6] text-[11px] leading-relaxed">
                              {prop.result || prop.requests || '진행 중'}
                            </p>
                          </div>
                        </div>

                        {/* File Upload Box inside Proposal */}
                        {targetProposalForFile === prop.id && (
                          <div className="p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs space-y-2 text-xs">
                            <div className="font-bold text-[#2C2C2C] flex items-center justify-between">
                              <span>"{prop.projectName}"에 첨부파일 추가</span>
                              <button onClick={() => setTargetProposalForFile(null)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="file"
                                onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                                className="sm:col-span-1 text-xs border border-[#D4C8B8] bg-white p-1 rounded-2xs"
                              />
                              <input
                                type="text"
                                value={newFileVersion}
                                onChange={(e) => setNewFileVersion(e.target.value)}
                                placeholder="버전 (v1.0)"
                                className="px-2 py-1 border border-[#D4C8B8] bg-white rounded-2xs text-xs font-mono"
                              />
                              <input
                                type="text"
                                value={newFileDesc}
                                onChange={(e) => setNewFileDesc(e.target.value)}
                                placeholder="자료 설명"
                                className="px-2 py-1 border border-[#D4C8B8] bg-white rounded-2xs text-xs"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-1">
                              <button
                                onClick={() => handleFileUploadToProposal(prop.id)}
                                disabled={isUploadingFile || !selectedUploadFile}
                                className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-semibold rounded-2xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isUploadingFile ? '업로드 중...' : '파일 첨부 저장'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Proposal Attached Files List */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-[#8C7A6B] block">
                            첨부파일 ({prop.files ? prop.files.length : 0}개)
                          </span>

                          {(!prop.files || prop.files.length === 0) ? (
                            <div className="text-[11px] text-[#8C7A6B] italic pl-2">
                              첨부된 자료가 없습니다.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {prop.files.map((file) => (
                                <div key={file.id} className="p-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                  {editingFileId === file.id ? (
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                                      <input
                                        type="text"
                                        value={editFileName}
                                        onChange={(e) => setEditFileName(e.target.value)}
                                        className="px-2 py-1 border border-[#D4C8B8] bg-white rounded-2xs text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={editFileVersion}
                                        onChange={(e) => setEditFileVersion(e.target.value)}
                                        className="px-2 py-1 border border-[#D4C8B8] bg-white rounded-2xs text-xs font-mono"
                                      />
                                      <div className="flex items-center space-x-1">
                                        <input
                                          type="text"
                                          value={editFileDesc}
                                          onChange={(e) => setEditFileDesc(e.target.value)}
                                          className="w-full px-2 py-1 border border-[#D4C8B8] bg-white rounded-2xs text-xs"
                                        />
                                        <button
                                          onClick={() => handleSaveFileMetaEdit(prop.id, file.id)}
                                          className="p-1 bg-[#736152] text-white rounded-2xs cursor-pointer"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2 flex-wrap">
                                      <span className="px-1.5 py-0.5 bg-[#736152] text-white text-[10px] font-mono font-bold rounded-2xs">
                                        {file.fileType || 'FILE'}
                                      </span>
                                      <span className="font-semibold text-[#2C2C2C]">{file.fileName}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 bg-white border border-[#D4C8B8] text-[#736152] font-mono rounded-2xs">
                                        {file.version || 'v1.0'}
                                      </span>
                                      <span className="text-[11px] text-[#5C4E43] font-normal">
                                        ({file.description || '제안자료'})
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-1.5 shrink-0">
                                    {file.fileUrl && (file.hasOriginalFile || file.fileUrl.startsWith('data:')) ? (
                                      <a
                                        href={file.fileUrl}
                                        download={file.fileName}
                                        className="p-1 text-[#736152] hover:bg-[#EFECE6] rounded-2xs cursor-pointer"
                                        title="다운로드"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    ) : null}

                                    <button
                                      onClick={() => {
                                        setEditingFileId(file.id);
                                        setEditFileName(file.fileName);
                                        setEditFileVersion(file.version || 'v1.0');
                                        setEditFileDesc(file.description || '');
                                      }}
                                      className="p-1 text-[#8C7A6B] hover:text-[#2C2C2C] rounded-2xs cursor-pointer"
                                      title="파일 정보 수정"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteProposalFile(prop.id, file.id)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded-2xs cursor-pointer"
                                      title="파일 삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#2C2C2C] text-sm font-serif border-b border-[#E8E4DC] pb-2 flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-[#736152]" />
                  <span>협의 타임라인 ({selectedPartner.timeline.length}건)</span>
                </h3>

                {/* Append New Timeline Form */}
                <form onSubmit={handleAddTimelineEntry} className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xs space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newTimelineDate}
                      onChange={(e) => setNewTimelineDate(e.target.value)}
                      className="px-2.5 py-1.5 border border-[#D4C8B8] bg-white rounded-2xs text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={newTimelineAuthor}
                      onChange={(e) => setNewTimelineAuthor(e.target.value)}
                      placeholder="작성자"
                      className="px-2.5 py-1.5 border border-[#D4C8B8] bg-white rounded-2xs text-xs"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTimelineContent}
                      onChange={(e) => setNewTimelineContent(e.target.value)}
                      placeholder="협의 사항, 미팅 메모, 통화 내역 입력..."
                      className="flex-1 px-3 py-1.5 border border-[#D4C8B8] bg-white rounded-2xs text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-semibold rounded-2xs text-xs cursor-pointer"
                    >
                      기록 등록
                    </button>
                  </div>
                </form>

                {/* Timeline History List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedPartner.timeline.map((entry) => (
                    <div key={entry.id} className="p-2.5 bg-white border border-[#F0EDE6] rounded-2xs text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] font-mono">
                        <span>{entry.date} · {entry.author || selectedPartner.internalAssignee}</span>
                      </div>
                      <p className="text-xs text-[#2C2C2C] leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E8E4DC] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#8C7A6B]">
                최종 수정: {selectedPartner.updatedAt || '최근'}
              </span>

              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] text-xs font-semibold rounded-2xs hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PARTNER BASIC INFO */}
      {isEditPartnerModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-lg p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="font-bold text-[#2C2C2C] text-base font-serif">
                [{selectedPartner.companyName}] 제휴사 기본 정보 수정
              </h3>
              <button
                onClick={() => setIsEditPartnerModalOpen(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">업체명 *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">브랜드명</label>
                  <input
                    type="text"
                    value={companyForm.brandName}
                    onChange={(e) => setCompanyForm({ ...companyForm, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">업종 / 분야</label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">내부 담당자</label>
                  <input
                    type="text"
                    value={companyForm.internalAssignee}
                    onChange={(e) => setCompanyForm({ ...companyForm, internalAssignee: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">상대 담당자명</label>
                  <input
                    type="text"
                    value={companyForm.contactPerson}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">부서 / 직급</label>
                  <input
                    type="text"
                    value={companyForm.contactTitle}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">이메일</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">연락처</label>
                  <input
                    type="text"
                    value={companyForm.contactPhone}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">현재 진행상태</label>
                <select
                  value={companyForm.currentStatus}
                  onChange={(e) => setCompanyForm({ ...companyForm, currentStatus: e.target.value as ArchiveProposalStatus })}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                >
                  {ALL_ARCHIVE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">다음 액션</label>
                <input
                  type="text"
                  value={companyForm.nextAction}
                  onChange={(e) => setCompanyForm({ ...companyForm, nextAction: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">메모 / 특이사항</label>
                <textarea
                  rows={2}
                  value={companyForm.notes}
                  onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsEditPartnerModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] rounded-2xs text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#736152] text-white rounded-2xs text-xs font-semibold hover:bg-[#5C4E43]"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROPOSAL ITEM */}
      {isNewProposalModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-lg p-5 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="font-bold text-[#2C2C2C] text-base font-serif">
                [{selectedPartner.companyName}] 신규 제안 건 추가
              </h3>
              <button onClick={() => setIsNewProposalModalOpen(false)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProposal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">프로젝트명 *</label>
                <input
                  type="text"
                  required
                  value={newProposal.projectName}
                  onChange={(e) => setNewProposal({ ...newProposal, projectName: e.target.value })}
                  placeholder="예: 2026 가을 골프 테크 팝업"
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs focus:border-[#736152]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">제안일</label>
                  <input
                    type="date"
                    value={newProposal.proposalDate}
                    onChange={(e) => setNewProposal({ ...newProposal, proposalDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#5C4E43] mb-1">제안 형태</label>
                  <input
                    type="text"
                    value={newProposal.proposalType}
                    onChange={(e) => setNewProposal({ ...newProposal, proposalType: e.target.value })}
                    placeholder="스폰서십, 바터, 팝업 등"
                    className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">진행상태</label>
                <select
                  value={newProposal.status}
                  onChange={(e) => setNewProposal({ ...newProposal, status: e.target.value as ArchiveProposalStatus })}
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                >
                  {ALL_ARCHIVE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">제안 내용 요약</label>
                <textarea
                  rows={2}
                  value={newProposal.summary}
                  onChange={(e) => setNewProposal({ ...newProposal, summary: e.target.value })}
                  placeholder="제안서 핵심 안건 요약"
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">요청사항 / 협찬 조건</label>
                <input
                  type="text"
                  value={newProposal.requests}
                  onChange={(e) => setNewProposal({ ...newProposal, requests: e.target.value })}
                  placeholder="예: 현물 50세트 협찬 + 대관 무상"
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5C4E43] mb-1">진행 결과 요약</label>
                <input
                  type="text"
                  value={newProposal.result}
                  onChange={(e) => setNewProposal({ ...newProposal, result: e.target.value })}
                  placeholder="예: 긍정적 검토 회신"
                  className="w-full px-3 py-2 border border-[#D4C8B8] rounded-2xs text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsNewProposalModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#D4C8B8] text-[#2C2C2C] rounded-2xs text-xs font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#736152] text-white rounded-2xs text-xs font-semibold hover:bg-[#5C4E43]"
                >
                  제안 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
