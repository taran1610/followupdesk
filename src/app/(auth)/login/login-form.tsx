"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { continueAsDemo, signIn, type AuthState } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: AuthState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {label}
    </Button>
  );
}

export function LoginForm({
  supabaseEnabled,
  initialError,
}: {
  supabaseEnabled: boolean;
  initialError?: string;
}) {
  const [state, formAction] = useActionState(signIn, initialState);
  const error = state.error ?? initialError;

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{APP_TAGLINE}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            {supabaseEnabled
              ? "Welcome back. Enter your credentials."
              : "Demo mode is on — any email and password will work."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supabaseEnabled && (
            <>
              <GoogleSignInButton />
              <div className="relative">
                <Separator />
              </div>
            </>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@studio.com"
                autoComplete="email"
                defaultValue={supabaseEnabled ? "" : "demo@followupdesk.app"}
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
                defaultValue={supabaseEnabled ? "" : "demo1234"}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}

            <SubmitButton label="Sign in" />
          </form>

          <p className="text-muted-foreground text-center text-sm">
            New here?{" "}
            <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>

          <div className="relative">
            <Separator />
          </div>

          {!supabaseEnabled && (
            <form action={continueAsDemo}>
              <Button type="submit" variant="outline" className="w-full">
                Continue in demo mode
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-xs">or</span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
