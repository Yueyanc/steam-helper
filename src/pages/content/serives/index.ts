import { parse } from "path";
import {
  getUerIdLocal,
  parseModDetailDocument,
  parseSubscribedFilesDocument,
} from "../utils";
import request from "../utils/request";
import qs from "qs";
import {
  GetCollectionsResponse,
  GetPublishedFileDetailsResponse,
} from "../types";

export const getPublishedFileDetails = (data: {
  itemcount: number;
  publishedfileids: string[];
  access_token?: string;
}) => {
  return request<any, GetPublishedFileDetailsResponse>(
    "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
    {
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
    }
  );
};
export const getPublishedFileParseDetail = ({ id }: { id: string }) => {
  return request<any, string>(
    `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`
  ).then((res) => {
    return parseModDetailDocument(res);
  });
};

export const getUserId = () => {
  return request<any, any>("https://steamcommunity.com/", {
    method: "get",
  }).then((res) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = res;
    const id = tempDiv
      .querySelector("#global_action_menu .popup_body.popup_menu a")
      .getAttribute("href");
    const chunks = id.split("/");
    return chunks[chunks.length - 2];
  });
};
interface GetUserSubscribedFilesParams {
  appId: string;
  page: number;
  numperpage: number;
}
export const getUserSubscribedFiles = async ({
  appId,
  page,
  numperpage,
}: GetUserSubscribedFilesParams) => {
  const userId = await getUerIdLocal();

  return request<any, any>(
    `https://steamcommunity.com/profiles/${userId}/myworkshopfiles/?appid=${appId}&browsefilter=mysubscriptions&p=${page}&numperpage=${numperpage}`,
    {
      method: "get",
    }
  ).then((res) => {
    return parseSubscribedFilesDocument(res);
  });
};
export const getAllUserSubscribedFiles = async ({
  appId,
  onProgress,
}: {
  appId: string;
  onProgress?: (params: {
    total: number;
    current: number;
    items: any[];
  }) => void;
}) => {
  let limit = 1;
  const result = [];
  for (let i = 1; i <= limit; i++) {
    const res = await getUserSubscribedFiles({
      appId: appId,
      page: i,
      numperpage: 30,
    });
    limit = Math.ceil(Number(res.total) / 30);
    onProgress({ total: Number(res.total), current: i * 30, items: res.items });
    result.push(...res.items);
  }
  return result;
};
export const getUserCollections = (data: {
  appid: string;
  publishedfileid?: string;
  sessionid: string;
}) => {
  return request<any, GetCollectionsResponse>(
    "https://steamcommunity.com/sharedfiles/ajaxgetmycollections",
    {
      method: "post",
      data,
    }
  );
};
// 添加物品到集合
export const addItemToCollection = (rawData: {
  publishedfileid: string;
  targetPublishedfileid: string;
  sessionId: string;
  type: "add" | "remove";
  title?: string;
}) => {
  const { publishedfileid, targetPublishedfileid, sessionId, type, title } =
    rawData;
  const data = {
    sessionID: sessionId,
    publishedfileid,
  };
  data[`collections[${targetPublishedfileid}][${type}]`] = true;
  data[`collections[${targetPublishedfileid}][title]`] = title;
  return request<any, any>(
    "https://steamcommunity.com/sharedfiles/ajaxaddtocollections",
    {
      method: "post",
      data: qs.stringify(data),
    }
  );
};
export const setItemAccepted = (id: string, sessionid: string) => {
  // 将物品设置为已接受状态
  request("https://steamcommunity.com/sharedfiles/setaccepted", {
    method: "post",
    data: {
      id,
      sessionid,
    },
  });
};

export const setItemPending = (id: string, sessionid: string) => {
  // 将物品设置为待处理状态
  request("https://steamcommunity.com/sharedfiles/setpending", {
    method: "post",
    data: {
      id,
      sessionid,
    },
  });
};

export const voteUpItem = (id: string, sessionid: string) => {
  // 对物品进行投票，表示赞同
  request("https://steamcommunity.com/sharedfiles/voteup", {
    method: "post",
    data: {
      id,
      sessionid,
    },
  });
};

export const voteDownItem = (id: string, sessionid: string) => {
  // 对物品进行投票，表示反对
  request("https://steamcommunity.com/sharedfiles/votedown", {
    method: "post",
    data: {
      id,
      sessionid,
    },
  });
};

export const reportItem = (
  id: string,
  description: string,
  sessionid: string
) => {
  // 举报物品
  request("https://steamcommunity.com/sharedfiles/reportitem", {
    method: "post",
    data: {
      id,
      description,
      sessionid,
    },
  });
};

export const subscribeItem = (id: string, appid: string, sessionid: string) => {
  // 订阅物品
  request("https://steamcommunity.com/sharedfiles/subscribe", {
    method: "post",
    data: {
      id,
      appid,
      sessionid,
    },
  });
};

export const unsubscribeItem = (
  id: string,
  appid: string,
  sessionid: string
) => {
  // 取消订阅物品
  request("https://steamcommunity.com/sharedfiles/unsubscribe", {
    method: "post",
    data: {
      id,
      appid,
      sessionid,
    },
  });
};

export const SubscribeItem = (id, appID) => {
  // URL: https://steamcommunity.com/sharedfiles/subscribe
  // 作用: 订阅物品
  // 参数:
  // - id: 物品ID
  // - appID: 应用程序ID
};

export const FavoriteItem = () => {
  // URL: https://steamcommunity.com/sharedfiles/favorite
  // 作用: 收藏物品
  // 参数:
  // - 无
};

export const FollowItem = (item_id, app_id) => {
  // URL: https://steamcommunity.com/sharedfiles/followitem
  // 作用: 关注物品
  // 参数:
  // - item_id: 物品ID
  // - app_id: 应用程序ID
};

export const SubscribeCollectionItem = (id, appID) => {
  // URL: https://steamcommunity.com/sharedfiles/subscribe
  // 作用: 订阅合集物品
  // 参数:
  // - id: 物品ID
  // - appID: 应用程序ID
};

export const RemoveTaggedUser = (publishedfileid, accountid) => {
  // URL: https://steamcommunity.com/sharedfiles/removetaggeduser
  // 作用: 从截图中移除标记的用户
  // 参数:
  // - publishedfileid: 物品ID
  // - accountid: 用户帐户ID
};

export const ResendItemSubmissionVerificationEmail = (publishedfileid) => {
  // URL: https://steamcommunity.com/sharedfiles/ajaxresendverificationemail
  // 作用: 重新发送物品提交验证电子邮件
  // 参数:
  // - publishedfileid: 物品ID
};

export const SelectItemVisibility = (publishedfileid, value) => {
  // URL: https://steamcommunity.com/sharedfiles/itemsetvisibility
  // 作用: 设置物品可见性
  // 参数:
  // - publishedfileid: 物品ID
  // - value: 可见性值
};
