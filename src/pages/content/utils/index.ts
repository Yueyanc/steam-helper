import Cookies from "js-cookie";
import { getUserId } from "../serives";
import { AxiosRequestConfig } from "axios";
import { Cashify } from "cashify";
import _ from "lodash";
import { currencyUnit } from "./currencyUnit";
export * from "./parse";
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

export const requestByBackground = (options: AxiosRequestConfig) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "request", options }, (response) => {
      // 3. Got an asynchronous response with the data from the service worker
      console.log("received user data", response);
      resolve(response);
    });
  });
};

const cashify = new Cashify({ base: "USD" });
export const convert = (function () {
  chrome.runtime.sendMessage(
    { type: "get", options: "exchange_rate" },
    (response) => {
      const rates = _.get(response, ["exchange_rate", "rates"]);
      if (rates) cashify.options.rates = rates;
    }
  );
  return (count: number, options: { from: string; to: string }) => {
    const keys = _.keys(cashify.options.rates);
    if (keys.includes(options.from) && keys.includes(options.to)) {
      return cashify.convert(count, options);
    }
    return count;
  };
})();
export const getCurrencyUnit = (currency: string) => {
  return currencyUnit[currency] ?? "";
};
