// auth.ts - handles JWT token storage and retrieval
// We store the token in localStorage so the user stays logged in after page refresh

const TOKEN_KEY = "utrgv_token";
const isBrowser = () => typeof window !== "undefined";

// Save the token after login or register
export function saveToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

// Get the token to send with API requests
export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Remove the token when user logs out
export function removeToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
}

// Check if user is currently logged in
export function isLoggedIn(): boolean {
  return getToken() !== null;
}
