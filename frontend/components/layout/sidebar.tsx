"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BarChart3, LayoutDashboard, Sparkles, Users2, SlidersHorizontal, Megaphone, Cpu } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "Data Studio",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users2 },
      { title: "Segments", href: "/dashboard/segments", icon: SlidersHorizontal }
    ]
  },
  {
    title: "Outreach Tools",
    items: [
      { title: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone }
    ]
  },
  {
    title: "Intelligence",
    items: [
      { title: "AI Insights", href: "/dashboard?tab=insights", icon: BarChart3 },
      { title: "CRM Copilot", href: "/dashboard?tab=ai", icon: Sparkles }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  function isItemActive(href: string) {
    const url = new URL(href, "http://localhost:3000");
    const itemPath = url.pathname;
    const itemTab = url.searchParams.get("tab");

    if (itemTab) {
      return pathname === itemPath && activeTab === itemTab;
    }
    
    // For root dashboard vs customers
    if (itemPath === "/dashboard") {
      return pathname === "/dashboard" && !activeTab;
    }

    return pathname.startsWith(itemPath);
  }

  return (
    <aside className="glass-premium sticky top-6 h-[calc(100vh-3rem)] w-full rounded-2xl p-5 flex flex-col justify-between lg:w-64">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Cpu className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="font-sora text-sm font-extrabold tracking-tight">{APP_NAME}</h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              AI-Native OS
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="space-y-5">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary border-l-2 border-primary shadow-[inset_1px_0_0_rgba(0,240,255,0.1)] font-semibold"
                          : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105", active ? "text-primary" : "text-muted-foreground/80")} />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-border/60 pt-4">
        <div className="rounded-xl bg-secondary/30 p-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-muted-foreground">SYSTEM HEALTH</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </aside>
  );
}
