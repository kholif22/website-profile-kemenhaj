import React from 'react';

// Lightweight fallback used by route-level Suspense boundaries.
// Kept dependency-free so it never pulls heavy modules into the entry chunk.
export default function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#D4AF37', borderWidth: '3px' }}
        />
        <span className="text-xs text-gray-400">Memuat halaman...</span>
      </div>
    </div>
  );
}
