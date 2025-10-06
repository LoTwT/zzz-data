import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { agents } from "zzz-data"
import { AgentsSchema, createSuccessResponseSchema } from "@/schemas"
import { ok } from "@/utils"

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
  return c.json(ok({ agents }))
})
