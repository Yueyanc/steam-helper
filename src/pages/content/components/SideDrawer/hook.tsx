import { useLayoutEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { render } from "react-dom";
import { Button, Space } from "antd";
import styles from "./index.module.scss";
import { getPublishedFileDetails } from "../../serives";
const WorkshopHandleRow: React.FC<{ onAdd?: () => void }> = ({
  onAdd = () => {},
}) => {
  return (
    <Space>
      <button
        onClick={onAdd}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-1 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <PlusOutlined style={{ fontSize: 10 }} />
      </button>
    </Space>
  );
};
export const useReactiveUI = ({ add }: { add: (item: any) => void }) => {
  useLayoutEffect(() => {
    const rawItemEls = document.querySelectorAll(".workshopItem");
    rawItemEls.forEach((item) => {
      const div = document.createElement("div");
      const fileRating = item.querySelector(".fileRating");
      const publishId = item
        .querySelector(".ugc")
        .getAttribute("data-publishedfileid");
      const previewImageSrc = item
        .querySelector(".workshopItemPreviewImage")
        .getAttribute("src");
      item.insertBefore(div, fileRating);
      const title = item.querySelector(".workshopItemTitle").textContent;
      render(
        <WorkshopHandleRow
          onAdd={() => {
            getPublishedFileDetails({
              itemcount: 1,
              publishedfileids: [publishId],
            }).then((res) => {
              console.log(res);
            });
            add({
              preview_url: previewImageSrc,
              isLeaf: true,
              title,
              key: publishId + "-" + new Date().getTime(),
            });
          }}
        />,
        div
      );
    });
    console.log(rawItemEls);
  }, []);
};
