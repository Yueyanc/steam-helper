import request from "../utils/request";
import qs from "qs";
export const getPublishedFileDetails = (data: {
  itemcount: number;
  publishedfileids: string[];
  access_token?: string;
}) => {
  data.access_token = "ef608c2b8130e96f39629b06645d7721";
  return request<any, any>(
    "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
    {
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: qs.stringify(data),
    }
  );
};
export const getUserCollections = (data: {
  appid: string;
  publishedfileid?: string;
  sessionid: string;
}) => {
  return request<any, any>(
    "https://steamcommunity.com/sharedfiles/ajaxgetmycollections",
    {
      method: "post",
      data: { ...data },
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
