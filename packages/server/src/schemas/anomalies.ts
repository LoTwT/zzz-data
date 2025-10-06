import type { Anomaly } from "zzz-data"
import { z } from "@hono/zod-openapi"

export const AnomalySchema = z
  .object({
    id: z.number(),
    attribute: z.string(),
    anomalyId: z.number(),
    note: z.string(),
    cd: z.number(),
    accumulationRequirements: z.array(z.number()),
    attributeIcon: z.string(),
  })
  .openapi("Anomaly") satisfies z.ZodType<Anomaly>

export const AnomaliesSchema = z
  .object({
    anomalies: z.array(AnomalySchema),
  })
  .openapi("Anomalies")
