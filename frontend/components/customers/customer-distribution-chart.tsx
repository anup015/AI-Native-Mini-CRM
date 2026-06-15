"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerAnalytics } from "@/hooks/use-customers";

export function CustomerDistributionChart() {
  const { data, isLoading } = useCustomerAnalytics();

  return (
    <Card className="overflow-hidden border-white/10 dark:bg-white/5 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-sora text-base font-bold text-foreground">Customer distribution by location</CardTitle>
        <p className="text-[10px] text-muted-foreground">City-level spread for localized campaign planning and delivery channel mix.</p>
      </CardHeader>
      <CardContent className="h-[280px]">
        {isLoading ? (
          <div className="h-full animate-pulse rounded-2xl bg-muted" />
        ) : data?.byCity.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byCity} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="city" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                cursor={{ fill: "hsl(var(--secondary))" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  color: "hsl(var(--foreground))"
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              />
              <Bar dataKey="customers" radius={[12, 12, 0, 0]} fill="hsl(var(--primary))" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-xs text-muted-foreground">
            No location distribution data found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
