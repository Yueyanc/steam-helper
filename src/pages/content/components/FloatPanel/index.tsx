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
  clearLocalStorage,
  deduplicateArrayByKey,
  getLocalStorage,
  getRecentlyAppId,
  getSessionId,
  getTreeItem,
  removeTreeItem,
  setLocalStorage,
} from "../../utils";
import {
  addItemToCollection,
  getPublishedFileDetails,
  getUserCollections,
} from "../../serives";
import { useEnhanceUI, useListenCheck } from "./hook";
import { DeleteOutlined } from "@ant-design/icons";

// 把datasource的item渲染成左边有个预览图右边为title的组件
const TransferItem: FC<{ data: any; onDelete?: () => void }> = ({
  data,
  onDelete = () => {},
}) => {
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
      <Button
        onClick={() => {
          onDelete();
        }}
        icon={<DeleteOutlined />}
      ></Button>
    </div>
  );
};
const TreeTransfer: FC<any> = () => {
  const { checkedItems, setCheckedItems } = useListenCheck();
  const [treeSelect, setTreeSelect] = useState([]);
  const [targetKeys, setTargetKeys] = useState(
    getLocalStorage("shelper_targetKeys") || []
  );
  const appId = getRecentlyAppId();
  const sessionId = getSessionId();
  const [collections, setCollections] = useState(
    getLocalStorage("shelper_collections") || []
  );
  const [cacheItems, setCacheItems] = useState(
    getLocalStorage("shelper_cacheItems") || []
  );

  const dataSource = useMemo(() => {
    return deduplicateArrayByKey(
      checkedItems.concat(
        collections.map((item) => item.children || []).flat(),
        cacheItems
      )
    );
  }, [checkedItems, collections, cacheItems]);
  useEffect(() => {
    setLocalStorage("shelper_checkedItems", checkedItems);
    setLocalStorage("shelper_collections", collections);
    setLocalStorage("shelper_cacheItems", cacheItems);
    setLocalStorage("shelper_targetKeys", targetKeys);
  }, [collections, cacheItems, checkedItems, targetKeys]);
  const onLoadData: any = ({ childrenIds, key, children }) => {
    if (!children?.length) {
      return new Promise((resolve, reject) => {
        getPublishedFileDetails({
          itemcount: childrenIds.length,
          publishedfileids: childrenIds,
        })
          .then((res) => {
            const data = res.response.publishedfiledetails;
            if (!data) {
              reject(false);
              return;
            }
            const children = data.map((item) => ({
              key: `${key}-${item.publishedfileid}`,
              title: item.title,
              preview_url: item.preview_url,
              isLeaf: true,
              selectable: false,
            }));
            setTargetKeys((pre) => [
              ...pre,
              ...children.map((item) => item.key),
            ]);
            setCollections((pre) => addTreeItem(pre, key, ...children));
            return resolve(true);
          })
          .catch(() => reject(false));
      });
    }
    return Promise.resolve();
  };
  useEffect(() => {
    getUserCollections({ appid: appId, sessionid: sessionId }).then(
      async (res) => {
        if (res.success === 1) {
          const items = res.all_collections.items;
          console.log(items.length, collections.length);
          if (Object.keys(items).length !== collections.length) {
            setCollections(
              Object.keys(items).map((key) => ({
                key: items[key].publishedfileid,
                title: items[key].title,
                preview_url: items[key].preview_url,
                checkable: false,
                childrenIds: items[key].children.map(
                  (chil) => chil.publishedfileid
                ),
              }))
            );
          }
        }
      }
    );
  }, []);
  return (
    <Image.PreviewGroup>
      <Transfer
        targetKeys={targetKeys}
        dataSource={dataSource}
        render={(item: any) => (
          <TransferItem
            data={item}
            onDelete={() => {
              setCheckedItems((pre) =>
                pre.filter((preItem) => preItem.key !== item.key)
              );
            }}
          />
        )}
        style={{ width: "fit-content", height: 600, minWidth: 700 }}
        listStyle={{ height: "100%" }}
        onChange={(targetKeys, direction, moveKeys) => {
          // 移动到右边时
          if (direction === "right") {
            moveKeys.forEach((key) => {
              const keys = key.split("-");
              let publishedfileid = key;
              if (keys.length === 2) {
                publishedfileid = keys[1];
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
                  if (!newTreeNode.isLeaf) newTreeNode.isLeaf = true;
                  setCollections(
                    addTreeItem(collections, treeSelect[0], newTreeNode)
                  );
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
        {({ direction, onItemSelect }) => {
          if (direction === "right") {
            return (
              <div style={{ height: "100%", overflow: "auto" }}>
                <Space style={{ margin: "10px 10px" }}>
                  <Button disabled>新增合集</Button>
                  <Button
                    onClick={() => {
                      clearLocalStorage([
                        "shelper_checkedItems",
                        "shelper_targetKeys",
                        "shelper_collections",
                        "shelper_cacheItems",
                      ]);
                    }}
                  >
                    清除缓存
                  </Button>
                </Space>
                <Tree
                  loadData={onLoadData}
                  style={{ width: 300 }}
                  checkable
                  treeData={collections}
                  selectedKeys={treeSelect}
                  onSelect={(value) => {
                    setTreeSelect(value);
                  }}
                  titleRender={(item: any) => (
                    <Space style={{ minWidth: 180, padding: "5px 10px" }}>
                      {item.isLeaf && (
                        <Image src={item.preview_url} width={60} />
                      )}
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
  const [openPopover, setOpenPopover] = useState(true);

  useEffect(() => {
    setOpenPopover(getLocalStorage("shelper_openPopover"));
  }, []);
  useEnhanceUI();
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
        fresh
        style={{ zIndex: 999 }}
        content={<TreeTransfer />}
        open={openPopover}
      >
        <FloatButton
          onClick={() =>
            setOpenPopover((value) => {
              setLocalStorage("shelper_openPopover", !value);
              return !value;
            })
          }
        />
      </Popover>
    </ConfigProvider>
  );
}
export default FloatPanel;
