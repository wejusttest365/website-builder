import { TEMPLATE_CATEGORIES, TEMPLATE_DATA_LIBRARY, type TemplateCategory, type TemplateDataDefinition, type TemplateSectionData } from "./template-data";

export type { TemplateCategory };

export interface TemplateSectionDefinition {
  name: string;
  html: string;
  animation?: {
    type?: string;
    duration?: number;
    delay?: number;
  };
  style?: Record<string, string>;
  className?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
  thumbnail: string;
  sections: TemplateSectionDefinition[];
}

export { TEMPLATE_CATEGORIES };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const makeLink = (href: string, label: string, className = "") =>
  `<a href="${escapeHtml(href)}" class="${className}">${escapeHtml(label)}</a>`;

const renderHeader = (content: Record<string, any>) => {
  const brand = content.brand ?? "Brand";
  const links = (content.links ?? []).map((link: any) => makeLink(link.href, link.label, "text-sm font-medium text-slate-600 transition hover:text-slate-900")).join("");
  const cta = content.cta ? makeLink(content.cta.href, content.cta.label, "hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-flex") : "";

  return `
<header class="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
  <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
    <a href="#top" class="text-lg font-semibold tracking-tight text-slate-900">${escapeHtml(brand)}</a>
    <nav data-wto-nav class="relative flex items-center gap-3">
      <button data-wto-nav-btn aria-label="Open menu" class="rounded-full border border-slate-300 p-2 text-slate-700 md:hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path></svg>
      </button>
      <div data-wto-nav-menu class="hidden flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        ${links}
      </div>
    </nav>
    ${cta}
  </div>
</header>`;
};

const renderHero = (content: Record<string, any>) => `
<section id="top" class="w-full bg-slate-950 text-white">
  <div class="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
    <div class="max-w-2xl">
      <p class="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">${escapeHtml(content.eyebrow ?? "Premium web experience")}</p>
      <h1 class="text-4xl font-black leading-tight sm:text-5xl">${escapeHtml(content.title ?? "We create modern websites that feel ready to grow.")}</h1>
      <p class="mt-6 text-lg text-slate-300">${escapeHtml(content.body ?? "Thoughtful and polished experiences built for real businesses.")}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        ${content.primaryCta ? makeLink(content.primaryCta.href, content.primaryCta.label, "rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100") : ""}
        ${content.secondaryCta ? makeLink(content.secondaryCta.href, content.secondaryCta.label, "rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10") : ""}
      </div>
    </div>
    <div class="w-full rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
      <img src="${escapeHtml(content.image ?? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80")}" alt="Hero visual" class="h-[420px] w-full rounded-2xl object-cover" />
    </div>
  </div>
</section>`;

const renderAbout = (content: Record<string, any>) => `
<section id="about" class="w-full bg-white">
  <div class="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "About")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900">${escapeHtml(content.title ?? "Built for clarity, momentum, and lasting first impressions.")}</h2>
    </div>
    <div class="space-y-4 text-lg text-slate-600">
      <p>${escapeHtml(content.body ?? "A polished website experience combining strategy, refined visuals, and intentional storytelling.")}</p>
      ${Array.isArray(content.bullets) ? `<ul class="space-y-3 text-base">
        ${content.bullets.map((b: string) => `<li class="flex gap-2"><span class="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900"></span><span>${escapeHtml(b)}</span></li>`).join("")}
      </ul>` : ""}
    </div>
  </div>
</section>`;

