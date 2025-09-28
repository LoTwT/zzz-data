export interface ApiResponseSuccess<T> {
  success: true
  data: T
  error: null
}

export interface ApiResponseError {
  success: false
  data: null
  error: string
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError
