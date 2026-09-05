import { requireModule } from "@/lib/auth/access";
import { listSalaryStructures } from "@/lib/data/hr";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { StructuresWorkspace } from "@/components/structures/structures-workspace";

export default async function StructuresPage() {
  const access = await requireModule("structures");
  const structures = await listSalaryStructures(access.companyId);

  return (
    <PageContainer>
      <PageHeader
        title="Salary Structures"
        description="Groups of ordered salary rules used to compute payslips. Kanban or list."
      />
      <StructuresWorkspace structures={structures} />
    </PageContainer>
  );
}
