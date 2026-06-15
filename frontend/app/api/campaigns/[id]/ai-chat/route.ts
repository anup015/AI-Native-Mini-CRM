import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askAICampaignQuestion } from "@/services/gemini";
import { asApiError, AppError } from "@/lib/errors";

const querySchema = z.object({
  question: z.string().trim().min(3).max(500)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = querySchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Please provide a question for the campaign analyst.", 400);
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        audience: {
          select: {
            name: true,
            customerCount: true,
            rules: true
          }
        },
        analytics: true,
        logs: {
          take: 15,
          orderBy: { sentAt: "desc" },
          select: {
            status: true,
            errorMessage: true,
            customer: {
              select: {
                name: true,
                city: true,
                preferredChannel: true,
                tags: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    const { question } = parsed.data;

    // Build context payload for Gemini query
    const campaignContext = {
      title: campaign.title,
      channel: campaign.channel,
      status: campaign.status,
      audienceName: campaign.audience?.name,
      audienceSize: campaign.audience?.customerCount,
      audienceRules: campaign.audience?.rules,
      metrics: campaign.analytics ? {
        sent: campaign.analytics.sent,
        delivered: campaign.analytics.delivered,
        failed: campaign.analytics.failed,
        opened: campaign.analytics.opened,
        clicked: campaign.analytics.clicked,
        converted: campaign.analytics.converted
      } : null,
      sampleLogs: campaign.logs.map((log) => ({
        status: log.status,
        error: log.errorMessage,
        customerName: log.customer.name,
        customerCity: log.customer.city,
        customerChannel: log.customer.preferredChannel,
        customerTags: log.customer.tags
      }))
    };

    const responseText = await askAICampaignQuestion(campaignContext, question);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
