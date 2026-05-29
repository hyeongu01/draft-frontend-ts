import { type Database } from "@/lib/supabase/database.types";
import { SupabaseClient, User } from "@supabase/supabase-js";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export class ProfileService {
  constructor(readonly supabaseClient: SupabaseClient<Database>) {}

  signup = async (user: User, nickname: string) => {
    const { data, error } = await this.supabaseClient.from("profiles").insert({
      id: user.id,
      nickname,
    });
    if (error) throw error;
    return data;
  };
}
