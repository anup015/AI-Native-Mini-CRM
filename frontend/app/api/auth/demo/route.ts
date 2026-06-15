import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@xenocrm.dev";
const DEMO_PASSWORD = "Demo@1234";

export async function POST() {
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      passwordHash: await hashPassword(DEMO_PASSWORD),
      name: "Demo Operator",
      role: "MANAGER"
    },
    create: {
      name: "Demo Operator",
      email: DEMO_EMAIL,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      role: "MANAGER"
    }
  });

  return NextResponse.json({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD
  });
}
