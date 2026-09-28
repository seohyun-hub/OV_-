import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  UserCheck,
  Upload,
  FileSpreadsheet,
  CreditCard,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  X,
  FileText,
  UserPlus,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  PartnerRecord,
  PartnerContactRecord,
  PartnerDbDuplicateItem,
  DuplicateActionType,
} from '../types';

const STANDARD_PARTNER_FIELDS_KEYS: Record<string, string> = {
  companyName: '회사명',
  brandName: '브랜드명',
  contactName: '담당자명',
  title: '직급',
  department: '부서',
  email: '이메일',
  phone: '전화번호',
  website: '홈페이지',
  instagramUrl: 'Instagram',
  industry: '업종',
  internalOwner: '담당자(내부)',
  recentDealNote: '최근 제휴 내용',
  notes: '메모',
  source: '출처',
};

// Helper: Calculate display name priority (Company Name > Brand Name > '미지정 업체')
export const getRepresentativeDisplayName = (companyName?: string, brandName?: string) => {
  const comp = (companyName || '').trim();
  const brand = (brandName || '').trim();

  if (comp && comp !== '미지정 업체' && comp !== '미지정') {
    return {
      primaryName: comp,
      secondaryName: brand ? `브랜드: ${brand}` : undefined,
    };
  } else if (brand) {
    return {
      primaryName: brand,
      secondaryName: undefined,
    };
  }
  return {
    primaryName: '미지정 업체',
    secondaryName: undefined,
  };
};

interface PartnerDBViewProps {
  onSelectPartnerForTarget?: (companyName: string) => void;
  onSelectPartnerForPipeline?: (companyName: string) => void;
  onSelectPartnerForProposal?: (companyName: string) => void;
}

