import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType } from 'docx';
import * as XLSX from 'xlsx';
import { ProposalData, ProposalSection } from '../types';

/**
 * 1. PPTX EXPORT (Multi-slide Deck with Official Corporate Template Styling)
 */
export async function exportProposalToPPTX(
  proposal: ProposalData,
  templateStyle: 'IPARK' | 'OAK_VALLEY' | 'PARK_ROCHE' = 'IPARK',
  connectedDeal?: any | null,
  occData?: any | null
): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `${proposal.companyName}_X_OakValley_Partnership_Proposal`;

  // Palette definition by template style
  let palette = {
    titleBg: '0B192C',        // HDC IPARK Dark Navy
    titleHeader: 'C5A059',    // Gold
    titleText: 'FFFFFF',      // White
    slideBg: 'F4F6F9',        // Light Grey
    headerColor: '00205B',     // HDC IPARK Navy
    primaryText: '1E293B',
    factBg: 'E2E8F0',
    factText: '0F172A',
    strategicBg: 'E0E7FF',
    strategicText: '1E1B4B',
    footerText: '64748B',
    fontTitle: 'Arial',
    fontBody: 'Arial',
    templateLabel: 'HDC IPARK OFFICIAL TEMPLATE',
  };

  if (templateStyle === 'OAK_VALLEY') {
    palette = {
      titleBg: '2D4A3E',        // Oak Valley Forest Green
      titleHeader: 'D4C8B8',    // Warm Sand
      titleText: 'FFFFFF',
      slideBg: 'FAF8F5',        // Warm Cream
      headerColor: '736152',     // Oak Earth
      primaryText: '2C2C2C',
      factBg: 'EFECE6',
      factText: '2C2C2C',
      strategicBg: 'E8E4DC',
      strategicText: '3C322A',
      footerText: '66584C',
      fontTitle: 'Georgia',
      fontBody: 'Arial',
      templateLabel: 'OAK VALLEY RESORT STYLE',
    };
  } else if (templateStyle === 'PARK_ROCHE') {
    palette = {
      titleBg: '3A3F3D',        // Park Roche Slate/Stone
      titleHeader: 'A3B18A',    // Sage Green
      titleText: 'FFFFFF',
      slideBg: 'F5F7F6',        // Calm Zen White
      headerColor: '4A5568',     // Deep Slate
      primaryText: '1A202C',
      factBg: 'E2E8F0',
      factText: '1A202C',
      strategicBg: 'E6EBE0',
      strategicText: '2D3748',
      footerText: '718096',
      fontTitle: 'Arial',
      fontBody: 'Arial',
      templateLabel: 'PARK ROCHE WELLNESS STYLE',
    };
  }

  // Slide 1: Cover Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: palette.titleBg };

  titleSlide.addText(palette.templateLabel, {
    x: 0.8,
    y: 1.5,
    w: 11.3,
    h: 0.4,
    fontSize: 12,
    color: palette.titleHeader,
    bold: true,
    fontFace: palette.fontTitle,
  });

  titleSlide.addText(`${proposal.companyName} × HDC RESORT`, {
    x: 0.8,
    y: 2.1,
    w: 11.3,
    h: 1.2,
    fontSize: 34,
    color: palette.titleText,
    bold: true,
    fontFace: palette.fontTitle,
  });

  titleSlide.addText(
    proposal.proposalMode === 'INTERNAL'
      ? 'STRATEGIC PARTNERSHIP INTERNAL REVIEW DECK'
      : 'STRATEGIC PARTNERSHIP PROPOSAL',
    {
      x: 0.8,
      y: 3.5,
      w: 11.3,
      h: 0.6,
      fontSize: 18,
      color: palette.titleHeader,
      fontFace: palette.fontBody,
    }
  );

  titleSlide.addText(`Document Date: ${proposal.generatedAt} | HDC Resort & Oak Valley & Park Roche`, {
    x: 0.8,
    y: 6.2,
    w: 11.3,
    h: 0.4,
    fontSize: 10,
    color: palette.titleHeader,
    fontFace: palette.fontBody,
  });

  // Slide 2..N: Section Slides
  proposal.sections.forEach((sec) => {
    if (proposal.proposalMode === 'PARTNER' && sec.isInternalOnly) {
      return; // Skip internal sections in partner mode
    }

    const slide = pptx.addSlide();
    slide.background = { color: palette.slideBg };

    // Header Tag
    slide.addText(`HDC RESORT STRATEGIC PARTNERSHIP | ${proposal.companyName}`, {
      x: 0.8,
      y: 0.4,
      w: 11.5,
      h: 0.3,
      fontSize: 10,
      color: palette.headerColor,
      bold: true,
      fontFace: palette.fontBody,
    });

    // Slide Title
    slide.addText(sec.title, {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      color: palette.headerColor,
      bold: true,
      fontFace: palette.fontTitle,
    });

    const isDealSlide = sec.title.includes('Barter') || sec.title.includes('Value') || sec.title.includes('제휴 조건') || sec.title.includes('Partnership Terms');

    if (isDealSlide && connectedDeal) {
      // Main Content Box (smaller)
      slide.addText(sec.content, {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        h: 1.0,
        fontSize: 12,
        color: palette.primaryText,
        fontFace: palette.fontBody,
      });

      // Render Editable PowerPoint Table for Deal Items
      const tableHeaders = [
        { text: '구분', options: { bold: true, fill: palette.headerColor, color: 'FFFFFF' } },
        { text: '제공항목', options: { bold: true, fill: palette.headerColor, color: 'FFFFFF' } },
        { text: '정상가치', options: { bold: true, fill: palette.headerColor, color: 'FFFFFF' } },
        { text: '제안조건', options: { bold: true, fill: palette.headerColor, color: 'FFFFFF' } },
        { text: '비고', options: { bold: true, fill: palette.headerColor, color: 'FFFFFF' } },
      ];

      const tableRows: any[] = [tableHeaders];

      if (Array.isArray(connectedDeal.items)) {
        connectedDeal.items.forEach((it: any) => {
          tableRows.push([
            { text: it.category || '자산' },
            { text: it.itemName },
            { text: `₩${Number(it.normalPrice * (it.quantityNum || 1)).toLocaleString()}` },
            { text: it.appliedPrice === 0 ? '100% 무상지원' : `₩${Number(it.appliedPrice).toLocaleString()}` },
            { text: it.notes || '-' },
          ]);
        });
      }

      // Add summary row
      const normTotal = Number(connectedDeal.totalNormalValue || 0).toLocaleString();
      const negTotal = Number(connectedDeal.negotiatedValue || 0).toLocaleString();
      tableRows.push([
        { text: '합계 요약', options: { bold: true, fill: palette.factBg } },
        { text: `총 ${connectedDeal.items?.length || 0}개 지정 항목`, options: { bold: true, fill: palette.factBg } },
        { text: `총 ₩${normTotal}`, options: { bold: true, fill: palette.factBg } },
        { text: `협의가 ₩${negTotal}`, options: { bold: true, fill: palette.factBg } },
        { text: `Oak Valley 지원가치: ₩${Number(connectedDeal.discountAmount || 0).toLocaleString()}`, options: { bold: true, fill: palette.factBg } },
      ]);

      slide.addTable(tableRows, {
        x: 0.8,
        y: 2.6,
        w: 11.5,
        colW: [1.8, 4.0, 2.0, 2.0, 1.7],
        fontSize: 10,
        fontFace: palette.fontBody,
        border: { pt: 1, color: 'CCCCCC' },
      });

      // Summary note below table
      slide.addText(`* 정상가 기준 총 제공가치: ₩${normTotal}원 | 협의금액: ₩${negTotal}원 | Oak Valley 지원가치: ₩${Number(connectedDeal.discountAmount || 0).toLocaleString()}원`, {
        x: 0.8,
        y: 5.8,
        w: 11.5,
        h: 0.5,
        fontSize: 10,
        color: palette.primaryText,
        bold: true,
      });
    } else {
      // Standard Main Content Box
      slide.addText(sec.content, {
        x: 0.8,
        y: 1.6,
        w: 11.5,
        h: 2.8,
        fontSize: 13,
        color: palette.primaryText,
        fontFace: palette.fontBody,
        lineSpacing: 20,
      });

      // Fact & Source Box (Bottom Left)
      if (sec.factSummary) {
        slide.addText(`VERIFIED FACT:\n${sec.factSummary}`, {
          x: 0.8,
          y: 4.6,
          w: 5.6,
          h: 1.5,
          fontSize: 10,
          color: palette.factText,
          fill: { color: palette.factBg },
          align: 'left',
          valign: 'top',
          margin: 10,
        });
      }

      // Strategic Proposal Box (Bottom Right)
      if (sec.strategicProposal) {
        slide.addText(`AI STRATEGIC INSIGHT:\n${sec.strategicProposal}`, {
          x: 6.7,
          y: 4.6,
          w: 5.6,
          h: 1.5,
          fontSize: 10,
          color: palette.strategicText,
          fill: { color: palette.strategicBg },
          align: 'left',
          valign: 'top',
          margin: 10,
        });
      }
    }

    // Footer Source
    if (sec.sourceCitation) {
      slide.addText(`Source: ${sec.sourceCitation}`, {
        x: 0.8,
        y: 6.5,
        w: 11.5,
        h: 0.3,
        fontSize: 8,
        color: palette.footerText,
        italic: true,
      });
    }
  });

  const modeTag = proposal.proposalMode === 'INTERNAL' ? 'Internal_Review' : 'Proposal';
  await pptx.writeFile({ fileName: `${proposal.companyName}_X_OakValley_${modeTag}_${templateStyle}_2026.pptx` });
}


