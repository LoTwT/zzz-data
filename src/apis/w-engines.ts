import type { WEngine } from "@/types"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { createSuccessResponseSchema, WEnginesSchema } from "@/schemas"
import { ok } from "@/utils"
import wEnginesJson from "../data/w-engines.json"

type RawWEngine = Omit<WEngine, "atk" | "advancedStatValue"> & {
  atk: number | { formula?: string; result: number }
  advancedStatValue: number | { formula?: string; result: number }
}

function getNumericValue(
  value: number | { result: number } | undefined,
): number {
  return typeof value === "number" ? value : (value?.result ?? 0)
}

const normalizedWEngines: WEngine[] = (
  wEnginesJson.wEngines as RawWEngine[]
).map((wEngine) => ({
  ...wEngine,
  atk: getNumericValue(wEngine.atk),
  advancedStatValue: getNumericValue(wEngine.advancedStatValue),
}))

const wEnginesData = {
  wEngines: normalizedWEngines,
}

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
  return c.json(ok(wEnginesData))
})
