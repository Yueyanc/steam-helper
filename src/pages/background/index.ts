import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");
// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // 获取来自 content script 的数据
  const { data, type } = request;
  console.log("request", request);

  if (type === "sync_data") {
    chrome.storage.local.get("content_data").then((res) => {
      console.log("数据已发送", res);
      sendResponse(res);
    });
    return true;
  }
  if (type === "save_data") {
    // 存储数据到 chrome.storage.local
    chrome.storage.local.set({ content_data: data }, function () {
      console.log("数据已保存到 chrome.storage.local", data);
    });
    // 发送响应给 content script
    sendResponse(true);
  }
});
