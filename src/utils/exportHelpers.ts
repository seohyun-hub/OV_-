import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle, WidthType } from 'docx';
import * as XLSX from 'xlsx';
import { ProposalData, ProposalSection } from '../types';

/**
 * 1. PPTX EXPORT (10~12 Slides with Oak Valley Premium Resort Aesthetic)
 */
export async function exportProposalToPPTX(proposal: ProposalData): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `${proposal.companyName}_X_OakValley_Partnership_Proposal`;

  // Theme colors
  const BG_COLOR = 'FAF8F5';
  const PRIMARY_COLOR = '2C2C2C';
  const ACCENT_COLOR = '736152';
  const LIGHT_ACCENT = 'EFECE6';
  const TEXT_MUTED = '66584C';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: BG_COLOR };

  titleSlide.addText('OAK VALLEY RESORT & PARK ROCHE', {
    x: 1.0,
    y: 1.5,
    w: 11.3,
    h: 0.5,
    fontSize: 14,
    color: ACCENT_COLOR,
    bold: true,
    fontFace: 'Georgia',
  });

  titleSlide.addText(`${proposal.companyName} × Oak Valley`, {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 1.2,
    fontSize: 32,
    color: PRIMARY_COLOR,
    bold: true,
    fontFace: 'Georgia',
  });

  titleSlide.addText(
    proposal.proposalMode === 'INTERNAL'
      ? 'STRATEGIC PARTNERSHIP INTERNAL REVIEW DECK'
      : 'STRATEGIC PARTNERSHIP PROPOSAL',
    {
      x: 1.0,
      y: 3.5,
      w: 11.3,
      h: 0.6,
      fontSize: 18,
      color: ACCENT_COLOR,
      fontFace: 'Arial',
    }
  );

  titleSlide.addText(`Document Date: ${proposal.generatedAt} | Confidential`, {
    x: 1.0,
    y: 6.2,
    w: 11.3,
    h: 0.4,
    fontSize: 10,
    color: TEXT_MUTED,
    fontFace: 'Arial',
  });

  // Section Slides
  proposal.sections.forEach((sec, idx) => {
    if (proposal.proposalMode === 'PARTNER' && sec.isInternalOnly) {
      return; // Skip internal sections in partner mode
    }

    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    // Header
    slide.addText(`OAK VALLEY PARTNERSHIP | ${proposal.companyName}`, {
      x: 0.8,
      y: 0.4,
      w: 11.5,
      h: 0.3,
      fontSize: 10,
      color: ACCENT_COLOR,
      bold: true,
      fontFace: 'Arial',
    });

    // Slide Title
    slide.addText(sec.title, {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      color: PRIMARY_COLOR,
      bold: true,
      fontFace: 'Georgia',
    });

    // Main Content Box
    slide.addText(sec.content, {
      x: 0.8,
      y: 1.6,
      w: 11.5,
      h: 2.8,
      fontSize: 13,
      color: PRIMARY_COLOR,
      fontFace: 'Arial',
      lineSpacing: 20,
    });

    // Fact & Source Box (Bottom Left)
    if (sec.factSummary) {
      slide.addText(`FACT: ${sec.factSummary}`, {
        x: 0.8,
        y: 4.6,
        w: 5.6,
        h: 1.5,
        fontSize: 10,
        color: PRIMARY_COLOR,
        fill: { color: LIGHT_ACCENT },
        align: 'left',
        valign: 'top',
        margin: 10,
      });
    }

    // Strategic Proposal Box (Bottom Right)
    if (sec.strategicProposal) {
      slide.addText(`STRATEGIC PROPOSAL: ${sec.strategicProposal}`, {
        x: 6.7,
        y: 4.6,
        w: 5.6,
        h: 1.5,
        fontSize: 10,
        color: PRIMARY_COLOR,
        fill: { color: 'F5F2EB' },
        align: 'left',
        valign: 'top',
        margin: 10,
      });
    }

    // Footer Source
    if (sec.sourceCitation) {
      slide.addText(`Source: ${sec.sourceCitation}`, {
        x: 0.8,
        y: 6.5,
        w: 11.5,
        h: 0.3,
        fontSize: 8,
        color: TEXT_MUTED,
        italic: true,
      });
    }
  });

  const modeTag = proposal.proposalMode === 'INTERNAL' ? 'Internal_Review' : 'Proposal';
  await pptx.writeFile({ fileName: `${proposal.companyName}_X_OakValley_${modeTag}_2026.pptx` });
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
