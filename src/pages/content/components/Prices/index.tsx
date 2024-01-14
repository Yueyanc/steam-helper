import { ProTable } from "@ant-design/pro-components";
import { render } from "react-dom";
import { useLayoutEffect } from "react";
import { AntdConfigProvider } from "../../app";
import { theme } from "antd";
import { getPricesDetail } from "../../serives";

const Prices: React.FC = () => {
  getPricesDetail();
  return (
    <AntdConfigProvider
      theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
    >
      <ProTable
        search={{
          filterType: "light",
        }}
        className="mb-2"
      />
    </AntdConfigProvider>
  );
};

export default function InjectPrices() {
  useLayoutEffect(() => {
    const game_area_purchase = document.getElementById("game_area_purchase");
    const beforeDom = game_area_purchase.querySelector(
      ".game_area_purchase_game_wrapper"
    );
    const container = document.createElement("div");
    game_area_purchase.insertBefore(container, beforeDom);
    render(<Prices />, container);
  }, []);
  return <></>;
}
