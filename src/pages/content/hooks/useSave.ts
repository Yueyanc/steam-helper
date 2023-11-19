const extensionId = "nhkcpgimbankdpilnjgikhopapjpilgl";
export function useSaveData(data) {
  // 发送消息到 background script
  chrome.runtime.sendMessage(
    extensionId,
    { type: "save_data", data },
    function (response) {
      console.log("收到来自 background script 的响应:", response);
    }
  );
}
