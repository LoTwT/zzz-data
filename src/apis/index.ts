import { OpenAPIHono } from "@hono/zod-openapi"
import { agentsApis } from "./agents"
import { wEnginesApis } from "./w-engines"

export const apis = new OpenAPIHono()

apis.route("/agents", agentsApis)
apis.route("/w-engines", wEnginesApis)
