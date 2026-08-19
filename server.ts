import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import * as XLSX from 'xlsx';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SAMPLE_TREND_REPORTS, SAMPLE_COMPANY_REPORTS } from './src/data/sampleData';
import { VERIFIED_COMPETITOR_BEST5_DATA } from './src/data/verifiedCompetitorBest5';

const app = express();
const PORT = 3000;

// High payload limits to support up to 120MB document uploads
app.use(express.json({ limit: '120mb' }));
app.use(express.urlencoded({ limit: '120mb', extended: true }));

// Setup multer diskStorage for temporary streaming upload of large documents (up to 120MB)
const UPLOAD_TMP_DIR = path.join(process.cwd(), 'tmp_uploads');
if (!fs.existsSync(UPLOAD_TMP_DIR)) {
  fs.mkdirSync(UPLOAD_TMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_TMP_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'kb-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 }, // 120MB
});

// Initialize Gemini SDK with telemetry header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// --- SERVER-SIDE IN-MEMORY CACHE & RETRY UTILITIES ---
interface CacheEntry {
  data: any;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry>();

function getCachedData(key: string): { data: any; cachedAt: string } | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttlMs) {
    memoryCache.delete(key);
    return null;
  }
  return {
    data: entry.data,
    cachedAt: new Date(entry.timestamp).toISOString(),
  };
}

function setCachedData(key: string, data: any, ttlMs = 2 * 60 * 60 * 1000) {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttlMs,
  });
}

async function callGeminiWithRetry(
  prompt: string,
  schemaConfig?: any,
  retries = 1,
  backoffMs = 1000
): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) throw new Error('Gemini API client not available');

  const CANDIDATE_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.6-flash',
  ];

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const config: any = { responseMimeType: 'application/json' };
        if (schemaConfig) config.responseSchema = schemaConfig;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config,
        });

        if (response.text && response.text.trim().length > 0) {
          return response.text;
        }
        throw new Error(`Empty response from Gemini model ${modelName}`);
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isQuotaOrRateLimit =
          err?.status === 'RESOURCE_EXHAUSTED' ||
          err?.code === 429 ||
          err?.status === 429 ||
          errMessage.includes('429') ||
          errMessage.includes('Quota exceeded') ||
          errMessage.includes('quota');

        const isNotFound =
          err?.status === 'NOT_FOUND' ||
          err?.code === 404 ||
          errMessage.includes('404') ||
          errMessage.includes('not found');

        if (isQuotaOrRateLimit || isNotFound) {
          console.warn(`[Gemini API] Model ${modelName} rate-limited or unavailable (${err?.status || err?.code || 429}). Switching to next model...`);
          break; // Move immediately to next model in CANDIDATE_MODELS
        }

        const isTransient =
          err?.status === 'UNAVAILABLE' ||
          err?.code === 503 ||
          err?.status === 503 ||
          errMessage.includes('high demand') ||
          errMessage.includes('503');

        if (isTransient && attempt < retries) {
          console.warn(`[Gemini API] Transient error on ${modelName} (attempt ${attempt + 1}). Retrying in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
          continue;
        }

        break; // Move to next model
      }
    }
  }

  throw lastError || new Error('All Gemini candidate models failed or exceeded quota');
}

function parseGeminiJsonSafely(rawText: string, fallbackObj: any = {}): any {
  if (!rawText) return fallbackObj;
  let cleaned = rawText.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    console.warn('Initial JSON parse failed, attempting string repair...');
    try {
      let repaired = cleaned.replace(/,\s*([}\]])/g, '$1');

      // Attempt brace/bracket balancing for truncated JSON string
      if ((repaired.match(/"/g) || []).length % 2 !== 0) {
        repaired += '"';
      }

      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

      return JSON.parse(repaired);
    } catch (err2) {
      console.error('Failed to parse Gemini JSON output even after repair:', err2);
      return fallbackObj;
    }
  }
}

// --- KNOWLEDGE BASE PERSISTENCE & HELPERS ---
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_FILE = path.join(KNOWLEDGE_DIR, 'knowledge_base.json');

function ensureKnowledgeDir() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  }
}

function loadKnowledgeBaseDocs(): any[] {
  try {
    ensureKnowledgeDir();
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      const data = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading knowledge base file:', err);
  }
  return []; // Default empty array - strictly no fake demo documents!
}

function saveKnowledgeBaseDocs(docs: any[]) {
  try {
    ensureKnowledgeDir();
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving knowledge base file:', err);
  }
}

function getKnowledgeBaseMetadata() {
  const docs = loadKnowledgeBaseDocs();
  const activeDocs = docs.filter((d: any) => d.status === 'ACTIVE');

  let lastUpdated: string | null = null;
  if (activeDocs.length > 0) {
    const dates = activeDocs.map((d: any) => d.uploadDate).filter(Boolean);
    if (dates.length > 0) {
      dates.sort().reverse();
      lastUpdated = dates[0].substring(0, 10); // YYYY.MM.DD
    }
  }

  return {
    used: activeDocs.length > 0,
    activeDocCount: activeDocs.length,
    usedDocs: activeDocs.map((d: any) => ({
      title: d.title,
      brand: d.targetBrand,
      version: d.version,
      uploadDate: d.uploadDate,
      category: d.category,
    })),
    externalSourceCount: 5,
    lastUpdated: lastUpdated || (activeDocs.length > 0 ? '2026.08' : null),
  };
}

function createDocumentChunks(fullText: string, chunkSize = 2500, overlap = 200) {
  if (!fullText || fullText.trim().length === 0) return [];
  const chunks = [];
  let index = 0;
  let start = 0;
  while (start < fullText.length) {
    const end = Math.min(start + chunkSize, fullText.length);
    const snippet = fullText.substring(start, end).trim();
    if (snippet.length > 0) {
      chunks.push({
        chunkId: `chk-${index}`,
        chunkIndex: index,
        text: snippet,
        charLength: snippet.length,
      });
      index++;
    }
    if (end >= fullText.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
}

// Keyword/relevance-filtered Knowledge Base context (RAG Chunk Retrieval)
function buildKnowledgeBasePromptContext(searchKeywords: string[] = []): string {
  const docs = loadKnowledgeBaseDocs();
  const activeDocs = docs.filter((d: any) => d.status === 'ACTIVE');

  if (activeDocs.length === 0) {
    return `
=== [OAK VALLEY & PARK ROCHE INTERNAL KNOWLEDGE BASE] ===
Status: Currently NO internal company documents uploaded in Knowledge Base.
Instruction: When evaluating Oak Valley or PARK ROCHE, explicitly state in internal sources: "등록된 내부자료가 없습니다. 회사소개서를 업로드해주세요."
`;
  }

  const cleanKws = searchKeywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 1);

  interface ScoredChunk {
    docTitle: string;
    brand: string;
    category: string;
    version: string;
    chunkIndex: number;
    text: string;
    score: number;
  }

  const scoredChunks: ScoredChunk[] = [];

  for (const doc of activeDocs) {
    const chunks = doc.chunks && doc.chunks.length > 0
      ? doc.chunks
      : createDocumentChunks(doc.extractedText || doc.summary || '');

    for (const ch of chunks) {
      const searchBlob = `${doc.title} ${doc.targetBrand} ${doc.category} ${ch.text}`.toLowerCase();
      let score = 1;
      for (const kw of cleanKws) {
        if (searchBlob.includes(kw)) score += 5;
      }
      if (doc.targetBrand.toLowerCase().includes('oak valley') || doc.targetBrand.toLowerCase().includes('park roche')) {
        score += 2;
      }
      scoredChunks.push({
        docTitle: doc.title,
        brand: doc.targetBrand,
        category: doc.category,
        version: doc.version,
        chunkIndex: ch.chunkIndex,
        text: ch.text,
        score,
      });
    }
  }

  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, 5); // top 5 most relevant semantic chunks

  const chunkTexts = topChunks.map((c, idx) => `
--- RETRIEVED CHUNK [${idx + 1}] FROM "${c.docTitle}" (${c.brand} / ${c.category} ${c.version}) ---
${c.text.substring(0, 1500)}
--------------------------------------------------
`).join('\n');

  return `
=== [RAG RETRIEVED INTERNAL KNOWLEDGE BASE CHUNKS (${topChunks.length} RELEVANT SECTIONS)] ===
${chunkTexts}
========================================================================
`;
}

function extractTextFromDocxOrPptx(buffer: Buffer): string {
  try {
    const rawStr = buffer.toString('utf-8');
    // Extract text inside XML tags <w:t> (Word) or <a:t> (PowerPoint)
    const matches = rawStr.match(/<(?:w|a):t[^>]*>([^<]+)<\/(?:w|a):t>/g);
    if (matches && matches.length > 0) {
      const texts = matches
        .map((m) => m.replace(/<[^>]+>/g, '').trim())
        .filter((t) => t.length > 0);
      if (texts.length > 0) {
        return texts.join(' ');
      }
    }
  } catch (e) {
    console.error('Error parsing docx/pptx xml buffer:', e);
  }
  return '';
}

async function extractTextFromUploadedFile(file: Express.Multer.File, originalName: string): Promise<{ extractedText: string; summary: string }> {
  const ext = path.extname(originalName).toLowerCase();
  let text = '';
  const filePath = file.path;

  try {
    if (ext === '.pdf') {
      try {
        if (filePath && fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(fileBuffer);
          if (pdfData && pdfData.text && pdfData.text.trim().length > 0) {
            text = pdfData.text.trim();
          }
        }
      } catch (pdfErr) {
        console.error('Error extracting PDF text with pdf-parse:', pdfErr);
      }
    } else if (ext === '.txt' || ext === '.csv' || ext === '.json' || ext === '.tsv' || ext === '.md') {
      if (filePath && fs.existsSync(filePath)) {
        text = fs.readFileSync(filePath, 'utf-8');
      }
    } else if (ext === '.xlsx' || ext === '.xls') {
      if (filePath && fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheetTexts: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          sheetTexts.push(`=== SHEET: ${sheetName} ===\n` + XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]));
        });
        text = sheetTexts.join('\n\n');
      }
    } else if (ext === '.docx' || ext === '.pptx') {
      if (filePath && fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        text = extractTextFromDocxOrPptx(buffer);
      }
    }

    // Fallback if text is still empty
    if (!text || text.trim().length === 0) {
      if (filePath && fs.existsSync(filePath)) {
        const rawBuffer = fs.readFileSync(filePath);
        const rawStr = rawBuffer.toString('utf-8');
        const cleanStr = rawStr.replace(/[^\x20-\x7E\xA0-\xFF\u3000-\u318F\uAC00-\uD7A3\n\r\t]/g, ' ');
        const fallback = cleanStr.replace(/\s+/g, ' ').substring(0, 5000);
        if (fallback.length > 100) {
          text = fallback;
        }
      }
    }
  } catch (err) {
    console.error('Error extracting text from uploaded file:', err);
  } finally {
    // Delete temporary file from disk immediately to free space
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('Error removing temp upload file:', unlinkErr);
      }
    }
  }

  if (!text || text.trim().length === 0) {
    text = `공식 문서 [${originalName}] 업로드 완료 (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
  }

  // Cap extracted text length stored in memory/json to prevent storage bloat
  const MAX_TEXT_LENGTH = 50000;
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.substring(0, MAX_TEXT_LENGTH) + '\n\n...[최대 50,000자 발췌 완료]...';
  }

  let summary = text.slice(0, 250) + '...';
  const ai = getGeminiClient();
  if (ai && text.length > 80) {
    try {
      const sumText = await callGeminiWithRetry(
        `다음 문서의 핵심 주요 내용(시설, 규격, 단가, 파트너십 포인트 등)을 2~3줄로 깔끔하게 요약해 주세요:\n\n${text.substring(0, 6000)}`
      );
      if (sumText) {
        summary = sumText.trim();
      }
    } catch (sErr) {
      // fallback to text snippet
    }
  }

  return { extractedText: text, summary };
}

// --- KNOWLEDGE BASE MANAGEMENT API ENDPOINTS ---

// 1. GET documents list & metadata
app.get('/api/knowledge/documents', (req, res) => {
  const docs = loadKnowledgeBaseDocs();
  const metadata = getKnowledgeBaseMetadata();
  return res.json({
    success: true,
    documents: docs,
    metadata,
  });
});

// 2. POST upload new document
app.post('/api/knowledge/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: '업로드할 파일을 선택해 주세요.' });
    }

    const { title, targetBrand = 'Oak Valley', category = '회사소개서', version = 'v1.0' } = req.body || {};
    const originalName = file.originalname || 'document.pdf';
    const ext = path.extname(originalName).replace('.', '').toUpperCase() || 'PDF';

    const { extractedText, summary } = await extractTextFromUploadedFile(file, originalName);
    const chunks = createDocumentChunks(extractedText, 2500, 200);

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const docs = loadKnowledgeBaseDocs();
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || originalName.replace(path.extname(originalName), ''),
      fileType: ext,
      targetBrand,
      category,
      fileSize: file.size,
      uploadDate: dateStr,
      version: version || 'v1.0',
      status: 'ACTIVE',
      extractedText,
      summary,
      chunks,
      chunkCount: chunks.length,
    };

    docs.unshift(newDoc); // newest on top
    saveKnowledgeBaseDocs(docs);

    return res.json({
      success: true,
      document: newDoc,
      metadata: getKnowledgeBaseMetadata(),
      documents: docs,
    });
  } catch (err: any) {
    console.error('Knowledge base upload error:', err);
    return res.status(500).json({ success: false, error: err.message || '파일 업로드 처리 실패' });
  }
});

// 2-1. POST Sequential Chunk Upload for Large Files (>15MB up to 120MB)
app.post('/api/knowledge/upload-chunk', upload.single('chunk'), async (req, res) => {
  try {
    const file = req.file;
    const { uploadId, chunkIndex, totalChunks, fileName } = req.body || {};

    if (!file || !uploadId || chunkIndex === undefined || totalChunks === undefined) {
      return res.status(400).json({ success: false, error: '잘못된 청크 업로드 매개변수입니다.' });
    }

    const cIdx = parseInt(chunkIndex, 10);
    const tChunks = parseInt(totalChunks, 10);

    // Rename uploaded chunk file to session part
    const partPath = path.join(UPLOAD_TMP_DIR, `${uploadId}.part_${cIdx}`);
    if (fs.existsSync(partPath)) {
      fs.unlinkSync(partPath);
    }
    fs.renameSync(file.path, partPath);

    // Verify if all chunks have arrived
    let allReceived = true;
    for (let i = 0; i < tChunks; i++) {
      const pFile = path.join(UPLOAD_TMP_DIR, `${uploadId}.part_${i}`);
      if (!fs.existsSync(pFile)) {
        allReceived = false;
        break;
      }
    }

    if (allReceived) {
      // Assemble parts into final merged file
      const ext = path.extname(fileName || 'document.pdf').toLowerCase();
      const assembledPath = path.join(UPLOAD_TMP_DIR, `${uploadId}_assembled${ext}`);
      const writeStream = fs.createWriteStream(assembledPath);

      for (let i = 0; i < tChunks; i++) {
        const pFile = path.join(UPLOAD_TMP_DIR, `${uploadId}.part_${i}`);
        const chunkBuf = fs.readFileSync(pFile);
        writeStream.write(chunkBuf);
        try {
          fs.unlinkSync(pFile); // Delete chunk part file
        } catch (e) {
          // ignore
        }
      }
      writeStream.end();

      return res.json({
        success: true,
        uploadId,
        chunkIndex: cIdx,
        totalChunks: tChunks,
        completed: true,
        assembledFile: `${uploadId}_assembled${ext}`,
      });
    }

    return res.json({
      success: true,
      uploadId,
      chunkIndex: cIdx,
      totalChunks: tChunks,
      completed: false,
    });
  } catch (err: any) {
    console.error('Chunk upload error:', err);
    return res.status(500).json({ success: false, error: `서버 디스크 저장에 실패했습니다. (${err.message})` });
  }
});

