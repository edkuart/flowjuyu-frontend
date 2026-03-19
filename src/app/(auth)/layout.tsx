// src/app/(auth)/layout.tsx
// Transparent passthrough — each auth page owns its own AuthHeroLayout
// so this layout must not add any wrapper of its own.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}