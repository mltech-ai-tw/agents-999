import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted">
          This agent doesn&apos;t exist / 找不到這個代理人
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent-hover"
        >
          ← Home / 返回首頁
        </Link>
      </div>
    </div>
  );
}
