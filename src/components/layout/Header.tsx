import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMounted } from "@/hooks/use-mounted";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginDialog } from "@/components/builder/LoginDialog";

export function Header({ hideBranding, hideProfile }: { hideBranding?: boolean; hideProfile?: boolean } = {}) {
  const mounted = useMounted();
  const navigate = useNavigate();

  const { user, logout, authReady } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);

  useEffect(() => {
    if (user && authDialogOpen) {
      setAuthDialogOpen(false);
    }
  }, [user, authDialogOpen]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSwitchAccount = async () => {
    await logout();
    setAuthMode("sign-in");
    setAuthDialogOpen(true);
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 h-12 w-full border-b border-[#363636] bg-[#1F1F1F]/95">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 rounded-md bg-[#2B2B2B]" />
          <div className="h-8 w-8 rounded-full bg-[#2B2B2B]" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 h-12 w-full border-b border-[#363636] bg-[#1F1F1F]/95">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {!hideBranding ? (
          <div className="flex items-center gap-3 text-[#F5F5F5]">
            {showProjectDashboard ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="flex items-center gap-3 text-[#F5F5F5] hover:text-[#F5F5F5]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-semibold uppercase tracking-tight text-[#111111] shadow-sm">
                  W
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-none">
                    WebToolOcean
                  </p>
                  <p className="text-xs text-[#969696]">
                    Website Builder
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FACC15] text-sm font-semibold uppercase tracking-tight text-[#111111] shadow-sm">
                  W
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-none">
                    WebToolOcean
                  </p>
                  <p className="text-xs text-[#969696]">
                    Website Builder
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : <div />}

        {!hideProfile ? (
          <div className="flex items-center gap-2">
            {authReady ? (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] text-[#F5F5F5] transition hover:border-[#FACC15]"
                    >
                      <Avatar className="h-8 w-8">
                        {user.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={user.name} />
                        ) : (
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        )}
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} align="end" className="w-56 bg-[#1F1F1F] border-[#363636] text-[#F5F5F5]">
                    <div className="px-3 py-2 text-sm">
                      <p className="font-semibold text-[#F5F5F5]">{user.name}</p>
                      <p className="text-xs text-[#969696]">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-[#363636]" />
                    <DropdownMenuItem onSelect={handleSwitchAccount} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                      <User className="mr-2 h-4 w-4 text-[#969696]" />
                      Switch Account
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setShowProjectDashboard(true);
                        navigate({ to: '/' });
                      }}
                      className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]"
                    >
                      <User className="mr-2 h-4 w-4 text-[#969696]" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void 0} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                      <Settings className="mr-2 h-4 w-4 text-[#969696]" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void 0} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                      <CreditCard className="mr-2 h-4 w-4 text-[#969696]" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#363636]" />
                    <DropdownMenuItem onSelect={handleLogout} className="text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]">
                      <LogOut className="mr-2 h-4 w-4 text-[#969696]" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#363636] bg-[#1F1F1F] px-4 text-sm font-semibold text-[#F5F5F5] transition hover:border-[#FACC15] hover:text-[#FACC15]"
                    onClick={() => {
                      setAuthMode("sign-in");
                      setAuthDialogOpen(true);
                    }}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-md bg-[#FACC15] px-4 text-sm font-semibold text-[#111111] transition hover:bg-[#FDE047]"
                    onClick={() => {
                      setAuthMode("sign-up");
                      setAuthDialogOpen(true);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )
            ) : null}

          </div>
        ) : null}
      </div>
      <LoginDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} initialMode={authMode} />
    </header>
  );
}
