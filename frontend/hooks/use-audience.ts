"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { SegmentRule } from "@/lib/audience/types";

export type AudiencePreviewResponse = {
  count: number;
  sampleCustomers: Array<{
    id: string;
    name: string;
    email: string | null;
    city: string | null;
    preferredChannel: string;
    totalSpend: string;
    lastOrderDate: string | null;
    tags: string[];
  }>;
  explanation: string;
  rule: SegmentRule;
};

export type AudienceGenerationResponse = {
  rule: SegmentRule | null;
  explanation: string;
  source: "ai" | "fallback";
};

export type SavedSegment = {
  id: string;
  name: string;
  description: string | null;
  customerCount: number;
  lastComputedAt: string | null;
  createdAt: string;
};

export function useGenerateAudience() {
  return useMutation({
    mutationFn: (prompt: string) => apiClient<AudienceGenerationResponse>("/api/audience/ai", {
      method: "POST",
      body: JSON.stringify({ prompt })
    })
  });
}

export function useAudiencePreview(rule: SegmentRule | null) {
  const key = JSON.stringify(rule ?? null);

  return useQuery({
    queryKey: ["audience-preview", key],
    queryFn: () => apiClient<AudiencePreviewResponse>("/api/audience/preview", {
      method: "POST",
      body: JSON.stringify({ rule })
    }),
    enabled: !!rule,
    staleTime: 1000 * 15
  });
}

export function useSaveAudience() {
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; rule: SegmentRule }) => apiClient<{ segment: SavedSegment; audience: AudiencePreviewResponse }>("/api/segments", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  });
}

export function useSavedSegments() {
  return useQuery({
    queryKey: ["saved-segments"],
    queryFn: () => apiClient<{ segments: SavedSegment[] }>("/api/segments"),
    staleTime: 1000 * 30
  });
}
