import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

interface QrMatrixCanvasProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates an authentic ISO/IEC 18004 QR matrix as a crisp vector SVG
 * inside a high-contrast Warm Titanium Bone (#F4F0E6) quiet-zone frame
 * so optical gate scanners read instantaneously on dark-carbon screens.
 */
export const QrMatrixCanvas: React.FC<QrMatrixCanvasProps> = ({
  value,
  size = 176,
  darkColor = "#07090D",
  lightColor = "#F4F0E6",
}) => {
  const [svgMarkup, setSvgMarkup] = useState<string>("");

  const safeValue = useMemo(
    () => value || "christ-central-concourse-pass",
    [value],
  );

  useEffect(() => {
    let active = true;
    QRCode.toString(safeValue, {
      type: "svg",
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((svg) => {
        if (active) setSvgMarkup(svg);
      })
      .catch(() => {
        if (active) setSvgMarkup("");
      });
    return () => {
      active = false;
    };
  }, [safeValue, size, darkColor, lightColor]);

  if (!svgMarkup) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-md border border-rule-strong bg-[#F4F0E6] font-mono text-[11px] font-bold text-[#07090D]"
        role="img"
        aria-label="Generating cryptographic QR code"
      >
        HMAC-QR
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-md border border-bone/30 bg-[#F4F0E6] p-1.5 shadow-editorial"
      role="img"
      aria-label="Signed rotating HMAC gate admission QR code"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};
