import {
  PartnerConditionLineItem,
  BarterPlan,
  PartnerConditionHistory,
  FileUploadComparison,
} from '../types';

const STORAGE_KEYS = {
  LINE_ITEMS: 'oakvalley_partner_line_items_v3',
  BARTER_PLANS: 'oakvalley_barter_plans_v3',
  HISTORIES: 'oakvalley_partner_histories_v3',
};

// --- INITIAL SEED DATA FOR DEMO & TESTING ---
const INITIAL_LINE_ITEMS: PartnerConditionLineItem[] = [
  // 1. 아디다스 코리아 - 2026 오크밸리 웰니스 팝업
  {
    id: 'item-ad-1',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '밸리빌리지 잔디광장 팝업 공간 대여',
    provider: 'IPARK리조트',
    category: '객실',
    quantityPeriod: '2일',
    quantityNum: 2,
    unitPrice: 5000000,
    normalPrice: 5000000,
    recognizedPrice: 0, // 100% 무상지원
    costPrice: 500000,
    totalAmount: 0,
    notes: '메인 팝업스토어 및 체험존 2일 무상 지원',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'item-ad-2',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '밸리빌리지 노블 31평형 객실',
    provider: 'IPARK리조트',
    category: '객실',
    quantityPeriod: '10실 1박',
    quantityNum: 10,
    unitPrice: 350000,
    normalPrice: 350000,
    recognizedPrice: 150000, // 실당 15만원 제휴가
    costPrice: 90000,
    totalAmount: 1500000,
    notes: '행사 스태프 및 VIP 투숙 지원',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'item-ad-3',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '빌리지센터 DID 스크린 미디어 광고',
    provider: 'IPARK리조트',
    category: '홍보',
    quantityPeriod: '1주',
    quantityNum: 1,
    unitPrice: 3000000,
    normalPrice: 3000000,
    recognizedPrice: 1000000,
    costPrice: 100000,
    totalAmount: 1000000,
    notes: '브랜드 미디어 영상 1주 송출',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'item-ad-4',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '행사 협찬 현물 (러닝화 & 아웃도어 의류)',
    provider: '파트너',
    category: '현물',
    quantityPeriod: '300개',
    quantityNum: 300,
    unitPrice: 100000,
    normalPrice: 100000,
    recognizedPrice: 70000, // 70% 인정가
    costPrice: 50000,
    totalAmount: 21000000,
    notes: '참가자 기프트팩 및 경품 현물 지원',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'item-ad-5',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '팝업 운영 및 홍보 현금 지원',
    provider: '파트너',
    category: '현금',
    quantityPeriod: '1식',
    quantityNum: 1,
    unitPrice: 10000000,
    normalPrice: 10000000,
    recognizedPrice: 10000000,
    costPrice: 0,
    totalAmount: 10000000,
    notes: '현금 direct 지원',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'item-ad-6',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    itemName: '임직원/클럽 연계 객실 보장매출',
    provider: '파트너',
    category: '보장매출',
    quantityPeriod: '30실',
    quantityNum: 30,
    unitPrice: 200000,
    normalPrice: 200000,
    recognizedPrice: 200000,
    costPrice: 100000,
    totalAmount: 6000000,
    notes: '아디다스 클럽 멤버 객실 예약 보장',
    isActive: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },

  // 2. 야놀자 - 2026 단풍 시즌 단독 스페셜 딜
  {
    id: 'item-yn-1',
    partnerName: '야놀자',
    projectName: '2026 단풍 시즌 단독 스페셜 딜',
    itemName: '단풍 시즌 객실 패키지 제휴 블록',
    provider: 'IPARK리조트',
    category: '객실',
    quantityPeriod: '100실',
    quantityNum: 100,
    unitPrice: 250000,
    normalPrice: 250000,
    recognizedPrice: 180000,
    costPrice: 80000,
    totalAmount: 18000000,
    notes: '야놀자 단독 할인가 공급',
    isActive: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    id: 'item-yn-2',
    partnerName: '야놀자',
    projectName: '2026 단풍 시즌 단독 스페셜 딜',
    itemName: '앱 메인 배너 & Push 알림 3회',
    provider: '파트너',
    category: '홍보',
    quantityPeriod: '3회',
    quantityNum: 3,
    unitPrice: 5000000,
    normalPrice: 5000000,
    recognizedPrice: 4000000,
    costPrice: 500000,
    totalAmount: 12000000,
    notes: '야놀자 MAU 1천만 타겟 앱 푸시 및 홈 배너 구좌',
    isActive: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    id: 'item-yn-3',
    partnerName: '야놀자',
    projectName: '2026 단풍 시즌 단독 스페셜 딜',
    itemName: '쿠폰 할인 지원금',
    provider: '파트너',
    category: '현금',
    quantityPeriod: '1식',
    quantityNum: 1,
    unitPrice: 5000000,
    normalPrice: 5000000,
    recognizedPrice: 5000000,
    costPrice: 0,
    totalAmount: 5000000,
    notes: '야놀자 자체 마케팅 쿠폰 비용 부담',
    isActive: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
];

const INITIAL_BARTER_PLANS: BarterPlan[] = [
  // 아디다스 코리아 플랜 A/B/C
  {
    id: 'plan-ad-a',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    planName: '협의안 A (현금+현물 균형형)',
    description: '공간 무상 + 현금 1천만원 지원 및 현물 300개 포함 표준 협의안',
    includedItemIds: ['item-ad-1', 'item-ad-2', 'item-ad-3', 'item-ad-4', 'item-ad-5'],
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'plan-ad-b',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    planName: '협의안 B (현물/객실 위주)',
    description: '현금 지원 최소화 + 현물 기프트 확대 및 객실 보장매출 연계안',
    includedItemIds: ['item-ad-1', 'item-ad-2', 'item-ad-4', 'item-ad-6'],
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
  {
    id: 'plan-ad-c',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    planName: '협의안 C (보장매출 강화형)',
    description: '미디어 광고 및 객실 보장매출 중심 극대화 협의안',
    includedItemIds: ['item-ad-1', 'item-ad-3', 'item-ad-5', 'item-ad-6'],
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },

  // 야놀자 플랜
  {
    id: 'plan-yn-a',
    partnerName: '야놀자',
    projectName: '2026 단풍 시즌 단독 스페셜 딜',
    planName: '협의안 A (메인 타겟 배너 구좌 포함)',
    description: '객실 100실 블록 공급 & 야놀자 메인 배너/푸시 지원안',
    includedItemIds: ['item-yn-1', 'item-yn-2', 'item-yn-3'],
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
];

const INITIAL_HISTORIES: PartnerConditionHistory[] = [
  {
    id: 'hist-1',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    lineItemId: 'item-ad-2',
    itemName: '밸리빌리지 노블 31평형 객실',
    fieldChanged: '수량',
    previousValue: '5실 1박',
    newValue: '10실 1박',
    reason: '아디다스 VIP 초청 인원 확대 요청 반영',
    changedAt: '2026-08-05 14:30',
  },
  {
    id: 'hist-2',
    partnerName: '아디다스 코리아',
    projectName: '2026 오크밸리 웰니스 팝업',
    lineItemId: 'item-ad-4',
    itemName: '행사 협찬 현물 (러닝화 & 아웃도어 의류)',
    fieldChanged: '인정과',
    previousValue: '실속가 1,500만원',
    newValue: '70% 인정 2,100만원',
    reason: '소비자가 3,000만원 기준 인정률 70% 소평',
    changedAt: '2026-08-08 10:15',
  },
];

// --- STORE IMPLEMENTATION ---
class PartnerConditionStore {
  private lineItems: PartnerConditionLineItem[] = [];
  private barterPlans: BarterPlan[] = [];
  private histories: PartnerConditionHistory[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEYS.LINE_ITEMS);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.lineItems = parsed;
        } else {
          this.lineItems = [...INITIAL_LINE_ITEMS];
        }
      } else {
        this.lineItems = [...INITIAL_LINE_ITEMS];
      }

      const savedPlans = localStorage.getItem(STORAGE_KEYS.BARTER_PLANS);
      if (savedPlans) {
        const parsed = JSON.parse(savedPlans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.barterPlans = parsed;
        } else {
          this.barterPlans = [...INITIAL_BARTER_PLANS];
        }
      } else {
        this.barterPlans = [...INITIAL_BARTER_PLANS];
      }

      const savedHistories = localStorage.getItem(STORAGE_KEYS.HISTORIES);
      if (savedHistories) {
        const parsed = JSON.parse(savedHistories);
        if (Array.isArray(parsed)) {
          this.histories = parsed;
        } else {
          this.histories = [...INITIAL_HISTORIES];
        }
      } else {
        this.histories = [...INITIAL_HISTORIES];
      }
    } catch (e) {
      console.error('PartnerConditionStore load error:', e);
      this.lineItems = [...INITIAL_LINE_ITEMS];
      this.barterPlans = [...INITIAL_BARTER_PLANS];
      this.histories = [...INITIAL_HISTORIES];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.LINE_ITEMS, JSON.stringify(this.lineItems));
      localStorage.setItem(STORAGE_KEYS.BARTER_PLANS, JSON.stringify(this.barterPlans));
      localStorage.setItem(STORAGE_KEYS.HISTORIES, JSON.stringify(this.histories));
    } catch (e) {
      console.error('PartnerConditionStore save error:', e);
    }
  }

  // --- PUBLIC READ APIS ---
  public getPartnerNames(): string[] {
    const set = new Set<string>();
    this.lineItems.forEach((i) => set.add(i.partnerName));
    return Array.from(set).sort();
  }

  public getProjectNames(partnerName: string): string[] {
    const set = new Set<string>();
    this.lineItems
      .filter((i) => i.partnerName === partnerName)
      .forEach((i) => set.add(i.projectName));
    return Array.from(set).sort();
  }

  public getLineItems(partnerName: string, projectName: string): PartnerConditionLineItem[] {
    return this.lineItems.filter(
      (i) => i.partnerName === partnerName && i.projectName === projectName
    );
  }

  public getBarterPlans(partnerName: string, projectName: string): BarterPlan[] {
    let plans = this.barterPlans.filter(
      (p) => p.partnerName === partnerName && p.projectName === projectName
    );

    // If no plan exists for this partner/project, auto create default Plan A
    if (plans.length === 0) {
      const items = this.getLineItems(partnerName, projectName);
      if (items.length > 0) {
        const defaultPlan: BarterPlan = {
          id: `plan-${Date.now()}-a`,
          partnerName,
          projectName,
          planName: '협의안 A (기본 누적 항목 전체)',
          description: '모든 등록 조건 항목 포함 기본 협의안',
          includedItemIds: items.map((i) => i.id),
          createdAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        this.barterPlans.push(defaultPlan);
        this.saveToStorage();
        plans = [defaultPlan];
      }
    }

    return plans;
  }

  public getHistories(partnerName: string, projectName: string): PartnerConditionHistory[] {
    return this.histories.filter(
      (h) => h.partnerName === partnerName && h.projectName === projectName
    );
  }

  // --- WRITE APIS ---
  public addLineItem(item: Omit<PartnerConditionLineItem, 'id' | 'createdAt' | 'updatedAt'>): PartnerConditionLineItem {
    const newItem: PartnerConditionLineItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    this.lineItems.push(newItem);

    // Add History
    this.addHistory({
      partnerName: newItem.partnerName,
      projectName: newItem.projectName,
      lineItemId: newItem.id,
      itemName: newItem.itemName,
      fieldChanged: '신규 조건 추가',
      previousValue: '-',
      newValue: `${newItem.quantityPeriod} (${newItem.totalAmount.toLocaleString()}원)`,
      reason: '사용자 신규 항목 등록',
    });

    // Automatically include in existing plans
    this.barterPlans.forEach((p) => {
      if (p.partnerName === newItem.partnerName && p.projectName === newItem.projectName) {
        if (!p.includedItemIds.includes(newItem.id)) {
          p.includedItemIds.push(newItem.id);
        }
      }
    });

    this.saveToStorage();
    return newItem;
  }

  public updateLineItem(
    id: string,
    updates: Partial<PartnerConditionLineItem>,
    reason?: string
  ): PartnerConditionLineItem | null {
    const index = this.lineItems.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const oldItem = this.lineItems[index];

    // Detect changes for History
    if (updates.quantityPeriod !== undefined && updates.quantityPeriod !== oldItem.quantityPeriod) {
      this.addHistory({
        partnerName: oldItem.partnerName,
        projectName: oldItem.projectName,
        lineItemId: id,
        itemName: oldItem.itemName,
        fieldChanged: '수량/기간',
        previousValue: oldItem.quantityPeriod,
        newValue: updates.quantityPeriod,
        reason: reason || '수량 조건 변경',
      });
    }

    if (updates.recognizedPrice !== undefined && updates.recognizedPrice !== oldItem.recognizedPrice) {
      this.addHistory({
        partnerName: oldItem.partnerName,
        projectName: oldItem.projectName,
        lineItemId: id,
        itemName: oldItem.itemName,
        fieldChanged: '인정과(단가)',
        previousValue: `${oldItem.recognizedPrice.toLocaleString()}원`,
        newValue: `${updates.recognizedPrice.toLocaleString()}원`,
        reason: reason || '금액 조건 수정',
      });
    }

    if (updates.isActive !== undefined && updates.isActive !== oldItem.isActive) {
      this.addHistory({
        partnerName: oldItem.partnerName,
        projectName: oldItem.projectName,
        lineItemId: id,
        itemName: oldItem.itemName,
        fieldChanged: '사용여부',
        previousValue: oldItem.isActive ? '사용(ON)' : '미사용(OFF)',
        newValue: updates.isActive ? '사용(ON)' : '미사용(OFF)',
        reason: reason || '상태 변경',
      });
    }

    const updatedItem: PartnerConditionLineItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    // Recalculate totalAmount
    updatedItem.totalAmount = updatedItem.recognizedPrice * updatedItem.quantityNum;

    this.lineItems[index] = updatedItem;
    this.saveToStorage();
    return updatedItem;
  }

  public deleteLineItem(id: string): void {
    const item = this.lineItems.find((i) => i.id === id);
    if (!item) return;

    this.lineItems = this.lineItems.filter((i) => i.id !== id);

    // Remove from barter plans
    this.barterPlans.forEach((p) => {
      p.includedItemIds = p.includedItemIds.filter((itemId) => itemId !== id);
    });

    this.addHistory({
      partnerName: item.partnerName,
      projectName: item.projectName,
      lineItemId: id,
      itemName: item.itemName,
      fieldChanged: '항목 삭제',
      previousValue: '존재',
      newValue: '삭제됨',
      reason: '사용자 직접 삭제',
    });

    this.saveToStorage();
  }

  public saveBarterPlan(plan: BarterPlan): void {
    const index = this.barterPlans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      this.barterPlans[index] = { ...plan, updatedAt: new Date().toISOString().slice(0, 10) };
    } else {
      this.barterPlans.push({
        ...plan,
        id: plan.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    }
    this.saveToStorage();
  }

  public addHistory(hist: Omit<PartnerConditionHistory, 'id' | 'changedAt'>): void {
    const record: PartnerConditionHistory = {
      ...hist,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      changedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
    };
    this.histories.unshift(record); // 최신순
    this.saveToStorage();
  }

  // --- FILE UPLOAD COMPLEMENT / COMPARISON FUNCTION ---
  public compareExtractedItems(
    partnerName: string,
    projectName: string,
    extractedItems: Partial<PartnerConditionLineItem>[]
  ): FileUploadComparison {
    const existingList = this.getLineItems(partnerName, projectName);

    const comparison: FileUploadComparison = {
      matchedExisting: [],
      proposedChanges: [],
      newItems: [],
    };

    extractedItems.forEach((extracted) => {
      // Find matching item by itemName similarity or category
      const match = existingList.find(
        (ex) =>
          ex.itemName.trim() === extracted.itemName?.trim() ||
          (ex.category === extracted.category && ex.provider === extracted.provider)
      );

      if (match) {
        // Check if values differ
        const changedFields: { field: string; oldVal: any; newVal: any }[] = [];

        if (
          extracted.quantityPeriod &&
          extracted.quantityPeriod !== match.quantityPeriod
        ) {
          changedFields.push({
            field: '수량/기간',
            oldVal: match.quantityPeriod,
            newVal: extracted.quantityPeriod,
          });
        }
        if (
          extracted.recognizedPrice !== undefined &&
          extracted.recognizedPrice !== match.recognizedPrice
        ) {
          changedFields.push({
            field: '인정과',
            oldVal: `${match.recognizedPrice.toLocaleString()}원`,
            newVal: `${extracted.recognizedPrice.toLocaleString()}원`,
          });
        }
        if (
          extracted.normalPrice !== undefined &&
          extracted.normalPrice !== match.normalPrice
        ) {
          changedFields.push({
            field: '정상가',
            oldVal: `${match.normalPrice.toLocaleString()}원`,
            newVal: `${extracted.normalPrice.toLocaleString()}원`,
          });
        }

        if (changedFields.length > 0) {
          comparison.proposedChanges.push({
            existingItem: match,
            extractedItem: extracted,
            changedFields,
          });
        } else {
          comparison.matchedExisting.push({
            existingItem: match,
            extractedItem: extracted,
          });
        }
      } else {
        comparison.newItems.push({
          ...extracted,
          partnerName,
          projectName,
        });
      }
    });

    return comparison;
  }

  // Apply User Selected File Upload Changes
  public applyUploadChanges(
    partnerName: string,
    projectName: string,
    selectedChanges: {
      updateItemIds: { id: string; updates: Partial<PartnerConditionLineItem> }[];
      newItems: Partial<PartnerConditionLineItem>[];
    },
    fileName?: string
  ): void {
    const sourceLabel = fileName ? `자료 업로드 (${fileName})` : '자료 보완 반영';

    // 1. Update existing items with user approved changes
    selectedChanges.updateItemIds.forEach(({ id, updates }) => {
      this.updateLineItem(id, updates, sourceLabel);
    });

    // 2. Add new approved items
    selectedChanges.newItems.forEach((newItem) => {
      if (newItem.itemName) {
        this.addLineItem({
          partnerName,
          projectName,
          itemName: newItem.itemName,
          provider: newItem.provider || 'IPARK리조트',
          category: newItem.category || '기타',
          quantityPeriod: newItem.quantityPeriod || '1식',
          quantityNum: newItem.quantityNum || 1,
          unitPrice: newItem.unitPrice || 0,
          normalPrice: newItem.normalPrice || 0,
          recognizedPrice: newItem.recognizedPrice || 0,
          costPrice: newItem.costPrice || 0,
          totalAmount: (newItem.recognizedPrice || 0) * (newItem.quantityNum || 1),
          notes: newItem.notes || `[출처] ${sourceLabel}`,
          isActive: true,
        });
      }
    });

    this.saveToStorage();
  }

  // Reset demo data if needed
  public resetToDemoSeed(): void {
    this.lineItems = [...INITIAL_LINE_ITEMS];
    this.barterPlans = [...INITIAL_BARTER_PLANS];
    this.histories = [...INITIAL_HISTORIES];
    this.saveToStorage();
  }
}

export const partnerConditionStore = new PartnerConditionStore();
