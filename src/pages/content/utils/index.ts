import Cookies from "js-cookie";
import { getUserId } from "../serives";
export function getUrlSearchParams() {
  return new URLSearchParams(window.location.search);
}
export function getRecentlyAppId() {
  const appHubs = Cookies.get("recentlyVisitedAppHubs")?.split(",");
  return appHubs?.[appHubs.length - 1];
}
export function getSessionId() {
  return Cookies.get("sessionid");
}
export async function getUerIdLocal() {
  let userId = getSessionStorage("userId");
  if (userId === "" || !userId) {
    const res = await getUserId();
    userId = res;
    setSessionStorage("userId", res);
  }
  return userId;
}
export const setLocalStorage = (key: string, data: any) => {
  window.localStorage.setItem(key, JSON.stringify(data));
};
export const getLocalStorage = (key: string) => {
  const raw = window.localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
};
export const setSessionStorage = (key: string, data: any) => {
  window.sessionStorage.setItem(key, JSON.stringify(data));
};
export const getSessionStorage = (key: string) => {
  const raw = window.sessionStorage.getItem(key);
  if (raw) return JSON.parse(raw);
};
export const clearLocalStorage = (key: string[]) => {
  key.forEach((item) => {
    window.localStorage.removeItem(item);
  });
};
export * from "./parse";
