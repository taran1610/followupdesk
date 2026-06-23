"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signIn, type AuthState } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="marketing-pill-btn marketing-pill-btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {label}
    </button>
  );
}

export function LoginForm({
  authConfigured,
  initialError,
}: {
  authConfigured: boolean;
  initialError?: string;
}) {
  const [state, formAction] = useActionState(signIn, initialState);
  const error = state.error ?? initialError;

  if (!authConfigured) {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{APP_TAGLINE}</p>
        </div>
        <div className="marketing-card w-full max-w-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Sign-in unavailable</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Authentication is not configured on this server. Contact the site
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{APP_TAGLINE}</p>
      </div>

      <div className="marketing-card w-full">
        <h2 className="text-lg font-semibold text-zinc-950">Sign in</h2>
        <p className="mt-1 text-sm text-[#6b6560]">
          Welcome back. Sign in with Google or your email.
        </p>

        <div className="mt-6 space-y-4">
          <GoogleSignInButton />

          <div className="flex items-center gap-3">
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-xs">or continue with email</span>
            <span className="bg-border h-px flex-1" />
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@studio.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}

            <SubmitButton label="Sign in with email" />
          </form>

          <p className="text-muted-foreground text-center text-sm">
            New here?{" "}
            <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
