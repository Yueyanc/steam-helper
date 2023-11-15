import Cookies from "js-cookie";
export function getUrlSearchParams() {
  return new URLSearchParams(window.location.search);
}
export function getRecentlyAppId() {
  return Cookies.get("recentlyVisitedAppHubs");
}
export function getSessionId() {
  return Cookies.get("sessionid");
}
