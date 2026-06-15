"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, LoaderCircle, Sparkles, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAudiencePreview, useGenerateAudience, useSaveAudience, useSavedSegments } from "@/hooks/use-audience";
import type { SegmentRule } from "@/lib/audience/types";
import { SegmentRuleBuilder } from "@/components/audience/segment-rule-builder";

const examples = [
  "Inactive users from Mumbai",
  "Users who spent more than 5000 in last 30 days",
  "Women customers who bought skincare",
  "High value repeat buyers"
];

function defaultRule(): SegmentRule {
  return {
    logic: "AND",
    conditions: [{ field: "city", operator: "=", value: "Mumbai" }]
  };
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

function AnimatedCount({ value }: { value: number }) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="text-4xl font-black tracking-tight"
    >
      {value.toLocaleString()}
    </motion.div>
  );
}

export function AudienceStudio() {
  const [prompt, setPrompt] = useState("Inactive users from Mumbai");
  const [rule, setRule] = useState<SegmentRule>(defaultRule());
  const [segmentName, setSegmentName] = useState("Mumbai Winback Audience");
  const [segmentDescription, setSegmentDescription] = useState("Inactive users in Mumbai with churn risk.");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const generation = useGenerateAudience();
  const previewRule = useDebouncedValue(rule, 350);
  const preview = useAudiencePreview(previewRule);
  const saveAudience = useSaveAudience();
  const savedSegments = useSavedSegments();

  const explainableRule = useMemo(() => JSON.stringify(rule, null, 2), [rule]);

  async function generateFromPrompt() {
    setStatusMessage(null);
    const result = await generation.mutateAsync(prompt);

    if (!result.rule) {
      setStatusMessage(result.explanation);
      return;
    }

    setRule(result.rule);
    setStatusMessage(result.explanation);

    if (!segmentName.trim()) {
      setSegmentName(prompt.slice(0, 60));
    }
  }

  async function saveSegment() {
    if (!rule) return;
    const result = await saveAudience.mutateAsync({
      name: segmentName,
      description: segmentDescription,
      rule
    });

    setStatusMessage(`Segment saved with ${result.audience.count.toLocaleString()} matching customers.`);
    await savedSegments.refetch();
  }

  const audienceCount = preview.data?.count ?? 0;
  const sampleCustomers = preview.data?.sampleCustomers ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <Card className="border-white/10 dark:bg-white/5 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Audience assistant</p>
                <CardTitle className="font-sora text-xl font-extrabold text-foreground">Natural Language Builder</CardTitle>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-500 shadow-sm">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative">
              <Textarea
                className="min-h-[120px] text-sm leading-relaxed bg-background/25 border-border focus-visible:ring-primary focus-visible:ring-offset-0 rounded-xl"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe your audience segment (e.g., 'high spend users from Mumbai who bought shoes last month')..."
              />
              <span className="absolute bottom-3 right-3 text-[9px] font-bold text-muted-foreground bg-muted border rounded px-1.5 py-0.5">
                Gemini 1.5 Pro
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Try prompt templates</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <Button key={example} type="button" variant="secondary" size="sm" className="h-7 text-xs border border-border/80 bg-background/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-lg px-2.5" onClick={() => setPrompt(example)}>
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="button" onClick={generateFromPrompt} disabled={generation.isPending} className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                {generation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin text-black" /> : <Sparkles className="h-4 w-4 text-black" />}
                Generate segment rule
              </Button>
              <p className="text-[10px] text-muted-foreground">AI auto-calibrates rule logic to identify matching customers.</p>
            </div>
            {statusMessage ? (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs text-cyan-600 dark:text-cyan-400">
                {statusMessage}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/5 shadow-md">
            <CardHeader className="pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Live matched count</p>
              <CardTitle className="font-sora text-base font-bold text-foreground">Instant Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {preview.isLoading ? <div className="h-10 animate-pulse rounded-xl bg-muted" /> : <AnimatedCount value={audienceCount} />}
              <p className="text-[10px] text-muted-foreground leading-relaxed">{preview.data?.explanation ?? "No active query logic parsed yet."}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 dark:bg-white/5 shadow-md">
            <CardHeader className="pb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sample results</p>
              <CardTitle className="font-sora text-base font-bold text-foreground">Matching profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              <AnimatePresence>
                {sampleCustomers.length ? sampleCustomers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-background/40 px-3.5 py-2.5 text-xs shadow-sm hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">{customer.name}</p>
                        <p className="text-[9px] text-muted-foreground">{customer.city ?? "Unknown City"}</p>
                      </div>
                      <p className="text-[10px] font-sora font-extrabold text-foreground">₹{customer.totalSpend}</p>
                    </div>
                  </motion.div>
                )) : <p className="text-xs text-muted-foreground">Preview entries show here once query executes.</p>}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 dark:bg-white/5 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="font-sora text-base font-bold">Save audience segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Segment Title</label>
                <Input value={segmentName} onChange={(event) => setSegmentName(event.target.value)} placeholder="Segment name..." className="h-10 text-xs bg-background/30 border-border" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Description Note</label>
                <Input value={segmentDescription} onChange={(event) => setSegmentDescription(event.target.value)} placeholder="Internal notes..." className="h-10 text-xs bg-background/30 border-border" />
              </div>
            </div>
            <Button type="button" onClick={saveSegment} disabled={saveAudience.isPending || !rule} className="gap-2 text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border h-9 rounded-xl">
              {saveAudience.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save segment metadata
            </Button>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Constructed Logic Trees</p>
              <pre className="mt-2.5 overflow-auto text-[10px] font-mono leading-relaxed text-slate-300 max-h-[140px] pr-1">{explainableRule}</pre>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
        <Card className="border-white/10 dark:bg-white/5 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="font-sora text-base font-bold">Condition Logic Builder</CardTitle>
            <p className="text-[10px] text-muted-foreground">Review and edit rules locally to override AI interpretations.</p>
          </CardHeader>
          <CardContent>
            <SegmentRuleBuilder value={rule} onChange={setRule} />
          </CardContent>
        </Card>

        <Card className="border-white/10 dark:bg-white/5 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="font-sora text-base font-bold">Saved Segments Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {savedSegments.data?.segments.length ? savedSegments.data.segments.map((segment) => (
              <div key={segment.id} className="rounded-xl border border-border bg-background/40 p-3.5 transition duration-200 hover:bg-secondary/40 hover:border-primary/20 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">{segment.name}</p>
                    <p className="text-[10px] text-muted-foreground/80 line-clamp-1">{segment.description ?? "No description"}</p>
                  </div>
                  <div className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-bold text-primary font-sora">
                    {segment.customerCount.toLocaleString()}
                  </div>
                </div>
              </div>
            )) : <p className="text-xs text-muted-foreground">No segments currently saved.</p>}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
