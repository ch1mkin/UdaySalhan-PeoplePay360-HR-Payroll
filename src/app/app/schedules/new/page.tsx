import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { requireModule } from "@/lib/auth/access";
import { ScheduleForm } from "@/components/schedules/schedule-form";

export default async function NewSchedulePage() {
  await requireModule("schedules");
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="New working schedule"
        description="Define the weekly pattern. Weekly hours are calculated from start, end and break."
      />
      <Panel>
        <ScheduleForm />
      </Panel>
    </PageContainer>
  );
}
