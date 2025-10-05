import type {
  DeadlyAssault,
  DeadlyAssaultBuff,
  DeadlyAssaultEnemy,
  DeadlyAssaultEnemyAnomalyIds,
  DeadlyAssaultEnemyResistance,
  DeadlyAssaultEnemyResistanceValue,
} from "@/types/deadly-assaults"
import { z } from "@hono/zod-openapi"

export const DeadlyAssaultEnemyResistanceValueSchema = z
  .object({
    ice: z.number(),
    fire: z.number(),
    electric: z.number(),
    physical: z.number(),
    ether: z.number(),
  })
  .openapi(
    "DeadlyAssaultEnemyResistanceValue",
  ) satisfies z.ZodType<DeadlyAssaultEnemyResistanceValue>

export const DeadlyAssaultEnemyResistanceSchema = z
  .object({
    damage: DeadlyAssaultEnemyResistanceValueSchema,
    anomalyBuildup: DeadlyAssaultEnemyResistanceValueSchema,
    daze: DeadlyAssaultEnemyResistanceValueSchema,
  })
  .openapi(
    "DeadlyAssaultEnemyResistance",
  ) satisfies z.ZodType<DeadlyAssaultEnemyResistance>

export const DeadlyAssaultEnemyAnomalyIdsSchema = z
  .object({
    ice: z.number(),
    fire: z.number(),
    electric: z.number(),
    physical: z.number(),
    ether: z.number(),
  })
  .openapi(
    "DeadlyAssaultEnemyAnomalyIds",
  ) satisfies z.ZodType<DeadlyAssaultEnemyAnomalyIds>

export const DeadlyAssaultEnemySchema = z
  .object({
    id: z.number(),
    avatar: z.string(),
    details: z.array(z.string()),
    ht: z.number(),
    atk: z.number(),
    def: z.number(),
    resistance: DeadlyAssaultEnemyResistanceSchema,
    anomalyIds: DeadlyAssaultEnemyAnomalyIdsSchema,
  })
  .openapi("DeadlyAssaultEnemy") satisfies z.ZodType<DeadlyAssaultEnemy>

export const DeadlyAssaultBuffSchema = z
  .object({
    name: z.string(),
    effect: z.string(),
  })
  .openapi("DeadlyAssaultBuff") satisfies z.ZodType<DeadlyAssaultBuff>

export const DeadlyAssaultSchema = z
  .object({
    id: z.number(),
    period: z.string(),
    enemies: z.array(DeadlyAssaultEnemySchema),
    buffs: z.array(DeadlyAssaultBuffSchema),
  })
  .openapi("DeadlyAssault") satisfies z.ZodType<DeadlyAssault>

export const DeadlyAssaultsSchema = z
  .object({
    deadlyAssaults: z.array(DeadlyAssaultSchema),
  })
  .openapi("DeadlyAssaults")
