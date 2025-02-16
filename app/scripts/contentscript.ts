import { DEFAULT_SETTINGS, SettingKey } from "./constants";

type MessageType =
  | {
      type: "UPDATE_SETTINGS";
      settings: Record<string, boolean>;
    }
  | {
      type: "OTHER_ACTION";
      data: unknown;
    };

// 初期化
initializeSettings();
setupCalmText();

// 設定の初期化
async function initializeSettings() {
  const keys = Object.keys(DEFAULT_SETTINGS) as SettingKey[];
  const data = await getStorageValues(keys);
  applySettings(data);
}

// ストレージから設定値を取得
function getStorageValues(
  keys: SettingKey[]
): Promise<Record<SettingKey, boolean>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (data) => {
      const settings = keys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: data[key] ?? DEFAULT_SETTINGS[key],
        }),
        {} as Record<SettingKey, boolean>
      );
      resolve(settings);
    });
  });
}

// 設定の適用
function applySettings(settings: Record<SettingKey, boolean>) {
  const body = document.body;
  Object.entries(settings).forEach(([key, enabled]) => {
    body.classList.toggle(key, enabled);
  });
}

// メッセージリスナー
chrome.runtime.onMessage.addListener(
  (request: MessageType, sender, sendResponse) => {
    if (request.type === "UPDATE_SETTINGS") {
      const settingEntries = Object.entries(request.settings);
      for (const [key, value] of settingEntries) {
        if (Object.keys(DEFAULT_SETTINGS).includes(key)) {
          document.body.classList.toggle(key, value);
        }
      }
    }
    sendResponse({ success: true });
  }
);

// 拡張機能のアクティブ化通知
chrome.runtime.sendMessage({ from: "content", subject: "showPageAction" });

// Calm Text機能
function setupCalmText() {
  addCalmText();
  setTimeout(updateCalmTextColor, 250);
}

function addCalmText() {
  const calmText = chrome.i18n.getMessage("textCalm");
  if (!calmText) return;

  addStyle(`
    body.showCalmText header[role="banner"] h1[role="heading"]::after {
      content: "${calmText}";
    }
  `);
}

function updateCalmTextColor() {
  const logo = document.querySelector<HTMLElement>(
    'header[role="banner"] h1[role="heading"] > a svg'
  );
  if (!logo) return;

  const color = window.getComputedStyle(logo).color;
  if (!color) return;

  addStyle(`
    body.showCalmText header[role="banner"] h1[role="heading"]::after {
      color: ${color};
    }
  `);
}

// ユーティリティ関数
function addStyle(css: string) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.textContent = css;
  document.head.appendChild(style);
}
