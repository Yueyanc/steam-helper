import {
  ModalForm,
  ProColumns,
  ProFormSelect,
  ProTable,
  ProFormSwitch,
} from "@ant-design/pro-components";
import {
  addItemToCollection,
  getAllUserSubscribedFiles,
  getPublishedFileDetails,
  getPublishedFileParseDetail,
  getUserCollections,
} from "../../serives";
import {
  getLocalStorage,
  getRecentlyAppId,
  getSessionId,
  setLocalStorage,
} from "../../utils";
import { useEffect, useState } from "react";
import _ from "lodash";
import { CollectionsDetail, PublishedFileDetails } from "../../types";
import {
  Button,
  Space,
  Image,
  Popconfirm,
  ConfigProvider,
  theme,
  message,
  Table,
} from "antd";
import { useReactiveUI } from "./hook";
import { StorageKey } from "../../constant";
import { Trans, useTranslation } from "react-i18next";
async function addModToCollection({
  id,
  targetId,
  subscribeDy = false,
  success,
}: {
  id: string;
  targetId: string;
  subscribeDy?: boolean;
  success?: (ids: string[]) => any;
}) {
  const sessionId = getSessionId();
  let publishedfileids = [id];
  if (subscribeDy) {
    const { requiredItems } = await getPublishedFileParseDetail({ id });
    publishedfileids = [
      ...publishedfileids,
      ...requiredItems.map((item) => item.id),
    ];
  }
  console.log(publishedfileids);

  await Promise.all(
    publishedfileids.map((id) => {
      addItemToCollection({
        publishedfileid: id,
        targetPublishedfileid: targetId,
        sessionId,
        type: "add",
      }).then((res) => {
        if (res.success === 1) {
          if (success) success(publishedfileids);
        }
      });
    })
  );
}

