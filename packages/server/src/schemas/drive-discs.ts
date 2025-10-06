import type { DriveDisc } from "zzz-data"
import { z } from "@hono/zod-openapi"

export const DriveDiscSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    twoPieceBonus: z.string(),
    fourPieceBonus: z.string(),
    avatar: z.string(),
    sprite: z.string(),
  })
  .openapi("DriveDisc") satisfies z.ZodType<DriveDisc>

export const DriveDiscsSchema = z
  .object({
    driveDiscs: z.array(DriveDiscSchema),
  })
  .openapi("DriveDiscs")
