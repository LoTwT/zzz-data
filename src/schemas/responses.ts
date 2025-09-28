import type { ZodTypeAny } from "zod"
import { z } from "@hono/zod-openapi"

export function createSuccessResponseSchema<T extends ZodTypeAny>(
  dataSchema: T,
) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    error: z.null(),
  })
}

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  data: z.null(),
  error: z.string(),
})
