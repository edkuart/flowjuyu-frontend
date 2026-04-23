"use client";

// src/components/seller/QrModal.tsx
// QR code modal for the seller dashboard. Shows a scannable QR that
// points to the public share link /p/{internal_code}.

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

type Props = {
  open: boolean;
  onClose: () => void;
  product: {
    nombre: string;
    internal_code: string;
  };
};

export default function QrModal({ open, onClose, product }: Props) {
  const [linkCopied, setLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${PUBLIC_BASE}/p/${product.internal_code}`;

  /* ── Copy share link ── */
  const handleCopyLink = useCallback(() => {
    const copy = (text: string) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        }).catch(fallback);
      } else {
        fallback();
      }
    };

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

    copy(shareUrl);
  }, [shareUrl]);

  /* ── Download QR as PNG ── */
  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;

    const svgEl = qrRef.current.querySelector("svg");
    if (!svgEl) return;

    const SIZE = 512;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

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
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `qr-${product.internal_code}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [product.internal_code]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold leading-tight">
            Código QR del producto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* Product name */}
          <p className="text-sm text-neutral-600 leading-snug line-clamp-2">
            {product.nombre}
          </p>

          {/* QR code */}
          <div
            ref={qrRef}
            className="flex items-center justify-center p-4 bg-white border border-neutral-200 rounded-xl"
          >
            <QRCode
              value={shareUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#0d2d20"
              level="M"
            />
          </div>

          {/* Internal code */}
          <p className="text-center text-xs font-mono text-neutral-400 tracking-wide select-all">
            {product.internal_code}
          </p>

          {/* Share URL */}
          <p className="text-center text-xs text-neutral-400 break-all leading-relaxed">
            {shareUrl}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Descargar QR
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