const renderFeatures = (content: Record<string, any>) => `
<section id="features" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Features")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "Built to feel polished, practical, and ready to launch.")}</h2>
      <p class="mt-4 text-lg text-slate-600">${escapeHtml(content.body ?? "A refined set of capabilities designed to make your brand feel clear and credible from the first click.")}</p>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      ${(content.items ?? []).map((item: any) => `
        <div class="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 class="text-xl font-semibold text-slate-900">${escapeHtml(item.title ?? "Feature")}</h3>
          <p class="mt-3 text-slate-600">${escapeHtml(item.body ?? "A strong feature deck for a polished online presence.")}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderServices = (content: Record<string, any>) => `
<section id="services" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Services")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "A focused service set for brands that want momentum without the usual noise.")}</h2>
      <p class="mt-4 text-lg text-slate-600">${escapeHtml(content.body ?? "Every engagement is tailored to feel organized, thoughtful, and ready to launch.")}</p>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      ${(content.items ?? []).map((item: any) => `
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 class="text-xl font-semibold text-slate-900">${escapeHtml(item.title ?? "Service")}</h3>
          <p class="mt-3 text-slate-600">${escapeHtml(item.body ?? "Premium support tailored to your goals.")}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderProcess = (content: Record<string, any>) => `
<section id="process" class="w-full bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Process")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "A calm, collaborative process from first conversation to launch.")}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      ${(content.steps ?? []).map((step: any, index: number) => `
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <div class="text-sm font-semibold text-slate-500">0${index + 1}</div>
          <h3 class="mt-3 text-xl font-semibold text-slate-900">${escapeHtml(step.title ?? "Step")}</h3>
          <p class="mt-3 text-slate-600">${escapeHtml(step.body ?? "A thoughtful stage designed to keep momentum high.")}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderStats = (content: Record<string, any>) => `
<section class="w-full bg-white">
  <div class="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-4 md:px-10">
    ${(content.items ?? []).map((item: any) => `
      <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p class="text-3xl font-black text-slate-900">${escapeHtml(item.value ?? "100%")}</p>
        <p class="mt-2 text-sm text-slate-600">${escapeHtml(item.label ?? "Value")}</p>
      </div>
    `).join("")}
  </div>
</section>`;

const renderWhyChooseUs = (content: Record<string, any>) => `
<section id="why-us" class="w-full bg-slate-900 text-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">${escapeHtml(content.eyebrow ?? "Why choose us")}</p>
      <h2 class="mt-3 text-3xl font-black sm:text-4xl">${escapeHtml(content.title ?? "Thoughtful support that keeps your launch feeling calm and polished.")}</h2>
      <p class="mt-4 text-lg text-slate-300">${escapeHtml(content.body ?? "A steady process, a refined point of view, and a team that stays close throughout the build.")}</p>
    </div>
    <div class="mt-12 grid gap-6 lg:grid-cols-3">
      ${(content.items ?? []).map((item: any) => `
        <div class="rounded-[1.75rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <h3 class="text-xl font-semibold text-white">${escapeHtml(item.title ?? "Benefit")}</h3>
          <p class="mt-3 text-slate-300">${escapeHtml(item.body ?? "Carefully crafted to suit your ambitious goals.")}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderMap = (content: Record<string, any>) => `
<section id="map" class="w-full bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Visit")}</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900">${escapeHtml(content.title ?? "A studio location that feels easy to reach.")}</h2>
        <p class="mt-4 text-lg text-slate-600">${escapeHtml(content.body ?? "We’re based in a creative district with easy access for in-person strategy sessions and launches.")}</p>
        <div class="mt-6 space-y-2 text-slate-600">
          ${(content.details ?? []).map((detail: string) => `<p>${escapeHtml(detail)}</p>`).join("")}
        </div>
      </div>
      <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 p-4">
        <div class="flex h-full min-h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_55%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(226,232,240,0.8))] text-center">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Map preview</p>
            <p class="mt-2 text-xl font-semibold text-slate-900">${escapeHtml(content.placeholder ?? "Google Map placeholder")}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

const renderPortfolio = (content: Record<string, any>) => `
<section id="work" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Selected work")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "A curated body of work shaped for clarity and emotion.")}</h2>
      <p class="mt-4 text-lg text-slate-600">${escapeHtml(content.body ?? "Each project brings together storytelling, execution, and a strong visual point of view.")}</p>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      ${(content.items ?? []).map((item: any) => `
        <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <img src="${escapeHtml(item.image ?? "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80")}" alt="${escapeHtml(item.title ?? "Project")}" class="h-72 w-full object-cover" />
          <div class="p-6">
            <h3 class="text-2xl font-semibold text-slate-900">${escapeHtml(item.title ?? "Project")}</h3>
            <p class="mt-3 text-slate-600">${escapeHtml(item.body ?? "A refined digital experience built with care.")}</p>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderGallery = (content: Record<string, any>) => `
<section id="gallery" class="w-full bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Gallery")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "A space that feels memorable from the first glance.")}</h2>
    </div>
    <div class="mt-12 grid gap-4 md:grid-cols-3">
      ${(content.items ?? []).map((item: any) => `
        <img src="${escapeHtml(item.image ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80")}" alt="Gallery visual" class="h-56 w-full rounded-[1.25rem] object-cover" />
      `).join("")}
    </div>
  </div>
