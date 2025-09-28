import { OpenAPIHono } from "@hono/zod-openapi"
import { agentsApis } from "./agents"
import { bangboosApis } from "./bangboos"
import { wEnginesApis } from "./w-engines"

export const apis = new OpenAPIHono()

apis.route("/agents", agentsApis)
apis.route("/bangboos", bangboosApis)
apis.route("/w-engines", wEnginesApis)
