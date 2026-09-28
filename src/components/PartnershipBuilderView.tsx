import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Database,
  Save,
  FolderKanban,
  History,
  X,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  ArrowRightLeft,
  Coins,
  TrendingUp,
  Building2,
} from 'lucide-react';
import {
  IparkValueLineItem,
  PartnerValueLineItem,
  GuaranteedRevenueLineItem,
  BarterCalculationResult,
  PricingAssetItem,
  PricingAssetCategory,
} from '../types';

export const PartnershipBuilderView: React.FC = () => {
  // 1. Basic Deal Info (Free text inputs - NO forced list!)
  const [companyName, setCompanyName] = useState<string>('Garmin Korea');
  const [projectName, setProjectName] = useState<string>('오크밸리 골프 체험행사');
  const [calculationDate, setCalculationDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [notes, setNotes] = useState<string>('');

  // 2. IPARK Resort Value Items
  const [iparkItems, setIparkItems] = useState<IparkValueLineItem[]>([
    {
      id: 'ip-1',
      itemName: '오크밸리 CC 18홀 비회원 그린피',
      specCondition: '주중 4팀 (16명)',
      quantity: 16,
      unitPrice: 160000,
      costPrice: 50000,
      totalAmount: 2560000,
      notes: '골프 바터 제공',
    },
    {
      id: 'ip-2',
      itemName: '빌리지센터 로비 팝업존',
      specCondition: '3m x 3m 부스 / 3일간',
      quantity: 3,
      unitPrice: 1000000,
      costPrice: 150000,
      totalAmount: 3000000,
      notes: '스마트워치 체험존 운영',
    },
  ]);

  // 3. Partner Value Items
  const [partnerItems, setPartnerItems] = useState<PartnerValueLineItem[]>([
    {
      id: 'pt-1',
      itemName: '제휴 협찬 현금',
      quantity: 1,
      unitPrice: 10000000,
      totalAmount: 10000000,
      valueType: '현금',
      notes: '행사 협찬금',
    },
    {
      id: 'pt-2',
      itemName: 'Garmin Approach 스마트워치 시상품',
      quantity: 20,
      unitPrice: 150000,
      totalAmount: 3000000,
      valueType: '현물',
      notes: 'VIP 및 대회 시상품',
    },
  ]);

  // 4. Guaranteed Revenue / Sales Items
  const [guaranteedRevenues, setGuaranteedRevenues] = useState<GuaranteedRevenueLineItem[]>([
    {
      id: 'gr-1',
      productName: '오크밸리 x Garmin 골프 객실 패키지',
      quantity: 20,
      salesUnitPrice: 180000,
      expectedRevenue: 3600000,
      commissionRatePercent: 100,
      expectedNetRevenue: 3600000,
      notes: '최소 20실 보장판매',
    },
  ]);

  // 5. Computed Totals
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [iparkTotalValue, setIparkTotalValue] = useState<number>(0);
  const [iparkTotalCost, setIparkTotalCost] = useState<number>(0);
  const [partnerCashValue, setPartnerCashValue] = useState<number>(0);
  const [partnerGoodsValue, setPartnerGoodsValue] = useState<number>(0);
  const [partnerTotalValue, setPartnerTotalValue] = useState<number>(0);
  const [guaranteedTotalRevenue, setGuaranteedTotalRevenue] = useState<number>(0);
  const [expectedNetRevenueTotal, setExpectedNetRevenueTotal] = useState<number>(0);
  const [valueDifference, setValueDifference] = useState<number>(0);
  const [expectedProfitLoss, setExpectedProfitLoss] = useState<number>(0);

  // AI Summaries
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiNegotiationProposal, setAiNegotiationProposal] = useState<string>('');

  // Modals & Selectors
  const [showPriceDbPicker, setShowPriceDbPicker] = useState<boolean>(false);
  const [dbAssets, setDbAssets] = useState<PricingAssetItem[]>([]);
  const [pickerCategory, setPickerCategory] = useState<string>('전체');
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // Saved Calculations History
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [savedCalculations, setSavedCalculations] = useState<BarterCalculationResult[]>([]);

  useEffect(() => {
    fetchPriceDbAssets();
    fetchSavedCalculations();
  }, []);

  const fetchPriceDbAssets = async () => {
    try {
      const res = await fetch('/api/pricing-assets');
      if (res.ok) {
        const data = await res.json();
        if (data.items) setDbAssets(data.items);
      }
    } catch (e) {
      console.error('Failed to load pricing assets:', e);
    }
  };

  const fetchSavedCalculations = async () => {
    try {
      const res = await fetch('/api/barter-calculations');
      if (res.ok) {
        const data = await res.json();
        if (data.calculations) setSavedCalculations(data.calculations);
      }
    } catch (e) {
      console.error('Failed to load saved calculations:', e);
    }
  };

  // --- Handlers for IPARK Items ---
  const handleAddIparkFromDb = (asset: PricingAssetItem) => {
    const newItem: IparkValueLineItem = {
      id: `ip-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      assetId: asset.id,
      itemName: asset.itemName,
      specCondition: asset.specCondition || asset.category,
      quantity: 1,
      unitPrice: asset.partnerPrice || asset.normalPrice || 0,
      costPrice: asset.costPrice || 0,
      totalAmount: asset.partnerPrice || asset.normalPrice || 0,
      notes: `가격자료 DB (${asset.category})`,
    };
    setIparkItems([...iparkItems, newItem]);
    setShowPriceDbPicker(false);
  };

  const handleAddIparkDirect = () => {
    const newItem: IparkValueLineItem = {
      id: `ip-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemName: '직접 입력 제공 항목',
      specCondition: '',
      quantity: 1,
      unitPrice: 1000000,
      costPrice: 300000,
      totalAmount: 1000000,
      notes: '',
    };
    setIparkItems([...iparkItems, newItem]);
  };

  const updateIparkItem = (id: string, field: keyof IparkValueLineItem, value: any) => {
    setIparkItems(
      iparkItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const u = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
          updated.totalAmount = q * u;
        }
        return updated;
      })
    );
  };

  const removeIparkItem = (id: string) => {
    setIparkItems(iparkItems.filter((item) => item.id !== id));
  };

  // --- Handlers for Partner Items ---
  const handleAddPartnerDirect = () => {
    const newItem: PartnerValueLineItem = {
      id: `pt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      itemName: '파트너 제공 항목',
      quantity: 1,
      unitPrice: 1000000,
      totalAmount: 1000000,
      valueType: '현물',
      notes: '',
    };
    setPartnerItems([...partnerItems, newItem]);
  };

  const updatePartnerItem = (id: string, field: keyof PartnerValueLineItem, value: any) => {
    setPartnerItems(
      partnerItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const u = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
          updated.totalAmount = q * u;
        }
        return updated;
      })
    );
  };

  const removePartnerItem = (id: string) => {
    setPartnerItems(partnerItems.filter((item) => item.id !== id));
  };

  // --- Handlers for Guaranteed Revenues ---
  const handleAddGuaranteedDirect = () => {
    const newItem: GuaranteedRevenueLineItem = {
      id: `gr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productName: '객실 패키지 / 상품',
      quantity: 10,
      salesUnitPrice: 180000,
      expectedRevenue: 1800000,
      commissionRatePercent: 100,
      expectedNetRevenue: 1800000,
      notes: '',
    };
    setGuaranteedRevenues([...guaranteedRevenues, newItem]);
  };

  const updateGuaranteedItem = (id: string, field: keyof GuaranteedRevenueLineItem, value: any) => {
    setGuaranteedRevenues(
      guaranteedRevenues.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'salesUnitPrice' || field === 'commissionRatePercent') {
          const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
          const p = field === 'salesUnitPrice' ? Number(value) || 0 : item.salesUnitPrice;
          const comm =
            field === 'commissionRatePercent'
              ? Number(value) || 0
              : item.commissionRatePercent || 100;

          const totalRev = q * p;
          updated.expectedRevenue = totalRev;
          updated.expectedNetRevenue = Math.round(totalRev * (comm / 100));
        }
        return updated;
      })
    );
  };

  const removeGuaranteedItem = (id: string) => {
    setGuaranteedRevenues(guaranteedRevenues.filter((item) => item.id !== id));
  };

  // --- Execute Calculation ---
  const handleCalculateResults = async () => {
    if (!companyName.trim()) {
      alert('업체명을 입력해 주세요.');
      return;
    }

    // 1. IPARK Totals
    const ipVal = iparkItems.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
    const ipCost = iparkItems.reduce(
      (acc, cur) => acc + (cur.quantity || 0) * (cur.costPrice || 0),
      0
    );

    // 2. Partner Totals
    const ptCash = partnerItems
      .filter((i) => i.valueType === '현금')
      .reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
    const ptGoods = partnerItems
      .filter((i) => i.valueType !== '현금')
      .reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
    const ptTotal = ptCash + ptGoods;

    // 3. Guaranteed Revenue Totals
    const grTotalRev = guaranteedRevenues.reduce(
      (acc, cur) => acc + (cur.expectedRevenue || 0),
      0
    );
    const grNetRev = guaranteedRevenues.reduce(
      (acc, cur) => acc + (cur.expectedNetRevenue || 0),
      0
    );

    // 4. Value Differential & Expected Profit/Loss
    const valDiff = ipVal - ptTotal;
    const profitLoss = ptCash + grNetRev - ipCost;

    setIparkTotalValue(ipVal);
    setIparkTotalCost(ipCost);
    setPartnerCashValue(ptCash);
    setPartnerGoodsValue(ptGoods);
    setPartnerTotalValue(ptTotal);
    setGuaranteedTotalRevenue(grTotalRev);
    setExpectedNetRevenueTotal(grNetRev);
    setValueDifference(valDiff);
    setExpectedProfitLoss(profitLoss);
    setIsCalculated(true);

    // 5. Generate AI Summary using strictly the exact numbers
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/barter-calculations/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          projectName,
          calculationDate,
          notes,
          iparkTotalValue: ipVal,
          iparkTotalCost: ipCost,
          partnerCashValue: ptCash,
          partnerGoodsValue: ptGoods,
          partnerTotalValue: ptTotal,
          guaranteedTotalRevenue: grTotalRev,
          expectedNetRevenueTotal: grNetRev,
          valueDifference: valDiff,
          expectedProfitLoss: profitLoss,
          iparkItems,
          partnerItems,
          guaranteedRevenues,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.aiSummary || '');
        setAiNegotiationProposal(data.aiNegotiationProposal || '');
      }
    } catch (e) {
      console.error('AI Summary generation error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // --- Save Calculation to DB ---
  const handleSaveCalculation = async () => {
    if (!companyName.trim()) {
      alert('업체명을 입력해 주세요.');
      return;
    }

    const payload: Partial<BarterCalculationResult> = {
      companyName,
      projectName,
      calculationDate,
      notes,
      iparkItems,
      partnerItems,
      guaranteedRevenues,
      iparkTotalValue,
      iparkTotalCost,
      partnerCashValue,
      partnerGoodsValue,
      partnerTotalValue,
      guaranteedTotalRevenue,
      expectedNetRevenueTotal,
      valueDifference,
      expectedProfitLoss,
      aiSummary,
      aiNegotiationProposal,
    };

    try {
      const res = await fetch('/api/barter-calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('제휴 조건 계산 결과가 성공적으로 저장되었습니다.');
        fetchSavedCalculations();
      }
    } catch (e) {
      console.error('Failed to save calculation:', e);
      alert('저장 처리 중 오류가 발생했습니다.');
    }
  };

  // Load Saved Calculation
  const handleLoadSavedCalculation = (calc: BarterCalculationResult) => {
    setCompanyName(calc.companyName || '');
    setProjectName(calc.projectName || '');
    setCalculationDate(calc.calculationDate || new Date().toISOString().substring(0, 10));
    setNotes(calc.notes || '');
    setIparkItems(calc.iparkItems || []);
    setPartnerItems(calc.partnerItems || []);
    setGuaranteedRevenues(calc.guaranteedRevenues || []);

    setIparkTotalValue(calc.iparkTotalValue || 0);
    setIparkTotalCost(calc.iparkTotalCost || 0);
    setPartnerCashValue(calc.partnerCashValue || 0);
    setPartnerGoodsValue(calc.partnerGoodsValue || 0);
    setPartnerTotalValue(calc.partnerTotalValue || 0);
    setGuaranteedTotalRevenue(calc.guaranteedTotalRevenue || 0);
    setExpectedNetRevenueTotal(calc.expectedNetRevenueTotal || 0);
    setValueDifference(calc.valueDifference || 0);
    setExpectedProfitLoss(calc.expectedProfitLoss || 0);
    setAiSummary(calc.aiSummary || '');
    setAiNegotiationProposal(calc.aiNegotiationProposal || '');
    setIsCalculated(true);
    setShowHistoryModal(false);
  };

  // Filter Price DB picker assets
  const filteredDbAssets = dbAssets.filter((asset) => {
    const matchCat = pickerCategory === '전체' || asset.category === pickerCategory;
    const matchSearch =
      asset.itemName.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (asset.specCondition && asset.specCondition.toLowerCase().includes(pickerSearch.toLowerCase()));
    return matchCat && matchSearch && asset.isActive;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans">
      {/* Header Banner */}
      <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#736152] uppercase">
              <Calculator className="w-4 h-4" />
              <span>IPARK RESORT &middot; BARTER &amp; DEAL VALUE CALCULATOR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2C2C2C] mt-1">
              제휴 조건 계산
            </h1>
            <p className="text-xs sm:text-sm text-[#786658] font-light max-w-3xl leading-relaxed mt-1">
              업체명과 프로젝트명을 자유롭게 입력하고, 가격자료 DB에서 리조트 제공자산을 선택 및 수정한 후 파트너 제공가치 및 보장매출을 종합하여 정밀 손익을 산출합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>이전 계산 이력 ({savedCalculations.length})</span>
            </button>
            <button
              onClick={handleSaveCalculation}
              className="px-4 py-2 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>계산 결과 저장</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Basic Information Section (Free Text Inputs!) */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2 border-b border-[#E8E4DC] pb-3 text-xs font-bold text-[#736152] uppercase">
          <FileSpreadsheet className="w-4 h-4" />
          <span>1. 안건 기본정보 (자유 텍스트 입력)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#2C2C2C] mb-1">업체명 *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="예: Garmin Korea"
              className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-bold text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C2C2C] mb-1">프로젝트명 *</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="예: 오크밸리 골프 체험행사"
              className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-bold text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C2C2C] mb-1">계산일자</label>
            <input
              type="date"
              value={calculationDate}
              onChange={(e) => setCalculationDate(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs font-mono text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2C2C2C] mb-1">안건 메모</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 2026년 상반기 팝업 제휴건"
              className="w-full bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-2 text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152]"
            />
          </div>
        </div>
      </div>

      {/* 2. IPARK Resort Provided Value Section */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4DC] pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#736152] uppercase">
            <Building2 className="w-4 h-4" />
            <span>2. IPARK리조트 제공가치 (오크밸리 &middot; 파크로쉬 자산)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPriceDbPicker(true)}
              className="px-3 py-1.5 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>+ 가격자료에서 추가</span>
            </button>
            <button
              onClick={handleAddIparkDirect}
              className="px-3 py-1.5 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 직접 입력</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3 min-w-[200px]">항목명</th>
                <th className="py-2.5 px-3 min-w-[140px]">규격/조건</th>
                <th className="py-2.5 px-3 w-20 text-center">수량</th>
                <th className="py-2.5 px-3 text-right w-32">협의 단가 (원)</th>
                <th className="py-2.5 px-3 text-right w-32">원가 (원)</th>
                <th className="py-2.5 px-3 text-right w-36">총액 (원)</th>
                <th className="py-2.5 px-3 min-w-[120px]">비고</th>
                <th className="py-2.5 px-3 text-center w-12">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {iparkItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8C7A6B]">
                    등록된 IPARK리조트 제공 가치 항목이 없습니다. [+ 가격자료에서 추가] 버튼을 눌러보세요.
                  </td>
                </tr>
              ) : (
                iparkItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateIparkItem(item.id, 'itemName', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 font-bold text-[#2C2C2C]"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.specCondition || ''}
                        onChange={(e) => updateIparkItem(item.id, 'specCondition', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-[#5C4E43]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateIparkItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 bg-white border border-[#D4C8B8] rounded-2xs px-1 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateIparkItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-28 bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-right font-mono font-bold text-[#736152]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={item.costPrice || 0}
                        onChange={(e) => updateIparkItem(item.id, 'costPrice', Number(e.target.value))}
                        className="w-28 bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-right font-mono text-[#8C7A6B]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#2C2C2C]">
                      {item.totalAmount.toLocaleString()}원
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateIparkItem(item.id, 'notes', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-[#786658]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => removeIparkItem(item.id)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Partner Provided Value Section */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#736152] uppercase">
            <Coins className="w-4 h-4" />
            <span>3. 파트너 제공가치 (현금 &middot; 현물 &middot; 마케팅)</span>
          </div>
          <button
            onClick={handleAddPartnerDirect}
            className="px-3 py-1.5 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ 파트너 제공항목 추가</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3 min-w-[200px]">항목명</th>
                <th className="py-2.5 px-3 w-28 text-center">구분</th>
                <th className="py-2.5 px-3 w-20 text-center">수량</th>
                <th className="py-2.5 px-3 text-right w-32">단가 (원)</th>
                <th className="py-2.5 px-3 text-right w-36">총액 (원)</th>
                <th className="py-2.5 px-3 min-w-[140px]">비고</th>
                <th className="py-2.5 px-3 text-center w-12">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {partnerItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C7A6B]">
                    등록된 파트너 제공 가치 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                partnerItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updatePartnerItem(item.id, 'itemName', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 font-bold text-[#2C2C2C]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={item.valueType}
                        onChange={(e) => updatePartnerItem(item.id, 'valueType', e.target.value as any)}
                        className="bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-xs font-semibold"
                      >
                        <option value="현금">현금</option>
                        <option value="현물">현물</option>
                        <option value="마케팅">마케팅</option>
                        <option value="기타">기타</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePartnerItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 bg-white border border-[#D4C8B8] rounded-2xs px-1 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updatePartnerItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-28 bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-right font-mono font-bold text-[#736152]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#2C2C2C]">
                      {item.totalAmount.toLocaleString()}원
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updatePartnerItem(item.id, 'notes', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-[#786658]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => removePartnerItem(item.id)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Guaranteed Revenue / Sales Linkage Section */}
      <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#736152] uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>4. 보장매출 / 판매연계 (Guaranteed Sales &amp; Revenue)</span>
          </div>
          <button
            onClick={handleAddGuaranteedDirect}
            className="px-3 py-1.5 bg-[#F5F2EB] text-[#5C4E43] hover:bg-[#EFECE6] border border-[#D4C8B8] rounded-xs text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ 보장매출 상품 추가</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3 min-w-[220px]">상품명</th>
                <th className="py-2.5 px-3 w-20 text-center">수량</th>
                <th className="py-2.5 px-3 text-right w-32">판매단가 (원)</th>
                <th className="py-2.5 px-3 text-right w-36">예상매출 (원)</th>
                <th className="py-2.5 px-3 text-center w-24">수수료율 (%)</th>
                <th className="py-2.5 px-3 text-right w-36">예상순매출 (원)</th>
                <th className="py-2.5 px-3 text-center w-12">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {guaranteedRevenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C7A6B]">
                    등록된 보장매출/판매연계 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                guaranteedRevenues.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => updateGuaranteedItem(item.id, 'productName', e.target.value)}
                        className="w-full bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 font-bold text-[#2C2C2C]"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateGuaranteedItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 bg-white border border-[#D4C8B8] rounded-2xs px-1 py-1 text-center font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        value={item.salesUnitPrice}
                        onChange={(e) => updateGuaranteedItem(item.id, 'salesUnitPrice', Number(e.target.value))}
                        className="w-28 bg-white border border-[#D4C8B8] rounded-2xs px-2 py-1 text-right font-mono font-bold text-[#736152]"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-[#2C2C2C]">
                      {item.expectedRevenue.toLocaleString()}원
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        value={item.commissionRatePercent ?? 100}
                        onChange={(e) => updateGuaranteedItem(item.id, 'commissionRatePercent', Number(e.target.value))}
                        className="w-16 bg-white border border-[#D4C8B8] rounded-2xs px-1 py-1 text-center font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                      {item.expectedNetRevenue.toLocaleString()}원
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => removeGuaranteedItem(item.id)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Calculate Action Button */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={handleCalculateResults}
          className="px-8 py-3.5 bg-[#736152] hover:bg-[#5C4E43] text-white font-bold text-sm rounded-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer transform active:scale-95"
        >
          <Calculator className="w-5 h-5" />
          <span>선택값으로 결과 계산하기</span>
        </button>
      </div>

      {/* 6. Exact Calculated Results Dashboard */}
      {isCalculated && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D4C8B8] pb-4">
              <div className="flex items-center space-x-2 text-[#736152] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>제휴 정밀 손익 계산 결과 ({companyName})</span>
              </div>
              <span className="text-xs text-[#8C7A6B] font-mono">
                계산 기준일: {calculationDate}
              </span>
            </div>

            {/* Results Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">IPARK 제공가치 총액</span>
                <div className="text-lg font-bold font-mono text-[#2C2C2C]">
                  {iparkTotalValue.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">실제 원가 총액</span>
                <div className="text-lg font-bold font-mono text-rose-700">
                  {iparkTotalCost.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">파트너 현금 제공</span>
                <div className="text-lg font-bold font-mono text-[#736152]">
                  {partnerCashValue.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">파트너 현물가치</span>
                <div className="text-lg font-bold font-mono text-[#2C2C2C]">
                  {partnerGoodsValue.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">파트너 총 제공가치</span>
                <div className="text-lg font-bold font-mono text-[#2C2C2C]">
                  {partnerTotalValue.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">보장매출 총액</span>
                <div className="text-lg font-bold font-mono text-[#2C2C2C]">
                  {guaranteedTotalRevenue.toLocaleString()}원
                </div>
              </div>

              <div className="bg-white p-4 rounded-xs border border-[#E8E4DC] space-y-1">
                <span className="text-[11px] text-[#8C7A6B] font-semibold">예상순매출</span>
                <div className="text-lg font-bold font-mono text-emerald-700">
                  {expectedNetRevenueTotal.toLocaleString()}원
                </div>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-xs border border-amber-200 space-y-1">
                <span className="text-[11px] text-amber-900 font-semibold">가치 차이 (IPARK - 파트너)</span>
                <div className={`text-lg font-bold font-mono ${valueDifference > 0 ? 'text-amber-800' : 'text-blue-800'}`}>
                  {valueDifference.toLocaleString()}원
                </div>
              </div>

              <div className="col-span-2 sm:col-span-3 lg:col-span-4 bg-[#736152] text-white p-5 rounded-xs shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#EFECE6] font-semibold">최종 예상 손익 (파트너현금 + 순매출 - 실제원가)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-0.5">
                    {expectedProfitLoss >= 0 ? '+' : ''}
                    {expectedProfitLoss.toLocaleString()}원
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white/20 rounded-2xs text-xs font-bold text-white uppercase">
                    {expectedProfitLoss >= 0 ? '수주 우수 안건' : '손익 보완 필요'}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Condition Summary & AI Negotiation Strategy */}
            <div className="bg-white border border-[#E8E4DC] rounded-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#736152] uppercase border-b border-[#E8E4DC] pb-2">
                <Sparkles className="w-4 h-4" />
                <span>조건 요약 및 추천 협상안 (실제 입력값 기반 AI 요약)</span>
              </div>

              {isGeneratingAi ? (
                <div className="py-6 text-center text-[#8C7A6B] text-xs">
                  실제 입력된 데이터를 바탕으로 요약 및 협상안을 분석하는 중입니다...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#E8E4DC] space-y-2">
                    <span className="font-bold text-[#2C2C2C] block">📌 조건 요약</span>
                    <p className="text-[#5C4E43] leading-relaxed whitespace-pre-line font-light">
                      {aiSummary || '계산 결과가 요약되었습니다.'}
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#E8E4DC] space-y-2">
                    <span className="font-bold text-[#2C2C2C] block">💡 추천 협상안</span>
                    <p className="text-[#5C4E43] leading-relaxed whitespace-pre-line font-light">
                      {aiNegotiationProposal || '추천 협상 전략이 수립되었습니다.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Price DB Asset Picker Modal */}
      {showPriceDbPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-3xl p-6 space-y-4 animate-in fade-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div className="flex items-center space-x-2 text-[#736152] font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>가격자료 DB에서 자산 선택</span>
              </div>
              <button
                onClick={() => setShowPriceDbPicker(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setPickerCategory('전체')}
                  className={`px-2.5 py-1 text-xs rounded-2xs font-medium cursor-pointer ${
                    pickerCategory === '전체' ? 'bg-[#736152] text-white' : 'bg-[#F5F2EB] text-[#5C4E43]'
                  }`}
                >
                  전체
                </button>
                {['객실', '골프', '공간', '사우나', '클래스', '광고', 'F&B', '기타'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-1 text-xs rounded-2xs font-medium cursor-pointer ${
                      pickerCategory === cat ? 'bg-[#736152] text-white' : 'bg-[#F5F2EB] text-[#5C4E43]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="항목 검색..."
                className="w-full sm:w-48 bg-[#FAF8F5] border border-[#D4C8B8] rounded-xs p-1.5 text-xs"
              />
            </div>

            {/* Assets Table */}
            <div className="flex-1 overflow-y-auto border border-[#E8E4DC] rounded-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E4DC] text-[#736152] font-semibold">
                  <tr>
                    <th className="p-2.5">카테고리</th>
                    <th className="p-2.5">항목명</th>
                    <th className="p-2.5">규격/조건</th>
                    <th className="p-2.5 text-right">정상가</th>
                    <th className="p-2.5 text-right">제휴가</th>
                    <th className="p-2.5 text-center">선택</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC]">
                  {filteredDbAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#8C7A6B]">
                        검색 조건에 해당하거나 활성화된 가격 자산이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredDbAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-[#FAF8F5]">
                        <td className="p-2.5 text-[#736152] font-semibold">{asset.category}</td>
                        <td className="p-2.5 font-bold text-[#2C2C2C]">{asset.itemName}</td>
                        <td className="p-2.5 text-[#5C4E43]">{asset.specCondition || '-'}</td>
                        <td className="p-2.5 text-right font-mono text-[#8C7A6B]">
                          {asset.normalPrice ? asset.normalPrice.toLocaleString() + '원' : '-'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#736152]">
                          {asset.partnerPrice ? asset.partnerPrice.toLocaleString() + '원' : '-'}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleAddIparkFromDb(asset)}
                            className="px-2.5 py-1 bg-[#736152] text-white hover:bg-[#5C4E43] rounded-2xs text-[11px] font-bold cursor-pointer"
                          >
                            선택
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => setShowPriceDbPicker(false)}
                className="px-4 py-2 border border-[#D4C8B8] text-[#5C4E43] hover:bg-[#F5F2EB] rounded-xs text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Saved Calculations History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D4C8B8] rounded-xs shadow-xl w-full max-w-3xl p-6 space-y-4 animate-in fade-in duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div className="flex items-center space-x-2 text-[#736152] font-bold text-sm">
                <History className="w-4 h-4" />
                <span>저장된 제휴 조건 계산 이력</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[#8C7A6B] hover:text-[#2C2C2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {savedCalculations.length === 0 ? (
                <div className="p-8 text-center text-[#8C7A6B] text-xs">
                  저장된 제휴 조건 계산 이력이 없습니다.
                </div>
              ) : (
                savedCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-4 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xs hover:border-[#736152] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        <span className="font-bold text-sm text-[#2C2C2C]">{calc.companyName}</span>
                        <span className="text-xs text-[#736152] font-semibold">({calc.projectName})</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8C7A6B]">{calc.calculationDate}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#E8E4DC]">
                      <div>
                        <span className="text-[#8C7A6B]">IPARK 제공가치:</span>{' '}
                        <span className="font-mono font-bold text-[#2C2C2C]">
                          {(calc.iparkTotalValue || 0).toLocaleString()}원
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C7A6B]">파트너 제공가치:</span>{' '}
                        <span className="font-mono font-bold text-[#2C2C2C]">
                          {(calc.partnerTotalValue || 0).toLocaleString()}원
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C7A6B]">예상 손익:</span>{' '}
                        <span className="font-mono font-bold text-emerald-700">
                          {(calc.expectedProfitLoss || 0).toLocaleString()}원
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleLoadSavedCalculation(calc)}
                        className="px-3 py-1 bg-[#736152] text-white rounded-2xs text-xs font-semibold hover:bg-[#5C4E43] cursor-pointer"
                      >
                        이 계산 결과 불러오기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E8E4DC]">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 border border-[#D4C8B8] text-[#5C4E43] hover:bg-[#F5F2EB] rounded-xs text-xs font-semibold cursor-pointer"
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