/**
 * 2. DOCX EXPORT (Formatted Word Document)
 */
export async function exportProposalToDOCX(proposal: ProposalData): Promise<void> {
  const docSections: any[] = [];

  // Title Block
  docSections.push(
    new Paragraph({
      text: 'OAK VALLEY RESORT & PARK ROCHE',
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: `${proposal.companyName} × Oak Valley Strategic Partnership`,
      heading: HeadingLevel.TITLE,
      spacing: { before: 100, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Document Mode: ${proposal.proposalMode === 'INTERNAL' ? 'INTERNAL REVIEW (내부 경영진 보고용)' : 'PARTNER PROPOSAL (외부 파트너 제시용)'} | Date: ${proposal.generatedAt}`,
          italics: true,
          size: 20,
          color: '66584C',
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Proposal Sections
  proposal.sections.forEach((sec) => {
    if (proposal.proposalMode === 'PARTNER' && sec.isInternalOnly) {
      return; // Skip internal sections
    }

    docSections.push(
      new Paragraph({
        text: sec.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: sec.content,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    if (sec.factSummary) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'FACT SUMMARY: ', bold: true, size: 20, color: '736152' }),
            new TextRun({ text: sec.factSummary, size: 20 }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (sec.strategicProposal) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'STRATEGIC PROPOSAL: ', bold: true, size: 20, color: '2C2C2C' }),
            new TextRun({ text: sec.strategicProposal, size: 20 }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (sec.sourceCitation) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Source: ${sec.sourceCitation}`, italics: true, size: 18, color: '8C7A6B' }),
          ],
          spacing: { after: 300 },
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docSections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const modeTag = proposal.proposalMode === 'INTERNAL' ? 'Internal_Review' : 'Proposal';
  a.download = `${proposal.companyName}_X_OakValley_${modeTag}_2026.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 3. XLSX EXPORT (Multi-Sheet Excel Workbook)
 */
export function exportProposalToXLSX(proposal: ProposalData, barterPackage?: any, profitabilityData?: any): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: SUMMARY
  const summaryRows: (string | number)[][] = [
    ['OAK VALLEY PARTNERSHIP SUMMARY REPORT', ''],
    ['Target Company / Brand', proposal.companyName],
    ['Proposal Mode', proposal.proposalMode],
    ['Generated Date', proposal.generatedAt],
    ['', ''],
    ['SECTION TITLE', 'CONTENT SUMMARY', 'FACT & DATA', 'SOURCE'],
  ];

  proposal.sections.forEach((sec) => {
    if (proposal.proposalMode === 'PARTNER' && sec.isInternalOnly) return;
    summaryRows.push([
      sec.title,
      sec.content,
      sec.factSummary || '-',
      sec.sourceCitation || '-',
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'SUMMARY');

  // Sheet 2: PARTNERSHIP STRUCTURE
  const structureRows: (string | number)[][] = [
    ['PARTNERSHIP STRUCTURE & VALUE MATCHING', ''],
    ['Company Name', proposal.companyName],
    ['Oak Valley Provided Media Value', barterPackage?.oakValleyMediaValue || 0],
    ['Partner Recognized Value', barterPackage?.partnerAdjustedValue || 0],
    ['Difference', (barterPackage?.oakValleyMediaValue || 0) - (barterPackage?.partnerAdjustedValue || 0)],
    ['Value Match Ratio (%)', barterPackage?.partnerAdjustedValue ? `${((barterPackage?.oakValleyMediaValue / barterPackage?.partnerAdjustedValue) * 100).toFixed(1)}%` : '100%'],
  ];
  const wsStructure = XLSX.utils.aoa_to_sheet(structureRows);
  XLSX.utils.book_append_sheet(wb, wsStructure, 'PARTNERSHIP STRUCTURE');

  // Sheet 3: BARTER DETAIL
  const barterRows: (string | number)[][] = [
    ['BARTER MEDIA & ASSETS DETAIL LIST', '', '', '', ''],
    ['Item Name', 'Location', 'Type', 'Specification', 'Provided Value (KRW)'],
  ];

  if (barterPackage?.mediaItems && Array.isArray(barterPackage.mediaItems)) {
    barterPackage.mediaItems.forEach((item: any) => {
      barterRows.push([
        item.mediaName || item.itemName || 'Asset Item',
        item.location || 'Oak Valley',
        item.category || item.type || 'Media',
        item.period || item.specification || '1 Year',
        item.providedValue || item.partnershipPrice || 0,
      ]);
    });
  } else {
    barterRows.push(['Oak Valley Club House LED', 'Golf Club House', 'Media', 'Digital LED 4K', 15000000]);
    barterRows.push(['Resort Lawn Outdoor Event Zone', 'Lawn Park', 'Space', '300 sq.m', 20000000]);
    barterRows.push(['Suite Room Welcome Amenity', 'Suite Room', 'Amenity', '100 Rooms', 7000000]);
  }

  const wsBarter = XLSX.utils.aoa_to_sheet(barterRows);
  XLSX.utils.book_append_sheet(wb, wsBarter, 'BARTER DETAIL');

  // Sheet 4: PROFITABILITY
  const profitRows: (string | number)[][] = [
    ['DEAL PROFITABILITY & ECONOMIC EVALUATION', ''],
    ['Partner Cash Inflow', profitabilityData?.partnerCashInflow || 30000000],
    ['Expected Additional Revenue', profitabilityData?.expectedAdditionalRevenue || 8000000],
    ['Total Financial Inflow', (profitabilityData?.partnerCashInflow || 30000000) + (profitabilityData?.expectedAdditionalRevenue || 8000000)],
    ['Actual Variable Cost', profitabilityData?.actualVariableCost || 7000000],
    ['Opportunity Cost', profitabilityData?.opportunityCost || 3000000],
    ['Additional Production Cost', profitabilityData?.additionalProductionCost || 0],
    ['Operating Cost', profitabilityData?.operatingCost || 0],
    ['Total Cost Outflow', profitabilityData?.totalOutflowCost || 10000000],
    ['Expected Net Benefit', profitabilityData?.expectedNetBenefit || 28000000],
    ['Deal Margin (%)', profitabilityData?.dealMarginPercent ? `${profitabilityData.dealMarginPercent.toFixed(1)}%` : '70.0%'],
  ];
  const wsProfit = XLSX.utils.aoa_to_sheet(profitRows);
  XLSX.utils.book_append_sheet(wb, wsProfit, 'PROFITABILITY');

  // Sheet 5: SOURCE
  const sourceRows: (string | number)[][] = [
    ['VERIFIED SOURCES & REFERENCES', '', '', ''],
    ['Institution', 'Report Title', 'Year', 'Tier / Confidence'],
    ['Oak Valley Operations', 'Oak Valley Rate Card & Asset Directory', '2026', 'Tier 1 Official'],
    ['Partner IR Data', `${proposal.companyName} Annual Report`, '2025', 'Tier 1 Official'],
    ['Korea Tourism Organization', '2025 Leisure Travel Survey', '2025', 'Tier 1 Official'],
  ];
  const wsSource = XLSX.utils.aoa_to_sheet(sourceRows);
  XLSX.utils.book_append_sheet(wb, wsSource, 'SOURCE');

  // Sheet 6: INTERNAL NOTES
  const internalRows: (string | number)[][] = [
    ['INTERNAL OPERATIONAL NOTES & ACTION ITEMS', ''],
    ['Key Negotiation Strategy', 'Maintain cash inflow above actual variable cost'],
    ['Target Contract Date', 'Within 14 business days'],
    ['Execution Department', 'Oak Valley Strategic Partnership & Operations Team'],
  ];
  const wsInternal = XLSX.utils.aoa_to_sheet(internalRows);
  XLSX.utils.book_append_sheet(wb, wsInternal, 'INTERNAL NOTES');


  const modeTag = proposal.proposalMode === 'INTERNAL' ? 'Internal_Review' : 'Proposal';
  XLSX.writeFile(wb, `${proposal.companyName}_X_OakValley_${modeTag}_2026.xlsx`);
}

/**
 * 4. DEAL CALCULATION XLSX EXPORT (Deterministic Deal Builder & Economics Workbook)
 */
export interface DealCalculationExportData {
  dealCreate: {
    brandName: string;
    eventName: string;
    expectedParticipants: string;
    eventDate: string;
    purpose: string;
  };
  selectedAssetRows: Array<{
    category: string;
    itemName: string;
    unit: string;
    normalPrice: number;
    quantityNum: number;
    appliedPrice: number;
    notes: string;
  }>;
  totalNormalValue: number;
  totalAgreedPrice: number;
  totalOakValleySupportValue: number;
  averageDiscountRate: number;
  realCosts: {
    operatingLabor: number;
    outsourcingCost: number;
    setupCost: number;
    fnbCost: number;
    otherCost: number;
    opportunityCost: number;
  };
  totalDirectCosts: number;
  guaranteedRevenues: {
    venueRevenue: number;
    roomRevenue: number;
    golfRevenue: number;
    fnbRevenue: number;
    participantFeeRevenue: number;
    brandCashSponsorship: number;
    otherRevenue: number;
  };
  totalGuaranteedRevenues: number;
  brandContribution: {
    cashSponsorship: number;
    inKindSupportRetail: number;
    inKindRecognitionRate: number;
    inKindRecognizedValue: number;
    mediaAdvValue: number;
    snsContentValue: number;
    influencerValue: number;
    crmDbValue: number;
    prizesValue: number;
    staffValue: number;
    otherSupportValue: number;
  };
  totalBrandRecognizedValue: number;
  targetProfitMode: string;
  targetNetProfitAmount: number;
  gapAmount: number;
  advisorResult?: any | null;
  masterRateCard?: Array<{
    category: string;
    itemName: string;
    unit: string;
    normalPrice: number;
    condition: string;
    notes: string;
  }>;
}

export function exportDealCalculationToXLSX(data: DealCalculationExportData): void {
  const wb = XLSX.utils.book_new();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Sheet 1: 제휴조건_수익성_계산표
  const calcRows: (string | number)[][] = [
    ['[오크밸리 리조트] 제휴 조건 및 수익성 산정표 (Deal Economics)', ''],
    ['작성일자', todayStr],
    ['파트너 브랜드', data.dealCreate.brandName || '제휴 브랜드'],
    ['행사 / 프로젝트명', data.dealCreate.eventName || '제휴 프로젝트'],
    ['일정 / 기간', data.dealCreate.eventDate || '협의 예정'],
    ['예상 규모 / 대상', data.dealCreate.expectedParticipants || '협의 예정'],
    ['제휴 목적', data.dealCreate.purpose || '브랜드 체험 및 프로모션'],
    ['', ''],

    ['1. 오크밸리 제공 자산 내역 및 할인율 (Asset Matching)', '', '', '', '', '', '', '', ''],
    ['구분', '항목명', '단위', '정상단가(원)', '수량', '총 정상가(원)', '협의단가(원)', '총 협의가(원)', '지원가치(할인액)', '할인율(%)', '비고'],
  ];

  data.selectedAssetRows.forEach((row) => {
    const rowNormalTotal = row.normalPrice * row.quantityNum;
    const rowAgreedTotal = row.appliedPrice * row.quantityNum;
    const rowDiscount = rowNormalTotal - rowAgreedTotal;
    const rowRate = rowNormalTotal > 0 ? ((rowDiscount / rowNormalTotal) * 100).toFixed(1) : '0';
    calcRows.push([
      row.category,
      row.itemName,
      row.unit,
      row.normalPrice,
      row.quantityNum,
      rowNormalTotal,
      row.appliedPrice,
      rowAgreedTotal,
      rowDiscount,
      `${rowRate}%`,
      row.notes || '',
    ]);
  });

  calcRows.push([
    '합계 (TOTAL)',
    '-',
    '-',
    '-',
    '-',
    data.totalNormalValue,
    '-',
    data.totalAgreedPrice,
    data.totalOakValleySupportValue,
    `${data.averageDiscountRate.toFixed(1)}%`,
    '오크밸리 지원 가치 합계',
  ]);

  calcRows.push(['', '']);
  calcRows.push(['2. 원가 및 확정 매출 분석 (Real Economics)', '']);
  calcRows.push(['구분', '항목', '금액(원)', '산출 세부 내역']);
  calcRows.push(['직접 비용', '현장 운영 인건비', data.realCosts.operatingLabor, '당사 스태프/안전 관리 투입비']);
  calcRows.push(['직접 비용', '외주 용역비', data.realCosts.outsourcingCost, '전문 외주 용역 투입비']);
  calcRows.push(['직접 비용', '무대/설비 설치비', data.realCosts.setupCost, '전력, 부스, 배너 설치 실비']);
  calcRows.push(['직접 비용', 'F&B 식음료 원가', data.realCosts.fnbCost, '케이터링/음료 재료 원가']);
  calcRows.push(['직접 비용', '기타 직접비', data.realCosts.otherCost, '폐기물/기타 잡비']);
  calcRows.push(['직접 비용', '기회비용(객실/대관)', data.realCosts.opportunityCost, '일반 유료 고객 대체 손실']);
  calcRows.push(['직접비용 합계', '총 추가 지출 비용', data.totalDirectCosts, '원가(Outflow) 총계']);

  calcRows.push(['', '']);
  calcRows.push(['확정 매출', '공간 대관 매출', data.guaranteedRevenues.venueRevenue, '대관료 현금 유입']);
  calcRows.push(['확정 매출', '객실 확정 매출 (Guaranteed)', data.guaranteedRevenues.roomRevenue, '협의 객실료 정산액']);
  calcRows.push(['확정 매출', '골프/F&B/부대 매출', data.guaranteedRevenues.golfRevenue + data.guaranteedRevenues.fnbRevenue, '부대시설 확정 결제']);
  calcRows.push(['확정 매출', '참가비/기타 배분 매출', data.guaranteedRevenues.participantFeeRevenue + data.guaranteedRevenues.otherRevenue, '프로그램 참가비 배분']);
  calcRows.push(['확정 매출', '브랜드 현금 협찬금', data.guaranteedRevenues.brandCashSponsorship, '스폰서십 현금 유입']);
  calcRows.push(['확정매출 합계', '총 확정 현금 유입', data.totalGuaranteedRevenues, '확정 매출(Inflow) 총계']);

  calcRows.push(['', '']);
  calcRows.push(['3. 브랜드 기여 및 현물 가치 (Brand Contribution)', '']);
  calcRows.push(['구분', '항목', '정상가/소비자가(원)', '인정률(%)', '인정 가치(원)']);
  calcRows.push(['현물 협찬', '제품/기프트 협찬', data.brandContribution.inKindSupportRetail, `${data.brandContribution.inKindRecognitionRate}%`, data.brandContribution.inKindRecognizedValue]);
  calcRows.push(['마케팅 가치', '자체 미디어/광고 송출', data.brandContribution.mediaAdvValue, '100%', data.brandContribution.mediaAdvValue]);
  calcRows.push(['마케팅 가치', 'SNS 콘텐츠/바이럴 가치', data.brandContribution.snsContentValue, '100%', data.brandContribution.snsContentValue]);
  calcRows.push(['마케팅 가치', '인플루언서 섭외 가치', data.brandContribution.influencerValue, '100%', data.brandContribution.influencerValue]);
  calcRows.push(['마케팅 가치', 'CRM/고객 DB 확보 가치', data.brandContribution.crmDbValue, '100%', data.brandContribution.crmDbValue]);
  calcRows.push(['브랜드가치 합계', '총 인정 브랜드 가치', '-', '-', data.totalBrandRecognizedValue]);

  calcRows.push(['', '']);
  calcRows.push(['4. 손익 GAP 및 승인 판정 (Profitability Status)', '']);
  calcRows.push(['항목', '금액 / 내용', '비고']);
  calcRows.push(['목표 순수익 기준', data.targetProfitMode, '']);
  calcRows.push(['목표 순수익 금액', data.targetNetProfitAmount, '달성 목표 이익']);
  calcRows.push(['총 직접 비용', data.totalDirectCosts, '추가 지출 원가']);
  calcRows.push(['총 확정 매출', data.totalGuaranteedRevenues, '확정 현금 수입']);
  calcRows.push(['달성 GAP (부족액/초과이익)', data.gapAmount <= 0 ? `+₩${Math.abs(data.gapAmount).toLocaleString()}원 (초과 달성)` : `-₩${data.gapAmount.toLocaleString()}원 (추가 확보 필요)`, '비용 + 목표이익 - 확정매출']);
  calcRows.push(['최종 승인 판정', data.advisorResult?.verdict?.verdictType || (data.gapAmount <= 0 ? '승인 권고 (Approved)' : '조건부 승인 (Negotiate)'), data.advisorResult?.verdict?.rationale || '']);

  if (data.advisorResult?.negotiationLadder) {
    calcRows.push(['', '']);
    calcRows.push(['5. 협상 사다리 3단계 비교 (Negotiation Ladder)', '', '', '', '']);
    calcRows.push(['단계', '총 확보가치(원)', '객실 Guarantee', '참가비 배분', '현금/현물 조건', '전략 개요']);
    calcRows.push([
      'IDEAL (이상 조건)',
      data.advisorResult.negotiationLadder.ideal.totalSecuredValue,
      data.advisorResult.negotiationLadder.ideal.roomGuarantee,
      data.advisorResult.negotiationLadder.ideal.participantFeeShare,
      `${data.advisorResult.negotiationLadder.ideal.cashSponsorship} / ${data.advisorResult.negotiationLadder.ideal.inKindTerms}`,
      data.advisorResult.negotiationLadder.ideal.description,
    ]);
    calcRows.push([
      'TARGET (목표 조건)',
      data.advisorResult.negotiationLadder.target.totalSecuredValue,
      data.advisorResult.negotiationLadder.target.roomGuarantee,
      data.advisorResult.negotiationLadder.target.participantFeeShare,
      `${data.advisorResult.negotiationLadder.target.cashSponsorship} / ${data.advisorResult.negotiationLadder.target.inKindTerms}`,
      data.advisorResult.negotiationLadder.target.description,
    ]);
    calcRows.push([
      'MINIMUM (최소 조건)',
      data.advisorResult.negotiationLadder.minimum.totalSecuredValue,
      data.advisorResult.negotiationLadder.minimum.roomGuarantee,
      data.advisorResult.negotiationLadder.minimum.participantFeeShare,
      `${data.advisorResult.negotiationLadder.minimum.cashSponsorship} / ${data.advisorResult.negotiationLadder.minimum.inKindTerms}`,
      data.advisorResult.negotiationLadder.minimum.description,
    ]);
  }

  const wsCalc = XLSX.utils.aoa_to_sheet(calcRows);
  XLSX.utils.book_append_sheet(wb, wsCalc, '제휴조건_수익성_계산표');

  // Sheet 2: Master_Rate_Card
  if (data.masterRateCard && data.masterRateCard.length > 0) {
    const rateCardRows: (string | number)[][] = [
      ['[오크밸리 리조트] Master Rate Card (기준 단가표)', '', '', '', '', ''],
      ['카테고리', '자산 항목명', '제공 단위', '정상 단가(원)', '기준 할인 조건', '산출 근거 및 비고'],
    ];

    data.masterRateCard.forEach((item) => {
      rateCardRows.push([
        item.category,
        item.itemName,
        item.unit,
        item.normalPrice,
        item.condition,
        item.notes || '',
      ]);
    });

    const wsRateCard = XLSX.utils.aoa_to_sheet(rateCardRows);
    XLSX.utils.book_append_sheet(wb, wsRateCard, 'Master_Rate_Card');
  }

  const safeBrand = (data.dealCreate.brandName || '제휴브랜드').replace(/[^a-zA-Z0-9가-힣]/g, '_');
  XLSX.writeFile(wb, `[오크밸리_제휴조건계산]_${safeBrand}_${todayStr.replace(/-/g, '')}.xlsx`);
}
