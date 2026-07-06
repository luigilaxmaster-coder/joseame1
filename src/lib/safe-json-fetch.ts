/**
 * Safe JSON fetch utility with proper error handling
 * Prevents JSON parsing errors and provides consistent error responses
 */

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
}

export interface SafeFetchResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  raw?: Response;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Safely fetch and parse JSON with comprehensive error handling
 */
export async function safeJsonFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If error response is not JSON, use status text
      }

      return {
        ok: false,
        status: response.status,
        error: errorMessage,
        raw: response,
      };
    }

    // Try to parse JSON
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        return {
          ok: false,
          status: response.status,
          error: `Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          raw: response,
        };
      }
    } else {
      // If not JSON, try to parse as text and return as data
      const text = await response.text();
      data = text as unknown as T;
    }

    return {
      ok: true,
      status: response.status,
      data,
      raw: response,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        ok: false,
        status: 0,
        error: 'Network error: Unable to reach the server',
      };
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        error: `Request timeout after ${timeout}ms`,
      };
    }

    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Safely fetch with automatic JSON stringification of body
 */
export async function safeJsonPost<T = any>(
  url: string,
  data: any,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeJsonFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Safely fetch with automatic JSON stringification of body
 */
export async function safeJsonPatch<T = any>(
  url: string,
  data: any,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeJsonFetch<T>(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Safely fetch with FormData (for file uploads)
 */
export async function safeFormDataFetch<T = any>(
  url: string,
  formData: FormData,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  return safeJsonFetch<T>(url, {
    ...options,
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
    headers: {
      ...options.headers,
    },
  });
}
