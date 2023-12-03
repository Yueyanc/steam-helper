import Cookies from "js-cookie";
import TreeModel from "tree-model";
import { getUserId } from "../serives";
export function getUrlSearchParams() {
  return new URLSearchParams(window.location.search);
}
export function getRecentlyAppId() {
  const appHubs = Cookies.get("recentlyVisitedAppHubs").split(",");
  return appHubs[appHubs.length - 1];
}
export function getSessionId() {
  return Cookies.get("sessionid");
}
export function getToken() {
  return "ef608c2b8130e96f39629b06645d7721";
}
export async function getUerIdLocal() {
  let userId = getSessionStorage("userId");
  if (userId === "" || !userId) {
    const res = await getUserId();
    userId = res;
    setSessionStorage("userId", res);
  }
  return userId;
}
interface TreeNode {
  children?: TreeNode[];
  key: string;
}
export function removeTreeItem(tree: TreeNode[], key) {
  // 创建一个新的树，用于存储删除节点后的结果
  const newTree = [];
  if (!tree) return newTree;
  // 遍历原始树的每个节点
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    // 如果当前节点的 key 不等于要删除的 key，将其添加到新树中
    if (node.key !== key) {
      // 递归处理当前节点的子节点
      const children = removeTreeItem(node.children, key);

      // 创建一个新的节点，将当前节点的属性复制到新节点中
      const newNode = { ...node, children };

      // 将新节点添加到新树中
      newTree.push(newNode);
    }
  }

  // 返回新树
  return newTree;
}
export function filterTreeItem(tree: TreeNode[], keys: string[]) {
  if (!tree) return [];
  const newTree = tree.filter((item) => !keys.includes(item.key));
  newTree.forEach((item) => {
    if (!item.children) return;
    item.children = filterTreeItem(item.children, keys);
  });
  return newTree;
}

export function addTreeItem(tree: TreeNode[], key, ...items) {
  if (!tree) return;
  const newTree = [...tree];
  for (let i = 0; i < newTree.length; i++) {
    const node = newTree[i];
    if (node.key === key) {
      node.children = node.children || [];
      items.forEach((item) => {
        node.children.push(item);
      });
      return newTree;
    }
  }
  return newTree;
}
export function getTreeItem(tree: TreeNode[], key) {
  if (!tree) return;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.key === key) {
      return node;
    }
    const children = getTreeItem(node.children, key);
    if (children) {
      return children;
    }
  }
}
export function getTreeItems(tree: TreeNode[], keys: string[]) {
  const results = [];
  if (!tree) return results;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (keys.includes(node.key)) {
      results.push(node);
    }
    const children = getTreeItems(node.children, keys);
    if (children.length > 0) {
      results.push(...children);
    }
  }
  return results;
}
export function deduplicateArrayByKey(array, key = "key") {
  const deduplicatedArray = array.reduce((accumulator, current) => {
    const keyValue = current[key];
    if (!accumulator[keyValue]) {
      accumulator[keyValue] = current;
    }
    return accumulator;
  }, {});
  console.log(deduplicatedArray);

  return Object.values(deduplicatedArray);
}
export const setLocalStorage = (key: string, data: any) => {
  window.localStorage.setItem(key, JSON.stringify(data));
};
export const getLocalStorage = (key: string) => {
  const raw = window.localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
};
export const setSessionStorage = (key: string, data: any) => {
  window.sessionStorage.setItem(key, JSON.stringify(data));
};
export const getSessionStorage = (key: string) => {
  const raw = window.sessionStorage.getItem(key);
  if (raw) return JSON.parse(raw);
};
export const clearLocalStorage = (key: string[]) => {
  key.forEach((item) => {
    window.localStorage.removeItem(item);
  });
};
export const findTreeNode = (
  treeNodes: TreeModel.Model<any>[],
  key: string
) => {
  for (let index = 0; index < treeNodes.length; index++) {
    const element = treeNodes[index];
    const target = element.first((node) => node.model.key === key);
    if (target) return target;
  }
};
export * from "./parse";
