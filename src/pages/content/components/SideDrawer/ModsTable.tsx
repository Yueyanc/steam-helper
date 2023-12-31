import { ProColumns, ProTable } from "@ant-design/pro-components";
import {
  addItemToCollection,
  getPublishedFileDetails,
  getUserCollections,
} from "../../serives";
import { getRecentlyAppId, getSessionId } from "../../utils";
import { useEffect, useState } from "react";
import _ from "lodash";
import { CollectionsDetail, PublishedFileDetails } from "../../types";
import { Button, Space, Image, Popconfirm, ConfigProvider, theme } from "antd";

const ModsTable: React.FC = () => {
  const appId = getRecentlyAppId();
  const sessionId = getSessionId();
  const [collections, setCollections] = useState<CollectionsDetail[]>([]);
  const [subscriptionSource, setSubscriptionSource] = useState<
    Partial<PublishedFileDetails>[]
  >([]);
  useEffect(() => {
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
  }, []);
  const columns: ProColumns<Partial<PublishedFileDetails>>[] = [
    { title: "mod名字", dataIndex: "title", ellipsis: true },
    {
      title: "缩略图",
      dataIndex: "preview_url",
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
      title: "所属合集",
      dataIndex: ["collectionBy", "title"],
      ellipsis: true,
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
      title: "操作",
      hideInSearch: true,
      dataIndex: "title",
      render: (dom, entity) => {
        return (
          <Space>
            <Popconfirm
              title="删除"
              description="你确定要删除该mod吗?"
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
              <Button type="link">删除</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <div className="w-[800px]">
      <ConfigProvider
        theme={{ algorithm: [theme.darkAlgorithm, theme.compactAlgorithm] }}
      >
        <ProTable<Partial<PublishedFileDetails>>
          columns={columns}
          params={{ subscriptionSource }}
          rowSelection={{
            alwaysShowAlert: true,
          }}
          tableAlertOptionRender={({ selectedRows }) => {
            return (
              <Space size={16}>
                <Popconfirm
                  title="删除"
                  description="你确定要删除该mod吗?"
                  onConfirm={() => {
                    selectedRows.forEach((row) => {
                      addItemToCollection({
                        publishedfileid: row.publishedfileid,
                        targetPublishedfileid: row.collectionBy.publishedfileid,
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
                  <Button type="link">批量删除</Button>
                </Popconfirm>
                <Button type="link">导出数据</Button>
              </Space>
            );
          }}
          request={async (params, sort, filter) => {
            console.log(params, filter);
            const { current, pageSize, subscriptionSource, ...search } = params;
            let dataSource = subscriptionSource;
            if (search) {
              dataSource = _.filter(
                subscriptionSource,
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
          scroll={{ y: 300 }}
        />
      </ConfigProvider>
    </div>
  );
};
export default ModsTable;
