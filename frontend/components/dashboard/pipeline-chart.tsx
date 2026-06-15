"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", value: 20 },
  { month: "Feb", value: 28 },
  { month: "Mar", value: 25 },
  { month: "Apr", value: 33 },
  { month: "May", value: 37 },
  { month: "Jun", value: 44 }
];

export function PipelineChart() {
  return (
    <Card className="h-[320px]">
      <CardHeader>
        <CardTitle>Pipeline Momentum</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="pipeline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#pipeline)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
