"use client";

import { motion } from "framer-motion";
import { BarChart3, DollarSign, Landmark, Users2, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useCustomerAnalytics } from "@/hooks/use-customers";

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function CustomerAnalyticsCards() {
  const { data, isLoading } = useCustomerAnalytics();

  const cards = [
    { 
      label: "Total customers", 
      value: isLoading ? "..." : data?.totalCustomers.toLocaleString() ?? "0", 
      icon: Users2,
      trend: "+12.4% this month",
      trendType: "up",
      description: "Total size of targetable customer base."
    },
    { 
      label: "Active customers", 
      value: isLoading ? "..." : data?.activeCustomers.toLocaleString() ?? "0", 
      icon: Landmark,
      trend: "84.2% activity rate",
      trendType: "neutral",
      description: "Customers active in last 30 days."
    },
    { 
      label: "High value", 
      value: isLoading ? "..." : data?.highValueCustomers.toLocaleString() ?? "0", 
      icon: BarChart3,
      trend: "≥ Rs. 5,000 spend",
      trendType: "neutral",
      description: "Premium audience tier segments."
    },
    { 
      label: "Avg spend", 
      value: isLoading ? "..." : formatCurrency(Number(data?.avgSpend ?? 0)), 
      icon: DollarSign,
      trend: "+3.8% vs last month",
      trendType: "up",
      description: "Mean lifetime value per profile."
    }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
            <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                  <p className="font-sora text-2xl font-extrabold tracking-tight">{card.value}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <card.icon className="h-4.5 w-4.5" />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border/40 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  {card.trendType === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : null}
                  <span className={`text-[10px] font-bold ${card.trendType === "up" ? "text-emerald-500" : "text-muted-foreground"}`}>
                    {card.trend}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/85 leading-none">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
