'use client';

export function AncorAlternativeUrl({ url }: { url: string }) {
  return (
    <div
      onClick={() => window.open(url, '_blank')}
      className="text-blue-600 hover:text-blue-800 hover:underline line-clamp-2 cursor-pointer"
    >
      {url}
    </div>
  );
}
