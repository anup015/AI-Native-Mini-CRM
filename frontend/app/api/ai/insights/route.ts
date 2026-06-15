import { NextResponse } from "next/server";

import { generateLeadInsights } from "@/services/gemini";
import { prisma } from "@/lib/prisma";
import { asApiError } from "@/lib/errors";
import type { Lead } from "@/types/lead";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const insightLeads: Lead[] = leads.map((lead) => ({
      ...lead,
      stage: lead.stage as Lead["stage"],
      createdAt: lead.createdAt.toISOString()
    }));

    const insight = await generateLeadInsights(insightLeads);

    return NextResponse.json(insight);
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
