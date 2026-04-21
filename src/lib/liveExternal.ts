export type LivePlatform = "tiktok" | "instagram" | "facebook";

export const LIVE_PLATFORM_OPTIONS: Array<{
  value: LivePlatform;
  label: string;
  placeholder: string;
}> = [
  {
    value: "tiktok",
    label: "TikTok",
    placeholder: "https://www.tiktok.com/@tu-cuenta/live",
  },
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "https://www.instagram.com/tu-cuenta/live",
  },
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "https://www.facebook.com/tu-pagina/live",
  },
];

const LIVE_PLATFORM_LABELS: Record<LivePlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
};

export function getLivePlatformLabel(platform?: string | null) {
  if (!platform) return null;
  return LIVE_PLATFORM_LABELS[platform as LivePlatform] ?? null;
}

export function isValidLiveExternalUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getLivePlatformTheme(platform?: string | null) {
  switch (platform) {
    case "instagram":
      return {
        surfaceClass:
          "border-[#d946ef]/15 bg-[radial-gradient(circle_at_top_left,_rgba(217,70,239,0.16),_transparent_42%),linear-gradient(135deg,_#fff8fb_0%,_#fff_55%,_#fff2f7_100%)]",
        badgeClass: "bg-[#fff0fb] text-[#a21caf] border border-[#d946ef]/15",
        iconClass: "text-[#a21caf]",
        accentClass: "text-[#a21caf]",
      };
    case "facebook":
      return {
        surfaceClass:
          "border-[#2563eb]/15 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_44%),linear-gradient(135deg,_#f5f9ff_0%,_#fff_55%,_#eef4ff_100%)]",
        badgeClass: "bg-[#eef4ff] text-[#1d4ed8] border border-[#2563eb]/15",
        iconClass: "text-[#1d4ed8]",
        accentClass: "text-[#1d4ed8]",
      };
    case "tiktok":
    default:
      return {
        surfaceClass:
          "border-[#0f172a]/12 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(244,63,94,0.14),_transparent_36%),linear-gradient(135deg,_#f8fafc_0%,_#ffffff_55%,_#fdf2f8_100%)]",
        badgeClass: "bg-[#f8fafc] text-[#0f172a] border border-[#0f172a]/10",
        iconClass: "text-[#0f172a]",
        accentClass: "text-[#0f172a]",
      };
  }
}
