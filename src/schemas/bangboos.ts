import type { Bangboo } from "@/types/bangboos"
import { z } from "@hono/zod-openapi"

export const BangbooSchema = z
  .object({
    name: z.string(),
    id: z.number(),
    impact: z.number(),
    anomalyMastery: z.number(),
    hp: z.number(),
    atk: z.number(),
    def: z.number(),
    critRate: z.number(),
    critDamage: z.number(),
    avatar: z.string(),
    sprite: z.string(),
    rarity: z.string(),
    rarityIcon: z.string(),
  })
  .openapi("Bangboo") satisfies z.ZodType<Bangboo>

export const BangboosSchema = z
  .object({
    bangboos: z.array(BangbooSchema),
  })
  .openapi("Bangboos")
