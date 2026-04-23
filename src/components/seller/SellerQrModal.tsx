"use client";

// src/components/seller/SellerQrModal.tsx
// QR code modal for the seller store page.
// Generates a scannable QR pointing to /s/{sellerId}.

import { useState, useRef, useCallback } from "react";
import QRCode from "react-qr-code";
import { Download, Link2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PUBLIC_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.flowjuyu.com";

// Display host without protocol for cleaner printed label
const DISPLAY_HOST = PUBLIC_BASE.replace(/^https?:\/\//, "");

type Props = {
  open: boolean;
  onClose: () => void;
  sellerId: number;
  nombreComercio: string;
};

export default function SellerQrModal({ open, onClose, sellerId, nombreComercio }: Props) {
  const [linkCopied, setLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${PUBLIC_BASE}/s/${sellerId}`;
  const displayUrl = `${DISPLAY_HOST}/s/${sellerId}`;

  /* ── Copy link ── */
  const handleCopyLink = useCallback(() => {
    const fallback = () => {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      el.style.cssText = "position:fixed;opacity:0;";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch(fallback);
    } else {
      fallback();
    }
  }, [shareUrl]);

  /* ── Download: 1024×1024 PNG with QR + store name + URL ── */
  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;

    const svgEl = qrRef.current.querySelector("svg");
    if (!svgEl) return;

    const SIZE = 1024;
    const QR_SIZE = 640;          // QR occupies 640px of the 1024 canvas
    const QR_OFFSET = (SIZE - QR_SIZE) / 2; // 192px margin on each side
    const TEXT_START = QR_OFFSET + QR_SIZE + 32; // baseline for first text line

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // QR centered
      ctx.drawImage(img, QR_OFFSET, QR_OFFSET, QR_SIZE, QR_SIZE);

      // Store name — bold, dark
      ctx.fillStyle = "#0d2d20";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(nombreComercio, SIZE / 2, TEXT_START, SIZE - 80);

      // URL — lighter, smaller
      ctx.fillStyle = "#6b7280";
      ctx.font = "24px sans-serif";
      ctx.fillText(displayUrl, SIZE / 2, TEXT_START + 52, SIZE - 80);

      // Helper text
      ctx.fillStyle = "#9ca3af";
      ctx.font = "20px sans-serif";
      ctx.fillText("Escanea para ver la tienda", SIZE / 2, TEXT_START + 96, SIZE - 80);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `qr-tienda-${sellerId}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");

      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  }, [sellerId, nombreComercio, displayUrl]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-tight">
            Código QR de tu tienda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* ── QR card — white, padded, print-ready look ── */}
          <div
            ref={qrRef}
            className="flex flex-col items-center gap-3 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"
          >
            <QRCode
              value={shareUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#0d2d20"
              level="M"
            />

            {/* Store info below QR */}
            <div className="text-center mt-1 space-y-0.5">
              <p className="font-bold text-sm text-neutral-800 leading-snug line-clamp-2">
                {nombreComercio}
              </p>
              <p className="text-xs text-neutral-400 break-all select-all">
                {displayUrl}
              </p>
              <p className="text-[11px] text-neutral-400 italic">
                Escanea para ver la tienda
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Descargar para imprimir
            </Button>

            <Button
              className={`flex-1 gap-2 text-sm transition-colors ${
                linkCopied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white"
              }`}
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Copiar enlace
                </>
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-sm text-neutral-500"
            onClick={onClose}
          >
            Cerrar
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
