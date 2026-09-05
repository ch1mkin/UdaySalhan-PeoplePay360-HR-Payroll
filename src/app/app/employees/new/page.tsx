import { requireModule } from "@/lib/auth/access";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  await requireModule("employees");

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="New Employee" description="Add a person to the company directory." />
      <EmployeeForm />
    </PageContainer>
  );
}
