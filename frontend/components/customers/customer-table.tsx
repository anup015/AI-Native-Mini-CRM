"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/use-customers";
import { cn } from "@/lib/utils";

export type CustomerTableState = {
  page: number;
  limit: number;
  search: string;
  city: string;
  gender: string;
  preferredChannel: string;
  tag: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

type Props = {
  state: CustomerTableState;
  onChange: (next: Partial<CustomerTableState>) => void;
};

const columns = [
  { key: "name", label: "Customer" },
  { key: "city", label: "City" },
  { key: "preferredChannel", label: "Channel" },
  { key: "totalSpend", label: "Total Spend" },
  { key: "ordersCount", label: "Orders" },
  { key: "lastOrderDate", label: "Last Order" }
] as const;

function formatCurrency(value: string) {
  return `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomerTable({ state, onChange }: Props) {
  const { data, isLoading } = useCustomers({
    page: state.page,
    limit: state.limit,
    q: state.search,
    city: state.city,
    gender: state.gender,
    preferredChannel: state.preferredChannel,
    tag: state.tag,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder
  });

  const pagination = data?.pagination;

  function changeSort(column: string) {
    if (state.sortBy === column) {
      onChange({ sortOrder: state.sortOrder === "asc" ? "desc" : "asc" });
      return;
    }

    onChange({ sortBy: column, sortOrder: "desc" });
  }

  function SortIcon({ column }: { column: string }) {
    if (state.sortBy !== column) return <ArrowUpDown className="h-3 w-3 opacity-60" />;
    return state.sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />;
  }

  return (
    <Card className="overflow-hidden border-white/10 dark:bg-white/5 shadow-lg">
      <CardHeader className="border-b border-border/60 bg-background/20 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-sora text-base font-bold">Customer directory</CardTitle>
            <p className="text-[10px] text-muted-foreground">Search, sort, and inspect customer profiles targetable for current campaigns.</p>
          </div>
          <div className="rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            {pagination ? `${pagination.total.toLocaleString()} customers` : "Loading..."}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-background/80 backdrop-blur-xl">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="border-b border-border px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    <button className="inline-flex items-center gap-1.5 hover:text-foreground" onClick={() => changeSort(column.key)}>
                      {column.label}
                      <SortIcon column={column.key} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: state.limit }).map((_, index) => (
                  <tr key={index} className="border-b border-border/40">
                    <td className="px-4 py-4.5" colSpan={6}>
                      <div className="h-10 animate-pulse rounded-xl bg-muted" />
                    </td>
                  </tr>
                ))
              ) : data?.customers.length ? (
                data.customers.map((customer) => (
                  <tr key={customer.id} className="group border-b border-border/40 transition hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-primary/20 text-xs font-bold text-primary shadow-sm">
                          {initials(customer.name)}
                        </div>
                        <div className="space-y-0.5">
                          <Link className="text-xs font-bold text-foreground hover:underline" href={`/dashboard/customers/${customer.id}`}>
                            {customer.name}
                          </Link>
                          <p className="text-[10px] text-muted-foreground/80">{customer.email ?? "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{customer.city ?? "-"}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={cn(
                        "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                        customer.preferredChannel === "EMAIL" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        customer.preferredChannel === "SMS" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        customer.preferredChannel === "WHATSAPP" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        customer.preferredChannel === "PUSH" && "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      )}>
                        {customer.preferredChannel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sora text-xs font-bold text-foreground">{formatCurrency(customer.totalSpend)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{customer.ordersCount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "Never"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-16 text-center" colSpan={6}>
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                        <Users2 className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-bold">No customers found.</p>
                      <p className="text-xs text-muted-foreground">Try modifying your query or adjusting the filters above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {pagination ? `Showing Page ${pagination.page} of ${pagination.totalPages} • ${pagination.total.toLocaleString()} profiles` : ""}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ page: 1 })} disabled={!pagination || pagination.page === 1}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ page: Math.max(1, (pagination?.page ?? 1) - 1) })} disabled={!pagination || pagination.page === 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ page: Math.min(pagination?.totalPages ?? 1, (pagination?.page ?? 1) + 1) })} disabled={!pagination || pagination.page >= pagination.totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="secondary" size="sm" className="h-8 w-8 p-0" onClick={() => onChange({ page: pagination?.totalPages ?? 1 })} disabled={!pagination || pagination.page >= pagination.totalPages}>
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
