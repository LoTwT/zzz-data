import { Hono } from "hono"
import { agentsApis } from "./agents"

export const apis = new Hono()

apis.route("/agents", agentsApis)
