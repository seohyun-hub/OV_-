import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { parseGeminiJsonSafely } from './verifiedSearch';
import {
  InfluencerItem,
  InfluencerPlatform,
  InfluencerCategory,
  InfluencerRecommendationResult,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const INFLUENCERS_FILE = path.join(DATA_DIR, 'influencers.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial saved list starts EMPTY as per requirement 5: "Demo/Fake 인플루언서를 기본 리스트에 넣지 않습니다."
const DEFAULT_INFLUENCERS: InfluencerItem[] = [];

export function loadInfluencers(): InfluencerItem[] {
  ensureDataDir();
  if (!fs.existsSync(INFLUENCERS_FILE)) {
    fs.writeFileSync(INFLUENCERS_FILE, JSON.stringify(DEFAULT_INFLUENCERS, null, 2), 'utf-8');
    return DEFAULT_INFLUENCERS;
  }
  try {
    const raw = fs.readFileSync(INFLUENCERS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.error('Error reading influencers.json, falling back to empty list:', err);
  }
  return DEFAULT_INFLUENCERS;
}

export function saveInfluencers(items: InfluencerItem[]) {
  ensureDataDir();
  fs.writeFileSync(INFLUENCERS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export function addInfluencer(
  input: Omit<InfluencerItem, 'id' | 'createdAt' | 'updatedAt'>
): InfluencerItem {
  const items = loadInfluencers();
  const today = new Date().toISOString().substring(0, 10);
  const newItem: InfluencerItem = {
    ...input,
    id: `inf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: today,
    updatedAt: today,
  };
  items.unshift(newItem);
  saveInfluencers(items);
  return newItem;
}

export function updateInfluencer(
  id: string,
  input: Partial<InfluencerItem>
): InfluencerItem | null {
  const items = loadInfluencers();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const today = new Date().toISOString().substring(0, 10);
  const updatedItem: InfluencerItem = {
    ...items[index],
    ...input,
    updatedAt: today,
  };
  items[index] = updatedItem;
  saveInfluencers(items);
  return updatedItem;
}

export function deleteInfluencer(id: string): boolean {
  const items = loadInfluencers();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  saveInfluencers(filtered);
  return true;
}

/**
 * Recommend real, publicly verified influencers using Gemini API with Google Search Grounding.
 */
export async function searchRecommendedInfluencers(params: {
  platform?: string;
  category?: string;
  region?: string; // '국내' | '해외' | '전체'
  keyword?: string;
}): Promise<{ success: boolean; results?: InfluencerRecommendationResult[]; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: '실시간 인플루언서 검색 연결이 필요합니다. (API 키 미설정)',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { platform = '전체', category = '전체', region = '국내', keyword = '' } = params;

    const queryParts = [];
    if (region && region !== '전체') queryParts.push(`${region}`);
    if (platform && platform !== '전체') queryParts.push(`${platform}`);
    if (category && category !== '전체') queryParts.push(`${category}`);
    if (keyword) queryParts.push(`${keyword}`);

    const searchQuery = queryParts.join(' ');

    const prompt = `
[Instruction]
Perform an actual Google Search to find REAL, PUBLICLY VERIFIED social media creators / influencers matching:
Query: "${searchQuery}"

CRITICAL SAFETY & TRUTH MANDATE:
1. ONLY return real creators/influencers that actually exist on public web platforms (${platform !== '전체' ? platform : 'Instagram, YouTube, TikTok, Blog, Threads'}).
2. Do NOT invent, synthesize, or hallucinate fake names, handles, profile URLs, or follower counts.
3. Profile URL MUST be an actual valid URL structure for that platform (e.g. https://www.instagram.com/username or https://www.youtube.com/@channel).
4. If follower count cannot be specifically verified via search results, output strictly "확인 필요".
5. Return JSON array format strictly conforming to the following structure:
[
  {
    "name": "실제 활동명 / 이름",
    "platform": "Instagram" | "YouTube" | "Threads" | "Blog" | "TikTok" | "기타",
    "handle": "@실제계정아이디",
    "categories": ["골프", "러닝", "웰니스", ...],
    "features": "최근 활동 특징 및 콘텐츠 스타일 요약",
    "profileUrl": "https://...",
    "followers": "1.2만" 또는 "확인 필요",
    "verifiedDate": "2026.08",
    "isOfficialPublic": true
  }
]
Return between 3 to 6 actual verified creators found in the web search. If no actual verified creators are found for this query, return an empty array [].
`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let responseText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        if (response && response.text && response.text.trim().length > 0) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`[Influencer Store] Model ${modelName} search failed:`, err?.message || err);
      }
    }
    const parsed = parseGeminiJsonSafely(responseText, null);
    const rawArray = Array.isArray(parsed) ? parsed : (parsed?.results && Array.isArray(parsed.results) ? parsed.results : null);

    if (!rawArray || rawArray.length === 0) {
      if (responseText.includes('연결') || responseText.includes('찾을 수 없') || responseText.length < 20) {
        return {
          success: false,
          error: '실시간 인플루언서 검색 연결이 필요합니다.',
        };
      }
      return { success: true, results: [] };
    }

    const results: InfluencerRecommendationResult[] = rawArray.map((item: any) => ({
      name: String(item.name || '알 수 없음').trim(),
      platform: (item.platform || 'Instagram') as InfluencerPlatform,
      handle: String(item.handle || '').trim(),
      categories: Array.isArray(item.categories) ? item.categories : [category !== '전체' ? category : '기타'],
      features: String(item.features || '주요 콘텐츠 활동 중').trim(),
      profileUrl: String(item.profileUrl || '#').trim(),
      followers: String(item.followers || '확인 필요').trim(),
      verifiedDate: item.verifiedDate || new Date().toISOString().substring(0, 7).replace('-', '.'),
      isOfficialPublic: Boolean(item.isOfficialPublic),
    }));

    return { success: true, results };
  } catch (err: any) {
    console.error('Error in searchRecommendedInfluencers:', err);
    return {
      success: false,
      error: '실시간 인플루언서 검색 연결이 필요합니다.',
    };
  }
}
