"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

function GoogleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" fill="none" {...props}>
      <path
        d="M533.5 278.4c0-17.4-1.5-34.2-4.3-50.4H272v95.5h146.9c-6.3 34-25 62.8-53.3 82v68.1h86.2c50.4-46.5 81.7-114.9 81.7-195.2z"
        fill="#4285F4"
      />
      <path
        d="M272 544.3c72.6 0 133.6-24.1 178.2-65.5l-86.2-68.1c-24.1 16.1-55 25.7-92 25.7-70.7 0-130.6-47.7-152-111.7H31.7v70.2C75.7 482.6 167.1 544.3 272 544.3z"
        fill="#34A853"
      />
      <path
        d="M120 325.2c-11.7-34.9-11.7-72.4 0-107.3V147.7H31.7c-39.8 79.8-39.8 173.7 0 253.5L120 325.2z"
        fill="#FBBC05"
      />
      <path
        d="M272 107.7c39.5 0 75 13.6 103 40.3l77.3-77.3C403.7 24.9 344.2 0 272 0 167.1 0 75.7 61.7 31.7 147.7l88.3 70.2C141.4 155.4 201.3 107.7 272 107.7z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "sign-in" | "sign-up";
  pendingAction?: { type: "preview" | "export" | "publish"; callback: () => void | Promise<void> } | null;
  onPendingActionComplete?: () => void;
}

export function AuthDrawer({ 
  open, 
  onOpenChange, 
  initialMode = "sign-in",
  pendingAction,
  onPendingActionComplete,
}: AuthDrawerProps) {
  const { user, signingIn, login, register, loginWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!credentials.email.trim() || !credentials.password.trim()) return;

    try {
      if (authMode === "sign-up") {
        await register(credentials.firstName, credentials.lastName, credentials.email, credentials.password);
      } else {
        await login(credentials.email, credentials.password);
      }
      onOpenChange(false);
      setCredentials({ firstName: "", lastName: "", email: "", password: "", remember: false });
      
      if (pendingAction?.callback) {
        try {
          await pendingAction.callback();
          onPendingActionComplete?.();
        } catch (error) {
          console.error("Pending action failed after login:", error);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Authentication failed. Please try again.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="h-full w-full max-w-[420px] rounded-none border-l border-[#363636] bg-[#1F1F1F] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
        <DrawerHeader className="flex flex-row items-center justify-between border-b border-[#363636] px-6 py-5">
          <div className="space-y-1 text-left">
            <DrawerTitle className="text-xl font-semibold text-[#F5F5F5]">
              {authMode === "sign-in" ? "Welcome back" : "Create your account"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-[#969696]">
              {pendingAction ? "Please login to continue." : (authMode === "sign-in" ? "Sign in to continue your projects." : "Create your account to keep building.")}
            </DrawerDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#969696] hover:text-[#F5F5F5]"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <button
            type="button"
            onClick={async () => {
              try {
                await loginWithGoogle();
                onOpenChange(false);
              } catch {
                toast.error("Google sign in failed");
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#363636] bg-[#202020] px-4 py-3 text-sm font-semibold text-[#F5F5F5] transition hover:bg-[#242424]"
          >
            <GoogleLogo className="h-5 w-5" />
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[#363636]" />
            <div className="relative mx-auto w-max bg-[#1F1F1F] px-3 text-xs text-[#969696]">
              OR
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "sign-up" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#D0D0D0]">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#969696]" />
                    <Input
                      value={credentials.firstName}
                      onChange={(e) => setCredentials((p) => ({ ...p, firstName: e.target.value }))}
                      placeholder="First Name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#D0D0D0]">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#969696]" />
                    <Input
                      value={credentials.lastName}
                      onChange={(e) => setCredentials((p) => ({ ...p, lastName: e.target.value }))}
                      placeholder="Last Name"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-[#D0D0D0]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#969696]" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials((p) => ({ ...p, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#D0D0D0]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-[#969696]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-[#969696]"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#D0D0D0]">
              <input
                type="checkbox"
                checked={credentials.remember}
                onChange={(e) => setCredentials((p) => ({ ...p, remember: e.target.checked }))}
              />
              Remember me
            </label>

            <Button type="submit" disabled={signingIn} className="w-full">
              {signingIn ? "Please wait..." : authMode === "sign-in" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-[#D0D0D0]">
            {authMode === "sign-in" ? (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" className="font-semibold text-[#FACC15]" onClick={() => setAuthMode("sign-up")}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" className="font-semibold text-[#FACC15]" onClick={() => setAuthMode("sign-in")}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
