import { env } from "../utils/env";
import { ServiceError } from "../utils/errors";

export type SendPayload = {
  campaignId: string;
  customerId: string;
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  message: string;
};

async function sendWebhookWithRetry(url: string, payload: any, retries = 3, delay = 1000): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // eslint-disable-next-line no-console
        console.log(`[Webhook] Sent status: ${payload.status} for ${payload.customerId} (attempt ${attempt})`);
        return true;
      }
      // eslint-disable-next-line no-console
      console.warn(`[Webhook] FAILED status: ${payload.status} code: ${response.status} (attempt ${attempt}/${retries})`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(`[Webhook] Error sending status: ${payload.status} - ${error.message} (attempt ${attempt}/${retries})`);
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

export function startCampaignSimulation(payload: SendPayload) {
  const webhookUrl = `${env.FRONTEND_ORIGIN}/api/webhooks/campaign`;

  const sendEvent = (status: string, extra = {}) => {
    const data = {
      campaignId: payload.campaignId,
      customerId: payload.customerId,
      status,
      ...extra
    };
    sendWebhookWithRetry(webhookUrl, data);
  };

  // Step 1: SENT status after 500ms
  setTimeout(() => {
    sendEvent("SENT");

    // Step 2: DELIVERED or FAILED status after 1000ms
    setTimeout(() => {
      const isFailed = Math.random() < 0.1; // 10% failure rate
      if (isFailed) {
        sendEvent("FAILED", { errorMessage: "Simulated Carrier Delivery Failure" });
        return;
      }

      sendEvent("DELIVERED");

      // Step 3: OPENED status after 1500ms
      setTimeout(() => {
        // 80% open rate for whatsapp/email/push, 50% for SMS
        const openRate = payload.channel === "SMS" ? 0.5 : 0.8;
        const isOpened = Math.random() < openRate;
        if (!isOpened) return;

        sendEvent("OPENED");

        // Step 4: CLICKED status after 1000ms
        setTimeout(() => {
          const isClicked = Math.random() < 0.4; // 40% click rate
          if (!isClicked) return;

          sendEvent("CLICKED");

          // Step 5: CONVERTED status (passed as metadata in webhooks) after 1500ms
          setTimeout(() => {
            const isConverted = Math.random() < 0.3; // 30% conversion rate of those who clicked
            if (!isConverted) return;

            // Trigger a separate "converted" webhook event
            sendWebhookWithRetry(webhookUrl, {
              campaignId: payload.campaignId,
              customerId: payload.customerId,
              status: "CLICKED",
              converted: true
            });
          }, 1500);
        }, 1000);
      }, 1500);
    }, 1000);
  }, 500);
}

export async function sendToChannel(payload: SendPayload) {
  if (!payload.campaignId || !payload.customerId || !payload.message) {
    throw new ServiceError("campaignId, customerId, and message are required", 400);
  }

  // Trigger the simulation asynchronously
  startCampaignSimulation(payload);

  return {
    success: true,
    provider: payload.channel,
    campaignId: payload.campaignId,
    customerId: payload.customerId,
    queuedAt: new Date().toISOString()
  };
}
