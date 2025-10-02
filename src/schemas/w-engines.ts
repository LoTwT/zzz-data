import type { WEngine } from "@/types/w-engines"
import { z } from "@hono/zod-openapi"

export const WEngineSchema = z
  .object({
    name: z.string(),
    id: z.number(),
    rank: z.string(),
    specialty: z.string(),
    atk: z.number(),
    advancedStat: z.string(),
    advancedStatValue: z.number(),
  })
  .openapi("WEngine") satisfies z.ZodType<WEngine>

export const WEnginesSchema = z
  .object({
    wEngines: z.array(WEngineSchema),
  })
  .openapi("WEngines")