const AddModalForm = ({
  onFinish,
  collections,
  trigger,
}: {
  onFinish: (formData: any) => Promise<any>;
  trigger: JSX.Element;
  collections: CollectionsDetail[];
}) => {
  const sessionId = getSessionId();
  const { t, i18n } = useTranslation();
  return (
    <ModalForm
      modalProps={{ centered: true, width: 200 }}
      onFinish={onFinish}
      title={t("添加至合集")}
      trigger={trigger}
    >
      <ProFormSelect
        name="targetCollection"
        label={t("目标合集")}
        options={collections.map((item) => ({
          label: item.title,
          value: item.publishedfileid,
        }))}
      />
      <ProFormSwitch label={t("自动添加依赖项目")} name="dependenceEnable" />
    </ModalForm>
  );
};
const ModsTable: React.FC = () => {
  useReactiveUI({
    onAdd: ({ publishedfileid }) => {
      getPublishedFileDetails({
        itemcount: 1,
        publishedfileids: [publishedfileid],
      }).then((res) => {
        if (res.response.result === 1) {
          setWaitSource((pre) => [
            ...pre,
            Object.assign(res.response.publishedfiledetails[0], {
              key: new Date().getTime(),
            }),
          ]);
        }
      });
    },
  });
  const appId = getRecentlyAppId();
  const { t, i18n } = useTranslation();
  const sessionId = getSessionId();
  const [collections, setCollections] = useState<CollectionsDetail[]>([]);
  const [subscriptionSource, setSubscriptionSource] = useState<
    Partial<PublishedFileDetails>[]
  >([]);
  const [waitSource, setWaitSource] = useState<Partial<PublishedFileDetails>[]>(
    getLocalStorage(StorageKey.wait_source) ?? []
  );
  const [subscriptionVirtual, setSubscriptionVirtual] = useState(false);
  const [waitSourceVirtual, setWaitSourceVirtual] = useState(false);
  useEffect(() => {
    setLocalStorage(StorageKey.wait_source, waitSource);
  }, [waitSource]);
  function updateModSource() {
    getUserCollections({ appid: appId, sessionid: sessionId }).then((res) => {
      if (res.success === 1) {
        const collections = _.chain(res)
          .thru((res) => res.all_collections.items)
          .values()
          .filter((item) => item.consumer_appid == appId);
        setCollections(collections.value());
        const sourceParams = collections
          .map((item) =>
            item?.children?.map((_item) => ({
              publishedfileid: _item.publishedfileid,
              collectionBy: item,
              app_name: item.app_name,
            }))
          )
          .flatten()
          .compact();
        const sourceFetch = sourceParams.thru((items) =>
          getPublishedFileDetails({
            itemcount: items.length,
            publishedfileids: items.map((item) => item.publishedfileid),
          })
        );
        sourceFetch.value().then((res) => {
          if (res.response.result === 1) {
            setSubscriptionSource(
              res.response.publishedfiledetails.map((item, index) => ({
                ...item,
                ...sourceParams.value()[index],
              }))
            );
          }
        });
      }
    });
  }
  useEffect(() => {
    updateModSource();
  }, []);
  const columns: ProColumns<Partial<PublishedFileDetails>>[] = [
    {
      title: t("mod"),
      dataIndex: "title",
      fixed: "left",
    },
    {
      title: t("缩略图"),
      dataIndex: "preview_url",
      hideInSearch: true,
      width: 100,
      render: (dom, entity) => (
        <Image
          onClick={(e) => {
            e.stopPropagation();
          }}
          src={entity.preview_url}
          width={80}
        />
      ),
    },
    {
      title: t("所属合集"),
      dataIndex: ["collectionBy", "title"],
      ellipsis: true,
      width: 160,
      valueEnum: _.reduce(
        collections,
        (acc, item) => {
          const key = item.title;
          const value = { text: item.title };
          return { ...acc, [key]: value };
        },
        {}
      ),
    },
    {
      title: t("订阅量"),
      hideInSearch: true,
      dataIndex: "subscriptions",
      sorter: (a, b) => a.subscriptions - b.subscriptions,
    },
    {
      title: t("喜欢量"),
      hideInSearch: true,
      dataIndex: "favorited",
      sorter: (a, b) => a.favorited - b.favorited,
    },
    {
      title: t("浏览量"),
      hideInSearch: true,
      dataIndex: "views",
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: t("操作"),
      hideInSearch: true,
      fixed: "right",
      render: (dom, entity) => {
        return (
          <Space>
            <Popconfirm
              title={t("删除")}
              description={t("你确定要删除并且移动该mod吗") + "?"}
              onConfirm={() =>
                addItemToCollection({
                  publishedfileid: entity.publishedfileid,
                  targetPublishedfileid: entity.collectionBy.publishedfileid,
                  sessionId,
                  type: "remove",
                }).then((res) => {
                  if (res.success === 1) {
                    setSubscriptionSource((pre) =>
                      pre.filter(
                        (item) =>
                          item.publishedfileid !== entity.publishedfileid
                      )
                    );
                    setWaitSource((pre) => [
                      Object.assign(entity, { key: new Date().getTime() }),
                      ...pre,
                    ]);
                  }
                })
              }
            >
              <Button type="link">{t("删除至待订阅")}</Button>
            </Popconfirm>
            <Popconfirm
              title={t("删除")}
              description={t("你确定要删除该mod吗") + "?"}
              onConfirm={() =>
                addItemToCollection({
                  publishedfileid: entity.publishedfileid,
                  targetPublishedfileid: entity.collectionBy.publishedfileid,
                  sessionId,
                  type: "remove",
                }).then((res) => {
                  if (res.success === 1) {
                    setSubscriptionSource((pre) =>
                      pre.filter(
                        (item) =>
                          item.publishedfileid !== entity.publishedfileid
                      )
                    );
                  }
                })
              }
            >
              <Button type="link">{t("删除")}</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const waitModColumns: ProColumns<Partial<PublishedFileDetails>>[] = [
    { title: "mod", dataIndex: "title", ellipsis: true, fixed: "left" },
    {
      title: t("缩略图"),
      dataIndex: "preview_url",
      width: 100,
      hideInSearch: true,
      render: (dom, entity) => (
        <Image
          onClick={(e) => {
            e.stopPropagation();
          }}
          src={entity.preview_url}
          width={80}
        />
      ),
    },
    {
      title: t("订阅量"),
      hideInSearch: true,
      dataIndex: "subscriptions",
      sorter: (a, b) => a.subscriptions - b.subscriptions,
    },
    {
      title: t("喜欢量"),
      hideInSearch: true,
      dataIndex: "favorited",
      sorter: (a, b) => a.favorited - b.favorited,
    },
    {
      title: t("浏览量"),
      hideInSearch: true,
      dataIndex: "views",
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: t("操作"),
      hideInSearch: true,
      fixed: "right",
      render: (dom, entity) => {
        return (
          <Space>
            <Popconfirm
              title={t("删除")}
              description={t("你确定要删除该mod吗") + "?"}
              onConfirm={() => {
                setWaitSource((pre) =>
                  pre.filter((item) => item.key !== entity.key)
                );
              }}
            >
              <Button type="link">{t("删除")}</Button>
            </Popconfirm>
            <AddModalForm
              collections={collections}
              trigger={<Button type="primary">{t("添加至合集")}</Button>}
              onFinish={async (values) => {
                const { targetCollection, dependenceEnable } = values;
                await addModToCollection({
                  id: entity.publishedfileid,
                  targetId: targetCollection,
                  subscribeDy: dependenceEnable,
                  success: () => {
                    setWaitSource((pre) =>
                      pre.filter((item) => item.key !== entity.key)
                    );
                    updateModSource();
                    message.success("添加成功");
                  },
                });
                return true;
              }}
            />
          </Space>
        );
      },
    },
  ];
  return (
    <Trans>
      <div className="w-[800px]">
        <ConfigProvider
          theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
        >
          <ProTable<Partial<PublishedFileDetails>>
            key="subscriptionMod"
            pagination={{
              pageSizeOptions: [10, 20, 50, 100, 200, 500],
              onShowSizeChange: (curent, size) => {
                size > 100
                  ? setSubscriptionVirtual(true)
                  : setSubscriptionVirtual(false);
              },
            }}
            virtual={subscriptionVirtual}
            columns={columns}
            params={{ subscriptionSource }}
            rowSelection={{
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_NONE,
                Table.SELECTION_INVERT,
              ],
              alwaysShowAlert: true,
            }}
            tableAlertOptionRender={({ selectedRows }) => {
              return (
                <Space size={16}>
                  <Popconfirm
                    title={t("删除")}
                    description={t("你确定要删除该mod吗") + "?"}
                    onConfirm={() => {
                      selectedRows.forEach((row) => {
                        addItemToCollection({
                          publishedfileid: row.publishedfileid,
                          targetPublishedfileid:
                            row.collectionBy.publishedfileid,
                          sessionId,
                          type: "remove",
                        }).then((res) => {
                          if (res.success === 1) {
                            setSubscriptionSource((pre) =>
                              pre.filter(
                                (item) =>
                                  item.publishedfileid !== row.publishedfileid
                              )
                            );
                          }
                        });
                      });
                    }}
                  >
                    <Button type="link">{t("批量删除")}</Button>
                  </Popconfirm>
                </Space>
              );
            }}
            request={async (params, sort, filter) => {
              console.log(params, filter);
              const {
                current,
                pageSize,
                subscriptionSource,
                title,
                ...search
              } = params;
              let dataSource =
                subscriptionSource as Partial<PublishedFileDetails>[];
              if (title) {
                dataSource = dataSource.filter((item) =>
                  item.title.includes(title)
                );
              }
              if (search) {
                dataSource = _.filter(
                  dataSource,
                  search
                ) as Partial<PublishedFileDetails>[];
              }
              return {
                data: dataSource,
                success: true,
                total: dataSource.length,
              };
            }}
            rowKey={(item) =>
              `${item.publishedfileid}-${item.collectionBy.publishedfileid}`
            }
            scroll={{ y: 300, x: 1000 }}
          />
          <div className="mt-4 text-white text-lg">{t("待订阅mods")}:</div>
          <ProTable<Partial<PublishedFileDetails>>
            key="waitMod"
            columns={waitModColumns}
            pagination={{
              pageSizeOptions: [10, 20, 50, 100, 200],
              onShowSizeChange: (curent, size) => {
                size > 100
                  ? setWaitSourceVirtual(true)
                  : setWaitSourceVirtual(false);
              },
            }}
            rowSelection={{
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_NONE,
                Table.SELECTION_INVERT,
              ],
              alwaysShowAlert: true,
            }}
            tableAlertOptionRender={({ selectedRows }) => {
              return (
                <Space size={16}>
                  <Popconfirm
                    title={t("删除")}
                    description={t("你确定要删除该mod吗") + "?"}
                    onConfirm={() => {
                      setWaitSource((pre) =>
                        pre.filter(
                          (item) =>
                            !selectedRows
                              .map((row) => row.key)
                              .includes(item.key)
                        )
                      );
                    }}
                  >
                    <Button type="link">{t("批量删除")}</Button>
                  </Popconfirm>
                  <AddModalForm
                    collections={collections}
                    trigger={
                      <Button type="primary">{t("批量添加至合集")}</Button>
                    }
                    onFinish={async (values) => {
                      const { targetCollection, dependenceEnable } = values;
                      await Promise.all(
                        selectedRows.map((row) =>
                          addModToCollection({
                            id: row.publishedfileid,
                            targetId: targetCollection,
                            subscribeDy: dependenceEnable,
                            success: () => {
                              setWaitSource((pre) =>
                                pre.filter((item) => item.key !== row.key)
                              );
                            },
                          })
                        )
                      );
                      updateModSource();
                      message.success("添加成功");
                      return true;
                    }}
                  />
                </Space>
              );
            }}
            params={{ waitSource }}
            request={async (params, sort, filter) => {
              const { current, pageSize, waitSource, title, ...search } =
                params;
              let dataSource = waitSource as Partial<PublishedFileDetails>[];
              if (title) {
                dataSource = dataSource.filter((item) =>
                  item.title.includes(title)
                );
              }
              if (search) {
                dataSource = _.filter(
                  dataSource,
                  search
                ) as Partial<PublishedFileDetails>[];
              }
              return {
                data: dataSource,
                total: dataSource.length,
                success: true,
              };
            }}
            rowKey="key"
            virtual={waitSourceVirtual}
            scroll={{ y: 300, x: 1000 }}
            toolBarRender={() => [
              <Button
                key="1"
                onClick={() => {
                  getAllUserSubscribedFiles({
                    appId,
                    onProgress: ({ total, current, items }) => {
                      getPublishedFileDetails({
                        itemcount: items.length,
                        publishedfileids: items.map((item) => item.key),
                      }).then((res) => {
                        if (res.response.result === 1) {
                          setWaitSource((pre) => [
                            ...pre,
                            ...res.response.publishedfiledetails.map(
                              (item, index) => ({
                                key: item.publishedfileid + index,
                                ...item,
                              })
                            ),
                          ]);
                        }
                      });
                    },
                  });
                }}
              >
                {t("一键导入已订阅")}
              </Button>,
            ]}
          />
        </ConfigProvider>
      </div>
    </Trans>
  );
};
export default ModsTable;
