import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { wEngines } from "zzz-data"
import { createSuccessResponseSchema, WEnginesSchema } from "@/schemas"
import { ok } from "@/utils"

const WEnginesResponseSchema =
  createSuccessResponseSchema(WEnginesSchema).openapi("WEnginesResponse")

const wEnginesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "W-Engines List",
  tags: ["W-Engines"],
  responses: {
    200: {
      description: "W-Engines Response",
      content: {
        "application/json": {
          schema: WEnginesResponseSchema,
        },
      },
    },
  },
})

export const wEnginesApis = new OpenAPIHono()

wEnginesApis.openapi(wEnginesRoute, (c) => {
  return c.json(ok({ wEngines }))
})
