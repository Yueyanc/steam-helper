import { useEffect, useState } from "react";
import { getPublishedFileDetails } from "@pages/content/serives/index";
export const useCollectionParse = (data: any) => {
  if (!data.all_collections) return;
  const { items } = data.all_collections;
  const collections = [];
  for (const key in items) {
    const element = items[key];
    element.key = element.publishedfileid;
    collections.push(element);
  }
  return collections;
};
export const useAddCheck = () => {
  const [checkedItems, setCheckedItems] = useState([]);
  function unCheckItem(key: string) {
    const keys = key.split("-");
    let publishedfileid;
    if (keys.length > 1) {
      publishedfileid = keys[1];
    } else {
      publishedfileid = keys[0];
    }
    // 取消dom的选择状态
    const dom = document.querySelector(
      `#workshop_helper_${publishedfileid}`
    ) as HTMLInputElement;
    dom && (dom.checked = false);
  }
  useEffect(() => {
    // 在所有的workshopItem的fileRating元素后面添加一个input check元素
    const workshopItems = document.querySelectorAll(".workshopItem");
    workshopItems.forEach((item) => {
      const fileRating = item.querySelector(".fileRating");
      const ugc = item.querySelector(".ugc");
      const preImage = item.querySelector(".workshopItemPreviewImage");
      const titleDom = item.querySelector(".workshopItemTitle");

      const input = document.createElement("input");
      const preview_url = preImage.getAttribute("src");
      // 克隆ugc上的data-publishedfileid属性到input上
      const publishedfileid = ugc.getAttribute("data-publishedfileid");
      input.setAttribute("value", publishedfileid);
      input.setAttribute("type", "checkbox");
      input.setAttribute("class", "workshopItem__input");
      input.setAttribute("id", `workshop_helper_${publishedfileid}`);
      // 添加事件，监听checkbox的变化
      input.addEventListener("change", async (e) => {
        // 如果选取了，就把data-publishedfileid对应的详情加到checkedItems中
        const { checked } = e.target as HTMLInputElement;
        if (checked) {
          setCheckedItems((prevItems) => [
            ...prevItems,
            { key: publishedfileid, preview_url, title: titleDom.textContent },
          ]);
        } else {
          // 如果取消了，就把data-publishedfileid从checkedItems中删除
          const index = checkedItems.indexOf(publishedfileid);
          checkedItems.splice(index, 1);
          setCheckedItems((prevItems) =>
            prevItems.filter((item) => item.key !== publishedfileid)
          );
        }
      });
      fileRating?.parentNode?.insertBefore(input, fileRating.nextSibling);
    });
  }, []);
  return { checkedItems, unCheckItem, setCheckedItems };
};
