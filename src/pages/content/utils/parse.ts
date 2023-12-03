export const parseModDetailDocument = (htmlString: string) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  const screenshots = Array.from(
    tempDiv.querySelectorAll(".highlight_strip_screenshot")
  ).map((item) => {
    const img = item.querySelector("img");
    return img.getAttribute("src");
  });
  const requiredItems = Array.from(
    tempDiv.querySelector("#RequiredItems").querySelectorAll("a")
  ).map((item) => {
    const href = item.getAttribute("href");
    const title = item.querySelector(".requiredItem").textContent;
    const id = href.split("id=")[1];
    return { id, title };
  });
  return {
    screenshots,
    requiredItems,
  };
};
export const parseSubscribedFilesDocument = (htmlString: string) => {
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
