"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Megaphone, Plus, Send, BarChart3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaigns, useLaunchCampaign } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    RUNNING: "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse",
    PAUSED: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ARCHIVED: "bg-rose-500/10 text-rose-400 border-rose-500/20"
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

function ChannelIcon({ channel }: { channel: string }) {
  const styles: Record<string, string> = {
    EMAIL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    SMS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    WHATSAPP: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    PUSH: "bg-purple-500/10 text-purple-500 border-purple-500/20"
  };
  const labels: Record<string, string> = {
    EMAIL: "Email",
    SMS: "SMS",
    WHATSAPP: "WhatsApp",
    PUSH: "Push (RCS)"
  };
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", styles[channel] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20")}>
      {labels[channel] ?? channel}
    </span>
  );
}

export default function CampaignsPage() {
  const { data, isLoading, refetch } = useCampaigns();
  const launchCampaign = useLaunchCampaign();

  async function handleLaunch(id: string) {
    if (confirm("Are you sure you want to launch this campaign? It will simulate dispatches immediately.")) {
      await launchCampaign.mutateAsync(id);
      refetch();
    }
  }

  const campaigns = data?.campaigns ?? [];

  // Summary Metrics
  const totalCount = campaigns.length;
  const runningCount = campaigns.filter((c) => c.status === "RUNNING").length;
  const completedCount = campaigns.filter((c) => c.status === "COMPLETED").length;

  let totalSent = 0;
  let totalConversions = 0;
  campaigns.forEach((c) => {
    if (c.analytics) {
      totalSent += c.analytics.sent;
      totalConversions += c.analytics.converted;
    }
  });

  const conversionRate = totalSent > 0 ? (totalConversions / totalSent) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Outreach Hub</p>
          <h1 className="font-sora text-2xl font-extrabold tracking-tight md:text-3xl">Marketing Outreach Campaigns</h1>
        </div>
        <Button asChild className="gap-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground h-9 rounded-xl px-4 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4.5 w-4.5 text-black" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Campaigns</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{totalCount}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 border-t border-border/40 pt-2">Drafts, Sent & Scheduled</p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Dispatches</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{runningCount}</p>
            </div>
            <p className="text-[10px] text-amber-500 font-bold mt-2 border-t border-border/40 pt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Live dispatches processing
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed Campaigns</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{completedCount}</p>
            </div>
            <p className="text-[10px] text-emerald-500 font-bold mt-2 border-t border-border/40 pt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Simulations complete
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Conversion</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{conversionRate.toFixed(1)}%</p>
            </div>
            <p className="text-[10px] text-primary font-bold mt-2 border-t border-border/40 pt-2">Overall conversion funnel</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-xl">
        <CardHeader className="border-b border-border/60 bg-background/20 pb-4">
          <CardTitle className="font-sora text-base font-bold">Outbox Directory</CardTitle>
          <p className="text-[10px] text-muted-foreground">Manage and analyze your active, draft, and completed AI campaign runs.</p>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
              <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
            </div>
          ) : campaigns.length ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  variants={itemVariants}
                  className="group flex flex-col justify-between gap-4 p-4 border border-border bg-background/30 hover:bg-secondary/40 rounded-xl sm:flex-row sm:items-center transition duration-200"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link href={`/dashboard/campaigns/${campaign.id}`} className="font-bold text-foreground hover:underline text-xs sm:text-sm">
                        {campaign.title}
                      </Link>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                      <ChannelIcon channel={campaign.channel} />
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Target: {campaign.audience?.name ?? "Unknown"} ({campaign.audience?.customerCount ?? 0} customers)
                      </span>
                      <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {campaign.status === "DRAFT" ? (
                      <Button
                        size="sm"
                        onClick={() => handleLaunch(campaign.id)}
                        disabled={launchCampaign.isPending}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg"
                      >
                        <Send className="h-3 w-3" />
                        Launch Run
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="secondary" className="gap-1.5 h-8 text-xs border border-border bg-background/40 hover:bg-secondary">
                        <Link href={`/dashboard/campaigns/${campaign.id}`}>
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          View Report
                        </Link>
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground shadow-sm">
                <Megaphone className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-foreground">No campaigns found</h3>
              <p className="mt-1 text-xs text-muted-foreground">Create and launch your first AI-native campaign to engage your customers.</p>
              <Button asChild className="mt-4 gap-2 text-xs h-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl">
                <Link href="/dashboard/campaigns/new">
                  <Plus className="h-4.5 w-4.5 text-black" />
                  Create Outreach Campaign
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
