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
  })
  .openapi("Bangboo")

export const BangboosSchema = z
  .object({
    bangboos: z.array(BangbooSchema),
  })
  .openapi("Bangboos")
