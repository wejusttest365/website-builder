import { BookOpen, FileText, Layers, LogOut } from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
  initials: string;
}

interface AccountMenuProps {
  user: UserInfo | null;
  accountOpen: boolean;
  setAccountOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogout: () => void;
}

export function AccountMenu({
  user,
  accountOpen,
  setAccountOpen,
  handleLogout,
}: AccountMenuProps) {
  if (!user || !accountOpen) return null;

  const menuItems = [
    {
      label: "Dashboard",
      icon: FileText,
      onClick: () => setAccountOpen(false),
    },
    {
      label: "Help & Docs",
      icon: BookOpen,
      onClick: () => setAccountOpen(false),
    },
    {
      label: "Changelog",
      icon: Layers,
      onClick: () => setAccountOpen(false),
    },
    {
      label: "Log out",
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 overflow-hidden rounded-3xl border border-[#363636] bg-[#1F1F1F] shadow-[0_25px_60px_-30px_rgba(0,0,0,0.25)]">

      <div className="p-4 pb-2">
        <div className="flex items-center gap-3">

          <div className="inline-flex aspect-square h-8 w-8 items-center justify-center rounded-full bg-[#FACC15] text-[#111111] text-[10px] font-semibold">
            {user.initials}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#F5F5F5]">
              {user.name}
            </div>

            <div className="truncate text-xs text-[#969696]">
              {user.email}
            </div>
          </div>

        </div>
      </div>

      <div className="space-y-1 border-t border-[#363636] px-3 py-3">
        {menuItems.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-[#242424] text-[#D0D0D0]"
          >
            <Icon className="h-4 w-4 text-[#969696]" />
            {label}
          </button>
        ))}
      </div>

    </div>
  );
}