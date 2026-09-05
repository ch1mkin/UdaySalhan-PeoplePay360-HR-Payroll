import { requireModule } from "@/lib/auth/access";
import { getDashboardStats } from "@/lib/data/hr";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FilterBar, SelectFilter } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { CompensationChart } from "@/components/reports/compensation-chart";
import { formatLakhs, formatMoney } from "@/lib/format/money";

export default async function DashboardPage() {
  const access = await requireModule("dashboard");
  const stats = await getDashboardStats(access.companyId);
  const empty = stats.payslipsGenerated === 0;

  return (
    <PageContainer>
      <PageHeader
        title="Payroll Dashboard"
        description="Overview of payroll, attendance and employee costs."
      />
      <FilterBar>
        <SelectFilter name="period" label="Period" />
        <SelectFilter name="department" label="Department" />
        <SelectFilter name="employee_type" label="Employee Type" />
        <SelectFilter name="company" label="Company" />
      </FilterBar>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net Salary" value={formatLakhs(stats.netSalaryPaid)} accent="primary" />
        <StatCard
          label="Payslips"
          value={empty ? "—" : String(stats.payslipsGenerated)}
          accent="secondary"
        />
        <StatCard label="Avg Salary" value={formatMoney(stats.averageSalary)} accent="neutral" />
        <StatCard
          label="Attendance"
          value={stats.attendanceRate == null ? "—" : `${stats.attendanceRate}%`}
          accent="success"
        />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-3 text-[18px] font-semibold">Monthly Net Salary</h2>
          {stats.monthlyNet.length === 0 ? (
            <p className="text-[13px] text-pp-muted">No paid payslips yet.</p>
          ) : (
            <CompensationChart data={stats.monthlyNet} />
          )}
        </Panel>
        <Panel>
          <h2 className="mb-3 text-[18px] font-semibold">Payslip Status</h2>
          {stats.payslipStatus.length === 0 ? (
            <p className="text-[13px] text-pp-muted">Status counts appear after a payrun.</p>
          ) : (
            <ul className="space-y-2 text-[13px]">
              {stats.payslipStatus.map((row) => (
                <li key={row.status} className="flex justify-between">
                  <span className="capitalize text-pp-muted">{row.status.replaceAll("_", " ")}</span>
                  <span className="font-medium">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      {empty ? (
        <div className="mt-5">
          <EmptyState
            title="No payroll data yet"
            description="Create employees, run payroll, and this dashboard will fill from those records."
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
