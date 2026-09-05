import { notFound } from "next/navigation";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { requireModule } from "@/lib/auth/access";
import { getWorkingSchedule } from "@/lib/data/hr";
import { ScheduleForm } from "@/components/schedules/schedule-form";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireModule("schedules");
  const { id } = await params;
  const schedule = await getWorkingSchedule(id);
  if (!schedule) {
    notFound();
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title={schedule.name} description="Edit the weekly pattern. Hours update automatically." />
      <Panel>
        <ScheduleForm
          schedule={{
            id: schedule.id,
            name: schedule.name,
            calendar_type: schedule.calendar_type,
            timezone: schedule.timezone ?? undefined,
            is_active: schedule.is_active,
            rules: schedule.rules,
            days: schedule.days,
          }}
        />
      </Panel>
    </PageContainer>
  );
}