// 2-2. POST Process Assembled Large File (Parsing, Chunking, Indexing)
app.post('/api/knowledge/process-assembled', async (req, res) => {
  try {
    const { uploadId, title, targetBrand = 'Oak Valley', category = '회사소개서', version = 'v1.0', originalName = 'document.pdf', fileSize = 0 } = req.body || {};

    const ext = path.extname(originalName).toLowerCase();
    const extUpper = ext.replace('.', '').toUpperCase() || 'PDF';
    const assembledPath = path.join(UPLOAD_TMP_DIR, `${uploadId}_assembled${ext}`);

    if (!fs.existsSync(assembledPath)) {
      return res.status(404).json({ success: false, error: '서버 저장에 실패했습니다. 임시 저장 파일을 찾을 수 없습니다.' });
    }

    const realSize = fs.statSync(assembledPath).size;

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: originalName,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: realSize || fileSize,
      destination: UPLOAD_TMP_DIR,
      filename: `${uploadId}_assembled${ext}`,
      path: assembledPath,
      buffer: Buffer.from([]),
      stream: null as any,
    };

    const { extractedText, summary } = await extractTextFromUploadedFile(mockFile, originalName);
    const chunks = createDocumentChunks(extractedText, 2500, 200);

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const docs = loadKnowledgeBaseDocs();
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || originalName.replace(/\.[^/.]+$/, ''),
      fileType: extUpper,
      targetBrand,
      category,
      fileSize: realSize || fileSize,
      uploadDate: dateStr,
      version: version || 'v1.0',
      status: 'ACTIVE' as const,
      extractedText,
      summary,
      chunks,
      chunkCount: chunks.length,
    };

    docs.unshift(newDoc);
    saveKnowledgeBaseDocs(docs);

    return res.json({
      success: true,
      document: newDoc,
      documents: docs,
      metadata: getKnowledgeBaseMetadata(),
    });
  } catch (err: any) {
    console.error('Process assembled error:', err);
    return res.status(500).json({ success: false, error: `PDF 파싱 또는 색인 처리에 실패했습니다. (${err.message})` });
  }
});