export const PartnerDBView: React.FC<PartnerDBViewProps> = ({
  onSelectPartnerForTarget,
  onSelectPartnerForPipeline,
  onSelectPartnerForProposal,
}) => {
  // Main sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'upload_excel' | 'ocr_card'>('directory');

  // DB State
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [contacts, setContacts] = useState<PartnerContactRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Directory Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [directoryViewMode, setDirectoryViewMode] = useState<'contacts' | 'companies'>('contacts');

  // Manual Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Partial<PartnerContactRecord> | null>(null);

  // Excel Upload Flow State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelParsing, setExcelParsing] = useState<boolean>(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [userMapping, setUserMapping] = useState<Record<string, string>>({});
  const [parsedRowsRaw, setParsedRowsRaw] = useState<any[]>([]);
  const [excelStep, setExcelStep] = useState<'SELECT_FILE' | 'MAP_COLUMNS' | 'PREVIEW_DATA' | 'DUPLICATE_CHECK' | 'COMPLETE'>('SELECT_FILE');
  const [duplicates, setDuplicates] = useState<PartnerDbDuplicateItem[]>([]);
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ addedCount: number; updatedCount: number; skippedCount: number } | null>(null);

  // Business Card OCR Flow State
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
  const [ocrAnalyzing, setOcrAnalyzing] = useState<boolean>(false);
  const [extractedCardForm, setExtractedCardForm] = useState<Partial<PartnerContactRecord> | null>(null);
  const [cardDuplicateMatch, setCardDuplicateMatch] = useState<PartnerDbDuplicateItem | null>(null);
  const [cardSaving, setCardSaving] = useState<boolean>(false);
  const [isQuotaFallback, setIsQuotaFallback] = useState<boolean>(false);
  const [fallbackNoticeMsg, setFallbackNoticeMsg] = useState<string | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [showRawTextSection, setShowRawTextSection] = useState<boolean>(false);
  const [ocrCandidates, setOcrCandidates] = useState<any>(null);

  // Fetch DB data from server
  const fetchPartnerDb = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners || []);
        setContacts(data.contacts || []);
      } else {
        setErrorMsg(data.error || '파트너 DB를 불러오지 못했습니다.');
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerDb();
  }, []);

  // Filtered Directory Data
  const filteredContacts = contacts.filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch =
      !term ||
      (c.companyName && c.companyName.toLowerCase().includes(term)) ||
      (c.brandName && c.brandName.toLowerCase().includes(term)) ||
      (c.contactName && c.contactName.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.title && c.title.toLowerCase().includes(term));

    const matchInd = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    const matchSrc = selectedSource === 'ALL' || c.source === selectedSource;

    return matchSearch && matchInd && matchSrc;
  });

  const industriesList = Array.from(
    new Set([...contacts.map((c) => c.industry), ...partners.map((p) => p.industry)].filter(Boolean))
  ) as string[];

  const sourcesList = Array.from(
    new Set([...contacts.map((c) => c.source), ...partners.map((p) => p.source)].filter(Boolean))
  ) as string[];

  // Excel Export Handler
  const handleExportExcel = () => {
    window.open('/api/partners/export-excel', '_blank');
  };

  // Save or Update Contact
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact?.contactName && !editingContact?.companyName) {
      alert('회사명 또는 담당자명을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/partner-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEditingContact(null);
        fetchPartnerDb();
      } else {
        alert(data.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('저장 실패: 서버 오류');
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('해당 담당자 정보를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/partner-contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPartnerDb();
      } else {
        alert(data.error || '삭제 실패');
      }
    } catch (err) {
      alert('삭제 중 서버 오류');
    }
  };

  // Handle Excel File Drop / Upload
  const handleExcelFileSelect = async (file: File) => {
    setExcelFile(file);
    setExcelParsing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/partners/parse-excel', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setParsedHeaders(data.headers || []);
        setUserMapping(data.autoMapping || {});
        setParsedRowsRaw(data.rowsRaw || []);
        setExcelStep('MAP_COLUMNS');
      } else {
        alert(data.error || '엑셀 파일을 파싱하지 못했습니다.');
      }
    } catch (err) {
      alert('엑셀 업로드 처리 중 오류 발생');
    } finally {
      setExcelParsing(false);
    }
  };

  // Proceed from Column Mapping to Duplicate Check
  const handleProceedToDuplicateCheck = async () => {
    // Map raw rows to standard candidate objects using userMapping
    const mappedItems: Partial<PartnerContactRecord>[] = parsedRowsRaw.map((row) => {
      const item: Record<string, string> = { source: excelFile ? `엑셀 (${excelFile.name})` : '엑셀 업로드' };
      Object.entries(userMapping).forEach(([header, targetField]) => {
        if (targetField && (row as any)[header] !== undefined) {
          item[targetField as string] = String((row as any)[header]).trim();
        }
      });
      return item as Partial<PartnerContactRecord>;
    });

    setImporting(true);
    try {
      const res = await fetch('/api/partners/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mappedItems }),
      });
      const data = await res.json();
      if (data.success) {
        const dupList: PartnerDbDuplicateItem[] = data.duplicates || [];
        setDuplicates(dupList);
        setExcelStep('DUPLICATE_CHECK');
      } else {
        alert(data.error || '중복 체크 실패');
      }
    } catch (err) {
      alert('중복 체크 중 통신 오류');
    } finally {
      setImporting(false);
    }
  };

  // Final Batch Import
  const handleExecuteBatchImport = async () => {
    // Build list of items with selected duplicate action
    const itemsWithActions = parsedRowsRaw.map((row, idx) => {
      const item: Record<string, string> = { source: excelFile ? `엑셀 (${excelFile.name})` : '엑셀 업로드' };
      Object.entries(userMapping).forEach(([header, targetField]) => {
        if (targetField && (row as any)[header] !== undefined) {
          item[targetField as string] = String((row as any)[header]).trim();
        }
      });

      const dupMatch = duplicates.find((d) => d.importIndex === idx);
      return {
        item: item as Partial<PartnerContactRecord>,
        action: dupMatch ? dupMatch.chosenAction : ('ADD_NEW' as DuplicateActionType),
        targetPartnerId: dupMatch?.existingPartner?.id,
        targetContactId: dupMatch?.existingContact?.id,
      };
    });

    setImporting(true);
    try {
      const res = await fetch('/api/partners/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsWithActions }),
      });
      const data = await res.json();
      if (data.success) {
        setImportResult({
          addedCount: data.addedCount,
          updatedCount: data.updatedCount,
          skippedCount: data.skippedCount,
        });
        setExcelStep('COMPLETE');
        fetchPartnerDb();
      } else {
        alert(data.error || '가져오기 실행 실패');
      }
    } catch (err) {
      alert('배치 가져오기 중 오류 발생');
    } finally {
      setImporting(false);
    }
  };

  // Manual Registration Handler
  const handleManualCardEntry = () => {
    setCardFile(null);
    setCardPreviewUrl(null);
    setCardDuplicateMatch(null);
    setIsQuotaFallback(false);
    setFallbackNoticeMsg(null);
    setRawOcrText('');
    setShowRawTextSection(false);
    setOcrCandidates(null);
    setExtractedCardForm({
      companyName: '',
      brandName: '',
      contactName: '',
      title: '',
      department: '',
      email: '',
      phone: '',
      website: '',
      industry: '',
      internalOwner: '박서현',
      notes: '',
      source: '수동 직접 입력',
    });
  };

  // Handle Business Card File Drop / OCR Processing
  const handleCardFileSelect = async (file: File) => {
    setCardFile(file);
    setCardPreviewUrl(URL.createObjectURL(file));
    setOcrAnalyzing(true);
    setExtractedCardForm(null);
    setCardDuplicateMatch(null);
    setIsQuotaFallback(false);
    setFallbackNoticeMsg(null);
    setRawOcrText('');
    setShowRawTextSection(false);
    setOcrCandidates(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/partners/ocr-business-card', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.isQuotaFallback) {
        setIsQuotaFallback(true);
        setFallbackNoticeMsg(data.fallbackNotice || 'AI OCR 사용량 한도로 자동 문자 인식 모드로 전환합니다.');
      }

      if (data.success && data.extracted) {
        const ext = data.extracted;
        setRawOcrText(data.rawText || ext.rawText || '');
        setOcrCandidates(ext.candidates || null);

        const form: Partial<PartnerContactRecord> = {
          companyName: ext.companyName || '',
          brandName: ext.brandName || '',
          contactName: ext.contactName || '',
          title: ext.title || '',
          department: ext.department || '',
          email: ext.email || '',
          phone: ext.phone || ext.mobile || '',
          website: ext.website || '',
          industry: ext.industry || '',
          internalOwner: '박서현',
          notes: ext.notes || '',
          source: data.isQuotaFallback ? `명함 문자 OCR (${file.name})` : `명함 AI OCR (${file.name})`,
        };
        setExtractedCardForm(form);

        // Check duplicate for single card
        const checkRes = await fetch('/api/partners/check-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [form] }),
        });
        const checkData = await checkRes.json();
        if (checkData.success && checkData.duplicates && checkData.duplicates.length > 0) {
          setCardDuplicateMatch(checkData.duplicates[0]);
        }
      } else {
        setIsQuotaFallback(true);
        setFallbackNoticeMsg('AI OCR 사용량 한도로 자동 문자 인식 모드로 전환합니다.');
        handleManualCardEntry();
      }
    } catch (err) {
      setIsQuotaFallback(true);
      setFallbackNoticeMsg('AI OCR 사용량 한도로 자동 문자 인식 모드로 전환합니다.');
      handleManualCardEntry();
    } finally {
      setOcrAnalyzing(false);
    }
  };

  // Save Single Business Card Contact
  const handleSaveCardContact = async (action: DuplicateActionType = 'ADD_NEW') => {
    if (!extractedCardForm) return;

    setCardSaving(true);
    try {
      const itemWithAction = [
        {
          item: extractedCardForm,
          action: action,
          targetContactId: cardDuplicateMatch?.existingContact?.id,
          targetPartnerId: cardDuplicateMatch?.existingPartner?.id,
        },
      ];

      const res = await fetch('/api/partners/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsWithActions: itemWithAction }),
      });
      const data = await res.json();
      if (data.success) {
        alert('명함 정보가 파트너 DB에 안전하게 저장되었습니다!');
        setCardFile(null);
        setCardPreviewUrl(null);
        setExtractedCardForm(null);
        setCardDuplicateMatch(null);
        setActiveSubTab('directory');
        fetchPartnerDb();
      } else {
        alert(data.error || '명함 저장 실패');
      }
    } catch (err) {
      alert('명함 저장 중 서버 오류 발생');
    } finally {
      setCardSaving(false);
    }
  };

  const handleCleanupExistingDb = async () => {
    if (
      !window.confirm(
        '기존 파트너 DB(85건)의 대표명 표기(브랜드 우선 적용) 및 이메일/연락처/URL 혼합 필드 자동 정제를 진행하시겠습니까?'
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/partners/cleanup-existing', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || '기존 데이터 정제가 완료되었습니다.');
        fetchPartnerDb();
      } else {
        alert(data.error || '정제 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#736152] text-white rounded-2xs">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold font-serif text-[#2C2C2C]">파트너 DB 및 명함 관리</h1>
              <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#736152] border border-[#D9D3C7] text-xs font-semibold rounded-2xs">
                Firestore 연동 완료
              </span>
            </div>
            <p className="text-xs text-[#5C4E43]">
              기존 제휴사, 명함 정보, 담당자 연락처를 한곳에서 검색하고, Excel/CSV 및 명함 OCR 스캔으로 일괄
              등록합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-2">
            <button
              type="button"
              onClick={handleCleanupExistingDb}
              className="px-3 py-2 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 text-xs font-bold rounded-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="기존 85건 표기 오류 및 이메일/전화/URL 혼합 필드 정제"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>기존 DB 85건 자동 정제</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-white text-[#5C4E43] border border-[#D9D3C7] hover:bg-[#FAF8F5] text-xs font-bold rounded-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#736152]" />
              <span>엑셀 다운로드 (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingContact({
                  companyName: '',
                  contactName: '',
                  title: '',
                  department: '',
                  email: '',
                  phone: '',
                  industry: '기타',
                  source: '직접 등록',
                  internalOwner: '박서현',
                });
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>신규 등록</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex border-b border-[#E8E4DC] gap-2 pt-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('directory')}
            className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeSubTab === 'directory'
                ? 'border-[#736152] text-[#736152] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C7A6B] hover:text-[#5C4E43]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>전체 파트너 DB ({contacts.length}건)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('upload_excel');
              setExcelStep('SELECT_FILE');
            }}
            className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeSubTab === 'upload_excel'
                ? 'border-[#736152] text-[#736152] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C7A6B] hover:text-[#5C4E43]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>1. 파일 업로드 (Excel / CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('ocr_card')}
            className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeSubTab === 'ocr_card'
                ? 'border-[#736152] text-[#736152] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C7A6B] hover:text-[#5C4E43]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-700" />
            <span>2. 명함/PDF 스캔 (AI/OCR)</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SUB-TAB 1: DIRECTORY VIEW                  */}
      {/* ========================================== */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls & Search Bar */}
          <div className="bg-white border border-[#E8E4DC] rounded-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C7A6B]" />
              <input
                type="text"
                placeholder="회사명, 담당자, 이메일, 전화번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:outline-none focus:border-[#736152]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              <div className="flex items-center space-x-1 text-xs text-[#5C4E43]">
                <Filter className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span>업종:</span>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-2 py-1 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                >
                  <option value="ALL">전체 업종</option>
                  {industriesList.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1 text-xs text-[#5C4E43]">
                <span>출처:</span>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-2 py-1 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                >
                  <option value="ALL">전체 출처</option>
                  {sourcesList.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={fetchPartnerDb}
                className="p-1.5 bg-[#FAF8F5] border border-[#D9D3C7] hover:bg-[#E8E4DC] rounded-2xs text-[#5C4E43] cursor-pointer shrink-0"
                title="새로고침"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table / Card List */}
          {loading ? (
            <div className="bg-white border border-[#E8E4DC] rounded-xs p-12 text-center text-xs text-[#8C7A6B]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#736152] mb-2" />
              <span>파트너 DB 및 담당자 정보를 불러오는 중입니다...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="bg-white border border-[#E8E4DC] rounded-xs p-12 text-center space-y-2 text-xs text-[#8C7A6B]">
              <Building2 className="w-8 h-8 mx-auto text-[#D9D3C7]" />
              <p className="font-semibold text-[#5C4E43]">검색 결과 조건에 맞는 파트너 정보가 없습니다.</p>
              <p>상단 '신규 등록' 또는 '파일 업로드/명함 OCR' 탭에서 새 제휴사 및 담당자를 추가하세요.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E8E4DC] rounded-xs overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#5C4E43] font-bold border-b border-[#E8E4DC]">
                    <tr>
                      <th className="py-3 px-4">회사명 / 브랜드</th>
                      <th className="py-3 px-4">담당자 / 직급</th>
                      <th className="py-3 px-4">연락처 / 이메일</th>
                      <th className="py-3 px-4">업종</th>
                      <th className="py-3 px-4">내부 담당</th>
                      <th className="py-3 px-4">출처</th>
                      <th className="py-3 px-4 text-right">기능 연동 및 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1] text-[#333333]">
                    {filteredContacts.map((c) => {
                      const nameInfo = getRepresentativeDisplayName(c.companyName, c.brandName);
                      return (
                        <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="py-3 px-4 font-semibold">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#2C2C2C] text-sm block">
                                {nameInfo.primaryName}
                              </span>
                              {nameInfo.secondaryName && (
                                <span className="text-[11px] text-[#736152] font-medium block">
                                  {nameInfo.secondaryName}
                                </span>
                              )}
                              <div className="flex flex-col space-y-0.5 pt-0.5">
                                {c.website && (
                                  <a
                                    href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-blue-600 hover:underline flex items-center space-x-0.5"
                                  >
                                    <span>{c.website}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                                {c.instagramUrl && (
                                  <a
                                    href={c.instagramUrl.startsWith('http') ? c.instagramUrl : `https://${c.instagramUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-pink-600 hover:underline flex items-center space-x-0.5 font-medium"
                                  >
                                    <span>Insta: {c.instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '@')}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#2C2C2C]">{c.contactName || '-'}</span>
                            <div className="text-[11px] text-[#8C7A6B]">
                              {[c.title, c.department].filter(Boolean).join(' / ') || '직급 미지정'}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-0.5 font-mono text-[11px]">
                            {c.email ? (
                              <div className="text-[#333333] font-medium">{c.email}</div>
                            ) : (
                              <div className="text-gray-400 font-normal">이메일 없음</div>
                            )}
                            {c.phone ? (
                              <div className="text-[#5C4E43]">{c.phone}</div>
                            ) : (
                              <div className="text-gray-400 font-normal">전화번호 없음</div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#5C4E43] border border-[#E8E4DC] text-[11px] font-medium rounded-2xs">
                            {c.industry || '기타'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[#5C4E43] font-medium">
                          {c.internalOwner || '박서현'}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#8C7A6B]">
                          {c.source || '수동'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContact(c);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-[#5C4E43] hover:text-[#736152] hover:bg-[#FAF8F5] rounded-2xs border border-[#D9D3C7] cursor-pointer"
                              title="수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-2xs border border-red-200 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 2: EXCEL / CSV UPLOAD FLOW         */}
      {/* ========================================== */}
      {activeSubTab === 'upload_excel' && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 shadow-2xs space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-4 text-xs font-semibold">
            <div
              className={`flex items-center space-x-1.5 ${
                excelStep === 'SELECT_FILE' ? 'text-[#736152] font-bold' : 'text-[#8C7A6B]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D9D3C7] flex items-center justify-center text-[11px]">
                1
              </span>
              <span>1. 파일 선택 (XLSX/CSV)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D9D3C7]" />

            <div
              className={`flex items-center space-x-1.5 ${
                excelStep === 'MAP_COLUMNS' ? 'text-[#736152] font-bold' : 'text-[#8C7A6B]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D9D3C7] flex items-center justify-center text-[11px]">
                2
              </span>
              <span>2. 컬럼 매핑</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D9D3C7]" />

            <div
              className={`flex items-center space-x-1.5 ${
                excelStep === 'PREVIEW_DATA' ? 'text-[#736152] font-bold' : 'text-[#8C7A6B]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D9D3C7] flex items-center justify-center text-[11px]">
                3
              </span>
              <span>3. 데이터 미리보기</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D9D3C7]" />

            <div
              className={`flex items-center space-x-1.5 ${
                excelStep === 'DUPLICATE_CHECK' ? 'text-[#736152] font-bold' : 'text-[#8C7A6B]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-[#D9D3C7] flex items-center justify-center text-[11px]">
                4
              </span>
              <span>4. 중복 확인 및 저장</span>
            </div>
          </div>

          {/* STEP 1: Select File */}
          {excelStep === 'SELECT_FILE' && (
            <div className="space-y-4">
              <div className="p-8 border-2 border-dashed border-[#D9D3C7] hover:border-[#736152] rounded-xs bg-[#FAF8F5] text-center space-y-3 transition-colors">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-[#736152]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#2C2C2C]">Excel(.xlsx, .xls) 또는 CSV 파일 업로드</h3>
                  <p className="text-xs text-[#8C7A6B]">
                    기존 제휴사 및 명함 데이터 목록 파일을 선택하면 컬럼명을 자동 인식하여 매핑합니다.
                  </p>
                </div>

                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>컴퓨터에서 파일 선택</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleExcelFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xs border border-[#E8E4DC] text-xs space-y-1 text-[#5C4E43]">
                <span className="font-bold flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-[#736152]" />
                  <span>지원하는 컬럼 명칭 예시:</span>
                </span>
                <p className="text-[11px] text-[#8C7A6B] leading-relaxed">
                  회사명, 브랜드명, 담당자명, 직급, 부서, 이메일, 전화번호(휴대폰), 홈페이지, 업종, 내부담당자, 최근
                  제휴 내용, 메모, 출처 등
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Map Columns */}
          {excelStep === 'MAP_COLUMNS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C]">컬럼 매핑 확인 및 수정</h3>
                  <p className="text-xs text-[#8C7A6B]">
                    업로드된 파일의 헤더({parsedHeaders.length}개)와 시스템 표준 필드를 연결합니다.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#736152] bg-[#FAF8F5] px-3 py-1 border border-[#E8E4DC] rounded-2xs">
                  총 {parsedRowsRaw.length}건 데이터 감지
                </span>
              </div>

              <div className="border border-[#E8E4DC] rounded-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#5C4E43] font-bold border-b border-[#E8E4DC]">
                    <tr>
                      <th className="py-2.5 px-4">엑셀 파일 컬럼명 (원본)</th>
                      <th className="py-2.5 px-4">샘플 데이터 (첫 행)</th>
                      <th className="py-2.5 px-4">매핑할 시스템 표준 필드</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {parsedHeaders.map((header) => {
                      const sampleVal = parsedRowsRaw[0]?.[header] ?? '-';
                      const currentMapped = userMapping[header] || '';

                      return (
                        <tr key={header} className="hover:bg-[#FAF8F5]">
                          <td className="py-2.5 px-4 font-bold text-[#2C2C2C]">{header}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-[#5C4E43] max-w-xs truncate">
                            {String(sampleVal)}
                          </td>
                          <td className="py-2.5 px-4">
                            <select
                              value={currentMapped}
                              onChange={(e) =>
                                setUserMapping((prev) => ({ ...prev, [header]: e.target.value }))
                              }
                              className="w-full px-2 py-1 bg-white border border-[#D9D3C7] rounded-2xs text-xs font-medium focus:outline-none focus:border-[#736152]"
                            >
                              <option value="">(매핑 안 함 / 제외)</option>
                              {Object.entries(STANDARD_PARTNER_FIELDS_KEYS).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label} ({key})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExcelStep('SELECT_FILE')}
                  className="px-4 py-2 border border-[#D9D3C7] text-xs font-bold rounded-2xs text-[#5C4E43] hover:bg-[#FAF8F5]"
                >
                  취소 및 다시 선택
                </button>
                <button
                  type="button"
                  onClick={() => setExcelStep('PREVIEW_DATA')}
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>다음: 데이터 미리보기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview Data */}
          {excelStep === 'PREVIEW_DATA' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C]">매핑 결과 데이터 미리보기</h3>
                  <p className="text-xs text-[#8C7A6B]">
                    대표명 표기 규칙(회사명 &gt; 브랜드명) 및 연락처/이메일/URL 분리 결과가 반영된 미리보기입니다.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#736152] bg-[#FAF8F5] px-3 py-1 border border-[#E8E4DC] rounded-2xs">
                  총 {parsedRowsRaw.length}건
                </span>
              </div>

              <div className="border border-[#E8E4DC] rounded-2xs overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#5C4E43] font-bold border-b border-[#E8E4DC] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">대표 표시명</th>
                      <th className="py-2.5 px-3">회사명</th>
                      <th className="py-2.5 px-3">브랜드명</th>
                      <th className="py-2.5 px-3">담당자</th>
                      <th className="py-2.5 px-3">직급/부서</th>
                      <th className="py-2.5 px-3">이메일</th>
                      <th className="py-2.5 px-3">전화번호</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {parsedRowsRaw.map((row, idx) => {
                      const item: Record<string, string> = {};
                      Object.entries(userMapping).forEach(([header, fieldKey]) => {
                        const fk = String(fieldKey);
                        if (fk && (row as Record<string, any>)[header] !== undefined) {
                          item[fk] = String((row as Record<string, any>)[header]).trim();
                        }
                      });

                      const rep = getRepresentativeDisplayName(item.companyName, item.brandName);

                      return (
                        <tr key={idx} className="hover:bg-[#FAF8F5]">
                          <td className="py-2 px-3 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-[#2C2C2C]">
                            {rep.primaryName}
                            {rep.secondaryName && (
                              <span className="block text-[10px] text-[#736152] font-normal">{rep.secondaryName}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[#5C4E43]">{item.companyName || '-'}</td>
                          <td className="py-2 px-3 text-[#5C4E43]">{item.brandName || '-'}</td>
                          <td className="py-2 px-3 font-semibold text-[#2C2C2C]">{item.contactName || '-'}</td>
                          <td className="py-2 px-3 text-[#8C7A6B]">
                            {[item.title, item.department].filter(Boolean).join(' / ') || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#333333]">{item.email || '-'}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#5C4E43]">{item.phone || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExcelStep('MAP_COLUMNS')}
                  className="px-4 py-2 border border-[#D9D3C7] text-xs font-bold rounded-2xs text-[#5C4E43] hover:bg-[#FAF8F5]"
                >
                  이전: 컬럼 매핑
                </button>
                <button
                  type="button"
                  onClick={handleProceedToDuplicateCheck}
                  disabled={importing}
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {importing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>다음: 중복 체크 및 저장</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Duplicate Check & Action Choice */}
          {excelStep === 'DUPLICATE_CHECK' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2C2C2C]">중복 감지 결과 및 처리 선택</h3>
                  <p className="text-xs text-[#8C7A6B]">
                    총 {parsedRowsRaw.length}건 중 {duplicates.length}건의 중복 후보가 감지되었습니다. 각 항목별
                    처리 방식을 선택하세요.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicates((prev) => prev.map((d) => ({ ...d, chosenAction: 'UPDATE' })));
                    }}
                    className="px-2.5 py-1 bg-white border border-[#D9D3C7] hover:bg-[#FAF8F5] rounded-2xs text-[11px] font-semibold text-[#5C4E43]"
                  >
                    전체 기존정보 업데이트
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicates((prev) => prev.map((d) => ({ ...d, chosenAction: 'ADD_NEW' })));
                    }}
                    className="px-2.5 py-1 bg-white border border-[#D9D3C7] hover:bg-[#FAF8F5] rounded-2xs text-[11px] font-semibold text-[#5C4E43]"
                  >
                    전체 신규 추가
                  </button>
                </div>
              </div>

              {duplicates.length === 0 ? (
                <div className="bg-[#FAF8F5] border border-[#E8E4DC] p-6 text-center space-y-2 rounded-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-[#2C2C2C]">중복되는 기존 파트너 연락처가 없습니다.</p>
                  <p className="text-xs text-[#8C7A6B]">전체 데이터({parsedRowsRaw.length}건)가 신규 파트너로 등록됩니다.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {duplicates.map((dup) => {
                    const incName = getRepresentativeDisplayName(dup.incoming.companyName, dup.incoming.brandName);
                    return (
                      <div
                        key={dup.importIndex}
                        className="bg-amber-50/50 border border-amber-200 rounded-xs p-4 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded-2xs text-[10px]">
                              {dup.matchReason}
                            </span>
                            <h4 className="font-bold text-[#2C2C2C] text-sm pt-1">
                              업로드 건: {incName.primaryName} ({dup.incoming.contactName || '담당자'})
                            </h4>
                            {incName.secondaryName && (
                              <p className="text-[10px] text-[#736152]">{incName.secondaryName}</p>
                            )}
                            <p className="text-[11px] text-[#5C4E43]">
                              이메일: {dup.incoming.email || '-'} | 전화: {dup.incoming.phone || '-'}
                            </p>
                          </div>

                        {/* Action Select Buttons */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDuplicates((prev) =>
                                prev.map((d) =>
                                  d.importIndex === dup.importIndex ? { ...d, chosenAction: 'UPDATE' } : d
                                )
                              );
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-2xs border transition-colors ${
                              dup.chosenAction === 'UPDATE'
                                ? 'bg-[#736152] text-white border-[#736152]'
                                : 'bg-white text-[#5C4E43] border-[#D9D3C7]'
                            }`}
                          >
                            기존 정보 업데이트
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDuplicates((prev) =>
                                prev.map((d) =>
                                  d.importIndex === dup.importIndex ? { ...d, chosenAction: 'ADD_NEW' } : d
                                )
                              );
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-2xs border transition-colors ${
                              dup.chosenAction === 'ADD_NEW'
                                ? 'bg-[#736152] text-white border-[#736152]'
                                : 'bg-white text-[#5C4E43] border-[#D9D3C7]'
                            }`}
                          >
                            새 연락처 추가
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDuplicates((prev) =>
                                prev.map((d) =>
                                  d.importIndex === dup.importIndex ? { ...d, chosenAction: 'SKIP' } : d
                                )
                              );
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-2xs border transition-colors ${
                              dup.chosenAction === 'SKIP'
                                ? 'bg-gray-700 text-white border-gray-700'
                                : 'bg-white text-gray-500 border-gray-300'
                            }`}
                          >
                            무시 (제외)
                          </button>
                        </div>
                      </div>

                      {dup.existingContact && (
                        <div className="bg-white p-2.5 rounded-2xs border border-amber-200 text-[11px] text-[#5C4E43] flex items-center justify-between">
                          <span>
                            <strong>기존 저장된 연락처:</strong> {dup.existingContact.companyName} /{' '}
                            {dup.existingContact.contactName} ({dup.existingContact.email || '이메일없음'})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => setExcelStep('PREVIEW_DATA')}
                  className="px-4 py-2 border border-[#D9D3C7] text-xs font-bold rounded-2xs text-[#5C4E43]"
                >
                  이전 단계 (미리보기)
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBatchImport}
                  disabled={importing}
                  className="px-6 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {importing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>DB 일괄 저장 완료</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Complete Screen */}
          {excelStep === 'COMPLETE' && importResult && (
            <div className="bg-[#FAF8F5] border border-[#E8E4DC] p-8 rounded-xs text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#2C2C2C]">엑셀 파트너 DB 가져오기가 완료되었습니다!</h3>
                <p className="text-xs text-[#5C4E43]">
                  신규 추가: <strong>{importResult.addedCount}</strong>건 | 업데이트:{' '}
                  <strong>{importResult.updatedCount}</strong>건 | 무시: <strong>{importResult.skippedCount}</strong>건
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('directory')}
                  className="px-5 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs cursor-pointer shadow-2xs"
                >
                  전체 DB 목록으로 이동하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* SUB-TAB 3: BUSINESS CARD / PDF OCR FLOW    */}
      {/* ========================================== */}
      {activeSubTab === 'ocr_card' && (
        <div className="bg-white border border-[#E8E4DC] rounded-xs p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#F0ECE1] pb-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold font-serif text-[#2C2C2C]">명함 이미지 및 PDF 스캔 (AI/OCR)</h2>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                명함 이미지(JPG, PNG) 또는 PDF 명함 파일을 업로드하면 AI/문자 패턴 인식이 회사명, 담당자, 전화, 이메일을 자동 추출합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleManualCardEntry}
              className="px-3.5 py-1.5 border border-[#D9D3C7] hover:bg-[#FAF8F5] text-[#5C4E43] text-xs font-bold rounded-2xs flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#736152]" />
              <span>직접 입력</span>
            </button>
          </div>

          {/* Quota Fallback Alert Banner */}
          {isQuotaFallback && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xs text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
                <span className="font-bold">
                  {fallbackNoticeMsg || 'AI OCR 사용량 한도로 자동 문자 인식 모드로 전환합니다.'}
                </span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                자동 정규식 엔진 가동
              </span>
            </div>
          )}

          {!cardFile && !extractedCardForm ? (
            <div className="p-8 border-2 border-dashed border-[#D9D3C7] hover:border-[#736152] rounded-xs bg-[#FAF8F5] text-center space-y-4 transition-colors">
              <CreditCard className="w-12 h-12 mx-auto text-[#736152]" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#2C2C2C]">명함 이미지 또는 PDF 선택</h3>
                <p className="text-xs text-[#8C7A6B]">JPG, PNG, PDF 파일 지원 (명함 카메라 촬영 이미지도 가능)</p>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>명함 파일 업로드</span>
                  <input
                    type="file"
                    accept="image/*, .pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCardFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleManualCardEntry}
                  className="px-4 py-2 border border-[#D9D3C7] hover:bg-white text-[#5C4E43] text-xs font-bold rounded-2xs transition-colors shadow-2xs"
                >
                  직접 입력
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Card Image Preview */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#5C4E43]">업로드된 원본 명함</h3>
                <div className="border border-[#E8E4DC] rounded-2xs bg-[#FAF8F5] p-2 overflow-hidden flex items-center justify-center min-h-[200px]">
                  {cardFile && cardFile.type.includes('pdf') ? (
                    <div className="text-center p-6 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-[#736152]" />
                      <p className="text-xs font-bold text-[#2C2C2C]">{cardFile.name}</p>
                      <span className="text-[11px] text-[#8C7A6B]">PDF 문서 명함</span>
                    </div>
                  ) : cardPreviewUrl ? (
                    <img
                      src={cardPreviewUrl}
                      alt="Business card preview"
                      className="max-h-64 object-contain rounded-2xs"
                    />
                  ) : (
                    <div className="text-center p-6 text-xs text-[#8C7A6B] space-y-1">
                      <Edit2 className="w-8 h-8 mx-auto text-[#736152]" />
                      <p className="font-bold">수동 직접 입력 모드</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {cardFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setCardFile(null);
                        setCardPreviewUrl(null);
                        setExtractedCardForm(null);
                      }}
                      className="flex-1 py-1.5 border border-[#D9D3C7] text-xs font-bold text-[#5C4E43] hover:bg-[#FAF8F5] rounded-2xs"
                    >
                      다른 명함 선택
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleManualCardEntry}
                    className="flex-1 py-1.5 bg-[#F0ECE1] hover:bg-[#E8E4DC] text-xs font-bold text-[#2C2C2C] rounded-2xs"
                  >
                    직접 입력
                  </button>
                </div>
              </div>

              {/* Right Column: OCR Extraction Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-2">
                  <h3 className="text-xs font-bold text-[#2C2C2C]">OCR 추출 결과 검토 및 수정</h3>
                  <div className="flex items-center space-x-2">
                    {rawOcrText && (
                      <button
                        type="button"
                        onClick={() => setShowRawTextSection(!showRawTextSection)}
                        className="px-2 py-0.5 border border-[#D9D3C7] text-[#5C4E43] text-[10px] font-bold rounded-2xs flex items-center space-x-1 hover:bg-[#FAF8F5]"
                      >
                        <FileText className="w-3 h-3 text-[#736152]" />
                        <span>원문 텍스트 {showRawTextSection ? '숨기기' : '보기'}</span>
                      </button>
                    )}
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-2xs flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{isQuotaFallback ? '문자 인식 모드' : 'AI 검증 완료'}</span>
                    </span>
                  </div>
                </div>

                {/* Collapsible Raw OCR Text Viewer */}
                {showRawTextSection && rawOcrText && (
                  <div className="p-3 bg-[#1E1E1E] text-emerald-400 font-mono text-[11px] rounded-2xs space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-1 text-gray-400 font-sans text-[10px]">
                      <span>[OCR 감지 원문 텍스트]</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(rawOcrText);
                          alert('원문 텍스트가 클립보드에 복사되었습니다.');
                        }}
                        className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-[10px]"
                      >
                        복사하기
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap max-h-36 overflow-y-auto">{rawOcrText}</pre>
                  </div>
                )}

                {ocrAnalyzing ? (
                  <div className="p-10 text-center space-y-2 bg-[#FAF8F5] rounded-2xs border border-[#E8E4DC]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#736152] mx-auto" />
                    <p className="text-xs font-bold text-[#2C2C2C]">명함 정보를 스캔하고 있습니다...</p>
                    <p className="text-[11px] text-[#8C7A6B]">
                      ★ AI Vision 및 정규식 패턴 분석으로 원본 텍스트를 추출합니다.
                    </p>
                  </div>
                ) : extractedCardForm ? (
                  <div className="space-y-4">
                    {/* Duplicate match alert if any */}
                    {cardDuplicateMatch && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xs text-xs space-y-1 text-amber-900">
                        <span className="font-bold flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span>기존 DB에서 유사 파트너 감지 ({cardDuplicateMatch.matchReason})</span>
                        </span>
                        <p className="text-[11px] text-amber-800">
                          기존 정보: {cardDuplicateMatch.existingContact?.companyName} /{' '}
                          {cardDuplicateMatch.existingContact?.contactName} ({cardDuplicateMatch.existingContact?.email})
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* 회사명 & candidates */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#5C4E43] font-bold">회사명 *</label>
                          {!extractedCardForm.companyName && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">
                              [확인 필요]
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={extractedCardForm.companyName || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, companyName: e.target.value }))
                          }
                          placeholder="회사명 입력"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:border-[#736152] font-semibold text-[#2C2C2C]"
                        />
                        {ocrCandidates?.companyCandidates?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] text-[#8C7A6B]">후보:</span>
                            {ocrCandidates.companyCandidates.map((cand: string, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setExtractedCardForm((prev) => ({ ...prev, companyName: cand }))
                                }
                                className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] rounded cursor-pointer transition-colors"
                              >
                                {cand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 담당자 성명 & candidates */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#5C4E43] font-bold">담당자 성명 *</label>
                          {!extractedCardForm.contactName && (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">
                              [확인 필요]
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={extractedCardForm.contactName || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, contactName: e.target.value }))
                          }
                          placeholder="이름 입력"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:border-[#736152] font-semibold text-[#2C2C2C]"
                        />
                        {ocrCandidates?.nameCandidates?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] text-[#8C7A6B]">후보:</span>
                            {ocrCandidates.nameCandidates.map((cand: string, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setExtractedCardForm((prev) => ({ ...prev, contactName: cand }))
                                }
                                className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 text-[10px] rounded cursor-pointer transition-colors"
                              >
                                {cand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 직급 & candidates */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#5C4E43] font-bold">직급</label>
                        </div>
                        <input
                          type="text"
                          value={extractedCardForm.title || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="직급 (예: 팀장, 대표이사)"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                        />
                        {ocrCandidates?.titleCandidates?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] text-[#8C7A6B]">후보:</span>
                            {ocrCandidates.titleCandidates.map((cand: string, idx: number) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setExtractedCardForm((prev) => ({ ...prev, title: cand }))
                                }
                                className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] rounded cursor-pointer transition-colors"
                              >
                                {cand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 부서 */}
                      <div>
                        <label className="block text-[#5C4E43] font-bold mb-1">부서</label>
                        <input
                          type="text"
                          value={extractedCardForm.department || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, department: e.target.value }))
                          }
                          placeholder="부서명"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                        />
                      </div>

                      {/* 이메일 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#5C4E43] font-bold">이메일</label>
                          {!extractedCardForm.email && (
                            <span className="text-[10px] text-gray-500 font-normal">미인식</span>
                          )}
                        </div>
                        <input
                          type="email"
                          value={extractedCardForm.email || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="example@company.com"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs font-mono text-xs"
                        />
                      </div>

                      {/* 휴대폰 / 대표전화 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#5C4E43] font-bold">휴대폰 / 대표전화</label>
                          {!extractedCardForm.phone && (
                            <span className="text-[10px] text-gray-500 font-normal">미인식</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={extractedCardForm.phone || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="010-0000-0000 또는 02-000-0000"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs font-mono text-xs"
                        />
                      </div>

                      {/* 홈페이지 */}
                      <div>
                        <label className="block text-[#5C4E43] font-bold mb-1">홈페이지</label>
                        <input
                          type="text"
                          value={extractedCardForm.website || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, website: e.target.value }))
                          }
                          placeholder="www.company.com"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                        />
                      </div>

                      {/* 업종 */}
                      <div>
                        <label className="block text-[#5C4E43] font-bold mb-1">업종</label>
                        <input
                          type="text"
                          value={extractedCardForm.industry || ''}
                          onChange={(e) =>
                            setExtractedCardForm((prev) => ({ ...prev, industry: e.target.value }))
                          }
                          placeholder="골프/리조트/마케팅 등"
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#5C4E43] font-bold mb-1">주소 / 메모 / 특이사항</label>
                      <textarea
                        rows={2}
                        value={extractedCardForm.notes || ''}
                        onChange={(e) =>
                          setExtractedCardForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="주소, 만난 장소, 주요 논의사항 등"
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE1]">
                      <button
                        type="button"
                        onClick={handleManualCardEntry}
                        className="px-3 py-1.5 border border-[#D9D3C7] hover:bg-[#FAF8F5] text-[#5C4E43] text-xs font-bold rounded-2xs"
                      >
                        양식 초기화
                      </button>

                      <div className="flex items-center space-x-2">
                        {cardDuplicateMatch ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveCardContact('UPDATE')}
                              disabled={cardSaving}
                              className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs"
                            >
                              기존 정보 업데이트 저장
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveCardContact('ADD_NEW')}
                              disabled={cardSaving}
                              className="px-4 py-2 bg-[#5C4E43] hover:bg-[#2C2C2C] text-white text-xs font-bold rounded-2xs shadow-2xs"
                            >
                              새 연락처로 저장
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSaveCardContact('ADD_NEW')}
                            disabled={cardSaving}
                            className="px-6 py-2.5 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {cardSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>파트너 DB에 저장</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Add/Edit Contact Modal */}
      {isModalOpen && editingContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E4DC] rounded-xs max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <h3 className="text-base font-bold font-serif text-[#2C2C2C]">
                {editingContact.id ? '파트너 담당자 정보 수정' : '신규 파트너 담당자 직접 등록'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingContact(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">회사명</label>
                  <input
                    type="text"
                    value={editingContact.companyName || ''}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="회사명이 없을 경우 비워두세요"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">브랜드명</label>
                  <input
                    type="text"
                    value={editingContact.brandName || ''}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, brandName: e.target.value }))
                    }
                    placeholder="예: 오뚜기, 네스프레소"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">담당자 성명 *</label>
                  <input
                    type="text"
                    required
                    value={editingContact.contactName || ''}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, contactName: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs focus:border-[#736152]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">직급</label>
                  <input
                    type="text"
                    value={editingContact.title || ''}
                    onChange={(e) => setEditingContact((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">부서</label>
                  <input
                    type="text"
                    value={editingContact.department || ''}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">이메일</label>
                  <input
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">전화번호</label>
                  <input
                    type="text"
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">홈페이지</label>
                  <input
                    type="text"
                    value={editingContact.website || ''}
                    onChange={(e) => setEditingContact((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={editingContact.instagramUrl || ''}
                    onChange={(e) => setEditingContact((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">업종</label>
                  <input
                    type="text"
                    value={editingContact.industry || ''}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4E43] mb-1">내부 담당자</label>
                  <input
                    type="text"
                    value={editingContact.internalOwner || '박서현'}
                    onChange={(e) =>
                      setEditingContact((prev) => ({ ...prev, internalOwner: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5C4E43] mb-1">메모</label>
                <textarea
                  rows={2}
                  value={editingContact.notes || ''}
                  onChange={(e) => setEditingContact((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D3C7] rounded-2xs text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#F0ECE1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 border border-[#D9D3C7] text-xs font-bold rounded-2xs text-[#5C4E43]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-2xs shadow-2xs"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDBView;
