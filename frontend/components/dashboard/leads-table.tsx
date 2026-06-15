"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/hooks/use-leads";

export function LeadsTable() {
  const { data, isLoading, error } = useLeads();

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading leads...</p>}
        {error && <p className="text-sm text-red-400">Failed to fetch leads.</p>}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Company</th>
                  <th className="px-2 py-2 font-medium">Value</th>
                  <th className="px-2 py-2 font-medium">Stage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/60">
                    <td className="px-2 py-2">{lead.name}</td>
                    <td className="px-2 py-2 text-muted-foreground">{lead.company}</td>
                    <td className="px-2 py-2">${lead.value.toLocaleString()}</td>
                    <td className="px-2 py-2">
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs">{lead.stage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && <p className="py-5 text-sm text-muted-foreground">No leads yet. Add seed data.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
