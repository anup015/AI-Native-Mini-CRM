import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { asApiError, AppError } from "@/lib/errors";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Please provide a valid name, email, and password.", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    if (existingUser) {
      throw new AppError("An account with that email already exists.", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        role: "SALES"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const apiError = asApiError(error);
    return NextResponse.json({ message: apiError.message }, { status: apiError.statusCode });
  }
}
