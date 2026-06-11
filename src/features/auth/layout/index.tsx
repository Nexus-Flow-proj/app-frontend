import { Outlet } from "react-router";
import { Link } from "react-router";
import { LayersIcon } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
              <LayersIcon className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Nexus<span className="text-indigo-600">-Flow</span>
            </span>
          </Link>
        </div>

        {/* Card shell — child routes render inside */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-slate-200/60">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
