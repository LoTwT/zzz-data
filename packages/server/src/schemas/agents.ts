import type { Agent } from "zzz-data"
import { z } from "@hono/zod-openapi"

export const AgentSchema = z
  .object({
    name: z.string(),
    id: z.number(),
    enName: z.string(),
    attribute: z.string(),
    specialty: z.string(),
    attackType: z.string(),
    faction: z.string(),
    assistType: z.string(),
    critRate: z.number(),
    critDamage: z.number(),
    impact: z.number(),
    anomalyMastery: z.number(),
    energyLimit: z.number(),
    energyRegen: z.number(),
    anomalyProficiency: z.number(),
    hp: z.number(),
    atk: z.number(),
    def: z.number(),
    avatar: z.string(),
    sprite: z.string(),
    rarity: z.string(),
    rarityIcon: z.string(),
    attributeIcon: z.string(),
    specialtyIcon: z.string(),
    attackTypeIcon: z.string(),
    factionIcon: z.string(),
  })
  .openapi("Agent") satisfies z.ZodType<Agent>

export const AgentsSchema = z
  .object({
    agents: z.array(AgentSchema),
  })
  .openapi("Agents")
