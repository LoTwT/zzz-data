import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { BangboosSchema, createSuccessResponseSchema } from "@/schemas"
import { ok } from "@/utils"
import bangboosJson from "../data/bangboos.json"

const BangboosResponseSchema =
  createSuccessResponseSchema(BangboosSchema).openapi("BangboosResponse")

const bangboosRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Bangboos List",
  tags: ["Bangboos"],
  responses: {
    200: {
      description: "Bangboos Response",
      content: {
        "application/json": {
          schema: BangboosResponseSchema,
        },
      },
    },
  },
})

export const bangboosApis = new OpenAPIHono()

bangboosApis.openapi(bangboosRoute, (c) => {
  return c.json(ok(bangboosJson))
})
