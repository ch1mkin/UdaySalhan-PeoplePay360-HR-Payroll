import { requireModule } from "@/lib/auth/access";
import { listCompanies } from "@/lib/data/hr";
import { listManagedUsers } from "@/lib/actions/users";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { CompanyForm } from "@/components/settings/company-form";
import { CreateUserForm } from "@/components/settings/create-user-form";
import { StatusBadge } from "@/components/ui/status-badge";

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
          <CreateUserForm
            companies={companies}
            canAssignPlatformAdmin={access.role === "admin"}
          />
          {users.length > 0 ? (
            <table className="mt-6 w-full text-left text-[13px]">
              <thead>
                <tr className="text-pp-muted">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-pp-border">
                    <td className="py-2.5">{user.full_name || "—"}</td>
                    <td className="py-2.5">
                      <StatusBadge status={user.role ?? "employee"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </Panel>
      ) : null}
    </PageContainer>
  );
}
