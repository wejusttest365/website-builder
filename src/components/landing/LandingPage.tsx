import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Clock3, Eye, EyeOff, Lock, Mail, Sparkles, Star } from "lucide-react";

const stats = [
  { value: "120+", label: "Templates", icon: Sparkles },
  { value: "5 min", label: "To publish", icon: Clock3 },
  { value: "4.9/5", label: "Rating", icon: Star },
];

export function LandingPage() {
  const { login, register, loginWithGoogle, signingIn } = useAuth();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    remember: false,
  });
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();
  const positionRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    ringX: 0,
    ringY: 0,
    overInteractive: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    if (prefersReducedMotion || isTouch) return;

    setCursorEnabled(true);
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    positionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      ringX: window.innerWidth / 2,
      ringY: window.innerHeight / 2,
      overInteractive: false,
    };

    const animateCursor = () => {
      const state = positionRef.current;
      const dx = state.targetX - state.x;
      const dy = state.targetY - state.y;
      const ringDx = state.targetX - state.ringX;
      const ringDy = state.targetY - state.ringY;

      state.x += dx * 0.18;
      state.y += dy * 0.18;
      state.ringX += ringDx * 0.12;
      state.ringY += ringDy * 0.12;

      cursor.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) scale(${state.overInteractive ? 1.15 : 1})`;
      ring.style.transform = `translate3d(${state.ringX}px, ${state.ringY}px, 0) translate(-50%, -50%)`;

      frameRef.current = window.requestAnimationFrame(animateCursor);
    };

    frameRef.current = window.requestAnimationFrame(animateCursor);

    const onPointerMove = (event: PointerEvent) => {
      positionRef.current.targetX = event.clientX;
      positionRef.current.targetY = event.clientY;

      const target = event.target instanceof Element ? event.target : null;
      const isClickable = !!target?.closest(
        'a, button, [role="button"], [role="link"], .hero-google-button, .hero-submit-button, .hero-eye-toggle, .hero-checkbox, .hero-input'
      );
      positionRef.current.overInteractive = isClickable;
      cursor.classList.toggle("landing-cursor-active", isClickable);
      ring.classList.toggle("landing-cursor-ring-active", isClickable);
    };

    const onPointerLeave = () => {
      positionRef.current.overInteractive = false;
      cursor.classList.remove("landing-cursor-active");
      ring.classList.remove("landing-cursor-ring-active");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fields.email.trim() || !fields.password.trim()) return;

    setSubmitting(true);
    try {
      if (authMode === "sign-up") {
        await register(fields.firstName, fields.lastName, fields.email, fields.password);
      } else {
        await login(fields.email, fields.password);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-[#080b16] text-slate-100" data-landing-cursor-enabled={cursorEnabled ? "true" : undefined}>
      <style>{`
        .landing-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #080b16;
        }
        .landing-page[data-landing-cursor-enabled="true"] {
          cursor: none;
        }
        .landing-page[data-landing-cursor-enabled="true"] input,
        .landing-page[data-landing-cursor-enabled="true"] textarea,
        .landing-page[data-landing-cursor-enabled="true"] select {
          cursor: text;
        }
        .landing-cursor,
        .landing-cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          transform: translate3d(-50%, -50%, 0);
          transition: opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease;
          will-change: transform, opacity, box-shadow;
        }
        .landing-cursor-visible {
          opacity: 1;
        }
        .landing-cursor-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0f172a;
          border: 1px solid rgba(148,163,184,0.16);
          box-shadow: inset 0 0 0 1px rgba(148,163,184,0.08), 0 0 0 1px rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .landing-cursor-dot::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,146,60,0.95) 0%, rgba(168,85,247,0.85) 35%, rgba(255,255,255,0.1) 100%);
          box-shadow: 0 0 20px rgba(251,146,60,0.28), 0 0 30px rgba(168,85,247,0.12);
        }
        .landing-cursor-ring {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(30,41,59,0.12);
          box-shadow: 0 0 0 1px rgba(249,115,22,0.16), 0 0 0 7px rgba(147,75,255,0.12);
          backdrop-filter: blur(2px);
        }
        .landing-cursor-ring-active {
          box-shadow: 0 0 0 1px rgba(255,183,77,0.34), 0 0 0 8px rgba(147,75,255,0.22), 0 0 20px rgba(249,115,22,0.18);
        }
        .landing-cursor-active .landing-cursor-dot {
          transform: scale(1.1);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.12), 0 0 12px rgba(255,169,77,0.22);
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-cursor,
          .landing-cursor-ring {
            transition: none;
          }
        }
        .animated-background {
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUpSmall { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUpMedium { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardEntrance { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes cardBorderGlow { from { background-position: 0% 50%; opacity: 0.55; } to { background-position: 100% 50%; opacity: 0.8; } }
        @keyframes cardGlowPulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.45; } }
        @keyframes gradientShimmer { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
        @keyframes backgroundGlowA { from { transform: translate(-24%, 12%) scale(1.05); } to { transform: translate(-16%, 22%) scale(1.08); } }
        @keyframes backgroundGlowB { from { transform: translate(18%, -18%) scale(1.02); } to { transform: translate(10%, -8%) scale(1.05); } }
        @keyframes backgroundGlowC { from { transform: translate(10%, 2%) scale(1.04); } to { transform: translate(4%, 12%) scale(1.07); } }
        @keyframes ambientOrange { 0% { transform: translate(0, 0) scale(1); opacity: 0.58; } 100% { transform: translate(38px, -30px) scale(1.06); opacity: 0.34; } }
        @keyframes ambientPurple { 0% { transform: translate(0, 0) scale(1); opacity: 0.46; } 100% { transform: translate(-30px, 26px) scale(1.05); opacity: 0.28; } }
        @keyframes ambientCard { 0% { transform: translate(0, 0) scale(1); opacity: 0.32; } 50% { transform: translate(-14px, 16px) scale(1.04); opacity: 0.48; } 100% { transform: translate(8px, -10px) scale(1.03); opacity: 0.36; } }
        @keyframes particleFloat { from { transform: translate3d(0, 0, 0); opacity: 0.22; } to { transform: translate3d(var(--move-x, 0), var(--move-y, -80px), 0); opacity: 0.05; } }
        @keyframes gridSweep { 0% { transform: translateX(-25%) translateY(-12%) rotate(-8deg); opacity: 0.04; } 50% { opacity: 0.10; } 100% { transform: translateX(118%) translateY(8%) rotate(-8deg); opacity: 0.03; } }

        .bg-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          filter: blur(160px);
          opacity: 0.85;
          will-change: transform, opacity;
        }
        .bg-particle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.0) 50%);
          filter: blur(0.9px);
          opacity: 0.12;
          pointer-events: none;
          will-change: transform, opacity;
          animation: particleFloat var(--particle-duration, 22s) ease-in-out infinite;
        }
        .hero-card {
          animation: cardEntrance 0.7s cubic-bezier(0.22, 0.065, 0.16, 1) both;
          transition: transform 0.28s ease, box-shadow 0.28s ease;
          position: relative;
          overflow: hidden;
          will-change: transform, box-shadow;
        }
        .hero-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 40px 110px rgba(15, 23, 42, 0.56);
        }
        .hero-card-border {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.32), rgba(249, 115, 113, 0.28), rgba(168, 85, 247, 0.32));
          background-size: 220% 220%;
          opacity: 0.3;
          filter: blur(14px);
          pointer-events: none;
          animation: cardBorderGlow 10s ease-in-out infinite alternate;
        }
        .hero-card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 24px;
        }
        .hero-card-glow-top {
          top: -28%;
          right: -24%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 58%);
          opacity: 0.32;
          animation: cardGlowPulse 10s ease-in-out infinite alternate;
        }
        .hero-card-glow-bottom {
          bottom: -28%;
          left: -24%;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(249,115,113,0.26) 0%, transparent 54%);
          opacity: 0.26;
          animation: cardGlowPulse 10s ease-in-out infinite alternate;
        }
        .hero-input {
          transition: border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease;
        }
        .hero-input:focus {
          border-color: rgba(249,115,113,0.8);
          box-shadow: 0 0 0 0.24rem rgba(168,85,247,0.12), 0 10px 20px rgba(168,85,247,0.08);
        }
        .hero-google-button {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
        }
        .hero-google-button:hover {
          transform: translateY(-1px);
          border-color: rgba(251,146,60,0.6);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
        }
        .hero-google-button:active {
          transform: translateY(0) scale(0.98);
        }
        .hero-submit-button {
          position: relative;
          overflow: hidden;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .hero-submit-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.0) 55%);
          transform: translateX(-120%);
          opacity: 0.42;
          pointer-events: none;
          animation: buttonShine 4.8s ease-in-out infinite;
        }
        .hero-submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 28px 80px rgba(249, 115, 22, 0.24);
        }
        .hero-submit-button:active {
          transform: translateY(0) scale(0.98);
        }
        @keyframes buttonShine {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(220%); }
        }
        .hero-checkbox {
          transition: border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease, accent-color 200ms ease;
          accent-color: rgba(249,115,113,0.92);
        }
        .hero-checkbox:focus-visible {
          box-shadow: 0 0 0 0.2rem rgba(168,85,247,0.16);
        }
        .hero-eye-toggle {
          transition: color 180ms ease, opacity 180ms ease;
          opacity: 0.85;
        }
        .hero-eye-toggle:hover {
          opacity: 1;
          color: #f3bf71;
        }

        .bg-glow-a { animation: ambientOrange 18s ease-in-out infinite alternate; }
        .bg-glow-b { animation: ambientPurple 22s ease-in-out infinite alternate; }
        .bg-glow-c { animation: ambientCard 16s ease-in-out infinite alternate; }

        .bg-sweep {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(132deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 34%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0) 82%);
          background-size: 230% 220%;
          background-repeat: no-repeat;
          opacity: 0.06;
          transform: translateX(-18%) translateY(-12%) rotate(-8deg);
          will-change: transform, opacity;
          animation: gridSweep 28s ease-in-out infinite;
        }

        .animate-hero-logo {
          opacity: 0;
          animation: fadeInUpSmall 0.65s cubic-bezier(0.22, 0.065, 0.16, 1) 0.2s both;
        }

        .animate-hero-trust {
          opacity: 0;
          animation: fadeInUpSmall 0.65s cubic-bezier(0.22, 0.065, 0.16, 1) 0.34s both;
        }

        .animate-hero-heading {
          opacity: 0;
          animation: fadeInUpMedium 0.75s cubic-bezier(0.22, 0.065, 0.16, 1) 0.45s both;
        }

        .animate-hero-gradient {
          opacity: 1;
          background-size: 200% auto;
          background-repeat: no-repeat;
          animation: gradientShimmer 6s ease-in-out infinite;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .animate-hero-copy {
          opacity: 0;
          animation: fadeInUpSmall 0.65s cubic-bezier(0.22, 0.065, 0.16, 1) 0.65s both;
        }

        .animate-hero-stat {
          opacity: 0;
          animation: fadeInUpSmall 0.6s cubic-bezier(0.22, 0.065, 0.16, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-glow-a,
          .bg-glow-b,
          .bg-glow-c,
          .bg-particle,
          .bg-sweep,
          .animate-hero-logo,
          .animate-hero-trust,
          .animate-hero-heading,
          .animate-hero-gradient,
          .animate-hero-copy,
          .animate-hero-stat,
          .landing-cursor,
          .landing-cursor-ring {
            animation: none !important;
            transition: none !important;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div ref={ringRef} className={`landing-cursor-ring ${cursorEnabled ? "landing-cursor-visible" : ""}`} aria-hidden="true" />
      <div ref={cursorRef} className={`landing-cursor ${cursorEnabled ? "landing-cursor-visible" : ""}`} aria-hidden="true">
        <div className="landing-cursor-dot" />
      </div>

      <div className="animated-background">
        <div className="bg-glow bg-glow-a" style={{ left: '-28%', bottom: '-22%', width: '820px', height: '820px', background: 'radial-gradient(circle, rgba(252,122,84,0.38) 0%, rgba(238,72,51,0.16) 28%, transparent 72%)' }} />
        <div className="bg-glow bg-glow-b" style={{ right: '-24%', top: '-18%', width: '780px', height: '780px', background: 'radial-gradient(circle, rgba(147,75,255,0.34) 0%, rgba(125,58,252,0.12) 24%, transparent 76%)' }} />
        <div className="bg-glow bg-glow-c" style={{ left: '52%', top: '24%', width: '660px', height: '660px', background: 'radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(168,85,247,0.12) 30%, transparent 78%)' }} />
        <div className="bg-sweep" />
        {[
          { left: '10%', top: '84%', size: 4, '--move-x': '8px', '--move-y': '-68px', '--particle-duration': '20s', delay: '0s' },
          { left: '22%', top: '74%', size: 3, '--move-x': '6px', '--move-y': '-62px', '--particle-duration': '18s', delay: '1.3s' },
          { left: '34%', top: '92%', size: 4, '--move-x': '-8px', '--move-y': '-78px', '--particle-duration': '21s', delay: '0.9s' },
          { left: '48%', top: '80%', size: 3, '--move-x': '5px', '--move-y': '-56px', '--particle-duration': '23s', delay: '1.1s' },
          { left: '62%', top: '88%', size: 4, '--move-x': '-6px', '--move-y': '-70px', '--particle-duration': '17s', delay: '2.2s' },
          { left: '18%', top: '58%', size: 3, '--move-x': '4px', '--move-y': '-54px', '--particle-duration': '22s', delay: '0.7s' },
          { left: '30%', top: '42%', size: 4, '--move-x': '-7px', '--move-y': '-64px', '--particle-duration': '19s', delay: '1.9s' },
          { left: '52%', top: '26%', size: 4, '--move-x': '6px', '--move-y': '-76px', '--particle-duration': '21s', delay: '0.5s' },
          { left: '70%', top: '34%', size: 5, '--move-x': '-9px', '--move-y': '-70px', '--particle-duration': '20s', delay: '1.3s' },
          { left: '88%', top: '56%', size: 3, '--move-x': '-4px', '--move-y': '-60px', '--particle-duration': '18s', delay: '2.0s' },
          { left: '6%', top: '30%', size: 4, '--move-x': '8px', '--move-y': '-66px', '--particle-duration': '23s', delay: '0.3s' },
          { left: '24%', top: '16%', size: 4, '--move-x': '9px', '--move-y': '-72px', '--particle-duration': '18s', delay: '1.7s' },
          { left: '78%', top: '12%', size: 3, '--move-x': '-5px', '--move-y': '-56px', '--particle-duration': '25s', delay: '1.2s' },
          { left: '92%', top: '22%', size: 4, '--move-x': '4px', '--move-y': '-62px', '--particle-duration': '22s', delay: '1.8s' },
          { left: '42%', top: '54%', size: 4, '--move-x': '8px', '--move-y': '-74px', '--particle-duration': '19s', delay: '0.6s' },
          { left: '58%', top: '66%', size: 4, '--move-x': '-5px', '--move-y': '-68px', '--particle-duration': '20s', delay: '1.5s' },
        ].map((particle, index) => (
          <span
            key={index}
            className="bg-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              ...particle,
            }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(144,74,255,0.24)_0%,_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(234,81,42,0.22)_0%,_transparent_24%)]" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)", backgroundSize: "90px 90px" }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(234,81,42,0.08)_0%,_transparent_42%)]" />
      </div>

      <div className="landing-content">
        <main className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="flex flex-col justify-center gap-10 xl:gap-14">
            <div className="flex items-center gap-4 animate-hero-logo">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-yellow-300 text-slate-950 shadow-[0_20px_50px_rgba(249,115,22,0.24)]">
                <span className="text-lg font-semibold">W</span>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200">WebToolOcean</span>
            </div>

            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/40 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm animate-hero-trust">
                <Sparkles className="h-4 w-4 text-orange-300" />
                Trusted by 12,000+ builders
              </div>

              <div className="max-w-[620px] space-y-6">
                <h1 className="text-[clamp(3rem,4vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white animate-hero-heading">
                  Build websites that feel
                  <span className="block bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent animate-hero-gradient">
                    worth visiting.
                  </span>
                </h1>
                <p className="max-w-[560px] text-base leading-8 text-slate-300 animate-hero-copy">
                  A premium page builder for modern startups and creators. Drag in templates, design fast, and go live with a polished website in minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 ${index > 0 ? "border-l border-slate-600/40 pl-4" : ""} animate-hero-stat`}
                    style={{ animationDelay: `${0.72 + index * 0.08}s` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-orange-300 shadow-[0_16px_30px_rgba(248,113,113,0.12)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{item.value}</div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{item.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-[520px]">
            <div className="hero-card rounded-[24px] border border-white/10 bg-white/5 p-[28px] shadow-[0_30px_75px_rgba(15,23,42,0.45)] backdrop-blur-[18px]">
              <div className="absolute inset-0 pointer-events-none">
                <div className="hero-card-border" />
                <div className="absolute hero-card-glow-top" />
                <div className="absolute hero-card-glow-bottom" />
                <div className="absolute inset-0 rounded-[24px] border border-white/10" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
                  <h2 className="text-3xl font-semibold text-white">Sign in to your workspace</h2>
                  <p className="max-w-[420px] text-sm leading-6 text-slate-300">
                    Use your Google account or sign in with email and password to continue building beautiful pages.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="hero-google-button group flex h-[54px] w-full items-center justify-center gap-3 rounded-[12px] border border-white/15 bg-slate-900/80 px-4 text-sm font-semibold text-slate-100 transition duration-200 hover:-translate-y-[1px] hover:border-orange-300/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/80">
                    <svg viewBox="0 0 533.5 544.3" className="h-5 w-5" aria-hidden="true">
                      <path d="M533.5 278.4c0-17.4-1.5-34.2-4.3-50.4H272v95.5h146.9c-6.3 34-25 62.8-53.3 82v68.1h86.2c50.4-46.5 81.7-114.9 81.7-195.2z" fill="#4285F4" />
                      <path d="M272 544.3c72.6 0 133.6-24.1 178.2-65.5l-86.2-68.1c-24.1 16.1-55 25.7-92 25.7-70.7 0-130.6-47.7-152-111.7H31.7v70.2C75.7 482.6 167.1 544.3 272 544.3z" fill="#34A853" />
                      <path d="M120 325.2c-11.7-34.9-11.7-72.4 0-107.3V147.7H31.7c-39.8 79.8-39.8 173.7 0 253.5L120 325.2z" fill="#FBBC05" />
                      <path d="M272 107.7c39.5 0 75 13.6 103 40.3l77.3-77.3C403.7 24.9 344.2 0 272 0 167.1 0 75.7 61.7 31.7 147.7l88.3 70.2C141.4 155.4 201.3 107.7 272 107.7z" fill="#EA4335" />
                    </svg>
                  </span>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 text-[13px] text-slate-500">
                  <span className="h-px flex-1 bg-slate-500/20" />
                  or continue with email
                  <span className="h-px flex-1 bg-slate-500/20" />
                </div>

                <form className="space-y-3" onSubmit={handleSubmit}>
                  {authMode === "sign-up" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                        First name
                        <Input
                          value={fields.firstName}
                          onChange={(event) => setFields((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="First name"
                          className="hero-input h-[42px] rounded-[12px] border border-slate-700/70 bg-slate-950/70 px-4 text-slate-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
                        />
                      </label>
                      <label className="space-y-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                        Last name
                        <Input
                          value={fields.lastName}
                          onChange={(event) => setFields((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Last name"
                          className="hero-input h-[42px] rounded-[12px] border border-slate-700/70 bg-slate-950/70 px-4 text-slate-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
                        />
                      </label>
                    </div>
                  )}

                  <label className="space-y-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    Email address
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500">
                        <Mail className="h-5 w-5" />
                      </span>
                      <Input
                        type="email"
                        value={fields.email}
                        onChange={(event) => setFields((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="you@company.com"
                        className="hero-input h-[42px] rounded-[12px] border border-slate-700/70 bg-slate-950/70 px-4 pl-12 text-slate-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
                      />
                    </div>
                  </label>

                  <label className="space-y-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    Password
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500">
                        <Lock className="h-5 w-5" />
                      </span>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={fields.password}
                        onChange={(event) => setFields((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder="Password"
                        className="hero-input h-[42px] rounded-[12px] border border-slate-700/70 bg-slate-950/70 px-4 pl-12 pr-12 text-slate-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-300/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="hero-eye-toggle absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-100"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={fields.remember}
                        onChange={(event) => setFields((prev) => ({ ...prev, remember: event.target.checked }))}
                        className="hero-checkbox h-4 w-4 rounded border-slate-600 bg-slate-900 text-orange-400 focus:ring-orange-300"
                      />
                      Remember me
                    </label>
                    <button type="button" className="text-sm font-semibold text-slate-200 transition hover:text-orange-300">Forgot password?</button>
                  </div>

                  <button
                    type="submit"
                    className="hero-submit-button inline-flex h-[56px] w-full items-center justify-center rounded-[12px] bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 text-sm font-semibold text-slate-950 shadow-[0_16px_48px_rgba(249,115,22,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(249,115,22,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={submitting || signingIn}
                  >
                    {submitting || signingIn
                      ? "Please wait..."
                      : authMode === "sign-up"
                      ? "Create account"
                      : "Log in →"}
                  </button>
                </form>

                <div className="flex flex-col gap-3 border-t border-slate-700/40 pt-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {authMode === "sign-up" ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <button type="button" className="font-semibold text-orange-300 transition hover:text-orange-200" onClick={() => setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-up")}> 
                      {authMode === "sign-up" ? "Log in" : "Sign up"}
                    </button>
                  </p>
                  <div className="flex items-center gap-3 text-slate-500">
                    <button type="button" className="transition hover:text-white">Privacy</button>
                    <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />
                    <button type="button" className="transition hover:text-white">Terms</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
  );
}
