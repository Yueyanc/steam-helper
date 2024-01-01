import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { setLocalStorage } from "./utils";

const lang = navigator.language.substring(0, 2);
console.log(lang);
setLocalStorage("i18nextLng", lang);
const resources = {
  en: {
    translation: {
      添加至合集: "Add to Collection",
      目标合集: "Target Collection",
      mod: "Mod",
      缩略图: "Thumbnail",
      所属合集: "Belongs to Collection",
      订阅量: "Subscriptions",
      操作: "Actions",
      删除: "Delete",
      确定要删除并移动该模组吗: "Delete and move this mod",
      删除至待订阅: "Delete to Subscriptions",
      确定要删除该模组吗: "Delete this mod",
      待订阅mods: "Subscribed Mods",
      批量删除: "Batch Delete",
      批量添加至合集: "Batch Add to Collection",
      一键导入已订阅: "Import Subscriptions",
    },
  },
  zh: {
    translation: {
      添加至合集: "添加至合集",
      目标合集: "目标合集",
      mod: "mod",
      缩略图: "缩略图",
      所属合集: "所属合集",
      订阅量: "订阅量",
      操作: "操作",
      删除: "删除",
      确定要删除并移动该模组吗: "确定要删除并移动该模组吗",
      删除至待订阅: "删除至待订阅",
      确定要删除该模组吗: "确定要删除该模组吗",
      待订阅mods: "待订阅mods",
      批量删除: "批量删除",
      批量添加至合集: "批量添加至合集",
      一键导入已订阅: "一键导入已订阅",
    },
  },
};
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
