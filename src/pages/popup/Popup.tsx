import "@pages/popup/Popup.css";
import withSuspense from "@src/shared/hoc/withSuspense";
import logo from "@assets/img/logo.png";
import { useEffect, useState } from "react";
const Popup = () => {
  const [currentURL, setCurrentURL] = useState("");
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentURL = tabs[0].url;
      setCurrentURL(currentURL);
    });
  }, []);

  return (
    <div className="App">
      <div className="app-container">
        <div className="top-bar">
          <img src={logo} className="logo" />
          <div className="welcome-title">欢迎使用Steam Workshop helper</div>
        </div>
        <div>
          当前页面:
          {currentURL.includes("https://steamcommunity.com") ? (
            <span className="enable">已启用</span>
          ) : (
            <span className="disable">无法使用</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default withSuspense(Popup);
