export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-white px-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F7F7F7] flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-2xl font-bold text-[#222222] mb-2">Page not found</h1>
        <p className="text-[#717171] text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#222222] text-white font-semibold rounded-xl hover:bg-[#000000] transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
