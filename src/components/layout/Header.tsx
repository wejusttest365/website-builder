import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Templates", to: "/templates" },
  { label: "Pricing", to: "/pricing" },
  { label: "Documentation", to: "/documentation" },
];

const actionItems = [
  { label: "Login", to: "/login" },
  { label: "Sign Up", to: "/signup", primary: true },
];

function isActive(pathname: string, to: string) {
  if (to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function Header() {
  const router = useRouter();
  const pathname = router.state.location.pathname || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-slate-900 hover:text-slate-900">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold uppercase tracking-tight text-white shadow-sm">
            W
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">WebToolOcean</p>
            <p className="text-xs text-slate-500">Website Builder</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {actionItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.primary
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "text-slate-600 hover:bg-slate-900 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block h-0.5 w-5 rounded-full bg-slate-700"></span>
          <span className="mt-1 block h-0.5 w-5 rounded-full bg-slate-700"></span>
          <span className="mt-1 block h-0.5 w-5 rounded-full bg-slate-700"></span>
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {actionItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.primary
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Theme toggle
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="h-7 w-7 rounded-full bg-slate-100 text-center leading-7">U</span> Avatar
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="h-7 w-7 rounded-full bg-slate-100 text-center leading-7">S</span> Settings
            </span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
