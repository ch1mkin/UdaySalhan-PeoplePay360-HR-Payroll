import { requireModule } from "@/lib/auth/access";
import { listDirectoryUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { ApprovalsList } from "@/components/users/approvals-list";

export default async function ApprovalsPage() {
  await requireModule("approvals");
  const users = await listDirectoryUsers();
  const pending = users.filter((user) => user.account_status === "pending_approval");
  const history = users.filter(
    (user) =>
      Boolean(user.approved_at) ||
      (user.account_status === "suspended" && Boolean(user.details_submitted_at)),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Approvals"
        description="Review new details, then look back at who was approved or declined."
      />
      <ApprovalsList pending={pending} history={history} />
    </PageContainer>
  );
}
