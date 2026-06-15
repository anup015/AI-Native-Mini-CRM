"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { CampaignChannel, CampaignStatus, CommunicationStatus } from "@prisma/client";

export type Campaign = {
  id: string;
  title: string;
  audienceId: string;
  audience?: {
    name: string;
    customerCount: number;
  };
  channel: CampaignChannel;
  message: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  analytics?: {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    converted: number;
  } | null;
};

export type CampaignDetail = Campaign & {
  logs: Array<{
    id: string;
    status: CommunicationStatus;
    sentAt: string;
    deliveredAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    errorMessage: string | null;
    metadata: any;
    customer: {
      name: string;
      email: string | null;
      city: string | null;
    };
  }>;
};

export type CreateCampaignInput = {
  title: string;
  audienceId: string;
  channel: CampaignChannel;
  message: string;
};

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: () => apiClient<{ campaigns: Campaign[] }>("/api/campaigns")
  });
}

export function useCampaign(id: string, options: { refetchInterval?: number | false | ((query: any) => number | false) } = {}) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => apiClient<{ campaign: CampaignDetail }>(`/api/campaigns/${id}`),
    enabled: !!id,
    ...options
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignInput) => apiClient<{ campaign: Campaign }>("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    }
  });
}

export function useLaunchCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient<{ success: boolean; campaign: Campaign; recipientCount: number }>(`/api/campaigns/${id}/launch`, {
      method: "POST"
    }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    }
  });
}

export function useGenerateCampaignCopy() {
  return useMutation({
    mutationFn: (payload: { channel: CampaignChannel; segmentName?: string; instructions: string }) =>
      apiClient<{ copy: string }>("/api/campaigns/ai-generate", {
        method: "POST",
        body: JSON.stringify(payload)
      })
  });
}

export type CampaignInsightsResponse = {
  summary: {
    totalCampaigns: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    converted: number;
    conversionRate: number;
  };
  channelMetrics: Array<{
    channel: string;
    campaigns: number;
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
    converted: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }>;
  insights: {
    whatWorked: string;
    whatFailed: string;
    bestAudience: string;
    bestChannel: string;
    recommendations: string[];
  };
};

export function useCampaignInsights() {
  return useQuery({
    queryKey: ["campaign-insights"],
    queryFn: () => apiClient<CampaignInsightsResponse>("/api/campaigns/insights"),
    staleTime: 1000 * 30
  });
}

