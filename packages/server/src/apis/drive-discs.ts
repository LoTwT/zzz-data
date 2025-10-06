import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { driveDiscs } from "zzz-data"
import { createSuccessResponseSchema, DriveDiscsSchema } from "@/schemas"
import { ok } from "@/utils"

const DriveDiscsResponseSchema =
  createSuccessResponseSchema(DriveDiscsSchema).openapi("DriveDiscsResponse")

const driveDiscsRoute = createRoute({
  method: "get",
  path: "/",
  summary: "Drive Discs List",
  tags: ["Drive Discs"],
  responses: {
    200: {
      description: "Drive Discs Response",
      content: {
        "application/json": {
          schema: DriveDiscsResponseSchema,
        },
      },
    },
  },
})

export const driveDiscsApis = new OpenAPIHono()

driveDiscsApis.openapi(driveDiscsRoute, (c) => {
  return c.json(ok({ driveDiscs }))
})
