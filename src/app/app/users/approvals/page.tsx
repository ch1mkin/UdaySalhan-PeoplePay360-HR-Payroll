import { requireModule } from "@/lib/auth/access";
import { listDirectoryUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { ApprovalsList } from "@/components/users/approvals-list";

export default async function ApprovalsPage() {
  await requireModule("approvals");
  const users = (await listDirectoryUsers()).filter((user) => user.account_status === "pending_approval");

  return (
    <PageContainer>
      <PageHeader
        title="Approvals"
        description="Review employee details submitted from invite links, then activate access."
      />
      <ApprovalsList users={users} />
    </PageContainer>
  );
}
