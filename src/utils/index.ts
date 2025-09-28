import type { ApiResponse } from "@/types/apis"

export function ok<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
  }
}

export function fail(message: string): ApiResponse {
  return {
    success: false,
    data: null,
    error: message,
  }
}
