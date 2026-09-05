import { requireModule } from "@/lib/auth/access";
import { listWorkingSchedules } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SchedulesWorkspace } from "@/components/schedules/schedules-workspace";

export default async function SchedulesPage() {
  const access = await requireModule("schedules");
  const schedules = await listWorkingSchedules(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Working schedules"
        description="Weekly patterns used by attendance, contracts and payroll. Click a row to open the form."
        actions={<Button href="/app/schedules/new">New schedule</Button>}
      />
      <SchedulesWorkspace schedules={schedules} companyName={access.companyName} />
    </PageContainer>
  );
}
