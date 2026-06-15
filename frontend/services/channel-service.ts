import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

export async function sendLeadToChannel(payload: {
  leadId: string;
  channel: "email" | "whatsapp" | "sms";
  message: string;
}) {
  const response = await fetch(`${env.CHANNEL_SERVICE_URL}/api/channel/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new AppError("Failed to send lead to channel service", response.status);
  }

  return response.json();
}
