import type { WEngine } from "zzz-data"
import { z } from "@hono/zod-openapi"

export const WEngineSchema = z
  .object({
    name: z.string(),
    id: z.number(),
    rarity: z.string(),
    specialty: z.string(),
    atk: z.number(),
    advancedStat: z.string(),
    advancedStatValue: z.number(),
    avatar: z.string(),
    sprite: z.string(),
    rarityIcon: z.string(),
    specialtyIcon: z.string(),
  })
  .openapi("WEngine") satisfies z.ZodType<WEngine>

export const WEnginesSchema = z
  .object({
    wEngines: z.array(WEngineSchema),
  })
  .openapi("WEngines")
