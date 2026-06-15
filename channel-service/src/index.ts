import cors from "cors";
import express from "express";
import type { Request, Response } from "express";

import { channelRouter } from "./routes/channel.routes";
import { env } from "./utils/env";
import { errorHandler } from "./utils/errors";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "channel-service" });
});

app.use("/api/channel", channelRouter);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Channel service running on http://localhost:${env.PORT}`);
});
