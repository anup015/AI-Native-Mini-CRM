import { NextResponse } from "next/server";
import { CampaignChannel } from "@prisma/client";

import { env } from "@/lib/env";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";

// Helper to asynchronously process dispatching so the HTTP response is instantaneous
async function dispatchToChannelService(campaignId: string, channel: CampaignChannel, message: string, customerIds: string[]) {
  for (const customerId of customerIds) {
    try {
      // 1. Create a base communication log
      const log = await prisma.communicationLog.create({
        data: {
          campaignId,
          customerId,
          channel,
          status: "QUEUED",
          messageSnapshot: message
        }
      });

      // 2. Fire-and-forget payload dispatch to channel-service
      fetch(`${env.CHANNEL_SERVICE_URL}/api/channel/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          customerId,
          channel,
          message
        })
      })
      .then(async (response) => {
        if (response.ok) {
          const result = (await response.json()) as { providerMessageId?: string };
          // Optionally update log with provider message id
          if (result.providerMessageId) {
            await prisma.communicationLog.update({
              where: { id: log.id },
              data: { providerMessageId: result.providerMessageId }
            });
          }
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`[Launch API Dispatch Error] Customer ${customerId}: ${error.message}`);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Launch API Log Creation Error] Customer ${customerId}: ${(error as Error).message}`);
    }
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        analytics: true
      }
    });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    if (campaign.status === "RUNNING" || campaign.status === "COMPLETED") {
      throw new AppError("Campaign has already been launched.", 400);
    }

    // Resolve target audience size and fetch matched customers
    const audienceMappings = await prisma.customerSegment.findMany({
      where: { segmentId: campaign.audienceId },
      select: { customerId: true }
    });

    if (!audienceMappings.length) {
      throw new AppError("Cannot launch campaign: Target segment contains 0 customers.", 400);
    }

    const customerIds = audienceMappings.map((mapping) => mapping.customerId);

    // Update campaign status
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: "RUNNING"
      }
    });

    // Initialize campaign analytics in database
    await prisma.campaignAnalytics.upsert({
      where: { campaignId: id },
      update: {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      },
      create: {
        campaignId: id,
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    });

    // Run async dispatching loop without blocking
    dispatchToChannelService(id, campaign.channel, campaign.message, customerIds);

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      recipientCount: customerIds.length
    });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
