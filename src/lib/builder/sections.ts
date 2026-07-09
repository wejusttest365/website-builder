export interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  html: string;
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
  "About",
  "Features",
  "Services",
  "Portfolio",
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

  // HERO
  {
    id: "hero-split",
    name: "Split Hero",
    category: "Hero",
    thumbBg: grad("#f97316", "#f43f5e"),
    html: `<section class="w-full bg-gradient-to-br from-indigo-50 to-white">
  <div class="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-5xl font-black leading-tight text-gray-900">Build stunning websites in minutes.</h1>
      <p class="mt-6 text-lg text-gray-600">Drag, drop, and launch. No code needed — just pure creative freedom for beginners and pros alike.</p>
      <div class="mt-8 flex gap-4">
        <a href="#" class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Start Free</a>
        <a href="#" class="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50">Watch Demo</a>
      </div>
    </div>
    <div class="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 aspect-[4/3] shadow-2xl"></div>
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

  // ABOUT
  {
    id: "about-two-col",
    name: "About Two Column",
    category: "About",
    thumbBg: grad("#10b981", "#059669"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
    <div class="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 aspect-square"></div>
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
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"><h3 class="font-bold text-lg">Design</h3><p class="mt-2 text-sm text-gray-600">Beautiful interfaces that convert.</p></div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"><h3 class="font-bold text-lg">Development</h3><p class="mt-2 text-sm text-gray-600">Robust code that scales.</p></div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"><h3 class="font-bold text-lg">Marketing</h3><p class="mt-2 text-sm text-gray-600">Reach the right audience.</p></div>
      <div class="p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition"><h3 class="font-bold text-lg">Support</h3><p class="mt-2 text-sm text-gray-600">24/7 human support.</p></div>
    </div>
  </div>
</section>`,
  },

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
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 aspect-[4/3]"></div>
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 aspect-[4/3]"></div>
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 aspect-[4/3]"></div>
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 aspect-[4/3]"></div>
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 aspect-[4/3]"></div>
      <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 aspect-[4/3]"></div>
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
      <div class="rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 h-64 break-inside-avoid"></div>
      <div class="rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 h-40 break-inside-avoid"></div>
      <div class="rounded-xl bg-gradient-to-br from-orange-400 to-red-500 h-56 break-inside-avoid"></div>
      <div class="rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 h-48 break-inside-avoid"></div>
      <div class="rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 h-72 break-inside-avoid"></div>
      <div class="rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 h-52 break-inside-avoid"></div>
    </div>
  </div>
</section>`,
  },

  // CAROUSEL
  {
    id: "carousel-full",
    name: "Full Width Carousel",
    category: "Gallery",
    thumbBg: grad("#d946ef", "#c084fc"),
    html: `<section class="w-full bg-black relative overflow-hidden">
  <div class="relative w-full h-96 md:h-screen bg-gray-900 flex items-center justify-center group">
    <div class="relative w-full h-full overflow-hidden">
      <div class="w-full h-full flex carousel-track" data-carousel-track style="transition: transform 0.5s ease-in-out; transform: translateX(0%);">
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://images.unsplash.com/photo-1682227955596-452ec28e7e4d?w=1200&h=800&fit=crop" alt="Slide 1" class="w-full h-full object-cover" data-wto-idx="0" /><div class="absolute inset-0 bg-black/20"></div></div>
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://images.unsplash.com/photo-1519346473061-f0a7cbc113d7?w=1200&h=800&fit=crop" alt="Slide 2" class="w-full h-full object-cover" data-wto-idx="1" /><div class="absolute inset-0 bg-black/20"></div></div>
        <div class="w-full h-full flex-shrink-0 relative bg-gray-800 flex items-center justify-center"><img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop" alt="Slide 3" class="w-full h-full object-cover" data-wto-idx="2" /><div class="absolute inset-0 bg-black/20"></div></div>
      </div>
    </div>
    <button type="button" class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100" data-carousel-prev aria-label="Previous"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg></button>
    <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100" data-carousel-next aria-label="Next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19l7-7-7-7"/></svg></button>
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2" data-carousel-dots>
      <button type="button" class="w-2 h-2 rounded-full bg-white" data-carousel-dot="0"></button>
      <button type="button" class="w-2 h-2 rounded-full bg-white/40" data-carousel-dot="1"></button>
      <button type="button" class="w-2 h-2 rounded-full bg-white/40" data-carousel-dot="2"></button>
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
      function update() {
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        dots.forEach(function(dot, idx) {
          dot.style.backgroundColor = idx === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)';
        });
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slideCount) % slideCount;
        update();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slideCount;
        update();
      });
      dots.forEach(function(dot) {
        dot.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          currentIndex = parseInt(dot.getAttribute('data-carousel-dot') || '0', 10);
          if (isNaN(currentIndex)) currentIndex = 0;
          update();
        });
      });
      update();
    })();
  </script>
