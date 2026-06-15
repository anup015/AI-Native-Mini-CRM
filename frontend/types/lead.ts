import type { LEAD_STAGES } from "@/lib/constants";

export type LeadStage = (typeof LEAD_STAGES)[number];

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  value: number;
  stage: LeadStage;
  createdAt: string;
};

export type LeadInsight = {
  summary: string;
  risk: "low" | "medium" | "high";
  recommendation: string;
};
