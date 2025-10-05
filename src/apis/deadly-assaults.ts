import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { createSuccessResponseSchema, DeadlyAssaultsSchema } from "@/schemas"
import { ok } from "@/utils"
import deadlyAssaultsJson from "../data/deadly-assaults.json"

const DeadlyAssaultsResponseSchema = createSuccessResponseSchema(
  DeadlyAssaultsSchema,
).openapi("DeadlyAssaultsResponse")

const deadlyAssaultsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Deadly Assaults List",
  tags: ["Deadly Assaults"],
  responses: {
    200: {
      description: "Deadly Assaults Response",
      content: {
        "application/json": {
          schema: DeadlyAssaultsResponseSchema,
        },
      },
    },
  },
})

export const deadlyAssaultsApis = new OpenAPIHono()

deadlyAssaultsApis.openapi(deadlyAssaultsRoute, (c) => {
  return c.json(ok(deadlyAssaultsJson))
})
