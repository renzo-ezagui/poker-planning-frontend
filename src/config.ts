// VITE_API_URL may be absolute (http://localhost:3000) or a same-origin path (/api).
// VITE_SOCKET_URL "/" (or empty) means "same origin as the page".
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';
export const SOCKET_URL: string | undefined = socketUrl === '' || socketUrl === '/' ? undefined : socketUrl;

// Optional canonical public URL used in invite links/QR codes (e.g. when the
// host sits on a LAN address but guests join over the internet).
export const PUBLIC_URL: string | undefined = import.meta.env.VITE_PUBLIC_URL?.replace(/\/$/, '') || undefined;
