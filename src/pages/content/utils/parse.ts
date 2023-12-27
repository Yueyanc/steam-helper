import _ from "lodash";

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
export const parseSubscribedFilesDocument = (htmlString: string) => {};
