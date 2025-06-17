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
      const t = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/${url}`, {
        headers: {
          'Authorization': t ? `Bearer ${t}` : '',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      console.log("cek response", JSON.stringify(res))
  
      const contentType = res.headers.get("Content-Type") || "";
      const isJson = contentType.includes("application/json");
      const responseData = isJson ? await res.json() : null;
  

      // Handle non-2xx status
      if (!res.ok) {
        throw {
          status: res.status,
          message: responseData?.error || res.statusText,
          raw: responseData,
        };
      }
  
      // Handle cases where server returns HTML instead of JSON (e.g. fallback 404 page)
      if (contentType.includes("text/html")) {
        throw new Error(`Invalid endpoint or unexpected HTML response from: ${url}`);
      }
  
      // Parse JSON or return raw response
      
      return responseData as T;
    } catch (err) {
      console.log("cek error fetch", err)
      console.error(`[apiFetch] Error fetching ${url}:`, err);

      // Re-throw structured error
      throw {
        status: (err as any).status ?? 500,
        message: (err as any).message ?? "Unknown fetch error",
        detail: err,
      };
    }
  }