import { Suspense } from "react";
import SearchPageContent from "@/components/SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}