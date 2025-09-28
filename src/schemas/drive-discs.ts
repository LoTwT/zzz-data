import { z } from "@hono/zod-openapi"

export const DriveDiscSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    twoPieceBonus: z.string(),
    fourPieceBonus: z.string(),
  })
  .openapi("DriveDisc")

export const DriveDiscsSchema = z
  .object({
    driveDiscs: z.array(DriveDiscSchema),
  })
  .openapi("DriveDiscs")
