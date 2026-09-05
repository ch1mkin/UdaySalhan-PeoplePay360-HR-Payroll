import { requireModule, isPlatformAdmin } from "@/lib/auth/access";
import { canSetupAttendanceHours } from "@/lib/auth/permissions";
import { getCompanyWorkHours } from "@/lib/actions/attendance";
import { getSmtpPublicStatus } from "@/lib/email/smtp";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { CompanyForm } from "@/components/settings/company-form";
import { SmtpTestForm } from "@/components/settings/smtp-test-form";
import { WorkHoursForm } from "@/components/attendance/work-hours-form";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const access = await requireModule("settings");
  const smtp = getSmtpPublicStatus();
  const admin = isPlatformAdmin(access.role);
  const canSetupHours = canSetupAttendanceHours(access.role);
  const hours = await getCompanyWorkHours(access.companyId);

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

      {canSetupHours && access.companyId ? (
        <Panel className="mt-4">
          <h2 className="mb-1 text-[15px] font-semibold">Attendance hours</h2>
          <p className="mb-4 text-[13px] text-pp-muted">
            Morning and evening times used for check in, check out, and coloured attendance dots.
          </p>
          <WorkHoursForm hours={hours} />
        </Panel>
      ) : null}

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
