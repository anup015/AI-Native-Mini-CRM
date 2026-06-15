"use client";

import { PackageCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerOrder } from "@/types/customer";

function formatCurrency(value: string) {
  return `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function CustomerOrderHistory({ orders }: { orders: CustomerOrder[] }) {
  return (
    <Card className="border-white/10 dark:bg-white/5 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-sora text-base font-bold">Purchase History</CardTitle>
        <p className="text-[10px] text-muted-foreground">Recent transaction logs for personalization prompts and campaign dispatches.</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {orders.length ? orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-background/30 p-4 transition duration-200 hover:bg-secondary/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold capitalize text-foreground">{order.category}</p>
                    <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                      order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.purchaseDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground/80">Item count: {order.itemCount} units</p>
                </div>
              </div>
              <p className="whitespace-nowrap font-sora text-xs font-extrabold text-foreground">{formatCurrency(order.amount)}</p>
            </div>
          </div>
        )) : (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center">
            <p className="text-xs font-bold">No transactions logged</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">This profile will update once purchase activity is triggered.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
