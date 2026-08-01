import type { WidgetInstance } from "@/components/builder/widgets/widgetRegistry";

export interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  html: string;
  widgetInstance?: WidgetInstance;
  css?: string;
  js?: string;
  thumbBg: string; // gradient for placeholder thumbnail
}

const grad = (from: string, to: string) => `linear-gradient(135deg, ${from}, ${to})`;

// Utility to build tailwind-styled sections. The runtime iframe loads Tailwind via CDN
// so classes just work.
export const CATEGORIES = [
  "Navigation",
  "Hero",
  "Banners",
  "About",
  "Features",
  "Services",
  "Portfolio",
  "Carousel",
  "Gallery",
  "Pricing",
  "Testimonials",
  "FAQ",
  "Team",
  "Contact",
  "Footer",
  "Cards",
  "Forms",
  "Buttons",
  "Call To Action",
  "Blog",
  "Login",
  "Signup",
] as const;

export const SECTION_LIBRARY: SectionTemplate[] = [
  // NAVIGATION
  {
    id: "nav-simple",
    name: "Simple Navbar",
    category: "Navigation",
    thumbBg: grad("#4f46e5", "#7c3aed"),
    html: `<nav data-wto-nav class="w-full bg-white border-b border-gray-200">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-xl font-bold text-gray-900">Brand</a>
    <ul data-wto-nav-menu class="hidden md:flex gap-8 text-sm text-gray-700">
      <li><a href="index.html" class="hover:text-indigo-600">Home</a></li>
      <li><a href="about-us.html" class="hover:text-indigo-600">About</a></li>
      <li><a href="services.html" class="hover:text-indigo-600">Services</a></li>
      <li><a href="contact.html" class="hover:text-indigo-600">Contact</a></li>
    </ul>
    <a href="#" class="hidden md:inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Get Started</a>
    <button data-wto-nav-btn aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
  </div>
</nav>`,
  },
  {
    id: "nav-centered",
    name: "Centered Logo Nav",
    category: "Navigation",
    thumbBg: grad("#0ea5e9", "#22d3ee"),
    html: `<nav class="w-full bg-slate-900 text-white">
  <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
    <ul class="flex gap-6 text-sm"><li><a href="#" class="hover:text-sky-400">Shop</a></li><li><a href="#" class="hover:text-sky-400">Blog</a></li></ul>
    <a href="#" class="text-2xl font-black tracking-widest">LOGO</a>
    <ul class="flex gap-6 text-sm"><li><a href="#" class="hover:text-sky-400">About</a></li><li><a href="#" class="hover:text-sky-400">Cart</a></li></ul>
  </div>
</nav>`,
  },
  {
    id: "nav-driving-academy",
    name: "Driving Academy Header",
    category: "Navigation",
    thumbBg: grad("#15803d", "#166534"),
    html: `<header class="w-full bg-white shadow-sm">
  <div class="border-b border-slate-200 bg-[#064e1f]">
    <div class="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-2 text-sm text-slate-100 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap items-center gap-4 font-medium">
        <a href="tel:1-800-555-1234" class="transition hover:text-white">1-800-555-1234</a>
        <a href="mailto:hello@drivewell.com" class="transition hover:text-white">hello@drivewell.com</a>
      </div>
      <div class="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-200">Premium Driving School</div>
    </div>
  </div>
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <a href="#" class="text-lg font-black tracking-tight text-slate-900">DriveWell Academy</a>
    <ul data-wto-nav-menu class="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
      <li><a href="index.html" class="transition hover:text-slate-900">Home</a></li>
      <li><a href="about.html" class="transition hover:text-slate-900">About</a></li>
      <li><a href="services.html" class="transition hover:text-slate-900">Services</a></li>
      <li><a href="faqs.html" class="transition hover:text-slate-900">FAQs</a></li>
      <li><a href="contact.html" class="transition hover:text-slate-900">Contact</a></li>
      <li><a href="#" class="rounded-full border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900">Student login</a></li>
    </ul>
    <button data-wto-nav-btn aria-label="Open menu" class="rounded-full border border-slate-300 p-2 text-slate-700 md:hidden">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>
    </button>
  </div>
</header>`,
  },
  {
    id: "topbar-classic",
    name: "Information Bar · Classic",
    category: "Navigation",
    thumbBg: grad("#0f172a", "#334155"),
    html: `<section data-wto-topbar="true" class="w-full bg-slate-950 text-slate-100">
  <div class="mx-auto max-w-7xl px-6 py-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr] items-center">
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <div data-wto-phone="true" class="font-medium">+1 (800) 555-1234</div>
      <div data-wto-email="true">hello@drivewell.com</div>
      <div data-wto-address="true" class="text-slate-300">123 Main St, City</div>
      <div data-wto-hours="true" class="text-slate-300">Mon–Fri 9am–6pm</div>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-3">
      <div data-wto-note="true" class="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">Free lesson available this month</div>
      <a data-wto-topbar-button="true" href="#" class="inline-flex items-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Book now</a>
      <div class="flex items-center gap-2">
        <a data-wto-social="facebook" href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-slate-100 hover:bg-white/20 transition" title="Facebook"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
        <a data-wto-social="twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-slate-100 hover:bg-white/20 transition" title="Twitter"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.837.856c1.02-.608 1.8-1.572 2.165-2.723-.954.565-2.01.978-3.127 1.195a4.948 4.948 0 00-8.455 4.516 14.01 14.01 0 01-10.175-5.154 4.957 4.957 0 001.532 6.61 4.92 4.92 0 01-2.24-.616c-.054 2.281 1.581 4.415 3.949 4.89-.69.188-1.41.188-2.126.063.598 1.86 2.359 3.201 4.423 3.242-1.56 1.223-3.5 1.954-5.604 1.954-.364 0-.721-.021-1.076-.062 1.966 1.26 4.3 2.002 6.817 2.002 8.18 0 12.638-6.762 12.638-12.637 0-.192-.004-.385-.012-.577.867-.627 1.619-1.413 2.214-2.312z"/></svg></a>
        <a data-wto-social="instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-slate-100 hover:bg-white/20 transition" title="Instagram"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg></a>
        <a data-wto-social="linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-slate-100 hover:bg-white/20 transition" title="LinkedIn"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.945v5.442h-3.554s.05-8.836 0-9.756h3.15v1.381c.43-.664 1.199-1.61 2.923-1.61 2.135 0 3.74 1.39 3.74 4.377v5.608zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.951.77-1.71 1.944-1.71 1.174 0 1.915.759 1.915 1.71 0 .951-.74 1.71-1.944 1.71zm1.575 11.597H3.762V9.557h3.15v10.895zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg></a>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "topbar-modern",
    name: "Information Bar · Modern",
    category: "Navigation",
    thumbBg: grad("#e2e8f0", "#f8fafc"),
    html: `<section data-wto-topbar="true" class="w-full bg-white text-slate-900">
  <div class="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-700">
      <div data-wto-note="true" class="rounded-full bg-slate-900/5 px-3 py-1">Open enrollment ends soon.</div>
      <span data-wto-phone="true" class="font-semibold text-slate-900">+1 800 555 1234</span>
      <span data-wto-email="true">hello@drivewell.com</span>
      <span data-wto-hours="true">Mon–Fri 9am–6pm</span>
      <span data-wto-address="true">123 Main St, City</span>
    </div>
    <div class="flex flex-wrap items-center gap-3 justify-end">
      <a data-wto-topbar-button="true" href="#" class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Contact us</a>
      <div class="flex items-center gap-2">
        <a data-wto-social="facebook" href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition" title="Facebook"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
        <a data-wto-social="twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition" title="Twitter"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.837.856c1.02-.608 1.8-1.572 2.165-2.723-.954.565-2.01.978-3.127 1.195a4.948 4.948 0 00-8.455 4.516 14.01 14.01 0 01-10.175-5.154 4.957 4.957 0 001.532 6.61 4.92 4.92 0 01-2.24-.616c-.054 2.281 1.581 4.415 3.949 4.89-.69.188-1.41.188-2.126.063.598 1.86 2.359 3.201 4.423 3.242-1.56 1.223-3.5 1.954-5.604 1.954-.364 0-.721-.021-1.076-.062 1.966 1.26 4.3 2.002 6.817 2.002 8.18 0 12.638-6.762 12.638-12.637 0-.192-.004-.385-.012-.577.867-.627 1.619-1.413 2.214-2.312z"/></svg></a>
        <a data-wto-social="instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition" title="Instagram"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg></a>
        <a data-wto-social="linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition" title="LinkedIn"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.945v5.442h-3.554s.05-8.836 0-9.756h3.15v1.381c.43-.664 1.199-1.61 2.923-1.61 2.135 0 3.74 1.39 3.74 4.377v5.608zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.951.77-1.71 1.944-1.71 1.174 0 1.915.759 1.915 1.71 0 .951-.74 1.71-1.944 1.71zm1.575 11.597H3.762V9.557h3.15v10.895zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg></a>
      </div>
    </div>
  </div>
</section>`,
  },

  // HERO
  {
    id: "banner-image",
    name: "Image Banner",
    category: "Banners",
    thumbBg: grad("#0f766e", "#14b8a6"),
    html: `<section class="w-full overflow-hidden bg-slate-950 text-white">
  <div class="relative">
    <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80" alt="Driving banner" class="absolute inset-0 h-full w-full object-cover" />
    <div class="absolute inset-0 bg-slate-950/55"></div>
    <div class="relative mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
      <div class="max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur">
        <div class="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Banner</div>
        <h1 class="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A bold image banner for any page.</h1>
        <p class="mt-6 text-lg text-slate-200">Create a reusable page banner with strong imagery, overlay, and calls to action for section landing pages.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#" class="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400">Start now</a>
          <a href="#" class="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:border-white/40 hover:text-white">Learn more</a>
        </div>
      </div>
    </div>
  </div>
</section>`,
  },
  {
    id: "hero-centered",
    name: "Centered Hero",
    category: "Hero",
    thumbBg: grad("#8b5cf6", "#ec4899"),
    html: `<section class="w-full bg-white">
  <div class="max-w-4xl mx-auto px-6 py-28 text-center">
    <span class="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">NEW · v2.0 out now</span>
    <h1 class="mt-6 text-6xl font-black text-gray-900 leading-tight">The modern way to <span class="text-indigo-600">ship websites</span></h1>
    <p class="mt-6 text-xl text-gray-600">Powerful. Fast. Beautiful. Everything you need in one place.</p>
    <div class="mt-10 flex justify-center gap-4"><a href="#" class="px-8 py-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800">Get Started Free</a></div>
  </div>
</section>`,
  },
  {
    id: "hero-carousel",
    name: "Hero Carousel",
    category: "Hero",
    thumbBg: grad("#0f766e", "#14b8a6"),
    html: `<section class="w-full bg-slate-950 text-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div class="max-w-xl">
        <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Premium driving academy</p>
        <h1 class="mt-6 text-5xl font-black tracking-tight">A training experience built for confident drivers.</h1>
        <p class="mt-6 text-lg text-slate-300">A premium hero carousel that shows your programs, student wins, and training highlights with bold imagery.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="#contact" class="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Register now</a>
          <a href="#about" class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:text-white">Learn more</a>
        </div>
      </div>
      <div class="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-4">
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-none" data-carousel-track style="transition: transform 0.5s ease-in-out; transform: translateX(0%);">
          <article class="min-w-[300px] shrink-0 rounded-[1.75rem] bg-slate-950 text-white shadow-2xl overflow-hidden">
            <div class="aspect-[4/3] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Student driving" class="h-full w-full object-cover" data-wto-idx="0" />
            </div>
            <div class="p-6">
              <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Student success</p>
              <h2 class="mt-3 text-2xl font-semibold text-white">Confident behind the wheel</h2>
              <p class="mt-3 text-sm text-slate-300">Hands-on lessons and real-world training for every learner.</p>
              <a href="#contact" class="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100">Book a lesson</a>
            </div>
          </article>
          <article class="min-w-[300px] shrink-0 rounded-[1.75rem] bg-slate-950 text-white shadow-2xl overflow-hidden">
            <div class="aspect-[4/3] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80" alt="Classroom training" class="h-full w-full object-cover" data-wto-idx="1" />
            </div>
            <div class="p-6">
              <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Expert instructors</p>
              <h2 class="mt-3 text-2xl font-semibold text-white">Support that builds confidence</h2>
              <p class="mt-3 text-sm text-slate-300">Personal coaching, modern curriculum, and a calm learning environment.</p>
              <a href="#contact" class="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100">Meet our team</a>
            </div>
          </article>
          <article class="min-w-[300px] shrink-0 rounded-[1.75rem] bg-slate-950 text-white shadow-2xl overflow-hidden">
            <div class="aspect-[4/3] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80" alt="Road training" class="h-full w-full object-cover" data-wto-idx="2" />
            </div>
            <div class="p-6">
              <p class="text-xs uppercase tracking-[0.3em] text-cyan-300">Road-ready</p>
              <h2 class="mt-3 text-2xl font-semibold text-white">Prepared for every test</h2>
              <p class="mt-3 text-sm text-slate-300">Practical road practice, checklist training, and confidence for the exam.</p>
              <a href="#contact" class="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100">Start today</a>
            </div>
          </article>
        </div>
        <button type="button" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-2 text-white shadow-lg hover:bg-white/20" data-carousel-prev aria-label="Previous">←</button>
        <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-2 text-white shadow-lg hover:bg-white/20" data-carousel-next aria-label="Next">→</button>
        <button type="button" class="absolute top-4 right-4 z-20 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20" data-carousel-autoplay-toggle>
          Auto: On
        </button>
      </div>
    </div>
  </div>
  <script>
    (function() {
      var script = document.currentScript || document.scripts[document.scripts.length - 1];
      var section = script ? script.parentElement : null;
      if (!section) return;
      var track = section.querySelector('[data-carousel-track]');
      var prevBtn = section.querySelector('[data-carousel-prev]');
      var nextBtn = section.querySelector('[data-carousel-next]');
      var autoButton = section.querySelector('[data-carousel-autoplay-toggle]');
      if (!track || !prevBtn || !nextBtn) return;
      var slideCount = Math.max(1, track.children.length);
      var currentIndex = 0;
      var autoMove = true;
      var autoMoveInterval = 5000;
      var autoMoveTimer = null;
      function setAutoplayButton() {
        if (!autoButton) return;
        autoButton.textContent = autoMove ? 'Auto: On' : 'Auto: Off';
      }
      function stopAutoMove() {
        if (autoMoveTimer) {
          clearInterval(autoMoveTimer);
          autoMoveTimer = null;
        }
      }
      function startAutoMove() {
        stopAutoMove();
        if (!autoMove) return;
        autoMoveTimer = setInterval(function() {
          currentIndex = (currentIndex + 1) % slideCount;
          update();
        }, autoMoveInterval);
      }
      function update() {
        var offset = currentIndex * (100 / slideCount);
        track.style.transform = 'translateX(-' + offset + '%)';
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      if (autoButton) {
        autoButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          autoMove = !autoMove;
          setAutoplayButton();
          if (autoMove) startAutoMove();
          else stopAutoMove();
        });
      }
      update();
      setAutoplayButton();
      startAutoMove();
    })();
  </script>
</section>`,
  },

  // ABOUT
  {
    id: "about-two-col",
    name: "About Two Column",
    category: "About",
    thumbBg: grad("#10b981", "#059669"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
    <div class="rounded-2xl overflow-hidden aspect-square"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80" alt="About the company" class="w-full h-full object-cover" /></div>
    <div>
      <h2 class="text-4xl font-bold text-gray-900">About our company</h2>
      <p class="mt-4 text-gray-600 leading-relaxed">We're a passionate team of designers and engineers building tools that empower creators around the world.</p>
      <p class="mt-4 text-gray-600 leading-relaxed">Since 2020 we've helped over 100,000 people launch their ideas online.</p>
    </div>
  </div>
</section>`,
  },

  // FEATURES
  {
    id: "features-3col",
    name: "3-Column Features",
    category: "Features",
    thumbBg: grad("#06b6d4", "#3b82f6"),
    html: `<section class="w-full bg-gray-50">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <div class="text-center max-w-2xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900">Everything you need</h2>
      <p class="mt-4 text-gray-600">Powerful features built for modern teams.</p>
    </div>
    <div class="mt-16 grid md:grid-cols-3 gap-8">
      <div class="bg-white p-8 rounded-2xl shadow-sm"><div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">1</div><h3 class="mt-4 text-xl font-bold">Lightning Fast</h3><p class="mt-2 text-gray-600">Ship in seconds, not hours.</p></div>
      <div class="bg-white p-8 rounded-2xl shadow-sm"><div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">2</div><h3 class="mt-4 text-xl font-bold">Secure by Default</h3><p class="mt-2 text-gray-600">Enterprise-grade security baked in.</p></div>
      <div class="bg-white p-8 rounded-2xl shadow-sm"><div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">3</div><h3 class="mt-4 text-xl font-bold">Fully Extensible</h3><p class="mt-2 text-gray-600">Plugins and APIs for everything.</p></div>
    </div>
  </div>
</section>`,
  },

  // SERVICES
  {
    id: "services-grid",
    name: "Services Grid",
    category: "Services",
    thumbBg: grad("#ef4444", "#f97316"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Our Services</h2>
    <div class="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100"><img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=240&q=80" alt="Design icon" class="w-full h-full object-cover" /></div>
        <h3 class="mt-6 font-bold text-lg">Design</h3>
        <p class="mt-3 text-sm text-gray-600">Beautiful interfaces that convert.</p>
        <a href="#" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Learn more</a>
      </div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=240&q=80" alt="Development icon" class="w-full h-full object-cover" /></div>
        <h3 class="mt-6 font-bold text-lg">Development</h3>
        <p class="mt-3 text-sm text-gray-600">Robust code that scales.</p>
        <a href="#" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Learn more</a>
      </div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=240&q=80" alt="Marketing icon" class="w-full h-full object-cover" /></div>
        <h3 class="mt-6 font-bold text-lg">Marketing</h3>
        <p class="mt-3 text-sm text-gray-600">Reach the right audience.</p>
        <a href="#" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Learn more</a>
      </div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition flex flex-col items-center text-center">
        <div class="w-20 h-20 rounded-3xl overflow-hidden bg-slate-100"><img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80" alt="Support icon" class="w-full h-full object-cover" /></div>
        <h3 class="mt-6 font-bold text-lg">Support</h3>
        <p class="mt-3 text-sm text-gray-600">24/7 human support.</p>
        <a href="#" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Learn more</a>
      </div>
    </div>
  </div>
</section>`},

  // PORTFOLIO
  {
    id: "portfolio-grid",
    name: "Portfolio Grid",
    category: "Portfolio",
    thumbBg: grad("#7c3aed", "#db2777"),
    html: `<section class="w-full bg-gray-50">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-gray-900">Selected Work</h2>
    <div class="mt-10 grid md:grid-cols-3 gap-6">
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
      <div class="rounded-2xl overflow-hidden aspect-[4/3]"><img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80" alt="Project image" class="w-full h-full object-cover" /></div>
    </div>
  </div>
</section>`,
  },

  // GALLERY
  {
    id: "gallery-masonry",
    name: "Gallery Masonry",
    category: "Gallery",
    thumbBg: grad("#14b8a6", "#0891b2"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-gray-900 text-center">Gallery</h2>
    <div class="mt-10 columns-2 md:columns-3 gap-4 space-y-4">
      <div class="rounded-xl overflow-hidden h-64 break-inside-avoid"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
      <div class="rounded-xl overflow-hidden h-40 break-inside-avoid"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
      <div class="rounded-xl overflow-hidden h-56 break-inside-avoid"><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
      <div class="rounded-xl overflow-hidden h-48 break-inside-avoid"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
      <div class="rounded-xl overflow-hidden h-72 break-inside-avoid"><img src="https://images.unsplash.com/photo-1521170665346-3f21e2291d8a?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
      <div class="rounded-xl overflow-hidden h-52 break-inside-avoid"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" alt="Gallery image" class="w-full h-full object-cover" /></div>
    </div>
  </div>
</section>`,
  },

  // CAROUSEL
  {
    id: "carousel-full",
    name: "Full Width Carousel",
    category: "Carousel",
    thumbBg: grad("#d946ef", "#c084fc"),
    html: `<section class="w-full bg-black relative overflow-hidden">
  <div class="relative w-full h-96 md:h-screen bg-gray-900 flex items-center justify-center group">
    <div class="relative w-full h-full overflow-hidden">
      <div class="w-full h-full flex carousel-track" data-carousel-track style="transition: transform 0.5s ease-in-out; transform: translateX(0%);">
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://picsum.photos/id/1018/1200/800" alt="Slide 1" class="w-full h-full object-cover" data-wto-idx="0" /><div class="absolute inset-0 pointer-events-none bg-black/20"></div></div>
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://picsum.photos/id/1015/1200/800" alt="Slide 2" class="w-full h-full object-cover" data-wto-idx="1" /><div class="absolute inset-0 pointer-events-none bg-black/20"></div></div>
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://picsum.photos/id/1016/1200/800" alt="Slide 3" class="w-full h-full object-cover" data-wto-idx="2" /><div class="absolute inset-0 pointer-events-none bg-black/20"></div></div>
      </div>
    </div>
    <button type="button" class="absolute top-4 right-4 z-20 rounded-full border border-white/50 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white" data-carousel-autoplay-toggle>
      Auto: On
    </button>
    <button type="button" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100" data-carousel-prev aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg></button>
    <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100" data-carousel-next aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19l7-7-7-7"/></svg></button>
  </div>
  <script>
    (function() {
      var script = document.currentScript || document.scripts[document.scripts.length - 1];
      var section = script ? script.parentElement : null;
      if (!section) return;
      var track = section.querySelector('[data-carousel-track]');
      var prevBtn = section.querySelector('[data-carousel-prev]');
      var nextBtn = section.querySelector('[data-carousel-next]');
      if (!track || !prevBtn || !nextBtn) return;
      var slideCount = track.children.length;
      var currentIndex = 0;
      var autoMove = true;
      var autoMoveInterval = 5000;
      var autoMoveTimer = null;
      var autoButton = section.querySelector('[data-carousel-autoplay-toggle]');
      function setAutoplayButton() {
        if (!autoButton) return;
        autoButton.textContent = autoMove ? 'Auto: On' : 'Auto: Off';
      }
      function stopAutoMove() {
        if (autoMoveTimer) {
          clearInterval(autoMoveTimer);
          autoMoveTimer = null;
        }
      }
      function startAutoMove() {
        stopAutoMove();
        if (!autoMove) return;
        autoMoveTimer = setInterval(function() {
          currentIndex = (currentIndex + 1) % slideCount;
          update();
        }, autoMoveInterval);
      }
      function update() {
        var percent = 100 * currentIndex;
        track.style.transform = 'translateX(-' + percent + '%)';
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      if (autoButton) {
        autoButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          autoMove = !autoMove;
          setAutoplayButton();
          if (autoMove) startAutoMove();
          else stopAutoMove();
        });
      }
      update();
      setAutoplayButton();
      startAutoMove();
    })();
  </script>
</section>`,
  },

  // CAROUSEL - MULTI ITEM
  {
    id: "carousel-multi",
    name: "Multi-Item Carousel",
    category: "Carousel",
    thumbBg: grad("#f59e0b", "#fbbf24"),
    html: `<section class="w-full bg-gray-50 py-16">
  <div class="max-w-6xl mx-auto px-6">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Featured Collection</h2>
    <p class="text-center text-gray-600 mb-12">Swipe through our latest collection</p>
    <div class="relative">
      <div class="overflow-hidden">
        <div class="flex gap-6 carousel-items" data-carousel-items style="transition: transform 0.5s ease-in-out; transform: translateX(0%);">
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center relative group"><img src="https://picsum.photos/id/1011/400/400" alt="Item 1" class="w-full h-full object-cover" data-wto-idx="0" /><div class="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item One</h3><p class="text-sm text-gray-600 mt-1">Premium collection piece</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative group"><img src="https://picsum.photos/id/1012/400/400" alt="Item 2" class="w-full h-full object-cover" data-wto-idx="1" /><div class="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Two</h3><p class="text-sm text-gray-600 mt-1">Curated selection</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative group"><img src="https://picsum.photos/id/1013/400/400" alt="Item 3" class="w-full h-full object-cover" data-wto-idx="2" /><div class="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Three</h3><p class="text-sm text-gray-600 mt-1">Hand-picked items</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center relative group"><img src="https://picsum.photos/id/1014/400/400" alt="Item 4" class="w-full h-full object-cover" data-wto-idx="3" /><div class="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Four</h3><p class="text-sm text-gray-600 mt-1">Limited edition</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center relative group"><img src="https://picsum.photos/id/1015/400/400" alt="Item Five" class="w-full h-full object-cover" data-wto-idx="4" /><div class="absolute inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Five</h3><p class="text-sm text-gray-600 mt-1">Bestseller choice</p></div></div></div>
        </div>
      </div>
      <button type="button" class="absolute top-4 right-4 z-20 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm" data-carousel-autoplay-toggle>Auto: On</button>
      <button type="button" class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all" data-carousel-prev aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg></button>
      <button type="button" class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all" data-carousel-next aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19l7-7-7-7"/></svg></button>
    </div>
  </div>
  <script>
    (function() {
      var script = document.currentScript || document.scripts[document.scripts.length - 1];
      var section = script ? script.parentElement : null;
      if (!section) return;
      var track = section.querySelector('[data-carousel-items]');
      var prevBtn = section.querySelector('[data-carousel-prev]');
      var nextBtn = section.querySelector('[data-carousel-next]');
      var autoButton = section.querySelector('[data-carousel-autoplay-toggle]');
      if (!track || !prevBtn || !nextBtn) return;
      var itemCount = track.children.length;
      var visible = 3;
      var currentIndex = 0;
      var maxIndex = Math.max(0, itemCount - visible);
      var autoMove = true;
      var autoMoveInterval = 5000;
      var autoMoveTimer = null;
      function setAutoplayButton() {
        if (!autoButton) return;
        autoButton.textContent = autoMove ? 'Auto: On' : 'Auto: Off';
      }
      function stopAutoMove() {
        if (autoMoveTimer) {
          clearInterval(autoMoveTimer);
          autoMoveTimer = null;
        }
      }
      function startAutoMove() {
        stopAutoMove();
        if (!autoMove) return;
        autoMoveTimer = setInterval(function() {
          currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
          update();
        }, autoMoveInterval);
      }
      function update() {
        var offset = currentIndex * (100 / visible);
        track.style.transform = 'translateX(-' + offset + '%)';
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = Math.max(0, currentIndex - 1);
        update();
        if (autoMove) startAutoMove();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = Math.min(maxIndex, currentIndex + 1);
        update();
        if (autoMove) startAutoMove();
      });
      if (autoButton) {
        autoButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          autoMove = !autoMove;
          setAutoplayButton();
          if (autoMove) startAutoMove();
          else stopAutoMove();
        });
      }
      update();
      setAutoplayButton();
      startAutoMove();
    })();
  </script>
</section>`,
  },

  // CAROUSEL - SPOTLIGHT
  {
    id: "carousel-spotlight",
    name: "Spotlight Carousel",
    category: "Carousel",
    thumbBg: grad("#6366f1", "#8b5cf6"),
    html: `<section class="w-full bg-slate-950 text-white py-24">
  <div class="max-w-6xl mx-auto px-6">
    <div class="mb-12 text-center">
      <p class="text-sm uppercase tracking-[0.4em] text-cyan-300">New arrivals</p>
      <h2 class="mt-4 text-5xl font-black">Spotlight carousel</h2>
      <p class="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Showcase three featured items with bold, centered controls.</p>
    </div>
    <div class="relative overflow-hidden rounded-[2rem] bg-black/80">
      <div class="flex h-[560px] carousel-spotlight-track" data-carousel-track style="transition: transform 0.6s ease-in-out; transform: translateX(0%);">
        <div class="w-full flex-shrink-0 relative">
          <img src="https://picsum.photos/id/1020/1200/700" alt="Spotlight 1" class="w-full h-full object-cover" data-wto-idx="0" />
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute left-8 bottom-12 max-w-xl text-white">
            <p class="text-sm uppercase tracking-[0.4em] text-cyan-300">Featured</p>
            <h3 class="mt-4 text-4xl font-black">Modern design</h3>
            <p class="mt-4 text-sm text-slate-200">Elegant slides with large copy and strong calls to action.</p>
          </div>
        </div>
        <div class="w-full flex-shrink-0 relative">
          <img src="https://picsum.photos/id/1021/1200/700" alt="Spotlight 2" class="w-full h-full object-cover" data-wto-idx="1" />
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute left-8 bottom-12 max-w-xl text-white">
            <p class="text-sm uppercase tracking-[0.4em] text-cyan-300">Premium</p>
            <h3 class="mt-4 text-4xl font-black">Strong visuals</h3>
            <p class="mt-4 text-sm text-slate-200">Perfect for product launches, portfolios, and hero messaging.</p>
          </div>
        </div>
        <div class="w-full flex-shrink-0 relative">
          <img src="https://picsum.photos/id/1022/1200/700" alt="Spotlight 3" class="w-full h-full object-cover" data-wto-idx="2" />
          <div class="absolute inset-0 bg-black/40"></div>
          <div class="absolute left-8 bottom-12 max-w-xl text-white">
            <p class="text-sm uppercase tracking-[0.4em] text-cyan-300">Launch</p>
            <h3 class="mt-4 text-4xl font-black">Built for attention</h3>
            <p class="mt-4 text-sm text-slate-200">Stylish indicators and controls keep the experience clear on desktop and mobile.</p>
          </div>
        </div>
      </div>
      <button type="button" class="absolute top-5 right-5 z-20 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white shadow-lg" data-carousel-autoplay-toggle>Auto: On</button>
      <button type="button" class="absolute left-5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-3 text-white shadow-lg" data-carousel-prev aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg></button>
      <button type="button" class="absolute right-5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-3 text-white shadow-lg" data-carousel-next aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19l7-7-7-7"/></svg></button>
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <button type="button" class="w-3 h-3 rounded-full bg-white" data-carousel-dot="0"></button>
        <button type="button" class="w-3 h-3 rounded-full bg-white/50" data-carousel-dot="1"></button>
        <button type="button" class="w-3 h-3 rounded-full bg-white/50" data-carousel-dot="2"></button>
      </div>
    </div>
  </div>
  <script>
    (function() {
      var script = document.currentScript || document.scripts[document.scripts.length - 1];
      var section = script ? script.parentElement : null;
      if (!section) return;
      var track = section.querySelector('[data-carousel-track]');
      var prevBtn = section.querySelector('[data-carousel-prev]');
      var nextBtn = section.querySelector('[data-carousel-next]');
      var dots = Array.from(section.querySelectorAll('[data-carousel-dot]'));
      if (!track || !prevBtn || !nextBtn || !dots.length) return;
      var slideCount = track.children.length;
      var currentIndex = 0;
      var autoMove = true;
      var autoMoveInterval = 5000;
      var autoMoveTimer = null;
      var autoButton = section.querySelector('[data-carousel-autoplay-toggle]');
      function setAutoplayButton() {
        if (!autoButton) return;
        autoButton.textContent = autoMove ? 'Auto: On' : 'Auto: Off';
      }
      function stopAutoMove() {
        if (autoMoveTimer) {
          clearInterval(autoMoveTimer);
          autoMoveTimer = null;
        }
      }
      function startAutoMove() {
        stopAutoMove();
        if (!autoMove) return;
        autoMoveTimer = setInterval(function() {
          currentIndex = (currentIndex + 1) % slideCount;
          update();
        }, autoMoveInterval);
      }
      function update() {
        var percent = 100 * currentIndex;
        track.style.transform = 'translateX(-' + percent + '%)';
        dots.forEach(function(dot, idx) {
          dot.style.backgroundColor = idx === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)';
        });
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slideCount;
        update();
        if (autoMove) startAutoMove();
      });
      dots.forEach(function(dot) {
        dot.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          currentIndex = parseInt(dot.getAttribute('data-carousel-dot') || '0', 10);
          if (isNaN(currentIndex)) currentIndex = 0;
          update();
          if (autoMove) startAutoMove();
        });
      });
      if (autoButton) {
        autoButton.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          autoMove = !autoMove;
          setAutoplayButton();
          if (autoMove) startAutoMove();
          else stopAutoMove();
        });
      }
      update();
      setAutoplayButton();
      startAutoMove();
    })();
  </script>
</section>`,
  },

  // PRICING
  {
    id: "pricing-3tier",
    name: "3-Tier Pricing",
    category: "Pricing",
    thumbBg: grad("#3b82f6", "#8b5cf6"),
    html: `<section class="w-full bg-gray-50">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Simple pricing</h2>
    <p class="text-center mt-4 text-gray-600">Choose the plan that's right for you.</p>
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div class="bg-white p-8 rounded-2xl border border-gray-200"><h3 class="font-bold text-lg">Starter</h3><div class="mt-4 text-4xl font-black">$9<span class="text-base font-normal text-gray-500">/mo</span></div><ul class="mt-6 space-y-2 text-sm text-gray-600"><li>✓ 5 projects</li><li>✓ Basic support</li></ul><a href="#" class="mt-8 block text-center px-4 py-2 rounded-lg border border-gray-300 font-medium">Choose</a></div>
      <div class="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl transform md:-translate-y-4"><h3 class="font-bold text-lg">Pro</h3><div class="mt-4 text-4xl font-black">$29<span class="text-base font-normal opacity-70">/mo</span></div><ul class="mt-6 space-y-2 text-sm opacity-90"><li>✓ Unlimited projects</li><li>✓ Priority support</li></ul><a href="#" class="mt-8 block text-center px-4 py-2 rounded-lg bg-white text-indigo-600 font-medium">Choose</a></div>
      <div class="bg-white p-8 rounded-2xl border border-gray-200"><h3 class="font-bold text-lg">Enterprise</h3><div class="mt-4 text-4xl font-black">$99<span class="text-base font-normal text-gray-500">/mo</span></div><ul class="mt-6 space-y-2 text-sm text-gray-600"><li>✓ Custom limits</li><li>✓ Dedicated manager</li></ul><a href="#" class="mt-8 block text-center px-4 py-2 rounded-lg border border-gray-300 font-medium">Choose</a></div>
    </div>
  </div>
</section>`,
  },

  // TESTIMONIALS
  {
    id: "testimonials-3",
    name: "Testimonials Row",
    category: "Testimonials",
    thumbBg: grad("#f59e0b", "#ef4444"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Loved by teams</h2>
    <div class="mt-12 grid md:grid-cols-3 gap-6">
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"Absolutely changed how we work. Highly recommend to any team."</p><div class="mt-4 flex items-center gap-3"><img class="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" alt="Sara Chen" /><div><div class="font-semibold text-sm">Sara Chen</div><div class="text-xs text-gray-500">Designer, Acme</div></div></div></div>
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"The best product I've used in years. Ship faster with confidence."</p><div class="mt-4 flex items-center gap-3"><img class="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" alt="Marcus Ali" /><div><div class="font-semibold text-sm">Marcus Ali</div><div class="text-xs text-gray-500">CTO, Vertex</div></div></div></div>
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"Beautiful, powerful, and easy. What more could you ask for?"</p><div class="mt-4 flex items-center gap-3"><img class="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" alt="Priya Rao" /><div><div class="font-semibold text-sm">Priya Rao</div><div class="text-xs text-gray-500">Founder, Sun</div></div></div></div>
    </div>
  </div>
</section>`,
  },

  // FAQ
  {
    id: "faq-simple",
    name: "FAQ Accordion",
    category: "FAQ",
    thumbBg: grad("#6366f1", "#a855f7"),
    html: `<section class="w-full bg-white">
  <div class="max-w-3xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Questions</h2>
    <div class="mt-10 space-y-3">
      <details class="p-5 rounded-xl border border-gray-200 group"><summary class="font-semibold cursor-pointer flex justify-between">What is included in the free plan?<span class="wto-chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></summary><p class="mt-3 text-gray-600">Everything you need to get started, forever free.</p></details>
      <details class="p-5 rounded-xl border border-gray-200 group"><summary class="font-semibold cursor-pointer flex justify-between">Can I cancel anytime?<span class="wto-chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></summary><p class="mt-3 text-gray-600">Yes, cancel with a single click in your dashboard.</p></details>
      <details class="p-5 rounded-xl border border-gray-200 group"><summary class="font-semibold cursor-pointer flex justify-between">Do you offer refunds?<span class="wto-chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span></summary><p class="mt-3 text-gray-600">30 day money back guarantee, no questions asked.</p></details>
    </div>
  </div>
</section>`,
  },

  // TEAM
  {
    id: "team-grid",
    name: "Team Grid",
    category: "Team",
    thumbBg: grad("#22c55e", "#84cc16"),
    html: `<section class="w-full bg-gray-50">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Meet the team</h2>
    <div class="mt-12 grid md:grid-cols-4 gap-6">
      <div class="text-center"><img class="w-32 h-32 mx-auto rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" alt="Alex Kim" /><h3 class="mt-4 font-bold">Alex Kim</h3><p class="text-sm text-gray-500">CEO</p></div>
      <div class="text-center"><img class="w-32 h-32 mx-auto rounded-full object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" alt="Jamie Lee" /><h3 class="mt-4 font-bold">Jamie Lee</h3><p class="text-sm text-gray-500">CTO</p></div>
      <div class="text-center"><img class="w-32 h-32 mx-auto rounded-full object-cover" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80" alt="Sam Patel" /><h3 class="mt-4 font-bold">Sam Patel</h3><p class="text-sm text-gray-500">Design</p></div>
      <div class="text-center"><img class="w-32 h-32 mx-auto rounded-full object-cover" src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80" alt="Robin Cruz" /><h3 class="mt-4 font-bold">Robin Cruz</h3><p class="text-sm text-gray-500">Ops</p></div>
    </div>
  </div>
</section>`,
  },

  // CONTACT
  {
    id: "contact-form",
    name: "Contact Form",
    category: "Contact",
    thumbBg: grad("#0ea5e9", "#6366f1"),
    html: `<section class="w-full bg-white">
  <div class="max-w-3xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-center text-gray-900">Get in touch</h2>
    <form class="mt-10 space-y-4">
      <input class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Your name" />
      <input class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Email address" />
      <textarea rows="5" class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="How can we help?"></textarea>
      <button type="button" class="w-full px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Send message</button>
    </form>
  </div>
</section>`,
  },

  // FOOTER
  {
    id: "footer-simple",
    name: "Simple Footer",
    category: "Footer",
    thumbBg: grad("#1e293b", "#475569"),
    html: `<footer class="w-full bg-gray-900 text-gray-300">
  <div class="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
    <div><div class="text-xl font-bold text-white">Brand</div><p class="mt-2 text-sm text-gray-400">Build faster. Ship better.</p></div>
    <div><h4 class="font-semibold text-white">Product</h4><ul class="mt-3 space-y-2 text-sm"><li><a href="#" class="hover:text-white">Features</a></li><li><a href="#" class="hover:text-white">Pricing</a></li></ul></div>
    <div><h4 class="font-semibold text-white">Company</h4><ul class="mt-3 space-y-2 text-sm"><li><a href="#" class="hover:text-white">About</a></li><li><a href="#" class="hover:text-white">Blog</a></li></ul></div>
    <div><h4 class="font-semibold text-white">Legal</h4><ul class="mt-3 space-y-2 text-sm"><li><a href="#" class="hover:text-white">Terms</a></li><li><a href="#" class="hover:text-white">Privacy</a></li></ul></div>
  </div>
  <div class="border-t border-gray-800 py-6 text-center text-xs text-gray-500">© 2026 Brand. All rights reserved.</div>
</footer>`,
  },

  {
    id: "footer-contact",
    name: "Contact Footer",
    category: "Footer",
    thumbBg: grad("#0f172a", "#1e293b"),
    html: `<footer class="w-full bg-slate-950 text-gray-300">
  <div class="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
    <div>
      <h3 class="text-lg font-bold text-white mb-4">Contact Info</h3>
      <div class="space-y-3 text-sm">
        <div data-wto-phone="true" class="text-sm text-gray-300">+1 (555) 123-4567</div>
        <div data-wto-email="true" class="text-sm text-gray-300">info@example.com</div>
        <div data-wto-address="true" class="text-sm text-gray-300">123 Main St, City, State</div>
      </div>
    </div>
    <div>
      <h4 class="font-semibold text-white mb-4">Quick Links</h4>
      <ul class="space-y-2 text-sm">
        <li><a href="#" class="hover:text-white transition">Home</a></li>
        <li><a href="#" class="hover:text-white transition">About</a></li>
        <li><a href="#" class="hover:text-white transition">Services</a></li>
        <li><a href="#" class="hover:text-white transition">Contact</a></li>
      </ul>
    </div>
    <div>
      <h4 class="font-semibold text-white mb-4">Follow Us</h4>
      <div class="flex gap-4">
        <a data-wto-social="facebook" href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition" title="Facebook"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
        <a data-wto-social="twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition" title="Twitter"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.837.856c1.02-.608 1.8-1.572 2.165-2.723-.954.565-2.01.978-3.127 1.195a4.948 4.948 0 00-8.455 4.516 14.01 14.01 0 01-10.175-5.154 4.957 4.957 0 001.532 6.61 4.928 4.928 0 01-2.24-.616c-.054 2.281 1.581 4.415 3.949 4.89-.69.188-1.41.188-2.126.063.598 1.86 2.359 3.201 4.423 3.242-1.56 1.223-3.5 1.954-5.604 1.954-.364 0-.721-.021-1.076-.062 1.966 1.26 4.3 2.002 6.817 2.002 8.18 0 12.638-6.762 12.638-12.637 0-.192-.004-.385-.012-.577.867-.627 1.619-1.413 2.214-2.312z"/></svg></a>
        <a data-wto-social="instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition" title="Instagram"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg></a>
        <a data-wto-social="linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-8 h-8 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition" title="LinkedIn"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.945v5.442h-3.554s.05-8.836 0-9.756h3.554v1.381c.43-.664 1.199-1.61 2.923-1.61 2.135 0 3.74 1.39 3.74 4.377v5.608zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.951.77-1.71 1.944-1.71 1.174 0 1.915.759 1.915 1.71 0 .951-.74 1.71-1.944 1.71zm1.575 11.597H3.762V9.557h3.15v10.895zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg></a>
      </div>
    </div>
  </div>
  <div class="border-t border-gray-800 py-6 text-center text-xs text-gray-500">© 2026 Your Company. All rights reserved.</div>
</footer>`,
  },

  // CARDS
  {
    id: "cards-3",
    name: "Info Cards",
    category: "Cards",
    thumbBg: grad("#a855f7", "#ec4899"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
    <div class="overflow-hidden rounded-2xl shadow-lg"><img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" alt="Discover" class="w-full h-44 object-cover" /><div class="p-6 bg-white"><h3 class="text-xl font-bold">Discover</h3><p class="mt-2 text-gray-600">Explore what's possible today.</p></div></div>
    <div class="overflow-hidden rounded-2xl shadow-lg"><img src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80" alt="Create" class="w-full h-44 object-cover" /><div class="p-6 bg-white"><h3 class="text-xl font-bold">Create</h3><p class="mt-2 text-gray-600">Turn ideas into reality.</p></div></div>
    <div class="overflow-hidden rounded-2xl shadow-lg"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" alt="Share" class="w-full h-44 object-cover" /><div class="p-6 bg-white"><h3 class="text-xl font-bold">Share</h3><p class="mt-2 text-gray-600">Publish to the world.</p></div></div>
  </div>
</section>`,
  },

  // FORMS
  {
    id: "forms-newsletter",
    name: "Newsletter Form",
    category: "Forms",
    thumbBg: grad("#f43f5e", "#f97316"),
    html: `<section class="w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white">
  <div class="max-w-3xl mx-auto px-6 py-16 text-center">
    <h2 class="text-3xl font-bold">Join our newsletter</h2>
    <p class="mt-3 opacity-80">Get product updates in your inbox — no spam, ever.</p>
    <form class="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input class="flex-1 px-4 py-3 rounded-lg text-gray-900" placeholder="you@example.com" />
      <button type="button" class="px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold">Subscribe</button>
    </form>
  </div>
</section>`,
  },

  // BUTTONS
  {
    id: "button-primary",
    name: "Primary Button",
    category: "Buttons",
    thumbBg: grad("#4f46e5", "#6366f1"),
    html: `<section class="w-full bg-white"><div class="max-w-4xl mx-auto px-6 py-12 flex justify-center"><a href="#" class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">Primary</a></div></section>`,
  },
  {
    id: "button-secondary",
    name: "Secondary Button",
    category: "Buttons",
    thumbBg: grad("#e5e7eb", "#9ca3af"),
    html: `<section class="w-full bg-white"><div class="max-w-4xl mx-auto px-6 py-12 flex justify-center"><a href="#" class="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50">Secondary</a></div></section>`,
  },
  {
    id: "button-gradient",
    name: "Gradient Button",
    category: "Buttons",
    thumbBg: grad("#a855f7", "#ec4899"),
    html: `<section class="w-full bg-white"><div class="max-w-4xl mx-auto px-6 py-12 flex justify-center"><a href="#" class="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Gradient</a></div></section>`,
  },
  {
    id: "button-dark",
    name: "Dark Button",
    category: "Buttons",
    thumbBg: grad("#111827", "#374151"),
    html: `<section class="w-full bg-white"><div class="max-w-4xl mx-auto px-6 py-12 flex justify-center"><a href="#" class="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium">Dark</a></div></section>`,
  },
  {
    id: "button-outline",
    name: "Outline Button",
    category: "Buttons",
    thumbBg: grad("#6366f1", "#a5b4fc"),
    html: `<section class="w-full bg-white"><div class="max-w-4xl mx-auto px-6 py-12 flex justify-center"><a href="#" class="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium">Outline</a></div></section>`,
  },

  // CTA
  {
    id: "cta-simple",
    name: "Call to Action",
    category: "Call To Action",
    thumbBg: grad("#8b5cf6", "#6366f1"),
    html: `<section class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
  <div class="max-w-4xl mx-auto px-6 py-20 text-center">
    <h2 class="text-4xl font-black">Ready to get started?</h2>
    <p class="mt-4 text-lg opacity-90">Join thousands of teams already building with us.</p>
    <a href="#" class="mt-8 inline-block px-8 py-4 rounded-lg bg-white text-indigo-600 font-bold hover:bg-gray-100">Start your free trial</a>
  </div>
</section>`,
  },

  // BLOG
  {
    id: "blog-grid",
    name: "Blog Grid",
    category: "Blog",
    thumbBg: grad("#059669", "#0d9488"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20">
    <h2 class="text-4xl font-bold text-gray-900">Latest posts</h2>
    <div class="mt-10 grid md:grid-cols-3 gap-8">
      <article><div class="aspect-[4/3] rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" alt="Blog post image" class="w-full h-full object-cover" /></div><h3 class="mt-4 text-lg font-bold">How we scaled to 1M users</h3><p class="mt-2 text-gray-600 text-sm">Lessons learned from a year of growth.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
      <article><div class="aspect-[4/3] rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80" alt="Blog post image" class="w-full h-full object-cover" /></div><h3 class="mt-4 text-lg font-bold">Designing for accessibility</h3><p class="mt-2 text-gray-600 text-sm">Making the web work for everyone.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
      <article><div class="aspect-[4/3] rounded-xl overflow-hidden"><img src="https://images.unsplash.com/photo-1485217988980-11786ced9454?auto=format&fit=crop&w=900&q=80" alt="Blog post image" class="w-full h-full object-cover" /></div><h3 class="mt-4 text-lg font-bold">Announcing v2.0</h3><p class="mt-2 text-gray-600 text-sm">New features, better performance.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
    </div>
  </div>
</section>`,
  },

  // LOGIN
  {
    id: "login-card",
    name: "Login Card",
    category: "Login",
    thumbBg: grad("#1e40af", "#4f46e5"),
    html: `<section class="w-full min-h-[600px] bg-gray-50 flex items-center justify-center py-16 px-6">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-2xl font-bold text-center">Welcome back</h2>
    <p class="text-center text-gray-500 text-sm mt-1">Sign in to your account</p>
    <form class="mt-8 space-y-4">
      <input class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Email" />
      <input type="password" class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Password" />
      <button type="button" class="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold">Sign in</button>
    </form>
    <p class="mt-6 text-center text-sm text-gray-500">New here? <a href="#" class="text-indigo-600 font-medium">Create account</a></p>
  </div>
</section>`,
  },

  // SIGNUP
  {
    id: "signup-card",
    name: "Signup Card",
    category: "Signup",
    thumbBg: grad("#db2777", "#e11d48"),
    html: `<section class="w-full min-h-[600px] bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center py-16 px-6">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-2xl font-bold text-center">Create your account</h2>
    <p class="text-center text-gray-500 text-sm mt-1">Free forever. No credit card.</p>
    <form class="mt-8 space-y-4">
      <input class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Full name" />
      <input class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Email" />
      <input type="password" class="w-full px-4 py-3 rounded-lg border border-gray-300" placeholder="Password" />
      <button type="button" class="w-full px-4 py-3 rounded-lg bg-rose-600 text-white font-semibold">Sign up</button>
    </form>
  </div>
</section>`,
  },
];

export function sectionsByCategory() {
  const map = new Map<string, SectionTemplate[]>();
  for (const cat of CATEGORIES) map.set(cat, []);
  for (const s of SECTION_LIBRARY) {
    if (!map.has(s.category)) map.set(s.category, []);
    map.get(s.category)!.push(s);
  }
  return map;
}
