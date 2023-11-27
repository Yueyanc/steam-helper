import { useLayoutEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { render } from "react-dom";
import { Button, Space } from "antd";
import styles from "./index.module.scss";
const WorkshopHandleRow: React.FC<{ onAdd?: () => void }> = ({
  onAdd = () => {},
}) => {
  return (
    <Space>
      <Button
        onClick={onAdd}
        type="primary"
        icon={<PlusOutlined style={{ fontSize: 10 }} />}
        className={styles["workshop-handle-row"]}
      />
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
