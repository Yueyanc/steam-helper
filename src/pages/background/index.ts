import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import request from "./request";
import dayjs from "dayjs";
import _ from "lodash";
reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");
reloadOnUpdate("public/_locales");

console.log("background loaded");

// 获取当天最新汇率
chrome.storage.local.get("exchange_rate", (item) => {
  const dateString = _.get(item, ["exchange_rate", "date"]);
  if (dayjs().format("YYYY-MM-DD") === dateString) return;
  request({ url: "https://api.exchangerate-api.com/v4/latest/USD" }).then(
    async (res) => {
      console.log(res);
      chrome.storage.local.set({ exchange_rate: res });
    }
  );
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`getMessage---- type:${message.type}`, message);

  if (message.type === "request") {
    request(message.options).then((res) => {
      if (res) sendResponse(res);
    });
    return true;
  }
  if (message.type === "get") {
    chrome.storage.local.get(message.options, (item) => {
      console.log(item);
      sendResponse(item);
    });
    return true;
  }
  if (message.type === "get") {
    chrome.storage.local.set(message.options);
  }
});
