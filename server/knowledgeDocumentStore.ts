import fs from 'fs';
import path from 'path';

export interface KnowledgeDocumentRecord {
  id: string;
  title: string;
  originalName: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  category: string;
  targetBrand: string;
  description?: string;
  summary?: string;
  sourceType: 'user-upload' | 'verified-knowledge-base';
  storagePath: string; // e.g., 'knowledge-base/doc-123/file.pdf'
  uploadedBy: string;
  uploadedAt: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: 'ACTIVE' | 'INACTIVE';
  extractionStatus: 'COMPLETED' | 'PENDING' | 'FAILED';
  extractedText: string;
  chunks: Array<{ chunkId: string; chunkIndex: number; text: string; charLength: number }>;
  chunkCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_DOCS_FILE = path.join(DATA_DIR, 'knowledge_documents.json');
const KNOWLEDGE_STORAGE_DIR = path.join(DATA_DIR, 'knowledge_storage');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(KNOWLEDGE_STORAGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load all documents from Firestore / persistent storage collection 'knowledge_documents'
 */
export function loadKnowledgeDocuments(): KnowledgeDocumentRecord[] {
  try {
    ensureDirectories();
    if (fs.existsSync(KNOWLEDGE_DOCS_FILE)) {
      const content = fs.readFileSync(KNOWLEDGE_DOCS_FILE, 'utf-8');
      const docs: KnowledgeDocumentRecord[] = JSON.parse(content);
      return Array.isArray(docs) ? docs : [];
    }
  } catch (err) {
    console.error('Error reading knowledge_documents.json:', err);
  }
  return [];
}

/**
 * Save all documents to Firestore / persistent storage collection 'knowledge_documents'
 */
export function saveKnowledgeDocuments(docs: KnowledgeDocumentRecord[]): void {
  try {
    ensureDirectories();
    fs.writeFileSync(KNOWLEDGE_DOCS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing knowledge_documents.json:', err);
    throw new Error('자료 저장에 실패했습니다. 다시 시도해주세요.');
  }
}

/**
 * Save single document record
 */
export function saveKnowledgeDocumentRecord(doc: KnowledgeDocumentRecord): void {
  const docs = loadKnowledgeDocuments();
  const index = docs.findIndex((d) => d.id === doc.id);
  if (index >= 0) {
    docs[index] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    docs.unshift(doc);
  }
  saveKnowledgeDocuments(docs);
}

/**
 * Save document file to persistent storage (data/knowledge_storage/{docId}/{originalName})
 */
export function saveDocumentFile(
  docId: string,
  originalName: string,
  sourceFilePathOrBuffer: string | Buffer
): { storagePath: string; fullPath: string } {
  ensureDirectories();
  const docStorageDir = path.join(KNOWLEDGE_STORAGE_DIR, docId);
  if (!fs.existsSync(docStorageDir)) {
    fs.mkdirSync(docStorageDir, { recursive: true });
  }

  const sanitizedFileName = path.basename(originalName);
  const fullPath = path.join(docStorageDir, sanitizedFileName);

  if (typeof sourceFilePathOrBuffer === 'string') {
    if (fs.existsSync(sourceFilePathOrBuffer)) {
      fs.copyFileSync(sourceFilePathOrBuffer, fullPath);
    } else {
      throw new Error(`원본 파일 경로를 찾을 수 없습니다: ${sourceFilePathOrBuffer}`);
    }
  } else {
    fs.writeFileSync(fullPath, sourceFilePathOrBuffer);
  }

  const storagePath = `knowledge-base/${docId}/${sanitizedFileName}`;
  return { storagePath, fullPath };
}

/**
 * Retrieve absolute file path for a document
 */
export function getDocumentFilePath(docId: string, fileName?: string): string | null {
  ensureDirectories();
  const docStorageDir = path.join(KNOWLEDGE_STORAGE_DIR, docId);
  if (!fs.existsSync(docStorageDir)) return null;

  if (fileName) {
    const fullPath = path.join(docStorageDir, path.basename(fileName));
    if (fs.existsSync(fullPath)) return fullPath;
  }

  const files = fs.readdirSync(docStorageDir);
  if (files.length > 0) {
    return path.join(docStorageDir, files[0]);
  }

  return null;
}

/**
 * Delete metadata & actual storage file for a document
 */
export function deleteKnowledgeDocument(docId: string): boolean {
  try {
    // 1. Delete metadata from knowledge_documents
    let docs = loadKnowledgeDocuments();
    const initialCount = docs.length;
    docs = docs.filter((d) => d.id !== docId);
    saveKnowledgeDocuments(docs);

    // 2. Delete actual file from knowledge_storage
    const docStorageDir = path.join(KNOWLEDGE_STORAGE_DIR, docId);
    if (fs.existsSync(docStorageDir)) {
      fs.rmSync(docStorageDir, { recursive: true, force: true });
    }

    return docs.length < initialCount;
  } catch (err) {
    console.error(`Error deleting knowledge document ${docId}:`, err);
    return false;
  }
}

/**
 * Rollback incomplete document and file upload if upload or extraction fails
 */
export function rollbackDocumentUpload(docId: string): void {
  try {
    let docs = loadKnowledgeDocuments();
    docs = docs.filter((d) => d.id !== docId);
    saveKnowledgeDocuments(docs);

    const docStorageDir = path.join(KNOWLEDGE_STORAGE_DIR, docId);
    if (fs.existsSync(docStorageDir)) {
      fs.rmSync(docStorageDir, { recursive: true, force: true });
    }
  } catch (e) {
    console.warn(`Rollback warning for ${docId}:`, e);
  }
}

/**
 * Search Knowledge Base for pricing and rate card values
 */
export interface KnowledgePricingLookupResult {
  docId: string;
  title: string;
  category: string;
  version: string;
  referenceLocation: string; // 페이지/근거 위치
  itemName: string;
  confirmedValue: string; // 확인 값
  unitPrice?: number;
  snippet: string;
}

export function searchKnowledgePricingItems(query: string = ''): KnowledgePricingLookupResult[] {
  const docs = loadKnowledgeDocuments().filter((d) => d.status === 'ACTIVE');
  const results: KnowledgePricingLookupResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  for (const doc of docs) {
    const fullText = doc.extractedText || '';
    if (!fullText) continue;

    const lines = fullText.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Match query or general pricing keywords (정상가, 단가, 원, ₩, 대관료, 객실, 골프, 식음, 사우나, 부대시설, Rate Card)
      const matchesQuery = !normalizedQuery || trimmedLine.toLowerCase().includes(normalizedQuery);
      const containsPrice = /[\d,]{3,}\s*(원|만원|원\/|원\(|₩)/.test(trimmedLine) || /(정상가|단가|대관료|요금|할인가|적용가)/.test(trimmedLine);

      if (matchesQuery && containsPrice) {
        // Extract price match
        const priceMatch = trimmedLine.match(/([\d,]{3,})\s*(원|만원)?/);
        let parsedPrice: number | undefined;
        if (priceMatch) {
          const rawNum = parseInt(priceMatch[1].replace(/,/g, ''), 10);
          if (!isNaN(rawNum)) {
            parsedPrice = priceMatch[2] === '만원' ? rawNum * 10000 : rawNum;
          }
        }

        results.push({
          docId: doc.id,
          title: doc.title || doc.originalName,
          category: doc.category || '사내 자료',
          version: doc.version || 'v1.0',
          referenceLocation: `${doc.title} > ${doc.category || '자료'} (${doc.version || 'v1.0'}) [Line ${idx + 1}]`,
          itemName: trimmedLine.split(/[:\-\=]/)[0].trim().substring(0, 40) || doc.title,
          confirmedValue: trimmedLine,
          unitPrice: parsedPrice,
          snippet: trimmedLine,
        });
      }
    });
  }

  return results;
}

/**
 * Migration helper: Migrate existing documents from legacy data/knowledge_base.json if present
 */
export function migrateLegacyKnowledgeDocs(): void {
  try {
    ensureDirectories();
    const legacyFile = path.join(DATA_DIR, 'knowledge_base.json');
    if (!fs.existsSync(legacyFile)) return;

    const legacyContent = fs.readFileSync(legacyFile, 'utf-8');
    const legacyDocs = JSON.parse(legacyContent);
    if (!Array.isArray(legacyDocs) || legacyDocs.length === 0) return;

    const currentDocs = loadKnowledgeDocuments();
    const currentIds = new Set(currentDocs.map((d) => d.id));
    let migratedCount = 0;

    for (const item of legacyDocs) {
      if (!item.id || currentIds.has(item.id)) continue;
      // Skip demo/sample items
      if (item.isDemo || item.id.includes('demo')) continue;

      const nowIso = new Date().toISOString();
      const originalName = item.originalName || `${item.title || 'document'}.${(item.fileType || 'PDF').toLowerCase()}`;
      const fileName = path.basename(originalName);

      const record: KnowledgeDocumentRecord = {
        id: item.id,
        title: item.title || originalName.replace(/\.[^/.]+$/, ''),
        originalName,
        fileName,
        fileType: (item.fileType || 'PDF').toUpperCase(),
        mimeType: item.mimeType || 'application/pdf',
        fileSize: item.fileSize || 1024,
        category: item.category || '회사소개서',
        targetBrand: item.targetBrand || 'Oak Valley',
        description: item.summary || item.description || '',
        summary: item.summary || '',
        sourceType: 'user-upload',
        storagePath: `knowledge-base/${item.id}/${fileName}`,
        uploadedBy: item.uploadedBy || '관리자',
        uploadedAt: item.uploadDate || nowIso,
        uploadDate: item.uploadDate || nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        version: item.version || 'v1.0',
        status: item.status || 'ACTIVE',
        extractionStatus: 'COMPLETED',
        extractedText: item.extractedText || '',
        chunks: item.chunks || [],
        chunkCount: item.chunks ? item.chunks.length : 0,
      };

      currentDocs.unshift(record);
      migratedCount++;
    }

    if (migratedCount > 0) {
      saveKnowledgeDocuments(currentDocs);
      console.log(`[KnowledgeBase Migration] Successfully migrated ${migratedCount} legacy documents to knowledge_documents collection.`);
    }
  } catch (err) {
    console.error('Error during legacy Knowledge Base migration:', err);
  }
}
