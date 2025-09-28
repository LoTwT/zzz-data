import { Hono } from "hono"
import { apis } from "./apis"
import { fail } from "./utils"

const app = new Hono()

app.onError((err, c) => {
  const errStatus = (err as any).status

  const status =
    typeof errStatus === "number" && !Number.isNaN(errStatus) ? errStatus : 500

  // @ts-expect-error skip type check
  return c.json(fail(err.message ?? "Internal Server Error"), status)
})

app.get("/", (c) => {
  return c.json({ message: "Hello!" })
})

app.route("/api", apis)

export default app
