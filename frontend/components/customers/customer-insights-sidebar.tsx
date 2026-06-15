"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerAnalytics } from "@/hooks/use-customers";

export function CustomerInsightsSidebar() {
  const { data, isLoading } = useCustomerAnalytics();

  const insightRows = [
    { label: "Dominant City Hub", value: data?.byCity[0]?.city ?? "-" },
    { label: "Top Segment Tag", value: data?.topTags[0]?.tag ?? "-" },
    { label: "Optimal Channel Mix", value: data?.byChannel[0]?.channel ?? "-" }
  ];

  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
      <Card className="border-white/10 dark:bg-white/5 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-sora text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
              AI Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {insightRows.map((row, index) => (
            <motion.div key={row.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
              <p className="text-[10px] uppercase font-bold text-muted-foreground/80">{row.label}</p>
              <p className="mt-1 font-semibold text-foreground text-sm">{isLoading ? "..." : row.value}</p>
            </motion.div>
          ))}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <Target className="h-3.5 w-3.5 animate-spin-slow" />
              Audience suggestion
            </div>
            <p className="text-[10px] text-muted-foreground/90 leading-normal">
              High-value repeat buyers and inactive WhatsApp users match high-converting campaign signals. Ready for testing.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 dark:bg-white/5 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-sora text-sm font-bold text-foreground">SaaS Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {[
            { label: "Build Target Segment", href: "/dashboard/segments" },
            { label: "Launch AI Outreach Run", href: "/dashboard/campaigns/new" },
            { label: "Open Campaign Insights", href: "/dashboard?tab=insights" }
          ].map((item) => (
            <Link key={item.label} className="group flex items-center justify-between rounded-xl border border-border/60 bg-background/30 hover:bg-secondary/40 px-3.5 py-2.5 text-xs font-medium transition-all duration-200" href={item.href}>
              <span className="text-foreground/90 group-hover:text-foreground">{item.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
