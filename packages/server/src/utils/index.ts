import type { ApiResponseError, ApiResponseSuccess } from "@/types"

export function ok<T>(data: T): ApiResponseSuccess<T> {
  return {
    success: true,
    data,
    error: null,
  }
}

export function fail(message: string): ApiResponseError {
  return {
    success: false,
    data: null,
    error: message,
  }
}
