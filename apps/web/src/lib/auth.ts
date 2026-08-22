const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/trpc', '');
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3000`;
  }
  return 'http://localhost:3000';
}

export async function exchangeOAuthCode(
  code: string
): Promise<{ token: string }> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error al canjear el código de acceso');
  }

  return response.json();
}
