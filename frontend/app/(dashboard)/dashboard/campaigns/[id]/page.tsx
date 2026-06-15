"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaign } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";
import { CampaignAIChat } from "@/components/campaigns/campaign-ai-chat";

function StatusIndicator({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    RUNNING: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
    PAUSED: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
        styles[status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
      )}
    >
      {status}
    </span>
  );
}

function LogBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    QUEUED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/10",
    SENT: "bg-blue-500/10 text-blue-400 border-blue-500/10",
    DELIVERED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/10",
    OPENED: "bg-purple-500/10 text-purple-400 border-purple-500/10",
    CLICKED: "bg-amber-500/10 text-amber-400 border-amber-500/10",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/10"
  };

  return (
    <span
      className={cn(
        "rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        styles[status] ?? "bg-zinc-500/10 text-zinc-400"
      )}
    >
      {status}
    </span>
  );
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Poll details every 2 seconds if status is RUNNING
  const { data, isLoading, refetch } = useCampaign(id, {
    refetchInterval: (query) => {
      const status = query.state.data?.campaign?.status;
      return status === "RUNNING" ? 2000 : false;
    }
  });

  const campaign = data?.campaign;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="mt-4 text-lg font-bold">Campaign Not Found</h3>
        <p className="mt-1 text-sm text-muted-foreground">The campaign you requested could not be resolved.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  const analytics = campaign.analytics;

  // Funnel calculation helper
  const sent = analytics?.sent ?? 0;
  const delivered = analytics?.delivered ?? 0;
  const failed = analytics?.failed ?? 0;
  const opened = analytics?.opened ?? 0;
  const clicked = analytics?.clicked ?? 0;
  const converted = analytics?.converted ?? 0;

  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
  const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;
  const conversionRate = clicked > 0 ? (converted / clicked) * 100 : 0;

  const funnelData = [
    { stage: "Sent", recipients: sent, fill: "hsl(var(--muted-foreground))" },
    { stage: "Delivered", recipients: delivered, fill: "cyan" },
    { stage: "Opened", recipients: opened, fill: "violet" },
    { stage: "Clicked", recipients: clicked, fill: "amber" },
    { stage: "Converted", recipients: converted, fill: "emerald" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button asChild variant="secondary" size="sm" className="gap-2 mb-2">
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="h-4 w-4" />
              Back to campaigns
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{campaign.title}</h1>
            <StatusIndicator status={campaign.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Targeting Segment: <span className="font-bold text-foreground">{campaign.audience?.name ?? "Unknown"}</span> (via {campaign.channel})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {campaign.status === "RUNNING" && (
            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold animate-pulse border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Live Simulation Running...
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Metrics
          </Button>
        </div>
      </div>

      {/* Conversion Funnel Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sent Messages</p>
            <p className="font-sora text-2xl font-extrabold tracking-tight mt-1.5">{sent.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-1.5">Initial dispatches</p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivered / Failed</p>
            <p className="font-sora text-2xl font-extrabold tracking-tight mt-1.5">{delivered.toLocaleString()} <span className="text-xs text-rose-500 font-normal">/ {failed}</span></p>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-1.5">Rate: {deliveryRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reads / Opened</p>
            <p className="font-sora text-2xl font-extrabold tracking-tight mt-1.5">{opened.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-1.5">Open Rate: {openRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Link Clicks</p>
            <p className="font-sora text-2xl font-extrabold tracking-tight mt-1.5">{clicked.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-1.5">Click-Through: {clickRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-md">
          <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Conversions</p>
            <p className="font-sora text-2xl font-extrabold tracking-tight mt-1.5 text-emerald-600 dark:text-emerald-400">{converted.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-emerald-500/20 pt-1.5">Conv. Rate: {conversionRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        {/* Funnel Graph */}
        <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="font-sora text-base font-bold">Campaign Conversion Funnel</CardTitle>
            </div>
            <p className="text-[10px] text-muted-foreground">Visual representation of customer conversions down the campaign pipeline.</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {sent > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--foreground))"
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Bar dataKey="recipients" radius={[0, 8, 8, 0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed rounded-2xl text-xs text-muted-foreground">
                Funnel graphs populate once metrics dispatches start.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Message copy + AI chat */}
        <div className="space-y-4">
          <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-lg flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                <CardTitle className="font-sora text-base font-bold">Outbound copywriting copy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="rounded-xl border border-border bg-background/50 p-4 min-h-[100px] text-xs leading-relaxed whitespace-pre-wrap text-foreground/90 shadow-sm">
                {campaign.message}
              </div>
            </CardContent>
          </Card>
          <CampaignAIChat campaignId={campaign.id} />
        </div>
      </div>

      {/* Recipient Log Feed */}
      <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-xl">
        <CardHeader className="border-b border-border/60 bg-background/20 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-emerald-500" />
            <CardTitle className="font-sora text-base font-bold">Delivery Activity Feed</CardTitle>
          </div>
          <p className="text-[10px] text-muted-foreground">Audit log of message dispatches, delivered notices, and carrier response states.</p>
        </CardHeader>
        <CardContent className="p-0 max-h-[360px] overflow-y-auto">
          {campaign.logs.length ? (
            <div className="divide-y divide-border/40">
              {campaign.logs.map((log) => (
                <div key={log.id} className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/35 transition duration-200">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">{log.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground/80">
                      {log.customer.email ?? "No email"} • {log.customer.city ?? "Unknown City"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {log.errorMessage ? (
                      <span className="text-[9px] text-rose-500 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded-md font-semibold">
                        Error: {log.errorMessage}
                      </span>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <LogBadge status={log.status} />
                      {log.metadata && (log.metadata as Record<string, unknown>).converted ? (
                        <span className="text-[9px] uppercase font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          Converted
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No recent dispatches logged. Launch this campaign to start simulations.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
