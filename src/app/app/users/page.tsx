import { requireModule } from "@/lib/auth/access";
import { listCompanies } from "@/lib/data/hr";
import { listDirectoryUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { UsersWorkspace } from "@/components/users/users-workspace";

export default async function UsersPage() {
  const access = await requireModule("users");
  const [users, companies] = await Promise.all([listDirectoryUsers(), listCompanies()]);

  return (
    <PageContainer>
      <PageHeader
        title="User management"
        description="All logins, roles and account status. Only a platform admin can assign roles."
      />
      <UsersWorkspace users={users} companies={companies} currentUserId={access.userId} />
    </PageContainer>
  );
}
