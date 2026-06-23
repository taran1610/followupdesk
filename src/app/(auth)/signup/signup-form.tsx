"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthState } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="marketing-pill-btn marketing-pill-btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60"
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Create account with email
    </button>
  );
}

export function SignupForm({ authConfigured }: { authConfigured: boolean }) {
  const [state, formAction] = useActionState(signUp, initialState);

  if (!authConfigured) {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-[#6b6560]">{APP_TAGLINE}</p>
        </div>
        <div className="marketing-card w-full">
          <h2 className="text-lg font-semibold text-zinc-950">Sign-up unavailable</h2>
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
        <p className="mt-1 text-sm text-[#6b6560]">{APP_TAGLINE}</p>
      </div>

      <div className="marketing-card w-full">
        <h2 className="text-lg font-semibold text-zinc-950">Create your account</h2>
        <p className="mt-1 text-sm text-[#6b6560]">
          Sign up with Google or your email to save your pipeline.
        </p>

        <div className="mt-6 space-y-4">
          <GoogleSignInButton label="Sign up with Google" />

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e8e4dc]" />
            <span className="text-xs text-[#6b6560]">or continue with email</span>
            <span className="h-px flex-1 bg-[#e8e4dc]" />
          </div>

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" placeholder="Jamie Rivera" autoComplete="name" />
            </div>
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
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            {state.error && (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>

          <p className="text-center text-sm text-[#6b6560]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-950 underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
