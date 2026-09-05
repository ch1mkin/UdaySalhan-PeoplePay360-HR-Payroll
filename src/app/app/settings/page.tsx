import { requireModule } from "@/lib/auth/access";
import { listCompanies } from "@/lib/data/hr";
import { listManagedUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { CompanyForm } from "@/components/settings/company-form";
import { UserDialogs } from "@/components/settings/create-user-form";

export default async function SettingsPage() {
  const access = await requireModule("settings");
  const canManageUsers = access.role === "admin" || access.role === "company_admin";
  const [companies, users] = canManageUsers
    ? await Promise.all([listCompanies(), listManagedUsers()])
    : [[], []];

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Company, users and workspace roles." />
      <Panel>
        <h2 className="mb-1 text-[15px] font-semibold">Company</h2>
        <p className="mb-4 text-[13px] text-pp-muted">
          {access.companyId
            ? `Current company: ${access.companyName}`
            : "Create a company before adding employees."}
        </p>
        {access.companyId ? null : <CompanyForm />}
      </Panel>

      {canManageUsers ? (
        <Panel className="mt-4">
          <h2 className="mb-1 text-[15px] font-semibold">Users and roles</h2>
          <p className="mb-4 text-[13px] text-pp-muted">
            Accounts are created here. People cannot self-register.
          </p>
          <UserDialogs
            companies={companies}
            canAssignPlatformAdmin={access.role === "admin"}
            users={users}
          />
        </Panel>
      ) : null}
    </PageContainer>
  );
}
