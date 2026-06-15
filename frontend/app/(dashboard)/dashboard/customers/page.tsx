"use client";

import { useMemo, useState } from "react";

import { CustomerAnalyticsCards } from "@/components/customers/customer-analytics-cards";
import { CustomerDistributionChart } from "@/components/customers/customer-distribution-chart";
import { CustomerFilters, type CustomerFilterState } from "@/components/customers/customer-filters";
import { CustomerInsightsSidebar } from "@/components/customers/customer-insights-sidebar";
import { CustomerPageHeader } from "@/components/customers/customer-page-header";
import { CustomerTable, type CustomerTableState } from "@/components/customers/customer-table";

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilterState>({
    search: "",
    city: "",
    gender: "",
    preferredChannel: "",
    tag: ""
  });

  const [tableState, setTableState] = useState<CustomerTableState>({
    page: 1,
    limit: 10,
    search: "",
    city: "",
    gender: "",
    preferredChannel: "",
    tag: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const tableQueryState = useMemo(() => ({
    ...tableState,
    ...filters,
    search: filters.search
  }), [filters, tableState]);

  function updateFilters(next: Partial<CustomerFilterState>) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    setTableState((current) => ({ ...current, ...merged, page: 1 }));
  }

  function resetFilters() {
    const reset = { search: "", city: "", gender: "", preferredChannel: "", tag: "" };
    setFilters(reset);
    setTableState((current) => ({ ...current, ...reset, page: 1 }));
  }

  function updateTable(next: Partial<CustomerTableState>) {
    setTableState((current) => ({ ...current, ...next }));
    if (next.search !== undefined || next.city !== undefined || next.gender !== undefined || next.preferredChannel !== undefined || next.tag !== undefined) {
      setFilters((current) => ({ ...current, ...(next as Partial<CustomerFilterState>) }));
    }
  }

  return (
    <div className="space-y-5">
      <CustomerPageHeader />
      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <CustomerAnalyticsCards />
          <CustomerFilters value={filters} onChange={updateFilters} onReset={resetFilters} />
          <CustomerDistributionChart />
          <CustomerTable state={tableQueryState} onChange={updateTable} />
        </div>
        <CustomerInsightsSidebar />
      </section>
    </div>
  );
}