</section>`;

const renderTestimonials = (content: Record<string, any>) => `
<section id="results" class="w-full bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Testimonials")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "Trusted by teams that want a more polished digital presence.")}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      ${(content.items ?? []).map((item: any) => `
        <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
          <p class="text-lg text-slate-600">“${escapeHtml(item.quote ?? "A thoughtful and polished experience that feels easy to trust.")}"</p>
          <div class="mt-6 flex items-center gap-4">
            <div class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">${escapeHtml((item.name ?? "A").split(" ").map((part: string) => part[0]).join(""))}</div>
            <div>
              <p class="font-semibold text-slate-900">${escapeHtml(item.name ?? "Client")}</p>
              <p class="text-sm text-slate-500">${escapeHtml(item.role ?? "Client")}</p>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderPricing = (content: Record<string, any>) => `
<section id="pricing" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Pricing")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "Simple options for a polished launch.")}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      ${(content.plans ?? []).map((plan: any) => `
        <div class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h3 class="text-xl font-semibold text-slate-900">${escapeHtml(plan.name ?? "Plan")}</h3>
          <p class="mt-3 text-slate-600">${escapeHtml(plan.description ?? "A premium package tailored to your scope.")}</p>
          <div class="mt-6 text-4xl font-black text-slate-900">${escapeHtml(plan.price ?? "$0")}</div>
          <ul class="mt-6 space-y-2 text-sm text-slate-600">
            ${(plan.features ?? []).map((feature: string) => `<li class="flex gap-2"><span class="mt-1 h-2 w-2 rounded-full bg-slate-900"></span><span>${escapeHtml(feature)}</span></li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderFaq = (content: Record<string, any>) => `
<section id="faq" class="w-full bg-white">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "FAQ")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "Everything you need to know before we begin.")}</h2>
    </div>
    <div class="mt-12 space-y-4">
      ${(content.items ?? []).map((item: any) => `
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 class="text-lg font-semibold text-slate-900">${escapeHtml(item.question ?? "Question")}</h3>
          <p class="mt-2 text-slate-600">${escapeHtml(item.answer ?? "Answer")}</p>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderTeam = (content: Record<string, any>) => `
<section id="team" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="max-w-2xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">${escapeHtml(content.eyebrow ?? "Team")}</p>
      <h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">${escapeHtml(content.title ?? "A senior team built for detail, momentum, and calm execution.")}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      ${(content.members ?? []).map((member: any) => `
        <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <img src="${escapeHtml(member.image ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80")}" alt="${escapeHtml(member.name ?? "Team member")}" class="h-72 w-full object-cover" />
          <div class="p-6">
            <h3 class="text-xl font-semibold text-slate-900">${escapeHtml(member.name ?? "Team member")}</h3>
            <p class="mt-2 text-slate-600">${escapeHtml(member.role ?? "Role")}</p>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</section>`;

const renderContact = (content: Record<string, any>) => `
<section id="contact" class="w-full bg-slate-900">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="rounded-[2rem] bg-white/5 p-10 text-white">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">${escapeHtml(content.eyebrow ?? "Contact")}</p>
      <h2 class="mt-3 text-3xl font-black sm:text-4xl">${escapeHtml(content.title ?? "Let’s build something polished together.")}</h2>
      <p class="mt-4 max-w-2xl text-lg text-slate-300">${escapeHtml(content.body ?? "We’re available for new projects, thoughtful launches, and design support.")}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        ${content.primaryCta ? makeLink(content.primaryCta.href, content.primaryCta.label, "inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950") : ""}
      </div>
      ${(content.details ?? []).length ? `<ul class="mt-8 space-y-2 text-sm text-slate-300">${(content.details ?? []).map((d: string) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>` : ""}
    </div>
  </div>
</section>`;

const renderCta = (content: Record<string, any>) => `
<section id="contact" class="w-full bg-slate-50">
  <div class="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div class="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-10 text-white shadow-xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">${escapeHtml(content.eyebrow ?? "Ready to begin")}</p>
      <h2 class="mt-3 text-3xl font-black sm:text-4xl">${escapeHtml(content.title ?? "Let’s create a website that feels premium from the first scroll.")}</h2>
      <p class="mt-4 max-w-2xl text-lg text-slate-200">${escapeHtml(content.body ?? "Thoughtful, polished, and production-ready from the very first draft.")}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        ${content.primaryCta ? makeLink(content.primaryCta.href, content.primaryCta.label, "rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100") : ""}
        ${content.secondaryCta ? makeLink(content.secondaryCta.href, content.secondaryCta.label, "rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10") : ""}
      </div>
    </div>
  </div>
</section>`;

const renderFooter = (content: Record<string, any>) => `
<footer class="w-full border-t border-slate-200 bg-slate-950 text-slate-300">
  <div class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
    <div>
      <p class="text-lg font-semibold text-white">${escapeHtml(content.brand ?? "Brand")}</p>
      <p class="mt-2 max-w-md text-sm text-slate-400">Thoughtful digital experiences for modern brands, creators, and service businesses.</p>
    </div>
    <nav class="flex flex-wrap gap-4 text-sm">
      ${(content.links ?? []).map((link: any) => makeLink(link.href, link.label, "transition hover:text-white")).join("")}
    </nav>
  </div>
</footer>`;

const renderSection = (section: TemplateSectionData) => {
  const content = section.content ?? {};
  switch (section.type) {
    case "header":
      return renderHeader(content);
    case "hero":
      return renderHero(content);
    case "about":
      return renderAbout(content);
    case "features":
      return renderFeatures(content);
    case "services":
      return renderServices(content);
    case "process":
      return renderProcess(content);
    case "stats":
      return renderStats(content);
    case "why-us":
      return renderWhyChooseUs(content);
    case "map":
      return renderMap(content);
    case "portfolio":
      return renderPortfolio(content);
    case "gallery":
      return renderGallery(content);
    case "testimonials":
      return renderTestimonials(content);
    case "pricing":
      return renderPricing(content);
    case "faq":
      return renderFaq(content);
    case "team":
      return renderTeam(content);
    case "contact":
      return renderContact(content);
    case "cta":
      return renderCta(content);
    case "footer":
      return renderFooter(content);
    default:
      return `<section class="w-full bg-white"><div class="mx-auto max-w-7xl px-6 py-16 lg:px-10"><p class="text-sm text-slate-500">${escapeHtml(section.name)}</p></div></section>`;
  }
};

export const TEMPLATE_LIBRARY: TemplateDefinition[] = TEMPLATE_DATA_LIBRARY.map((template: TemplateDataDefinition) => ({
  ...template,
  sections: template.sections.map((section) => ({
    name: section.name,
    html: renderSection(section),
    animation: { type: "fade-up", duration: 700, delay: 0 },
  })),
}));
