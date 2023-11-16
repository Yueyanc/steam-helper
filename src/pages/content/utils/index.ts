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
export function getToken() {
  return "ef608c2b8130e96f39629b06645d7721";
}
