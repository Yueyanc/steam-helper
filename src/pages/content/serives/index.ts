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
  SubscribedFilesDocumentParseResult,
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
    items: SubscribedFilesDocumentParseResult["items"];
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
  sessionId?: string;
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

// prices

export function getPricesDetail() {
  // return request<any, any>(
  //   "https://api.isthereanydeal.com/v01/game/overview/",
  //   {}
  // );
}
