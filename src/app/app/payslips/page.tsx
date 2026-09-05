import { requireModule } from "@/lib/auth/access";
import { listPayslips } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { PayslipsWorkspace } from "@/components/payslips/payslips-workspace";

export default async function PayslipsPage() {
  const access = await requireModule("payslips");
  const payslips = await listPayslips(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Payslips"
        description="Payslips generated from salary rules during a payrun. Kanban or list."
      />
      <PayslipsWorkspace payslips={payslips} />
    </PageContainer>
  );
}
