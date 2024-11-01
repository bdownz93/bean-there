export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('fetch') ||
           error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('connection')
  }
  return false
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (isNetworkError(error)) {
      return "Network error. Please check your internet connection and try again."
    }
    
    // Handle specific auth errors
    if ('status' in error) {
      switch ((error as any).status) {
        case 400:
          return "Invalid email or password format"
        case 422:
          return "Email is already registered"
        case 429:
          return "Too many attempts. Please try again later"
        case 500:
          return "Server error. Please try again later"
        default:
          return error.message || "An unexpected error occurred"
      }
    }
    
    return error.message
  }
  
  return "An unexpected error occurred"
}