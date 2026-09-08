export class ApiClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any,
  ) {
    super(
      data?.message ||
        data?.error ||
        `API request failed with status ${status}: ${statusText}`,
    );
    this.name = 'ApiClientError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject auth token from localStorage if available in browser
  if (typeof window !== 'undefined') {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('cg_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      try {
        errorData = { message: await response.text() };
      } catch {
        errorData = null;
      }
    }
    throw new ApiClientError(response.status, response.statusText, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
