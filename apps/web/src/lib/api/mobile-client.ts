const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export interface MobileApiOptions extends RequestInit {
  accessToken?: string;
}

export async function mobileApi<T>(
  path: string,
  options: MobileApiOptions = {},
): Promise<T> {
  const { accessToken, headers, ...request } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...request,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CG-Client': 'mobile',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message}`);
  }

  return response.json() as Promise<T>;
}
