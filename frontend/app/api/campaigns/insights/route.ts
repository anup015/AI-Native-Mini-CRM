import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCampaignInsights } from "@/services/gemini";
import { asApiError, AppError } from "@/lib/errors";

type ChannelStat = {
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
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const campaigns = await prisma.campaign.findMany({
      include: {
        analytics: true,
        audience: {
          select: {
            name: true,
            customerCount: true
          }
        }
      }
    });

    // Initialize channel-wise metrics structures
    const channelStats: Record<string, ChannelStat> = {
      EMAIL: { channel: "Email", campaigns: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, converted: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
      SMS: { channel: "SMS", campaigns: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, converted: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
      WHATSAPP: { channel: "WhatsApp", campaigns: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, converted: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
      PUSH: { channel: "Push/RCS", campaigns: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, converted: 0, deliveryRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 }
    };

    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalConverted = 0;

    campaigns.forEach((campaign) => {
      const ch = campaign.channel;
      const stats = channelStats[ch];
      if (stats) {
        stats.campaigns += 1;
        if (campaign.analytics) {
          const analytics = campaign.analytics;
          stats.sent += analytics.sent;
          stats.delivered += analytics.delivered;
          stats.failed += analytics.failed;
          stats.opened += analytics.opened;
          stats.clicked += analytics.clicked;
          stats.converted += analytics.converted;

          totalSent += analytics.sent;
          totalDelivered += analytics.delivered;
          totalFailed += analytics.failed;
          totalOpened += analytics.opened;
          totalClicked += analytics.clicked;
          totalConverted += analytics.converted;
        }
      }
    });

    // Compute rates for each channel
    Object.keys(channelStats).forEach((key) => {
      const stats = channelStats[key];
      stats.deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
      stats.openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
      stats.clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;
      stats.conversionRate = stats.clicked > 0 ? (stats.converted / stats.clicked) * 100 : 0;
    });

    const metricsBreakdown = Object.values(channelStats);

    const summaryData = {
      overall: {
        totalCampaigns: campaigns.length,
        sent: totalSent,
        delivered: totalDelivered,
        failed: totalFailed,
        opened: totalOpened,
        clicked: totalClicked,
        converted: totalConverted,
        conversionRate: totalSent > 0 ? (totalConverted / totalSent) * 100 : 0
      },
      channels: channelStats
    };

    // If no campaigns have sent any messages, bypass AI calling to avoid prompt issues
    if (totalSent === 0) {
      return NextResponse.json({
        summary: summaryData.overall,
        channelMetrics: metricsBreakdown,
        insights: {
          whatWorked: "Launch campaign dispatches to trigger performance tracking.",
          whatFailed: "No delivery data has been recorded yet.",
          bestAudience: "None",
          bestChannel: "None",
          recommendations: [
            "Select a target segment and launch a test campaign.",
            "Confirm that the simulated channel service is running on Port 4001.",
            "Generate AI campaign copywriting matching your target customer tags."
          ]
        }
      });
    }

    const insights = await generateCampaignInsights(summaryData);

    return NextResponse.json({
      summary: summaryData.overall,
      channelMetrics: metricsBreakdown,
      insights
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
