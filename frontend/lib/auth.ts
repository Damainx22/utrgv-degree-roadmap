// auth.ts - handles JWT token storage and retrieval
// We store the token in localStorage so the user stays logged in after page refresh

const TOKEN_KEY = "utrgv_token";

// Save the token after login or register
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Get the token to send with API requests
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Remove the token when user logs out
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Check if user is currently logged in
export function isLoggedIn(): boolean {
  return getToken() !== null;
}