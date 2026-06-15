import { NextResponse } from "next/server";
import { z } from "zod";
import { CampaignChannel } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";

const createCampaignSchema = z.object({
  title: z.string().trim().min(3).max(100),
  audienceId: z.string().min(1),
  channel: z.enum([CampaignChannel.EMAIL, CampaignChannel.SMS, CampaignChannel.WHATSAPP, CampaignChannel.PUSH]),
  message: z.string().min(1)
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        audience: {
          select: {
            name: true,
            customerCount: true
          }
        },
        analytics: true
      }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid campaign form payload.", 400);
    }

    const { title, audienceId, channel, message } = parsed.data;

    // Verify segment exists
    const segment = await prisma.segment.findUnique({
      where: { id: audienceId }
    });

    if (!segment) {
      throw new AppError("Target audience segment not found.", 404);
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        audienceId,
        channel,
        message,
        status: "DRAFT",
        createdById: session.user.id
      },
      include: {
        audience: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
