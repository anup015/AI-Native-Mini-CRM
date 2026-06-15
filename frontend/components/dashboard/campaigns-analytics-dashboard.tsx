"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Award, Zap, BarChart3, HelpCircle } from "lucide-react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignInsights } from "@/hooks/use-campaigns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
};

export function CampaignsAnalyticsDashboard() {
  const { data, isLoading } = useCampaignInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[300px] animate-pulse rounded-2xl bg-muted" />
          <div className="h-[300px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const channelMetrics = data?.channelMetrics ?? [];
  const insights = data?.insights;

  const sent = summary?.sent ?? 0;
  const delivered = summary?.delivered ?? 0;
  const opened = summary?.opened ?? 0;
  const clicked = summary?.clicked ?? 0;
  const converted = summary?.converted ?? 0;

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
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revenue Intelligence</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Campaign Analytics & AI Insights</h1>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Dispatches</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{sent.toLocaleString()}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
              Across {summary?.totalCampaigns ?? 0} active outreach runs.
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivered Messages</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{delivered.toLocaleString()}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-emerald-500 font-bold">
              Delivery Rate: {sent > 0 ? ((delivered / sent) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden border-white/10 bg-white/70 dark:bg-white/5 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Click-Throughs</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight">{clicked.toLocaleString()}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-border/40 text-[10px] text-primary font-bold">
              Read Open Rate: {delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 shadow-md">
          <CardContent className="p-5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Purchasing Conversions</p>
              <p className="font-sora text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{converted.toLocaleString()}</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Overall Conv. Rate: {summary?.conversionRate ? summary.conversionRate.toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Conversion Funnel */}
        <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="font-sora text-base font-bold">Engagement Funnel</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Recipient counts dropping down the marketing pipeline stages.</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {sent > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
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
                  <Bar dataKey="recipients" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed rounded-2xl text-xs text-muted-foreground">
                No active delivery stats recorded to compile a funnel.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel comparison */}
        <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="font-sora text-base font-bold">Channel Performance Comparison (%)</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Compare open, click, and conversion rates across different media.</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {sent > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelMetrics} margin={{ left: -15, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
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
                  <Legend />
                  <Bar dataKey="openRate" name="Open Rate %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clickRate" name="Click Rate %" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversionRate" name="Conv. Rate %" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed rounded-2xl text-xs text-muted-foreground">
                No active campaign metrics available to compare.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Campaign Insights Overview */}
      <Card className="border-white/10 bg-white/75 dark:bg-white/5 shadow-xl">
        <CardHeader className="border-b border-border/60 bg-background/30 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-5 text-purple-500 animate-pulse" />
            <CardTitle className="font-sora text-base font-bold">AI Campaign Insights Overview</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">Gemini analysis evaluating outreach results and providing actionable instructions.</p>
        </CardHeader>
        <CardContent className="p-6">
          {insights ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-[1fr_0.8fr]"
            >
              {/* Left Side: Summary Blocks */}
              <div className="space-y-4">
                <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sora font-bold text-sm text-emerald-800 dark:text-emerald-300">What Worked</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90">{insights.whatWorked}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sora font-bold text-sm text-rose-800 dark:text-rose-300">What Failed / Bottlenecks</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90">{insights.whatFailed}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex gap-3 shadow-sm">
                  <Award className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-sora font-bold text-sm text-indigo-800 dark:text-indigo-300">Audience & Channel Profile</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/90 font-medium">
                      Best performing audience was <span className="font-bold text-foreground underline decoration-indigo-500">{insights.bestAudience}</span>. 
                      Best channel was <span className="font-bold text-foreground underline decoration-cyan-500">{insights.bestChannel}</span>.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Right Side: Recommendations List */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-background/50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b pb-2.5">
                  <Zap className="h-4 w-4 text-purple-500 animate-bounce" />
                  <h4 className="font-sora font-bold text-sm">Actionable Recommendations</h4>
                </div>
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-xs leading-relaxed text-muted-foreground/90">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              <HelpCircle className="h-5 w-5 mr-2" />
              Insights will compile once delivery metrics are present.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
