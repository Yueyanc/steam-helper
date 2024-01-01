import { useLayoutEffect } from "react";
import { render } from "react-dom";
import { Button, ConfigProvider, Space, theme } from "antd";
import { getPublishedFileDetails } from "../../serives";

interface WorkshopHandleRowProps {
  onAdd?: (parmas?: { publishedfileid: string }) => void;
}
const WorkshopHandleRow: React.FC<WorkshopHandleRowProps> = ({
  onAdd = () => {},
}) => {
  return (
    <ConfigProvider
      theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
    >
      <Space>
        <Button onClick={() => onAdd()}>添加</Button>
      </Space>
    </ConfigProvider>
  );
};
export const useReactiveUI = ({ onAdd }: WorkshopHandleRowProps) => {
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
          onAdd={() => onAdd({ publishedfileid: publishId })}
        />,
        div
      );
    });
  }, []);
};
