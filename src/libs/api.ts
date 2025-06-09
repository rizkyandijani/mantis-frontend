// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL as string;
export interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
  }


  
  export async function apiFetch<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    try {
      const res = await fetch(`${API_URL}/${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
  
      const contentType = res.headers.get("Content-Type") || "";

      console.log("cek res", res)
  
      // Handle non-2xx status
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
  
      // Handle cases where server returns HTML instead of JSON (e.g. fallback 404 page)
      if (contentType.includes("text/html")) {
        throw new Error(`Invalid endpoint or unexpected HTML response from: ${url}`);
      }
  
      // Parse JSON or return raw response
      const data = await res.json();
      return data as T;
    } catch (err) {
    console.log("cek err", err)
      console.error(`[apiFetch] Error fetching ${url}:`, err);
      // Optionally throw custom 400 response
      throw {
        status: 400,
        message: `Failed to fetch API: ${url}`,
        detail: err,
      };
    }
  }