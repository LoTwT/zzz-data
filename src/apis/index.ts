import { OpenAPIHono } from "@hono/zod-openapi"
import { agentsApis } from "./agents"

export const apis = new OpenAPIHono()

apis.route("/agents", agentsApis)
