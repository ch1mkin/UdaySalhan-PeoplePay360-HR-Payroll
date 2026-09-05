import { getAccessContext } from "@/lib/auth/access";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const access = await getAccessContext();

  return (
    <PageContainer className="max-w-xl">
      <PageHeader
        title="Profile"
        description="Update your name and password. Your role is assigned by an admin."
      />
      <Panel>
        <ProfileForm
          fullName={access.fullName}
          email={access.email}
          role={access.role}
          companyName={access.companyName}
        />
      </Panel>
    </PageContainer>
  );
}
