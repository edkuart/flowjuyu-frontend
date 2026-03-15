// No "use client" — no hooks or browser APIs here. Consumers add their own directive.

import React from "react";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
export const token = {
  green: "#0f2e22",
  greenMid: "#184c37",
  bg: "#f6f2ea",
  bgAlt: "#eee9de",
  sand: "#c9a96e",
  muted: "#6b6358",
  border: "#ddd7cc"
} as const;

// ─── Global responsive styles injected once at page level ─────────────────────
export function SellPageStyles() {
  return (
    <style>{`

      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lato:wght@300;400;700&display=swap');

      /* ─── Global smoothness ───────────────────── */

      * {
        box-sizing: border-box;
      }

      a, button {
        transition: all .25s cubic-bezier(.4,0,.2,1);
      }

      svg {
        transition: transform .25s ease, color .25s ease;
      }

      /* ── Hero ─────────────────────────────────────── */

      .fj-hero-grid {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 64px;
        align-items: end;
      }

      .fj-hero-section {
        min-height: 88vh;
        padding-top: 72px;
        padding-bottom: clamp(64px, 8vw, 96px);
        display: flex;
        align-items: flex-end;

        /* subtle background life */
        background-image:
          radial-gradient(circle at 20% 30%, rgba(255,255,255,.04), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,.03), transparent 40%);
      }

      .fj-hero-h1 {
        font-size: clamp(48px, 8vw, 96px);
      }

      .fj-pilot-row {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        padding-top: 20px;
        border-top: 1px solid rgba(246,242,234,0.1);
      }

      /* ── Benefits ─────────────────────────────────── */

      .fj-benefit-row {
        display: grid;
        grid-template-columns: 56px 1fr 2fr;
        align-items: start;
        padding: 40px 0;
        gap: 32px;
      }

      .fj-benefit-row:hover {
        transform: translateY(-2px);
      }

      /* ── How It Works ──────────────────────────────── */

      .fj-steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: ${token.border};
        border-radius: 8px;
        overflow: hidden;
      }

      .fj-steps-grid > div:hover {
        transform: translateY(-4px);
      }

      .fj-steps-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 32px;
        margin-bottom: 80px;
      }

      /* ── Cultural Mission ──────────────────────────── */

      .fj-mission-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 96px;
        align-items: start;
      }

      /* ── FAQ header ───────────────────────────────── */

      .fj-faq-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 32px;
        margin-bottom: 64px;
      }

      .fj-faq-header a:hover svg {
        transform: translateX(4px);
      }

      /* ─── MOBILE (≤ 640px) ────────────────────────── */

      @media (max-width: 640px) {

        .fj-hero-section {
          min-height: auto;
          padding-top: 56px;
          padding-bottom: 56px;
          align-items: flex-start;
        }

        .fj-hero-grid {
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .fj-hero-h1 {
          font-size: clamp(40px, 11vw, 56px);
        }

        .fj-pilot-row {
          gap: 16px;
          padding-top: 16px;
        }

        .fj-benefit-row {
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 28px 0;
        }

        .fj-benefit-num {
          display: none;
        }

        .fj-steps-grid {
          grid-template-columns: 1fr;
          border-radius: 6px;
        }

        .fj-steps-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 40px;
        }

        .fj-mission-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }

        .fj-faq-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 40px;
        }

        .fj-faq-link {
          display: none;
        }

        .fj-cta-line {
          display: none;
        }
      }

      /* ─── TABLET (641 – 900px) ────────────────────── */

      @media (min-width: 641px) and (max-width: 900px) {

        .fj-hero-grid {
          grid-template-columns: 1fr;
          gap: 40px;
        }

        .fj-hero-section {
          min-height: auto;
          padding-top: 80px;
          padding-bottom: 72px;
          align-items: flex-start;
        }

        .fj-steps-grid {
          grid-template-columns: 1fr;
        }

        .fj-steps-header {
          margin-bottom: 48px;
        }

        .fj-mission-grid {
          grid-template-columns: 1fr;
          gap: 48px;
        }

        .fj-benefit-row {
          grid-template-columns: 40px 1fr;
          gap: 20px;
        }

        .fj-benefit-desc {
          grid-column: 2;
        }
      }

    `}</style>
  );
}

// ─── Primitive components ─────────────────────────────────────────────────────

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: token.sand,
        margin: "0 0 14px"
      }}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  light = false
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: "clamp(30px, 4.5vw, 52px)",
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: light ? token.bg : token.green,
        margin: 0
      }}
    >
      {children}
    </h2>
  );
}

export function BodyText({
  children,
  light = false
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      style={{
        fontFamily: "'Lato', sans-serif",
        fontSize: 15,
        lineHeight: 1.8,
        fontWeight: 300,
        color: light ? "rgba(246,242,234,0.65)" : token.muted,
        margin: 0
      }}
    >
      {children}
    </p>
  );
}

export function Rule({ light = false }: { light?: boolean }) {
  return (
    <hr
      style={{
        border: "none",
        height: 1,
        background: light ? "rgba(246,242,234,0.1)" : token.border,
        margin: 0
      }}
    />
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

export function IconLaptop() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="14" rx="2"/>
      <path d="M0 22h24"/>
    </svg>
  );
}

export function IconPercent() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
}

export function IconTag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
}

export function IconUserLine() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
    </svg>
  );
}

export function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

export function IconShoppingBag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

export function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform .3s ease"
      }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}