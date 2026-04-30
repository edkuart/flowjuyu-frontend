"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

import { SellerSectionCard } from "@/components/seller/ui/SellerProfileSection";
import { sellerOptionCardClassName } from "@/components/seller/ui/sellerFormStyles";
import { cn } from "@/lib/utils";

type AccountSectionProps = {
  children: ReactNode;
  className?: string;
};

export function AccountSection({
  children,
  className = "",
}: AccountSectionProps) {
  return (
    <SellerSectionCard title="Panel" className={className} bodyClassName="p-6">
      {children}
    </SellerSectionCard>
  );
}

type AccountSectionHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
};

export function AccountSectionHeader({
  icon,
  title,
  description,
  badge,
}: AccountSectionHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#0f2e22]/8 pb-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-[#0F3D3A]/8 text-[#0F3D3A] shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {description && (
            <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>
      {badge}
    </div>
  );
}

type AccountCollapsibleSectionProps = AccountSectionHeaderProps & {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  defaultOpen?: boolean;
};

export function AccountCollapsibleSection({
  icon,
  title,
  description,
  badge,
  children,
  className,
  bodyClassName,
  defaultOpen = false,
}: AccountCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <SellerSectionCard title="Panel" className={className} bodyClassName="p-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition hover:bg-[#faf8f3] sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-[#0F3D3A]/8 text-[#0F3D3A] shadow-sm sm:flex">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-neutral-900">{title}</p>
              {badge}
            </div>
            {description && (
              <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
                {description}
              </p>
            )}
          </div>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#0f2e22]/10 bg-white text-neutral-500 shadow-sm">
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          id={contentId}
          className={cn("border-t border-[#0f2e22]/8 p-6", bodyClassName)}
        >
          {children}
        </div>
      )}
    </SellerSectionCard>
  );
}

type AccountSectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AccountSectionIntro({
  eyebrow,
  title,
  description,
}: AccountSectionIntroProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-[#8c9892] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-7 text-neutral-500">
        {description}
      </p>
    </div>
  );
}

type AccountPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  aside?: ReactNode;
};

export function AccountPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actionHref,
  actionLabel,
  aside,
}: AccountPageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {backHref && backLabel && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-accent)]"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            {backLabel}
          </Link>
        )}
        <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-[var(--seller-muted)]">
          {description}
        </p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--seller-accent)] transition hover:opacity-80"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {aside}
    </div>
  );
}

type AccountActionCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta?: string;
  featured?: boolean;
};

export function AccountActionCard({
  href,
  icon,
  title,
  description,
  cta = "Abrir",
  featured = false,
}: AccountActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[164px] flex-col overflow-hidden rounded-[22px] p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-34px_rgba(15,61,58,0.38)]",
        sellerOptionCardClassName,
        featured && "border-[#0F3D3A]/25 bg-white",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,_rgba(15,61,58,0.08),_transparent)]"
      />
      <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0F3D3A]/10 bg-[#0F3D3A]/8 text-[#0F3D3A] shadow-sm">
        {icon}
      </div>
      <div className="relative flex flex-1 flex-col">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-neutral-500">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#0F3D3A]">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

type AccountContentBandProps = {
  id?: string;
  children: ReactNode;
  className?: string;
};

export function AccountContentBand({
  id,
  children,
  className,
}: AccountContentBandProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 space-y-5 rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,_rgba(255,255,255,0.62),_rgba(250,248,242,0.88))] p-4 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
