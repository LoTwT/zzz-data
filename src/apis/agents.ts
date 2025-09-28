import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { AgentsSchema, createSuccessResponseSchema } from "@/schemas"
import { ok } from "@/utils"
import agentsJson from "../data/agents.json"

const AgentsResponseSchema =
  createSuccessResponseSchema(AgentsSchema).openapi("AgentsResponse")

const agentsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Agents List",
  tags: ["Agents"],
  responses: {
    200: {
      description: "Agents Response",
      content: {
        "application/json": {
          schema: AgentsResponseSchema,
        },
      },
    },
  },
})

export const agentsApis = new OpenAPIHono()

agentsApis.openapi(agentsRoute, (c) => {
  return c.json(ok(agentsJson))
})