</section>`,
  },

  // CAROUSEL - MULTI ITEM
  {
    id: "carousel-multi",
    name: "Multi-Item Carousel",
    category: "Gallery",
    thumbBg: grad("#f59e0b", "#fbbf24"),
    html: `<section class="w-full bg-gray-50 py-16">
  <div class="max-w-6xl mx-auto px-6">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Featured Collection</h2>
    <p class="text-center text-gray-600 mb-12">Swipe through our latest collection</p>
    <div class="relative">
      <div class="overflow-hidden">
        <div class="flex gap-6 carousel-items" data-carousel-items style="transition: transform 0.5s ease-in-out; transform: translateX(0%);">
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center relative group"><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" alt="Item 1" class="w-full h-full object-cover" data-wto-idx="0" /><div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item One</h3><p class="text-sm text-gray-600 mt-1">Premium collection piece</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative group"><img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop" alt="Item 2" class="w-full h-full object-cover" data-wto-idx="1" /><div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Two</h3><p class="text-sm text-gray-600 mt-1">Curated selection</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative group"><img src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop" alt="Item 3" class="w-full h-full object-cover" data-wto-idx="2" /><div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Three</h3><p class="text-sm text-gray-600 mt-1">Hand-picked items</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center relative group"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" alt="Item 4" class="w-full h-full object-cover" data-wto-idx="3" /><div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Four</h3><p class="text-sm text-gray-600 mt-1">Limited edition</p></div></div></div>
          <div class="w-full md:w-1/3 flex-shrink-0"><div class="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all"><div class="aspect-square bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center relative group"><img src="https://images.unsplash.com/photo-1535368567674-7c8e7f14498a?w=400&h=400&fit=crop" alt="Item 5" class="w-full h-full object-cover" data-wto-idx="4" /><div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></div></div><div class="p-4"><h3 class="font-bold text-lg text-gray-900">Item Five</h3><p class="text-sm text-gray-600 mt-1">Bestseller choice</p></div></div></div>
        </div>
      </div>
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
      if (!track || !prevBtn || !nextBtn) return;
      var itemCount = track.children.length;
      var visible = 3;
      var currentIndex = 0;
      var maxIndex = Math.max(0, itemCount - visible);
      function update() {
        var offset = currentIndex * (100 / visible);
        track.style.transform = 'translateX(-' + offset + '%)';
      }
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = Math.max(0, currentIndex - 1);
        update();
      });
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = Math.min(maxIndex, currentIndex + 1);
        update();
      });
      update();
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
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"Absolutely changed how we work. Highly recommend to any team."</p><div class="mt-4 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500"></div><div><div class="font-semibold text-sm">Sara Chen</div><div class="text-xs text-gray-500">Designer, Acme</div></div></div></div>
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"The best product I've used in years. Ship faster with confidence."</p><div class="mt-4 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500"></div><div><div class="font-semibold text-sm">Marcus Ali</div><div class="text-xs text-gray-500">CTO, Vertex</div></div></div></div>
      <div class="p-6 rounded-2xl bg-gray-50"><p class="text-gray-700">"Beautiful, powerful, and easy. What more could you ask for?"</p><div class="mt-4 flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"></div><div><div class="font-semibold text-sm">Priya Rao</div><div class="text-xs text-gray-500">Founder, Sun</div></div></div></div>
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
      <div class="text-center"><div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"></div><h3 class="mt-4 font-bold">Alex Kim</h3><p class="text-sm text-gray-500">CEO</p></div>
      <div class="text-center"><div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-red-500"></div><h3 class="mt-4 font-bold">Jamie Lee</h3><p class="text-sm text-gray-500">CTO</p></div>
      <div class="text-center"><div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500"></div><h3 class="mt-4 font-bold">Sam Patel</h3><p class="text-sm text-gray-500">Design</p></div>
      <div class="text-center"><div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-yellow-500"></div><h3 class="mt-4 font-bold">Robin Cruz</h3><p class="text-sm text-gray-500">Ops</p></div>
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

  // CARDS
  {
    id: "cards-3",
    name: "Info Cards",
    category: "Cards",
    thumbBg: grad("#a855f7", "#ec4899"),
    html: `<section class="w-full bg-white">
  <div class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
    <div class="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white"><h3 class="text-xl font-bold">Discover</h3><p class="mt-2 opacity-90">Explore what's possible today.</p></div>
    <div class="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white"><h3 class="text-xl font-bold">Create</h3><p class="mt-2 opacity-90">Turn ideas into reality.</p></div>
    <div class="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white"><h3 class="text-xl font-bold">Share</h3><p class="mt-2 opacity-90">Publish to the world.</p></div>
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
    id: "buttons-showcase",
    name: "Button Showcase",
    category: "Buttons",
    thumbBg: grad("#3b82f6", "#06b6d4"),
    html: `<section class="w-full bg-white">
  <div class="max-w-4xl mx-auto px-6 py-16 flex flex-wrap gap-4 justify-center">
    <button class="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">Primary</button>
    <button class="px-6 py-3 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50">Secondary</button>
    <button class="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Gradient</button>
    <button class="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium">Dark</button>
    <button class="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-medium">Outline</button>
  </div>
</section>`,
  },
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
      <article><div class="aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600"></div><h3 class="mt-4 text-lg font-bold">How we scaled to 1M users</h3><p class="mt-2 text-gray-600 text-sm">Lessons learned from a year of growth.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
      <article><div class="aspect-[4/3] rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600"></div><h3 class="mt-4 text-lg font-bold">Designing for accessibility</h3><p class="mt-2 text-gray-600 text-sm">Making the web work for everyone.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
      <article><div class="aspect-[4/3] rounded-xl bg-gradient-to-br from-orange-400 to-red-500"></div><h3 class="mt-4 text-lg font-bold">Announcing v2.0</h3><p class="mt-2 text-gray-600 text-sm">New features, better performance.</p><a href="#" class="mt-3 inline-block text-indigo-600 font-semibold hover:text-indigo-500">Read more →</a></article>
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
