import { Hono } from "hono"
import { ok } from "@/utils"
import agentsJson from "../data/agents.json"

export const agentsApis = new Hono()

// Get /api/agents
agentsApis.get("/", (c) => {
  return c.json(ok(agentsJson))
})
