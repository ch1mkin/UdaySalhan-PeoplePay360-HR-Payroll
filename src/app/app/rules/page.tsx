import { requireModule } from "@/lib/auth/access";
import { listSalaryRules } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { RulesWorkspace } from "@/components/rules/rules-workspace";

export default async function RulesPage() {
  const access = await requireModule("rules");
  const rules = await listSalaryRules(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Salary Rules"
        description="Ordered calculation steps: fixed, percentage or formula. Kanban or list."
      />
      <RulesWorkspace rules={rules} />
    </PageContainer>
  );
}
