export const tokenKey = 'token';


export function setToken(token: string) {
localStorage.setItem(tokenKey, token);
}


export function getToken(): string | null {
return localStorage.getItem(tokenKey);
}


export function clearToken() {
localStorage.removeItem(tokenKey);
}