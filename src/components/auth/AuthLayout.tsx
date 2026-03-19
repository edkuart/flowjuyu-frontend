// src/components/auth/AuthLayout.tsx
//
// Inner form wrapper — provides consistent heading typography and spacing
// inside the white auth card rendered by AuthHeroLayout.
//
// AuthHeroLayout (outer): full-page split layout, white card shell, brand image
// AuthLayout     (inner): heading + children inside that card — used by all auth forms

interface AuthLayoutProps {
  heading: string;
  subheading?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ heading, subheading, children }: AuthLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight leading-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm text-neutral-500 leading-relaxed">{subheading}</p>
        )}
      </div>

      {children}
    </div>
  );
}
