import { ProColumns, ProTable } from "@ant-design/pro-components";
import { render } from "react-dom";
import { useLayoutEffect, useEffect, useState } from "react";
import { AntdConfigProvider } from "../../app";
import { Collapse, theme } from "antd";
import { getPlain, getCurrentPrices, getPriceOverview } from "../../serives";
import _ from "lodash";
import { i18n } from "@root/src/chrome/i18n";
import { convert, getCurrencyByCountry, getCurrencyUnit } from "../../utils";
import { defaultCountry } from "../../utils/countryMap";

const defaultCurrency = "USD";
interface Props {
  id: string;
}
const Prices: React.FC<Props> = ({ id }) => {
  const [plain, setPlain] = useState();
  const [dataSource, setDataSource] = useState([]);
  const columns: ProColumns<any, any>[] = [
    {
      title: i18n("region"),
      dataIndex: "country",
      render: (dom, entity) => {
        return entity.country && i18n(entity.country);
      },
    },
    {
      title: i18n("current_price"),
      dataIndex: "final",
      render(dom, entity, index, action, schema) {
        return (
          <div>
            {`${getCurrencyUnit(defaultCurrency)} ${convert(
              _.get(entity, ["final"]) / 100,
              {
                from: entity.currency,
                to: defaultCurrency,
              }
            )?.toFixed(2)}`}
          </div>
        );
      },
      sorter: (a, b) =>
        convert(a.final, { from: a.currency, to: defaultCurrency }) -
        convert(b.final, { from: b.currency, to: defaultCurrency }),
    },
    {
      title: i18n("current_discount"),
      dataIndex: "discount_percent",
      render(dom, entity, index, action, schema) {
        return entity.discount_percent + "%";
      },
    },
    {
      title: i18n("historical_low"),
      dataIndex: ["lowest", "price"],
      render(dom, entity, index, action, schema) {
        return (
          <div>
            {entity.lowest
              ? `${getCurrencyUnit(defaultCurrency)} ${convert(
                  _.get(entity, ["lowest", "price"]),
                  {
                    from: entity.meta.currency,
                    to: defaultCurrency,
                  }
                )?.toFixed(2)}`
              : "null"}
          </div>
        );
      },
    },
    {
      title: i18n("historical_low_discount"),
      dataIndex: ["lowest", "cut"],
      render(dom, entity, index, action, schema) {
        return _.get(entity, ["lowest", "cut"]) + "%";
      },
    },
    {
      title: i18n("last_historical_low_time"),
      dataIndex: ["lowest", "recorded_formatted"],
    },
  ];
  useEffect(() => {
    defaultCountry.forEach(async (country) => {
      const prices = await getCurrentPrices({ id, country });
      let rowData = {};

      if (_.get(prices, [id, "data"])) {
        const data = prices[id].data;
        rowData = { country, ...data.price };
      } else {
        return;
      }
      try {
        const otherPrices = (await getPriceOverview({
          country,
          ids: [id],
        })) as any;
        const value = _.values(otherPrices?.data)?.[0];
        const lowest = _.get(value, ["lowest"]);
        if (lowest) {
          rowData = {
            ...rowData,
            meta: otherPrices[".meta"],
            lowest,
          };
        }
      } catch (error) {
        console.log(error);
      }

      console.log(rowData);

      setDataSource((pre) => [...pre, rowData]);
    });
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
        className="my-2 mt-6"
        items={[
          {
            key: "1",
            label: i18n("multi_country_price_comparison"),
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
