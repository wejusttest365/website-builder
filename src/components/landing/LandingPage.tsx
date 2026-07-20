import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/builder/LoginDialog";
import bannerImage from "./before-login-landing-page-banner.png";
import { ArrowLeft, ArrowRight, Layers, Monitor, RefreshCcw, Rocket, Smartphone, Sparkles, ShieldCheck, Star, Tablet } from "lucide-react";

const NAV_ITEMS = ["Product", "Templates", "Pricing", "Resources", "Company"];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.64 12.206c0-.82-.074-1.61-.212-2.374H12v4.504h6.39c-.276 1.492-1.114 2.756-2.37 3.604v2.997h3.84c2.248-2.07 3.542-5.12 3.542-8.731z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.074 7.946-2.916l-3.84-2.997c-1.064.72-2.43 1.145-4.106 1.145-3.16 0-5.843-2.128-6.8-4.99H1.25v3.126A11.998 11.998 0 0012 24z" />
    <path fill="#FBBC05" d="M5.2 14.242c-.24-.72-.378-1.49-.378-2.242s.138-1.526.378-2.242V6.632H1.25A11.992 11.992 0 000 12c0 1.96.47 3.81 1.25 5.368l3.95-3.126z" />
    <path fill="#EA4335" d="M12 4.5c1.76 0 3.34.606 4.584 1.8l3.44-3.44C17.96 1.082 15.24 0 12 0 7.85 0 4.29 1.92 1.25 4.632l3.95 3.126C6.156 6.626 8.84 4.5 12 4.5z" />
  </svg>
);

const COMPANY_LOGOS = [
  "Google",
  "Microsoft",
  "Stripe",
  "Amazon",
  "Airbnb",
  "HubSpot",
  "OpenAI",
  "Vercel",
];

const FEATURE_CARDS = [
  {
    title: "Drag & Drop Builder",
    description: "Build visually with an intuitive drag-and-drop workspace.",
    icon: Rocket,
  },
  {
    title: "100+ Templates",
    description: "Choose from a professional collection of ready-made pages.",
    icon: Layers,
  },
  {
    title: "Responsive Design",
    description: "Create sites that look perfect on desktop, tablet, and mobile.",
    icon: Tablet,
  },
  {
    title: "Export & Publish",
    description: "Download clean code or publish directly to your domain.",
    icon: ShieldCheck,
  },
  {
    title: "No Coding Required",
    description: "Launch sites faster with true no-code page building.",
    icon: Sparkles,
  },
];

