import { EvidenceState } from "../types/question";

// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL as string;
export interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
  }

  export const uploadEvidenceFile = async (
    questionId: string,
    file: File,
    setEvidenceFiles: React.Dispatch<React.SetStateAction<EvidenceState>>
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('questionId', questionId);
  
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/evidence`);
  
      xhr.upload.onprogress = (event) => {
        const percent = Math.round((event.loaded / event.total) * 100);
        setEvidenceFiles((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            progress: percent,
            status: 'uploading',
          },
        }));
      };
  
      xhr.onload = () => {
        if (xhr.status === 201) {
          setEvidenceFiles((prev) => ({
            ...prev,
            [questionId]: {
              ...prev[questionId],
              status: 'success',
              progress: 100,
            },
          }));
          console.log("cek xhr upload", xhr)
          console.log("cek xhr response", xhr.response, typeof xhr.response)
          const url = typeof xhr.response === "string" ? JSON.parse(xhr.response).url : xhr.response.url;
          console.log("cek url", url)
          resolve(url);
        } else {
          setEvidenceFiles((prev) => ({
            ...prev,
            [questionId]: {
              ...prev[questionId],
              status: 'error',
              error: xhr.responseText,
            },
          }));
          reject(new Error(xhr.responseText));
        }
      };
  
      xhr.onerror = () => {
        setEvidenceFiles((prev) => ({
          ...prev,
          [questionId]: {
            ...prev[questionId],
            status: 'error',
            error: 'Upload gagal. Periksa koneksi Anda.',
          },
        }));
        reject(new Error('Upload error'));
      };
  
      xhr.send(formData);
    });
  };


  
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