import { redirect } from "next/navigation";
import { getAccessContext, isPlatformAdmin } from "@/lib/auth/access";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Complete your details · PeoplePay360",
};

export default async function CompleteProfilePage() {
  const access = await getAccessContext();
  if (isPlatformAdmin(access.role) || access.accountStatus === "active") {
    redirect("/app");
  }
  if (access.accountStatus !== "invited") {
    redirect("/auth/waiting");
  }

  return (
    <CompleteProfileForm
      username={access.username}
      email={access.email}
      fullName={access.fullName}
    />
  );
}
