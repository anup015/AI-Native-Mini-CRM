"use client";

import { useState } from "react";
import { Sparkles, Brain, ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";

const presets = [
  "How can I re-engage customers who haven't ordered in 90 days?",
  "Draft a promotional SMS copy for our summer shoe sale.",
  "Which segments typically respond best to WhatsApp campaigns?"
];

export function AICopilotWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  async function handleAskCopilot() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await apiClient<{ response: string }>("/api/ai/copilot", {
        method: "POST",
        body: JSON.stringify({ prompt })
      });
      setResponse(result.response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setResponse("Failed to query CRM Copilot. Verify your credentials and network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Smart Assistant</p>
        <h1 className="font-sora text-2xl font-extrabold tracking-tight md:text-3xl text-foreground">AI CRM Copilot</h1>
      </div>

      <Card className="border-white/10 dark:bg-white/5 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="font-sora text-lg font-bold text-foreground">Ask your AI CRM Copilot</CardTitle>
              <p className="text-xs text-muted-foreground">Formulate campaign rules, drafts, and strategies in natural language.</p>
            </div>
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-500 shadow-sm animate-pulse">
              <Brain className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Textarea
              className="min-h-[120px] text-sm leading-relaxed bg-background/25 border-border focus-visible:ring-purple-500 focus-visible:ring-offset-0 rounded-xl"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Help me draft a re-engagement WhatsApp broadcast offering 10% off for inactive Mumbai customers.'"
            />
            <span className="absolute bottom-3 right-3 text-[9px] font-bold text-muted-foreground bg-muted border rounded px-1.5 py-0.5">
              Gemini 1.5 Pro
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Select suggestions</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPrompt(preset)}
                  className="h-8 text-xs border border-border/80 bg-background/50 hover:bg-purple-500/5 hover:text-purple-500 hover:border-purple-500/25 rounded-xl px-3"
                >
                  {preset.slice(0, 52)}...
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleAskCopilot} disabled={loading || !prompt.trim()} className="gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white h-9 px-4 rounded-xl shadow-[0_0_12px_rgba(147,51,234,0.2)]">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 animate-pulse" />}
              Ask CRM Copilot
            </Button>
          </div>

          {response && (
            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-3 shadow-inner">
              <div className="flex items-center gap-2 border-b border-purple-500/20 pb-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                <h4 className="font-sora font-bold text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400">Copilot Execution Output</h4>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
