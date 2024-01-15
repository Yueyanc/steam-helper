import { ProColumns, ProTable } from "@ant-design/pro-components";
import { render } from "react-dom";
import { useLayoutEffect, useEffect, useState } from "react";
import { AntdConfigProvider } from "../../app";
import { Collapse, theme } from "antd";
import { getPlain, getCurrentPrices, getPriceOverview } from "../../serives";
import _ from "lodash";
import { i18n } from "@root/src/chrome/i18n";
import { convert, getCurrencyUnit } from "../../utils";

const defaultCurrency = "USD";
interface Props {
  id: string;
}
const defaultCountry = ["tr", "ar", "cn", "jp", "us", "ru", "gb"];
const Prices: React.FC<Props> = ({ id }) => {
  const [plain, setPlain] = useState();
  const [dataSource, setDataSource] = useState([]);
  const columns: ProColumns<any, any>[] = [
    { title: "地区", dataIndex: "country" },
    {
      title: "当前价格",
      dataIndex: "final",
      render(dom, entity, index, action, schema) {
        return `${getCurrencyUnit(defaultCurrency)}${convert(
          entity.final / 100,
          {
            from: entity.currency,
            to: defaultCurrency,
          }
        ).toFixed(2)} ${defaultCurrency}`;
      },
      sorter: (a, b) =>
        convert(a.final, { from: a.currency, to: defaultCurrency }) -
        convert(b.final, { from: b.currency, to: defaultCurrency }),
    },
    { title: "折扣力度", dataIndex: "discount_percent" },
  ];
  useEffect(() => {
    // getPlain({ id }).then((res) => {
    //   setPlain(_.get(res, ["data", "plain"]));
    // });
    defaultCountry.forEach((country) => {
      getCurrentPrices({ id, country }).then((res) => {
        console.log(res);
        if (res?.[id]?.success) {
          const data = res[id].data;
          setDataSource((pre) => [
            ...pre,
            { country: i18n(country as any), ...data.price },
          ]);
        }
      });
    });
    // getPriceOverview({ plain, country: "tr", ids: [id] }).then((res) => {
    //   console.log(res);
    // });
  }, [id]);
  return (
    <AntdConfigProvider
      theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        token: {
          colorBgContainer: "#32414f",
        },
      }}
    >
      <Collapse
        className="my-4"
        items={[
          {
            key: "1",
            label: "多国价格对比",
            children: (
              <ProTable
                dataSource={dataSource}
                columns={columns}
                search={false}
                options={false}
                className="mb-2 pt-2"
              />
            ),
          },
        ]}
      />
    </AntdConfigProvider>
  );
};
function getGameId() {
  const regex = /store.steampowered.com\/app\/([^/]+)/;
  const match = window.location.href.match(regex);
  return match?.[1];
}
function getSubIdAndDom() {
  const elements = document.querySelectorAll(
    '[id^="game_area_purchase_section_add_to_cart_"]'
  );
  const regex = /game_area_purchase_section_add_to_cart_(\d+)/;
  const idAndDom = [];

  elements.forEach((element) => {
    const match = element.id.match(regex);
    if (match) {
      const id = match[1];
      idAndDom.push({ id, dom: element.parentElement });
    }
  });

  return idAndDom;
}
export default function InjectPrices() {
  useLayoutEffect(() => {
    const game_area_purchase = document.getElementById("game_area_purchase");
    const gameId = getGameId();
    const subIdAndDom = getSubIdAndDom();
    subIdAndDom.forEach((item) => {
      const container = document.createElement("div");
      game_area_purchase.insertBefore(container, item.dom);
      render(<Prices id={item.id} />, container);
    });
  }, []);
  return <></>;
}
