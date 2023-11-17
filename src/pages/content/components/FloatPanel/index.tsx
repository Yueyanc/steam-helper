import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import {
  FloatButton,
  Popover,
  Transfer,
  Tree,
  Image,
  ConfigProvider,
  theme,
  Space,
  Button,
  message,
} from "antd";
import {
  addTreeItem,
  deduplicateArrayByKey,
  getRecentlyAppId,
  getSessionId,
  getTreeItem,
  removeTreeItem,
} from "../../utils";
import {
  addItemToCollection,
  getPublishedFileDetails,
  getUserCollections,
} from "../../serives";
import { useAddCheck, useCollectionParse } from "./hook";

// 把datasource的item渲染成左边有个预览图右边为title的组件
const TransferItem: FC<{ data: any }> = ({ data }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Image src={data.preview_url} width={80} />
      <div
        style={{
          display: "inline-block",
          maxWidth: 110,
          marginLeft: 10,
          wordBreak: "break-all",
          whiteSpace: "normal",
        }}
      >
        {data.title}
      </div>
    </div>
  );
};
const TreeTranfer: FC<any> = () => {
  const [treeSelect, setTreeSelect] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const appId = getRecentlyAppId();
  const sessionId = getSessionId();
  const [collections, setCollections] = useState([]);
  const [cacheItems, setCacheItems] = useState([]);
  const { checkedItems, unCheckItem } = useAddCheck();
  const dataSource = useMemo(() => {
    return deduplicateArrayByKey(
      checkedItems.concat(
        collections.map((item) => item.children || []).flat(),
        cacheItems
      )
    );
  }, [checkedItems, collections, cacheItems]);

  useEffect(() => {
    getUserCollections({ appid: appId, sessionid: sessionId }).then(
      async (res) => {
        if (res.success === 1) {
          const collection = useCollectionParse(res);
          const initTargetKeys = [];
          const collectionChilDetail = await Promise.all(
            collection.map(async (item) => {
              const result: any = {};
              result.checkable = false;
              result.key = item.publishedfileid;
              result.preview_url = item.preview_url;
              result.title = item.title;
              const publishedfileids = item.children?.map(
                (chil) => chil.publishedfileid
              );
              if (!publishedfileids) return result;
              const publishedfileDetailsResponse =
                await getPublishedFileDetails({
                  itemcount: publishedfileids.length,
                  publishedfileids: publishedfileids,
                });
              result.children =
                publishedfileDetailsResponse.response.publishedfiledetails.map(
                  (detail) => {
                    const key = `${item.publishedfileid}-${detail.publishedfileid}`;
                    initTargetKeys.push(key);
                    return {
                      title: detail.title,
                      preview_url: detail.preview_url,
                      selectable: false,
                      key,
                    };
                  }
                );
              return result;
            })
          );
          setTargetKeys(initTargetKeys);
          setCollections(collectionChilDetail);
        }
      }
    );
  }, []);
  return (
    <Image.PreviewGroup>
      <Transfer
        targetKeys={targetKeys}
        dataSource={dataSource}
        render={(item) => <TransferItem data={item} />}
        style={{ width: "fit-content", height: 600, minWidth: 700 }}
        listStyle={{ height: "100%" }}
        onChange={(targetKeys, direction, moveKeys) => {
          // 移动到右边时
          if (direction === "right") {
            moveKeys.forEach((key) => {
              const keys = key.split("-");
              let publishedfileid;
              if (keys.length === 2) {
                publishedfileid = keys[1];
              } else {
                publishedfileid = key;
              }
              if (!treeSelect[0]) {
                message.warning("请选择合集");
                return;
              }
              addItemToCollection({
                publishedfileid: publishedfileid,
                targetPublishedfileid: treeSelect[0],
                sessionId,
                type: "add",
              }).then((res) => {
                if (res.success === 1) {
                  setTargetKeys((preKeys) => [...preKeys, key]);
                  const newTreeNode = checkedItems
                    .concat(cacheItems)
                    .filter((item) => item.key === key)[0];
                  setCollections(
                    addTreeItem(collections, treeSelect[0], newTreeNode)
                  );
                  unCheckItem(key);
                }
              });
            });
          } else {
            moveKeys.forEach((key) => {
              const keys = key.split("-");
              let treeSelectKey, publishedfileid;
              if (keys.length === 2) {
                treeSelectKey = keys[0];
                publishedfileid = keys[1];
              } else {
                treeSelectKey = treeSelect[0];
                publishedfileid = key;
              }
              addItemToCollection({
                publishedfileid: publishedfileid,
                targetPublishedfileid: treeSelectKey,
                sessionId,
                type: "remove",
              }).then((res) => {
                if (res.success === 1) {
                  setTargetKeys((preKeys) => {
                    return preKeys.filter((preKey) => preKey !== key);
                  });
                  setCacheItems((preItems) => {
                    const willDeleteItem = getTreeItem(collections, key);
                    return deduplicateArrayByKey(
                      [...preItems, willDeleteItem].filter((item) => item)
                    );
                  });
                  // 去除树中的当前项
                  setCollections((preCollections) => {
                    const test = removeTreeItem(preCollections, key);
                    return test;
                  });
                }
              });
            });
          }
        }}
      >
        {({ direction, onItemSelect, selectedKeys }) => {
          if (direction === "right") {
            return (
              <div style={{ height: "100%", overflow: "auto" }}>
                <Space style={{ margin: "10px 10px" }}>
                  <Button>新增合集</Button>
                </Space>
                <Tree
                  style={{ width: 300 }}
                  checkable
                  treeData={collections}
                  selectedKeys={treeSelect}
                  onSelect={(value) => {
                    setTreeSelect(value);
                  }}
                  titleRender={(item) => (
                    <Space>
                      <Image src={item.preview_url} width={60} />
                      <span>{item.title}</span>
                    </Space>
                  )}
                  onCheck={(value, e) => {
                    console.log(value, e);
                    const { checked, node } = e;
                    onItemSelect(node.key, checked);
                  }}
                />
              </div>
            );
          }
        }}
      </Transfer>
    </Image.PreviewGroup>
  );
};

function FloatPanel() {
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Popover: {
            zIndexPopup: 999,
          },
          Tree: {
            nodeSelectedBg: "red",
          },
        },
      }}
    >
      <Popover
        style={{ zIndex: 999 }}
        content={<TreeTranfer />}
        open={openPopover}
      >
        <FloatButton onClick={() => setOpenPopover((value) => !value)} />
      </Popover>
    </ConfigProvider>
  );
}
export default FloatPanel;
