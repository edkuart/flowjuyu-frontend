"use client";

// src/components/seller/SocialButtons.tsx
// Reusable circular social-link buttons for seller store hero sections.

import { Instagram, Facebook, Music2 } from "lucide-react";

type SocialLinks = {
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
};

type Props = {
  links: SocialLinks;
  className?: string;
  /** Optional callback fired when a social link is clicked. Receives the platform key. */
  onLinkClick?: (platform: keyof SocialLinks) => void;
};

const PLATFORMS = [
  {
    key: "instagram" as const,
    icon: Instagram,
    label: "Instagram",
    hover: "hover:bg-pink-500/30 hover:border-pink-400/50",
  },
  {
    key: "facebook" as const,
    icon: Facebook,
    label: "Facebook",
    hover: "hover:bg-blue-500/30 hover:border-blue-400/50",
  },
  {
    key: "tiktok" as const,
    icon: Music2,
    label: "TikTok",
    hover: "hover:bg-white/25 hover:border-white/40",
  },
];

export default function SocialButtons({ links, className = "", onLinkClick }: Props) {
  const active = PLATFORMS.filter((p) => !!links[p.key]);

  if (active.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {active.map(({ key, icon: Icon, label, hover }) => (
        <a
          key={key}
          href={links[key]!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          onClick={() => onLinkClick?.(key)}
          className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 text-white transition-all duration-200 hover:scale-110 ${hover}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}
