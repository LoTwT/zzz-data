import { OpenAPIHono } from "@hono/zod-openapi"
import { agentsApis } from "./agents"
import { anomaliesApis } from "./anomalies"
import { bangboosApis } from "./bangboos"
import { deadlyAssaultsApis } from "./deadly-assaults"
import { driveDiscsApis } from "./drive-discs"
import { wEnginesApis } from "./w-engines"

export const apis = new OpenAPIHono()

apis.route("/agents", agentsApis)
apis.route("/anomalies", anomaliesApis)
apis.route("/bangboos", bangboosApis)
apis.route("/deadly-assaults", deadlyAssaultsApis)
apis.route("/drive-discs", driveDiscsApis)
apis.route("/w-engines", wEnginesApis)
