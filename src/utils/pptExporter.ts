import pptxgen from 'pptxgenjs';
import { TrendReport, CompanyReport } from '../types';

// Helper to format date
const getFormattedDate = () => {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Export Trend Intelligence Report to a styled 16:9 PowerPoint Presentation
 */
export const exportTrendReportToPPTX = (report: TrendReport) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Marketing Intelligence Platform';
  pptx.company = 'Enterprise AI Intelligence';
  pptx.title = `[Trend Report] ${report.query}`;

  const COLOR_NAVY = '0F172A';
  const COLOR_BLUE = '2563EB';
  const COLOR_SLATE = '334155';
  const COLOR_LIGHT_BG = 'F8FAFC';
  const COLOR_CARD_BG = 'FFFFFF';
  const COLOR_BORDER = 'E2E8F0';
  const COLOR_MUTED = '64748B';

  // Helper for consistent header
  const addSlideHeader = (slide: pptxgen.Slide, categoryTitle: string, mainTitle: string) => {
    // Top banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: COLOR_NAVY },
    });

    slide.addText(categoryTitle.toUpperCase(), {
      x: 0.6,
      y: 0.15,
      w: 10,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
      bold: true,
    });

    slide.addText(mainTitle, {
      x: 0.6,
      y: 0.4,
      w: 11,
      h: 0.4,
      fontSize: 18,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
    });

    // Bottom footer line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 7.1,
      w: '100%',
      h: 0.4,
      fill: { color: COLOR_NAVY },
    });

    slide.addText('MARKETING INTELLIGENCE PLATFORM | ENTERPRISE EDITION', {
      x: 0.6,
      y: 7.18,
      w: 8,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      color: '94A3B8',
      bold: true,
    });

    slide.addText(getFormattedDate(), {
      x: 10.5,
      y: 7.18,
      w: 2.2,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      color: '94A3B8',
      align: 'right',
    });
  };

  // --------------------------------------------------------------------------
  // SLIDE 1: Cover Slide
  // --------------------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_NAVY };

  // Decorative Accent Bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 0.15,
    h: 3.8,
    fill: { color: COLOR_BLUE },
  });

  slide1.addText('TREND INTELLIGENCE REPORT', {
    x: 1.2,
    y: 1.5,
    w: 10,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: '60A5FA',
    bold: true,
  });

  slide1.addText(report.query, {
    x: 1.2,
    y: 2.0,
    w: 10.5,
    h: 1.3,
    fontSize: 28,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
    breakLine: true,
  });

  // Metadata pills / info
  const metaText = `분석 주기: ${report.filters.period}  |  대상 지역: ${report.filters.region}  |  카테고리: ${report.filters.category}`;
  slide1.addText(metaText, {
    x: 1.2,
    y: 3.5,
    w: 10.5,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: 'CBD5E1',
  });

  slide1.addText(`생성일자: ${getFormattedDate()}  |  분석 엔진: Gemini Marketing AI`, {
    x: 1.2,
    y: 4.8,
    w: 10.5,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: '94A3B8',
  });

  // --------------------------------------------------------------------------
  // SLIDE 2: Executive Summary & Market Metrics
  // --------------------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide2, '1. Executive Summary & Market Signals', `핵심요약 및 주요 모니터링 지표: ${report.query}`);

  // Summary Card (Left Side)
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.2,
    w: 6.2,
    h: 5.5,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.05,
  });

  slide2.addText('EXECUTIVE SUMMARY', {
    x: 0.9,
    y: 1.4,
    w: 5.6,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_NAVY,
    bold: true,
  });

  const execSummaryItems = report.executiveSummary.map((item) => ({
    text: `•  ${item}\n`,
    options: { fontSize: 10, fontFace: 'Arial', color: COLOR_SLATE, lineSpacing: 18 },
  }));

  slide2.addText(execSummaryItems, {
    x: 0.9,
    y: 1.8,
    w: 5.6,
    h: 4.6,
    valign: 'top',
  });

  // Metrics (Right Side)
  slide2.addText('KEY SIGNAL METRICS', {
    x: 7.1,
    y: 1.2,
    w: 5.6,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_NAVY,
    bold: true,
  });

  report.metrics.slice(0, 3).forEach((metric, idx) => {
    const cardY = 1.6 + idx * 1.7;
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: 7.1,
      y: cardY,
      w: 5.6,
      h: 1.5,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    slide2.addText(metric.label, {
      x: 7.3,
      y: cardY + 0.15,
      w: 5.2,
      h: 0.25,
      fontSize: 11,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    slide2.addText(`${metric.currentValue} ${metric.unit}`, {
      x: 7.3,
      y: cardY + 0.45,
      w: 3.0,
      h: 0.4,
      fontSize: 20,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });

    slide2.addText(`YoY: ${metric.yoyChange}`, {
      x: 10.3,
      y: cardY + 0.5,
      w: 2.2,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: '059669',
      bold: true,
      align: 'right',
    });

    slide2.addText(`전망: ${metric.forecast}`, {
      x: 7.3,
      y: cardY + 0.95,
      w: 5.2,
      h: 0.4,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_MUTED,
    });
  });

  // --------------------------------------------------------------------------
  // SLIDE 3: Key Trend Drivers
  // --------------------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide3, '2. Key Trend Drivers', '주요 심층 트렌드 동인 및 소비자 행동');

  const trendCols = report.keyTrends.slice(0, 3);
  const colWidth = 3.8;
  const colGap = 0.3;

  trendCols.forEach((trend, idx) => {
    const colX = 0.6 + idx * (colWidth + colGap);

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: colX,
      y: 1.2,
      w: colWidth,
      h: 5.5,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    // Tag
    slide3.addText(`TREND 0${idx + 1}`, {
      x: colX + 0.2,
      y: 1.4,
      w: colWidth - 0.4,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });

    // Title
    slide3.addText(trend.title, {
      x: colX + 0.2,
      y: 1.7,
      w: colWidth - 0.4,
      h: 0.6,
      fontSize: 13,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    // Description
    slide3.addText(trend.description, {
      x: colX + 0.2,
      y: 2.35,
      w: colWidth - 0.4,
      h: 1.1,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    // Section 1: Growth driver
    slide3.addText('■ 성장의 원인 (Why Growing)', {
      x: colX + 0.2,
      y: 3.5,
      w: colWidth - 0.4,
      h: 0.2,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });
    slide3.addText(trend.whyGrowing, {
      x: colX + 0.2,
      y: 3.75,
      w: colWidth - 0.4,
      h: 0.8,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: COLOR_MUTED,
    });

    // Section 2: Corporate Usage
    slide3.addText('■ 기업 활용 방향 (Corporate Usage)', {
      x: colX + 0.2,
      y: 4.65,
      w: colWidth - 0.4,
      h: 0.2,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });
    slide3.addText(trend.corporateUsage, {
      x: colX + 0.2,
      y: 4.9,
      w: colWidth - 0.4,
      h: 1.6,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: COLOR_MUTED,
    });
  });

  // --------------------------------------------------------------------------
  // SLIDE 4: Notable Brand Benchmarks
  // --------------------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide4, '3. Notable Brand Benchmarks', '국내외 혁신 브랜드 벤치마킹 사례');

  const brandCases = report.brandCases.slice(0, 3);
  brandCases.forEach((bc, idx) => {
    const cardY = 1.2 + idx * 1.85;

    slide4.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: cardY,
      w: 12.1,
      h: 1.65,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    // Brand Badge
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: cardY + 0.2,
      w: 2.2,
      h: 0.4,
      fill: { color: COLOR_NAVY },
      rectRadius: 0.03,
    });
    slide4.addText(bc.brandName, {
      x: 0.8,
      y: cardY + 0.2,
      w: 2.2,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
      align: 'center',
    });

    // Project Title
    slide4.addText(bc.projectTitle, {
      x: 3.2,
      y: cardY + 0.2,
      w: 9.3,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    // Details Grid
    slide4.addText(`주요 실행: ${bc.action}`, {
      x: 3.2,
      y: cardY + 0.6,
      w: 9.3,
      h: 0.3,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    slide4.addText(`주목할 이유: ${bc.whyNotable}`, {
      x: 3.2,
      y: cardY + 0.9,
      w: 9.3,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_MUTED,
    });

    slide4.addText(`시사점 (Takeaway): ${bc.takeaway}`, {
      x: 3.2,
      y: cardY + 1.2,
      w: 9.3,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });
  });

  // --------------------------------------------------------------------------
  // SLIDE 5: Strategic Business & Partnership Opportunities
  // --------------------------------------------------------------------------
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide5, '4. Strategic Partnership Opportunities', '호텔·리조트·골프·레저 맞춤 신규 사업 기회 제안');

  const opps = report.opportunities.slice(0, 4);
  opps.forEach((opp, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;

    const cardX = 0.6 + col * 6.2;
    const cardY = 1.2 + row * 2.8;

    slide5.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: cardY,
      w: 5.9,
      h: 2.6,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    slide5.addText(`기회 0${idx + 1}`, {
      x: cardX + 0.2,
      y: cardY + 0.15,
      w: 5.5,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });

    slide5.addText(opp.opportunity, {
      x: cardX + 0.2,
      y: cardY + 0.4,
      w: 5.5,
      h: 0.5,
      fontSize: 12,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    slide5.addText(`• 타깃 고객: ${opp.targetCustomer}`, {
      x: cardX + 0.2,
      y: cardY + 0.95,
      w: 5.5,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    slide5.addText(`• 제휴 대상: ${opp.possiblePartner}`, {
      x: cardX + 0.2,
      y: cardY + 1.25,
      w: 5.5,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    slide5.addText(`• 수익/비즈니스 모델: ${opp.businessModel}`, {
      x: cardX + 0.2,
      y: cardY + 1.55,
      w: 5.5,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    slide5.addText(`• 기대 효과: ${opp.expectedBenefit}`, {
      x: cardX + 0.2,
      y: cardY + 1.85,
      w: 5.5,
      h: 0.6,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: '059669',
      bold: true,
    });
  });

  // Save PPTX
  const sanitizedFilename = `Trend_Report_${report.query.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${getFormattedDate()}.pptx`;
  pptx.writeFile({ fileName: sanitizedFilename });
};

/**
 * Export Company Intelligence Report to a styled 16:9 PowerPoint Presentation
 */
export const exportCompanyReportToPPTX = (report: CompanyReport) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Marketing Intelligence Platform';
  pptx.company = 'Enterprise AI Intelligence';
  pptx.title = `[Company Dossier] ${report.companyName}`;

  const COLOR_NAVY = '0F172A';
  const COLOR_BLUE = '2563EB';
  const COLOR_SLATE = '334155';
  const COLOR_LIGHT_BG = 'F8FAFC';
  const COLOR_CARD_BG = 'FFFFFF';
  const COLOR_BORDER = 'E2E8F0';
  const COLOR_MUTED = '64748B';

  const addSlideHeader = (slide: pptxgen.Slide, categoryTitle: string, mainTitle: string) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.9,
      fill: { color: COLOR_NAVY },
    });

    slide.addText(categoryTitle.toUpperCase(), {
      x: 0.6,
      y: 0.15,
      w: 10,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Arial',
      color: '94A3B8',
      bold: true,
    });

    slide.addText(mainTitle, {
      x: 0.6,
      y: 0.4,
      w: 11,
      h: 0.4,
      fontSize: 18,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 7.1,
      w: '100%',
      h: 0.4,
      fill: { color: COLOR_NAVY },
    });

    slide.addText('MARKETING INTELLIGENCE PLATFORM | ENTERPRISE EDITION', {
      x: 0.6,
      y: 7.18,
      w: 8,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      color: '94A3B8',
      bold: true,
    });

    slide.addText(getFormattedDate(), {
      x: 10.5,
      y: 7.18,
      w: 2.2,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      color: '94A3B8',
      align: 'right',
    });
  };

  // --------------------------------------------------------------------------
  // SLIDE 1: Cover Slide
  // --------------------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_NAVY };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 0.15,
    h: 3.8,
    fill: { color: COLOR_BLUE },
  });

  slide1.addText('COMPANY INTELLIGENCE & PARTNERSHIP DOSSIER', {
    x: 1.2,
    y: 1.5,
    w: 10,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: '60A5FA',
    bold: true,
  });

  slide1.addText(report.companyName, {
    x: 1.2,
    y: 2.0,
    w: 10.5,
    h: 1.2,
    fontSize: 32,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
  });

  slide1.addText(report.overview.summary, {
    x: 1.2,
    y: 3.3,
    w: 10.5,
    h: 1.0,
    fontSize: 11,
    fontFace: 'Arial',
    color: 'CBD5E1',
    lineSpacing: 18,
  });

  slide1.addText(`시장 위치: ${report.overview.marketPosition}  |  생성일자: ${getFormattedDate()}`, {
    x: 1.2,
    y: 4.8,
    w: 10.5,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    color: '94A3B8',
  });

  // --------------------------------------------------------------------------
  // SLIDE 2: Company Overview & Brand Identity
  // --------------------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide2, '1. Company Overview & Brand Identity', `${report.companyName} 기업 개요 및 브랜드 정체성`);

  // Left Column: Overview
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.2,
    w: 5.9,
    h: 5.5,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.05,
  });

  slide2.addText('COMPANY OVERVIEW', {
    x: 0.9,
    y: 1.4,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_NAVY,
    bold: true,
  });

  slide2.addText(`• 주요 사업: ${report.overview.mainBusinesses.join(', ')}`, {
    x: 0.9,
    y: 1.8,
    w: 5.3,
    h: 0.6,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`• 대표 브랜드: ${report.overview.mainBrands.join(', ')}`, {
    x: 0.9,
    y: 2.5,
    w: 5.3,
    h: 0.6,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`• 주요 상품/서비스: ${report.overview.productsServices.join(', ')}`, {
    x: 0.9,
    y: 3.2,
    w: 5.3,
    h: 0.8,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`• 핵심 타깃 고객: ${report.overview.targetCustomers}`, {
    x: 0.9,
    y: 4.1,
    w: 5.3,
    h: 1.0,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`• 시장 지위: ${report.overview.marketPosition}`, {
    x: 0.9,
    y: 5.2,
    w: 5.3,
    h: 0.5,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_BLUE,
    bold: true,
  });

  // Right Column: Brand Identity & 5 Keywords
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.2,
    w: 5.9,
    h: 5.5,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.05,
  });

  slide2.addText('BRAND IDENTITY & CORE KEYWORDS', {
    x: 7.1,
    y: 1.4,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_NAVY,
    bold: true,
  });

  // Keywords Badge Box
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 7.1,
    y: 1.8,
    w: 5.3,
    h: 0.6,
    fill: { color: COLOR_NAVY },
    rectRadius: 0.03,
  });

  const kwText = report.brandIdentity.keywords.map((k) => `#${k}`).join('   ');
  slide2.addText(kwText, {
    x: 7.2,
    y: 1.8,
    w: 5.1,
    h: 0.6,
    fontSize: 11,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
    align: 'center',
  });

  slide2.addText(`■ Positioning:\n${report.brandIdentity.positioning}`, {
    x: 7.1,
    y: 2.6,
    w: 5.3,
    h: 0.9,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`■ Core Message:\n"${report.brandIdentity.coreMessage}"`, {
    x: 7.1,
    y: 3.6,
    w: 5.3,
    h: 0.8,
    fontSize: 10,
    fontFace: 'Arial',
    color: COLOR_NAVY,
    bold: true,
  });

  slide2.addText(`■ Visual Identity:\n${report.brandIdentity.visualIdentity}`, {
    x: 7.1,
    y: 4.5,
    w: 5.3,
    h: 0.9,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: COLOR_SLATE,
  });

  slide2.addText(`■ Brand Personality: ${report.brandIdentity.personality}`, {
    x: 7.1,
    y: 5.5,
    w: 5.3,
    h: 0.5,
    fontSize: 9,
    fontFace: 'Arial',
    color: COLOR_MUTED,
  });

  // --------------------------------------------------------------------------
  // SLIDE 3: Recent Marketing Activity Timeline
  // --------------------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide3, '2. Marketing History & Activities', `${report.companyName} 최근 마케팅 활동 타임라인`);

  const activities = report.recentActivities.slice(0, 4);
  activities.forEach((act, idx) => {
    const cardY = 1.2 + idx * 1.35;

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: cardY,
      w: 12.1,
      h: 1.2,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    // Date & Type Badge
    slide3.addText(`${act.yearMonth} | [${act.type}]`, {
      x: 0.8,
      y: cardY + 0.15,
      w: 11.7,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });

    // Title
    slide3.addText(act.title, {
      x: 0.8,
      y: cardY + 0.4,
      w: 11.7,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    // Description
    slide3.addText(act.description, {
      x: 0.8,
      y: cardY + 0.7,
      w: 11.7,
      h: 0.4,
      fontSize: 9,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });
  });

  // --------------------------------------------------------------------------
  // SLIDE 4: Strategic Partnership Opportunities
  // --------------------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: COLOR_LIGHT_BG };
  addSlideHeader(slide4, '3. Partnership Opportunities', '호텔·리조트·골프·레저 도메인 맞춤 제휴 아이디어');

  const partnerships = report.partnerships.slice(0, 4);
  partnerships.forEach((p, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;

    const cardX = 0.6 + col * 6.2;
    const cardY = 1.2 + row * 2.8;

    slide4.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: cardY,
      w: 5.9,
      h: 2.65,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    // Domain pill
    slide4.addText(`[${p.domain}]  난이도: ${p.difficulty} | 확장성: ${p.potential}`, {
      x: cardX + 0.2,
      y: cardY + 0.15,
      w: 5.5,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: COLOR_BLUE,
      bold: true,
    });

    // Idea
    slide4.addText(p.idea, {
      x: cardX + 0.2,
      y: cardY + 0.4,
      w: 5.5,
      h: 0.5,
      fontSize: 12,
      fontFace: 'Arial',
      color: COLOR_NAVY,
      bold: true,
    });

    // Why this brand
    slide4.addText(`• 적합 사유: ${p.whyThisBrand}`, {
      x: cardX + 0.2,
      y: cardY + 0.95,
      w: 5.5,
      h: 0.5,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: COLOR_SLATE,
    });

    // Benefits
    slide4.addText(`• 상대 브랜드 혜택: ${p.brandBenefit}`, {
      x: cardX + 0.2,
      y: cardY + 1.5,
      w: 5.5,
      h: 0.4,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: COLOR_MUTED,
    });

    slide4.addText(`• 우리 사업 혜택: ${p.businessBenefit}`, {
      x: cardX + 0.2,
      y: cardY + 1.95,
      w: 5.5,
      h: 0.6,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: '059669',
      bold: true,
    });
  });

  // --------------------------------------------------------------------------
  // SLIDE 5: AI Top Recommendations
  // --------------------------------------------------------------------------
  const slide5 = pptx.addSlide();
  slide5.background = { color: COLOR_NAVY };

  slide5.addText('AI TOP RECOMMENDATIONS', {
    x: 0.6,
    y: 0.5,
    w: 10,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    color: '60A5FA',
    bold: true,
  });

  slide5.addText(`4. ${report.companyName} 최우선 협업 제휴 추천 (Top 3)`, {
    x: 0.6,
    y: 0.8,
    w: 12,
    h: 0.5,
    fontSize: 20,
    fontFace: 'Arial',
    color: 'FFFFFF',
    bold: true,
  });

  const recs = report.recommendations.slice(0, 3);
  recs.forEach((rec, idx) => {
    const cardX = 0.6 + idx * 4.1;

    slide5.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 1.5,
      w: 3.8,
      h: 5.1,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
      rectRadius: 0.05,
    });

    // Rank Badge
    slide5.addText(rec.rank, {
      x: cardX + 0.2,
      y: 1.7,
      w: 3.4,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: 'F59E0B',
      bold: true,
    });

    slide5.addText(rec.badgeText, {
      x: cardX + 0.2,
      y: 2.05,
      w: 3.4,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: '94A3B8',
    });

    // Idea title
    slide5.addText(rec.ideaTitle, {
      x: cardX + 0.2,
      y: 2.4,
      w: 3.4,
      h: 0.9,
      fontSize: 14,
      fontFace: 'Arial',
      color: 'FFFFFF',
      bold: true,
    });

    // Reasoning
    slide5.addText(rec.reasoning, {
      x: cardX + 0.2,
      y: 3.4,
      w: 3.4,
      h: 3.0,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: 'CBD5E1',
      lineSpacing: 18,
    });
  });

  // Save PPTX
  const sanitizedFilename = `Company_Dossier_${report.companyName.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${getFormattedDate()}.pptx`;
  pptx.writeFile({ fileName: sanitizedFilename });
};
