"use server";

import { revalidatePath } from "next/cache";

import { LEAD_STAGES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type CreateLeadInput = {
  name: string;
  email: string;
  company: string;
  value: number;
};

export async function createLead(input: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      company: input.company,
      value: input.value,
      stage: LEAD_STAGES[0]
    }
  });

  revalidatePath("/dashboard");
  return lead;
}
