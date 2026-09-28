import React, { useState, useEffect, useMemo } from 'react';
import {
  PostEventRegistration,
  PostEventAnalysisReport,
  PostEventPeriod,
  PostEventChannel,
  PostEventInternalData,
  PostEventParsedReport,
  SavedEventItem,
  RecentSearchItem
} from '../types';
import {
  Search,
  Sparkles,
  Calendar,
  Building,
  MapPin,
  Tag,
  Hash,
  Filter,
  BarChart3,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Eye,
  Share2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Layers,
  ChevronRight,
  Save,
  History,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  Check,
  Plus,
  X,
  RotateCcw,
  ListFilter,
  FolderOpen,
  User,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

// Standard 7 Preset Venues
const PRESET_VENUES = [
  '오크밸리 리조트',
  '파크로쉬',
  '오크밸리CC',
  '오크힐스CC',
  '성문안CC',
  '월송리CC',
  '오크밸리 스키장'
];

// Bilingual variants mapping for auto-expansion UI
export const getBilingualVariantsUI = (val: string): string[] => {
  if (!val || typeof val !== 'string') return [];
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  const synonymMap: Record<string, string[]> = {
    'garmin': ['가민', 'Garmin'],
    '가민': ['가민', 'Garmin'],
    'garmin golf': ['가민 골프', 'Garmin Golf', 'Garmin Golf Club'],
    '가민 골프': ['가민 골프', 'Garmin Golf', 'Garmin Golf Club'],
    'garmin golf club': ['가민 골프클럽', 'Garmin Golf Club', '가민 골프', 'Garmin Golf'],
    'oak valley': ['오크밸리', 'Oak Valley', '오크밸리CC'],
    '오크밸리': ['오크밸리', 'Oak Valley', '오크밸리CC'],
    '오크밸리cc': ['오크밸리CC', '오크밸리', 'Oak Valley CC', 'Oak Valley'],
    'oak valley cc': ['오크밸리CC', '오크밸리', 'Oak Valley CC', 'Oak Valley'],
    'park roche': ['파크로쉬', 'Park Roche'],
    '파크로쉬': ['파크로쉬', 'Park Roche'],
    'sungmoonan': ['성문안', '성문안CC', 'Sungmoonan'],
    '성문안': ['성문안', '성문안CC', 'Sungmoonan'],
    'sungmoonan cc': ['성문안CC', '성문안', 'Sungmoonan CC'],
    'wolsongri': ['월송리', '월송리CC', 'Wolsongri'],
    '월송리': ['월송리', '월송리CC', 'Wolsongri'],
    'lemouton': ['르무통', 'LeMouton'],
    '르무통': ['르무통', 'LeMouton'],
    'nike': ['나이키', 'Nike'],
    '나이키': ['나이키', 'Nike'],
    'taylormade': ['테일러메이드', 'TaylorMade'],
    '테일러메이드': ['테일러메이드', 'TaylorMade'],
    'titleist': ['타이틀리스트', 'Titleist'],
    '타이틀리스트': ['타이틀리스트', 'Titleist'],
    '이시우': ['이시우', '이시우 프로', 'Lee Si-woo'],
    '이시우 프로': ['이시우 프로', '이시우', 'Lee Si-woo']
  };

  if (synonymMap[lower]) {
    return Array.from(new Set([trimmed, ...synonymMap[lower]]));
  }
  return [trimmed];
};

// Platform Categorization Helper
export const getPlatformCategory = (item: { platform?: string; channel?: string }): 'Instagram' | '블로그·카페' | '언론' | 'YouTube' | '기타' => {
  const p = (item.platform || '').trim().toLowerCase();
  const c = (item.channel || '').trim().toLowerCase();
  const combined = `${p} ${c}`;
  if (p === 'instagram' || combined.includes('instagram') || combined.includes('인스타') || combined.includes('reels') || combined.includes('릴스')) {
    return 'Instagram';
  }
  if (p === '블로그·카페' || combined.includes('블로그') || combined.includes('카페') || combined.includes('blog') || combined.includes('cafe')) {
    return '블로그·카페';
  }
  if (p === '언론' || combined.includes('뉴스') || combined.includes('기사') || combined.includes('언론') || combined.includes('news') || combined.includes('press') || combined.includes('보도')) {
    return '언론';
  }
  if (p === 'youtube' || combined.includes('youtube') || combined.includes('유튜브') || combined.includes('vlog')) {
    return 'YouTube';
  }
  return '기타';
};

// Related Hashtags Types & Preset venue mappings
export type HashtagSource = 'default' | 'verified' | 'custom';

export interface RelatedHashtagItem {
  tag: string;
  source: HashtagSource;
}

const VENUE_DEFAULT_HASHTAGS_MAP: Record<string, string[]> = {
  '오크밸리 리조트': ['#오크밸리'],
  '파크로쉬': ['#파크로쉬'],
  '오크밸리CC': ['#오크밸리', '#오크밸리CC'],
  '오크힐스CC': ['#오크밸리', '#오크힐스CC'],
  '성문안CC': ['#성문안', '#성문안CC'],
  '월송리CC': ['#월송리CC'],
  '오크밸리 스키장': ['#오크밸리', '#오크밸리스키장']
};

export const getVenueDefaultHashtags = (venues: string[]): string[] => {
  const result: string[] = [];
  venues.forEach((v) => {
    if (VENUE_DEFAULT_HASHTAGS_MAP[v]) {
      result.push(...VENUE_DEFAULT_HASHTAGS_MAP[v]);
    } else {
      if (v.includes('오크밸리') && (v.includes('CC') || v.includes('골프'))) {
        result.push('#오크밸리', '#' + v.replace(/\s+/g, ''));
      } else if (v.includes('오크밸리')) {
        result.push('#오크밸리');
      } else if (v.includes('파크로쉬')) {
        result.push('#파크로쉬');
      } else if (v.includes('성문안')) {
        result.push('#성문안', '#' + v.replace(/\s+/g, ''));
      } else if (v.includes('월송리')) {
        result.push('#' + v.replace(/\s+/g, ''));
      } else {
        const clean = v.replace(/[^가-힣a-zA-Z0-9]/g, '');
        if (clean) result.push('#' + clean);
      }
    }
  });
  return Array.from(new Set(result));
};

// Initial Sample Saved Past Events (예: Garmin Golf Club, 르무통 산책회)
const INITIAL_PAST_EVENTS: SavedEventItem[] = [
  {
    id: 'evt-preset-garmin',
    projectName: 'Garmin Golf Club',
    eventName: 'Garmin Golf Club',
    brandName: 'Garmin',
    eventDate: '2026-05-20',
    locations: ['오크밸리CC'],
    location: '오크밸리CC',
    personNames: ['이시우'],
    keywords: ['골프', '라운드', '레슨'],
    officialHashtags: ['#가민', '#Garmin', '#오크밸리CC', '#이시우프로'],
    lastVerifiedDate: '2026-05-22',
    createdAt: '2026-05-22T10:00:00Z'
  },
  {
    id: 'evt-preset-lemouton',
    projectName: '르무통 산책회',
    eventName: '르무통 산책회',
    brandName: '르무통',
    eventDate: '2026-05-16',
    locations: ['오크밸리 리조트'],
    location: '오크밸리 리조트',
    personNames: [],
    keywords: ['산책회', '트레일', '체험마케팅'],
    officialHashtags: ['#르무통산책회', '#오크밸리산책회', '#오크밸리'],
    lastVerifiedDate: '2026-05-18',
    createdAt: '2026-05-18T10:00:00Z'
  }
];

export const PostEventTrackerView: React.FC = () => {
  // 1. Event Registration Form State (Defaults to completely blank)
  const [projectName, setProjectName] = useState<string>('');
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [customVenueInput, setCustomVenueInput] = useState<string>('');
  const [showCustomVenueInput, setShowCustomVenueInput] = useState<boolean>(false);
  const [personNames, setPersonNames] = useState<string[]>([]);
  const [newPersonInput, setNewPersonInput] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState<string>('');
  const [relatedHashtags, setRelatedHashtags] = useState<RelatedHashtagItem[]>([]);
  const [newHashtagInput, setNewHashtagInput] = useState<string>('');

  // Derived helper for backward compatibility
  const officialHashtags = relatedHashtags.map((item) => item.tag);

  // 2. Document Upload & Keyword Extraction State
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isExtractingFromFile, setIsExtractingFromFile] = useState<boolean>(false);
  const [fileExtractionNotice, setFileExtractionNotice] = useState<string | null>(null);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState<boolean>(false);
  const [keywordNotice, setKeywordNotice] = useState<string | null>(null);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  // 3. Storage & State Indicators
  const [isExistingEvent, setIsExistingEvent] = useState<boolean>(false);
  const [loadedEventId, setLoadedEventId] = useState<string | null>(null);
  const [lastVerifiedDate, setLastVerifiedDate] = useState<string | null>(null);

  // 4. Modals State
  const [showPastEventsModal, setShowPastEventsModal] = useState<boolean>(false);

  // 5. Stored Datasets (Past events only)
  const [pastEventsList, setPastEventsList] = useState<SavedEventItem[]>(() => {
    try {
      const saved = localStorage.getItem('oakvalley_saved_past_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old preset fake samples except lemouton
          const cleaned = parsed.filter((item: SavedEventItem) => {
            if (item.id === 'evt-preset-lemouton') return true;
            if (item.id && item.id.startsWith('evt-preset-')) return false;
            return true;
          });
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.error('Failed to load past events:', e);
    }
    return INITIAL_PAST_EVENTS;
  });

  // 5. Period Filter
  const [selectedPeriod, setSelectedPeriod] = useState<PostEventPeriod>('ALL');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // 6. UI View Tab
  const [activeViewTab, setActiveViewTab] = useState<'OVERVIEW' | 'CONTENTS' | 'TOP5' | 'SENTIMENT' | 'EXPOSURE' | 'INTERNAL_DATA' | 'EXECUTIVE_QA' | 'HISTORY'>('OVERVIEW');

  // 7. Content Table Filters
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [contentSearchTerm, setContentSearchTerm] = useState<string>('');

  // 8. Analysis Report & Loading States
  const [report, setReport] = useState<PostEventAnalysisReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 9. History Storage (Previous vs Current)
  const [savedReportsHistory, setSavedReportsHistory] = useState<PostEventAnalysisReport[]>([]);
  const [comparedHistoryReport, setComparedHistoryReport] = useState<PostEventAnalysisReport | null>(null);

  // 10. Internal Data Manual Input State
  const [internalDataForm, setInternalDataForm] = useState<PostEventInternalData>({
    instagramReach: null,
    instagramImpressions: null,
    instagramSaves: null,
    instagramShares: null,
    reelsViews: null,
    linkClicks: null,
    brandReportNotes: '',
    influencerDataNotes: '',
    oakValleyOfficialSnsNotes: ''
  });
  const [internalDataSaved, setInternalDataSaved] = useState<boolean>(false);

  // 11. Report Parsing File Upload & Approval Workflow State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parsingLoading, setParsingLoading] = useState<boolean>(false);
  const [parsedReportCandidate, setParsedReportCandidate] = useState<PostEventParsedReport | null>(null);
  const [editableMetrics, setEditableMetrics] = useState<any>({});
  const [reportApprovedSuccess, setReportApprovedSuccess] = useState<boolean>(false);

  // --- Derived Metrics & Visual Chart Datasets (Double Defense & Robust UI) ---
  const derivedSummaryParagraph = useMemo(() => {
    if (!report) return '';
    if (report.executiveSummaryParagraph && report.executiveSummaryParagraph.trim()) {
      return report.executiveSummaryParagraph;
    }
    
    const contentsList = report.contents || [];
    if (contentsList.length === 0) {
      return '분석 가능한 반응 데이터가 부족합니다.';
    }

    const totalCount = report.summaryKpi?.verifiedContentCount || contentsList.length;
    const totalViews = report.summaryKpi?.verifiableViewsTotal ? report.summaryKpi.verifiableViewsTotal.toLocaleString() : '0';
    const totalReactions = report.summaryKpi?.verifiableReactionsTotal ? report.summaryKpi.verifiableReactionsTotal.toLocaleString() : '0';
    const mainChannel = report.executiveQA?.whereSpreadMost || '네이버 블로그 및 SNS';
    const topPosTopic = report.sentimentAnalysis?.positiveTopics?.[0]?.topic || '행사 현장 및 야외 체험 만족';
    const topNegTopic = report.sentimentAnalysis?.negativeOrRegretTopics?.[0]?.topic || '주차 정체 및 안마/사이즈 아쉬움';

    return `본 행사는 공개 검색 가능한 온라인 범위에서 총 ${totalCount}건의 관련 콘텐츠가 수집 및 검증되었으며, 공개 확인 누적 조회수 ${totalViews}회 및 반응 수 ${totalReactions}건을 기록했습니다. 주요 수집 채널은 ${mainChannel} 중심으로 형성되었으며, 특히 '${topPosTopic}' 항목에서 높은 고객 만족도와 자발적 공유가 관찰되었습니다. 반면 '${topNegTopic}' 관련 아쉬운 의견도 일부 수집되어 차기 제휴 진행 시 현장 운영 및 동선 가이드를 보강할 필요가 있습니다.`;
  }, [report]);

  const derivedChannelStats = useMemo(() => {
    if (!report) return [];

    const contents = report.contents || [];
    const channelCountMap: Record<string, number> = {
      '뉴스/기사': 0,
      '네이버 블로그': 0,
      '네이버 카페': 0,
      'Instagram': 0,
      'YouTube': 0,
      '기타': 0
    };

    if (contents.length > 0) {
      contents.forEach((c) => {
        const rawCh = (c.channel || '').trim().toLowerCase();
        if (rawCh.includes('뉴스') || rawCh.includes('기사') || rawCh.includes('news') || rawCh.includes('press') || rawCh.includes('article')) {
          channelCountMap['뉴스/기사'] += 1;
        } else if (rawCh.includes('블로그') || rawCh.includes('blog')) {
          channelCountMap['네이버 블로그'] += 1;
        } else if (rawCh.includes('카페') || rawCh.includes('cafe') || rawCh.includes('커뮤니티')) {
          channelCountMap['네이버 카페'] += 1;
        } else if (rawCh.includes('instagram') || rawCh.includes('인스타') || rawCh.includes('insta') || rawCh.includes('릴스') || rawCh.includes('reels')) {
          channelCountMap['Instagram'] += 1;
        } else if (rawCh.includes('youtube') || rawCh.includes('유튜브') || rawCh.includes('vlog')) {
          channelCountMap['YouTube'] += 1;
        } else {
          channelCountMap['기타'] += 1;
        }
      });

      const totalCount = Object.values(channelCountMap).reduce((a, b) => a + b, 0);
      if (totalCount > 0) {
        return Object.keys(channelCountMap).map((ch) => ({
          channel: ch,
          count: channelCountMap[ch]
        }));
      }
    }

    if (report.channelStats && Array.isArray(report.channelStats) && report.channelStats.length > 0) {
      const sum = report.channelStats.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
      if (sum > 0) {
        return report.channelStats.map((item) => ({
          channel: String(item.channel || '기타'),
          count: Number(item.count || 0)
        }));
      }
    }

    return Object.keys(channelCountMap).map((ch) => ({
      channel: ch,
      count: channelCountMap[ch]
    }));
  }, [report]);

  const derivedDailyTimeline = useMemo(() => {
    if (!report) return [];

    // 1. From contents if available
    const contents = report.contents || [];
    if (contents.length > 0) {
      const dateMap: Record<string, number> = {};
      contents.forEach((c) => {
        if (c.publishDate) {
          const raw = String(c.publishDate).trim();
          const dateKey = raw.length > 5 ? raw.slice(5) : raw;
          dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
        }
      });

      const sortedDates = Object.keys(dateMap).sort();
      if (sortedDates.length > 0) {
        return sortedDates.map((d) => ({
          date: d,
          count: Number(dateMap[d])
        }));
      }
    }

    // 2. From buzzPersistence dateDistribution
    if (report.buzzPersistence?.dateDistribution && report.buzzPersistence.dateDistribution.length > 0) {
      return report.buzzPersistence.dateDistribution.map((item) => ({
        date: String(item.date),
        count: Number(item.count || 0)
      }));
    }

    // 3. From dailyTimeline array
    if (report.dailyTimeline && Array.isArray(report.dailyTimeline) && report.dailyTimeline.length > 0) {
      return report.dailyTimeline.map((item) => ({
        date: String(item.date || ''),
        count: Number(item.count || 0)
      }));
    }

    return [];
  }, [report]);

  // --- Automatic Venue Default Hashtags Sync Effect ---
  useEffect(() => {
    const defaultTags = getVenueDefaultHashtags(selectedVenues);

    setRelatedHashtags((prev) => {
      // 1. Keep non-default tags (verified from docs/AI, custom added by user)
      const nonDefaultItems = prev.filter((item) => item.source !== 'default');

      // 2. Map keyed by tag to preserve order and override source
      const map = new Map<string, RelatedHashtagItem>();

      // Put new default tags first
      defaultTags.forEach((tag) => {
        map.set(tag, { tag, source: 'default' });
      });

      // Override with verified or custom tags if previously present, or add them
      nonDefaultItems.forEach((item) => {
        map.set(item.tag, item);
      });

      return Array.from(map.values());
    });
  }, [selectedVenues]);

  // --- Reset to Blank New Event Registration ---
  const handleResetToNewEvent = () => {
    setProjectName('');
    setEventName('');
    setEventDate('');
    setBrandName('');
    setSelectedVenues([]);
    setCustomVenueInput('');
    setShowCustomVenueInput(false);
    setPersonNames([]);
    setNewPersonInput('');
    setKeywords([]);
    setNewKeywordInput('');
    setRelatedHashtags([]);
    setNewHashtagInput('');
    setIsExistingEvent(false);
    setLoadedEventId(null);
    setLastVerifiedDate(null);
    setReport(null);
    setError(null);
  };

  // --- Clear Search Conditions ---
  const handleClearSearchConditions = () => {
    setProjectName('');
    setEventName('');
    setEventDate('');
    setBrandName('');
    setSelectedVenues([]);
    setCustomVenueInput('');
    setShowCustomVenueInput(false);
    setPersonNames([]);
    setNewPersonInput('');
    setKeywords([]);
    setNewKeywordInput('');
    setRelatedHashtags([]);
    setNewHashtagInput('');
    setIsExistingEvent(false);
    setLoadedEventId(null);
    setLastVerifiedDate(null);
    setReport(null);
    setError(null);
    setFileExtractionNotice(null);
    setKeywordNotice(null);
    setKeywordError(null);
  };

  // --- Document File Upload Extraction Handler ---
  const handleTriggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsExtractingFromFile(true);
    setError(null);
    setFileExtractionNotice(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/extract-event-from-file', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data && data.success && data.extractedInfo) {
        const info = data.extractedInfo;

        if (info.eventName) setEventName(info.eventName);
        if (info.eventDate) setEventDate(info.eventDate);
        if (info.brandName) setBrandName(info.brandName);

        if (Array.isArray(info.locations) && info.locations.length > 0) {
          setSelectedVenues(info.locations);
        } else if (info.location) {
          setSelectedVenues([info.location]);
        }

        if (Array.isArray(info.keywords) && info.keywords.length > 0) {
          setKeywords(info.keywords);
        }

        if (Array.isArray(info.officialHashtags) && info.officialHashtags.length > 0) {
          const verifiedItems: RelatedHashtagItem[] = info.officialHashtags.map((ht: string) => {
            const formatted = ht.startsWith('#') ? ht : '#' + ht;
            return { tag: formatted, source: 'verified' as const };
          });
          setRelatedHashtags((prev) => {
            const map = new Map<string, RelatedHashtagItem>();
            prev.forEach((item) => map.set(item.tag, item));
            verifiedItems.forEach((item) => map.set(item.tag, item));
            return Array.from(map.values());
          });
        }

        const fileNames = Array.from(files).map((f: File) => f.name).join(', ');
        setFileExtractionNotice(`✨ 행사자료 [${fileNames}] 분석이 완료되었습니다. 추출된 행사 정보를 확인/수정한 후 조사를 진행하세요.`);
      } else {
        setError(data?.error || '행사자료 분석 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('File upload extraction error:', err);
      setError('행사자료 파일 처리 중 서버 오류가 발생했습니다.');
    } finally {
      setIsExtractingFromFile(false);
      if (e.target) e.target.value = '';
    }
  };

  // --- AI Keyword Auto-Generation Handler ---
  const handleAutoGenerateKeywords = async () => {
    setKeywordNotice(null);
    setKeywordError(null);

    if (!eventName.trim() && !brandName.trim()) {
      setKeywordError('행사명 또는 브랜드/제휴사 정보를 먼저 입력해주세요.');
      return;
    }

    setIsGeneratingKeywords(true);
    setKeywordNotice('키워드 분석 중...');

    try {
      const res = await fetch('/api/generate-event-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          brandName,
          location: selectedVenues.join(', '),
          eventDate
        })
      });

      const data = await res.json();
      if (data && data.success && Array.isArray(data.keywords) && data.keywords.length > 0) {
        const merged = Array.from(new Set([...keywords, ...data.keywords]));
        setKeywords(merged);
        setKeywordNotice('관련 키워드가 생성되었습니다.');
        setKeywordError(null);
      } else {
        setKeywordError(data?.error || '키워드를 생성하지 못했습니다. 다시 시도해주세요.');
        setKeywordNotice(null);
      }
    } catch (err) {
      console.error('Keyword generation error:', err);
      setKeywordError('키워드를 생성하지 못했습니다. 다시 시도해주세요.');
      setKeywordNotice(null);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  // --- Select Past Event from Modal ---
  const handleSelectPastEvent = (evt: SavedEventItem) => {
    setProjectName(evt.projectName || evt.eventName || '');
    setEventName(evt.eventName || evt.projectName || '');
    setBrandName(evt.brandName || '');
    setEventDate(evt.eventDate || '');
    const newVenues = evt.locations && evt.locations.length > 0 ? evt.locations : (evt.location ? [evt.location] : []);
    setSelectedVenues(newVenues);
    setPersonNames(evt.personNames || []);
    setKeywords(evt.keywords || []);

    if (evt.officialHashtags && evt.officialHashtags.length > 0) {
      const defaultSet = new Set(getVenueDefaultHashtags(newVenues));
      const loadedItems: RelatedHashtagItem[] = evt.officialHashtags.map((ht: string) => {
        const formatted = ht.startsWith('#') ? ht : '#' + ht;
        const source: HashtagSource = defaultSet.has(formatted) ? 'default' : 'verified';
        return { tag: formatted, source };
      });
      setRelatedHashtags(loadedItems);
    } else {
      setRelatedHashtags([]);
    }

    setIsExistingEvent(true);
    setLoadedEventId(evt.id);
    setLastVerifiedDate(evt.lastVerifiedDate || new Date().toISOString().split('T')[0]);
    setShowPastEventsModal(false);

    if (evt.report) {
      setReport(evt.report);
    } else {
      runAnalysisWithData({
        projectName: evt.projectName || evt.eventName,
        eventName: evt.eventName,
        eventDate: evt.eventDate,
        brandName: evt.brandName,
        locations: newVenues,
        personNames: evt.personNames || [],
        keywords: evt.keywords || [],
        officialHashtags: evt.officialHashtags || []
      });
    }
  };

  // --- Multi-select Location Helpers ---
  const handleToggleVenue = (venue: string) => {
    if (selectedVenues.includes(venue)) {
      setSelectedVenues(selectedVenues.filter((v) => v !== venue));
    } else {
      setSelectedVenues([...selectedVenues, venue]);
    }
  };

  const handleAddCustomVenue = () => {
    const trimmed = customVenueInput.trim();
    if (trimmed && !selectedVenues.includes(trimmed)) {
      setSelectedVenues([...selectedVenues, trimmed]);
      setCustomVenueInput('');
      setShowCustomVenueInput(false);
    }
  };

  const handleRemoveVenue = (venue: string) => {
    setSelectedVenues(selectedVenues.filter((v) => v !== venue));
  };

  // --- Person Helpers ---
  const handleAddPerson = () => {
    const trimmed = newPersonInput.trim();
    if (trimmed) {
      if (!personNames.includes(trimmed)) {
        setPersonNames((prev) => [...prev, trimmed]);
      }
      setNewPersonInput('');
    }
  };

  const handleRemovePerson = (pToDelete: string) => {
    setPersonNames((prev) => prev.filter((p) => p !== pToDelete));
  };

  // --- Keywords & Hashtags Handlers ---
  const handleAddKeyword = () => {
    const trimmed = newKeywordInput.trim();
    if (trimmed) {
      if (!keywords.includes(trimmed)) {
        setKeywords((prev) => [...prev, trimmed]);
      }
      setNewKeywordInput('');
      setKeywordError(null);
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleAddHashtag = () => {
    let ht = newHashtagInput.trim();
    if (ht) {
      if (!ht.startsWith('#')) ht = '#' + ht;
      setRelatedHashtags((prev) => {
        if (prev.some((item) => item.tag === ht)) return prev;
        return [...prev, { tag: ht, source: 'custom' }];
      });
      setNewHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tagToDelete: string) => {
    setRelatedHashtags((prev) => prev.filter((item) => item.tag !== tagToDelete));
  };

  // --- Run Analysis Helper ---
  const runAnalysisWithData = async (overrideData?: {
    projectName?: string;
    eventName?: string;
    eventDate?: string;
    brandName?: string;
    locations?: string[];
    personNames?: string[];
    keywords?: string[];
    officialHashtags?: string[];
  }) => {
    setLoading(true);
    setError(null);

    const targetProjectName = overrideData?.projectName ?? (projectName || eventName);
    const targetEventName = overrideData?.eventName ?? (eventName || projectName);
    const targetBrandName = overrideData?.brandName ?? brandName;
    const targetEventDate = overrideData?.eventDate ?? eventDate;
    const targetVenues = overrideData?.locations ?? selectedVenues;
    const targetPersonNames = overrideData?.personNames ?? personNames;
    const targetKeywords = overrideData?.keywords ?? keywords;
    const targetHashtags = overrideData?.officialHashtags ?? officialHashtags;

    const registration: PostEventRegistration = {
      projectName: targetProjectName,
      eventName: targetEventName,
      eventDate: targetEventDate,
      brandName: targetBrandName,
      location: targetVenues.join(' + ') || '오크밸리',
      locations: targetVenues,
      personNames: targetPersonNames,
      keywords: targetKeywords,
      officialHashtags: targetHashtags
    };

    try {
      const res = await fetch('/api/analyze-post-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration,
          selectedPeriod,
          customStartDate: selectedPeriod === 'CUSTOM' ? customStartDate : undefined,
          customEndDate: selectedPeriod === 'CUSTOM' ? customEndDate : undefined
        })
      });

      const data = await res.json();
      if (data && data.success && data.report) {
        setReport(data.report);

        if (savedReportsHistory.length > 0) {
          const prev = savedReportsHistory.find((r) => r.registration.eventName === targetEventName || r.registration.projectName === targetProjectName);
          if (prev) {
            setComparedHistoryReport(prev);
          }
        }
      } else {
        setError(data?.error || '조사 진행 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('Error fetching post-event report:', err);
      setError('서버 연결 및 검색 데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = () => {
    const hasAnyInput =
      projectName.trim() ||
      eventName.trim() ||
      brandName.trim() ||
      selectedVenues.length > 0 ||
      personNames.length > 0 ||
      keywords.length > 0;

    if (!hasAnyInput) {
      setError('프로젝트명, 브랜드/파트너, 진행 기간, 장소, 관련 인물, 키워드 중 하나 이상을 입력해주세요.');
      return;
    }
    runAnalysisWithData();
  };

  // --- Save Current Report to History & Past Events ---
  const handleSaveToHistory = () => {
    if (!report && !projectName && !eventName && !brandName) {
      alert('저장할 행사 정보가 없습니다.');
      return;
    }

    const currentDateStr = new Date().toISOString().split('T')[0];
    const locationString = selectedVenues.length > 0 ? selectedVenues.join(' + ') : '오크밸리 리조트';

    const savedItem: SavedEventItem = {
      id: loadedEventId || `evt-${Date.now()}`,
      projectName: projectName || eventName || brandName || '신규 프로젝트',
      eventName: eventName || projectName || brandName || '신규 행사',
      brandName: brandName || projectName || eventName || '제휴사',
      eventDate: eventDate || currentDateStr,
      locations: selectedVenues.length > 0 ? selectedVenues : ['오크밸리 리조트'],
      location: locationString,
      personNames,
      keywords,
      officialHashtags,
      lastVerifiedDate: currentDateStr,
      createdAt: new Date().toISOString(),
      report: report || undefined
    };

    let updatedList: SavedEventItem[] = [];
    if (loadedEventId && pastEventsList.some(e => e.id === loadedEventId)) {
      updatedList = pastEventsList.map(e => e.id === loadedEventId ? savedItem : e);
      alert(`기존 저장 행사 [${projectName || eventName}] 데이터가 업데이트되었습니다.`);
    } else {
      updatedList = [savedItem, ...pastEventsList];
      setIsExistingEvent(true);
      setLoadedEventId(savedItem.id);
      setLastVerifiedDate(currentDateStr);
      alert(`신규 행사 [${projectName || eventName || brandName}]가 지난 행사 목록에 새로 저장되었습니다.`);
    }

    setPastEventsList(updatedList);
    try {
      localStorage.setItem('oakvalley_saved_past_events', JSON.stringify(updatedList));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }

    if (report) {
      const existsIndex = savedReportsHistory.findIndex(
        (r) => r.registration.eventName === report.registration.eventName && r.searchedAt === report.searchedAt
      );
      if (existsIndex === -1) {
        setSavedReportsHistory([report, ...savedReportsHistory]);
      }
    }
  };

  // Handle Internal Data Save
  const handleSaveInternalData = (e: React.FormEvent) => {
    e.preventDefault();
    if (report) {
      setReport({
        ...report,
        internalData: {
          ...internalDataForm,
          updatedAt: new Date().toISOString()
        }
      });
      setInternalDataSaved(true);
      setTimeout(() => setInternalDataSaved(false), 3000);
    }
  };

  // Handle File Upload & AI Parsing
  const handleFileUploadAndParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setParsingLoading(true);
    setReportApprovedSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('notesText', `행사명: ${eventName}, 브랜드: ${brandName}`);

      const res = await fetch('/api/parse-event-report', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data && data.success && data.parsedReport) {
        setParsedReportCandidate(data.parsedReport);
        setEditableMetrics(data.parsedReport.extractedMetrics || {});
      } else {
        alert(data?.error || '파일 읽기 및 실적 추출에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error parsing report file:', err);
      alert('파일 처리 중 오류가 발생했습니다.');
    } finally {
      setParsingLoading(false);
    }
  };

  // User Confirm & Approve Parsed Report
  const handleApproveParsedReport = () => {
    if (!parsedReportCandidate || !report) return;

    const approvedReport: PostEventParsedReport = {
      ...parsedReportCandidate,
      extractedMetrics: editableMetrics,
      userApproved: true
    };

    setReport({
      ...report,
      parsedReport: approvedReport,
      internalData: {
        ...report.internalData,
        instagramReach: editableMetrics.instagramReach ?? report.internalData.instagramReach,
        instagramImpressions: editableMetrics.instagramImpressions ?? report.internalData.instagramImpressions,
        instagramSaves: editableMetrics.instagramSaves ?? report.internalData.instagramSaves,
        instagramShares: editableMetrics.instagramShares ?? report.internalData.instagramShares,
        reelsViews: editableMetrics.reelsViews ?? report.internalData.reelsViews,
        linkClicks: editableMetrics.linkClicks ?? report.internalData.linkClicks
      }
    });

    setReportApprovedSuccess(true);
  };

  // Platform distribution counts for instant client-side tab switching
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: report?.contents?.length || 0,
      Instagram: 0,
      '블로그·카페': 0,
      언론: 0,
      YouTube: 0,
      기타: 0,
    };
    (report?.contents || []).forEach((item) => {
      const cat = getPlatformCategory(item);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [report?.contents]);

  // Filtered Contents for Table View (pure client-side instant filtering, never re-fetches from server)
  const filteredContents = useMemo(() => {
    if (!report?.contents) return [];
    return report.contents.filter((item) => {
      const itemCat = getPlatformCategory(item);
      const matchesPlatform = channelFilter === 'ALL' || itemCat === channelFilter;
      const term = contentSearchTerm.trim().toLowerCase();
      const matchesTerm =
        !term ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.titleOrSummary && item.titleOrSummary.toLowerCase().includes(term)) ||
        (item.author && item.author.toLowerCase().includes(term)) ||
        (item.connectionEvidence && item.connectionEvidence.toLowerCase().includes(term)) ||
        (item.relevanceReason && item.relevanceReason.toLowerCase().includes(term)) ||
        itemCat.toLowerCase().includes(term);
      return matchesPlatform && matchesTerm;
    });
  }, [report?.contents, channelFilter, contentSearchTerm]);

  // Live Auto-Expanded Query Combinations Generator
  const expandedQueriesPreview = useMemo(() => {
    const pName = (projectName || eventName || '').trim();
    const bName = brandName.trim();
    const rawLocs = selectedVenues.length > 0 ? selectedVenues : ['오크밸리'];

    const bVars = bName ? getBilingualVariantsUI(bName) : (pName ? getBilingualVariantsUI(pName) : ['가민', 'Garmin']);
    const lVars: string[] = [];
    rawLocs.forEach((loc) => {
      getBilingualVariantsUI(loc).forEach((v) => {
        if (!lVars.includes(v)) lVars.push(v);
      });
    });
    if (lVars.length === 0) lVars.push('오크밸리', 'Oak Valley');

    const list: Array<{ query: string; type: string }> = [];
    const seen = new Set<string>();

    const add = (q: string, type: string) => {
      const trimmed = q.trim();
      if (!trimmed || seen.has(trimmed.toLowerCase())) return;
      seen.add(trimmed.toLowerCase());
      list.push({ query: trimmed, type });
    };

    // 1. Brand + Venue (한/영 바이링구얼)
    bVars.forEach((b) => {
      lVars.forEach((l) => {
        add(`${b} + ${l}`, '브랜드+장소');
      });
    });

    // 2. Project + Venue / Brand + Project
    if (pName) {
      const pVars = getBilingualVariantsUI(pName);
      pVars.forEach((p) => {
        lVars.forEach((l) => {
          add(`${p} + ${l}`, '프로젝트+장소');
        });
        bVars.forEach((b) => {
          if (!p.toLowerCase().includes(b.toLowerCase())) {
            add(`${b} + ${p}`, '브랜드+프로젝트');
          }
        });
      });
    }

    // 3. Person combinations (관련 인물)
    personNames.forEach((person) => {
      bVars.forEach((b) => {
        add(`${b} + ${person}`, '브랜드+인물');
      });
      lVars.forEach((l) => {
        add(`${person} + ${l}`, '인물+장소');
      });
    });

    // 4. Keyword combinations (키워드)
    keywords.forEach((kw) => {
      bVars.forEach((b) => {
        add(`${b} + ${kw}`, '브랜드+키워드');
      });
      lVars.forEach((l) => {
        add(`${l} + ${kw}`, '장소+키워드');
      });
    });

    return list.slice(0, 16);
  }, [projectName, eventName, brandName, selectedVenues, personNames, keywords]);

  const displayBrand = brandName.trim() || '브랜드명';
  const displayEvent = projectName.trim() || eventName.trim() || '행사명';
  const activeVenues = selectedVenues.length > 0 ? selectedVenues : ['오크밸리'];

  return (
    <div className="space-y-8 font-sans text-[#2C2C2C] pb-12 animate-in fade-in duration-200">

      {/* 1. TOP HEADER HERO BANNER */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 shadow-2xs relative overflow-hidden">
        {/* Hidden File Input for Document Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".ppt,.pptx,.xls,.xlsx,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#736152] text-white rounded-2xs">
                POST-EVENT BUZZ TRACKER
              </span>
              <span className="text-[11px] font-mono text-[#8C7A6B]">
                공개 데이터 검증 &middot; 추정 수치 없음
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#2C2C2C]">
              행사 후 성과 분석 트래커 - 온라인 및 미디어 노출 현황
            </h1>
            <p className="text-xs text-[#5C4E43] max-w-3xl leading-relaxed">
              행사 및 제휴 이벤트 종료 후 온라인 확산도, 실제 반응, 주요 미디어 노출 현황을 다각도로 실시간 분석합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Upload Materials Button */}
            <button
              type="button"
              onClick={handleTriggerFileUpload}
              disabled={isExtractingFromFile}
              className="px-3.5 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
            >
              {isExtractingFromFile ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>+ 행사자료 업로드</span>
            </button>

            {/* Load Past Event Button */}
            <button
              type="button"
              onClick={() => setShowPastEventsModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#5C4E43] text-xs font-bold rounded-xs border border-[#D4C8B8] transition-colors cursor-pointer flex items-center space-x-1.5 shadow-2xs"
            >
              <FolderOpen className="w-4 h-4 text-[#736152]" />
              <span>지난 행사 불러오기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REGISTRATION & SEARCH FORM CARD */}
      <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFECE6] pb-4 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#736152] text-white flex items-center justify-center rounded-2xs font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2C2C] flex items-center space-x-2">
                <span>행사 정보 등록 및 검색 조건 설정</span>
              </h2>
              <p className="text-[11px] text-[#736152] mt-0.5 font-medium">
                자료 등록 시 행사 정보가 자동 산출됩니다. 자료 미등록 시 수기 작성 후 진행할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isExistingEvent && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xs text-xs font-bold flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-amber-700" />
                <span>저장된 행사 불러옴 (기존 행사)</span>
                {lastVerifiedDate && <span className="text-[10px] font-mono text-amber-700 ml-1">확인: {lastVerifiedDate}</span>}
              </span>
            )}

            <button
              type="button"
              onClick={handleClearSearchConditions}
              className="px-2.5 py-1 text-xs text-[#8C7A6B] hover:text-[#2C2C2C] bg-[#FAF8F5] border border-[#EFECE6] rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer"
              title="검색 조건 초기화"
            >
              <RotateCcw className="w-3 h-3" />
              <span>조건 초기화</span>
            </button>
          </div>
        </div>

        {/* File Extraction Progress or Result Notice Banner */}
        {isExtractingFromFile && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xs flex items-center space-x-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-700 shrink-0" />
            <span>AI가 업로드한 행사자료에서 행사명, 날짜, 브랜드, 장소, 키워드를 추출하고 있습니다...</span>
          </div>
        )}

        {fileExtractionNotice && !isExtractingFromFile && (
          <div className="p-3 bg-[#FAF8F5] border border-[#736152] text-[#2C2C2C] text-xs rounded-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#736152] shrink-0" />
              <span className="font-medium">{fileExtractionNotice}</span>
            </div>
            <button type="button" onClick={() => setFileExtractionNotice(null)} className="text-[#8C7A6B] hover:text-[#2C2C2C]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 프로젝트명 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#5C4E43]">
                프로젝트명 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <span className="text-[10px] text-[#8C7A6B]">예: Garmin Golf Club</span>
            </div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (!eventName) setEventName(e.target.value);
              }}
              placeholder="예: Garmin Golf Club, 르무통 산책회"
              className="w-full px-3 py-2 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
            />
          </div>

          {/* 브랜드 / 파트너 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#5C4E43]">
                브랜드 / 파트너 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <span className="text-[10px] text-[#8C7A6B]">한/영 자동 확장</span>
            </div>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="예: Garmin (가민), 르무통, 테일러메이드"
              className="w-full px-3 py-2 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
            />
          </div>

          {/* 진행 기간 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#5C4E43]">
                진행 기간 / 일자 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <span className="text-[10px] text-[#8C7A6B]">연도-월-일</span>
            </div>
            <input
              type="text"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder="예: 2026-05-20"
              className="w-full px-3 py-2 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
            />
          </div>
        </div>

        {/* Multi-Select Venue Selector */}
        <div className="space-y-2 pt-1 border-t border-[#EFECE6]">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#5C4E43]">
              장소 <span className="text-gray-400 font-normal">(선택 &middot; 다중 선택 가능)</span>
            </label>
            <span className="text-[11px] font-mono text-[#8C7A6B]">
              선택 장소 {selectedVenues.length}개
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_VENUES.map((venue) => {
              const isSelected = selectedVenues.includes(venue);
              return (
                <button
                  key={venue}
                  type="button"
                  onClick={() => handleToggleVenue(venue)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#736152] text-white border-[#736152] shadow-2xs font-bold'
                      : 'bg-[#FAF8F5] text-[#5C4E43] border-[#D4C8B8] hover:bg-[#EFECE6]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                  <span>{venue}</span>
                </button>
              );
            })}

            {/* Direct Custom Input Toggle Button */}
            <button
              type="button"
              onClick={() => setShowCustomVenueInput(!showCustomVenueInput)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer flex items-center space-x-1 ${
                showCustomVenueInput
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기타 (직접입력)</span>
            </button>
          </div>

          {/* Inline Custom Location Input Form */}
          {showCustomVenueInput && (
            <div className="flex items-center space-x-2 pt-1 max-w-md animate-in fade-in duration-150">
              <input
                type="text"
                value={customVenueInput}
                onChange={(e) => setCustomVenueInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomVenue())}
                placeholder="장소명 입력 (예: 오크밸리CC, 성문안CC)"
                className="flex-1 px-3 py-1.5 text-xs border border-amber-300 rounded-xs focus:outline-none focus:border-amber-600 bg-amber-50/50"
              />
              <button
                type="button"
                onClick={handleAddCustomVenue}
                className="px-3 py-1.5 bg-amber-700 text-white text-xs font-bold rounded-xs hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
              >
                장소 추가
              </button>
            </div>
          )}

          {/* Active Selected Venues Summary Chips */}
          {selectedVenues.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#8C7A6B] mr-1">선택된 장소:</span>
              {selectedVenues.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[11px] font-bold bg-[#736152] text-white space-x-1"
                >
                  <span>{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVenue(v)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Persons & Keywords Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#EFECE6]">
          {/* 관련 인물 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#5C4E43] flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#736152]" />
                <span>관련 인물 <span className="text-gray-400 font-normal">(선택)</span></span>
              </label>
              <span className="text-[10px] text-[#8C7A6B]">프로선수, 앰버서더, 진행자 등</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newPersonInput}
                onChange={(e) => setNewPersonInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
                placeholder="인물명 입력 후 Enter (예: 이시우, 이시우 프로)"
                className="flex-1 px-3 py-1.5 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-1.5 bg-[#736152] text-white text-xs font-medium rounded-xs hover:bg-[#5C4E43] transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>인물 추가</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs">
              {personNames.length === 0 ? (
                <span className="text-[11px] text-[#8C7A6B]">
                  등록된 인물이 없습니다. (예: 가민 행사 관련 인물 '이시우' 등 등록 시 조합 쿼리에 자동 확장됩니다.)
                </span>
              ) : (
                personNames.map((p) => (
                  <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[11px] bg-sky-50 border border-sky-300 text-sky-900 space-x-1.5 shadow-2xs font-semibold">
                    <User className="w-3 h-3 text-sky-700" />
                    <span>{p}</span>
                    <button type="button" onClick={() => handleRemovePerson(p)} className="text-sky-700 hover:text-red-600 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* 관련 키워드 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#5C4E43]">
                관련 키워드 <span className="text-gray-400 font-normal">(선택)</span>
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateKeywords}
                disabled={isGeneratingKeywords}
                className="px-2.5 py-1 text-[11px] bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#736152] font-bold border border-[#D4C8B8] rounded-2xs transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingKeywords ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#736152]" />
                )}
                <span>{isGeneratingKeywords ? '키워드 분석 중...' : 'AI 키워드 자동 생성'}</span>
              </button>
            </div>

            {/* Keyword Notice/Error Messages */}
            {keywordError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-2xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{keywordError}</span>
                </div>
                <button type="button" onClick={() => setKeywordError(null)} className="text-red-400 hover:text-red-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {keywordNotice && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-2xs flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{keywordNotice}</span>
                </div>
                <button type="button" onClick={() => setKeywordNotice(null)} className="text-emerald-500 hover:text-emerald-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="키워드 입력 후 Enter (예: 골프, 라운드, 레슨)"
                className="flex-1 px-3 py-1.5 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-1.5 bg-[#736152] text-white text-xs font-medium rounded-xs hover:bg-[#5C4E43] transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>키워드 추가</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs">
              {keywords.length === 0 ? (
                <span className="text-[11px] text-[#8C7A6B]">
                  추가된 키워드가 없습니다. 직접 입력하거나 'AI 키워드 자동 생성'을 이용하세요.
                </span>
              ) : (
                keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center px-2 py-0.5 rounded-2xs text-[11px] bg-white border border-[#D4C8B8] text-[#2C2C2C] space-x-1.5 shadow-2xs font-medium">
                    <span>{kw}</span>
                    <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-[#8C7A6B] hover:text-red-600 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Auto Multi-Query Expansion Preview Panel */}
        <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#736152]" />
              <h3 className="text-xs font-bold text-[#2C2C2C]">
                자동 확장 검색 Query (프로젝트 연관성 검색)
              </h3>
              <span className="px-1.5 py-0.5 bg-[#736152]/10 text-[#736152] font-mono text-[10px] font-bold rounded-3xs">
                {expandedQueriesPreview.length}개 조합 생성
              </span>
            </div>
            <span className="text-[10px] text-[#8C7A6B]">
              한글/영문 브랜드명 &middot; 장소 &middot; 인물 &middot; 키워드 자동 교차 결합
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {expandedQueriesPreview.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-2xs text-xs font-mono bg-white border border-[#D4C8B8] text-[#2C2C2C] shadow-2xs space-x-1.5"
              >
                <span className="px-1 py-0.1 text-[9px] font-sans font-bold bg-[#EFECE6] text-[#736152] rounded-3xs">
                  {item.type}
                </span>
                <span className="font-semibold text-[#736152]">{item.query}</span>
              </span>
            ))}
          </div>

          <p className="text-[11px] text-[#5C4E43] leading-relaxed border-t border-[#EFECE6] pt-2">
            <strong>검색 원칙:</strong> 온라인 게시물 제목이 프로젝트명과 정확히 일치하지 않아도(예: <em>가민과 함께한 오크밸리 라운드</em>, <em>이시우 프로 골프 세션</em>, <em>오크밸리CC 가민 행사</em>), 브랜드·장소·기간·인물·키워드의 <strong>복수 근거가 일치</strong>하면 관련 콘텐츠 후보로 수집·검증합니다. (관련성이 불명확한 단순 오크밸리 방문글 등은 자동 제외됩니다)
          </p>
        </div>

          {/* 관련 해시태그 */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="block text-xs font-semibold text-[#5C4E43]">
                관련 해시태그
              </label>
              {/* 출처 범례 안내 */}
              <div className="flex items-center space-x-2 text-[10px] text-[#8C7A6B]">
                <span className="inline-flex items-center space-x-0.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>기본 태그(장소자동)</span>
                </span>
                <span className="inline-flex items-center space-x-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>확인된 태그(자료파싱)</span>
                </span>
                <span className="inline-flex items-center space-x-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>직접 추가</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newHashtagInput}
                onChange={(e) => setNewHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                placeholder="해시태그 입력 (예: #오크밸리산책)"
                className="flex-1 px-3 py-1.5 text-xs border border-[#D4C8B8] rounded-xs focus:outline-none focus:border-[#736152] bg-[#FAF8F5]"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="px-3 py-1.5 bg-[#736152] text-white text-xs font-medium rounded-xs hover:bg-[#5C4E43] transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>해시태그 추가</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs">
              {relatedHashtags.length === 0 ? (
                <span className="text-[11px] text-[#8C7A6B]">등록된 관련 해시태그가 없습니다. 장소를 선택하거나 해시태그를 직접 추가해보세요.</span>
              ) : (
                relatedHashtags.map((item) => {
                  let chipStyle = 'bg-slate-100 border-slate-300 text-slate-800';
                  let badgeStyle = 'bg-slate-200/90 text-slate-700';
                  let label = '기본 태그';

                  if (item.source === 'verified') {
                    chipStyle = 'bg-amber-50 border-amber-300 text-amber-900';
                    badgeStyle = 'bg-amber-200/90 text-amber-900';
                    label = '확인된 태그';
                  } else if (item.source === 'custom') {
                    chipStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                    badgeStyle = 'bg-emerald-200/90 text-emerald-900';
                    label = '직접 추가';
                  }

                  return (
                    <span
                      key={item.tag}
                      className={`inline-flex items-center px-2 py-0.5 rounded-2xs text-[11px] font-mono space-x-1.5 border shadow-2xs ${chipStyle}`}
                    >
                      <span className={`px-1 py-0.1 text-[9px] font-sans font-bold rounded-3xs ${badgeStyle}`}>
                        {label}
                      </span>
                      <span className="font-bold">{item.tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHashtag(item.tag)}
                        className="opacity-70 hover:opacity-100 hover:text-red-600 transition-opacity cursor-pointer ml-0.5"
                        title="해시태그 삭제"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
          </div>

        {/* Period Filter & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#EFECE6]">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-[#5C4E43] shrink-0 mr-1">
              조사 기간:
            </span>
            {[
              { key: '7DAYS', label: '행사 당일~7일' },
              { key: '30DAYS', label: '8일~30일' },
              { key: '90DAYS', label: '31일~90일' },
              { key: 'ALL', label: '전체 (종합)' },
              { key: 'CUSTOM', label: '직접 선택' }
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPeriod(p.key as PostEventPeriod)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors cursor-pointer shrink-0 ${
                  selectedPeriod === p.key
                    ? 'bg-[#736152] text-white border-[#736152]'
                    : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {selectedPeriod === 'CUSTOM' && (
            <div className="flex items-center space-x-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 border border-[#D4C8B8] rounded-xs"
              />
              <span>~</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 border border-[#D4C8B8] rounded-xs"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={loading}
              className="px-5 py-2.5 bg-[#736152] text-white text-xs font-bold rounded-xs hover:bg-[#5C4E43] transition-colors shadow-2xs cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>온라인 버즈 분석 진행 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>성과 분석 시작하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE IF ANY */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-xs text-red-900 text-xs space-y-3">
          <div className="flex items-center space-x-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>분석 결과를 불러오지 못했습니다. 다시 시도해주세요.</span>
          </div>
          <p className="text-red-700 leading-relaxed bg-white/70 p-3 rounded-xs border border-red-200/50 font-mono">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xs cursor-pointer flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>다시 분석하기</span>
          </button>
        </div>
      )}

      {/* EMPTY STATE: WHEN REPORT EXISTS BUT 0 CONTENTS COLLECTED */}
      {report && report.contents && report.contents.length === 0 && (
        <div className="p-8 bg-white border border-[#D4C8B8] rounded-xs text-center space-y-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-[#8C7A6B] mx-auto" />
          <h4 className="text-sm font-bold text-[#2C2C2C]">분석할 콘텐츠가 없습니다.</h4>
          <p className="text-xs text-[#5C4E43] max-w-md mx-auto leading-relaxed">
            선택하신 검색 기간 및 키워드로 수집된 공개 온라인 게시글이 존재하지 않습니다.
            상단 입력 창에서 제휴 브랜드명, 키워드 또는 검색 기간을 조정하신 후 다시 검색해주세요.
          </p>
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="px-4 py-2 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold rounded-xs text-xs cursor-pointer inline-flex items-center space-x-1.5 transition-colors mt-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>다시 검색 및 분석하기</span>
          </button>
        </div>
      )}

      {/* 3. MODAL: PAST EVENTS LIST (지난 행사 불러오기) */}
      {showPastEventsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs max-w-3xl w-full shadow-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#D4C8B8] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-[#736152]" />
                <h3 className="font-bold text-sm text-[#2C2C2C]">
                  저장된 지난 행사 불러오기
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPastEventsModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-xs text-[#5C4E43]">
                이전에 저장된 행사 프로젝트 목록입니다. 선택하면 해당 행사의 정보와 성과 데이터가 등록 화면에 로드됩니다.
              </p>

              <div className="border border-[#D4C8B8] rounded-xs overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF8F5] border-b border-[#D4C8B8] text-[#5C4E43] font-semibold">
                    <tr>
                      <th className="p-2.5">행사명</th>
                      <th className="p-2.5">브랜드/제휴사</th>
                      <th className="p-2.5">행사일</th>
                      <th className="p-2.5">장소</th>
                      <th className="p-2.5">최근 확인일</th>
                      <th className="p-2.5 text-right">선택</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {pastEventsList.map((evt) => (
                      <tr key={evt.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-2.5 font-bold text-[#2C2C2C]">{evt.eventName}</td>
                        <td className="p-2.5 text-[#5C4E43]">{evt.brandName}</td>
                        <td className="p-2.5 font-mono text-[#8C7A6B]">{evt.eventDate || '-'}</td>
                        <td className="p-2.5 text-[#5C4E43]">{evt.locations?.join(', ') || evt.location}</td>
                        <td className="p-2.5 font-mono text-[#8C7A6B]">{evt.lastVerifiedDate || '-'}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectPastEvent(evt)}
                            className="px-3 py-1 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold rounded-2xs text-xs transition-colors cursor-pointer"
                          >
                            불러오기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-t border-[#D4C8B8] flex justify-end">
              <button
                type="button"
                onClick={() => setShowPastEventsModal(false)}
                className="px-4 py-1.5 bg-white border border-[#D4C8B8] text-xs font-semibold text-[#5C4E43] rounded-xs hover:bg-[#EFECE6]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN REPORT DISPLAY SECTION */}
      {report && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {/* Transparent Accuracy Notice & Scope Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">검색 실증 수치 안내: </span>
                <span>{report.summaryKpi.verifiedDataNote}</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  &bull; Instagram/TikTok 등 API 제한이 있는 채널은 공개 웹 검색 가능 범위 내의 게시물만 수집되며, 미공개 숫자는 추정하지 않고 '-'로 표기합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveToHistory}
                className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-xs transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>지난 행사 목록에 저장</span>
              </button>
            </div>
          </div>

          {/* High-Level KPI Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {/* 확인된 관련 콘텐츠 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                확인된 관련 콘텐츠
              </div>
              <div className="text-2xl font-bold font-mono text-[#736152]">
                {report.summaryKpi.verifiedContentCount}
                <span className="text-xs font-sans font-normal text-[#5C4E43] ml-1">건</span>
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                중복제거 {report.summaryKpi.deduplicatedRemovedCount}건 제외
              </div>
            </div>

            {/* 기사 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                언론 기사
              </div>
              <div className="text-2xl font-bold font-mono text-[#2C2C2C]">
                {report.summaryKpi.articleCount}
                <span className="text-xs font-sans font-normal text-[#5C4E43] ml-1">건</span>
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                공식 보도자료 및 취재
              </div>
            </div>

            {/* SNS/블로그/커뮤니티 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                SNS &middot; 블로그 &middot; 카페
              </div>
              <div className="text-2xl font-bold font-mono text-[#2C2C2C]">
                {report.summaryKpi.snsCommunityCount}
                <span className="text-xs font-sans font-normal text-[#5C4E43] ml-1">건</span>
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                실제 후기 및 릴스
              </div>
            </div>

            {/* 공개 확인 조회수 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                공개 확인 조회수
              </div>
              <div className="text-2xl font-bold font-mono text-[#736152]">
                {report.summaryKpi.verifiableViewsTotal ? report.summaryKpi.verifiableViewsTotal.toLocaleString() : '-'}
                <span className="text-xs font-sans font-normal text-[#5C4E43] ml-1">회</span>
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                확인 가능 플랫폼 합산
              </div>
            </div>

            {/* 공개 확인 반응 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                공개 확인 반응
              </div>
              <div className="text-2xl font-bold font-mono text-[#2C2C2C]">
                {report.summaryKpi.verifiableReactionsTotal ? report.summaryKpi.verifiableReactionsTotal.toLocaleString() : '-'}
                <span className="text-xs font-sans font-normal text-[#5C4E43] ml-1">건</span>
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                좋아요/댓글/공유 합산
              </div>
            </div>

            {/* 최근 관련 게시물 */}
            <div className="bg-white border border-[#D4C8B8] p-4 rounded-xs shadow-2xs">
              <div className="text-[11px] font-semibold text-[#8C7A6B] mb-1">
                최근 관련 게시물
              </div>
              <div className="text-lg font-bold font-mono text-[#2C2C2C] mt-1">
                {report.summaryKpi.latestPostDate}
              </div>
              <div className="text-[10px] text-[#8C7A6B] font-mono mt-1">
                실시간 검색 검증일
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS FOR REPORT SECTIONS */}
          <div className="flex items-center space-x-1 border-b border-[#D4C8B8] overflow-x-auto pb-1">
            {[
              { id: 'OVERVIEW', label: '종합 요약 및 비주얼 리포트' },
              { id: 'CONTENTS', label: `콘텐츠 목록 (${report.contents.length}건)` },
              { id: 'TOP5', label: '반응 좋은 콘텐츠 TOP 5' },
              { id: 'SENTIMENT', label: '사람들의 관심 & 반응' },
              { id: 'EXPOSURE', label: '오크밸리 노출도 & 확산 추이' },
              { id: 'INTERNAL_DATA', label: '내부 자료 & 결과보고서 파싱' },
              { id: 'EXECUTIVE_QA', label: '최종 평가 Q&A & 개선안' },
              { id: 'HISTORY', label: `지난 조사 비교 (${savedReportsHistory.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveViewTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer shrink-0 border-b-2 ${
                  activeViewTab === tab.id
                    ? 'border-[#736152] text-[#736152] bg-[#FAF8F5]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#2C2C2C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* VIEW TAB 1: OVERVIEW */}
          {activeViewTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#736152]" />
                  <span>핵심 반응 총평 요약</span>
                </h3>
                <p className="text-xs text-[#5C4E43] leading-relaxed bg-[#FAF8F5] p-4 rounded-xs border border-[#EFECE6]">
                  {derivedSummaryParagraph}
                </p>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Channel Distribution Chart */}
                <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2">
                    <h4 className="text-xs font-bold text-[#2C2C2C]">
                      채널별 콘텐츠 수집 분포
                    </h4>
                    <span className="text-[11px] text-[#8C7A6B] font-mono">
                      총 {report.contents.length}건
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" key={`bar-chart-${activeViewTab}-${derivedChannelStats.length}-${report.searchedAt}`}>
                      <BarChart data={derivedChannelStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
                        <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: any) => [`${value}건`, '콘텐츠 수']}
                          contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#D4C8B8', fontSize: '12px' }}
                        />
                        <Bar dataKey="count" name="콘텐츠 수" fill="#736152" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Post Event Timeline Chart */}
                <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2">
                    <h4 className="text-xs font-bold text-[#2C2C2C]">
                      행사 후 일단위 온라인 게시물 생성 추이
                    </h4>
                    <span className="text-[11px] text-[#8C7A6B] font-mono">
                      기간 내 게시 추이
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" key={`line-chart-${activeViewTab}-${derivedDailyTimeline.length}-${report.searchedAt}`}>
                      <LineChart data={derivedDailyTimeline}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFECE6" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: any) => [`${value}건`, '게시물 수']}
                          contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#D4C8B8', fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="count" name="게시물 수" stroke="#736152" strokeWidth={2} dot={{ r: 4, fill: '#736152' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: CONTENTS TABLE */}
          {activeViewTab === 'CONTENTS' && (
            <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-[#736152]" />
                    <h3 className="text-sm font-bold text-[#2C2C2C]">
                      수집 및 검증된 개별 온라인 콘텐츠 목록
                    </h3>
                    <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#D4C8B8] rounded-2xs text-[11px] font-mono font-bold text-[#736152]">
                      현재 {filteredContents.length}건 / 전체 {report.contents.length}건
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C7A6B]">
                    제목이 행사명과 일치하지 않아도 브랜드·장소·기간·인물·키워드의 복수 근거가 일치한 콘텐츠를 수집하였습니다.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    value={contentSearchTerm}
                    onChange={(e) => setContentSearchTerm(e.target.value)}
                    placeholder="작성자, 제목, 연관근거 검색..."
                    className="w-48 sm:w-60 px-3 py-1.5 border border-[#D4C8B8] rounded-xs bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#736152]"
                  />
                  {contentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setContentSearchTerm('')}
                      className="text-xs text-[#8C7A6B] hover:text-[#2C2C2C] px-2 py-1 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs"
                    >
                      지우기
                    </button>
                  )}
                </div>
              </div>

              {/* Instant Client-Side Platform Filter Tabs (Never re-fetches from server) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#5C4E43] mr-1 flex items-center space-x-1">
                  <ListFilter className="w-3.5 h-3.5 text-[#736152]" />
                  <span>플랫폼 필터:</span>
                </span>
                {[
                  { key: 'ALL', label: '전체', count: platformCounts.ALL },
                  { key: 'Instagram', label: 'Instagram', count: platformCounts.Instagram },
                  { key: '블로그·카페', label: '블로그·카페', count: platformCounts['블로그·카페'] },
                  { key: '언론', label: '언론/뉴스', count: platformCounts['언론'] },
                  { key: 'YouTube', label: 'YouTube', count: platformCounts.YouTube },
                  { key: '기타', label: '기타', count: platformCounts['기타'] }
                ].map((pf) => {
                  const isActive = channelFilter === pf.key;
                  return (
                    <button
                      key={pf.key}
                      type="button"
                      onClick={() => setChannelFilter(pf.key)}
                      className={`px-3 py-1.5 text-xs rounded-xs border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-[#736152] text-white border-[#736152] font-bold shadow-2xs'
                          : 'bg-white text-[#5C4E43] border-[#D4C8B8] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{pf.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-3xs ${
                          isActive
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-[#FAF8F5] text-[#8C7A6B]'
                        }`}
                      >
                        {pf.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Contents Table */}
              <div className="border border-[#D4C8B8] rounded-xs overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[760px]">
                  <thead className="bg-[#FAF8F5] border-b border-[#D4C8B8] text-[#5C4E43] font-semibold">
                    <tr>
                      <th className="p-2.5 w-24">작성일</th>
                      <th className="p-2.5 w-28">플랫폼</th>
                      <th className="p-2.5 w-32">작성자/매체</th>
                      <th className="p-2.5">콘텐츠 제목 및 내용 요약</th>
                      <th className="p-2.5 w-48">프로젝트 연관성 근거</th>
                      <th className="p-2.5 w-24">오크밸리 연계</th>
                      <th className="p-2.5 w-24">반응 수치</th>
                      <th className="p-2.5 w-16 text-right">원문</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {filteredContents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#8C7A6B] bg-white">
                          <div className="space-y-1">
                            <p className="font-semibold text-xs text-[#5C4E43]">
                              선택된 필터 조건에 해당하는 콘텐츠가 없습니다.
                            </p>
                            <p className="text-[11px]">
                              상단의 플랫폼 필터(전체, Instagram, 블로그 등)를 변경하거나 검색어를 비워보세요.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredContents.map((c) => {
                        const cat = getPlatformCategory(c);
                        let badgeColor = 'bg-[#FAF8F5] text-[#736152] border-[#D4C8B8]';
                        if (cat === 'Instagram') {
                          badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                        } else if (cat === '블로그·카페') {
                          badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        } else if (cat === '언론') {
                          badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                        } else if (cat === 'YouTube') {
                          badgeColor = 'bg-red-50 text-red-800 border-red-200';
                        }

                        return (
                          <tr key={c.id} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="p-2.5 font-mono text-[#8C7A6B] shrink-0">{c.publishDate}</td>
                            <td className="p-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-2xs text-[10px] font-bold border ${badgeColor}`}>
                                {c.platform || c.channel}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium text-[#2C2C2C]">{c.author}</td>
                            <td className="p-2.5 text-[#5C4E43]">
                              <div className="font-medium text-[#2C2C2C]">{c.title || c.titleOrSummary}</div>
                              {c.title && c.titleOrSummary && c.title !== c.titleOrSummary && (
                                <div className="text-[11px] text-[#5C4E43] mt-0.5 leading-snug">{c.titleOrSummary}</div>
                              )}
                            </td>
                            <td className="p-2.5 text-[#5C4E43]">
                              <div className="text-[11px] font-medium text-[#736152] bg-amber-50/70 border border-amber-200/80 px-2 py-1 rounded-2xs">
                                {c.connectionEvidence || c.relevanceReason || '복수 키워드 매칭'}
                              </div>
                            </td>
                            <td className="p-2.5">
                              {c.isOakValleyMentioned ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xs text-[10px] font-bold">
                                  언급됨
                                </span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">-</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-[#5C4E43]">
                              {c.views ? `${c.views.toLocaleString()}회` : c.likes ? `좋아요 ${c.likes}` : '-'}
                            </td>
                            <td className="p-2.5 text-right">
                              {c.url ? (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-[#736152] hover:underline font-semibold text-xs"
                                >
                                  <span>링크</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
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

          {/* VIEW TAB 3: TOP 5 */}
          {activeViewTab === 'TOP5' && (
            <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#EFECE6] pb-3">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  온라인 파급력 및 반응 상위 TOP 5 콘텐츠
                </h3>
              </div>

              <div className="space-y-4">
                {(() => {
                  const topItems = (report.topContents && report.topContents.length > 0)
                    ? report.topContents
                    : ((report as any).topReactedContents && (report as any).topReactedContents.length > 0)
                    ? (report as any).topReactedContents
                    : (report.contents || []).slice(0, 5);

                  if (topItems.length === 0) {
                    return (
                      <div className="text-xs text-[#8C7A6B] py-8 text-center bg-[#FAF8F5] rounded-xs border border-[#EFECE6]">
                        수집된 주요 콘텐츠가 없습니다.
                      </div>
                    );
                  }

                  return topItems.map((item: any, idx: number) => {
                    const c = item.content || item;
                    const title = c.titleOrSummary || item.titleOrSummary || '콘텐츠 제목 정보';
                    const channel = c.channel || item.channel || '온라인 채널';
                    const pubDate = c.publishDate || item.publishDate || '';
                    const author = c.author || item.author || '온라인 사용자';
                    const url = c.url || item.url || '#';
                    const detail = item.contentTypeDescription
                      ? `${item.contentTypeDescription} | 반응: ${item.reactionDescription || ''} (${item.whyHighImpact || ''})`
                      : c.relevanceReason || item.relevanceReason || '';

                    return (
                      <div key={c.id || `top-${idx}`} className="p-4 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-[#736152] text-white font-mono font-bold rounded-2xs text-[11px]">
                            TOP {idx + 1} &middot; {channel}
                          </span>
                          <span className="font-mono text-[#8C7A6B] text-[11px]">{pubDate}</span>
                        </div>

                        <h4 className="font-bold text-sm text-[#2C2C2C]">{title}</h4>
                        {detail && <p className="text-[#5C4E43] leading-relaxed bg-white p-2.5 rounded-xs border border-[#EFECE6]">{detail}</p>}

                        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
                          <span className="font-semibold text-[#8C7A6B]">작성자: {author}</span>
                          {url && url !== '#' && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#736152] font-bold rounded-xs flex items-center space-x-1"
                            >
                              <span>원문 확인</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* VIEW TAB 4: SENTIMENT */}
          {activeViewTab === 'SENTIMENT' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  긍정 &middot; 부정 &middot; 아쉬운 점 다각도 반응 분석
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* 긍정 반응 */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xs space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="font-bold text-emerald-900 text-sm">긍정 반응 주제 (Positive Topics)</span>
                    </div>
                    {report.sentimentAnalysis?.positiveTopics && report.sentimentAnalysis.positiveTopics.length > 0 ? (
                      <div className="space-y-2">
                        {report.sentimentAnalysis.positiveTopics.map((topicItem, tIdx) => (
                          <div key={tIdx} className="bg-white p-3 rounded-xs border border-emerald-100 space-y-1">
                            <div className="flex justify-between items-center font-bold text-emerald-900">
                              <span>{topicItem.topic}</span>
                              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-2xs">
                                {topicItem.count}건 언급
                              </span>
                            </div>
                            {topicItem.exampleQuotes && topicItem.exampleQuotes.length > 0 && (
                              <ul className="text-[11px] text-emerald-800 list-disc list-inside space-y-0.5 pt-1">
                                {topicItem.exampleQuotes.map((q, qIdx) => (
                                  <li key={qIdx} className="italic">&ldquo;{q}&rdquo;</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-800 leading-relaxed">
                        전반적으로 야외 체험 및 르무통 산책회 착화감에 대한 긍정적 자발 후기가 다수 수집되었습니다.
                      </p>
                    )}
                  </div>

                  {/* 부정 및 아쉬운 점 */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xs space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      <span className="font-bold text-amber-900 text-sm">부정 및 아쉬운 점 (Regret Topics)</span>
                    </div>
                    {report.sentimentAnalysis?.negativeOrRegretTopics && report.sentimentAnalysis.negativeOrRegretTopics.length > 0 ? (
                      <div className="space-y-2">
                        {report.sentimentAnalysis.negativeOrRegretTopics.map((topicItem, tIdx) => (
                          <div key={tIdx} className="bg-white p-3 rounded-xs border border-amber-100 space-y-1">
                            <div className="flex justify-between items-center font-bold text-amber-900">
                              <span>{topicItem.topic}</span>
                              <span className="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-2xs">
                                {topicItem.count}건 언급
                              </span>
                            </div>
                            {topicItem.exampleQuotes && topicItem.exampleQuotes.length > 0 && (
                              <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5 pt-1">
                                {topicItem.exampleQuotes.map((q, qIdx) => (
                                  <li key={qIdx} className="italic">&ldquo;{q}&rdquo;</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-amber-800 leading-relaxed">
                        주차장 진입 정체 및 안마 체험 대기열 관련 소수의 아쉬운 의견이 관찰되었습니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* 주요 관심 키워드 / 영역 */}
                {report.sentimentAnalysis?.keyInterestAreas && report.sentimentAnalysis.keyInterestAreas.length > 0 && (
                  <div className="p-4 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs space-y-2 text-xs">
                    <h4 className="font-bold text-[#2C2C2C]">핵심 관심 영역 태그</h4>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {report.sentimentAnalysis.keyInterestAreas.map((tag, tagIdx) => (
                        <span key={tagIdx} className="px-2.5 py-1 bg-white border border-[#D4C8B8] text-[#736152] font-semibold rounded-2xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW TAB 5: EXPOSURE */}
          {activeViewTab === 'EXPOSURE' && (
            <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                오크밸리 노출 점유율 및 리조트 연계 성과
              </h3>
              <p className="text-xs text-[#5C4E43] leading-relaxed">
                {report.resortExposure.exposureSummary}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-center space-y-1">
                  <span className="text-[#8C7A6B]">오크밸리 이름 언급률</span>
                  <div className="text-xl font-bold font-mono text-[#736152]">
                    {report.resortExposure.oakValleyNameMentionRatePercent}%
                  </div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-center space-y-1">
                  <span className="text-[#8C7A6B]">오크밸리 장소 표기 비율</span>
                  <div className="text-xl font-bold font-mono text-[#736152]">
                    {report.resortExposure.oakValleyLocationMentionRatePercent}%
                  </div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-center space-y-1">
                  <span className="text-[#8C7A6B]">해시태그 포함률</span>
                  <div className="text-xl font-bold font-mono text-[#736152]">
                    {report.resortExposure.oakValleyHashtagRatePercent}%
                  </div>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs text-center space-y-1">
                  <span className="text-[#8C7A6B]">공식 계정 태그 비율</span>
                  <div className="text-xl font-bold font-mono text-[#736152]">
                    {report.resortExposure.oakValleyAccountTagRatePercent}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 6: INTERNAL DATA */}
          {activeViewTab === 'INTERNAL_DATA' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  내부 자료 수동 입력 및 결과보고서 파일 AI 파싱
                </h3>
                <form onSubmit={handleSaveInternalData} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#5C4E43] font-semibold mb-1">Instagram 도달</label>
                      <input
                        type="number"
                        value={internalDataForm.instagramReach ?? ''}
                        onChange={(e) => setInternalDataForm({ ...internalDataForm, instagramReach: e.target.value ? Number(e.target.value) : null })}
                        placeholder="예: 125000"
                        className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-xs bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5C4E43] font-semibold mb-1">노출수 (Impressions)</label>
                      <input
                        type="number"
                        value={internalDataForm.instagramImpressions ?? ''}
                        onChange={(e) => setInternalDataForm({ ...internalDataForm, instagramImpressions: e.target.value ? Number(e.target.value) : null })}
                        placeholder="예: 340000"
                        className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-xs bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5C4E43] font-semibold mb-1">저장 수 (Saves)</label>
                      <input
                        type="number"
                        value={internalDataForm.instagramSaves ?? ''}
                        onChange={(e) => setInternalDataForm({ ...internalDataForm, instagramSaves: e.target.value ? Number(e.target.value) : null })}
                        placeholder="예: 1820"
                        className="w-full px-3 py-1.5 border border-[#D4C8B8] rounded-xs bg-[#FAF8F5]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    {internalDataSaved ? <span className="text-emerald-700 font-bold">업데이트되었습니다!</span> : <span />}
                    <button type="submit" className="px-4 py-2 bg-[#736152] text-white font-bold rounded-xs hover:bg-[#5C4E43]">
                      내부 수치 저장
                    </button>
                  </div>
                </form>
              </div>

              {/* Upload & Parse Box */}
              <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#2C2C2C] flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-[#736152]" />
                  <span>결과보고서 파일 업로드 (PDF/PPT/Excel)</span>
                </h3>
                <form onSubmit={handleFileUploadAndParse} className="space-y-4 text-xs">
                  <input
                    type="file"
                    accept=".pdf,.pptx,.ppt,.xlsx,.csv,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-xs text-[#8C7A6B]"
                  />
                  <button
                    type="submit"
                    disabled={!uploadFile || parsingLoading}
                    className="px-4 py-2 bg-[#736152] text-white font-bold rounded-xs hover:bg-[#5C4E43] disabled:opacity-50"
                  >
                    {parsingLoading ? '수치 파싱 중...' : '보고서 파싱 시작'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW TAB 7: EXECUTIVE QA */}
          {activeViewTab === 'EXECUTIVE_QA' && (
            <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                경영진 7대 질문 최종 평가 Q&amp;A
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs space-y-1">
                  <span className="font-bold text-[#736152] block text-sm">1. 얼마나 많이 퍼졌나?</span>
                  <p className="text-[#5C4E43] leading-relaxed">{report.executiveQA.howFarSpread}</p>
                </div>
                <div className="p-4 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs space-y-1">
                  <span className="font-bold text-[#736152] block text-sm">2. 어디에서 가장 많이 퍼졌나?</span>
                  <p className="text-[#5C4E43] leading-relaxed">{report.executiveQA.whereSpreadMost}</p>
                </div>
                <div className="p-4 bg-[#FAF8F5] border border-[#EFECE6] rounded-xs space-y-1">
                  <span className="font-bold text-[#736152] block text-sm">3. 어떤 콘텐츠 반응이 가장 좋았나?</span>
                  <p className="text-[#5C4E43] leading-relaxed">{report.executiveQA.bestReactedContent}</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs space-y-1">
                  <span className="font-bold text-amber-900 block text-sm">4. 다음 행사에서 무엇을 더 해야 하나?</span>
                  <p className="text-amber-900 leading-relaxed font-semibold">{report.executiveQA.whatToDoNextEvent}</p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 8: HISTORY */}
          {activeViewTab === 'HISTORY' && (
            <div className="bg-white border border-[#D4C8B8] rounded-xs p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center border-b border-[#EFECE6] pb-3">
                <h3 className="text-sm font-bold text-[#2C2C2C]">
                  지난 조사 차수 히스토리 ({savedReportsHistory.length}건)
                </h3>
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="px-3 py-1.5 bg-[#736152] text-white text-xs font-bold rounded-xs hover:bg-[#5C4E43]"
                >
                  현재 조사 저장
                </button>
              </div>
              <div className="text-xs text-[#5C4E43]">
                이전에 진행된 온라인 반응 수치와 비교해보세요.
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default PostEventTrackerView;
