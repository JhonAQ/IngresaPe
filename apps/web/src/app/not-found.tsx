import Link from 'next/link';

function CookieIcon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="52" r="40" fill="#E8C39E" />
      <circle cx="50" cy="48" r="40" fill="#F5D0A9" />
      <circle cx="32" cy="38" r="6" fill="#8B5A2B" />
      <circle cx="58" cy="32" r="5" fill="#8B5A2B" />
      <circle cx="68" cy="52" r="7" fill="#8B5A2B" />
      <circle cx="44" cy="62" r="5" fill="#8B5A2B" />
      <circle cx="26" cy="56" r="4" fill="#8B5A2B" />
      <circle cx="56" cy="72" r="4" fill="#8B5A2B" />
      <circle cx="74" cy="68" r="3" fill="#8B5A2B" />
    </svg>
  );
}

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-surface-50 flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-sm bg-white rounded-[2rem] border-2 border-surface-200 border-b-[6px] p-8 text-center">
        <div className="flex justify-center mb-6">
          <CookieIcon className="w-28 h-28 drop-shadow-md" />
        </div>

        <h1 className="font-black text-[26px] text-surface-800 leading-tight mb-3">
          Uuh, no deberías estar aquí
        </h1>

        <p className="text-surface-500 font-bold text-[16px] leading-snug mb-8">
          Toma una galleta y vuelve al inicio.
        </p>

        <Link
          href="/dashboard"
          className="inline-block w-full bg-primary-500 text-white font-black text-[16px] uppercase tracking-widest py-4 rounded-2xl border-b-[4px] border-primary-600 active:border-b-0 active:translate-y-[4px] transition-all text-center"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
