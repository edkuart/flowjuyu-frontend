import { Suspense } from "react";
import ConsentReviewClient from "./ConsentReviewClient";

function ConsentReviewFallback() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
        Cargando flujo de consentimiento...
      </div>
    </main>
  );
}

export default function ConsentReviewPage() {
  return (
    <Suspense fallback={<ConsentReviewFallback />}>
      <ConsentReviewClient />
    </Suspense>
  );
}
