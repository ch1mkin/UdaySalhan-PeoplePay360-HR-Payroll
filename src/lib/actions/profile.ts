"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessContext } from "@/lib/auth/access";

export async function updateMyProfile(formData: FormData) {
  const access = await getAccessContext();
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Connect Supabase before updating your profile." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  if (fullName.length < 2) {
    return { error: "Enter your name." };
  }

  if (formData.has("role") || formData.has("account_status")) {
    return { error: "You cannot assign a role or change account status." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (error) {
    return { error: error.message };
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  if (password || confirm) {
    if (password.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }
    if (password !== confirm) {
      return { error: "Passwords do not match." };
    }
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      return { error: passwordError.message };
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/profile");
  return { error: null, role: access.role };
}
