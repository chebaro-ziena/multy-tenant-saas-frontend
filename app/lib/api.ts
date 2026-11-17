
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ??
        `Request failed with status ${response.status}`,
    );
  }

  return data as T;
}