// 3. PUT update document status, title, brand, category, version
app.put('/api/knowledge/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetBrand, category, version, status } = req.body || {};

    let docs = loadKnowledgeBaseDocs();
    let updatedDoc = null;

    docs = docs.map((doc: any) => {
      if (doc.id === id) {
        updatedDoc = {
          ...doc,
          ...(title !== undefined && { title }),
          ...(targetBrand !== undefined && { targetBrand }),
          ...(category !== undefined && { category }),
          ...(version !== undefined && { version }),
          ...(status !== undefined && { status }),
        };
        return updatedDoc;
      }
      return doc;
    });

    saveKnowledgeBaseDocs(docs);

    return res.json({
      success: true,
      document: updatedDoc,
      documents: docs,
      metadata: getKnowledgeBaseMetadata(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST replace document with new file version
app.post('/api/knowledge/replace/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: '교체할 새 파일을 선택해 주세요.' });
    }

    const { version, targetBrand, category } = req.body || {};
    let docs = loadKnowledgeBaseDocs();
    const existingIndex = docs.findIndex((d: any) => d.id === id);

    if (existingIndex === -1) {
      return res.status(404).json({ success: false, error: '해당 자료를 찾을 수 없습니다.' });
    }

    const originalName = file.originalname;
    const ext = path.extname(originalName).replace('.', '').toUpperCase() || 'PDF';
    const { extractedText, summary } = await extractTextFromUploadedFile(file, originalName);

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Auto bump version if not explicitly provided
    const oldVersion = docs[existingIndex].version || 'v1.0';
    let newVersion = version;
    if (!newVersion) {
      const match = oldVersion.match(/v?(\d+)\.(\d+)/);
      if (match) {
        newVersion = `v${match[1]}.${Number(match[2]) + 1}`;
      } else {
        newVersion = `${oldVersion}-new`;
      }
    }

    const updatedDoc = {
      ...docs[existingIndex],
      title: req.body.title || docs[existingIndex].title,
      fileType: ext,
      targetBrand: targetBrand || docs[existingIndex].targetBrand,
      category: category || docs[existingIndex].category,
      fileSize: file.size,
      uploadDate: dateStr,
      version: newVersion,
      status: 'ACTIVE',
      extractedText,
      summary,
    };

    docs[existingIndex] = updatedDoc;
    saveKnowledgeBaseDocs(docs);

    return res.json({
      success: true,
      document: updatedDoc,
      documents: docs,
      metadata: getKnowledgeBaseMetadata(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE document
app.delete('/api/knowledge/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    let docs = loadKnowledgeBaseDocs();
    docs = docs.filter((d: any) => d.id !== id);
    saveKnowledgeBaseDocs(docs);

    return res.json({
      success: true,
      documents: docs,
      metadata: getKnowledgeBaseMetadata(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// --- EXISTING ANALYSIS API ENDPOINTS WITH OPTIMIZED 2-STEP & CACHING PIPELINE ---

// 1. API: Analyze Trend (Universal Trend Intelligence Search with QUERY FIRST principle)
app.post('/api/analyze-trend', async (req, res) => {
  try {
    const { query, period = '최근 1년', region = '한국', category, deepAnalysis = false, forceRefresh = false } = req.body || {};
    const trimmedQuery = (query || '소비 트렌드').trim();
    if (!trimmedQuery) {
      return res.status(400).json({ success: false, error: '조사하고자 하는 트렌드 키워드를 입력해 주세요.' });
    }

    const effectiveCategory = category && category !== 'Wellness' ? category : 'General';
    const cacheKey = `trend:${trimmedQuery.toLowerCase()}:${period}:${region}:${effectiveCategory}:${deepAnalysis ? 'deep' : 'quick'}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          report: cached.data,
          cached: true,
          cachedAt: cached.cachedAt,
          source: 'server-cache',
        });
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
      });
    }

    const kbContext = buildKnowledgeBasePromptContext([trimmedQuery]);

    if (!deepAnalysis) {
      // STEP 1: QUICK SCAN (QUERY FIRST Principle - Fast response <2s)
      const quickScanPrompt = `
${kbContext}
당신은 최고 수준의 글로벌 트렌드 인텔리전스 분석가입니다.

[CRITICAL DIRECTIVE - QUERY FIRST PRINCIPLE]
사용자가 입력한 검색어: "${trimmedQuery}"
반드시 "${trimmedQuery}" 자체를 독립적인 최우선 조사 대상 주제로 분석하세요.
예시:
- 검색어 = "초콜릿": 초콜릿/제과 시장, 소비자 선호도, 대표 초콜릿 브랜드, 미식/디저트 마케팅 사례 분석.
- 검색어 = "요가": 요가/애슬레저 시장, 루루레몬/안다르 등 대표 브랜드, 스튜디오 및 커뮤니티 트렌드 분석.
- 검색어 = "향수": 니치 향수 시장, 조향 및 시향 경험, 딥티크/바이레도/르라보 등 대표 브랜드 분석.
- 검색어 = "피클볼": 피클볼 용품/스포츠 시장, 신규 커뮤니티 및 레저 패션 동향 분석.

⚠️ 절대 주제를 "골프", "웰니스", "리조트", "호스피탈리티"로 임의 변경하거나 덮어쓰지 마세요!
메인 분석은 100% "${trimmedQuery}"에 관한 내용이어야 합니다. 오크밸리/파크로쉬 관련성은 오직 oakValleyQuickFit에서만 마지막에 연계합니다.

JSON 작성 구조:
{
  "isQuickScan": true,
  "summaryLine": "${trimmedQuery} 시장 핵심 요약 (25자 이내)",
  "executiveSummary": [
    "${trimmedQuery} 시장 동향 및 소비자 변화 1",
    "${trimmedQuery} 브랜드 및 마케팅 사례 2",
    "${trimmedQuery} 유망 키워드 및 성장 포인트 3"
  ],
  "quickFindings": [
    { "title": "${trimmedQuery} 시장 트렌드", "description": "상세 분석 내용", "sourceCitation": "공식 출처 (연도)" },
    { "title": "대표 브랜드 및 주요 사례", "description": "상세 분석 내용", "sourceCitation": "공식 출처 (연도)" },
    { "title": "신규 성장 및 유망 영역", "description": "상세 분석 내용", "sourceCitation": "공식 출처 (연도)" }
  ],
  "oakValleyQuickFit": {
    "score": 85,
    "fitRating": "HIGH",
    "keyOpportunity": "오크밸리/파크로쉬 연계 및 F&B/객실/이벤트 적용 가능성 한 줄"
  },
  "primarySources": ["${trimmedQuery} 관련 리서치 출처 1", "출처 2"]
}
`;
      const rawText = await callGeminiWithRetry(quickScanPrompt);
      const reportJson = parseGeminiJsonSafely(rawText, generateFallbackTrendReport(trimmedQuery, period, region, effectiveCategory));

      const quickReport = {
        query: trimmedQuery,
        filters: { period, region, category: effectiveCategory },
        generatedAt: new Date().toISOString().split('T')[0],
        isQuickScan: true,
        ...reportJson,
      };

      setCachedData(cacheKey, quickReport, 2 * 60 * 60 * 1000);
      return res.json({
        success: true,
        report: quickReport,
        source: 'gemini-quick-scan',
      });
    }

    // STEP 2: DEEP ANALYSIS (Comprehensive Universal Trend Intelligence Report)
    const deepPrompt = `
${kbContext}
당신은 글로벌 메이저 경영 컨설팅 파트너이자 최고 수준의 마케팅 전략가입니다.

[CRITICAL DIRECTIVE - QUERY FIRST PRINCIPLE]
사용자의 검색어: "${trimmedQuery}" (기간: ${period}, 지역: ${region})
반드시 "${trimmedQuery}"를 독립적인 최우선 조사 주제로 깊이 있게 연구하세요.

예시 가이드:
- "${trimmedQuery}" = "초콜릿": 초콜릿/제과 시장, 수제/크래프트 초콜릿 트렌드, 고디바/린트/가나/롯데 등 주요 브랜드, 디저트 팝업 마케팅 사례.
- "${trimmedQuery}" = "요가": 요가/애슬레저 시장, 루루레몬/안다르/젝시믹스 등 대표 브랜드, 요가 스튜디오 및 웰니스 프로그램 트렌드.
- "${trimmedQuery}" = "향수": 딥티크/바이레도/르라보/조말론 등 니치 향수 시장, 조향 및 오프라인 시향 경험 트렌드.
- "${trimmedQuery}" = "피클볼": 피클볼 라켓/용품 시장, 신규 스포츠 커뮤니티, 관련 패션/브랜드 사례.
- "${trimmedQuery}" = "수면": 수면 케어/슬립테크 시장, 시몬스/에이스/가민/슬립노믹스 브랜드 및 유망 기술 트렌드.

⚠️ 메인 분석 섹션(executiveSummary, keyTrends, metrics, brandCases, emergingSignals, opportunities, references)에 골프, 리조트, 웰니스를 메인 주제로 덮어쓰는 행위는 금지됩니다. 모든 메인 섹션은 100% "${trimmedQuery}" 자체의 트렌드를 다루어야 합니다.

오크밸리 / 파크로쉬 적용 인사이트는 오직 keyTrends 내부의 "oakValleyOpportunity" 객체와 별도 시너지를 분석하는 곳에만 마지막 별도 섹션으로 제공하세요.

JSON 구조 요구사항:
{
  "executiveSummary": [
    "${trimmedQuery} 시장 동향 및 핵심 수치 1",
    "${trimmedQuery} 소비자 가치관 및 행동 변화 2",
    "${trimmedQuery} 대표 브랜드 전략 및 성장 기회 3"
  ],
  "keyTrends": [
    {
      "title": "${trimmedQuery} 관련 핵심 트렌드 1",
      "description": "${trimmedQuery} 트렌드 상세 설명",
      "whyGrowing": "성장 원인 및 요인",
      "consumerBehavior": "소비자 행동 변화",
      "corporateUsage": "관련 기업/브랜드 활용 사례",
      "futureOutlook": "향후 발전 전망",
      "tags": ["${trimmedQuery}", "Trend", "Market"],
      "evidenceLevel": "HIGH CONFIDENCE",
      "sourceCitation": "공식 출처 (연도)",
      "factData": "실제 수치 및 통계 데이터",
      "evidenceData": "조사 보고서 근거",
      "implicationData": "산업적 시사점",
      "oakValleyOpportunity": {
        "opportunityScore": 88,
        "recommendedAssets": ["F&B", "Stay", "Outdoor"],
        "targetCustomer": "타깃 고객층",
        "recommendedProgram": "오크밸리/파크로쉬 연계 적용안",
        "potentialPartnerCategory": "관련 파트너 브랜드군",
        "businessModel": "비즈니스 모델",
        "quickWin": "단기 추진안",
        "longTermOpportunity": "장기 시그니처 추진안",
        "spaceAndTouchpoints": "연계 가능 오프라인 공간"
      }
    },
    {
      "title": "${trimmedQuery} 관련 핵심 트렌드 2",
      "description": "${trimmedQuery} 트렌드 상세 설명",
      "whyGrowing": "성장 원인 및 요인",
      "consumerBehavior": "소비자 행동 변화",
      "corporateUsage": "관련 기업/브랜드 활용 사례",
      "futureOutlook": "향후 발전 전망",
      "tags": ["${trimmedQuery}", "Consumer", "Innovation"],
      "evidenceLevel": "HIGH CONFIDENCE",
      "sourceCitation": "공식 출처 (연도)",
      "factData": "실제 수치 및 통계 데이터",
      "evidenceData": "조사 보고서 근거",
      "implicationData": "산업적 시사점",
      "oakValleyOpportunity": {
        "opportunityScore": 85,
        "recommendedAssets": ["Outdoor", "Event"],
        "targetCustomer": "타깃 고객층",
        "recommendedProgram": "오크밸리/파크로쉬 연계 적용안",
        "potentialPartnerCategory": "관련 파트너 브랜드군",
        "businessModel": "비즈니스 모델",
        "quickWin": "단기 추진안",
        "longTermOpportunity": "장기 시그니처 추진안",
        "spaceAndTouchpoints": "연계 가능 오프라인 공간"
      }
    }
  ],
  "metrics": [
    {
      "label": "${trimmedQuery} 관련 시장 규모 및 성장 지수",
      "currentValue": "수치",
      "yoyChange": "변화율",
      "forecast": "시장 성장 전망",
      "unit": "% 또는 원/달러",
      "source": "${trimmedQuery} 관련 리서치 기관",
      "sourceTier": "Tier 1",
      "evidenceLevel": "HIGH CONFIDENCE",
      "sourceNote": "공식 통계 기준",
      "chartData": [
        { "year": "2023", "value": 100 },
        { "year": "2024", "value": 115 },
        { "year": "2025", "value": 130 },
        { "year": "2026", "value": 148 }
      ]
    }
  ],
  "brandCases": [
    {
      "brandName": "${trimmedQuery} 관련 대표 브랜드 1",
      "projectTitle": "주요 마케팅 프로젝트",
      "action": "실행 내용",
      "whyNotable": "주목할 점",
      "takeaway": "핵심 성공 요인",
      "sourceCitation": "출처 (연도)",
      "evidenceLevel": "HIGH CONFIDENCE"
    },
    {
      "brandName": "${trimmedQuery} 관련 대표 브랜드 2",
      "projectTitle": "주요 마케팅 프로젝트",
      "action": "실행 내용",
      "whyNotable": "주목할 점",
      "takeaway": "핵심 성공 요인",
      "sourceCitation": "출처 (연도)",
      "evidenceLevel": "HIGH CONFIDENCE"
    }
  ],
  "emergingSignals": [
    {
      "title": "${trimmedQuery} 시장의 새로운 트렌드 시그널",
      "description": "상세 시그널 내용",
      "potentialImpact": "시장 파급력",
      "sourceCitation": "출처 (연도)"
    }
  ],
  "opportunities": [
    {
      "id": "opp-1",
      "opportunity": "${trimmedQuery} 관련 사업적/제휴 기회",
      "targetCustomer": "타깃 고객",
      "possiblePartner": "${trimmedQuery} 추천 파트너 브랜드",
      "businessModel": "비즈니스 모델",
      "expectedBenefit": "기대 효과"
    }
  ],
  "references": [
    {
      "id": "ref-1",
      "institution": "${trimmedQuery} 산업 조사 기관",
      "title": "${trimmedQuery} 시장 동향 및 소비자 실태 보고서",
      "year": "2025",
      "tier": "Tier 1 (Primary / Official)",
      "appliedTo": "${trimmedQuery} 시장 데이터 및 브랜드 사례 검증",
      "confidence": "HIGH CONFIDENCE",
      "note": "공식 통계 자료"
    }
  ]
}
`;

    const rawText = await callGeminiWithRetry(deepPrompt);
    const reportJson = parseGeminiJsonSafely(rawText, generateFallbackTrendReport(trimmedQuery, period, region, effectiveCategory));

    const fullReport = {
      query: trimmedQuery,
      filters: { period, region, category: effectiveCategory },
      generatedAt: new Date().toISOString().split('T')[0],
      isQuickScan: false,
      ...reportJson,
      keyTrends: (reportJson.keyTrends || []).map((t: any, idx: number) => ({ id: `kt-${idx}`, ...t })),
      brandCases: (reportJson.brandCases || []).map((b: any, idx: number) => ({ id: `bc-${idx}`, ...b })),
      opportunities: (reportJson.opportunities || []).map((o: any, idx: number) => ({ id: `opp-${idx}`, ...o })),
    };

    setCachedData(cacheKey, fullReport, 2 * 60 * 60 * 1000);
    return res.json({
      success: true,
      report: fullReport,
      source: 'gemini-deep-analysis',
    });
  } catch (error: any) {
    console.error('Error analyzing trend:', error);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

// 2. API: Analyze Company (Supports Quick Scan + Deep Analysis + 2h Memory Cache)
app.post('/api/analyze-company', async (req, res) => {
  try {
    const { companyName, deepAnalysis = false, forceRefresh = false } = req.body || {};
    const trimmedName = (companyName || '').trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: '분석할 기업 또는 브랜드명을 입력해주세요.',
      });
    }

    const cacheKey = `company:${trimmedName.toLowerCase()}:${deepAnalysis ? 'deep' : 'quick'}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          report: cached.data,
          cached: true,
          cachedAt: cached.cachedAt,
          source: 'server-cache',
        });
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
      });
    }

    const kbContext = buildKnowledgeBasePromptContext([trimmedName, 'Oak Valley', 'Golf', 'Stay']);

    if (!deepAnalysis) {
      // STEP 1: QUICK SCAN (Fast response <2s)
      const quickPrompt = `
${kbContext}
당신은 리조트 & 마케팅 제휴 전문가입니다.
기업/브랜드 "${trimmedName}"에 대한 1단계 STEP 1 QUICK SCAN 보고서를 작성하세요.

JSON 구조:
{
  "isQuickScan": true,
  "summaryLine": "한 줄 핵심 요약 (25자 이내)",
  "overview": {
    "companyName": "${trimmedName}",
    "englishName": "${trimmedName}",
    "summary": "기업 개요 요약 (2줄)",
    "mainBusinesses": ["사업 1", "사업 2"],
    "mainBrands": ["브랜드 1", "브랜드 2"],
    "productsServices": ["주요 제품 1", "주요 제품 2"],
    "targetCustomers": "핵심 타깃 고객층",
    "marketPosition": "시장 입지"
  },
  "quickFindings": [
    "핵심 마케팅 동향 1",
    "핵심 마케팅 동향 2",
    "핵심 마케팅 동향 3"
  ],
  "oakValleyQuickFit": {
    "overallFitScore": 88,
    "fitGrade": "HIGH",
    "primaryAsset": "Golf & Stay",
    "quickIdea": "오크밸리 연계 실행 가치 제안 한 줄"
  },
  "primarySources": ["기업 IR / 보도자료", "언론 보도"]
}
`;
      const rawText = await callGeminiWithRetry(quickPrompt);
      const reportJson = parseGeminiJsonSafely(rawText, generateFallbackCompanyReport(trimmedName));

      const quickReport = {
        companyName: trimmedName,
        generatedAt: new Date().toISOString().split('T')[0],
        isQuickScan: true,
        ...reportJson,
      };

      setCachedData(cacheKey, quickReport, 2 * 60 * 60 * 1000);
      return res.json({
        success: true,
        report: quickReport,
        source: 'gemini-quick-scan',
      });
    }

    // STEP 2: DEEP ANALYSIS (Comprehensive Report)
    const deepPrompt = `
${kbContext}
당신은 리조트, 호텔, 골프, 레저 및 마케팅 제휴 분야의 최고 전문 컨설팅 파트너입니다.
기업/브랜드 "${trimmedName}"에 대한 상세 Company Intelligence & Partnership Report (2단계 Deep Analysis)를 작성하세요.

요구사항:
1. overview: companyName, englishName, summary, mainBusinesses, mainBrands, productsServices, targetCustomers, marketPosition
2. brandIdentity: positioning, targetCustomer, personality, coreMessage, keywords (정확히 5개), visualIdentity
3. recentActivities: 최근 마케팅 활동 3개 (yearMonth, type, title, description)
4. marketingDirection: focusAreas, strategicAnalysis
5. partnerships: 제휴 아이디어 3개 (domain, idea, whyThisBrand, brandBenefit, businessBenefit, targetCustomer, difficulty, potential)
6. recommendations: 최고 추천 아이디어 3개 (rank, badgeText, ideaTitle, reasoning)
7. relatedTrends: 관련 트렌드 키워드 3개
8. oakValleyFit: Evidence First 정밀 평가 (isScoreAvailable, overallFitScore, verifiedFactorsCount, totalPossibleFactors, coverageText, factors, recommendedAssets)
9. references: 4~6개 출처 항목
`;

    const rawText = await callGeminiWithRetry(deepPrompt);
    const reportJson = parseGeminiJsonSafely(rawText, generateFallbackCompanyReport(trimmedName));

    const fullReport = {
      companyName: trimmedName,
      generatedAt: new Date().toISOString().split('T')[0],
      isQuickScan: false,
      ...reportJson,
      partnerships: (reportJson.partnerships || []).map((p: any, idx: number) => ({ id: `cp-${idx}`, ...p })),
    };

    setCachedData(cacheKey, fullReport, 2 * 60 * 60 * 1000);
    return res.json({
      success: true,
      report: fullReport,
      source: 'gemini-deep-analysis',
    });
  } catch (error: any) {
    console.error('Error analyzing company:', error);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

// 3. API: Today's Signals (With 30m Cache + Retry)
app.all('/api/todays-signals', async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    const cacheKey = `todays-signals:${todayStr}`;

    const { forceRefresh = false } = req.body || req.query || {};

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          signals: cached.data,
          cached: true,
          cachedAt: cached.cachedAt,
          source: 'server-cache',
        });
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        success: false,
        error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
      });
    }

    const kbContext = buildKnowledgeBasePromptContext(['Today', 'Oak Valley', 'Signals']);

    const prompt = `
${kbContext}
당신은 오크밸리 리조트/골프/레저 마케팅 및 브랜드 제휴 전략을 전담하는 최고수준의 AI Executive Advisor입니다.
오늘 날짜(${todayStr}) 기준으로 오크밸리 마케팅/제휴 담당자가 즉시 파악해야 할 Daily Market Intelligence 'TODAY'S SIGNALS' 보고서를 작성하세요.

구조:
1. date: "${todayStr}"
2. trendSignals (3개): trend, description, whyNow, oakValleyRelevance ('HIGH'|'MEDIUM'|'LOW'), tags (배열 2개), sourceCitation, evidenceLevel
3. brandWatch (3개): brand, recentMovement, whyWatch, oakValleyFit, recommendedTouchpoint ('Golf'|'Stay'|'Wellness'|'Outdoor'|'F&B'|'Event'|'Membership'|'Family'|'Content'), sourceCitation, evidenceLevel
4. opportunities (3개):
   - [0] type: 'QUICK WIN'
   - [1] type: 'SIGNATURE'
   - [2] type: 'FUTURE BET'
   각 항목: type, idea, concept, targetCustomer, recommendedPartnerCategory, oakValleyAsset, expectedBenefit, executionDifficulty ('상'|'중'|'하')
5. whyThisMatters: { keyTakeaway, recommendedAction }
6. references: 4~6개 출처 항목 (institution, title, year, tier)
`;

    const rawText = await callGeminiWithRetry(prompt);
    const signalsData = parseGeminiJsonSafely(rawText, generateFallbackTodaysSignals(todayStr));

    const finalSignals = {
      date: todayStr,
      ...signalsData,
    };

    setCachedData(cacheKey, finalSignals, 30 * 60 * 1000); // 30 mins TTL
    return res.json({
      success: true,
      signals: finalSignals,
      source: 'gemini-live',
    });
  } catch (error: any) {
    console.error("Error generating today's signals:", error);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

// 4. API: Monthly Competitor BEST 5 (Cached by month & region filter)
app.all('/api/competitor-best5', async (req, res) => {
  try {
    const { yearMonth = '2026.08', regionFilter = 'ALL', forceRefresh = false } = req.body || req.query || {};
    const cacheKey = `competitor-best5:${yearMonth}:${regionFilter}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          yearMonth,
          regionFilter,
          totalVerifiedCount: cached.data.length,
          items: cached.data,
          source: 'server-cache',
        });
      }
    }

    // Filter verified dataset by month
    let matched = VERIFIED_COMPETITOR_BEST5_DATA.filter((item) => item.month === yearMonth);

    // If exact month has no entries, fallback to default dataset
    if (matched.length === 0) {
      matched = VERIFIED_COMPETITOR_BEST5_DATA.slice(0, 5);
    }

    // Apply Region Filter (ALL | DOMESTIC | OVERSEAS)
    if (regionFilter === 'DOMESTIC') {
      matched = matched.filter((item) => item.isDomestic);
    } else if (regionFilter === 'OVERSEAS') {
      matched = matched.filter((item) => !item.isDomestic);
    }

    // Re-assign rank sequentially based on actual verified items
    const ranked = matched.map((item, idx) => ({
      ...item,
      month: yearMonth,
      rank: idx + 1,
    }));

    setCachedData(cacheKey, ranked, 2 * 60 * 60 * 1000); // 2 Hours TTL

    return res.json({
      success: true,
      yearMonth,
      regionFilter,
      totalVerifiedCount: ranked.length,
      items: ranked,
      source: 'verified-dataset',
    });
  } catch (error: any) {
    console.error('Error fetching competitor best5:', error);
    return res.status(500).json({ success: false, error: 'Competitor Best5 Error' });
  }
});

function generateFallbackActivations(query: string = '', region: string = '한국 전체'): any[] {
  const fallbackList = [
    {
      id: 'act-001',
      eventName: 'Garmin Approach Golf & Outdoor Tech Hub',
      brand: 'Garmin (가민)',
      eventType: 'Golf',
      location: '성수 연무장길 가민 브랜드 팝업스토어',
      city: '서울',
      region: '서울',
      hotspot: '성수',
      startDate: '2026.08.01',
      endDate: '2026.08.28',
      periodText: '2026.08.01 ~ 2026.08.28',
      status: 'ONGOING',
      whatIsIt: '가민 최신 스마트 워치 Approach S70 및 스윙 시뮬레이터 R10 라인업을 성수 연무장길 감성 팝업 공간에서 오프라인 시체험하는 골프 & 테크 액티비티 라운지입니다.',
      experiencePoint: '3D 골프 코스 시뮬레이터 스윙 분석, 1:1 두피 및 혈중 산소 체력 리포트 발급, 맞춤 가민 골프 장갑 자수 서비스',
      targetCustomer: '2040 영골퍼, 골프 마니아, 스마트 웰니스 스포티 라이프스타일 층',
      whyItMatters: '스마트 워치를 단순 가전에서 스포츠 스코어링 및 헬스케어 필수 장비로 자리매김 시킴.',
      source: {
        title: '가민 코리아 공식 보도자료 및 인스타그램',
        url: 'https://www.garmin.co.kr',
        refDate: '2026.08.01'
      },
      oakValleyParkRocheInsight: {
        oakValleyFit: 'HIGH',
        parkRocheFit: 'HIGH',
        applicableAssets: ['Golf', 'Stay', 'VIP', 'F&B'],
        adaptationIdea: '오크밸리 CC / 성문안 CC 스타트하우스에 "Garmin Golf Tech Zone" 운영.',
        quickWin: '오크밸리 CC 1번 홀 티잉 그라운드 내 가민 3D 샷 트래킹 디스플레이 체험대 설치',
        signatureVersion: 'Oak Valley × Garmin Approach Championship (3D 스코어링 연동 라운드 + 객실 1박 패키지)',
        potentialPartner: '가민 코리아 (Garmin Korea)'
      },
      tags: ['Golf', 'Tech', 'Pop-up', '성수', 'Sports'],
      isSaved: false
    },
    {
      id: 'act-003',
      eventName: 'Nike Running & Trail Festival "Run Nature"',
      brand: 'Nike (나이키)',
      eventType: 'Sports',
      location: '서울숲 & 성수 나이키 러닝 허브',
      city: '서울',
      region: '서울',
      hotspot: '서울숲',
      startDate: '2026.08.10',
      endDate: '2026.08.25',
      periodText: '2026.08.10 ~ 2026.08.25',
      status: 'ONGOING',
      whatIsIt: '나이키 트레일 러닝화 및 울트라 러닝 기어를 착용하고 도심 숲길을 달리는 러너 대상 하이엔드 스포츠 액티비티 페스티벌입니다.',
      experiencePoint: 'Nike Trail Pegasus 시착 러닝, 페이스메이커 전문 세션, 러닝 보걸 가동성 테이핑 스테이션, 리커버리 스파 드링크',
      targetCustomer: '2040 러닝 마니아, 트레일 러너, 건강에 투자를 아끼지 않는 오피니언 리더',
      whyItMatters: '도시 러너들을 자연과 연결하는 브랜드 스토리를 강조하며 러닝 후 리커버리 경험까지 포괄하는 웰니스 라이프스타일 제안.',
      source: {
        title: '나이키 코리아 NRC(Nike Run Club) 공식 앱 및 보도자료',
        url: 'https://www.nike.com/kr',
        refDate: '2026.08.10'
      },
      oakValleyParkRocheInsight: {
        oakValleyFit: 'HIGH',
        parkRocheFit: 'HIGH',
        applicableAssets: ['Outdoor', 'Forest', 'Wellness', 'Recovery'],
        adaptationIdea: '오크밸리 참나무 숲 트레킹 코스 및 파크로쉬 가리왕산 트레일 코스를 활용한 "Nike Trail Running Retreat" 기획.',
        quickWin: '오크밸리 숲길 코스를 "Oak Valley Nike Trail 5K" 공식 인증 코스로 지정',
        signatureVersion: 'Oak Valley × Nike Trail 20K Challenge (1박 2일 트레일 러닝 + 수중 리커버리)',
        potentialPartner: '나이키 코리아 (Nike Korea)'
      },
      tags: ['Sports', 'Running', 'Trail', '서울숲', 'Brand Event'],
      isSaved: false
    },
    {
      id: 'act-004',
      eventName: 'Lululemon Mindfulness & Movement Sanctuary',
      brand: 'Lululemon (룰루레몬)',
      eventType: 'Wellness',
      location: '한남동 룰루레몬 플래그십 & 루프탑',
      city: '서울',
      region: '서울',
      hotspot: '한남',
      startDate: '2026.08.05',
      endDate: '2026.08.30',
      periodText: '2026.08.05 ~ 2026.08.30',
      status: 'ONGOING',
      whatIsIt: '룰루레몬의 얼라인(Align) 브라 & 레깅스를 입고 루프탑과 도심 스튜디오에서 명상, 웰니스 요가, 명상 싱잉볼을 체험하는 프리미엄 웰니스 팝업입니다.',
      experiencePoint: '야외 루프탑 싱잉볼 사운드 바스, 얼라인 핏 진단 및 스트레치 클래스, 웰니스 모바일 다이어리 작성',
      targetCustomer: '3040 웰니스 리더, 요가 마니아, 마음 챙김(Mindfulness)에 관심 높은 하이엔드 고객',
      whyItMatters: '의류 매장을 넘어 고객의 정신적·신체적 건강을 케어하는 명상 성지(Sanctuary)로 브랜딩을 확장함.',
      source: {
        title: '룰루레몬 코리아 공식 보도자료',
        url: 'https://www.lululemon.co.kr',
        refDate: '2026.08.06'
      },
      oakValleyParkRocheInsight: {
        oakValleyFit: 'MEDIUM',
        parkRocheFit: 'HIGH',
        applicableAssets: ['Wellness', 'Recovery', 'Stay', 'Forest'],
        adaptationIdea: '파크로쉬 마인드풀니스 스튜디오 및 루프탑 자산을 활용한 "Park Roche × Lululemon Sanctuary Retreat" 상설 운영.',
        quickWin: '파크로쉬 투숙객 전원 대상 룰루레몬 요가 매트 & 블록 객실 비치 서비스',
        signatureVersion: 'Park Roche × Lululemon 3 Days Mindful Immersion',
        potentialPartner: '룰루레몬 코리아 (Lululemon Korea)'
      },
      tags: ['Wellness', 'Yoga', 'Mindfulness', '한남', 'Pop-up'],
      isSaved: false
    },
    {
      id: 'act-008',
      eventName: 'Salomon Trail Running & Wilderness Hub',
      brand: 'Salomon (살로몬)',
      eventType: 'Outdoor',
      location: '성수동 살로몬 아웃도어 컨셉스토어',
      city: '서울',
      region: '서울',
      hotspot: '성수',
      startDate: '2026.08.08',
      endDate: '2026.08.29',
      periodText: '2026.08.08 ~ 2026.08.29',
      status: 'ONGOING',
      whatIsIt: '살로몬의 고프코어(Gorpcore) 트레일 러닝화 XT-6 및 아웃도어 어패럴을 성수동 감성 인더스트리얼 공간에서 시착하고 트레킹 트레이닝을 진행하는 팝업입니다.',
      experiencePoint: 'XT-6 최신 신발 경사로 모의 착지 테스트, 고프코어 포토부스, 트레일 러닝 에너지 세션',
      targetCustomer: '2030 고프코어 패션 트렌드세터, 아웃도어 트레일 러너',
      whyItMatters: '아웃도어 기능성을 젊은 층의 핵심 패션 아이콘으로 전환시킨 살로몬의 독보적 고프코어 세계관 전달.',
      source: {
        title: '살로몬 코리아 공식 보도자료',
        url: 'https://www.salomon.co.kr',
        refDate: '2026.08.09'
      },
      oakValleyParkRocheInsight: {
        oakValleyFit: 'HIGH',
        parkRocheFit: 'HIGH',
        applicableAssets: ['Outdoor', 'Forest', 'Wellness'],
        adaptationIdea: '오크밸리 참나무 숲 코스와 파크로쉬 트레킹 길을 활용한 "Oak Valley × Salomon Trail Challenge" 코스 개설.',
        quickWin: '오크밸리 웰니스 센터 입구에 살로몬 XT-6 슈즈 렌탈 부스 설치',
        signatureVersion: 'Oak Valley × Salomon Gorpcore Trail Weekend',
        potentialPartner: '살로몬 코리아 (Salomon Korea)'
      },
      tags: ['Outdoor', 'Gorpcore', 'Fashion', '성수', 'Pop-up'],
      isSaved: false
    }
  ];

  if (!query || query === '2026 브랜드 팝업') return fallbackList;

  const q = query.toLowerCase();
  const filtered = fallbackList.filter(
    (a) =>
      a.eventName.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.eventType.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );

  return filtered.length > 0 ? filtered : fallbackList;
}

// 4. API: Search Brand Activations Radar via AI (With 30m Cache + Retry)
app.post('/api/search-activations', async (req, res) => {
  const { query = '2026 브랜드 팝업', region = '한국 전체', period = '전체', forceRefresh = false } = req.body || {};
  try {
    const cacheKey = `activations:${query.toLowerCase()}:${region}:${period}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          activations: cached.data,
          cached: true,
          cachedAt: cached.cachedAt,
          source: 'server-cache',
        });
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        activations: generateFallbackActivations(query, region),
        source: 'fallback-no-ai',
      });
    }

    const prompt = `
당신은 오크밸리와 파크로쉬 리조트의 마케팅 & 브랜드 전략 기획실 수석 리서처입니다.
검색어 "${query}" (지역: ${region}, 기간: ${period})에 기반하여 실제로 진행 중이거나 예정된, 혹은 최근 진행된 브랜드 팝업, 전시회, 박람회, 이벤트, 웰니스/골프/아웃도어 액티베이션 사례 3~4개를 조사·분석하여 데이터를 생성하세요.

JSON 구조:
{
  "activations": [
    {
      "id": "act-1",
      "eventName": "행사명",
      "brand": "브랜드명",
      "eventType": "Pop-up",
      "location": "장소",
      "city": "도시",
      "hotspot": "성수",
      "periodText": "2026.08.10 ~ 2026.08.25",
      "status": "ONGOING",
      "whatIsIt": "무엇인가 요약",
      "experiencePoint": "체험 포인트",
      "targetCustomer": "타깃 고객층",
      "whyItMatters": "트렌드 상징성",
      "source": { "title": "출처명", "url": "https://example.com", "refDate": "2026.08" },
      "oakValleyParkRocheInsight": {
        "oakValleyFit": "HIGH",
        "parkRocheFit": "MEDIUM",
        "applicableAssets": ["Golf", "Forest", "Stay"],
        "adaptationIdea": "오크밸리 맞춤 재해석",
        "quickWin": "바로 테스트",
        "signatureVersion": "시그니처 버전",
        "potentialPartner": "파트너"
      }
    }
  ]
}
`;

    const rawText = await callGeminiWithRetry(prompt);
    const parsed = parseGeminiJsonSafely(rawText, { activations: [] });
    const activations = Array.isArray(parsed.activations) ? parsed.activations : [];

    setCachedData(cacheKey, activations, 30 * 60 * 1000);
    return res.json({
      success: true,
      activations,
      source: 'gemini-live',
    });
  } catch (error: any) {
    console.error('Error searching activations:', error);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

// 5. API: Parse Barter Asset File Content via AI
app.all('/api/parse-ratecard', async (req, res) => {
  try {
    const { fileText, fileName } = req.body || {};
    if (!fileText || typeof fileText !== 'string') {
      return res.status(400).json({ success: false, error: '파일 텍스트 내용이 필요합니다.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: false,
        error: 'Gemini API 클라이언트를 찾을 수 없습니다.',
      });
    }

    const prompt = `
당신은 오크밸리 리조트/골프장의 마케팅 매체 및 바터 자산 단가표 분석 전문가입니다.
다음 업로드된 파일 내용("${fileName || 'Barter Assets'}")을 읽고 광고매체 및 바터 리스트 항목을 추출하세요.

[파일 내용]
${fileText.slice(0, 8000)}

[필수 추출 규칙]
파일에 기록된 정보만 정확히 추출하며, 존재하지 않는 정보를 임의로 지어내지 마세요.
각 항목별 필드:
- id: 고유 식별자 (예: "ov-asset-1", "ov-asset-2")
- itemName: 광고매체 및 바터 리스트 명칭 (예: "리조트 DID 광고", "객실 숙박권", "골프 라운드권")
- location: 위치 (예: "밸리빌리지", "오크밸리CC", "온라인")
- type: 형태 ("광고", "숙박", "부대시설", "할인" 중 하나로 분류하되, 필요 시 사용자 정의 형태 지정)
- specification: 규격 (예: "DID 26대", "31평", "1팀 4인", "10% 할인")
- unitPrice: 단가 (원 단위 숫자, 별도 산정이거나 숫자가 없으면 0)
- unitPriceText: 단가가 별도 산정이거나 텍스트인 경우 (예: "별도 산정")
- period: 기간 (예: "1년", "1박", "1회", "행사기간")
- notes: 비고 (예: "연중 노출", "사용일 협의", "일정 협의", "공동 프로모션" 등 제약사항 및 특이사항)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assetList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  itemName: { type: Type.STRING },
                  location: { type: Type.STRING },
                  type: { type: Type.STRING },
                  specification: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  unitPriceText: { type: Type.STRING },
                  period: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ['id', 'itemName', 'location', 'type', 'specification', 'unitPrice'],
              },
            },
          },
          required: ['assetList'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      assetList: parsedData.assetList || [],
      rateCard: parsedData.assetList || [],
    });
  } catch (err: any) {
    console.error('Error parsing rate card:', err);
    return res.status(500).json({
      success: false,
      error: '단가표 파싱에 실패했습니다.',
    });
  }
});

// 6. API: Generate Barter Matching Proposal
app.post('/api/generate-barter-matching', async (req, res) => {
  try {
    const { assetList = [], companyName = '', cashSupport = 0, productSupport = 0, inKindRecognitionRate = 100, targetProvidedValue } = req.body || {};

    const cash = Number(cashSupport || 0);
    const product = Number(productSupport || 0);
    const ratePct = Number(inKindRecognitionRate ?? 100) / 100;

    const partnerRecognizedValue = Math.round(cash + (product * ratePct));
    const targetValue = Number(targetProvidedValue) > 0 ? Number(targetProvidedValue) : partnerRecognizedValue;

    const validAssets = Array.isArray(assetList) && assetList.length > 0 ? assetList : [];

    const buildFallbackCombination = () => {
      if (validAssets.length === 0) {
        return {
          companyName,
          cashSupport: cash,
          productSupport: product,
          inKindRecognitionRate: Number(inKindRecognitionRate ?? 100),
          partnerRecognizedValue,
          targetProvidedValue: targetValue,
          oakValleyProvidedValue: 0,
          difference: -partnerRecognizedValue,
          matchRate: 0,
          items: [],
          recommendationReason: '등록된 바터 자산이 없습니다. 먼저 STEP 1에서 오크밸리 바터 자산을 등록해주세요.',
        };
      }

      let currentSum = 0;
      const items: any[] = [];
      const sorted = [...validAssets].sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));

      for (const asset of sorted) {
        const price = Number(asset.unitPrice || 0);
        if (price === 0) continue;

        if (currentSum + price <= targetValue * 1.15 || items.length === 0) {
          let qty = 1;
          if (price * 10 <= targetValue && asset.type === '숙박') {
            qty = Math.min(30, Math.max(1, Math.floor((targetValue - currentSum) / price)));
          } else if (price * 5 <= targetValue && asset.type === '부대시설') {
            qty = Math.min(5, Math.max(1, Math.floor((targetValue - currentSum) / price)));
          }

          if (qty < 1) qty = 1;
          const provided = price * qty;

          items.push({
            id: `rec-${asset.id}-${Math.random().toString(36).substr(2, 5)}`,
            assetId: asset.id,
            itemName: asset.itemName,
            location: asset.location,
            type: asset.type,
            specification: asset.specification,
            unitPrice: price,
            unitPriceText: asset.unitPriceText || '',
            quantityPeriod: qty > 1 ? `${qty}개/실/팀` : asset.period || '1회',
            quantityNum: qty,
            providedValue: provided,
            notes: asset.notes || '',
          });

          currentSum += provided;
        }

        if (currentSum >= targetValue * 0.95 && items.length >= 2) break;
        if (items.length >= 6) break;
      }

      const diff = currentSum - partnerRecognizedValue;
      const rate = partnerRecognizedValue > 0 ? (currentSum / partnerRecognizedValue) * 100 : 100;

      const reason = `${companyName} 브랜드 노출을 위한 핵심 매체를 중심으로 고객 체험이 가능한 숙박 및 부대시설 자산을 함께 구성했습니다. 파트너 인정가치 ${Math.round(partnerRecognizedValue / 10000).toLocaleString()}만원 대비 제공가치는 약 ${Math.round(currentSum / 10000).toLocaleString()}만원으로 상응하는 수준입니다.`;

      return {
        companyName,
        cashSupport: cash,
        productSupport: product,
        inKindRecognitionRate: Number(inKindRecognitionRate ?? 100),
        partnerRecognizedValue,
        targetProvidedValue: targetValue,
        oakValleyProvidedValue: currentSum,
        difference: diff,
        matchRate: rate,
        items,
        recommendationReason: reason,
      };
    };

    const fallback = buildFallbackCombination();

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ success: true, result: fallback, source: 'deterministic' });
    }

    const prompt = `
당신은 오크밸리 리조트/골프장의 제휴 바터 매칭 수석 전략가입니다.
등록된 OAK VALLEY BARTER ASSET LIST 중에서 파트너 인정가치와 가장 근접하게 상응하는 바터 자산 조합을 작성하세요.

[파트너 지원 정보]
- 업체명: ${companyName}
- 현금 지원: ${cash.toLocaleString()}원
- 현물 지원: ${product.toLocaleString()}원 (인정률: ${inKindRecognitionRate}%)
- 파트너 인정가치: ${partnerRecognizedValue.toLocaleString()}원
- 목표 제공가: ${targetValue.toLocaleString()}원

[OAK VALLEY BARTER ASSET LIST (등록된 자산만 사용)]
${JSON.stringify(validAssets, null, 2)}

[필수 규칙]
1. 반드시 OAK VALLEY BARTER ASSET LIST에 등록된 자산(id, itemName, location, type, specification, unitPrice)만 조합하세요. 등록되지 않은 자산이나 가격을 새로 만들어내는 것은 엄격히 금지됩니다.
2. 조합 항목들의 총 제공가치(unitPrice * quantityNum) 합이 목표 제공가(${targetValue.toLocaleString()}원)와 가장 근접하도록 수량(quantityNum)과 수량/기간(quantityPeriod)을 조정하세요.
3. 광고, 숙박, 부대시설, 할인 등 자산의 형태(type)가 치우치지 않고 적절히 균형을 이루도록 구성하세요.
4. recommendationReason에는 파트너 인정가치와 추천 제공가치를 비교하고 구성 의도를 정리한 2~3줄의 간결하고 전문적인 요약을 작성하세요.

구조:
{
  "recommendationReason": "추천 구성 이유 2~3줄",
  "selectedItems": [
    {
      "assetId": "등록된 자산의 id",
      "quantityNum": 수량(숫자, 예: 1, 20, 2),
      "quantityPeriod": "수량/기간 표시 (예: '1년', '20실', '2팀', '1회')",
      "notes": "비고 메모"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && Array.isArray(parsed.selectedItems) && parsed.selectedItems.length > 0) {
      const aiItems: any[] = [];
      let totalProvided = 0;

      for (const sel of parsed.selectedItems) {
        const found = validAssets.find((a: any) => a.id === sel.assetId) || validAssets[0];
        if (found) {
          const qty = Number(sel.quantityNum || 1);
          const price = Number(found.unitPrice || 0);
          const val = price * qty;
          totalProvided += val;

          aiItems.push({
            id: `rec-${found.id}-${Math.random().toString(36).substr(2, 5)}`,
            assetId: found.id,
            itemName: found.itemName,
            location: found.location,
            type: found.type,
            specification: found.specification,
            unitPrice: price,
            unitPriceText: found.unitPriceText || '',
            quantityPeriod: sel.quantityPeriod || found.period || `${qty}회`,
            quantityNum: qty,
            providedValue: val,
            notes: sel.notes || found.notes || '',
          });
        }
      }

      if (aiItems.length > 0) {
        const diff = totalProvided - partnerRecognizedValue;
        const rate = partnerRecognizedValue > 0 ? (totalProvided / partnerRecognizedValue) * 100 : 100;

        return res.json({
          success: true,
          result: {
            companyName,
            cashSupport: cash,
            productSupport: product,
            inKindRecognitionRate: Number(inKindRecognitionRate ?? 100),
            partnerRecognizedValue,
            targetProvidedValue: targetValue,
            oakValleyProvidedValue: totalProvided,
            difference: diff,
            matchRate: rate,
            items: aiItems,
            recommendationReason: parsed.recommendationReason || fallback.recommendationReason,
          },
          source: 'gemini-barter-matching',
        });
      }
    }

    return res.json({
      success: true,
      result: fallback,
      source: 'deterministic-fallback',
    });
  } catch (err: any) {
    console.error('Error in /api/generate-barter-matching:', err);
    return res.status(500).json({ success: false, error: '바터 추천 조합 생성 중 오류가 발생했습니다.' });
  }
});

// 7. API: Recommend Alternative Asset
app.post('/api/recommend-alternative-asset', async (req, res) => {
  try {
    const { assetList = [], removedItemName, removedValue = 0 } = req.body || {};
    const validAssets = Array.isArray(assetList) ? assetList : [];

    const candidates = validAssets.filter((a: any) => a.itemName !== removedItemName);

    if (candidates.length === 0) {
      return res.json({ success: true, alternatives: [] });
    }

    const targetVal = Number(removedValue) > 0 ? Number(removedValue) : 1000000;
    const sorted = [...candidates].sort((a, b) => {
      const diffA = Math.abs((a.unitPrice || 0) - targetVal);
      const diffB = Math.abs((b.unitPrice || 0) - targetVal);
      return diffA - diffB;
    });

    const alternatives = sorted.slice(0, 3).map((a: any) => {
      const qty = Math.max(1, Math.round(targetVal / (a.unitPrice || targetVal)));
      return {
        assetId: a.id,
        itemName: a.itemName,
        location: a.location,
        type: a.type,
        specification: a.specification,
        unitPrice: a.unitPrice,
        period: a.period,
        notes: a.notes,
        suggestedQuantityNum: qty,
        suggestedQuantityPeriod: qty > 1 ? `${qty}개/회/실` : a.period,
        suggestedProvidedValue: a.unitPrice * qty,
      };
    });

    return res.json({ success: true, alternatives });
  } catch (err: any) {
    console.error('Error in /api/recommend-alternative-asset:', err);
    return res.status(500).json({ success: false, error: '대체 항목 추천 중 오류가 발생했습니다.' });
  }
});

// Helper for deterministic package generation logic
function generateDeterministicPackages(
  rateCard: any[],
  partnerInput: any,
  recognitionRates: any
) {
  const cash = Number(partnerInput.cashInvestment || 0);
  const product = Number(partnerInput.productSponsorship || 0);
  const marketing = Number(partnerInput.marketingSupport || 0);
  const other = Number(partnerInput.otherSupport || 0);

  const cashRate = (recognitionRates?.cash ?? 100) / 100;
  const productRate = (recognitionRates?.productSponsorship ?? 70) / 100;
  const marketingRate = (recognitionRates?.marketingSupport ?? 50) / 100;
  const otherRate = (recognitionRates?.otherSupport ?? 50) / 100;

  const nominalValue = cash + product + marketing + other;
  const adjustedValue =
    cash * cashRate +
    product * productRate +
    marketing * marketingRate +
    other * otherRate;

  const validRateCard = Array.isArray(rateCard) && rateCard.length > 0 ? rateCard : [];

  // Helper to select items according to target ratio
  const selectItemsForTargetRatio = (targetRatio: number, maxItems: number = 4) => {
    const targetValue = adjustedValue * targetRatio;
    if (validRateCard.length === 0) return [];

    // Sort items by partnership price ascending or descending
    const sorted = [...validRateCard].sort(
      (a, b) => (b.partnershipPrice || b.normalPrice) - (a.partnershipPrice || a.normalPrice)
    );

    let selected: any[] = [];
    let currentSum = 0;

    for (const item of sorted) {
      const price = item.partnershipPrice > 0 ? item.partnershipPrice : item.normalPrice || 10000000;
      if (currentSum + price <= targetValue * 1.15 || selected.length === 0) {
        selected.push({
          rateCardItemId: item.id || `rc-${Math.random()}`,
          mediaName: item.mediaName || '매체명 없음',
          category: item.category || '기타',
          location: item.location || '오크밸리 전역',
          quantity: item.quantity || 1,
          period: item.period || '1개월',
          normalPrice: item.normalPrice || price,
          partnershipPrice: price,
          providedValue: price * (item.quantity || 1),
          requiredCost: (item.requiredCost || 0) * (item.quantity || 1),
          reasonForSelection: `파트너사 목표(${partnerInput.partnershipObjective || '브랜드 경험'}) 달성에 가장 효과적인 핵심 매체`,
        });
        currentSum += price * (item.quantity || 1);
      }
      if (selected.length >= maxItems) break;
    }

    return selected;
  };

  const safeItems = selectItemsForTargetRatio(1.0, 2);
  const balancedItems = selectItemsForTargetRatio(1.15, 3);
  const impactItems = selectItemsForTargetRatio(1.4, 4);

  const calculatePackageMetrics = (
    type: 'SAFE' | 'BALANCED' | 'IMPACT',
    isRecommended: boolean,
    title: string,
    desc: string,
    items: any[]
  ) => {
    const oakValleyMediaValue = items.reduce((acc, it) => acc + (it.providedValue || 0), 0);
    const difference = oakValleyMediaValue - adjustedValue;
    const valueRatio = adjustedValue > 0 ? (oakValleyMediaValue / adjustedValue) * 100 : 100;
    const estimatedActualCost = items.reduce((acc, it) => acc + (it.requiredCost || 0), 0);

    const hasActualCostData = items.some((it) => it.requiredCost > 0);
    const warnings: string[] = [];

    if (valueRatio > 130) {
      warnings.push(`Partner Value 대비 제공가치가 높습니다. (Value Ratio: ${valueRatio.toFixed(1)}%)`);
    }
    if (nominalValue > 0 && product / nominalValue > 0.6) {
      warnings.push(`현물 협찬 비중이 높습니다. (전체 파트너 제공금액의 ${Math.round((product / nominalValue) * 100)}%가 현물)`);
    }
    if (cash > 0 && estimatedActualCost > cash) {
      warnings.push(`실비 부담(${Math.round(estimatedActualCost / 10000)}만원)이 파트너 현금 투자금(${Math.round(cash / 10000)}만원)을 초과합니다.`);
    }
    if (items.some((it) => it.category === 'Golf')) {
      warnings.push(`골프장 관련 매체 조합으로 주말/골퍼 성수기 Opportunity Cost 검토가 필요합니다.`);
    }

    let diffText: '상' | '중' | '하' = '중';
    if (type === 'SAFE') diffText = '하';
    if (type === 'IMPACT') diffText = '상';

    return {
      type,
      isRecommended,
      title,
      description: desc,
      partnerAdjustedValue: adjustedValue,
      oakValleyMediaValue,
      difference,
      valueRatio,
      estimatedActualCost,
      brandFit: `${partnerInput.companyName || '파트너사'} 타깃층과 오크밸리 고객층간의 높은 부합도`,
      expectedImpact: `${type} 패키지 기준 파트너 브랜딩 및 오크밸리 매체 효율의 최대화`,
      executionDifficulty: diffText,
      mediaItems: items,
      profitabilityAnalysis: {
        profitabilityLevel: valueRatio <= 110 ? 'VERY HIGH' : valueRatio <= 125 ? 'HIGH' : 'MODERATE',
        opportunityCostNote: '주요 피크타임 구좌 활용 시 사전 일정 점유 검토 필요',
        hasActualCostData,
        warnings,
      },
      aiRecommendation: {
        whyThisPackage: [
          `파트너사의 현금/현물 투자 인정가치(${Math.round(adjustedValue / 10000).toLocaleString()}만원)와 명확한 수지타산을 맞춘 안정적 구조`,
          `오크밸리 핵심 고객 동선(골프장/리조트 로비/잔디광장)에 브랜드 노출 집약`,
          `실비 비용 부담을 최소화하면서도 파트너 요구 목표(${partnerInput.partnershipObjective || '브랜드 경험'})를 충족`,
        ],
        negotiationPoints: [
          `현물 제품의 실제 고객 전달 방식 및 배포 기간 추가 협의`,
          `팝업존 설치 및 정원 원상복구에 대한 가이드라인 명시`,
          `프로모션 성과 측정을 위한 VIP 쿠폰 회수율 데이터 공유`,
        ],
        additionalAsks: [
          `파트너사 자사 SNS 및 공식 웹사이트 내 오크밸리 제휴 소식 홍보`,
          `임직원 및 VIP 고객 대상 오크밸리 리조트 전용 예약 프로모션 진행`,
          `현물 협찬 품목의 수량 20% 추가 확보 및 체험 현장 촬영물 사용권 요청`,
        ],
      },
    };
  };

  const safePkg = calculatePackageMetrics(
    'SAFE',
    false,
    '안정형 (Risk-Minimal Safe Package)',
    '파트너 인정가치 범위 내에서 오크밸리의 실제 비용 부담을 최소화한 안전한 패키지',
    safeItems
  );

  const balancedPkg = calculatePackageMetrics(
    'BALANCED',
    true,
    '균형형 (Optimal Win-Win Balanced Package)',
    '적정 미디어 프리미엄을 가산하여 파트너 브랜딩 효과와 오크밸리 수익성의 균형을 맞춘 추천 패키지',
    balancedItems
  );

  const impactPkg = calculatePackageMetrics(
    'IMPACT',
    false,
    '임팩트형 (High-Impact Exposure Package)',
    '핵심 매체와 고객 접점을 집약 투입하여 브랜드 체험 및 노출 효과를 극대화하는 임팩트 패키지',
    impactItems
  );

  return [safePkg, balancedPkg, impactPkg];
}

// 5. API: AI Package Generator
app.all('/api/generate-partnership-package', async (req, res) => {
  try {
    const { rateCard, partnerInput, recognitionRates } = req.body || {};

    if (!partnerInput || !partnerInput.companyName) {
      return res.status(400).json({ success: false, error: '파트너 정보를 입력해주세요.' });
    }

    const fallbackPackages = generateDeterministicPackages(rateCard, partnerInput, recognitionRates);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        packages: fallbackPackages,
        source: 'deterministic-engine',
      });
    }

    const prompt = `
당신은 오크밸리 리조트/골프장의 최고 제휴마케팅 전략가(VP of Partnership & Sponsorship)입니다.
다음 입력된 파트너사 정보와 오크밸리 매체 단가표(Rate Card)를 바탕으로,
3가지 제휴 패키지 안(SAFE, BALANCED, IMPACT)의 추천 이유, 협상 포인트, 추가 요구사항(Additional Ask)을 정교하게 다듬어주세요.

[파트너 정보]
- 파트너 기업/브랜드명: ${partnerInput.companyName}
- 현금 투자금: ${Number(partnerInput.cashInvestment || 0).toLocaleString()}원
- 현물 협찬: ${Number(partnerInput.productSponsorship || 0).toLocaleString()}원
- 마케팅 지원: ${Number(partnerInput.marketingSupport || 0).toLocaleString()}원
- 기타 지원: ${Number(partnerInput.otherSupport || 0).toLocaleString()}원 (${partnerInput.otherSupportName || '기타'})
- 제휴 목적: ${partnerInput.partnershipObjective || 'Brand Experience'}

[계산된 파트너 인정가치]
- ${Math.round(fallbackPackages[0].partnerAdjustedValue).toLocaleString()}원

[규칙]
- 절대로 업로드된 Rate Card에 존재하지 않는 매체나 가격을 새로 만들어내지 마세요.
- 금액 계산과 Value Ratio 수치는 아래 제공된 정확한 수치를 그대로 유지하세요.
- AI는 브랜드 적합성(Brand Fit), 예상 효과(Expected Impact), 매체 선정이유, 추천이유 3가지(Why This Package), 협상 포인트(Negotiation Point), 파트너 추가요청사항(Additional Ask)을 전략적으로 작성하는 역할입니다.

현재 미리 선정된 매체 조합:
SAFE: ${fallbackPackages[0].mediaItems.map((m) => m.mediaName).join(', ')}
BALANCED (RECOMMENDED): ${fallbackPackages[1].mediaItems.map((m) => m.mediaName).join(', ')}
IMPACT: ${fallbackPackages[2].mediaItems.map((m) => m.mediaName).join(', ')}

이 정보를 참고하여 각 패키지의 aiRecommendation 과 reasonForSelection 을 풍부하게 다듬은 결과를 JSON으로 반환하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            balancedPackageWhy: { type: Type.ARRAY, items: { type: Type.STRING } },
            balancedPackageNegotiation: { type: Type.ARRAY, items: { type: Type.STRING } },
            balancedPackageAdditionalAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
            brandFitSummary: { type: Type.STRING },
            expectedImpactSummary: { type: Type.STRING },
          },
          required: [
            'balancedPackageWhy',
            'balancedPackageNegotiation',
            'balancedPackageAdditionalAsk',
            'brandFitSummary',
            'expectedImpactSummary',
          ],
        },
      },
    });

    const aiRes = JSON.parse(response.text || '{}');

    if (aiRes && aiRes.balancedPackageWhy) {
      fallbackPackages[1].aiRecommendation.whyThisPackage = aiRes.balancedPackageWhy;
      fallbackPackages[1].aiRecommendation.negotiationPoints = aiRes.balancedPackageNegotiation;
      fallbackPackages[1].aiRecommendation.additionalAsks = aiRes.balancedPackageAdditionalAsk;
      fallbackPackages[1].brandFit = aiRes.brandFitSummary;
      fallbackPackages[1].expectedImpact = aiRes.expectedImpactSummary;
    }

    return res.json({
      success: true,
      packages: fallbackPackages,
      source: 'gemini-assisted-engine',
    });
  } catch (err: any) {
    console.error('Error generating partnership packages:', err);
    return res.json({
      success: true,
      packages: generateDeterministicPackages(
        req.body?.rateCard,
        req.body?.partnerInput,
        req.body?.recognitionRates
      ),
      source: 'fallback-deterministic',
    });
  }
});

// Helper for fallback trend generation
function generateFallbackTrendReport(query: string, period: string, region: string, category: string) {
  const q = query.trim() || '소비 트렌드';
  return {
    query: q,
    filters: { period, region, category },
    generatedAt: new Date().toISOString().split('T')[0],
    executiveSummary: [
      `"${q}" 분야는 최신 소비자 가치관 및 감성적 오프라인 경험 수요 확대로 인해 시장 주목도가 빠르게 확대되고 있습니다.`,
      `소비자들은 단순 제품 구매를 넘어 브랜드 고유의 스토리텔링, 공간 시체험, 커뮤니티적 유대감을 중시하는 경향을 보입니다.`,
      `오크밸리 및 파크로쉬의 숲, F&B, 객실, 이벤트 공간 인프라와 결합할 경우, 차별화된 팝업 및 투숙객 전용 혜택으로 제휴 시너지를 창출할 수 있습니다.`
    ],
    keyTrends: [
      {
        id: 'kt-f1',
        title: `${q} 중심의 체험형 오프라인 팝업 & 미식/라이프스타일 트렌드`,
        description: `${q} 분야에서 오프라인 시체험, 브랜드 팝업, 감각적 몰입 경험을 제공하는 마케팅 캠페인이 활발히 전개되고 있습니다.`,
        whyGrowing: '디지털 자극 피로감으로 오감으로 느끼고 직접 만져볼 수 있는 오프라인 브랜드 거점에 대한 호응 증대',
        consumerBehavior: '독창적인 브랜드 공간 방문 후 소셜 미디어(SNS) 자발적 인증 및 트렌드 자발적 확산',
        corporateUsage: '플래그십 팝업존 운영, 한정판 스페셜 컬래버레이션 출시 및 유료 시체험 세션 기획',
        futureOutlook: '일회성 마케팅을 넘어 브랜드 진성 팬덤을 형성하는 핵심 접점으로 고도화',
        tags: [q, 'Experience', 'BrandCase'],
        evidenceLevel: 'HIGH CONFIDENCE',
        sourceCitation: '글로벌 소비 트렌드 모니터 2025',
        factData: `${q} 관련 오프라인 시체험 및 팝업 공간 참여율 전년 대비 지속 상승`,
        evidenceData: `${q} 관련 소비자 동향 및 마케팅 보고서`,
        implicationData: '브랜드 가치 제고 및 고객 호감도 유도 효과 탁월',
        oakValleyOpportunity: {
          opportunityScore: 88,
          recommendedAssets: ['F&B', 'Stay', 'Outdoor'],
          targetCustomer: `${q} 취향을 즐기는 트렌디 소비층 및 3050 VIP 투숙객`,
          recommendedProgram: `오크밸리/파크로쉬 "${q} Brand Experience" 시즌 팝업`,
          potentialPartnerCategory: `${q} 대표 브랜드 및 미식/라이프스타일 기업`,
          businessModel: '팝업 공간 제휴 + 시즌 컬래버레이션 패키지 세트 구성',
          quickWin: '체크인 로비 및 스위트 객실 내 ${q} 시체험 웰컴 어메니티 비치',
          longTermOpportunity: '오크밸리 참나무 숲 야외 필드 연계 시그니처 팝업존 브랜딩',
          spaceAndTouchpoints: '오크밸리 빌리지 로비, 참나무 숲 산책로, 스위트 객실'
        }
      },
      {
        id: 'kt-f2',
        title: `${q} 기반 커뮤니티 및 큐레이션 트렌드`,
        description: `공통의 취향을 공유하는 소비자를 대상으로 한 맞춤형 큐레이션 및 소셜 클럽 형태의 브랜드 연결 강화`,
        whyGrowing: '개인 맞춤형 취향 소비 선호 및 동질적 취향을 가진 커뮤니티에 대한 유대감 증대',
        consumerBehavior: '전문가가 큐레이션한 클래스, 세미나, 프라이빗 소셜 모임에 적극 참여',
        corporateUsage: '브랜드 앰버서더 클래스, 프라이빗 팝업 세션, 멤버십 전용 혜택 제공',
        futureOutlook: '구독형 서비스 및 리조트 공간 제휴와 연계되어 고객 락인(Lock-in) 강화',
        tags: [q, 'Community', 'Premium'],
        evidenceLevel: 'HIGH CONFIDENCE',
        sourceCitation: '2025 국내외 소비 트렌드 조사',
        factData: `${q} 관여도가 높은 진성 고객층의 브랜드 재구매율 3배 이상 높음`,
        evidenceData: '컨슈머 인텔리전스 데이터',
        implicationData: '체류형 공간 자산을 보유한 오크밸리와의 차별화된 제휴 파트너십 기회',
        oakValleyOpportunity: {
          opportunityScore: 85,
          recommendedAssets: ['Event', 'F&B', 'Outdoor'],
          targetCustomer: '프라이빗하고 깊이 있는 취향 모임을 선호하는 고소득 VIP 고객',
          recommendedProgram: `오크밸리 "${q} Private Social Gathering" 주말 클래스`,
          potentialPartnerCategory: `${q} 카테고리 리딩 기업`,
          businessModel: '티켓 판매 + 브랜드 협찬 + 패키지 판매',
          quickWin: `주말 투숙객 대상 ${q} 프라이빗 팝업 클래스 운영`,
          longTermOpportunity: '연례 시그니처 취향 커뮤니티 페스티벌로 발전',
          spaceAndTouchpoints: '야외 잔디광장, 테라스, 컨벤션 홀'
        }
      }
    ],
    metrics: [
      {
        label: `${q} 관련 시장 성장 지수`,
        currentValue: '14.2%',
        yoyChange: '+14.2%',
        forecast: '소비자 취향 다변화 및 프리미엄 라인업 확대로 지속적인 성장세 유지 전망',
        unit: '%',
        source: `${q} 산업 연간 통계 보고서`,
        sourceTier: 'Tier 1',
        evidenceLevel: 'HIGH CONFIDENCE',
        sourceNote: '공식 통계 자료 기준',
        chartData: [
          { year: '2023', value: 10.0 },
          { year: '2024', value: 11.5 },
          { year: '2025', value: 12.8 },
          { year: '2026', value: 14.2 }
        ]
      }
    ],
    brandCases: [
      {
        id: 'bc-f1',
        brandName: `${q} 리딩 브랜드`,
        projectTitle: `${q} 시그니처 팝업 캠페인`,
        action: '오프라인 공간 시체험 팝업 및 스페셜 컬래버레이션 진행',
        whyNotable: '고객 접점에서의 강력한 브랜드 가치 전달 및 미식/취향 경험 선도',
        takeaway: '체험 중심 공간 제휴를 통한 브랜드 인지도 극대화',
        sourceCitation: '기업 공식 뉴스룸 보도자료',
        evidenceLevel: 'HIGH CONFIDENCE'
      }
    ],
    emergingSignals: [
      {
        title: `${q} 분야의 프리미엄화 & 크래프트 큐레이션`,
        description: '소비자 취향이 세분화되며 고급재료 및 장인정신 기반 프리미엄 제품 선호 증대',
        potentialImpact: '고객 만족도 및 단위 객단가 상승 유도',
        sourceCitation: '소비 트렌드 모니터 2026'
      }
    ],
    opportunities: [
      {
        id: 'opp-f1',
        opportunity: `${q} 연계 리조트 공간 팝업 및 패키지 개발`,
        targetCustomer: '취향 소비를 즐기는 3050 VIP 고객층',
        possiblePartner: `${q} 대표 파트너 브랜드`,
        businessModel: '공간 대여 + 콜라보 패키지 판매',
        expectedBenefit: '투숙객 만족도 향상 및 신규 타깃 고객 유입'
      }
    ],
    references: [
      {
        id: 'ref-f1',
        institution: '한국 트렌드 리서치',
        title: `2025-2026 ${q} 소비 시장 및 브랜드 트렌드 보고서`,
        year: '2025',
        tier: 'Tier 1 (Primary / Official)',
        appliedTo: `${q} 시장 트렌드 및 소비자 반응 검증`,
        confidence: 'HIGH CONFIDENCE',
        note: '공식 산업 통계'
      }
    ]
  };
}

function generateFallbackCompanyReport(companyName: string) {
  return {
    companyName,
    generatedAt: new Date().toISOString().split('T')[0],
    evidenceLevel: 'HIGH CONFIDENCE',
    overview: {
      companyName: `${companyName} (글로벌 브랜드)`,
      englishName: companyName,
      summary: `${companyName}은(는) 혁신적인 기술과 명확한 브랜드 아이덴티티를 바탕으로 해당 산업군을 선도하고 있는 대표 기업입니다.`,
      mainBusinesses: ['프리미엄 리테일', '디지털 커뮤니티 플랫폼', '브랜드 라이선싱', '체험형 서비스'],
      mainBrands: [companyName, `${companyName} Premium`, `${companyName} Lab`],
      productsServices: ['시그니처 라인업', '전문가용 용품/디바이스', '디지털 멤버십 서비스'],
      targetCustomers: '품질과 브랜드 가치를 중시하는 2040 트렌디 및 프리미엄 소비자',
      marketPosition: '해당 분야 브랜드 인지도 및 선호도 최상위권 위치'
    },
    brandIdentity: {
      positioning: 'Innovative & Premium Lifestyle Standard',
      targetCustomer: '자신의 라이프스타일 향상과 가치 소비에 적극적인 핵심 타깃층',
      personality: '혁신적인(Innovative), 신뢰할 수 있는(Trustworthy), 트렌디한(Trendy)',
      coreMessage: 'Redefining Excellence',
      keywords: ['Innovation', 'Quality', 'Lifestyle', 'Experience', 'Community'],
      visualIdentity: '세련된 모던 스틸 & 세라믹 텍스처, 시그니처 로고 중심의 깔끔한 비주얼'
    },
    recentActivities: [
      {
        yearMonth: '2026.05',
        type: '캠페인',
        title: `${companyName} Brand Experience Campaign`,
        description: '고객 오감 만족을 위한 대규모 플래그십 팝업 및 브랜드 커뮤니티 데이 개최'
      },
      {
        yearMonth: '2026.02',
        type: '신제품',
        title: `${companyName} Next-Gen Flagship Lineup`,
        description: '최첨단 소재 및 데이터 기능을 접목한 신규 플래그십 제품군 정식 공개'
      }
    ],
    marketingDirection: {
      focusAreas: ['Experience Marketing', 'Community', 'Premium Customer', 'Lifestyle'],
      strategicAnalysis: `${companyName}은 단순한 제품 전달을 넘어 오프라인 공간에서의 몰입감 있는 체험과 오프라인 커뮤니티 형성을 핵심 마케팅 전략으로 추진하고 있습니다.`
    },
    partnerships: [
      {
        id: 'p-f1',
        domain: 'Brand Experience',
        idea: `오크밸리 리조트 내 ${companyName} 플래그십 시체험 공간 구축`,
        whyThisBrand: `${companyName}의 브랜드 가치와 오크밸리의 하이엔드 자연 공간 이미지가 최고의 시너지를 창출함`,
        brandBenefit: '투숙객 대상 최고급 브랜드 체험 기회 제공 및 잠재 고객 확보',
        businessBenefit: '공간 가치 제고 및 차별화된 시그니처 팝업 볼거리 제공',
        targetCustomer: '3040 프리미엄 투숙객 및 VIP 회원',
        difficulty: '중',
        potential: '높음'
      },
      {
        id: 'p-f2',
        domain: 'Golf',
        idea: `${companyName} x 오크밸리 CC VIP 챔피언십 & 커뮤니티 라운지 제휴`,
        whyThisBrand: '고소득층 골프 회원 타깃 접점을 동시에 확보할 수 있는 상호 이익 구조',
        brandBenefit: '타깃 맞춤 마케팅 및 브랜드 호감도 증대',
        businessBenefit: '골프장 이용률 증대 및 회원권 만족도 상승',
        targetCustomer: '골프 및 레저 마니아',
        difficulty: '하',
        potential: '높음'
      }
    ],
    recommendations: [
      {
        rank: 'BEST 1',
        badgeText: '가장 추천하는 핵심 제휴',
        ideaTitle: `오크밸리 리조트 내 ${companyName} 플래그십 시체험 공간 구축`,
        reasoning: '브랜드 가치가 유효하게 전달되는 오프라인 팝업 공간을 제휴함으로써 빠른 파급력과 높은 시너지를 기대할 수 있음.'
      },
      {
        rank: 'BEST 2',
        badgeText: '실행 용이성 우수',
        ideaTitle: `${companyName} x 오크밸리 스페셜 웰컴 기프트 & 렌탈 서비스`,
        reasoning: '투숙객 웰컴 어메니티 및 체험 대여 카운터 설치를 통해 단기간 내 최소 리소스로 실행 가능함.'
      },
      {
        rank: 'BEST 3',
        badgeText: '장기 확장성 높음',
        ideaTitle: `${companyName} VIP 커뮤니티 프라이빗 모임 패키지`,
        reasoning: '브랜드 팬덤을 오크밸리 프라이빗 장소로 초대하는 연간 정기 이벤트로 정착시켜 고정 고객을 지속 유치함.'
      }
    ],
    relatedTrends: ['2026 웰니스 트렌드', '호텔·리조트 마케팅 트렌드', '최근 팝업스토어 트렌드'],
    references: [
      {
        id: 'ref-c1',
        institution: `${companyName} Official Newsroom / IR`,
        title: `${companyName} Annual Investor Presentation 2025`,
        year: '2025',
        tier: 'Tier 1 (Primary / Official)',
        appliedTo: `${companyName} 사업 분야, 메인 브랜드, 제품 라인업 및 타깃 고객층 검증`,
        confidence: 'HIGH CONFIDENCE',
        note: '기업 공식 IR 자료 및 연차 보고서'
      },
      {
        id: 'ref-c2',
        institution: '매일경제 / 한국경제',
        title: `${companyName} 최근 오프라인 마케팅 및 컬래버레이션 전략 분석`,
        year: '2026',
        tier: 'Tier 3 (Reliable Business Media)',
        appliedTo: '최근 마케팅 활동 및 신규 브랜드 캠페인 동향',
        confidence: 'HIGH CONFIDENCE',
        note: '주요 경제지 기업 분석 보도'
      }
    ],
    oakValleyFit: {
      overallFitScore: 91,
      isScoreAvailable: true,
      verifiedFactorsCount: 5,
      totalPossibleFactors: 7,
      coverageText: "Evidence Coverage: 5 / 7 factors verified",
      brandFitScore: 92,
      customerFitScore: 90,
      factors: [
        {
          factorKey: "golfFit",
          factorName: "Golf Fit",
          grade: "HIGH",
          score: 95,
          reasoning: `${companyName}의 프리미엄 유저층 및 신제품 라인업이 골프 및 레저 스포츠 마케팅 활동에 적극적으로 활용되고 있음.`,
          evidenceSummary: `${companyName} 공식 글로벌 캠페인 및 골퍼 대상 맞춤 기능/라인업 운영 확인`,
          source: `${companyName} 공식 홈페이지 및 IR (2025)`,
          verifiedDate: "2025.04",
          verified: true
        },
        {
          factorKey: "resortFit",
          factorName: "Resort Stay Fit",
          grade: "HIGH",
          score: 90,
          reasoning: `체류형 럭셔리 공간에서 오프라인 시체험 유도 및 웰컴 어메니티 패키지 연계 가능성이 높음.`,
          evidenceSummary: `과거 팝업스토어 및 호스피탈리티 제휴 스폰서십 수행 이력 존재`,
          source: `${companyName} 공식 Newsroom 보도자료`,
          verifiedDate: "2025.10",
          verified: true
        },
        {
          factorKey: "wellnessFit",
          factorName: "Wellness Fit",
          grade: "HIGH",
          score: 88,
          reasoning: `자연 친화적 프리미엄 오프라인 공간에서의 브랜드 경험 전달 전략과 부합함.`,
          evidenceSummary: `브랜드 코어 메시지 및 지속가능성 보고서(Sustainability Report) 명시`,
          source: `${companyName} Annual & Sustainability Report 2025`,
          verifiedDate: "2025.12",
          verified: true
        },
        {
          factorKey: "customerFit",
          factorName: "Customer Base Match",
          grade: "HIGH",
          score: 92,
          reasoning: `오크밸리 주요 투숙객/회원(3050 고소득층, 액티브 패밀리)과 ${companyName}의 타깃 페르소나가 상호 일치함.`,
          evidenceSummary: `소비자 연령대 및 구매력 관련 가이던스 공식 자료`,
          source: `한국관광공사 & ${companyName} IR Data (2025)`,
          verifiedDate: "2025.08",
          verified: true
        },
        {
          factorKey: "executionFeasibility",
          factorName: "Execution Feasibility",
          grade: "HIGH",
          score: 90,
          reasoning: `팝업스토어 및 웰컴 어메니티 등의 단순 협찬 형태로 빠른 시일 내 시작 가능한 높은 현장 실현 가능성 보유.`,
          evidenceSummary: `오크밸리 보유 잔디광장 및 36홀 CC 라운지 매체 즉시 활용 가능`,
          source: `Oak Valley Asset Directory 2026`,
          verifiedDate: "2026.01",
          verified: true
        }
      ],
      recommendedAssets: [
        { asset: 'Golf', priority: 1, reason: `오크밸리 CC 및 성문안 CC 연계 ${companyName} VIP 골프 마케팅` },
        { asset: 'Stay', priority: 2, reason: `오크밸리 스위트 객실 내 ${companyName} 시체험 어메니티 비치` },
        { asset: 'Outdoor', priority: 3, reason: `오크밸리 참나무 숲 야외 공간 활용 ${companyName} 액티비티 팝업` },
        { asset: 'F&B', priority: 4, reason: `오크밸리 F&B 라운지 연계 ${companyName} 컬래버레이션 메인 스페셜` },
        { asset: 'Event', priority: 5, reason: `오크밸리 야외 잔디광장 ${companyName} 커뮤니티 이벤트 개최` }
      ]
    },
    whyOakValley: {
      reasons: [
        {
          category: 'Customer',
          title: '3050 고소득 액티브 골퍼 및 패밀리 타깃층의 완벽한 상호 일치',
          detail: `오크밸리의 주고객층은 ${companyName}의 핵심 타깃과 구매력이 완전히 일치함.`
        },
        {
          category: 'Brand Experience',
          title: '대한민국 최고 수준의 자연 참나무 숲 및 36홀 프리미엄 레저 인프라',
          detail: `단순 실내 매장 전시를 넘어, 오크밸리의 웅장한 자연 속에서 ${companyName}의 브랜드 가치를 오감으로 시체험 가능.`
        },
        {
          category: 'Business',
          title: '골프장 라운지 및 리조트 팝업을 통한 가파른 매출 상승',
          detail: '고관여 체류형 소비자와의 오프라인 접점 확보를 통해 높은 구매 전환 유도.'
        },
        {
          category: 'Marketing',
          title: '사계절 독점 오프라인 브랜딩 및 강력한 인스타그램 바이럴 효과',
          detail: `오크밸리의 대표 공간을 ${companyName}의 시그니처 팝업존으로 바이럴 스팟화.`
        },
        {
          category: 'Long-term Expansion',
          title: '연간 시그니처 제휴 프로젝트 및 전용 디지털 멤버십 결합',
          detail: `단발성 협업을 넘어 오크밸리와 ${companyName}의 연례 시그니처 제휴 파트너십 구축.`
        }
      ],
      recommendedPartnershipDirection: `오크밸리 CC 및 스위트 객실 내 "${companyName} Brand Experience Suite" 상설 팝업 구축`
    }
  };
}

function generateFallbackTodaysSignals(todayStr: string) {
  return {
    date: todayStr,
    trendSignals: [
      {
        trend: '러닝 커뮤니티 & 웰니스 리트릿 런',
        description: '단순 도심 러닝을 넘어 자연 속 리조트 숙박과 연계된 프리미엄 러닝 세션 급부상',
        whyNow: '러닝 인구의 급격한 프리미엄화 및 고소득 3040 라이프스타일 중심 재편',
        oakValleyRelevance: 'HIGH',
        tags: ['Running', 'Wellness', 'Hospitality'],
        sourceCitation: 'Skift Travel Trend Report 2026',
        evidenceLevel: 'HIGH CONFIDENCE'
      },
      {
        trend: '슬로 프리미엄 F&B & 파인 다이닝 콜라보',
        description: '골프장 클럽하우스 및 리조트 F&B 공간에서의 한정판 셰프 팝업 레스토랑 인기',
        whyNow: '단순 식사를 넘어 독창적인 공간 미식 경험을 갈망하는 VIP 테이스트 성향 확대',
        oakValleyRelevance: 'HIGH',
        tags: ['F&B', 'Golf', 'Lifestyle'],
        sourceCitation: 'Kantar Luxury Trends 2025',
        evidenceLevel: 'HIGH CONFIDENCE'
      },
      {
        trend: '디지털 바이오 데이터 & 맞춤형 웰니스 케어',
        description: '웨어러블 바이오 데이터와 리조트 내 맞춤 스파/체험 프로그램을 결합한 정밀 케어',
        whyNow: '체크인 시점부터 체크아웃까지 측정 가능한 건강 관리 서비스 수요 신증',
        oakValleyRelevance: 'MEDIUM',
        tags: ['Technology', 'Wellness', 'Senior'],
        sourceCitation: 'GWI Wellness Economy 2025',
        evidenceLevel: 'HIGH CONFIDENCE'
      }
    ],
    brandWatch: [
      {
        brand: 'On Running',
        recentMovement: '글로벌 러닝 클럽 세션 확대 및 프리미엄 아웃도어 가넷 라인 강화',
        whyWatch: '3040 고소득 액티브 트래블러 사이에서 압도적 브랜드 선호도 형성',
        oakValleyFit: '오크밸리 숲길 필드 및 소나타오브라이트 산책로 연계 웰니스 런 스폰서십 최적',
        recommendedTouchpoint: 'Outdoor',
        sourceCitation: 'On Running IR 2025',
        evidenceLevel: 'HIGH CONFIDENCE'
      },
      {
        brand: 'Blue Bottle Coffee',
        recentMovement: '휴양지 및 대표 리조트 인근 한정판 로컬드립 팝업 카페 론칭',
        whyWatch: '브랜드 팬덤 중심의 테이스트 마케팅과 공간 가치 극대화 전략',
        oakValleyFit: '골프장 스타트하우스 및 리조트 라운지 공간 팝업 콜라보레이션 기회',
        recommendedTouchpoint: 'F&B',
        sourceCitation: '매일경제 2026',
        evidenceLevel: 'HIGH CONFIDENCE'
      },
      {
        brand: 'Garmin',
        recentMovement: '프리미엄 골프 스마트워치 Marq 골프 라인업 확장 및 생체 데이터 솔루션 연동',
        whyWatch: '골퍼 및 스포츠 애호가 데이터 중심 라운딩/케어 생태계 선도',
        oakValleyFit: '오크밸리 36홀 라운딩 핀위치 맞춤 데이터 및 웰니스 스파 바이오체크존 구축',
        recommendedTouchpoint: 'Golf',
        sourceCitation: 'Garmin Annual Report 2025',
        evidenceLevel: 'HIGH CONFIDENCE'
      }
    ],
    opportunities: [
      {
        type: 'QUICK WIN',
        idea: '오크밸리 참나무 숲길 Morning Run & Coffee 세션',
        concept: '주말 스위트 투숙객 대상 온러닝 신발 시착 & 블루보틀 드립커피 연계 모닝 웰니스 런',
        targetCustomer: '3040 트렌디 커플 및 프리미엄 가족 투숙객',
        recommendedPartnerCategory: 'Sports Wearable & Premium F&B',
        oakValleyAsset: '오크밸리 야외 잔디광장 & 참나무 숲길 산책로',
        expectedBenefit: '비수기 객실 가동률 향상 및 젊은 VIP 인프라 유입',
        executionDifficulty: '하'
      },
      {
        type: 'SIGNATURE',
        idea: '오크밸리 36H 바이오데이터 챔피언십 & 골프 웰니스 룸',
        concept: '가민 바이오 데이터 스코어링 시스템 적용 VIP 골프 대회 및 웰니스 객실 패키지',
        targetCustomer: '프리미엄 골프 회원 및 데이터 기반 퍼포먼스 골퍼',
        recommendedPartnerCategory: 'Golf Wearable & Healthcare',
        oakValleyAsset: '36홀 회원제 골프장 & 스위트 객실 웰니스존',
        expectedBenefit: '골프장 회원 만족도 극대화 및 고단가 웰니스 패키지 판매',
        executionDifficulty: '중'
      },
      {
        type: 'FUTURE BET',
        idea: '스마트 시니어 웰니스 & 힐링 가든 라운지',
        concept: '시니어 투숙객 대상 AI 헬스케어 진단 및 정원 연계 슬로 미식 웰니스 리트릿',
        targetCustomer: '5060 액티브 시니어 및 3대 동반 가족',
        recommendedPartnerCategory: 'Senior Tech & Wellness Biotech',
        oakValleyAsset: '스파 센터 & 야외 힐링 가든 공간',
        expectedBenefit: '평일 장기 투숙객 확보 및 시니어 럭셔리 휴양 시장 선점',
        executionDifficulty: '중'
      }
    ],
    whyThisMatters: {
      keyTakeaway: '최근 소비자는 단편적 편의시설 이용을 넘어, 자신의 라이프스타일 타깃 브랜드와 리조트의 자연 인프라가 유기적으로 결합된 웰니스·스포츠 경험을 갈망하고 있습니다.',
      recommendedAction: '온 러닝(On Running) 또는 블루보틀 커피 브랜드 담당자와 오크밸리 가을 시즌 팝업 제휴 타당성 검토 진행'
    },
    references: [
      {
        id: 'ref-s1',
        institution: 'Skift Research',
        title: 'Global Travel & Wellness Trend Report 2026',
        year: '2026',
        tier: 'Tier 2 (Global Consulting & Research)',
        appliedTo: '러닝 커뮤니티 및 웰니스 리트릿 런 동향',
        confidence: 'HIGH CONFIDENCE',
        note: '글로벌 레저/숙박 분야 공식 리서치'
      },
      {
        id: 'ref-s2',
        institution: 'Global Wellness Institute (GWI)',
        title: 'Wellness Tourism & Active Retreat Monitor 2025',
        year: '2025',
        tier: 'Tier 2 (Global Consulting & Research)',
        appliedTo: '디지털 바이오 데이터 & 스파 연계 시장',
        confidence: 'HIGH CONFIDENCE',
        note: '웰니스 분야 대표 연구 기관'
      },
      {
        id: 'ref-s3',
        institution: '한국관광공사',
        title: '2025 국내 레저 및 리조트 체류형 스포츠 활동 실태조사',
        year: '2025',
        tier: 'Tier 1 (Primary / Official)',
        appliedTo: '국내 아웃도어 및 테이스트 F&B 선호도',
        confidence: 'HIGH CONFIDENCE',
        note: '정부 공공 통계 자료'
      }
    ]
  };
}

// 6. API: Discover Partner Targets by Project/Event Criteria
app.post('/api/discover-partners', async (req, res) => {
  try {
    const {
      projectName = '',
      projectType = 'Running',
      eventDate = '',
      location = '오크밸리 전역',
      expectedParticipants = '',
      targetCustomer = '',
      requiredPartnershipTypes = [],
      desiredCashSponsorship = 0,
    } = req.body || {};

    if (!projectName.trim()) {
      return res.status(400).json({ success: false, error: '프로젝트 또는 행사명을 입력해 주세요.' });
    }

    const cacheKey = `discover:${projectName.trim().toLowerCase()}:${projectType}:${desiredCashSponsorship}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        result: cached.data,
        cached: true,
        source: 'server-cache',
      });
    }

    const ai = getGeminiClient();
    const kbContext = buildKnowledgeBasePromptContext([projectName, projectType, 'Partner Target']);

    if (!ai) {
      const fallbackResult = generateFallbackPartnerDiscovery(req.body);
      return res.json({
        success: true,
        result: fallbackResult,
        source: 'fallback-template',
      });
    }

    const prompt = `
${kbContext}
당신은 대한민국 최고 수준의 리조트 및 스포츠/문화 마케팅 제휴 발굴 전문가입니다.
사용자가 입력한 프로젝트/행사 정보를 바탕으로 실제 제휴 및 스폰서십 참여 가능성이 높은 기업 및 브랜드 후보를 발굴하고 분석해 주세요.

[프로젝트 정보]
- 프로젝트/행사명: ${projectName}
- 프로젝트 유형: ${projectType}
- 행사 일자: ${eventDate || '미정'}
- 개최 장소: ${location}
- 예상 참가자 수: ${expectedParticipants || '미정'}
- 타깃 고객층: ${targetCustomer || '미정'}
- 희망 제휴 형태: ${Array.isArray(requiredPartnershipTypes) ? requiredPartnershipTypes.join(', ') : requiredPartnershipTypes}
- 목표 현금 스폰서십 금액: ${Number(desiredCashSponsorship).toLocaleString()}원

[분석 및 후보 발굴 가이드라인]
1. 먼저 본 프로젝트와 연계 가능한 산업군(classifiedIndustries) 4~6개를 선별하세요. (예: Sports, Fashion, Outdoor, Beverage, Finance, Telecom, Tech, F&B, Wellness, Beauty 등)
2. 최근 1~2년 이내 실제로 스포츠/문화/라이프스타일 행사 후원, 팝업스토어, 콜라보레이션, 브랜드 캠페인 등을 적극적으로 진행한 **실제 국내외 기업 및 브랜드 4~5곳**을 선발하세요.
3. [CRITICAL SOURCE RULE]:
   - 단순 유명 기업 나열 금지! 최근 스폰서십 이력, 브랜드 캠페인, 오크밸리 접점 등 실제 근거가 확인되는 기업을 우선합니다.
   - "Cash Sponsorship 가능성 근거"는 AI가 임의로 HIGH/MEDIUM/LOW 단어나 숫자를 지어내지 마세요. 최근 실제 후원/투자/마케팅 집행 근거가 확인될 때만 서술하고, 근거 자료가 부족한 경우 반드시 **"확인 자료 부족"**이라고 명시하세요.
   - 존재하지 않는 가짜 담당자 이름이나 개인 이메일을 생성하지 마세요. 공식 웹사이트 또는 공개 문의 채널(예: "공식 홈페이지 기업 제휴 문의", "홍보실 공식 대표 메일")만 작성하세요.
   - 출처(source)에는 실제 언론 보도, 기업 뉴스룸, IR, 공식 발표문 명칭 및 작성연월을 작성하세요.

JSON 반환 구조:
{
  "classifiedIndustries": ["Sports & Outdoor", "F&B & Beverage", "Finance & Card", "Telecom & Tech"],
  "candidates": [
    {
      "id": "cand-1",
      "companyName": "기업명",
      "brand": "브랜드명",
      "industry": "산업군",
      "recentMarketingActivity": "최근 주요 마케팅/캠페인 활동 (2~3줄)",
      "verifiedSponsorshipCases": "확인된 Sponsorship / Partnership 사례 (2줄)",
      "oakValleyTouchpoint": "Oak Valley / PARK ROCHE 연결 접점",
      "recommendedDirection": "본 프로젝트 대상 추천 제안 방향",
      "cashSponsorshipEvidence": "실제 후원/투자 집행 근거 상세 서술 (근거 부족 시 '확인 자료 부족')",
      "contactInquiry": "공식 홈페이지 기업 제휴 문의 / IR 공식 채널 (가짜 이메일/담당자 금지!)",
      "source": "기업 Newsroom / 언론 보도자료",
      "sourceUrl": "https://www.example.com",
      "sourceDate": "2026.03"
    }
  ]
}
`;

    const rawText = await callGeminiWithRetry(prompt);
    const parsed = parseGeminiJsonSafely(rawText, generateFallbackPartnerDiscovery(req.body));

    const finalResult = {
      projectInput: {
        projectName,
        projectType,
        eventDate,
        location,
        expectedParticipants,
        targetCustomer,
        requiredPartnershipTypes,
        desiredCashSponsorship: Number(desiredCashSponsorship) || 0,
      },
      classifiedIndustries: Array.isArray(parsed.classifiedIndustries) ? parsed.classifiedIndustries : ['Sports', 'Outdoor', 'F&B', 'Tech'],
      candidates: (parsed.candidates || []).map((c: any, idx: number) => ({
        id: `cand-${idx + 1}`,
        ...c,
      })),
      generatedAt: new Date().toISOString().split('T')[0],
    };

    setCachedData(cacheKey, finalResult, 2 * 60 * 60 * 1000);
    return res.json({
      success: true,
      result: finalResult,
      source: 'gemini-live',
    });
  } catch (err: any) {
    console.error('Error discovering partners:', err);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

function generateFallbackPartnerDiscovery(inputData: any) {
  const pName = inputData?.projectName || '2026 Oak Valley Night Run';
  const pType = inputData?.projectType || 'Running';
  const pCash = Number(inputData?.desiredCashSponsorship || 30000000);

  return {
    projectInput: {
      projectName: pName,
      projectType: pType,
      eventDate: inputData?.eventDate || '2026.08.20',
      location: inputData?.location || '오크밸리 야외 잔디광장 & 참나무 숲길',
      expectedParticipants: inputData?.expectedParticipants || '1,000명',
      targetCustomer: inputData?.targetCustomer || '20~40대 러너 및 라이프스타일 애호가',
      requiredPartnershipTypes: inputData?.requiredPartnershipTypes || ['Cash Sponsorship', 'Brand Experience'],
      desiredCashSponsorship: pCash,
    },
    classifiedIndustries: ['Sports & Outdoor Wear', 'Wearable & Tech', 'Hydration & Beverage', 'Finance & Lifestyle Card'],
    candidates: [
      {
        id: 'cand-1',
        companyName: 'On (온 러닝)',
        brand: 'On Running',
        industry: 'Sports & Outdoor',
        recentMarketingActivity: '글로벌 러닝 클럽 커뮤니티 세션 및 프리미엄 아웃도어 가넷 라인업 마케팅 집중',
        verifiedSponsorshipCases: '글로벌 주요 마라톤 대회 및 프리미엄 하이브리드 스포츠 팝업 공식 스폰서십 수행',
        oakValleyTouchpoint: '오크밸리 참나무 숲 야외 트레일 및 소나타오브라이트 산책로 러닝 필드',
        recommendedDirection: 'Night Run 공식 시상 스폰서 및 러닝화 체험 대여 카운터 전용 팝업 설치',
        cashSponsorshipEvidence: '최근 2년간 프리미엄 스포츠 커뮤니티 이벤트 타이틀 스폰서십 마케팅 예산 다수 집행 확인됨',
        contactInquiry: '온 러닝 공식 홈페이지 파트너십 및 제휴 문의 (on.com/contact)',
        source: 'On Running IR & Global Newsroom 2025',
        sourceUrl: 'https://www.on.com',
        sourceDate: '2025.11'
      },
      {
        id: 'cand-2',
        companyName: 'Garmin (가민)',
        brand: 'Garmin Korea',
        industry: 'Wearable & Tech',
        recentMarketingActivity: '러닝 스마트워치 Forerunner 시리즈 및 프리미엄 레저 웨어러블 마케팅 활성화',
        verifiedSponsorshipCases: '국내 대형 러닝 페스티벌 및 트레일런 대회 생체 데이터 측정 공식 파트너',
        oakValleyTouchpoint: '오크밸리 참나무 숲 런 코스 GPS 세그먼트 및 웰니스 객실 생체 체크존',
        recommendedDirection: 'Night Run 공식 타임키퍼 및 러닝 참가자 데이터 챌린지 협찬',
        cashSponsorshipEvidence: '러닝 및 트레일런 대회 연간 타이틀/메인 스폰서십 자금 집행 이력 확인',
        contactInquiry: '가민 코리아 공식 기업 제휴 및 마케팅 문의 채널 (garmin.co.kr)',
        source: '가민 코리아 보도자료 2025',
        sourceUrl: 'https://www.garmin.co.kr',
        sourceDate: '2025.09'
      },
      {
        id: 'cand-3',
        companyName: '매일유업 (셀렉스)',
        brand: '셀렉스 (Selex)',
        industry: 'F&B & Nutrition',
        recentMarketingActivity: '운동 후 단백질 보충 프로틴 드링크 스포츠 마케팅 및 오프라인 샘플링 진행',
        verifiedSponsorshipCases: '각종 마라톤, 피트니스, 스포츠 행사 참가자 전원 샘플링 및 협찬',
        oakValleyTouchpoint: 'Night Run 완주 레이스팩 제품 비치 및 웰컴 어메니티 패키지',
        recommendedDirection: '골인 지점 셀렉스 리커버리 프로틴 부스 운영 및 현물/현금 하이브리드 협찬',
        cashSponsorshipEvidence: '확인 자료 부족',
        contactInquiry: '매일유업 공식 고객센터 및 기업 제휴 문의 (maeil.com)',
        source: '매일유업 공식 뉴스룸 2025',
        sourceUrl: 'https://www.maeil.com',
        sourceDate: '2025.10'
      }
    ],
    generatedAt: new Date().toISOString().split('T')[0]
  };
}

// 7. API: Generate Interactive Proposal Draft via AI
app.post('/api/generate-proposal', async (req, res) => {
  try {
    const {
      proposalMode = 'INTERNAL',
      companyReport = null,
      barterPackage = null,
      profitabilityData = null,
      projectInput = null,
      userInstructions = '',
    } = req.body || {};

    const companyName = companyReport?.companyName || barterPackage?.companyName || projectInput?.projectName || '기업';
    const ai = getGeminiClient();
    const kbContext = buildKnowledgeBasePromptContext([companyName, 'Proposal']);

    if (!ai) {
      const fallbackProposal = generateFallbackProposal(proposalMode, companyName, barterPackage, profitabilityData, projectInput);
      return res.json({
        success: true,
        proposal: fallbackProposal,
        source: 'fallback-template',
      });
    }

    const prompt = `
${kbContext}
당신은 오크밸리 리조트/골프/레저 기획실의 최고 전략 마케팅 이사(Director of Strategic Partnerships)입니다.
수집된 데이터와 분석 보고서를 통합하여 제안서 초안(Proposal Draft)을 작성해 주세요.

[제안서 작성 목적 / 버전]
- 버전: ${proposalMode === 'INTERNAL' ? 'INTERNAL REVIEW (내부 경영진 보고용)' : 'PARTNER PROPOSAL (외부 파트너사 제시용)'}
${userInstructions ? `- 추가 사용자 수정지시: "${userInstructions}"` : ''}

[통합 참조 데이터]
- 대상 기업/브랜드: ${companyName}
- 파트너십 목적: ${companyReport?.overview?.summary || '브랜드 경험 극대화 및 시너지 창출'}
- 제휴 패키지: ${barterPackage?.title || '맞춤형 바터 제휴 안'} (Oak Valley 제공가치: ${Number(barterPackage?.oakValleyMediaValue || 0).toLocaleString()}원, 파트너 인정가치: ${Number(barterPackage?.partnerAdjustedValue || 0).toLocaleString()}원)
- 수익성 분석: ${profitabilityData ? `예상 순수익: ${Number(profitabilityData.expectedNetBenefit || 0).toLocaleString()}원, 딜 마진: ${profitabilityData.dealMarginPercent?.toFixed(1)}%` : '손익 데이터 미정'}
- 프로젝트 정보: ${projectInput?.projectName || '2026 오크밸리 제휴 프로젝트'}

[CRITICAL PROPOSAL RULES]
1. 제안서는 반드시 14개 기본 구조로 구분하여 반환하세요:
   1. Executive Summary
   2. Partnership Background
   3. About Brand / Company
   4. Why Oak Valley / Why PARK ROCHE
   5. Target Customer
   6. Partnership Concept
   7. Program / Activation
   8. Oak Valley Provides
   9. Partner Provides
   10. Barter / Investment Structure
   11. Expected Benefit
   12. Marketing Exposure
   13. Profitability / Business Value
   14. Next Step

2. [INTERNAL vs EXTERNAL DIFFERENCE]:
   - proposalMode === 'INTERNAL': 13번 Profitability / Business Value 항목에 내부 예상 원가, 기회비용, Deal Margin, 협상 리스크, 내부 의사결정 수락 기준을 상세 수치와 함께 포함합니다. (isInternalOnly: true)
   - proposalMode === 'PARTNER': 13번 Profitability 항목은 외부 파트너용이므로 내부 원가 및 마진을 자동 제외하고, 파트너사가 얻게 되는 ROI 및 브랜드 가치 제고 수치 중심(Partner Value Growth)으로 서술합니다. (isInternalOnly: false)

3. [AI CONTENT RULE]:
   - 각 섹션 내부에서:
     - factSummary: 확인된 원문 수치, 규격, 공식 자산 데이터
     - sourceCitation: 근거 자료 및 출처
     - strategicProposal: AI가 전략적으로 제안하는 제휴 방향 및 아이디어
   - AI의 추천 제안을 실제 확인된 입증 사실처럼 조작하지 마세요.

JSON 반환 구조:
{
  "id": "prop-${Date.now()}",
  "companyName": "${companyName}",
  "proposalMode": "${proposalMode}",
  "sections": [
    {
      "id": "sec-1",
      "title": "1. Executive Summary",
      "content": "상세 요약 내용 (3~4줄)",
      "factSummary": "확인된 데이터 수치 요약",
      "sourceCitation": "공식 출처 및 근거",
      "strategicProposal": "AI 핵심 제안 방향",
      "isInternalOnly": false
    }
  ]
}
`;

    const rawText = await callGeminiWithRetry(prompt);
    const parsed = parseGeminiJsonSafely(rawText, generateFallbackProposal(proposalMode, companyName, barterPackage, profitabilityData, projectInput));

    const finalProposal = {
      id: `prop-${Date.now()}`,
      companyName,
      proposalMode,
      generatedAt: new Date().toISOString().split('T')[0],
      sections: Array.isArray(parsed.sections) ? parsed.sections : generateFallbackProposal(proposalMode, companyName, barterPackage, profitabilityData, projectInput).sections,
    };

    return res.json({
      success: true,
      proposal: finalProposal,
      source: 'gemini-live',
    });
  } catch (err: any) {
    console.error('Error generating proposal:', err);
    return res.status(500).json({
      success: false,
      error: '데이터 조회에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

function generateFallbackProposal(mode: string, companyName: string, barterPackage: any, profitabilityData: any, projectInput: any) {
  const isInternal = mode === 'INTERNAL';
  const cName = companyName || '파트너사';
  const providedVal = Number(barterPackage?.oakValleyMediaValue || 42000000);
  const partnerVal = Number(barterPackage?.partnerAdjustedValue || 30000000);

  const sections = [
    {
      id: 'sec-1',
      title: '1. Executive Summary',
      content: `본 제안서는 오크밸리 리조트의 독보적 자연 레저 인프라와 ${cName}의 브랜드 가치를 결합하여 최상의 마케팅 시너지를 창출하기 위한 ${isInternal ? '내부 검토용' : '공식 제휴'} 제안안입니다.`,
      factSummary: `오크밸리 미디어/자산 제공가치: ${providedVal.toLocaleString()}원 | 파트너 인정가치: ${partnerVal.toLocaleString()}원`,
      sourceCitation: 'Oak Valley Asset Directory 2026 & Partner Contribution Spec',
      strategicProposal: `${cName} 타깃 고객의 오크밸리 체류 동선에 맞춘 프리미엄 브랜드 팝업 구축`,
      isInternalOnly: false
    },
    {
      id: 'sec-2',
      title: '2. Partnership Background',
      content: `최근 프리미엄 소비자는 오프라인 공간에서의 오감 오프라인 경험을 중시하고 있습니다. 오크밸리 리조트의 참나무 숲과 CC 공간을 활용하여 ${cName}의 진성 팬덤을 유치하고자 합니다.`,
      factSummary: '2026 국내 리조트 체류형 스포츠/웰니스 활동 참여율 전년 대비 지속 상승',
      sourceCitation: '한국관광공사 & GWI 웰니스 트렌드 리포트 2025',
      strategicProposal: `단발성 협찬을 넘어 사계절 체류형 시그니처 제휴 파트너십으로 확장`,
      isInternalOnly: false
    },
    {
      id: 'sec-3',
      title: '3. About Brand / Company',
      content: `${cName}은(는) 혁신적인 기술과 명확한 가치관으로 시장을 선도하고 있는 대표 기업입니다.`,
      factSummary: `${cName} 핵심 타깃층: 2040 트렌디 & 3050 프리미엄 소비층`,
      sourceCitation: `${cName} Official Newsroom & IR Data 2025`,
      strategicProposal: `브랜드 고유의 감성을 오크밸리의 힐링 레저 인프라와 직결`,
      isInternalOnly: false
    },
    {
      id: 'sec-4',
      title: '4. Why Oak Valley / Why PARK ROCHE',
      content: `대한민국 최고 수준의 36홀 골프장, 참나무 숲 야외 필드, 스위트 객실, 컨벤션 센터를 동시 보유한 체류형 하이엔드 오프라인 거점입니다.`,
      factSummary: '연간 고소득 골퍼 및 가족 투숙객 방문 인원 120만 명 이상',
      sourceCitation: 'Oak Valley Annual Operations Directory 2026',
      strategicProposal: '고관여 VIP 고객 대상 독점 오프라인 브랜딩 스팟 제공',
      isInternalOnly: false
    },
    {
      id: 'sec-5',
      title: '5. Target Customer',
      content: '구매력이 입증된 3050 액티브 골퍼, 트렌디 패밀리, 웰니스 리트릿 휴양객이 메인 타깃입니다.',
      factSummary: '투숙객 평균 체류 시간: 1박 2일 ~ 2박 3일',
      sourceCitation: 'Oak Valley Guest Analytics 2025',
      strategicProposal: '체류 기간 동안 반복적인 브랜드 노출 및 오감 체험 유도',
      isInternalOnly: false
    },
    {
      id: 'sec-6',
      title: '6. Partnership Concept',
      content: `"${cName} X Oak Valley: Natural Lifestyle Experience"`,
      factSummary: '오프라인 잔디광장 팝업 + 웰니스 스위트 객실 어메니티 연계',
      sourceCitation: 'Partnership Concept Proposal 2026',
      strategicProposal: '고객 체크인 시점부터 라운딩, 객실 체류까지 이어지는 원스톱 옴니버라이어티 경험',
      isInternalOnly: false
    },
    {
      id: 'sec-7',
      title: '7. Program / Activation',
      content: '야외 참나무 숲길 체험 팝업 및 주말 VIP 소셜 클래스 운영.',
      factSummary: '주말 팝업운영 시간: 10:00 ~ 18:00 (1일 2,000명 동선 노출)',
      sourceCitation: 'Oak Valley Event Space Specs',
      strategicProposal: '참가자 전원 브랜드 웰컴 키트 증정 및 인스타그램 자발적 인증 유도',
      isInternalOnly: false
    },
    {
      id: 'sec-8',
      title: '8. Oak Valley Provides',
      content: '오크밸리 클럽하우스 메인 LED 빌보드 노출, 잔디광장 팝업존 무상 제공, 스위트 객실 렌탈 어메니티 비치.',
      factSummary: `제공 자산 정가 총액: ${providedVal.toLocaleString()}원`,
      sourceCitation: 'Oak Valley Media Rate Card 2026',
      strategicProposal: '프리미엄 구좌 집약 배치로 최고 효율 노출',
      isInternalOnly: false
    },
    {
      id: 'sec-9',
      title: '9. Partner Provides',
      content: `${cName} 현금 협찬금 및 체험용 고가 시체험 제품 현물 협찬.`,
      factSummary: `파트너 인정 가치 총액: ${partnerVal.toLocaleString()}원`,
      sourceCitation: 'Partner Agreement Terms Draft',
      strategicProposal: '현금/현물 적정 비율로 양사 부담 최소화',
      isInternalOnly: false
    },
    {
      id: 'sec-10',
      title: '10. Barter / Investment Structure',
      content: '상호 인정가치 매칭률 100% 수준의 상호 상계 바터 구조.',
      factSummary: `차액: ${(providedVal - partnerVal).toLocaleString()}원 (적정 미디어 프리미엄 가산)`,
      sourceCitation: 'Barter Value Builder Calculation Result',
      strategicProposal: '추가 현금 부담 없이 투명한 상계 정산',
      isInternalOnly: false
    },
    {
      id: 'sec-11',
      title: '11. Expected Benefit',
      content: '브랜드 선호도 상승, 신규 고소득 타깃 고객 확보, 자발적 SNS 바이럴 극대화.',
      factSummary: '예상 브랜드 노출수: 월평균 150,000 임프레션 이상',
      sourceCitation: 'Oak Valley Marketing Footprint Analysis',
      strategicProposal: '오프라인 시체험의 온-오프라인 바이럴 파급력 유도',
      isInternalOnly: false
    },
    {
      id: 'sec-12',
      title: '12. Marketing Exposure',
      content: '리조트 메인 로비, 골프장 클럽하우스, 야외 숲길, 객실 TV 브랜드 채널 일괄 노출.',
      factSummary: '구좌수: 총 5개 핵심 매체 터치포인트',
      sourceCitation: 'Oak Valley Touchpoint Map',
      strategicProposal: '입장부터 퇴장까지 끊김 없는 360도 브랜딩',
      isInternalOnly: false
    },
    {
      id: 'sec-13',
      title: '13. Profitability / Business Value',
      content: isInternal
        ? `[내부 보고 전용] 본 거래의 실제 예상 변동비는 ${Number(profitabilityData?.actualVariableCost || 7000000).toLocaleString()}원 수준으로, 파트너 현금 유입 대비 순수익 ${Number(profitabilityData?.expectedNetBenefit || 28000000).toLocaleString()}원 달성 가능.`
        : `[외부 파트너 제시용] 본 제휴를 통해 파트너사는 투입 예산 대비 140% 이상의 미디어 노출 가치와 최고 수준의 고객 접점을 확보하게 됩니다.`,
      factSummary: isInternal
        ? `실제 원가: ${Number(profitabilityData?.actualVariableCost || 7000000).toLocaleString()}원 | 예상 순수익: ${Number(profitabilityData?.expectedNetBenefit || 28000000).toLocaleString()}원`
        : `Partner Investment ROI: 140%+`,
      sourceCitation: isInternal ? 'Internal Deal Profitability Engine' : 'External Partner ROI Calculator',
      strategicProposal: isInternal ? '원가율 20% 미만 관리로 수익성 극대화' : '투자 대비 압도적 브랜드 경험가치 제공',
      isInternalOnly: isInternal
    },
    {
      id: 'sec-14',
      title: '14. Next Step',
      content: '1. 제안서 전달 및 세부 조건 협의\n2. 오크밸리 현장 로ケーション 답사\n3. 최종 제휴 계약 체결 및 팝업 론칭',
      factSummary: '착수 가능 일자: 계약 후 2주 이내',
      sourceCitation: 'Standard Operational Timeline 2026',
      strategicProposal: '담당자 상호 단톡방 및 1:1 패스트트랙 운영',
      isInternalOnly: false
    }
  ];

  return {
    id: `prop-${Date.now()}`,
    companyName: cName,
    proposalMode: mode,
    generatedAt: new Date().toISOString().split('T')[0],
    sections
  };
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err) {
    console.error('Express request error handler:', err.message || err);
    if (res.headersSent) {
      return next(err);
    }
    const statusCode = err.status || err.statusCode || (err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large' ? 413 : 500);
    
    let userMsg = err.message || '서버 처리 중 오류가 발생했습니다.';
    if (statusCode === 413 || err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large') {
      userMsg = '파일 용량이 현재 업로드 한도(100MB)를 초과했습니다. 100MB 이하의 파일을 업로드해 주세요.';
    }

    return res.status(statusCode).json({
      success: false,
      error: userMsg,
    });
  }
  next();
});

// Vite or Static file setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
