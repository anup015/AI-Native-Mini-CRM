"use client";

import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsight } from "@/hooks/use-insight";

const riskColorMap: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400"
};

export function AiInsightCard() {
  const { data, isLoading, error } = useInsight();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>AI Pipeline Insight</CardTitle>
        <Sparkles className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading && <p className="text-muted-foreground">Generating insight...</p>}
        {error && <p className="text-red-400">Unable to generate insights right now.</p>}
        {data && (
          <>
            <p>{data.summary}</p>
            <p className={riskColorMap[data.risk] ?? "text-muted-foreground"}>Risk: {data.risk}</p>
            <p className="text-muted-foreground">Recommendation: {data.recommendation}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
