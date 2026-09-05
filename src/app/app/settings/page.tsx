import { requireModule, isPlatformAdmin } from "@/lib/auth/access";
import { getSmtpPublicStatus } from "@/lib/email/smtp";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { CompanyForm } from "@/components/settings/company-form";
import { SmtpTestForm } from "@/components/settings/smtp-test-form";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const access = await requireModule("settings");
  const smtp = getSmtpPublicStatus();
  const admin = isPlatformAdmin(access.role);

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Company and mail delivery." />
      <Panel>
        <h2 className="mb-1 text-[15px] font-semibold">Company</h2>
        <p className="mb-4 text-[13px] text-pp-muted">
          {access.companyId
            ? `Current company: ${access.companyName}`
            : "Create a company before adding employees."}
        </p>
        {access.companyId ? null : <CompanyForm />}
      </Panel>

      {admin ? (
        <Panel className="mt-4">
          <h2 className="mb-1 text-[15px] font-semibold">Users</h2>
          <p className="mb-4 text-[13px] text-pp-muted">
            Create logins, assign roles and approve details from User management. People cannot pick
            their own role.
          </p>
          <Button href="/app/users">Open user management</Button>
        </Panel>
      ) : null}

      <Panel className="mt-4">
        <h2 className="mb-1 text-[15px] font-semibold">Mail delivery</h2>
        <p className="mb-4 text-[13px] text-pp-muted">
          Send a branded test message through Hostinger SMTP before inviting users.
        </p>
        <SmtpTestForm
          defaultTo={access.email}
          configured={smtp.configured}
          host={smtp.host}
          port={smtp.port}
          from={smtp.from}
        />
      </Panel>
    </PageContainer>
  );
}
