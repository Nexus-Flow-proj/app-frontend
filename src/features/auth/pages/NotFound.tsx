export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <p className="text-slate-500">Page not found</p>
      <a
        href="/dashboard"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Go to dashboard
      </a>
    </div>
  );
}
