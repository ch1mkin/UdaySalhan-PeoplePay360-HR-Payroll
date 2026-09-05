import { requireModule } from "@/lib/auth/access";
import { listPayruns } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PayrunsWorkspace } from "@/components/payruns/payruns-workspace";

export default async function PayrunsPage() {
  const access = await requireModule("payruns");
  const payruns = await listPayruns(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Payruns"
        description="Draft, compute, validate and mark paid. Switch between kanban and list."
        actions={<Button disabled>Create Payrun</Button>}
      />
      <PayrunsWorkspace payruns={payruns} />
    </PageContainer>
  );
}
