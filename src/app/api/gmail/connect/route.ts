import { connectGmailAction } from "@/app/actions/gmail";

/** Legacy route — forwards to Supabase Google OAuth connect flow. */
export async function GET() {
  await connectGmailAction();
}
