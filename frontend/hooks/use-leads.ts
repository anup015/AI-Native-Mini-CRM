"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type { Lead } from "@/types/lead";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await apiClient<{ leads: Array<Omit<Lead, "createdAt"> & { createdAt: string }> }>(
        "/api/leads"
      );
      return response.leads;
    }
  });
}
