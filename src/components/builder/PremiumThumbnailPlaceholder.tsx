import { Folder, Globe, Clock3 } from "lucide-react";
import { formatUpdatedAt } from "@/lib/utils";

interface PremiumThumbnailPlaceholderProps {
  projectName: string;
  templateId?: string;
  updatedAt?: any;
}

export function PremiumThumbnailPlaceholder({
  projectName,
  templateId,
  updatedAt,
}: PremiumThumbnailPlaceholderProps) {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#2B2B2B] via-[#1F1F1F] to-[#171717] group-hover:via-[#242424] transition-all duration-500">
      {/* Radial glow overlay */}
      <div className="absolute inset-0 opacity-30 bg-radial-glow pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(250,204,21,0.15) 0%, transparent 50%)'
      }} />

      {/* Floating circles - blurred decorations */}
      <div className="absolute top-8 right-12 w-32 h-32 bg-[#FACC15] rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-500 animate-float-1" />
      <div className="absolute bottom-16 left-8 w-24 h-24 bg-[#FDE047] rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-500 animate-float-2" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-[#FACC15] rounded-full opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-500 animate-float-3" />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(250,204,21,.05) 25%, rgba(250,204,21,.05) 26%, transparent 27%, transparent 74%, rgba(250,204,21,.05) 75%, rgba(250,204,21,.05) 76%, transparent 77%, transparent),
                            linear-gradient(90deg, transparent 24%, rgba(250,204,21,.05) 25%, rgba(250,204,21,.05) 26%, transparent 27%, transparent 74%, rgba(250,204,21,.05) 75%, rgba(250,204,21,.05) 76%, transparent 77%, transparent)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Folder icon with glow */}
        <div className="relative mb-3 group/icon">
          <div className="absolute inset-0 bg-[#FACC15] rounded-full opacity-0 blur-xl group-hover/icon:opacity-20 transition-opacity duration-500" style={{ width: '100px', height: '100px' }} />
          <Folder className="h-20 w-20 text-[#FACC15] drop-shadow-lg group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
        </div>

        {/* Project name */}
        <div className="text-center">
          <p className="text-[#F5F5F5] font-semibold text-sm truncate max-w-40 drop-shadow-md">
            {projectName || "Untitled Project"}
          </p>
          <p className="text-[#969696] text-xs mt-1 drop-shadow-sm">Website Project</p>
        </div>
      </div>

      {/* Bottom glass strip */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/30 via-black/20 to-transparent backdrop-blur-md border-t border-[#363636] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#FACC15]/20 backdrop-blur-md border border-[#FACC15]/30 flex items-center justify-center">
            <span className="text-[#FACC15] text-xs font-semibold">
              {templateId ? templateId.charAt(0).toUpperCase() : "C"}
            </span>
          </div>
          <div>
            <p className="text-[#D0D0D0] text-xs font-medium">{templateId || "Custom"}</p>
            <p className="text-[#969696] text-xs">Template</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-[#969696]" />
          <span className="text-[#969696] text-xs">
            {updatedAt ? formatUpdatedAt(updatedAt) : "Recently"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(20px, -20px) }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(-15px, 15px) }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(-10px, -10px) }
        }
        .animate-float-1 {
          animation: float-1 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 7s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-3 8s ease-in-out infinite;
        }
        .bg-radial-glow {
          background-image: radial-gradient(circle at 30% 30%, rgba(250,204,21,0.15) 0%, transparent 50%);
        }
      `}</style>
    </div>
  );
}
