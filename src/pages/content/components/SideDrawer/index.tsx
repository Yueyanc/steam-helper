import styles from "./index.module.scss";
import { useEffect, useMemo, useState, useId, useContext } from "react";
import type { FC } from "react";
import {
  FloatButton,
  Drawer,
  Transfer,
  Tree,
  Image,
  Space,
  Button,
  message,
  Modal,
} from "antd";
import {
  clearLocalStorage,
  findTreeNode,
  getLocalStorage,
  getRecentlyAppId,
  getSessionId,
  setLocalStorage,
} from "../../utils";
import {
  addItemToCollection,
  getAllUserSubscribedFiles,
  getPublishedFileDetails,
  getPublishedFileParseDetail,
  getUserCollections,
} from "../../serives";
import { useReactiveUI } from "./hook";
import { DeleteOutlined, Loading3QuartersOutlined } from "@ant-design/icons";
import TreeModel from "tree-model";
import { GlobalContext } from "../../context";
import _ from "lodash";
import { StorageKey } from "../../constant";
import { SideDrawerModSource } from "../../types";
import ModsTable from "./ModsTable";
const tree = new TreeModel();

async function confirmDependency(
  params: Pick<SideDrawerModSource, "key" | "title" | "preview_url">
): Promise<ReturnType<typeof getPublishedFileParseDetail> | null> {
  const publishedFileParseDetail = await getPublishedFileParseDetail({
    id: params.key,
  });
  if (publishedFileParseDetail?.requiredItems?.length) {
    return Promise.resolve(null);
  }
  const { requiredItems } = publishedFileParseDetail;
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: `${params.title}有依赖项，是否一并添加？`,
      content: (
        <div>
          <img src={params.preview_url} width={200} />
          {requiredItems.map((item, index) => (
            <div key={index}>{item.title}</div>
          ))}
        </div>
      ),
      onOk: async () => {
        resolve(publishedFileParseDetail);
      },
      onCancel: () => {
        reject();
      },
    });
  });
}

