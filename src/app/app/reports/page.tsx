import { requireModule } from "@/lib/auth/access";
import { getDashboardStats } from "@/lib/data/hr";
import { PageContainer, PageHeader, Panel } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, SelectFilter } from "@/components/ui/filter-bar";
import { CompensationChart } from "@/components/reports/compensation-chart";

export default async function ReportsPage() {
  const access = await requireModule("reports");
  const stats = await getDashboardStats(access.companyId);

  return (
    <PageContainer>
      <PageHeader title="Reports" description="Payroll and attendance from live records." />
      <FilterBar>
        <SelectFilter name="period" label="Period">
          <option value="this_month">This month</option>
          <option value="last_month">Last month</option>
          <option value="this_year">This year</option>
        </SelectFilter>
        <SelectFilter name="department" label="Department" />
      </FilterBar>
      {stats.monthlyNet.length === 0 ? (
        <EmptyState
          title="Nothing to chart yet"
          description="Reports use paid payslips and attendance from the database."
        />
      ) : (
        <Panel>
          <h2 className="mb-3 text-[18px] font-semibold">Monthly Net Salary</h2>
          <CompensationChart data={stats.monthlyNet} />
        </Panel>
      )}
    </PageContainer>
  );
}
