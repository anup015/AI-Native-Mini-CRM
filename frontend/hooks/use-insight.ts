"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { LeadInsight } from "@/types/lead";

export function useInsight() {
  return useQuery({
    queryKey: ["insight"],
    queryFn: () => apiClient<LeadInsight>("/api/ai/insights")
  });
}
