// Server Component — route segment config works here, NOT in client children
import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";

// Tells Next.js to never statically cache this route
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    // Required: useSearchParams() inside SearchPageContent needs a Suspense boundary
    <Suspense fallback={<SearchFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 px-3 sm:px-6 lg:px-10 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 pt-8">
        <div className="hidden lg:block animate-pulse bg-white rounded-2xl h-96 shadow-sm" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm">
              <div className="w-full aspect-square bg-neutral-200 rounded-xl mb-4" />
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
              <div className="h-5 bg-neutral-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
