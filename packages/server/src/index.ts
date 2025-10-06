import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
// import { cache } from "hono/cache"
import { cors } from "hono/cors"
import { csrf } from "hono/csrf"
import { trimTrailingSlash } from "hono/trailing-slash"
import { apis } from "./apis"
import { fail } from "./utils"

const app = new OpenAPIHono()

app.use(
  cors(),
  csrf(),
  trimTrailingSlash(),
  // cache({
  //   cacheName: "zzz-data",
  //   cacheControl: "max-age=3600",
  // }),
)

app.doc("/openapi.json", {
  info: {
    title: "ZZZ Data API",
    version: "1.0.0",
  },
  openapi: "3.1.0",
})

app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
)

app.onError((err, c) => {
  const errStatus = (err as any).status

  const status =
    typeof errStatus === "number" && !Number.isNaN(errStatus) ? errStatus : 500

  return c.json(fail(err.message ?? "Internal Server Error"), status)
})

app.get("/", (c) => {
  return c.json({ message: "Hello!" })
})

app.route("/api", apis)

export default app
