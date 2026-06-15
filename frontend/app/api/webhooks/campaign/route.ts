import { NextResponse } from "next/server";
import { Prisma, CommunicationStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { asApiError } from "@/lib/errors";

const webhookSchema = z.object({
  campaignId: z.string().min(1),
  customerId: z.string().min(1),
  status: z.enum(["SENT", "DELIVERED", "OPENED", "CLICKED", "FAILED"]),
  errorMessage: z.string().optional(),
  converted: z.boolean().optional()
});

const statusScore: Record<CommunicationStatus, number> = {
  QUEUED: 0,
  SENT: 1,
  DELIVERED: 2,
  FAILED: 2,
  OPENED: 3,
  CLICKED: 4
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = webhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid webhook payload structure" }, { status: 400 });
    }

    const { campaignId, customerId, status, errorMessage, converted } = parsed.data;

    // Run transaction to ensure atomicity and lock rows
    const result = await prisma.$transaction(async (transaction) => {
      // 1. Log the incoming Webhook Event
      await transaction.webhookEvent.create({
        data: {
          source: "channel-service",
          eventType: status.toLowerCase(),
          campaignId,
          customerId,
          payload: body as Prisma.InputJsonValue,
          status: "PROCESSED",
          processedAt: new Date()
        }
      });

      // 2. Fetch the corresponding communication log
      const log = await transaction.communicationLog.findFirst({
        where: { campaignId, customerId }
      });

      if (!log) {
        return { success: false, message: "Communication log matching campaign and customer not found." };
      }

      const currentScore = statusScore[log.status] ?? 0;
      const nextScore = statusScore[status] ?? 0;

      const analyticsUpdate: Prisma.CampaignAnalyticsUpdateInput = {};
      const logUpdate: Prisma.CommunicationLogUpdateInput = {};

      if (nextScore > currentScore) {
        logUpdate.status = status;

        // Set status timestamp indicators
        if (status === "SENT") {
          logUpdate.sentAt = new Date();
          if (currentScore < 1) analyticsUpdate.sent = { increment: 1 };
        } else if (status === "DELIVERED") {
          logUpdate.deliveredAt = new Date();
          if (currentScore < 2) analyticsUpdate.delivered = { increment: 1 };
          if (currentScore < 1) analyticsUpdate.sent = { increment: 1 }; // catch-up
        } else if (status === "FAILED") {
          logUpdate.status = "FAILED";
          logUpdate.errorMessage = errorMessage ?? "Unknown Provider Failure";
          if (currentScore < 2) analyticsUpdate.failed = { increment: 1 };
          if (currentScore < 1) analyticsUpdate.sent = { increment: 1 }; // catch-up
        } else if (status === "OPENED") {
          logUpdate.openedAt = new Date();
          if (currentScore < 3) analyticsUpdate.opened = { increment: 1 };
          if (currentScore < 2) analyticsUpdate.delivered = { increment: 1 }; // catch-up
          if (currentScore < 1) analyticsUpdate.sent = { increment: 1 }; // catch-up
        } else if (status === "CLICKED") {
          logUpdate.clickedAt = new Date();
          if (currentScore < 4) analyticsUpdate.clicked = { increment: 1 };
          if (currentScore < 3) analyticsUpdate.opened = { increment: 1 }; // catch-up
          if (currentScore < 2) analyticsUpdate.delivered = { increment: 1 }; // catch-up
          if (currentScore < 1) analyticsUpdate.sent = { increment: 1 }; // catch-up
        }
      }

      // Handle conversions (triggered when event carries converted = true)
      const meta = log.metadata ? (log.metadata as Record<string, unknown>) : {};
      const isAlreadyConverted = !!meta.converted;

      if (converted && !isAlreadyConverted) {
        logUpdate.metadata = { ...meta, converted: true };
        analyticsUpdate.converted = { increment: 1 };
      }

      // Update communication log if any changes
      if (Object.keys(logUpdate).length > 0) {
        await transaction.communicationLog.update({
          where: { id: log.id },
          data: logUpdate
        });
      }

      // Update campaign analytics totals if any updates
      if (Object.keys(analyticsUpdate).length > 0) {
        await transaction.campaignAnalytics.upsert({
          where: { campaignId },
          update: analyticsUpdate,
          create: {
            campaignId,
            sent: status === "SENT" ? 1 : 0,
            delivered: status === "DELIVERED" ? 1 : 0,
            failed: status === "FAILED" ? 1 : 0,
            opened: status === "OPENED" ? 1 : 0,
            clicked: status === "CLICKED" ? 1 : 0,
            converted: converted ? 1 : 0
          }
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
