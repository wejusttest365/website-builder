export type TemplateCategory = "Business" | "Portfolio" | "Freelancer" | "Agency" | "Restaurant";
export type TemplatePageType = "single-page" | "multi-page";

export interface TemplateSectionData {
  name: string;
  type: string;
  content: Record<string, any>;
  style?: Record<string, string>;
  className?: string;
}

export interface TemplatePageData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  keywords?: string;
  sections: TemplateSectionData[];
}

export interface TemplateDataDefinition {
  id: string;
  slug?: string;
  name: string;
  category: TemplateCategory;
  pageType?: TemplatePageType;
  description: string;
  accent: string;
  thumbnail: string;
  previewImages?: string[];
  sharedSections?: TemplateSectionData[];
  pages?: TemplatePageData[];
  sections?: TemplateSectionData[];
  price?: string;
  isPremium?: boolean;
  tags?: string[];
  author?: string;
  version?: string;
  createdDate?: string;
  updatedDate?: string;
  featured?: boolean;
  metadata?: {
    provider?: string;
    tier?: string;
    license?: string;
  };
  globalCss?: string;
  globalJs?: string;
  customHead?: string;
  seo?: Record<string, any>;
  projectSeo?: Record<string, any>;
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
    slug: "business-crest",
    name: "Crest & Co.",
    category: "Business",
    pageType: "multi-page",
    description: "A premium, launch-ready business website with trust, services, proof, and a direct conversion path.",
    accent: grad("#2563eb", "#0f766e"),
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    ],
    isPremium: true,
    price: "$49",
    tags: ["Business", "Launch"],
    author: "Crest Studio",
    version: "1.0",
    createdDate: "2026-07-01",
    updatedDate: "2026-07-10",
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "index",
        description: "A polished homepage with strategic services, credibility, and a clear conversion path.",
        sections: [
          {
            name: "Header",
            type: "header",
            content: {
              brand: "Crest & Co.",
              brandHref: "index.html",
              links: [
                { label: "About", href: "about.html" },
                { label: "Services", href: "services.html" },
                { label: "Results", href: "contact.html" },
              ],
              cta: { label: "Book a call", href: "contact.html" },
            },
          },
          {
            name: "Hero",
            type: "hero",
            content: {
              eyebrow: "Trusted by growth-minded teams",
              title: "A sharper online presence that feels ready for scale.",
              body: "We partner with leadership teams to create polished digital experiences that support sales, credibility, and momentum.",
              primaryCta: { label: "Book a strategy call", href: "contact.html" },
              secondaryCta: { label: "Explore services", href: "services.html" },
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
            name: "Footer",
            type: "footer",
            content: {
              brand: "Crest & Co.",
              links: [
                { label: "About", href: "about.html" },
                { label: "Services", href: "services.html" },
                { label: "Contact", href: "contact.html" },
              ],
            },
          },
        ],
      },
      {
        id: "about",
        name: "About",
        slug: "about",
        description: "A company page that highlights experience, approach, and credibility.",
        sections: [
          {
            name: "Header",
            type: "header",
            content: {
              brand: "Crest & Co.",
              brandHref: "index.html",
              links: [
                { label: "Home", href: "index.html" },
                { label: "Services", href: "services.html" },
                { label: "Contact", href: "contact.html" },
              ],
            },
          },
          {
            name: "About",
            type: "about",
            content: {
              eyebrow: "About us",
              title: "We help teams move faster with calm, confident digital experiences.",
              body: "Crest & Co. blends strategy, design, and launch support to create websites that feel premium, practical, and polished.",
              bullets: [
                "Executive-level positioning and narrative clarity",
                "Visual systems designed for trust and momentum",
                "Delivery support that keeps every launch running smoothly",
              ],
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
            },
          },
          {
            name: "Services",
            type: "services",
            content: {
              eyebrow: "What we do",
              title: "A service model built around clarity and measurable impact.",
              body: "We help companies refine positioning, design premium experiences, and launch with confidence.",
              items: [
                { title: "Strategy & messaging", body: "Focused positioning that helps your offer feel easier to understand and buy." },
                { title: "Experience design", body: "High-end pages built for credibility, clarity, and conversion." },
                { title: "Launch support", body: "A steady rollout process that keeps your team aligned and on schedule." },
              ],
            },
          },
          {
            name: "Footer",
            type: "footer",
            content: {
              brand: "Crest & Co.",
              links: [
                { label: "Home", href: "index.html" },
                { label: "Services", href: "services.html" },
                { label: "Contact", href: "contact.html" },
              ],
            },
          },
        ],
      },
      {
        id: "services",
        name: "Services",
        slug: "services",
        description: "A services page that outlines the agency’s offering and process.",
        sections: [
          {
            name: "Header",
            type: "header",
            content: {
              brand: "Crest & Co.",
              brandHref: "index.html",
              links: [
                { label: "Home", href: "index.html" },
                { label: "About", href: "about.html" },
                { label: "Contact", href: "contact.html" },
              ],
            },
          },
          {
            name: "Services",
            type: "services",
            content: {
              eyebrow: "Our services",
              title: "A service offering for teams that need premium, conversion-focused websites.",
              body: "From launch strategy to polished delivery, our work keeps your digital presence feeling confident and aligned.",
              items: [
                { title: "Brand strategy", body: "Positioning and messaging that feel consistent across every channel." },
                { title: "Website design", body: "Thoughtful pages that support trust, clarity, and action." },
                { title: "Campaign launches", body: "A launch-ready process for products, services, and strategic initiatives." },
              ],
            },
          },
          {
            name: "Process",
            type: "process",
            content: {
              eyebrow: "How we work",
              title: "A structured rollout with clear milestones and collaboration points.",
              steps: [
                { title: "Discover", body: "We align goals, audiences, and messaging needs." },
                { title: "Design", body: "We craft polished visual systems and page experiences." },
                { title: "Deliver", body: "We launch with flexibility and thoughtful follow-through." },
              ],
            },
          },
          {
            name: "Footer",
            type: "footer",
            content: {
              brand: "Crest & Co.",
              links: [
                { label: "Home", href: "index.html" },
                { label: "About", href: "about.html" },
                { label: "Contact", href: "contact.html" },
              ],
            },
          },
        ],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "contact",
        description: "A conversion-focused contact page with a clear next step.",
        sections: [
          {
            name: "Header",
            type: "header",
            content: {
              brand: "Crest & Co.",
              brandHref: "index.html",
              links: [
                { label: "Home", href: "index.html" },
                { label: "About", href: "about.html" },
                { label: "Services", href: "services.html" },
              ],
            },
          },
          {
            name: "Contact",
            type: "contact",
            content: {
              eyebrow: "Get in touch",
              title: "Talk to our team about your next growth-focused website.",
              body: "We’re ready to help ambitious businesses launch with a premium site and clear digital strategy.",
              details: ["hello@crestco.com", "New York, NY", "Response within 24 hours"],
              primaryCta: { label: "Email us", href: "mailto:hello@crestco.com" },
            },
          },
          {
            name: "Footer",
            type: "footer",
            content: {
              brand: "Crest & Co.",
              links: [
                { label: "Home", href: "index.html" },
                { label: "About", href: "about.html" },
                { label: "Services", href: "services.html" },
              ],
            },
          },
        ],
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
    pageType: "single-page",
    tags: ["Portfolio", "Creative"],
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
    id: "agency-deepdigital",
    slug: "agency-deepdigital",
    name: "DeepDigital",
    category: "Agency",
    pageType: "single-page",
    description: "A premium dark agency landing page with bold neon accents, strategic sections, and a strong digital brand presence.",
    accent: grad("#030712", "#0dc3d6"),
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1521033719794-41049d18a7e8?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80",
    ],
    isPremium: true,
    price: "$69",
    tags: ["Agency", "Creative", "Premium"],
    author: "DeepDigital Studio",
    version: "1.0",
    createdDate: "2026-07-15",
    updatedDate: "2026-07-15",
    sections: [
      {
        name: "Header",
        type: "header",
        content: {
          brand: "DeepDigital",
          links: [
            { label: "Home", href: "#top" },
            { label: "About", href: "#about" },
            { label: "Services", href: "#services" },
            { label: "Works", href: "#work" },
            { label: "Blog", href: "#blog" },
            { label: "Contact", href: "#contact" },
          ],
          cta: { label: "1-800-123-4567", href: "tel:1-800-123-4567" },
        },
      },
      {
        name: "Hero",
        type: "hero",
        content: {
          eyebrow: "/02",
          title: "Bold digital experiences for ambitious brands.",
          body: "DeepDigital builds immersive websites, brand systems, and product experiences with a premium dark aesthetic.",
          primaryCta: { label: "Start a project", href: "#contact" },
          secondaryCta: { label: "View work", href: "#work" },
          image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1400&q=80",
        },
      },
      {
        name: "About",
        type: "about",
        content: {
          eyebrow: "Who We Are",
          title: "We’re a strategic digital agency that brings bold ideas to life.",
          body: "From brand storytelling to immersive digital product experiences, we help ambitious companies stand out with clarity and confidence.",
          bullets: [
            "A creative team built for modern digital brands",
            "Design systems that feel sharp, immersive, and memorable",
            "Launch support focused on impact, conversion, and growth",
          ],
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80",
        },
      },
      {
        name: "Key offering",
        type: "features",
        content: {
          eyebrow: "What We Believe",
          title: "We create digital experiences with strategy, clarity, and modern form.",
          body: "A strategic approach that balances visual impact with measurable business value.",
          items: [
            { title: "What We Believe", body: "Design should feel intelligent, bold, and easy to understand." },
            { title: "What We Do", body: "We build websites, campaigns, and experiences that move audiences." },
            { title: "World Offices", body: "Remote-first teams working across global markets for fast, high-quality delivery." },
            { title: "Media Center", body: "Content systems that support launches, storytelling, and audience growth." },
            { title: "Our People", body: "A small team of specialists focused on strategy, design, and execution." },
            { title: "Social Impact", body: "Digital experiences created with thoughtful brand purpose in mind." },
          ],
        },
      },
      {
        name: "Process",
        type: "process",
        content: {
          eyebrow: "Our Process",
          title: "A concise workflow for planning, building, and launching premium digital products.",
          steps: [
            { title: "Planning", body: "We define goals, audience, and the strategic path for your digital launch." },
            { title: "Organization", body: "We structure work, timelines, and creative direction for efficient delivery." },
            { title: "Management", body: "We keep the project aligned to quality, brand, and user experience standards." },
            { title: "Support", body: "We stay invested after launch with optimization and ongoing collaboration." },
          ],
        },
      },
      {
        name: "Latest Projects",
        type: "portfolio",
        content: {
          eyebrow: "Latest Projects",
          title: "A selection of recent work that balances visual confidence with thoughtful detail.",
          items: [
            { title: "Dolore Magna", body: "A dark product launch for a modern studio.", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80" },
            { title: "11 Coaching", body: "A premium website for a high-performance coaching brand.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" },
            { title: "Acknowledging", body: "A bold digital experience with strong brand presence.", image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1200&q=80" },
          ],
        },
      },
      {
        name: "Latest News",
        type: "raw",
        content: {
          html: `<section id="blog" class="w-full bg-white"><div class="mx-auto max-w-7xl px-6 py-20 lg:px-10"><div class="max-w-2xl"><p class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Latest News</p><h2 class="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Insights from our studio.</h2><p class="mt-4 text-lg text-slate-600">Discover the latest in digital experience design, brand launches, and creative strategy.</p></div><div class="mt-12 grid gap-6 lg:grid-cols-3"><article class="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm"><p class="text-xs uppercase tracking-[0.3em] text-slate-500">May 22, 2024</p><h3 class="mt-4 text-xl font-semibold text-slate-900">Sample post with image</h3><p class="mt-3 text-slate-600">Insightful looks at the latest trends in modern digital design.</p></article><article class="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm"><p class="text-xs uppercase tracking-[0.3em] text-slate-500">May 18, 2024</p><h3 class="mt-4 text-xl font-semibold text-slate-900">Post with carousel</h3><p class="mt-3 text-slate-600">A look at interactive experiences and immersive media layouts.</p></article><article class="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm"><p class="text-xs uppercase tracking-[0.3em] text-slate-500">May 12, 2024</p><h3 class="mt-4 text-xl font-semibold text-slate-900">Sample post with YouTube video</h3><p class="mt-3 text-slate-600">Storytelling through video, motion, and brand-driven narratives.</p></article></div></div></section>`,
        },
      },
      {
        name: "Contact",
        type: "contact",
        content: {
          eyebrow: "Contact Us",
          title: "Reach out to start a bold new project.",
          body: "Tell us about your goals and we’ll craft a premium digital experience built for growth.",
          details: [
            "hello@deepdigital.com",
            "Remote-first, global clients",
            "Response within 24 hours",
          ],
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "DeepDigital",
          links: [
            { label: "Blog", href: "#blog" },
            { label: "About", href: "#about" },
            { label: "Social", href: "#social" },
            { label: "Contact", href: "#contact" },
          ],
          social: [
            { label: "Twitter", href: "https://twitter.com" },
            { label: "Facebook", href: "https://facebook.com" },
            { label: "YouTube", href: "https://youtube.com" },
          ],
        },
      },
    ],
  },
  {
    id: "academy-drivewell",
    slug: "academy-drivewell",
    name: "DriveWell Academy",
    category: "Business",
    pageType: "multi-page",
    description: "A premium multipage driving academy website with bold green branding, a top contact bar, and a polished student-focused layout.",
    accent: grad("#0f4d1a", "#16a34a"),
    thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    ],
    isPremium: true,
    price: "$69",
    tags: ["Business", "Education", "Agency"],
    author: "DriveWell Studio",
    createdDate: "2026-07-15",
    updatedDate: "2026-07-15",
    sharedSections: [
      {
        name: "Header",
        type: "header",
        content: {
          topBar: {
            phone: "1-800-555-1234",
            email: "hello@drivewell.com",
          },
          brand: "DriveWell Academy",
          brandHref: "index.html",
          links: [
            { label: "Home", href: "index.html" },
            { label: "About", href: "about.html" },
            { label: "Services", href: "services.html" },
            { label: "FAQs", href: "faqs.html" },
            { label: "Contact", href: "contact.html" },
          ],
          cta: { label: "Register", href: "#contact" },
        },
      },
      {
        name: "Footer",
        type: "footer",
        content: {
          brand: "DriveWell Academy",
          links: [
            { label: "Home", href: "index.html" },
            { label: "About", href: "about.html" },
            { label: "Services", href: "services.html" },
            { label: "Contact", href: "contact.html" },
          ],
          social: [
            { label: "Facebook", href: "https://facebook.com" },
            { label: "Instagram", href: "https://instagram.com" },
          ],
        },
      },
    ],
    pages: [
      {
        id: "home",
        name: "Home",
        slug: "index",
        description: "Home page with the exact driving school sections shown in the screenshot.",
        sections: [
          {
            name: "Hero Carousel",
            type: "carousel-full",
            content: {
              eyebrow: "Welcome to",
              title: "DriveWell Academy",
              body: "Professional driver education with flexible schedules, expert instructors, and a modern student experience.",
              slides: [
                {
                  label: "Student success",
                  title: "Confident behind the wheel",
                  body: "Hands-on lessons and real-world training for every learner.",
                  image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=1200&q=80",
                  href: "#contact",
                  cta: "Book a lesson",
                },
                {
                  label: "Expert instructors",
                  title: "Support that builds confidence",
                  body: "Personal coaching, modern curriculum, and a calm learning environment.",
                  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
                  href: "#contact",
                  cta: "Meet our team",
                },
                {
                  label: "Road-ready",
                  title: "Prepared for every test",
                  body: "Practical road practice, checklist training, and confidence for the exam.",
                  image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                  href: "#contact",
                  cta: "Start today",
                },
              ],
            },
          },
          {
            name: "Programs",
            type: "services",
            content: {
              eyebrow: "Services",
              title: "Our driving programs",
              body: "Structured courses for teens, adults, and road test preparation with supportive classroom and behind-the-wheel training.",
              items: [
                {
                  title: "Teen Program",
                  body: "In-car and classroom lessons designed for new teen drivers.",
                  image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
                {
                  title: "Adult Program",
                  body: "Flexible lessons for adults who need evening and weekend options.",
                  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
                {
                  title: "Road Skills Test",
                  body: "Expert coaching to prepare students for the licensing exam.",
                  image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
              ],
            },
          },
          {
            name: "About",
            type: "about",
            content: {
              eyebrow: "About us",
              title: "Locally owned and focused on safety, confidence, and real results.",
              body: "We are fully licensed and members of the Driving School Association of Louisiana and the Driving School Association of the Americas.",
              bullets: [
                "Instructors who teach safe driving practices",
                "Personalized lesson plans for every student",
                "Courses for every age and experience level",
              ],
              image: "https://images.unsplash.com/photo-1520946379778-6c055cc9b132?auto=format&fit=crop&w=1000&q=80",
              cta: { label: "Learn more about us", href: "#contact" },
            },
          },
          {
            name: "CTA",
            type: "cta",
            content: {
              variant: "green",
              eyebrow: "Looking for a trusted local driving school?",
              title: "Register today for your drivers ed program.",
              body: "A confident, safe driving future begins with the right training and support.",
              primaryCta: { label: "Register now", href: "#contact" },
            },
          },
        ],
      },
      {
        id: "about",
        name: "About",
        slug: "about",
        description: "About page that matches the screenshot layout for the academy.",
        sections: [
          {
            name: "Banner",
            type: "banner",
            content: {
              eyebrow: "About Us",
              title: "We are DriveWell Academy.",
              body: "Our goal is to see zero accidents on the highways through confident, practical driver education.",
              breadcrumbs: [
                { label: "Home", href: "index.html" },
                { label: "About", href: "about.html" },
              ],
              primaryCta: { label: "Register", href: "#contact" },
              secondaryCta: { label: "Contact us", href: "#contact" },
              image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
            },
          },
          {
            name: "Mission",
            type: "about",
            content: {
              eyebrow: "Our motto",
              title: "We are a locally owned and operated driver education facility.",
              body: "We offer 38 and 14 hour courses for all ages of drivers, and we are committed to providing positive solutions so every student becomes the safest driver they can be.",
              bullets: [
                "Locally licensed instructors",
                "Supportive and structured lessons",
                "Committed to student safety and competence",
              ],
              image: "https://images.unsplash.com/photo-1522107171-5c1af67f0f9f?auto=format&fit=crop&w=1000&q=80",
              cta: { label: "Learn more about us", href: "#contact" },
            },
          },
          {
            name: "Why choose us",
            type: "features",
            content: {
              eyebrow: "Why choose us",
              title: "Why students choose our academy",
              body: "Experienced instructors, excellent service, and flexible hours designed for every learner.",
              items: [
                { title: "Experienced instructors", body: "Certified trainers who focus on safe driving practices." },
                { title: "Excellent service", body: "Every step is smooth, reliable, and hassle-free." },
                { title: "Flexible hours", body: "Lessons that fit your schedule with evenings and weekends available." },
              ],
            },
          },
        ],
      },
      {
        id: "services",
        name: "Services",
        slug: "services",
        description: "Detailed service offerings for DriveWell Academy.",
        sections: [
          {
            name: "Banner",
            type: "banner",
            content: {
              eyebrow: "Our Programs",
              title: "Driver education designed for every student.",
              body: "From beginner lessons to licensing prep, our programs give learners confidence behind the wheel.",
              breadcrumbs: [
                { label: "Home", href: "index.html" },
                { label: "Services", href: "services.html" },
              ],
              primaryCta: { label: "Enroll now", href: "#contact" },
              secondaryCta: { label: "See pricing", href: "#contact" },
              image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
            },
          },
          {
            name: "Programs",
            type: "services",
            content: {
              eyebrow: "Programs",
              title: "Comprehensive driver training for teens, adults, and test prep.",
              body: "Structured courses, experienced instructors, and flexible scheduling to help every learner succeed.",
              items: [
                {
                  title: "Teen Driver Education",
                  body: "In-car and classroom lessons crafted for new teen drivers.",
                  image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
                {
                  title: "Adult Lessons",
                  body: "Evening and weekend sessions for adult learners and license renewals.",
                  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
                {
                  title: "License Prep",
                  body: "Road test coaching and confidence-building practice for every student.",
                  image: "https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=900&q=80",
                  cta: { label: "Register", href: "#contact" },
                },
              ],
            },
          },
          {
            name: "CTA",
            type: "cta",
            content: {
              variant: "green",
              eyebrow: "Ready to start?",
              title: "Book your first lesson with DriveWell Academy.",
              body: "Our team makes driver training easy, safe, and supportive for every student.",
              primaryCta: { label: "Book a lesson", href: "#contact" },
            },
          },
        ],
      },
      {
        id: "faqs",
        name: "FAQs",
        slug: "faqs",
        description: "Frequently asked questions for students and families.",
        sections: [
          {
            name: "Banner",
            type: "banner",
            content: {
              eyebrow: "FAQ",
              title: "Questions about lessons, licensing, and schedules.",
              body: "Everything you need to know before your first lesson with DriveWell Academy.",
              breadcrumbs: [
                { label: "Home", href: "index.html" },
                { label: "FAQs", href: "faqs.html" },
              ],
              primaryCta: { label: "Contact us", href: "#contact" },
              secondaryCta: { label: "Learn more", href: "#contact" },
              image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
            },
          },
          {
            name: "FAQ",
            type: "faq",
            content: {
              eyebrow: "FAQs",
              title: "Common questions, answered clearly.",
              body: "Understand how our courses work, what to expect, and how to get started.",
              items: [
                { question: "What age can I start lessons?", answer: "Students can begin driver education as soon as they are eligible for a learner's permit." },
                { question: "Do you offer weekend classes?", answer: "Yes, we provide evening and weekend sessions for busy learners." },
                { question: "Can I use my own car for practice?", answer: "Instructors can train in our vehicles or yours depending on licensing requirements." },
              ],
            },
          },
          {
            name: "Contact CTA",
            type: "cta",
            content: {
              variant: "green",
              eyebrow: "Still have questions?",
              title: "Reach out and we’ll help you choose the right course.",
              body: "Our staff is here to guide you through scheduling, pricing, and next steps.",
              primaryCta: { label: "Get in touch", href: "#contact" },
            },
          },
        ],
      },
      {
        id: "contact",
        name: "Contact",
        slug: "contact",
        description: "Contact page for DriveWell Academy.",
        sections: [
          {
            name: "Banner",
            type: "banner",
            content: {
              eyebrow: "Contact",
              title: "Get in touch with DriveWell Academy.",
              body: "Questions about registration, lessons, or scheduling? We’re here to help.",
              breadcrumbs: [
                { label: "Home", href: "index.html" },
                { label: "Contact", href: "contact.html" },
              ],
              primaryCta: { label: "Call now", href: "tel:1-800-555-1234" },
              secondaryCta: { label: "Email us", href: "mailto:hello@drivewell.com" },
              image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
            },
          },
          {
            name: "Map",
            type: "map",
            content: {
              eyebrow: "Visit us",
              title: "Find our training center in the local area.",
              body: "We’re easy to reach and ready to support new drivers with flexible lesson options.",
              details: [
                "123 Main Street, Springfield, USA",
                "Phone: 1-800-555-1234",
                "Email: hello@drivewell.com",
              ],
              placeholder: "Map placeholder",
            },
          },
          {
            name: "Contact CTA",
            type: "cta",
            content: {
              variant: "green",
              eyebrow: "Ready to register?",
              title: "Book your first training session today.",
              body: "Secure your spot in our next available class and start driving with confidence.",
              primaryCta: { label: "Register now", href: "#contact" },
            },
          },
        ],
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
