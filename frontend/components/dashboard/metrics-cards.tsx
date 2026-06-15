"use client";

import { motion } from "framer-motion";
import { BarChart3, DollarSign, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  { label: "Pipeline Value", value: "$182k", delta: "+14%", icon: DollarSign },
  { label: "Qualified Leads", value: "48", delta: "+8%", icon: BarChart3 },
  { label: "Win Rate", value: "31%", delta: "+3%", icon: Target }
];

export function MetricsCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.35 }}
        >
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-emerald-400">{item.delta} this month</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
