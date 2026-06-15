"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, Sparkles, Wand2, LoaderCircle, CheckCircle2, Mail, MessageSquare, Smartphone } from "lucide-react";
import { CampaignChannel } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSavedSegments } from "@/hooks/use-audience";
import { useCreateCampaign, useGenerateCampaignCopy } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";

export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("WHATSAPP");
  const [message, setMessage] = useState("");
  const [instructions, setInstructions] = useState("Offer 15% off sneakers for our top active repeat customers.");
  const [error, setError] = useState<string | null>(null);

  const { data: segmentsData, isLoading: isLoadingSegments } = useSavedSegments();
  const createCampaign = useCreateCampaign();
  const generateCopy = useGenerateCampaignCopy();

  const activeSegment = segmentsData?.segments.find((s) => s.id === audienceId);

  async function handleGenerateCopy() {
    if (!instructions.trim()) return;
    setError(null);
    try {
      const result = await generateCopy.mutateAsync({
        channel,
        segmentName: activeSegment?.name,
        instructions
      });
      setMessage(result.copy);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate AI message copy.";
      setError(msg);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !audienceId || !channel || !message.trim()) {
      setError("Please fill out all fields and write a message.");
      return;
    }
    setError(null);

    try {
      const result = await createCampaign.mutateAsync({
        title,
        audienceId,
        channel,
        message
      });
      router.push(`/dashboard/campaigns/${result.campaign.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create campaign.";
      setError(msg);
    }
  }

  const channelsList = [
    { key: "WHATSAPP", label: "WhatsApp", icon: MessageSquare, activeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 dark:bg-emerald-500/10" },
    { key: "EMAIL", label: "Email", icon: Mail, activeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30 dark:bg-blue-500/10" },
    { key: "SMS", label: "SMS", icon: MessageSquare, activeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/10" },
    { key: "PUSH", label: "Push (RCS)", icon: Smartphone, activeColor: "bg-purple-500/10 text-purple-500 border-purple-500/30 dark:bg-purple-500/10" }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button asChild variant="secondary" size="sm" className="w-fit gap-1.5 h-8 text-xs border border-border bg-background/50 hover:bg-secondary">
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Campaigns
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground p-2.5 shadow-md">
            <Megaphone className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Outreach Hub</p>
            <h1 className="font-sora text-2xl font-extrabold tracking-tight md:text-3xl text-foreground">Create AI Campaign</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Creation Form */}
        <Card className="border-white/10 dark:bg-white/5 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="font-sora text-base font-bold">Campaign Design</CardTitle>
            <CardDescription className="text-xs">Configure your outreach target audience, optimal delivery path, and message text.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="title">
                  Campaign Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., High Spend Loyalty Push v1"
                  className="h-10 text-xs bg-background/30 border-border focus-visible:ring-primary focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="segment">
                  Target Segment Audience
                </label>
                {isLoadingSegments ? (
                  <div className="h-10 animate-pulse rounded bg-muted" />
                ) : (
                  <select
                    id="segment"
                    value={audienceId}
                    onChange={(e) => setAudienceId(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-border bg-background/30 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 cursor-pointer text-foreground"
                  >
                    <option value="" className="bg-card">-- Select Segment --</option>
                    {segmentsData?.segments.map((segment) => (
                      <option key={segment.id} value={segment.id} className="bg-card">
                        {segment.name} ({segment.customerCount.toLocaleString()} profiles)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery Channel</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {channelsList.map((ch) => {
                    const Icon = ch.icon;
                    const isActive = channel === ch.key;
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => setChannel(ch.key)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all duration-200",
                          isActive
                            ? ch.activeColor + " border-primary shadow-sm"
                            : "border-border bg-background/20 text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="message">
                  Outbound message template content
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Review or custom edit the outbound template message content..."
                  className="min-h-[120px] text-xs bg-background/30 border-border focus-visible:ring-primary focus-visible:ring-offset-0 rounded-xl leading-relaxed"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={createCampaign.isPending || !title.trim() || !audienceId || !message.trim()}
                className="w-full gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-10 rounded-xl"
              >
                {createCampaign.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-black" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-black" />
                )}
                Save Outreach Campaign Draft
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Copywriting panel */}
        <Card className="border-white/10 dark:bg-white/5 shadow-xl h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <CardTitle className="font-sora text-base font-bold">AI Message Copywriter</CardTitle>
            </div>
            <CardDescription className="text-xs">Optimize copy for conversion click rates using Gemini model targets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="instructions">
                Copywriting Instructions
              </label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g., highlight summer sale discount, use active action words, fit WhatsApp layout limit..."
                className="min-h-[90px] text-xs bg-background/30 border-border focus-visible:ring-primary focus-visible:ring-offset-0 rounded-xl leading-relaxed"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              disabled={generateCopy.isPending || !instructions.trim()}
              onClick={handleGenerateCopy}
              className="w-full gap-2 text-xs font-bold border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 h-10 rounded-xl transition duration-200"
            >
              {generateCopy.isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Message with AI
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
