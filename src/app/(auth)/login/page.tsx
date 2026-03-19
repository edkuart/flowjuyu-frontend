// src/app/(auth)/login/page.tsx

import { LoginForm } from "@/components/auth/LoginForm";

// searchParams is available synchronously in Next.js 14 page components.
// We extract redirectTo here (server side) so LoginForm gets a typed prop
// instead of calling useSearchParams() (which would require a Suspense boundary).
interface Props {
  searchParams: { redirectTo?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return <LoginForm redirectTo={searchParams.redirectTo} />;
}
