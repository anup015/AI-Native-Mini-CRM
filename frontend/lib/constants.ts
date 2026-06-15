export const APP_NAME = "Xeno Mini CRM";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Customers", href: "/dashboard/customers" },
  { title: "Leads", href: "/dashboard?tab=leads" },
  { title: "Insights", href: "/dashboard?tab=insights" }
] as const;

export const LEAD_STAGES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
