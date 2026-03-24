// (public)/layout.tsx
// Header and Footer are already provided by the root layout.
// This group exists purely for route organization — no extra chrome.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
