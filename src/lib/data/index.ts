import { isSupabaseConfigured } from "@/lib/config";
import type { Repository } from "./repository";
import { MockRepository } from "./mock-repo";
import { SupabaseRepository } from "./supabase-repo";

let cached: Repository | null = null;

/**
 * Returns the active data repository. Uses Supabase when configured,
 * otherwise falls back to the seeded in-memory mock store.
 */
export function getRepository(): Repository {
  if (cached) return cached;
  cached = isSupabaseConfigured() ? new SupabaseRepository() : new MockRepository();
  return cached;
}

export type { Repository } from "./repository";
