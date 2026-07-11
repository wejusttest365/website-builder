export type TemplateCategory = "Business" | "Portfolio" | "Freelancer" | "Agency" | "Restaurant";

export interface TemplateSectionData {
  name: string;
  type: string;
  content: Record<string, any>;
}

export interface TemplateDataDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  accent: string;
  thumbnail: string;
  sections: TemplateSectionData[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Business",
  "Portfolio",
  "Freelancer",
  "Agency",
  "Restaurant",
];

const grad = (from: string, to: string) => `linear-gradient(135deg, ${from}, ${to})`;

export const TEMPLATE_DATA_LIBRARY: TemplateDataDefinition[] = [
  {
    id: "business-crest",
    name: "Crest & Co.",
    category: "Business",
    description: "A premium, launch-ready business website with trust, services, proof, and a direct conversion path.",
    accent: grad("#2563eb", "#0f766e"),
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "Crest & Co.",
          links: [
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Results", href: "#results" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Book a call", href: "#contact" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "Trusted by growth-minded teams",
          title: "A sharper online presence that feels ready for scale.",
          body: "We partner with leadership teams to create polished digital experiences that support sales, credibility, and momentum.",
          primaryCta: { label: "Book a strategy call", href: "#contact" },
          secondaryCta: { label: "Explore services", href: "#services" },
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
        },
      },
      {
        name: "Features",
        type: "features",
        content: {
          eyebrow: "What we do best",
          title: "A clear service stack for teams that need momentum without the scramble.",
          body: "We pair strategy, design, and rollout support so your digital presence feels premium from the start.",
          items: [
            { title: "Positioning & messaging", body: "Sharper narratives that help your business feel easier to trust." },
            { title: "Launch-ready websites", body: "Fast-moving builds that still feel thoughtful, premium, and cohesive." },
            { title: "Ongoing refinement", body: "Delivery support that helps you adapt and improve after launch." },
          ],
        },
      },
      {
        name: "Stats",
        type: "stats",
        content: {
          items: [
            { value: "4.9/5", label: "Average client rating" },
            { value: "120+", label: "Projects launched" },
            { value: "15 hrs", label: "Average response time" },
            { value: "98%", label: "Client retention" },
          ],
        },
      },
      {
        name: "Why Choose Us",
        type: "why-us",
        content: {
          eyebrow: "Why teams hire us",
          title: "Support that feels calm, clear, and built for growth.",
          body: "A thoughtful blend of strategy, design, and delivery keeps every launch moving smoothly.",
          items: [
            { title: "Senior guidance", body: "Experienced partners who can shape the work without adding unnecessary complexity." },
            { title: "Clear execution", body: "A structured approach that keeps teams aligned and decisions moving forward." },
            { title: "Design that converts", body: "Each touchpoint is shaped to feel premium while still being straightforward to use." },
          ],
        },
      },
      {
        name: "About",
        type: "about",
        content: {
          eyebrow: "About",
          title: "Clear strategy, refined design, and disciplined delivery.",
          body: "We help modern companies communicate with confidence through thoughtful websites, positioning, and campaign systems.",
          bullets: [
            "Positioning and messaging that feels consistent across every touchpoint",
            "Design systems built for clarity, speed, and conversion",
            "Senior support from initial concept through launch and refinement",
          ],
          image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
        },
      },
      {
        name: "Services",
        type: "services",
        content: {
          eyebrow: "Services",
          title: "Everything you need to launch with confidence.",
          body: "A modern service stack built around clarity, execution, and measurable momentum.",
          items: [
            { title: "Brand systems", body: "Visual identity and messaging that make your business easier to trust." },
            { title: "Product storytelling", body: "Conversion-focused pages, flows, and messaging grounded in customer needs." },
            { title: "Launch support", body: "Hands-on rollout direction so your team can move quickly without missing details." },
          ],
        },
      },
      {
        name: "Process",
        type: "process",
        content: {
          eyebrow: "How we work",
          title: "A calm, collaborative process from first conversation to launch.",
          steps: [
            { title: "Discover", body: "We align on goals, audiences, and the problems that matter most." },
            { title: "Design", body: "We shape the experience around clarity, pace, and conversion." },
            { title: "Deliver", body: "We refine, launch, and support the rollout with measurable care." },
          ],
        },
      },
      {
        name: "Results",
        type: "testimonials",
        content: {
          eyebrow: "Client results",
          title: "Trusted by companies that need a high-end digital presence.",
          items: [
            { quote: "The team brought structure to our story and helped us look more premium from day one.", name: "Alicia Lewis", role: "Founder, Northwind Labs" },
          ],
        },
      },
      {
        name: "Pricing",
        type: "pricing",
        content: {
          eyebrow: "Simple engagement options",
          title: "Choose the support model that fits your launch timeline.",
          plans: [
            { name: "Launch", price: "$4.5k", description: "Perfect for a refined website refresh or focused campaign rollout.", features: ["1–2 week kickoff", "Design and implementation", "Launch support"] },
            { name: "Growth", price: "$8.5k", description: "For teams looking for a full digital presence and ongoing optimization.", features: ["Full website build", "Messaging and content direction", "Strategy workshops"] },
          ],
        },
      },
      {
        name: "FAQ",
        type: "faq",
        content: {
          eyebrow: "Frequently asked",
          title: "Everything you need to know before we begin.",
          items: [
            { question: "How quickly can you start?", answer: "Most engagements begin within one week of our intro conversation." },
            { question: "Do you support ongoing optimization?", answer: "Yes. We can stay involved after launch for updates, refinements, and conversion improvements." },
          ],
        },
      },
      {
        name: "CTA",
        type: "cta",
        content: {
          eyebrow: "Ready to begin",
          title: "Let’s create a website that feels premium from the first scroll.",
          body: "We help teams launch with intention, confidence, and a clear path to growth.",
          primaryCta: { label: "Schedule a call", href: "#contact" },
          secondaryCta: { label: "View our process", href: "#process" },
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "Crest & Co.",
          links: [
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Results", href: "#results" },
            { label: "Contact", href: "#contact" },
          ],
          social: [
            { label: "Instagram", href: "https://instagram.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
      },
    ],
  },
  {
    id: "portfolio-atelier",
    name: "Atelier Lane",
    category: "Portfolio",
    description: "An editorial portfolio for photographers, creatives, and boutique studios seeking a refined online presence.",
    accent: grad("#7c3aed", "#db2777"),
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "Atelier Lane",
          links: [
            { label: "Work", href: "#work" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Book a session", href: "#contact" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "Editorial work & brand stories",
          title: "I create experiences that feel cinematic, intimate, and impossible to forget.",
          body: "Selected collaborations for founders, cultural projects, and contemporary brands that want a more human presence online.",
          primaryCta: { label: "View selected work", href: "#work" },
          secondaryCta: { label: "Say hello", href: "#contact" },
          image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
        },
      },
      {
        name: "Features",
        type: "features",
        content: {
          eyebrow: "What I bring",
          title: "A portfolio experience that feels editorial, personal, and polished.",
          body: "Every project is shaped to be warm, calm, and memorable while still supporting your goals.",
          items: [
            { title: "Visual direction", body: "Creative systems tailored to give your work a refined, lasting first impression." },
            { title: "Story-led pages", body: "Narrative structure that helps viewers understand your point of view quickly." },
            { title: "Launch support", body: "Carefully considered implementation so your site feels effortless to use and maintain." },
          ],
        },
      },
      {
        name: "Featured work",
        type: "portfolio",
        content: {
          eyebrow: "Selected projects",
          title: "A curated body of work shaped for clarity and emotion.",
          body: "Each project balances visual storytelling with thoughtful strategy and production care.",
          items: [
            { title: "Lumen House", body: "A content-led identity system for a hospitality concept opening in Brooklyn.", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80" },
            { title: "Morrow Studio", body: "A refined launch site for a fashion collective with a strong editorial voice.", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80" },
          ],
        },
      },
      {
        name: "Process",
        type: "process",
        content: {
          eyebrow: "How it works",
          title: "A collaborative process that keeps the work feeling calm and intentional.",
          steps: [
            { title: "Discover", body: "We clarify your goals, visual direction, and the stories you want to surface." },
            { title: "Create", body: "I shape a site structure and visual language that feels personal and clear." },
            { title: "Refine", body: "We review, polish, and launch with confidence so the page feels finished." },
          ],
        },
      },
      {
        name: "FAQ",
        type: "faq",
        content: {
          eyebrow: "Common questions",
          title: "Everything you need to know before we begin.",
          items: [
            { question: "How long does a project usually take?", answer: "Most engagements take three to six weeks depending on scope and content readiness." },
            { question: "Can you help with content direction?", answer: "Yes, I can help shape messaging and structure so the story feels clear and cohesive." },
          ],
        },
      },
      {
        name: "About",
        type: "about",
        content: {
          eyebrow: "About",
          title: "Crafting thoughtful digital experiences with a human touch.",
          body: "I blend strategy, image direction, and tactile design to create work that feels personal and premium.",
          bullets: [
            "Identity systems for launches and rebrands",
            "Editorial-style web experiences for cultural brands",
            "Hands-on production support from concept to completion",
          ],
          image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80",
        },
      },
      {
        name: "Services",
        type: "services",
        content: {
          eyebrow: "What I offer",
          title: "A focused service set for brands that need a stronger point of view.",
          body: "From storytelling to web design, every engagement stays sharp, considered, and collaborative.",
          items: [
            { title: "Brand direction", body: "Messaging, mood, and visual systems that feel coherent and elevated." },
            { title: "Website design", body: "Immersive, responsive sites that remove friction and strengthen trust." },
          ],
        },
      },
      {
        name: "Testimonials",
        type: "testimonials",
        content: {
          eyebrow: "Client notes",
          title: "Work that feels personal, refined, and built to last.",
          items: [
            { quote: "Every detail felt considered. The site feels like an extension of our brand identity.", name: "Mina Kim", role: "Founder, Morrow Studio" },
          ],
        },
      },
      {
        name: "CTA",
        type: "cta",
        content: {
          eyebrow: "Available for select projects",
          title: "Let’s build something memorable together.",
          body: "Available for select collaborations, launches, and brand refreshes throughout the year.",
          primaryCta: { label: "Say hello", href: "#contact" },
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "Atelier Lane",
          links: [
            { label: "Work", href: "#work" },
            { label: "About", href: "#about" },
            { label: "Contact", href: "#contact" },
          ],
          social: [
            { label: "Instagram", href: "https://instagram.com" },
            { label: "Behance", href: "https://behance.net" },
          ],
        },
      },
    ],
  },
  {
    id: "freelancer-solo",
    name: "Solo North",
    category: "Freelancer",
    description: "A concise, direct template for freelancers and solo operators who want a premium one-person studio presence.",
    accent: grad("#ea580c", "#f59e0b"),
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "Solo North",
          links: [
            { label: "Services", href: "#services" },
            { label: "Work", href: "#work" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Hire me", href: "#contact" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "Freelance design & strategy",
          title: "I help founders turn rough ideas into polished digital products.",
          body: "From positioning and visuals to launch-ready websites, I keep every engagement practical, clear, and fast-moving.",
          primaryCta: { label: "Hire me", href: "#contact" },
          secondaryCta: { label: "See recent work", href: "#work" },
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
        },
      },
      {
        name: "Features",
        type: "features",
        content: {
          eyebrow: "What I deliver",
          title: "Lean support for founders who want a sharp launch without the agency overhead.",
          body: "Everything is structured around clarity, speed, and practical results.",
          items: [
            { title: "Landing pages", body: "Conversion-focused pages that feel modern, refined, and easy to navigate." },
            { title: "Brand direction", body: "Identity and messaging systems that feel sharp and consistent." },
            { title: "No-code implementation", body: "Turnkey setup so your site can go live without a long build cycle." },
          ],
        },
      },
      {
        name: "Services",
        type: "services",
        content: {
          eyebrow: "Services",
          title: "Focused support for founders who need momentum without the usual overhead.",
          body: "Lean engagements designed to help you look polished and launch quickly.",
          items: [
            { title: "Landing pages", body: "Conversion-focused pages that feel modern, refined, and easy to navigate." },
            { title: "Brand direction", body: "Identity and messaging systems that feel sharp and consistent." },
            { title: "No-code implementation", body: "Turnkey setup so your site can go live without a long build cycle." },
          ],
        },
      },
      {
        name: "Process",
        type: "process",
        content: {
          eyebrow: "How it works",
          title: "A simple, collaborative process that keeps momentum high.",
          steps: [
            { title: "Define", body: "We clarify the goals, audience, and what success should look like." },
            { title: "Build", body: "I craft the site or experience and refine it with your feedback." },
            { title: "Launch", body: "We ship confidently and keep the experience polished after go-live." },
          ],
        },
      },
      {
        name: "Work",
        type: "portfolio",
        content: {
          eyebrow: "Recent work",
          title: "Selected projects built with clarity and care.",
          items: [
            { title: "Kindred Studio", body: "A launch-ready site for a design-forward startup in the wellness space.", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" },
          ],
        },
      },
      {
        name: "Testimonials",
        type: "testimonials",
        content: {
          eyebrow: "What clients say",
          title: "Work that feels thoughtful and easy to trust.",
          items: [
            { quote: "Every interaction felt deliberate. The result feels premium and genuinely usable.", name: "Mina Kim", role: "Founder, Kindred Studio" },
          ],
        },
      },
      {
        name: "Pricing",
        type: "pricing",
        content: {
          eyebrow: "Flexible options",
          title: "Simple packages for fast-moving founders.",
          plans: [
            { name: "Starter", price: "$2.4k", description: "A focused launch package for a single core page or concise site.", features: ["Custom copy direction", "Responsive design", "Launch support"] },
            { name: "Growth", price: "$4.8k", description: "A fuller experience with branding, messaging, and multi-page structure.", features: ["Full site design", "Content strategy", "Post-launch refinement"] },
          ],
        },
      },
      {
        name: "FAQ",
        type: "faq",
        content: {
          eyebrow: "Questions",
          title: "Common questions before we begin.",
          items: [
            { question: "Can you help with copy?", answer: "Yes. I can help shape messaging so the site feels polished and clear." },
          ],
        },
      },
      {
        name: "Contact",
        type: "contact",
        content: {
          eyebrow: "Book a call",
          title: "Need a polished launch in a short timeframe?",
          body: "I’m usually available for new projects and quick turnarounds each month.",
          details: [
            "hello@solonorth.com",
            "Available worldwide",
            "Response within 24 hours",
          ],
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "Solo North",
          links: [
            { label: "Services", href: "#services" },
            { label: "Work", href: "#work" },
            { label: "Contact", href: "#contact" },
          ],
          social: [
            { label: "Dribbble", href: "https://dribbble.com" },
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
      },
    ],
  },
  {
    id: "agency-velocity",
    name: "Velocity Collective",
    category: "Agency",
    description: "A premium agency website for strategy-led teams that want a high-end digital presence with case studies and clear service positioning.",
    accent: grad("#0f172a", "#4338ca"),
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "Velocity Collective",
          links: [
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Work", href: "#work" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "Start a project", href: "#contact" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "Strategy, design & delivery",
          title: "We build brands that move with calm confidence and momentum.",
          body: "From early positioning to polished launch experiences, we help modern teams communicate clearly and stand out with intention.",
          primaryCta: { label: "Book a consult", href: "#contact" },
          secondaryCta: { label: "See our work", href: "#work" },
          image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
        },
      },
      {
        name: "Stats",
        type: "stats",
        content: {
          items: [
            { value: "15+", label: "Years of combined experience" },
            { value: "80+", label: "Launches delivered" },
            { value: "7x", label: "Average growth in qualified leads" },
          ],
        },
      },
      {
        name: "About",
        type: "about",
        content: {
          eyebrow: "About",
          title: "A strategic partner for companies that want a premium digital presence.",
          body: "We bring together strategy, brand systems, product thinking, and launch support so teams can move faster with less friction.",
          bullets: [
            "Positioning that sharpens your narrative",
            "Experience systems that feel premium and easy to use",
            "Execution that keeps your team aligned from concept to rollout",
          ],
          image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80",
        },
      },
      {
        name: "Services",
        type: "services",
        content: {
          eyebrow: "Services",
          title: "An agency model designed for clarity and momentum.",
          body: "We tailor each engagement around your audience, goals, and launch timeline.",
          items: [
            { title: "Strategy", body: "Positioning and roadmap work that brings focus to every initiative." },
            { title: "Experience design", body: "Interfaces and stories shaped around real customer needs and business goals." },
            { title: "Delivery", body: "A steady, collaborative rollout that keeps your team moving without overwhelm." },
          ],
        },
      },
      {
        name: "Features",
        type: "features",
        content: {
          eyebrow: "What we’re known for",
          title: "An agency model built for clear thinking, strong design, and calm execution.",
          body: "We blend strategic clarity with polished design systems to help ambitious teams move faster.",
          items: [
            { title: "Brand systems", body: "Positioning and visual language that makes your offer easier to understand and trust." },
            { title: "Launch experiences", body: "Thoughtful product and website launches that feel consistent and intentional." },
            { title: "Senior support", body: "A close, experienced delivery partner who keeps the project moving smoothly." },
          ],
        },
      },
      {
        name: "Work",
        type: "portfolio",
        content: {
          eyebrow: "Selected work",
          title: "Case studies that show how we help ambitious brands grow.",
          items: [
            { title: "Northwind", body: "A complete rebrand and launch system that improved engagement across every channel.", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80" },
            { title: "Bravado", body: "A new digital experience designed to make complex offerings feel simple and premium.", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80" },
          ],
        },
      },
      {
        name: "Process",
        type: "process",
        content: {
          eyebrow: "How we work",
          title: "A steady process that keeps your team informed and in sync.",
          steps: [
            { title: "Discover", body: "We align on your goals, audience, and the stories that matter most." },
            { title: "Design", body: "We shape strategy and visual systems around clarity and momentum." },
            { title: "Deliver", body: "We refine, launch, and support the rollout with measurable care." },
          ],
        },
      },
      {
        name: "FAQ",
        type: "faq",
        content: {
          eyebrow: "Frequently asked",
          title: "Everything you need to know before we begin.",
          items: [
            { question: "Do you support post-launch updates?", answer: "Yes. We can continue refining the site after launch when you need new pages or campaigns." },
            { question: "What type of teams do you usually work with?", answer: "We most often partner with growth-stage companies, founders, and product-led organizations." },
          ],
        },
      },
      {
        name: "Team",
        type: "team",
        content: {
          eyebrow: "The team",
          title: "A senior crew built for detail, momentum, and calm execution.",
          members: [
            { name: "Jordan Hale", role: "Founder & Strategy", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
            { name: "Nadia Ortiz", role: "Design Lead", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" },
          ],
        },
      },
      {
        name: "CTA",
        type: "cta",
        content: {
          eyebrow: "Let’s build together",
          title: "Let’s build the next chapter of your brand.",
          body: "We design and deliver the kind of digital presence that feels sharp from day one.",
          primaryCta: { label: "Start a conversation", href: "#contact" },
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "Velocity Collective",
          links: [
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Work", href: "#work" },
            { label: "Contact", href: "#contact" },
          ],
          social: [
            { label: "LinkedIn", href: "https://linkedin.com" },
            { label: "Instagram", href: "https://instagram.com" },
          ],
        },
      },
    ],
  },
  {
    id: "restaurant-luna",
    name: "Luna Bistro",
    category: "Restaurant",
    description: "A warm, polished restaurant website built for reservations, atmosphere, and memorable dining experiences.",
    accent: grad("#b45309", "#dc2626"),
    thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "Luna Bistro",
          links: [
            { label: "Story", href: "#story" },
            { label: "Menu", href: "#menu" },
            { label: "Gallery", href: "#gallery" },
            { label: "Visit", href: "#contact" },
          ],
          cta: { label: "Reserve a table", href: "#contact" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "Seasonal dining & warm hospitality",
          title: "Seasonal plates, thoughtful service, and a room that feels like home.",
          body: "From intimate dinners to weekend brunch, Luna Bistro offers an experience that feels memorable from first sip to last bite.",
          primaryCta: { label: "Reserve a table", href: "#contact" },
          secondaryCta: { label: "View the menu", href: "#menu" },
          image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
        },
      },
      {
        name: "Story",
        type: "about",
        content: {
          eyebrow: "Our story",
          title: "A neighborhood favorite with a calm, welcoming atmosphere.",
          body: "We focus on seasonal ingredients, balanced flavors, and a dining room designed for slow mornings and long evenings alike.",
          bullets: [
            "Fresh seasonal produce and small-batch ingredients",
            "Thoughtful service shaped around comfort and pace",
            "A space built for intimate dinners, celebrations, and weekends out",
          ],
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80",
        },
      },
      {
        name: "Features",
        type: "features",
        content: {
          eyebrow: "Dining highlights",
          title: "A restaurant experience that feels prepared, warm, and easy to remember.",
          body: "Every detail serves the mood: thoughtful service, balanced plates, and a room that welcomes you in.",
          items: [
            { title: "Seasonal menus", body: "Dishes that shift with the market and the season while staying rooted in comfort." },
            { title: "Memorable evenings", body: "An atmosphere designed for relaxed evenings, special occasions, and lingering conversations." },
            { title: "Private dining", body: "Flexible spaces for dinners, celebrations, and gatherings that need a little extra care." },
          ],
        },
      },
      {
        name: "Menu",
        type: "services",
        content: {
          eyebrow: "Menu highlights",
          title: "A dining experience rooted in flavor, seasonality, and craft.",
          body: "Every course is designed to feel generous, slightly indulgent, and deeply grounded in the moment.",
          items: [
            { title: "Chef’s tasting", body: "A seasonal tasting menu built around local produce and bold flavor pairings." },
            { title: "Wine pairings", body: "Thoughtfully curated pours that bring out the best in each plate." },
            { title: "Weekend brunch", body: "A bright, relaxed spread for easy gatherings and slower starts." },
          ],
        },
      },
      {
        name: "Why Choose Us",
        type: "why-us",
        content: {
          eyebrow: "Why guests return",
          title: "A warmroom, flavorful plates, and service that stays attentive without feeling rushed.",
          body: "We’ve built the experience around comfort, consistency, and the feeling of being looked after.",
          items: [
            { title: "Seasonal quality", body: "Fresh ingredients and memorable pairings at every turn." },
            { title: "Thoughtful hospitality", body: "A team that knows how to balance energy, pace, and care." },
            { title: "A gathering place", body: "A space that works equally well for a weeknight dinner or a celebratory evening." },
          ],
        },
      },
      {
        name: "FAQ",
        type: "faq",
        content: {
          eyebrow: "Helpful details",
          title: "Everything guests want to know before they visit.",
          items: [
            { question: "Do you accept reservations?", answer: "Yes. We recommend reservations for dinner service and weekend brunch." },
            { question: "Is there private dining?", answer: "We’re happy to host private gatherings and celebrations on request." },
          ],
        },
      },
      {
        name: "Map",
        type: "map",
        content: {
          eyebrow: "Find us",
          title: "Easy to reach and easy to love.",
          body: "We’re just a short walk from the neighborhood’s main streets and transit stops.",
          details: ["18 Mercer Street, New York, NY", "(212) 555-0148", "Open daily from 5pm"],
          placeholder: "Google Map placeholder",
        },
      },
      {
        name: "Gallery",
        type: "gallery",
        content: {
          eyebrow: "Atmosphere",
          title: "A dining room and menu designed to be remembered.",
          items: [
            { image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" },
            { image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
            { image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80" },
          ],
        },
      },
      {
        name: "Testimonials",
        type: "testimonials",
        content: {
          eyebrow: "Guest notes",
          title: "Warm service, memorable plates, and a room that keeps guests coming back.",
          items: [
            { quote: "The atmosphere is effortless and the food feels both comforting and elevated.", name: "Sarah & Daniel", role: "Regular guests" },
          ],
        },
      },
      {
        name: "Visit",
        type: "contact",
        content: {
          eyebrow: "Visit us",
          title: "Join us for dinner this week.",
          body: "Open for dinner service Tuesday through Sunday, with private dining available on request.",
          details: [
            "18 Mercer Street, New York, NY",
            "(212) 555-0148",
            "Open daily from 5pm",
          ],
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "Luna Bistro",
          links: [
            { label: "Story", href: "#story" },
            { label: "Menu", href: "#menu" },
            { label: "Gallery", href: "#gallery" },
            { label: "Visit", href: "#contact" },
          ],
          social: [
            { label: "Instagram", href: "https://instagram.com" },
            { label: "TikTok", href: "https://tiktok.com" },
          ],
        },
      },
    ],
  },
];
