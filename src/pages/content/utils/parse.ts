import _ from "lodash";
import { SubscribedFilesDocumentParseResult } from "../types";

function parseHTML(htmlString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc;
}

export const parseModDetailDocument = (htmlString: string) => {
  return _.chain(htmlString)
    .thru((htmlString) => parseHTML(htmlString))
    .thru((doc) => {
      return {
        title: _.chain(doc)
          .thru((doc) => doc.querySelector("#workshopItemDetailsHeader"))
          .thru((doc) => doc.querySelector(".workshopItemTitle"))
          .thru((titleDom) => titleDom.textContent)
          .value(),
        screenshots: _.chain(doc)
          .thru((doc) => doc.querySelectorAll(".highlight_strip_screenshot"))
          .map((dom) => dom.querySelector("img"))
          .map((dom) => dom.getAttribute("src"))
          .value(),
        requiredItems: _.chain(doc)
          .thru((doc) => doc.querySelector("#RequiredItems"))
          .thru((doc) => doc.querySelectorAll("a"))
          .map((aDom) => ({
            id: aDom.getAttribute("href").split("id=")[1],
            title: aDom.querySelector(".requiredItem").textContent,
          }))
          .value(),
      };
    })
    .value();
};
export const parseSubscribedFilesDocument: (
  htmlString: string
) => SubscribedFilesDocumentParseResult = (htmlString: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;

  const rawItems = tempDiv.querySelectorAll('[id^="Subscription"]');
  const total = tempDiv
    .querySelector(".workshopBrowsePagingInfo")
    .textContent.match(/共 (\d+) 项条目/)[1];
  const items = Array.from(rawItems).map((item) => ({
    key: item.id.replace("Subscription", ""),
    title: item.querySelector(".workshopItemTitle").textContent,
    preview_url: item.querySelector(".backgroundImg").getAttribute("src"),
  }));
  return { total, items };
};
