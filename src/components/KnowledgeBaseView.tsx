import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeDocument, TargetBrand, DocCategory, KnowledgeBaseMetadata } from '../types';
import {
  Database,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  FileUp,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Layers,
  ArrowRight,
  Info,
  Server,
  X,
  ExternalLink,
  Download
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  onDocumentChange?: () => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt', '.json', '.md', '.png', '.jpg', '.jpeg', '.webp'];

async function safeFetchJson(url: string, options?: RequestInit) {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error('네트워크 연결 상태를 확인하지 못했습니다. 인터넷 상태를 확인해 주세요.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  }

  if (!res.ok || (data && data.success === false)) {
    if (res.status === 413) {
      throw new Error('파일 용량이 현재 업로드 한도(100MB)를 초과했습니다. 더 작은 용량의 파일로 분할하여 업로드해 주세요.');
    } else if (res.status === 400) {
      throw new Error(data?.error || '잘못된 업로드 요청입니다. 파일 및 입력 항목을 확인해 주세요.');
    } else if (res.status === 401 || res.status === 403) {
      throw new Error('업로드 권한이 없거나 인증 세션이 만료되었습니다.');
    } else if (res.status === 429) {
      throw new Error('서버 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.');
    } else if (res.status >= 500) {
      throw new Error(data?.error || `서버 처리 중 일시적인 오류가 발생했습니다. (HTTP ${res.status})`);
    }
    throw new Error(data?.error || `서버 응답 오류 (${res.status}): 요청을 처리할 수 없습니다.`);
  }

  return data || { success: true };
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onDocumentChange }) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [metadata, setMetadata] = useState<KnowledgeBaseMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [targetBrand, setTargetBrand] = useState<TargetBrand>('Oak Valley');
  const [category, setCategory] = useState<DocCategory>('회사소개서');
  const [version, setVersion] = useState('v1.0');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'ALL' | TargetBrand>('ALL');

  // Modals
  const [viewingDoc, setViewingDoc] = useState<KnowledgeDocument | null>(null);
  const [replacingDoc, setReplacingDoc] = useState<KnowledgeDocument | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceVersion, setReplaceVersion] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from backend
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await safeFetchJson('/api/knowledge/documents');
      if (data.success) {
        setDocuments(data.documents || []);
        setMetadata(data.metadata || null);
      }
    } catch (err: any) {
      console.error('Error fetching knowledge base docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Pre-upload validation & inspection
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        message: `지원되지 않는 파일 형식입니다. (${file.name})\n\n지원 가능 확장자: PDF, PPTX, PPT, DOCX, XLSX, CSV, TXT, 이미지`,
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        message: `파일 용량이 현재 업로드 한도(100MB)를 초과했습니다.\n\n• 선택한 파일: ${file.name} (${sizeMb} MB)\n• 지원 한도: 최대 100.0 MB\n\n100MB 이하의 파일로 분할하거나 용량을 축소해 주세요.`,
      };
    }
    return { valid: true };
  };

  // Helper to handle file selection with instant inspection
  const handleSelectFile = (file: File) => {
    const check = validateFile(file);
    if (!check.valid) {
      alert(`[파일 검사 불통과]\n\n${check.message}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (!docTitle.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setDocTitle(nameWithoutExt);
    }
  };

  // Handle File Selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0]);
    }
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const [uploadStage, setUploadStage] = useState<'IDLE' | 'UPLOADING' | 'SAVED' | 'PARSING' | 'INDEXING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload New Document via Sequential 6MB Chunks
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        alert('업로드할 파일(PDF, PPT, Word, Excel 등)을 선택해 주세요.');
      }
      return;
    }

    const titleToUse = docTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
    const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB per chunk to safely avoid Cloud Run 32MB payload limit
    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    const uploadId = `up-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      setUploading(true);

      // --- STAGE 1: 업로드 중 (Chunk Sequential Upload) ---
      setUploadStage('UPLOADING');
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunkBlob = selectedFile.slice(start, end);

        const chunkFormData = new FormData();
        chunkFormData.append('chunk', chunkBlob, `${selectedFile.name}.part${i}`);
        chunkFormData.append('uploadId', uploadId);
        chunkFormData.append('chunkIndex', i.toString());
        chunkFormData.append('totalChunks', totalChunks.toString());
        chunkFormData.append('fileName', selectedFile.name);

        const progressPercent = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgressText(`1/4. 업로드 중... (${i + 1}/${totalChunks} 청크, ${progressPercent}%)`);

        const chunkRes = await safeFetchJson('/api/knowledge/upload-chunk', {
          method: 'POST',
          body: chunkFormData,
        });

        if (!chunkRes.success) {
          throw new Error(chunkRes.error || '서버 저장에 실패했습니다.');
        }
      }

      // --- STAGE 2: 문서 저장 완료 ---
      setUploadStage('SAVED');
      setUploadProgressText('2/4. 문서 저장 완료 (서버 디스크 병합 검증)');
      await new Promise((r) => setTimeout(r, 400));

      // --- STAGE 3: 텍스트/표 추출 중 ---
      setUploadStage('PARSING');
      setUploadProgressText('3/4. 텍스트/표 추출 중 (PDF 텍스트 레이어 및 구조 파싱)');

      // --- STAGE 4: Knowledge Base 색인 중 ---
      setUploadStage('INDEXING');
      setUploadProgressText('4/4. Knowledge Base 색인 중 (RAG Chunking 및 AI 핵심 요약 생성)');

      const processRes = await safeFetchJson('/api/knowledge/process-assembled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          title: titleToUse,
          targetBrand,
          category,
          version: version || 'v1.0',
          originalName: selectedFile.name,
          fileSize: selectedFile.size,
        }),
      });

      if (processRes.success) {
        setUploadStage('COMPLETED');
        setDocuments(processRes.documents || []);
        setMetadata(processRes.metadata || null);

        // Reset form
        setSelectedFile(null);
        setDocTitle('');
        setVersion('v1.0');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onDocumentChange) onDocumentChange();
      } else {
        throw new Error(processRes.error || 'PDF 파싱에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadStage('ERROR');
      const msg = err.message || '문서 업로드 처리 중 오류가 발생했습니다.';
      setErrorMessage(msg);
    } finally {
      setUploading(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (doc: KnowledgeDocument) => {
    const nextStatus = doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const data = await safeFetchJson(`/api/knowledge/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (data.success) {
        setDocuments(data.documents || []);
        setMetadata(data.metadata || null);
        if (onDocumentChange) onDocumentChange();
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      alert(err.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  // Delete Document
  const handleDeleteDoc = async (doc: KnowledgeDocument) => {
    if (!confirm(`[${doc.title}] 자료를 삭제하시겠습니까?`)) return;

    try {
      const data = await safeFetchJson(`/api/knowledge/documents/${doc.id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setDocuments(data.documents || []);
        setMetadata(data.metadata || null);
        if (onDocumentChange) onDocumentChange();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || '삭제 중 오류가 발생했습니다.');
    }
  };

  // Replace Document
  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingDoc || !replaceFile) {
      alert('교체할 새 파일을 선택해 주세요.');
      return;
    }

    const check = validateFile(replaceFile);
    if (!check.valid) {
      alert(`[파일 검사 불통과]\n\n${check.message}`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgressText('새 버전 파일 업로드 및 AI 재파싱 수행 중...');

      const formData = new FormData();
      formData.append('file', replaceFile);
      if (replaceVersion) formData.append('version', replaceVersion);

      const data = await safeFetchJson(`/api/knowledge/replace/${replacingDoc.id}`, {
        method: 'POST',
        body: formData,
      });

      if (data.success) {
        setDocuments(data.documents || []);
        setMetadata(data.metadata || null);
        setReplacingDoc(null);
        setReplaceFile(null);
        setReplaceVersion('');
        if (onDocumentChange) onDocumentChange();
        alert(`[${replacingDoc.title}] 자료가 새 버전으로 교체되었습니다.`);
      } else {
        alert(data.error || '자료 교체 실패');
      }
    } catch (err: any) {
      alert(err.message || '교체 처리 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setUploadProgressText('');
    }
  };

  // Filtered Documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesBrand = brandFilter === 'ALL' || doc.targetBrand === brandFilter;
    const matchesQuery =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.extractedText && doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBrand && matchesQuery;
  });

  const activeDocCount = documents.filter((d) => d.status === 'ACTIVE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xs">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 font-serif">
                Oak Valley / PARK ROCHE Knowledge Base
              </h1>
              <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                관리자 전용
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              오크밸리 및 파크로쉬 공식 회사소개서, 시설사양서, Rate Card, 골프장/객실 자료를 직접 등록·업데이트합니다.
              등록된 최신 자료는 모든 AI 분석 시 <strong className="text-slate-900 underline">1순위(Highest Priority) 근거 자료</strong>로 자동 결합됩니다.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] text-slate-400 font-mono">ACTIVE KNOWLEDGE STATUS</p>
              <p className="text-sm font-bold text-slate-900">
                활성 문서 <span className="text-emerald-600 font-extrabold">{activeDocCount}</span> / 총 {documents.length}건
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-xs border text-xs font-bold flex items-center space-x-1.5 ${
              activeDocCount > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {activeDocCount > 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{activeDocCount > 0 ? 'AI 분석 연동 활성화' : '내부 자료 미등록'}</span>
            </div>
          </div>
        </div>

        {/* AI Evidence Priority Visual Rule Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xs p-3 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI 분석 근거 신뢰도 부여 순위 (Priority Sequence):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xs text-emerald-900 font-bold flex items-center justify-between">
              <span>① 내부 공식자료</span>
              <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.5 rounded-xs">최우선</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-xs text-slate-800 font-medium flex items-center justify-between">
              <span>② 기업/브랜드 공식자료</span>
              <span className="text-[10px] text-slate-500">2순위</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-xs text-slate-800 font-medium flex items-center justify-between">
              <span>③ 신뢰 외부 연구/통계</span>
              <span className="text-[10px] text-slate-500">3순위</span>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-xs text-slate-800 font-medium flex items-center justify-between">
              <span>④ 기타 공개 웹정보</span>
              <span className="text-[10px] text-slate-500">4순위</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          
          {/* Drag and Drop File Dropzone */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              공식 문서 파일 선택 / 드래그 (File Selection) <span className="text-red-500">*</span>
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt"
              className="hidden"
              id="knowledge-file-input"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 border-2 border-dashed rounded-xs cursor-pointer text-center transition-all flex flex-col items-center justify-center space-y-2 ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100/80'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center space-x-3 text-slate-900 font-semibold text-xs">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-xs truncate max-w-md">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 font-normal">
                      용량: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • 변경하려면 클릭하거나 다른 파일을 드래그하세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 hover:bg-emerald-200 text-emerald-800 rounded-xs transition-colors cursor-pointer"
                    title="선택 해제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-full text-slate-600 shadow-2xs">
                    <FileUp className="w-5 h-5 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      이곳에 <span className="text-emerald-700 underline">파일을 드래그</span>하거나 <span className="text-emerald-700 underline">클릭</span>하여 선택하세요
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PDF, PPT/PPTX, Word, Excel, CSV, TXT 지원 (최대 100MB 연속 청크 분할 업로드 지원)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload Stage Progress Stepper & Error Banners */}
          {uploading && (
            <div className="bg-emerald-950 text-white p-4 rounded-xs border border-emerald-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-xs font-bold text-emerald-200">대용량 파일 처리 및 AI 색인 진행 중</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">{uploadProgressText}</span>
              </div>

              {/* Stage indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className={`p-2 rounded-xs border flex items-center space-x-1.5 ${
                  uploadStage === 'UPLOADING' ? 'bg-emerald-700 border-emerald-400 font-bold text-white' : 'bg-emerald-900/50 border-emerald-800 text-emerald-400'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>1. 업로드 중</span>
                </div>
                <div className={`p-2 rounded-xs border flex items-center space-x-1.5 ${
                  uploadStage === 'SAVED' ? 'bg-emerald-700 border-emerald-400 font-bold text-white' : 'bg-emerald-900/50 border-emerald-800 text-emerald-400'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>2. 문서 저장 완료</span>
                </div>
                <div className={`p-2 rounded-xs border flex items-center space-x-1.5 ${
                  uploadStage === 'PARSING' ? 'bg-emerald-700 border-emerald-400 font-bold text-white' : 'bg-emerald-900/50 border-emerald-800 text-emerald-400'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>3. 텍스트/표 추출 중</span>
                </div>
                <div className={`p-2 rounded-xs border flex items-center space-x-1.5 ${
                  uploadStage === 'INDEXING' ? 'bg-emerald-700 border-emerald-400 font-bold text-white' : 'bg-emerald-900/50 border-emerald-800 text-emerald-400'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>4. KB 색인 & 등록 완료</span>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-xs text-xs space-y-1 flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">파일 처리 중 오류가 발생했습니다</p>
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Document Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                자료명 (Document Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="예: 2026 오크밸리 리조트 회사소개서"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Target Brand */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">적용 브랜드 (Target Brand)</label>
              <select
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value as TargetBrand)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
              >
                <option value="Oak Valley">Oak Valley (오크밸리)</option>
                <option value="PARK ROCHE">PARK ROCHE (파크로쉬)</option>
                <option value="공통">공통 (Oak Valley & PARK ROCHE)</option>
              </select>
            </div>

            {/* Version */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">버전 (Version)</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">자료 유형 (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocCategory)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
              >
                <option value="회사소개서">회사소개서</option>
                <option value="시설소개서">시설소개서</option>
                <option value="골프장 소개">골프장 소개</option>
                <option value="객실/리조트 소개">객실/리조트 소개</option>
                <option value="광고매체 Rate Card">광고매체 Rate Card</option>
                <option value="행사/제휴 사양서">행사/제휴 사양서</option>
                <option value="기타">기타 내부 자료</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>AI 파싱 업로드 중...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-white" />
                    <span>공식 자료 등록 및 AI 학습 연동</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {uploading && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2 text-xs text-emerald-800">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
              <span>{uploadProgressText}</span>
            </div>
          )}
        </form>
      </div>

      {/* Registered Documents Table List */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden space-y-4">
        
        {/* Table Top Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>등록된 내부 Knowledge Base 문서 ({filteredDocuments.length}건)</span>
            </h2>
            <p className="text-xs text-slate-500">
              '활성' 상태인 문서는 모든 Intelligence 분석에 실시간으로 반영됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="자료명, 유형, 키워드 검색..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none focus:border-slate-900 w-48 sm:w-56"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value as any)}
              className="px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">전체 브랜드</option>
              <option value="Oak Valley">Oak Valley</option>
              <option value="PARK ROCHE">PARK ROCHE</option>
              <option value="공통">공통</option>
            </select>

            <button
              onClick={fetchDocuments}
              className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xs text-slate-700 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            <span>등록된 Knowledge Base 문서를 불러오는 중입니다...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* Empty State Required by Prompt */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                등록된 내부자료가 없습니다. 회사소개서를 업로드해주세요.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                오크밸리 또는 파크로쉬의 회사소개서, 시설사양서, Rate Card, 객실/골프장 정보 파일을 상단 폼에서 업로드해 주시면 AI 분석 시 1순위 근거로 연동됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-4">자료명 / 요약</th>
                  <th className="py-2.5 px-3">자료 유형</th>
                  <th className="py-2.5 px-3">적용 브랜드</th>
                  <th className="py-2.5 px-3">등록일 / 용량</th>
                  <th className="py-2.5 px-3">버전</th>
                  <th className="py-2.5 px-3 text-center">AI 연동 상태</th>
                  <th className="py-2.5 px-4 text-right">삭제 / 교체 / 상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Title & Summary */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {doc.summary || 'AI 파싱 발췌 준비 완료'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-xs font-medium text-slate-700 text-[11px]">
                        {doc.category}
                      </span>
                    </td>

                    {/* Target Brand */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <span className={`inline-block px-2 py-0.5 rounded-xs text-[11px] ${
                        doc.targetBrand === 'Oak Valley'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : doc.targetBrand === 'PARK ROCHE'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {doc.targetBrand}
                      </span>
                    </td>

                    {/* Upload Date & Size */}
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      <div>{doc.uploadDate}</div>
                      <div className="text-[10px] text-slate-400">
                        {doc.fileType} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </td>

                    {/* Version */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-xs text-[11px]">
                        {doc.version || 'v1.0'}
                      </span>
                    </td>

                    {/* Active Status Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(doc)}
                        className={`inline-flex items-center px-2 py-1 rounded-xs text-[11px] font-bold border cursor-pointer transition-colors ${
                          doc.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {doc.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            <span>활성 (AI 사용중)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1 text-slate-400" />
                            <span>비활성</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: View Text / Open File / Replace / Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <a
                          href={`/api/knowledge/documents/${doc.id}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
                          title="원본 파일 열기"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xs transition-colors cursor-pointer"
                          title="AI 학습 원문 텍스트 확인"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setReplacingDoc(doc);
                            setReplaceVersion('');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xs transition-colors cursor-pointer"
                          title="새 버전 파일로 교체"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteDoc(doc)}
                          className="px-2 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xs transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Architecture & Enterprise Storage Guide Card (Requirement 7 Explanation) */}
      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-sm p-6 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Server className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 className="text-sm font-bold text-white font-serif">
            지식 기반 AI 분석 및 데이터 관리 안내
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-1">
          <div className="space-y-1.5 p-3 bg-slate-800/60 rounded-xs border border-slate-700">
            <div className="font-bold text-emerald-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>현재 환경 실제 동작 시스템:</span>
            </div>
            <p className="leading-relaxed">
              업로드된 문서(PDF/PPT/Word/Excel)는 로컬 저장소에 지속 저장되며,
              스마트 문서 분석 시스템을 통해 텍스트, 구조화된 표, 스펙, 단가표로 원문 정밀 추출됩니다.
              이후 모든 제휴·트렌드 AI 요청 시 최우선 컨텍스트로 실시간 주입되어 사실 기반 AI 분석을 수행합니다.
            </p>
          </div>

          <div className="space-y-1.5 p-3 bg-slate-800/60 rounded-xs border border-slate-700">
            <div className="font-bold text-blue-300 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>대용량 아카이브 확장 안내:</span>
            </div>
            <p className="leading-relaxed">
              수백 건의 리조트 도면, 고용량 스캔 PDF, 영상/이미지 아카이브로 구축 규모 확장 시:
              <br />
              1) <strong>클라우드 스토리지</strong> 버킷 연동
              <br />
              2) <strong>통합 데이터베이스 아카이브 검색 연동</strong>을 통한 청크 분할 및 시맨틱 임베딩 검색 적용.
            </p>
          </div>
        </div>
      </div>

      {/* Modal 1: View Extracted Text */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-300 shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{viewingDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    {viewingDoc.targetBrand} • {viewingDoc.category} • {viewingDoc.version} • {viewingDoc.uploadDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-xs cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono bg-slate-50/50 flex-1">
              <div className="p-3 bg-white border border-slate-200 rounded-xs space-y-1">
                <p className="text-[11px] font-sans font-bold text-slate-500 uppercase">AI 문서 요약 (Summary)</p>
                <p className="text-slate-800 font-sans leading-relaxed">{viewingDoc.summary}</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xs space-y-1">
                <p className="text-[11px] font-sans font-bold text-slate-500 uppercase">
                  AI 파싱/추출된 학습 원문 텍스트 (Full Extracted Context)
                </p>
                <pre className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[11px] font-sans">
                  {viewingDoc.extractedText || '추출된 텍스트가 없습니다.'}
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <a
                  href={`/api/knowledge/documents/${viewingDoc.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xs flex items-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>원본 파일 열기</span>
                </a>
                <a
                  href={`/api/knowledge/documents/${viewingDoc.id}/download`}
                  download
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-xs flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>다운로드</span>
                </a>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xs hover:bg-slate-800 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Replace Document Version */}
      {replacingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-sm border border-slate-300 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">새 버전 파일로 교체</h3>
              </div>
              <button onClick={() => setReplacingDoc(null)} className="text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              [<strong>{replacingDoc.title}</strong>] 기존 자료를 삭제하지 않고, 업데이트된 새 버전 파일로 교체합니다.
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">새 파일 선택</label>
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  onChange={(e) => setReplaceFile(e.target.files ? e.target.files[0] : null)}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  className="w-full text-xs text-slate-700 border border-slate-300 rounded-xs p-1.5 bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  새 버전 명칭 (예: v1.1 또는 v2.0)
                </label>
                <input
                  type="text"
                  value={replaceVersion}
                  onChange={(e) => setReplaceVersion(e.target.value)}
                  placeholder={`기존: ${replacingDoc.version || 'v1.0'} (비워두면 자동 증가)`}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplacingDoc(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={uploading || !replaceFile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xs cursor-pointer"
                >
                  {uploading ? '교체 파싱 중...' : '파일 교체 적용'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
