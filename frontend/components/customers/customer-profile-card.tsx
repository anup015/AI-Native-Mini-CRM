"use client";

import { Mail, MapPin, Phone, Tags } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  city: string | null;
  phone: string | null;
  preferredChannel: string;
  tags: string[];
  ordersCount: number;
};

export function CustomerProfileCard({ city, phone, preferredChannel, tags, ordersCount }: Props) {
  const rows = [
    { label: "Location / City", value: city ?? "-", icon: MapPin },
    { label: "Contact Phone", value: phone ?? "-", icon: Phone },
    { label: "Delivery Channel", value: preferredChannel, icon: Mail },
    { label: "Total Orders", value: String(ordersCount), icon: Tags }
  ];

  return (
    <Card className="border-white/10 dark:bg-white/5 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="font-sora text-base font-bold text-foreground">Customer Demographics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {row.label}
              </span>
              <span className="max-w-[55%] truncate font-semibold text-foreground">{row.value}</span>
            </div>
          );
        })}

        <div className="space-y-2 pt-2 border-t border-border/40">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Assigned segment tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.length ? tags.map((tag) => (
              <span key={tag} className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                "bg-primary/10 text-primary border-primary/20"
              )}>
                {tag}
              </span>
            )) : <span className="text-muted-foreground">-</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
