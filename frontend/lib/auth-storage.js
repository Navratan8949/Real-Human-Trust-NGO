export const TOKEN_KEY = "token";
export const USER_KEY = "user";
export const ROLE_KEY = "authRole";

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getStoredUserRole() {
  try {
    const user = JSON.parse(window.localStorage.getItem(USER_KEY) || "null");
    return user?.role || null;
  } catch {
    return null;
  }
}

export function getStoredToken(expectedRole) {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  if (expectedRole) {
    const storedRole = window.localStorage.getItem(ROLE_KEY) || getStoredUserRole();
    const tokenRole = decodeJwtPayload(token)?.role || null;
    const actualRole = storedRole || tokenRole;

    if (actualRole !== expectedRole) return null;
  }

  return token;
}

export function setStoredSession({ token, user, role }) {
  if (typeof window === "undefined") return;

  clearStoredSession();

  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));

  const sessionRole = role || user?.role;
  if (sessionRole) window.localStorage.setItem(ROLE_KEY, sessionRole);
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}