export function LandingPage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-violet-100 to-transparent opacity-90" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-violet-200 blur-3xl opacity-60" />

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <main className="relative z-10 mt-6 grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm shadow-violet-100">
              <Sparkles className="h-4 w-4" />
              Try it free — fast website builder for creators.
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Build Beautiful Websites,
                <span className="block text-violet-700">Your Way</span>
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-600">
                The fastest and easiest way to create professional websites without coding. Drag, drop, customize and publish your website in minutes.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                className="min-w-[14rem] rounded-full bg-violet-950 px-7 py-4 text-white shadow-xl shadow-violet-900/20 hover:bg-violet-900"
                onClick={() => {
                  setAuthMode("sign-up");
                  setAuthDialogOpen(true);
                }}
              >
                Try it free
              </Button>
              <Button
                variant="secondary"
                className="min-w-[14rem] rounded-full border border-slate-200 bg-white px-6 py-4 text-slate-950 shadow-sm hover:bg-slate-50"
                onClick={() => {
                  setAuthMode("sign-in");
                  setAuthDialogOpen(true);
                }}
              >
                <span className="mr-2 inline-flex items-center justify-center rounded-full bg-white px-1.5 py-1 shadow-sm">
                  <GoogleIcon />
                </span>
                Continue with Google
              </Button>
            </div>

            <p className="max-w-xl text-sm leading-7 text-slate-500">
              Start building your first page in seconds with a fast, free website builder—no code, no setup, no credit card required.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-700">
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-700" />
                No Credit Card Required
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-700" />
                Free Forever Plan
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-700" />
                Export Clean Code
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -right-8 top-8 h-44 w-44 rounded-full bg-violet-200 blur-3xl opacity-70" />
            <div className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-xl">
              <div className="p-5 sm:p-6">
                <div className="rounded-[32px] overflow-hidden bg-slate-100">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
                    <img
                      src={bannerImage}
                      alt="Landing page banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">Trusted by</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Teams who ship websites faster.</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {COMPANY_LOGOS.map((name) => (
                <span key={name} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-violet-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-12 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-700">Built for modern teams</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">Launch polished websites faster with drag-and-drop simplicity.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              WebToolOcean gives you the controls to build landing pages, marketing sites, and business sites without writing a single line of code. Combine prebuilt sections, flexible layout blocks, and built-in publishing tools.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Section library</p>
                <p className="mt-2 text-sm text-slate-600">Drag in ready-made sections like hero, features, pricing, and testimonials.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Realtime editing</p>
                <p className="mt-2 text-sm text-slate-600">See your changes instantly, then publish to a live site with one click.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Responsive ready</p>
                <p className="mt-2 text-sm text-slate-600">Every page adapts beautifully to desktop, tablet, and mobile devices.</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">Export or host</p>
                <p className="mt-2 text-sm text-slate-600">Publish directly or export clean code for your own workflow.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="rounded-[28px] border border-slate-200 bg-violet-950 p-6 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Ready-to-use</p>
                <h3 className="mt-3 text-2xl font-semibold">Templates that feel premium from day one.</h3>
                <p className="mt-3 text-sm leading-7 text-violet-100">Choose a polished layout and customize the brand, copy, and imagery in seconds.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-4xl font-semibold text-slate-950">24/7</p>
                  <p className="mt-2 text-sm text-slate-600">Support for builders who need help moving fast.</p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-4xl font-semibold text-slate-950">100+</p>
                  <p className="mt-2 text-sm text-slate-600">Templates and sections ready to customize.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_0.55fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-violet-700">What people are saying</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">Trusted by creators building their first website.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                “WebToolOcean made it simple to launch our homepage in under an hour. The drag-and-drop builder feels modern, the templates are polished, and publishing was instant.”
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 rounded-full bg-slate-50 px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm">M</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Maya Carter</p>
                    <p className="text-sm text-slate-500">Founder, Launch Studio</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-violet-950 px-4 py-3 text-sm font-semibold text-white shadow-sm">
                  <Star className="h-4 w-4 text-amber-300" />
                  4.9/5 rating
                </div>
              </div>
            </div>
            <div className="rounded-[28px] bg-violet-50 p-6 shadow-sm">
              <div className="mb-3 rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Users launched</p>
                <p className="mt-2 text-3xl font-semibold text-violet-950">12,000+</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-600">Fastest site published:</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">5 min</p>
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-600">Free plan users:</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">8,000+</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-200 bg-white/80 py-10 text-slate-700">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-700">Trusted by modern teams</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">Professional site builders rely on WebToolOcean.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  Keep your brand polished with premium templates, secure publishing, and 24/7 support for every launch.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Secure hosting</p>
                  <p className="mt-2 text-sm text-slate-600">SSL, backups, and fast global delivery included.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">Premium support</p>
                  <p className="mt-2 text-sm text-slate-600">Expert help whenever you need it, from setup to launch.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 WebToolOcean. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#" className="transition hover:text-slate-950">Privacy</a>
                <a href="#" className="transition hover:text-slate-950">Terms</a>
                <a href="#" className="transition hover:text-slate-950">Support</a>
              </div>
            </div>
          </div>
        </footer>

        <LoginDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          initialMode={authMode}
        />
      </div>

    </div>
  );
}
