import CustomersPage from "@/app/(dashboard)/dashboard/customers/page";
import { CampaignsAnalyticsDashboard } from "@/components/dashboard/campaigns-analytics-dashboard";
import { AICopilotWorkspace } from "@/components/dashboard/ai-copilot-workspace";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;

  if (tab === "insights") {
    return <CampaignsAnalyticsDashboard />;
  }

  if (tab === "ai") {
    return <AICopilotWorkspace />;
  }

  return <CustomersPage />;
}
