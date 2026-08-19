import ExcelJS from 'exceljs';
import { DealCalculationRow } from '../types';

export interface ExportDealExcelOptions {
  companyName: string;
  eventName?: string;
  writtenDate?: string;
  partnerCash: number;
  partnerInKindRetail: number;
  inKindRecognitionRate: number;
  partnerInKindRecognized: number;
  partnerOtherSupport: number;
  dealRows: DealCalculationRow[];
  actualVariableCost: number;
  opportunityCost: number;
  additionalOperatingCost: number;
  targetSurplusRate: number;
  minRequiredValue: number;
  targetRequiredValue: number;
  currentPartnerEffective: number;
  targetInKindRetailEquivalent: number;
  recommendationText: string;
}

export async function exportDealToExcel(options: ExportDealExcelOptions): Promise<void> {
  const {
    companyName,
    eventName = '오크밸리 브랜드 제휴 프로젝트',
    writtenDate = new Date().toISOString().substring(0, 10).replace(/-/g, '.'),
    partnerCash,
    partnerInKindRetail,
    inKindRecognitionRate,
    partnerInKindRecognized,
    partnerOtherSupport,
    dealRows,
    actualVariableCost,
    opportunityCost,
    additionalOperatingCost,
    targetSurplusRate,
    minRequiredValue,
    targetRequiredValue,
    currentPartnerEffective,
    targetInKindRetailEquivalent,
    recommendationText,
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Oak Valley Resort - Partnership Deal Builder';
  workbook.created = new Date();

  // Colors
  const darkHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2C2C2C' },
  };
  const taupeHeaderFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF736152' },
  };
  const warmBeigeFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFAF8F5' },
  };
  const totalRowFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEFECE6' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFD4C8B8' } },
    left: { style: 'thin', color: { argb: 'FFD4C8B8' } },
    bottom: { style: 'thin', color: { argb: 'FFD4C8B8' } },
    right: { style: 'thin', color: { argb: 'FFD4C8B8' } },
  };

  const totalBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF736152' } },
    left: { style: 'thin', color: { argb: 'FFD4C8B8' } },
    bottom: { style: 'double', color: { argb: 'FF736152' } },
    right: { style: 'thin', color: { argb: 'FFD4C8B8' } },
  };

  // ==========================================
  // SHEET 1. 제휴 산정표
  // ==========================================
  const sheet1 = workbook.addWorksheet('제휴 산정표', {
    views: [{ showGridLines: true }],
  });

  // Set Column Widths for Sheet 1
  sheet1.columns = [
    { key: 'colA', width: 22 }, // 일자
    { key: 'colB', width: 24 }, // 장소
    { key: 'colC', width: 34 }, // 사용명
    { key: 'colD', width: 18 }, // 시간/수량
    { key: 'colE', width: 16 }, // 정상가
    { key: 'colF', width: 16 }, // 제휴가
    { key: 'colG', width: 12 }, // 할인율
    { key: 'colH', width: 18 }, // 할인금액
    { key: 'colI', width: 36 }, // 비고
  ];

  // Title Row
  sheet1.mergeCells('A1:I1');
  const titleCell1 = sheet1.getCell('A1');
  titleCell1.value = '[오크밸리] Partnership Deal - 제휴 산정표';
  titleCell1.font = { name: 'Malgun Gothic', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell1.fill = darkHeaderFill;
  titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet1.getRow(1).height = 36;

  // Metadata Block (Rows 3 ~ 7)
  const metaLabels = [
    ['업체명', companyName || '미지정'],
    ['행사명', eventName],
    ['작성일', writtenDate],
    ['파트너 현금 지원', partnerCash],
    ['파트너 현물 지원 (소비자가)', partnerInKindRetail],
  ];

  metaLabels.forEach((labelPair, idx) => {
    const rowNum = 3 + idx;
    const labelCell = sheet1.getCell(`A${rowNum}`);
    const valCell = sheet1.getCell(`B${rowNum}`);

    labelCell.value = labelPair[0];
    labelCell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FF736152' } };
    labelCell.fill = warmBeigeFill;
    labelCell.border = thinBorder;
    labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

    valCell.value = labelPair[1];
    valCell.font = { name: 'Malgun Gothic', size: 10, bold: typeof labelPair[1] === 'number' };
    valCell.border = thinBorder;
    valCell.alignment = { vertical: 'middle', horizontal: typeof labelPair[1] === 'number' ? 'right' : 'left' };

    if (typeof labelPair[1] === 'number') {
      valCell.numFmt = '#,##0 "원"';
    }

    sheet1.getRow(rowNum).height = 22;
  });

  // Table Headers (Row 9)
  const headersSheet1 = ['일자', '장소', '사용명', '시간/수량', '정상가', '제휴가', '할인율', '할인금액', '비고'];
  sheet1.getRow(9).values = headersSheet1;
  sheet1.getRow(9).height = 26;

  headersSheet1.forEach((_, colIdx) => {
    const cell = sheet1.getCell(9, colIdx + 1);
    cell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = taupeHeaderFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // Data Rows (Row 10 onwards)
  let startDataRow = 10;
  dealRows.forEach((r, idx) => {
    const currentR = startDataRow + idx;
    const isEven = idx % 2 === 1;
    const rowFill: ExcelJS.Fill = isEven
      ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF8F5' } }
      : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

    const row = sheet1.getRow(currentR);
    row.height = 24;

    const qty = Number(r.quantityNum) || 1;
    const normalPriceVal = Number(r.normalPrice) || 0;
    const appliedPriceVal = Number(r.appliedPrice) || 0;
    const totalNormalVal = normalPriceVal * qty;
    const totalAppliedVal = appliedPriceVal * qty;
    const discountVal = Number(r.discountAmount) || (totalNormalVal - totalAppliedVal);
    const discountRateVal = totalNormalVal > 0 ? discountVal / totalNormalVal : 0;

    row.getCell(1).value = r.date || '-';
    row.getCell(2).value = r.location || '-';
    row.getCell(3).value = r.itemName || '-';
    row.getCell(4).value = `${r.quantityPeriod || ''} (${qty}개/회)`.trim();
    row.getCell(5).value = totalNormalVal;
    row.getCell(6).value = totalAppliedVal;
    row.getCell(7).value = discountRateVal;
    row.getCell(8).value = discountVal;
    row.getCell(9).value = r.notes || '';

    // Alignments & Number Formats
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'right' };
    row.getCell(9).alignment = { vertical: 'middle', horizontal: 'left' };

    row.getCell(5).numFmt = '#,##0';
    row.getCell(6).numFmt = '#,##0';
    row.getCell(7).numFmt = '0.0%';
    row.getCell(8).numFmt = '#,##0';

    for (let col = 1; col <= 9; col++) {
      const cell = row.getCell(col);
      cell.font = { name: 'Malgun Gothic', size: 9 };
      cell.fill = rowFill;
      cell.border = thinBorder;
    }
  });

  // Total Row for Sheet 1
  const totalRowIdx = startDataRow + dealRows.length;
  sheet1.mergeCells(`A${totalRowIdx}:D${totalRowIdx}`);
  const totalLabelCell = sheet1.getCell(`A${totalRowIdx}`);
  totalLabelCell.value = '합 계 (Total)';
  totalLabelCell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FF2C2C2C' } };
  totalLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Formulas for Total Row
  const lastDataRow = totalRowIdx - 1;
  const normalSumCell = sheet1.getCell(`E${totalRowIdx}`);
  const appliedSumCell = sheet1.getCell(`F${totalRowIdx}`);
  const discountRateAvgCell = sheet1.getCell(`G${totalRowIdx}`);
  const discountSumCell = sheet1.getCell(`H${totalRowIdx}`);

  if (dealRows.length > 0) {
    normalSumCell.value = { formula: `SUM(E${startDataRow}:E${lastDataRow})` };
    appliedSumCell.value = { formula: `SUM(F${startDataRow}:F${lastDataRow})` };
    discountSumCell.value = { formula: `SUM(H${startDataRow}:H${lastDataRow})` };
    discountRateAvgCell.value = { formula: `IF(E${totalRowIdx}>0, H${totalRowIdx}/E${totalRowIdx}, 0)` };
  } else {
    normalSumCell.value = 0;
    appliedSumCell.value = 0;
    discountSumCell.value = 0;
    discountRateAvgCell.value = 0;
  }

  normalSumCell.numFmt = '#,##0';
  appliedSumCell.numFmt = '#,##0';
  discountRateAvgCell.numFmt = '0.0%';
  discountSumCell.numFmt = '#,##0';

  sheet1.getRow(totalRowIdx).height = 26;

  for (let col = 1; col <= 9; col++) {
    const cell = sheet1.getCell(totalRowIdx, col);
    cell.font = { name: 'Malgun Gothic', size: 10, bold: true };
    cell.fill = totalRowFill;
    cell.border = totalBorder;
  }
  discountSumCell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FF990000' } };


  // ==========================================
  // SHEET 2. 제휴 조건 분석
  // ==========================================
  const sheet2 = workbook.addWorksheet('제휴 조건 분석', {
    views: [{ showGridLines: true }],
  });

  sheet2.columns = [
    { key: 'colA', width: 38 }, // 구분/항목
    { key: 'colB', width: 22 }, // 수치/금액
    { key: 'colC', width: 14 }, // 단위/비율
    { key: 'colD', width: 42 }, // 설명 및 산출 기준
  ];

  // Title Row Sheet 2
  sheet2.mergeCells('A1:D1');
  const titleCell2 = sheet2.getCell('A1');
  titleCell2.value = '[오크밸리] Partnership Deal - 제휴 조건 & 수익성 종합 분석';
  titleCell2.font = { name: 'Malgun Gothic', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell2.fill = darkHeaderFill;
  titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet2.getRow(1).height = 36;

  // Function to write category section headers in Sheet 2
  let currentSheet2Row = 3;

  const writeSectionHeader = (title: string) => {
    sheet2.mergeCells(`A${currentSheet2Row}:D${currentSheet2Row}`);
    const cell = sheet2.getCell(`A${currentSheet2Row}`);
    cell.value = title;
    cell.font = { name: 'Malgun Gothic', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = taupeHeaderFill;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet2.getRow(currentSheet2Row).height = 26;
    currentSheet2Row++;
  };

  const writeAnalysisRow = (
    label: string,
    val: number | string,
    unit: string,
    desc: string,
    isBold = false,
    isHighlight = false,
    numFormat = '#,##0'
  ) => {
    const row = sheet2.getRow(currentSheet2Row);
    row.height = 22;

    row.getCell(1).value = label;
    row.getCell(2).value = val;
    row.getCell(3).value = unit;
    row.getCell(4).value = desc;

    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: typeof val === 'number' ? 'right' : 'center' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left' };

    if (typeof val === 'number' && numFormat) {
      row.getCell(2).numFmt = numFormat;
    }

    const rowFill: ExcelJS.Fill = isHighlight ? totalRowFill : warmBeigeFill;

    for (let col = 1; col <= 4; col++) {
      const cell = row.getCell(col);
      cell.font = { name: 'Malgun Gothic', size: 10, bold: isBold };
      cell.fill = rowFill;
      cell.border = thinBorder;
    }

    currentSheet2Row++;
  };

  // Section 1: 당사 투입 및 할인 원가
  writeSectionHeader('1. 당사 지원 및 원가 지출 항목 (Oak Valley Costs)');
  const oakValleyTotalOutflow = options.dealRows.reduce((a, b) => a + (b.discountAmount || 0), 0) + actualVariableCost + opportunityCost + additionalOperatingCost;

  writeAnalysisRow('당사 할인 지원가치', options.dealRows.reduce((a, b) => a + (b.discountAmount || 0), 0), '원', 'STEP 1 산정표 자동 집계 총 할인액');
  writeAnalysisRow('추가 실제비용 (식음·원재료 실비)', actualVariableCost, '원', '행사 시 당사가 직접 지출하는 실비 원가');
  writeAnalysisRow('Opportunity Cost (기회비용)', opportunityCost, '원', '성수기 객실/골프 미판매 기대 매출 손실');
  writeAnalysisRow('현장 설치 및 추가 운영비', additionalOperatingCost, '원', '임시 부스, 인건비, 철거 실비');
  writeAnalysisRow('당사 총 지원 및 원가 합계', oakValleyTotalOutflow, '원', '당사 총 할인액 + 투입 실비 + 기회비용', true, true);

  currentSheet2Row++; // blank line

  // Section 2: 파트너 유입 및 제안가치
  writeSectionHeader('2. 파트너 제안 및 유입가치 항목 (Partner Inflows)');
  writeAnalysisRow('파트너 현금 지원', partnerCash, '원', '순수 현금 스폰서십 및 협찬금');
  writeAnalysisRow('파트너 현물 소비자가', partnerInKindRetail, '원', '파트너사 제공 물품의 공식 소비자가');
  writeAnalysisRow('현물 인정률', inKindRecognitionRate / 100, '%', '내부 평가에 반영하는 현물 인정 비율', false, false, '0.0%');
  writeAnalysisRow('현물 실질 인정가', partnerInKindRecognized, '원', '소비자가 × 현물 인정률');
  writeAnalysisRow('파트너 기타 지원가치', partnerOtherSupport, '원', 'SNS 마케팅, 인플루언서, 패키징 지원 등');
  writeAnalysisRow('파트너 총 실질 제공가치 (CURRENT OFFER)', currentPartnerEffective, '원', '현금 + 현물 실질 인정가 + 기타 지원가치', true, true);

  currentSheet2Row++; // blank line

  // Section 3: 3대 벤치마크 & 협상 조건 분석
  writeSectionHeader('3. 제휴 조건 & 3대 벤치마크 분석 (Negotiation Benchmarks)');
  const surplusGap = currentPartnerEffective - targetRequiredValue;

  writeAnalysisRow('목표 추가가치율 (Target Surplus Rate)', targetSurplusRate / 100, '%', '당사 지원가 대비 목표 가치 이익률', false, false, '0.0%');
  writeAnalysisRow('MINIMUM 필요가치 (손실 방지 한도)', minRequiredValue, '원', '실제 투입 원가 및 손실 회수를 위한 마지노선');
  writeAnalysisRow('TARGET 필요가치 (목표 권장 가치)', targetRequiredValue, '원', '당사 지원가치 + 목표 추가가치율 반영 가치');
  writeAnalysisRow('CURRENT OFFER (현재 파트너 제안가)', currentPartnerEffective, '원', '현재 파트너가 제시한 총 실질 가치');
  writeAnalysisRow(
    '목표 대비 부족/초과 금액',
    surplusGap,
    '원',
    surplusGap >= 0 ? '목표 가치 조건 초과 충족' : '목표 가치 달성을 위해 추가 협의 필요',
    true,
    true,
    '+#,##0 "원";-#,##0 "원";0 "원"'
  );
  writeAnalysisRow('현금 기준 권장 협의금액', targetRequiredValue, '원', '전액 현금 협찬으로 수령할 시 권장액');
  writeAnalysisRow('현물 기준 권장 소비자가', targetInKindRetailEquivalent, '원', `현물 인정률 ${inKindRecognitionRate}% 기준 권장 소비자가`);

  currentSheet2Row++; // blank line

  // Section 4: 최종 권장 협의안 문장
  writeSectionHeader('4. 최종 권장 협의안 (Executive Negotiation Recommendation)');

  sheet2.mergeCells(`A${currentSheet2Row}:D${currentSheet2Row + 2}`);
  const recCell = sheet2.getCell(`A${currentSheet2Row}`);
  recCell.value = recommendationText;
  recCell.font = { name: 'Malgun Gothic', size: 10, bold: true, color: { argb: 'FF2C2C2C' } };
  recCell.fill = warmBeigeFill;
  recCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

  for (let r = currentSheet2Row; r <= currentSheet2Row + 2; r++) {
    for (let c = 1; c <= 4; c++) {
      sheet2.getCell(r, c).border = thinBorder;
      sheet2.getCell(r, c).fill = warmBeigeFill;
    }
  }

  // Write to Buffer & Download .xlsx in Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `오크밸리_제휴산정표_${companyName || '파트너'}_${writtenDate.replace(/\./g, '')}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Compatibility export for legacy package comparison view
export async function exportPartnershipProposalToExcel(
  partnerInput: any,
  recognitionRates: any,
  activePkg: any,
  packages: any[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('제휴안 요약');
  sheet.addRow(['업체명', partnerInput?.companyName || '미지정']);
  sheet.addRow(['현금 투자금', partnerInput?.cashInvestment || 0]);
  sheet.addRow(['현물 협찬', partnerInput?.productSponsorship || 0]);
  sheet.addRow(['선택 패키지', activePkg?.name || '패키지']);
  sheet.addRow(['제공가치 총액', activePkg?.oakValleyMediaValue || 0]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `오크밸리_제휴안_${partnerInput?.companyName || '파트너'}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

