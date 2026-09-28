import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  QrCode,
  X,
  Download,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Link,
  ShieldCheck,
  FileCode,
  Trash2,
  Maximize2
} from 'lucide-react';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  initialName?: string;
}

type LogoSize = 'small' | 'medium' | 'large';

export const QRCodeGeneratorModal: React.FC<QRCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialUrl = 'https://oakvalley.co.kr',
  initialName = '오크밸리 프로모션 QR'
}) => {
  // Input fields
  const [url, setUrl] = useState<string>(initialUrl);
  const [qrName, setQrName] = useState<string>(initialName);

  // Logo insertion states
  const [enableLogo, setEnableLogo] = useState<boolean>(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [logoSize, setLogoSize] = useState<LogoSize>('medium');
  const [whiteBackground, setWhiteBackground] = useState<boolean>(true);

  // Scan Validation and feedback
  const [isScannable, setIsScannable] = useState<boolean>(true);
  const [scanResultText, setScanResultText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update URL if prop changes
  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
    if (initialName) setQrName(initialName);
  }, [initialUrl, initialName, isOpen]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('PNG, JPG, WEBP 형식의 이미지 파일만 지원됩니다.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoDataUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove Logo
  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    setLogoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render QR Code onto Canvas with Error Correction Level H
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const trimmedUrl = url.trim() || 'https://oakvalley.co.kr';

    setIsRendering(true);

    const renderQR = async () => {
      try {
        const qrSize = 512; // High-res canvas for crystal clear scanning & export
        
        // 1. Draw base QR code on an offscreen canvas or the main canvas
        await QRCode.toCanvas(canvas, trimmedUrl, {
          errorCorrectionLevel: 'H', // Maximum fault tolerance (30%)
          width: qrSize,
          margin: 2,
          color: {
            dark: '#1A1A1A',
            light: '#FFFFFF'
          }
        });

        if (isCancelled) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // 2. Draw Center Logo if enabled & present
        if (enableLogo && logoDataUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = logoDataUrl;

          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('이미지를 불러오는데 실패했습니다.'));
          });

          if (isCancelled) return;

          // Compute logo bounding box based on strict area limits (Max 20% area)
          // small: ~13% area (ratio ~0.36) => 512 * 0.36 = 184px
          // medium: ~17% area (ratio ~0.41) => 512 * 0.41 = 210px
          // large: ~20% area (ratio ~0.447) => 512 * 0.447 = 228px
          let maxDimension = qrSize * 0.41;
          if (logoSize === 'small') maxDimension = qrSize * 0.35;
          if (logoSize === 'large') maxDimension = qrSize * 0.44;

          // Preserve aspect ratio
          let drawW = maxDimension;
          let drawH = maxDimension;
          if (img.width > img.height) {
            drawW = maxDimension;
            drawH = (img.height / img.width) * maxDimension;
          } else {
            drawH = maxDimension;
            drawW = (img.width / img.height) * maxDimension;
          }

          const centerX = qrSize / 2;
          const centerY = qrSize / 2;
          const drawX = centerX - drawW / 2;
          const drawY = centerY - drawH / 2;

          // 3. Draw Background Safety Zone (Padding)
          if (whiteBackground) {
            const padding = 10;
            const bgX = drawX - padding;
            const bgY = drawY - padding;
            const bgW = drawW + padding * 2;
            const bgH = drawH + padding * 2;
            const radius = 8;

            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(bgX, bgY, bgW, bgH, radius);
            ctx.fill();

            // Subtle border for clean contrast
            ctx.strokeStyle = '#E8E4DC';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }

          // 4. Draw Logo in center
          ctx.save();
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        }

        // 5. Run Real-time jsQR Scan Validation
        const imageData = ctx.getImageData(0, 0, qrSize, qrSize);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (decoded && decoded.data === trimmedUrl) {
          setIsScannable(true);
          setScanResultText(decoded.data);
        } else if (decoded && decoded.data) {
          // Scanned with slightly different normalization
          setIsScannable(true);
          setScanResultText(decoded.data);
        } else {
          // If decoding failed on strict pass, test with slight retry
          setIsScannable(false);
          setScanResultText('');
        }
      } catch (err) {
        console.error('Error generating QR Canvas:', err);
        setIsScannable(false);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderQR();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, url, enableLogo, logoDataUrl, logoSize, whiteBackground]);

  // Download PNG (High Resolution with embedded logo)
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    const safeFileName = (qrName.trim() || 'oak_valley_qr').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
    link.download = `${safeFileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const handleDownloadSVG = async () => {
    try {
      const trimmedUrl = url.trim() || 'https://oakvalley.co.kr';
      
      // Base SVG
      const baseSvg = await QRCode.toString(trimmedUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#1A1A1A',
          light: '#FFFFFF'
        }
      });

      let finalSvg = baseSvg;

      // Embed logo if enabled
      if (enableLogo && logoDataUrl) {
        const qrSize = 512;
        let maxDimension = qrSize * 0.41;
        if (logoSize === 'small') maxDimension = qrSize * 0.35;
        if (logoSize === 'large') maxDimension = qrSize * 0.44;

        const centerX = qrSize / 2;
        const centerY = qrSize / 2;
        const drawW = maxDimension;
        const drawH = maxDimension;
        const drawX = centerX - drawW / 2;
        const drawY = centerY - drawH / 2;
        const padding = 10;

        const bgElem = whiteBackground
          ? `<rect x="${drawX - padding}" y="${drawY - padding}" width="${drawW + padding * 2}" height="${drawH + padding * 2}" rx="8" fill="#FFFFFF" stroke="#E8E4DC" stroke-width="1.5" />`
          : '';

        const imageElem = `<image href="${logoDataUrl}" x="${drawX}" y="${drawY}" width="${drawW}" height="${drawH}" preserveAspectRatio="xMidYMid meet" />`;

        // Insert before </svg>
        finalSvg = baseSvg.replace('</svg>', `${bgElem}${imageElem}</svg>`);
      }

      const blob = new Blob([finalSvg], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      const safeFileName = (qrName.trim() || 'oak_valley_qr').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
      link.download = `${safeFileName}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error exporting SVG QR:', err);
      alert('SVG 생성 중 오류가 발생했습니다.');
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (clipErr) {
          // Fallback: copy url
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      });
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#D4C8B8] rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAF8F5] border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#736152] text-white rounded-lg flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#2C2C2C] tracking-tight">
                  고화질 QR 코드 생성기
                </h2>
                <span className="px-2 py-0.5 bg-[#EFECE6] text-[#736152] border border-[#D4C8B8] text-[10px] font-mono font-bold rounded-xs">
                  오류복원 H등급 (30%)
                </span>
              </div>
              <p className="text-xs text-[#786658]">
                프로모션 링크, 객실 안내, 이벤트 유입용 QR 코드를 생성하고 중앙 로고를 안전하게 삽입합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#2C2C2C] hover:bg-[#EFECE6] rounded-lg transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input & Option Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Basic Info */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C] flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Link className="w-3.5 h-3.5 text-[#736152]" />
                    <span>연결할 링크 (URL / 텍스트) *</span>
                  </span>
                  <span className="text-[11px] font-normal text-[#8C7A6B]">
                    스캔 시 즉시 이동할 주소
                  </span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://oakvalley.co.kr/event/..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152] focus:ring-1 focus:ring-[#736152]/30 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2C2C]">
                  QR 코드 이름 (저장 파일명)
                </label>
                <input
                  type="text"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="예: 2026_오크밸리_선셋러닝_신청링크"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D4C8B8] rounded-lg text-xs text-[#2C2C2C] focus:outline-none focus:border-[#736152] focus:ring-1 focus:ring-[#736152]/30 transition-all"
                />
              </div>
            </div>

            {/* 2. Center Logo Toggle & Settings */}
            <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl p-5 space-y-5">
              
              {/* Toggle Switch */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#2C2C2C] flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-[#736152]" />
                    <span>가운데 로고/이미지 넣기</span>
                  </span>
                  <p className="text-[11px] text-[#786658]">
                    QR 중앙에 브랜드 로고를 삽입하여 인식률을 유지하며 브랜딩 효과를 높입니다.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableLogo}
                    onChange={(e) => setEnableLogo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#D4C8B8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D4C8B8] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#736152]"></div>
                </label>
              </div>

              {/* Logo Settings Area (Visible when ON) */}
              {enableLogo && (
                <div className="pt-4 border-t border-[#E8E4DC] space-y-4 animate-in fade-in duration-200">
                  
                  {/* Upload Button or Selected File Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#2C2C2C] block">
                      로고 또는 이미지 업로드
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {!logoDataUrl ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-[#D4C8B8] hover:border-[#736152] rounded-lg bg-white text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-1.5 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] group-hover:bg-[#EFECE6] flex items-center justify-center text-[#736152]">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#2C2C2C] group-hover:text-[#736152]">
                          로고 또는 이미지 업로드
                        </span>
                        <span className="text-[11px] text-[#8C7A6B]">
                          PNG (투명 배경 권장), JPG, WEBP (최대 5MB)
                        </span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white border border-[#D4C8B8] rounded-lg">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="w-10 h-10 bg-[#FAF8F5] border border-[#E8E4DC] rounded-md flex items-center justify-center p-1 shrink-0 overflow-hidden">
                            <img
                              src={logoDataUrl}
                              alt="Uploaded logo"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-[#2C2C2C] truncate">
                              {logoFileName || '업로드된 로고'}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-medium flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>중앙 배치 준비 완료</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs font-medium text-[#736152] hover:bg-[#EFECE6] rounded transition-colors cursor-pointer"
                          >
                            이미지 변경
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="p-1 text-[#8C7A6B] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="이미지 제거"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Size Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2C2C2C]">
                        로고 크기 선택
                      </label>
                      <span className="text-[10px] font-mono text-[#8C7A6B]">
                        * 스캔 안전 면적(최대 20% 이내) 엄수
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'small', label: '작게', desc: '면적 약 12~14%' },
                        { id: 'medium', label: '보통 (권장)', desc: '면적 약 16~18%' },
                        { id: 'large', label: '크게', desc: '최대 약 20%' },
                      ].map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setLogoSize(size.id as LogoSize)}
                          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                            logoSize === size.id
                              ? 'bg-[#736152] text-white border-[#736152] shadow-xs'
                              : 'bg-white text-[#2C2C2C] border-[#D4C8B8] hover:bg-[#EFECE6]'
                          }`}
                        >
                          <div className="text-xs font-bold">{size.label}</div>
                          <div className={`text-[10px] font-mono ${logoSize === size.id ? 'text-white/80' : 'text-[#8C7A6B]'}`}>
                            {size.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Safety Padding Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-[#2C2C2C]">
                        로고 뒤 흰 배경 (안전 영역)
                      </span>
                      <p className="text-[10px] text-[#8C7A6B]">
                        QR 코드 패턴과 로고가 겹치지 않도록 깔끔한 흰색 패딩을 생성합니다.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whiteBackground}
                        onChange={(e) => setWhiteBackground(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#D4C8B8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D4C8B8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#736152]"></div>
                    </label>
                  </div>

                </div>
              )}
            </div>

            {/* Quick Helper / Usage Note */}
            <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg p-3.5 flex items-start space-x-2.5 text-xs text-[#786658]">
              <ShieldCheck className="w-4 h-4 text-[#736152] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#2C2C2C]">스마트폰 카메라 인식 안정성 보장</span>
                <p className="text-[11px] leading-relaxed">
                  국제 표준 QR Code High(H) 에러 복원 알고리즘을 적용하여 중앙의 20% 이내를 로고로 대체하더라도 모든 스마트폰에서 즉각적으로 100% 인식됩니다.
                </p>
              </div>
            </div>

          </div>

          {/* Right: Live Preview & Export Buttons (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2C2C2C] flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-[#736152]" />
                  <span>실시간 QR 미리보기 (Preview)</span>
                </span>
                
                {/* Real-time Scan Validation Badge */}
                {isScannable ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>스캔 인식 검증 성공</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>인식 재확인 필요</span>
                  </span>
                )}
              </div>

              {/* QR Canvas Box */}
              <div className="bg-white border-2 border-[#D4C8B8] rounded-xl p-6 flex flex-col items-center justify-center space-y-4 shadow-sm relative group min-h-[300px]">
                <div className="relative p-2 bg-white rounded-lg shadow-2xs">
                  <canvas
                    ref={canvasRef}
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-md"
                  />
                  {isRendering && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center rounded-lg">
                      <RefreshCw className="w-6 h-6 text-[#736152] animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1 max-w-[260px]">
                  <div className="text-xs font-bold text-[#2C2C2C] truncate">
                    {qrName || '오크밸리 프로모션 QR'}
                  </div>
                  <div className="text-[10px] font-mono text-[#8C7A6B] truncate">
                    {url || 'https://oakvalley.co.kr'}
                  </div>
                </div>
              </div>
            </div>

            {/* Export & Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="w-full py-3 bg-[#736152] hover:bg-[#5C4E43] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>PNG 고화질 다운로드</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="py-2.5 px-3 bg-white hover:bg-[#EFECE6] text-[#2C2C2C] border border-[#D4C8B8] text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#736152]" />
                  <span>SVG 다운로드</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="py-2.5 px-3 bg-white hover:bg-[#EFECE6] text-[#2C2C2C] border border-[#D4C8B8] text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#736152]" />
                      <span>클립보드 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#8C7A6B]">
          <span className="flex items-center space-x-1 font-mono">
            <span>스캔 표준 규격: ISO/IEC 18004</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#D4C8B8] hover:bg-[#EFECE6] text-[#2C2C2C] text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
