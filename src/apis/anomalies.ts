import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { AnomaliesSchema, createSuccessResponseSchema } from "@/schemas"
import { ok } from "@/utils"
import anomaliesJson from "../data/anomalies.json"

const AnomaliesResponseSchema =
  createSuccessResponseSchema(AnomaliesSchema).openapi("AnomaliesResponse")

const anomaliesRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Anomalies List",
  tags: ["Anomalies"],
  responses: {
    200: {
      description: "Anomalies Response",
      content: {
        "application/json": {
          schema: AnomaliesResponseSchema,
        },
      },
    },
  },
})

export const anomaliesApis = new OpenAPIHono()

anomaliesApis.openapi(anomaliesRoute, (c) => {
  return c.json(ok(anomaliesJson))
})
