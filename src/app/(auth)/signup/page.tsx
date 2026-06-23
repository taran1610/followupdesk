import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return <SignupForm supabaseEnabled={isSupabaseConfigured()} />;
}
