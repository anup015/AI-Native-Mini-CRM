import { Router } from "express";
import { z } from "zod";

import { sendToChannel } from "../services/channel.service";

const payloadSchema = z.object({
  campaignId: z.string().min(1),
  customerId: z.string().min(1),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH"]),
  message: z.string().min(1)
});

export const channelRouter = Router();

channelRouter.post("/send", async (req, res, next) => {
  try {
    const payload = payloadSchema.parse(req.body);
    const result = await sendToChannel(payload);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});
