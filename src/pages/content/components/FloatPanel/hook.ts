import { useEffect, useInsertionEffect, useState } from "react";
import { getLocalStorage, getUrlSearchParams } from "../../utils";
import { getPublishedFileDetails } from "../../serives";
export const useListenCheck = () => {
  const [checkedItems, setCheckedItems] = useState(
    getLocalStorage("shelper_checkedItems") || []
  );
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
    const helper_mod_checks = document.querySelectorAll(
      '[workshop_helper_flag="workshop_item_check"]'
    );

    helper_mod_checks.forEach((checkEl) => {
      const publishedfileid = checkEl.getAttribute(
        "workshop_helper_publishedfileid"
      );
      const preview_url = checkEl.getAttribute("workshop_helper_preview_url");
      const title = checkEl.getAttribute("workshop_helper_title");
      // 添加事件，监听checkbox的变化
      checkEl.addEventListener("change", async (e) => {
        // 如果选取了，就把data-publishedfileid对应的详情加到checkedItems中
        const { checked } = e.target as HTMLInputElement;
        if (checked) {
          setCheckedItems((prevItems) => [
            ...prevItems,
            { key: publishedfileid, preview_url, title },
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
    });
  }, []);
  return { checkedItems, unCheckItem, setCheckedItems };
};
export const useEnhanceUI = () => {
  const urlSearchParams = getUrlSearchParams();
  const createAddChekcEl = (detail, initDom = null) => {
    let createdEl = document.createElement("input");
    if (initDom) {
      createdEl = initDom;
    }
    createdEl.setAttribute(
      "workshop_helper_publishedfileid",
      detail.publishedfileid
    );
    createdEl.setAttribute("workshop_helper_preview_url", detail.preview_url);
    createdEl.setAttribute("workshop_helper_title", detail.title);
    createdEl.setAttribute("workshop_helper_flag", "workshop_item_check");
    createdEl.setAttribute("type", "checkbox");
    createdEl.setAttribute("class", "workshopItem__input");
    createdEl.setAttribute("id", `workshop_helper_${detail.publishedfileid}`);
    return createdEl;
  };
  useInsertionEffect(() => {
    const id = urlSearchParams.get("id");
    if (id) {
      const parentEl = document.getElementById("ItemControls");
      const initInput = document.createElement("input");
      const span = document.createElement("span");
      const titleDom = document.querySelector(".workshopItemTitle");
      const preImage = document.querySelector("#previewImageMain");
      const preview_url = preImage.getAttribute("src");
      const input = createAddChekcEl(
        { publishedfileid: id, preview_url, title: titleDom.textContent },
        initInput
      );
      span.innerText = "添加到Steam-Helper";
      input.classList.add("btn_workshop_helper");
      parentEl.appendChild(input);
      parentEl.appendChild(span);
    }
    // 在所有的workshopItem的fileRating元素后面添加一个input check元素
    const workshopItems = document.querySelectorAll(".workshopItem");
    workshopItems.forEach((item) => {
      const fileRating = item.querySelector(".fileRating");
      const ugc = item.querySelector(".ugc");
      const preImage = item.querySelector(".workshopItemPreviewImage");
      const titleDom = item.querySelector(".workshopItemTitle");
      const preview_url = preImage.getAttribute("src");
      // 克隆ugc上的data-publishedfileid属性到input上
      const publishedfileid = ugc.getAttribute("data-publishedfileid");
      const input = createAddChekcEl({
        publishedfileid,
        preview_url,
        title: titleDom.textContent,
      });
      fileRating?.parentNode?.insertBefore(input, fileRating.nextSibling);
    });
  }, []);
};
