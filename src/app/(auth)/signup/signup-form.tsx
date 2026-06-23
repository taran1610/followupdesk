"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthState } from "@/app/actions/auth";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Create account
    </Button>
  );
}

export function SignupForm({ supabaseEnabled }: { supabaseEnabled: boolean }) {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{APP_TAGLINE}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {supabaseEnabled
              ? "Sign up with email to save your pipeline."
              : "Demo mode — your account starts with sample leads."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supabaseEnabled && (
            <>
              <GoogleSignInButton label="Sign up with Google" />
              <div className="relative flex items-center gap-3">
                <span className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-xs">or</span>
                <span className="bg-border h-px flex-1" />
              </div>
            </>
          )}

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
                defaultValue={supabaseEnabled ? "" : "demo@followupdesk.app"}
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
                defaultValue={supabaseEnabled ? "" : "demo1234"}
              />
            </div>

            {state.error && (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