// 把datasource的item渲染成左边有个预览图右边为title的组件
const TransferItem: FC<{ data: any; onDelete?: () => void }> = ({
  data,
  onDelete = () => {},
}) => {
  return (
    <div className="flex items-center justify-start gap-2">
      {data.preview_url && (
        <Image
          onClick={(e) => {
            e.stopPropagation();
          }}
          src={data.preview_url}
          width={80}
        />
      )}
      <div className="w-[110px] break-all whitespace-normal">{data.title}</div>
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
  const appId = getRecentlyAppId();
  const sessionId = getSessionId();
  const { root: rootDom } = useContext(GlobalContext);
  const [treeSelect, setTreeSelect] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [collectionTree, setCollectionTree] = useState<any[]>([]);
  const [loadingModsProgress, setLoadingModsProgress] = useState<any>({});
  const [dataSource, setDataSource] = useState<SideDrawerModSource[]>(
    getLocalStorage(StorageKey.shelper_dataSource) || []
  );
  const collections = useMemo(() => {
    return collectionTree.map((item) => item.model);
  }, [collectionTree]);
  // 添加页面操作按钮
  useReactiveUI({
    add: (item: any) => {
      setDataSource((pre) => [...pre, item]);
    },
  });
  // 持久化储存已选Mods
  useEffect(() => {
    setLocalStorage(
      StorageKey.shelper_dataSource,
      dataSource.filter((item) => !targetKeys.includes(item.key))
    );
  }, [dataSource, targetKeys]);
  // 动态导入合集下的Mods
  const onLoadData: any = ({ childrenIds, key }) => {
    return new Promise((resolve, reject) => {
      getPublishedFileDetails({
        itemcount: childrenIds.length,
        publishedfileids: childrenIds,
      })
        .then((res) => {
          if (!_.hasIn(res, ["response", "publishedfiledetails"])) {
            reject(false);
            return;
          }
          _.chain(res)
            .thru((res) => res.response.publishedfiledetails)
            .map((item) => ({
              key: item.publishedfileid + "-" + new Date().getTime(),
              collectionId: key,
              title: item.title,
              preview_url: item.preview_url,
              isLeaf: true,
              selectable: false,
              disabled: false,
            }))
            // 处理副作用
            .tap((childrens) => {
              // 导入树
              setCollectionTree((pre) => {
                childrens.forEach((item) => {
                  findTreeNode(collectionTree, key).addChild(tree.parse(item));
                });
                return [...pre];
              });
              setDataSource((pre) => [...pre, ...childrens]);
              // 设置穿梭框target
              setTargetKeys((pre) => [
                ...pre,
                ...childrens.map((item) => item.key),
              ]);
            })
            .value();
          return resolve(true);
        })
        .catch((err) => {
          console.log(err);

          reject(false);
        });
    });
  };

  // 获取用户的所有合集
  useEffect(() => {
    getUserCollections({ appid: appId, sessionid: sessionId }).then(
      async (res) => {
        if (res.success === 1) {
          const items = res.all_collections.items;
          if (Object.keys(items).length !== collections.length) {
            const treeNodes = _.chain(items)
              .values()
              .filter((item) => item.consumer_appid == appId)
              .map((item) => ({
                key: item.publishedfileid,
                title: item.title,
                preview_url: item.preview_url,
                checkable: false,
                childrenIds: item?.children
                  ? item.children?.map((chil) => chil.publishedfileid)
                  : [],
              }))
              .map((item) => tree.parse(item))
              .value();
            setCollectionTree(treeNodes);
          }
        }
      }
    );
  }, []);
  return (
    <Image.PreviewGroup preview={{ getContainer: () => rootDom }}>
      <Space className="my-2">
        <Button
          onClick={() => {
            setDataSource((pre) =>
              pre.filter((item) => targetKeys.includes(item.key))
            );
          }}
        >
          清除左侧Mods
        </Button>
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 !hover:text-white flex items-center justify-center"
          onClick={() => {
            getAllUserSubscribedFiles({
              appId,
              onProgress: ({ total, current, items }) => {
                setLoadingModsProgress({ total, current });
                setDataSource((pre) => [...pre, ...items]);
              },
            }).then(() => {
              setLoadingModsProgress({});
            });
          }}
        >
          一键导入已订阅Mods
          {loadingModsProgress.current && (
            <Loading3QuartersOutlined className="animate-spin" />
          )}
          {loadingModsProgress.total &&
            `(${loadingModsProgress.current}/${loadingModsProgress.total})`}
        </Button>
      </Space>
      <Transfer
        targetKeys={targetKeys}
        dataSource={dataSource}
        operationStyle={{}}
        render={(item: any) => (
          <TransferItem
            data={item}
            onDelete={() => {
              setDataSource((pre) => pre.filter((preItem) => preItem !== item));
            }}
          />
        )}
        className="w-fit h-[600px] min-w-[700px]"
        listStyle={{ height: "100%" }}
        onChange={async (targetKeys, direction, moveKeys) => {
          // 向合集中添加Mods
          if (direction === "right") {
            if (!treeSelect[0]) {
              message.warning("请选择合集");
              return;
            }
            const dependencies = await Promise.all(
              // 获取依赖项
              _.chain(moveKeys)
                .map((key) => dataSource.find((item) => item.key === key))
                .map((item) =>
                  // 确认是否拉取依赖项
                  confirmDependency(
                    _.pick(item, ["key", "title", "preview_url"])
                  )
                )
                .value()
            );

            const dependenciesId = _.chain(dependencies)
              .filter((item) => !_.isNil(item))
              .map((item) => item.requiredItems)
              .flatten()
              .map((item) => item.id);

            const allNeedAddId = dependenciesId.concat(
              ...moveKeys.map((item) => item.split("-")[0])
            );

            const addResult = allNeedAddId
              .map((item) =>
                addItemToCollection({
                  publishedfileid: item,
                  targetPublishedfileid: treeSelect[0],
                  sessionId,
                  type: "add",
                })
              )
              .map((item) => item.catch((err) => {}));
          } else {
            // 删除合集中的Mods
            moveKeys.forEach((key) => {
              const publishedfileid = key.split("-")[0];
              const treeSelectKey = findTreeNode(collectionTree, key)?.model
                ?.collectionId;
              addItemToCollection({
                publishedfileid,
                targetPublishedfileid: treeSelectKey,
                sessionId,
                type: "remove",
              }).then((res) => {
                if (res.success === 1) {
                  setTargetKeys((preKeys) => {
                    return preKeys.filter((preKey) => preKey !== key);
                  });
                  // 去除树中的当前项
                  setCollectionTree((pre) => {
                    const node = findTreeNode(pre, key);
                    node && node.drop();
                    return [...pre];
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
              <div className="h-full overflow-auto">
                <Space className="m-2">
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
                  className="w-80"
                  checkable
                  treeData={collections}
                  selectedKeys={treeSelect}
                  onSelect={(value) => {
                    setTreeSelect(value);
                  }}
                  titleRender={(item: any) => (
                    <Space style={{ minWidth: 180, padding: "5px 10px" }}>
                      {item.isLeaf && item.preview_url && (
                        <Image src={item.preview_url} width={60} />
                      )}
                      <span>{item.title}</span>
                    </Space>
                  )}
                  onCheck={(value, e) => {
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
const SideDrawer: React.FC<any> = () => {
  const [open, setOpen] = useState(false);
  const { root: rootDom } = useContext(GlobalContext);
  const drawerClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Drawer
        forceRender
        width={"auto"}
        rootClassName="fixed"
        className="max-h-screen backdrop-blur-3xl !bg-transparent"
        placement="right"
        open={open}
        closable={false}
        onClose={drawerClose}
        maskClosable
        getContainer={() => rootDom}
      >
        {/* <TreeTransfer /> */}
        <ModsTable />
      </Drawer>
      <FloatButton
        className="bg-gradient-to-r from-purple-500 to-pink-500 "
        onClick={() => {
          setOpen(true);
        }}
      />
    </div>
  );
};
export default SideDrawer;
