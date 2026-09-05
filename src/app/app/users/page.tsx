import { requireModule } from "@/lib/auth/access";
import { listDirectoryUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { UsersWorkspace } from "@/components/users/users-workspace";

export default async function UsersPage() {
  const access = await requireModule("users");
  const users = await listDirectoryUsers();

  return (
    <PageContainer>
      <PageHeader
        title="User management"
        description="All logins, roles and account status. New users join your company. Only a platform admin can assign roles."
      />
      <UsersWorkspace users={users} currentUserId={access.userId} />
    </PageContainer>
  );
}
