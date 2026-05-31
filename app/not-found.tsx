import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-display text-7xl font-semibold tracking-tight text-accent">
          404
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-muted">
          This agent doesn&apos;t exist · 找不到這個代理人
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
        >
          ← Home · 返回首頁
        </Link>
      </div>
    </div>
  );
}
