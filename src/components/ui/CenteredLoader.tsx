import { useEffect, useState, type ReactNode } from "react";
import aiLoaderRobot from "../../assets/images/ai-robot.png";

interface CenteredLoaderProps {
  message?: string;
  details?: ReactNode;
  className?: string;
}

export function CenteredLoader({
  message = "Preparing your website builder…",
  details = "This will take only a moment.",
  className = "",
}: CenteredLoaderProps) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDotCount((count) => (count % 3) + 1);
    }, 450);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex min-h-screen min-w-screen items-center justify-center overflow-hidden bg-[#07091a] text-white ${className}`}>
      <style>{`
        @keyframes premium-drift {
          0%, 100% { transform: translate(0, 0); opacity: 0.7; }
          50% { transform: translate(18px, -14px); opacity: 0.55; }
        }
        @keyframes premium-drift-opposite {
          0%, 100% { transform: translate(0, 0); opacity: 0.68; }
          50% { transform: translate(-20px, 16px); opacity: 0.52; }
        }
        @keyframes premium-grid-fade {
          0%, 100% { opacity: 0.24; }
          50% { opacity: 0.14; }
        }
        @keyframes premium-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.85; }
          50% { transform: translate(0, -18px); opacity: 0.45; }
        }
        @keyframes premium-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes premium-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes premium-rotate-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes premium-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes premium-progress-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes premium-progress-shine {
          0% { transform: translateX(-120%); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes premium-panel-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes premium-robot-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes premium-ring-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes premium-ring-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes premium-bar-fill {
          0%, 12% { width: 0%; }
          40%, 80% { width: 100%; }
          100% { width: 0%; }
        }
        .ai-robot-orbit {
          position: relative;
          width: 260px;
          height: 260px;
          display: grid;
          place-items: center;
          isolation: isolate;
          pointer-events: none;
        }

        .orbit-ring,
        .robot-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .orbit-ring-outer {
          width: 260px;
          height: 260px;
          border: 1px solid rgba(143, 92, 255, 0.45);
          animation: orbitSpin 20s linear infinite;
          opacity: 0.6;
        }

        .orbit-ring-middle {
          width: 220px;
          height: 220px;
          padding: 5px;
          background:
            conic-gradient(
              from 20deg,
              transparent 0deg 45deg,
              #ff9f1c 70deg,
              #ff5d8f 145deg,
              #a855f7 220deg,
              transparent 250deg 360deg
            );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: orbitSpin 5s linear infinite;
          opacity: 0.95;
        }

        .orbit-ring-inner {
          width: 180px;
          height: 180px;
          border: 1px dashed rgba(168, 85, 247, 0.55);
          animation: orbitSpinReverse 12s linear infinite;
          opacity: 0.8;
        }

        .robot-glow {
          width: 150px;
          height: 150px;
          background: radial-gradient(
            circle,
            rgba(255, 136, 50, 0.45),
            rgba(168, 85, 247, 0.2) 45%,
            transparent 72%
          );
          filter: blur(18px);
          animation: robotGlow 3.5s ease-in-out infinite;
          opacity: 0.5;
        }

        .ai-loader-robot {
          position: relative;
          z-index: 5;
          width: 130px;
          height: auto;
          object-fit: contain;
          animation: robotFloat 3.5s ease-in-out infinite;
        }

        @keyframes orbitSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitSpinReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes robotFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes robotGlow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.92);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        @media (max-width: 640px) {
          .ai-robot-orbit {
            transform: scale(0.72);
            margin: -42px 0;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#07091a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.14),transparent_28%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),transparent_28%)]" style={{ animation: "premium-drift-opposite 23s ease-in-out infinite" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.18),transparent_30%)]" style={{ animation: "premium-drift 19s ease-in-out infinite" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.16),transparent_26%)] opacity-80" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
            opacity: 0.22,
            animation: 'premium-grid-fade 20s ease-in-out infinite',
          }}
        />
        <div className="absolute left-[-15%] top-[55%] h-[220px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.08),transparent_58%)] blur-3xl opacity-40" />
        <div className="absolute right-[-12%] top-[40%] h-[220px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(79,70,229,0.1),transparent_56%)] blur-3xl opacity-35" />
        <div className="absolute left-[4%] bottom-[10%] h-[120px] w-[420px] bg-[radial-gradient(circle,_rgba(249,115,22,0.18),transparent_54%)] blur-3xl opacity-40" />
        <div className="absolute left-[12%] bottom-[22%] h-1 w-[46%] rounded-full bg-gradient-to-r from-orange-500/40 via-transparent to-fuchsia-500/10 blur-sm" style={{ transform: "rotate(-3deg)" }} />
        <div className="absolute right-[10%] bottom-[24%] h-1 w-[38%] rounded-full bg-gradient-to-r from-violet-500/30 via-transparent to-cyan-400/10 blur-sm" style={{ transform: "rotate(4deg)" }} />

        {[
          { cx: "14%", cy: "22%", size: 10, color: "rgba(168,85,247,0.6)", delay: "0s" },
          { cx: "72%", cy: "18%", size: 16, color: "rgba(59,130,246,0.45)", delay: "3s" },
          { cx: "26%", cy: "76%", size: 12, color: "rgba(245,158,11,0.38)", delay: "1.8s" },
          { cx: "58%", cy: "64%", size: 8, color: "rgba(168,85,247,0.5)", delay: "5s" },
          { cx: "82%", cy: "48%", size: 14, color: "rgba(56,189,248,0.32)", delay: "2.5s" },
          { cx: "40%", cy: "36%", size: 9, color: "rgba(255,184,108,0.35)", delay: "4.2s" },
        ].map((particle) => (
          <span
            key={particle.cx + particle.cy}
            className="absolute rounded-full"
            style={{
              left: particle.cx,
              top: particle.cy,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              filter: "blur(1px)",
              opacity: 0.8,
              animation: `premium-particle 22s ease-in-out ${particle.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div
          className="absolute top-24 rounded-[26px] border border-violet-400/20 bg-slate-950/20 p-4 shadow-[0_0_40px_rgba(124,58,237,0.14)] backdrop-blur-xl opacity-75"
          style={{ left: -180, width: 192, animation: "premium-panel-float 14s ease-in-out infinite" }}
        >
          <div className="mb-3 h-2.5 w-16 rounded-full bg-violet-400/30" />
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-white/10" />
            <div className="h-2 rounded-full bg-white/10 w-5/6" />
            <div className="h-2 rounded-full bg-white/10 w-3/4" />
            <div className="h-2 rounded-full bg-white/10 w-2/3" />
          </div>
        </div>

        <div
          className="absolute left-[calc(50%_-_260px)] top-[63%] rounded-[26px] border border-violet-400/20 bg-slate-950/18 p-4 shadow-[0_0_40px_rgba(124,58,237,0.14)] backdrop-blur-xl opacity-70"
          style={{ animation: "premium-panel-float 11s ease-in-out infinite", animationDelay: "1.5s" }}
        >
          <div className="mb-3 h-3 w-20 rounded-full bg-violet-400/35" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 rounded-2xl bg-white/10" />
            <div className="h-16 rounded-2xl bg-white/10" />
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10 w-4/5" />
        </div>

        <div
          className="absolute right-[calc(50%_-_260px)] top-24 rounded-[26px] border border-violet-400/20 bg-slate-950/18 p-4 shadow-[0_0_40px_rgba(124,58,237,0.14)] backdrop-blur-xl opacity-70"
          style={{ animation: "premium-panel-float 13s ease-in-out infinite", animationDelay: "0.8s" }}
        >
          <div className="mb-3 h-2.5 w-16 rounded-full bg-violet-400/30" />
          <div className="space-y-2">
            <div className="h-4 w-4 rounded-full bg-white/10" />
            <div className="h-4 w-4 rounded-full bg-white/10" />
            <div className="h-4 w-4 rounded-full bg-white/10" />
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 w-3/4" />
          <div className="mt-2 h-2 rounded-full bg-white/10 w-2/3" />
        </div>

        <div
          className="absolute right-[-180px] top-[55%] rounded-[26px] border border-violet-400/20 bg-slate-950/20 p-4 shadow-[0_0_40px_rgba(124,58,237,0.14)] backdrop-blur-xl opacity-75"
          style={{ width: 180, animation: "premium-panel-float 15s ease-in-out infinite", animationDelay: "2s" }}
        >
          <div className="mb-3 h-2.5 w-16 rounded-full bg-violet-400/30" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-8 rounded-2xl bg-white/10" />
            <div className="h-8 rounded-2xl bg-white/10" />
            <div className="h-8 rounded-2xl bg-white/10" />
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10 w-3/5" />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 sm:px-6 sm:py-8 lg:px-10">
        <div className="ai-robot-orbit">
          <div className="orbit-ring orbit-ring-outer" />
          <div className="orbit-ring orbit-ring-middle" />
          <div className="orbit-ring orbit-ring-inner" />
          <div className="robot-glow" />
          <img src={aiLoaderRobot} alt="AI assistant" className="ai-loader-robot" />
        </div>

        <div className="max-w-2xl text-center">
          <h1 className="text-[28px] font-semibold tracking-tight text-white sm:text-[32px] md:text-[34px]">
            Preparing your <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">website builder</span>…
          </h1>
          <p className="mt-3 text-base text-slate-300 sm:text-lg">This will take only a moment.</p>
        </div>

        <div className="mt-6 w-full max-w-[420px]">
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-900/65 shadow-[0_0_28px_rgba(59,130,246,0.16)]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500"
              style={{ width: "0%", animation: "premium-bar-fill 4.8s ease-in-out infinite" }}
            />
            <div
              className="absolute left-0 top-0 h-full w-full rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.45),rgba(255,255,255,0.05),rgba(255,255,255,0.25))] opacity-0"
              style={{ animation: "premium-progress-shine 3.6s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div className="mt-3 text-sm text-slate-400 sm:text-base">
          <span className="font-medium text-white">⚡ Initializing AI engine</span>
          <span className="inline-flex items-center">
            {Array.from({ length: dotCount }).map((_, index) => (
              <span key={index} className="ml-1 text-slate-400">.</span>
            ))}
          </span>
        </div>

        <div className="hidden xl:grid w-full grid-cols-1 gap-3 xl:grid-cols-4">
          {[
            { title: "Loading Components", subtitle: "Setting up essential tools" },
            { title: "AI Assistant", subtitle: "Powering your creativity" },
            { title: "Cloud Sync", subtitle: "Preparing your workspace" },
            { title: "Secure & Fast", subtitle: "Optimizing performance" },
          ].map((item) => (
            <div key={item.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg shadow-violet-500/10">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.subtitle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
