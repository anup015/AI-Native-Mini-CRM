import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        audience: {
          select: {
            name: true,
            customerCount: true
          }
        },
        analytics: true,
        logs: {
          orderBy: { sentAt: "desc" },
          take: 100,
          include: {
            customer: {
              select: {
                name: true,
                email: true,
                city: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
