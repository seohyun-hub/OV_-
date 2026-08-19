import React from 'react';
import { Sliders, Calculator, Percent, DollarSign, RefreshCw } from 'lucide-react';
import { PartnerInput, BarterRecognitionRates } from '../../types';

interface BarterValueSectionProps {
  partnerInput: PartnerInput;
  rates: BarterRecognitionRates;
  onChangeRates: (newRates: BarterRecognitionRates) => void;
}

export const BarterValueSection: React.FC<BarterValueSectionProps> = ({
  partnerInput,
  rates,
  onChangeRates,
}) => {
  const cash = Number(partnerInput.cashInvestment || 0);
  const product = Number(partnerInput.productSponsorship || 0);
  const marketing = Number(partnerInput.marketingSupport || 0);
  const other = Number(partnerInput.otherSupport || 0);

  const nominalTotal = cash + product + marketing + other;

  const adjustedCash = (cash * rates.cash) / 100;
  const adjustedProduct = (product * rates.productSponsorship) / 100;
  const adjustedMarketing = (marketing * rates.marketingSupport) / 100;
  const adjustedOther = (other * rates.otherSupport) / 100;

  const adjustedTotal = adjustedCash + adjustedProduct + adjustedMarketing + adjustedOther;

  const fmtWon = (num: number) => `${Math.round(num).toLocaleString()}원`;

  const handleRateChange = (field: keyof BarterRecognitionRates, value: number) => {
    onChangeRates({
      ...rates,
      [field]: Math.min(100, Math.max(0, value)),
    });
  };

  const handleResetDefaultRates = () => {
    onChangeRates({
      cash: 100,
      productSponsorship: 70,
      marketingSupport: 50,
      otherSupport: 50,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center rounded-xs font-bold shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
              3. BARTER VALUE & RECOGNITION RATES
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              현금과 현물/마케팅 협찬 인정 비율 설정 및 실질 인정가치(Adjusted Partner Value) 산출
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDefaultRates}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
          title="기본 인정률(Cash 100%, 현물 70%, 마케팅 50%)로 초기화"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">인정률 초기화</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Top Summary Cards: Nominal vs Adjusted */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Nominal Partner Value (명목 가치 총합)
              </span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 mt-1">
                {fmtWon(nominalTotal)}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              * 파트너사가 제시한 현금 및 현물/마케팅 지원금액의 원가 단순 합계
            </p>
          </div>

          <div className="bg-blue-50/90 border border-blue-200 rounded-xs p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-blue-900 uppercase tracking-wider block">
                  Adjusted Partner Value (인정 가치 총합)
                </span>
                <span className="px-2 py-0.5 bg-blue-900 text-white font-mono text-[10px] rounded-xs font-bold">
                  최종 산출 기준
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-blue-900 mt-1">
                {fmtWon(adjustedTotal)}
              </div>
            </div>
            <p className="text-[11px] text-blue-800 font-medium mt-2">
              * 항목별 인정 비율(Recognition Rate) 적용 후 오크밸리가 최종 인정하는 제휴 가치
            </p>
          </div>

        </div>

        {/* Detailed Barter Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase font-mono text-[11px]">
                <th className="p-3">제공 항목 (Provided Item)</th>
                <th className="p-3 text-right">명목 가치 (Nominal Value)</th>
                <th className="p-3 text-center">인정 비율 (Recognition Rate)</th>
                <th className="p-3 text-right text-blue-900">실질 인정가치 (Adjusted Value)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              
              {/* Cash */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Cash Investment (현금)</td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">{fmtWon(cash)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rates.cash}
                      onChange={(e) => handleRateChange('cash', Number(e.target.value))}
                      className="w-20 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold w-12 text-center bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-300">
                      {rates.cash}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-900">{fmtWon(adjustedCash)}</td>
              </tr>

              {/* Product Sponsorship */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Product Sponsorship (현물 협찬)</td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">{fmtWon(product)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rates.productSponsorship}
                      onChange={(e) => handleRateChange('productSponsorship', Number(e.target.value))}
                      className="w-20 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold w-12 text-center bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-300">
                      {rates.productSponsorship}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-900">{fmtWon(adjustedProduct)}</td>
              </tr>

              {/* Marketing Support */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Marketing Support (마케팅 지원)</td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">{fmtWon(marketing)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rates.marketingSupport}
                      onChange={(e) => handleRateChange('marketingSupport', Number(e.target.value))}
                      className="w-20 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold w-12 text-center bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-300">
                      {rates.marketingSupport}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-900">{fmtWon(adjustedMarketing)}</td>
              </tr>

              {/* Other Support */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">
                  {partnerInput.otherSupportName || '기타 지원'}
                </td>
                <td className="p-3 text-right font-mono font-semibold text-slate-800">{fmtWon(other)}</td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rates.otherSupport}
                      onChange={(e) => handleRateChange('otherSupport', Number(e.target.value))}
                      className="w-20 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold w-12 text-center bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-300">
                      {rates.otherSupport}%
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono font-bold text-blue-900">{fmtWon(adjustedOther)}</td>
              </tr>

              {/* Total Row */}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                <td className="p-3 text-slate-900">총합계 (TOTAL)</td>
                <td className="p-3 text-right font-mono text-slate-900">{fmtWon(nominalTotal)}</td>
                <td className="p-3 text-center font-mono text-slate-500">-</td>
                <td className="p-3 text-right font-mono text-blue-900 text-sm">{fmtWon(adjustedTotal)}</td>
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
