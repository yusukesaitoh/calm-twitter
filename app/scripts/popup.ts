import {
  DEFAULT_SETTINGS,
  SettingKey,
  SECTION_STATES,
  SectionStateKey,
} from "./constants";

// 初期化処理
document.addEventListener("DOMContentLoaded", async () => {
  localize();
  await initValues(Object.keys(DEFAULT_SETTINGS));
  await restoreSectionStates();
});

// htmlのローカライズ
function localize() {
  const htmlContent = document.documentElement.innerHTML;
  const localizedContent = htmlContent.replace(
    /__MSG_(\w+)__/g,
    (_, key) => chrome.i18n.getMessage(key) || ""
  );
  if (htmlContent !== localizedContent) {
    document.documentElement.innerHTML = localizedContent;
  }
}

// storageの更新と通知
async function updateStorageAndNotify(updates: Record<string, boolean>) {
  await new Promise<void>((resolve) =>
    chrome.storage.local.set(updates, resolve)
  );

  const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, resolve)
  );

  // タブIDが存在する場合のみメッセージを送信
  const tabId = tabs[0]?.id;
  if (typeof tabId === "number") {
    const message = {
      type: "UPDATE_SETTINGS",
      settings: updates,
    };

    await new Promise<void>((resolve) =>
      chrome.tabs.sendMessage(tabId, message, resolve)
    );
  }
}

// クリックイベントの登録
function addClickEventListeners(keys: string[]) {
  // 個別のチェックボックスのイベント
  keys.forEach((key) => {
    const input = document.getElementById(key);
    input?.addEventListener("click", async (event) => {
      const checkbox = event.target as HTMLInputElement;
      await updateStorageAndNotify({ [key]: checkbox.checked });
      updateParentSection(checkbox);
    });
  });

  // セクションヘッダーのイベント
  document.querySelectorAll(".section-header").forEach((header) => {
    header.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest(".toggle-all")) {
        toggleSection(header as HTMLElement);
      }
    });
  });

  // 一括選択チェックボックスのイベント
  document
    .querySelectorAll('.toggle-all input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", async function () {
        const section = this?.closest(".section");
        if (!section) return;
        const sectionName = getSectionName(section);
        if (sectionName) {
          await toggleAllInSection(this as HTMLInputElement, sectionName);
        }
      });
    });
}

// デフォルト値の判定を行い、チェックボックスの状態を更新
function toggleChecked(keys: string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (data) => {
      keys.forEach((key) => {
        const value = data[key] ?? DEFAULT_SETTINGS[key as SettingKey];
        const input = document.getElementById(key) as HTMLInputElement | null;
        if (input) input.checked = value;
      });
      resolve();
    });
  });
}

// 値の初期化
async function initValues(keys: string[]) {
  addClickEventListeners(keys);
  await toggleChecked(keys);
  document.querySelectorAll(".section").forEach((section) => {
    const sectionName = getSectionName(section);
    if (sectionName) {
      updateSectionToggle(sectionName);
    }
  });
}

// セクションの開閉
async function toggleSection(header: HTMLElement): Promise<void> {
  if (!header.classList.contains("toggle-all")) {
    header.classList.toggle("open");
    const section = header.nextElementSibling as HTMLElement;
    if (section) {
      section.classList.toggle("open");

      // セクション名を取得してストレージに保存
      const parentSection = header?.closest(".section");
      if (!parentSection) return;
      const sectionName = getSectionName(parentSection);
      if (sectionName) {
        const stateKey = `openSection${sectionName
          .charAt(0)
          .toUpperCase()}${sectionName.slice(1)}`;
        await chrome.storage.local.set({
          [stateKey]: section.classList.contains("open"),
        });
      }
    }
  }
}

// アコーディオンの状態を復元
async function restoreSectionStates(): Promise<void> {
  const sectionKeys = Object.keys(SECTION_STATES);
  const states = await chrome.storage.local.get(sectionKeys);

  document.querySelectorAll(".section").forEach((section) => {
    const sectionName = getSectionName(section);
    if (sectionName) {
      const stateKey = `openSection${sectionName
        .charAt(0)
        .toUpperCase()}${sectionName.slice(1)}`;
      const isOpen =
        states[stateKey] ?? SECTION_STATES[stateKey as SectionStateKey];
      const header = section.querySelector(".section-header");
      const content = section.querySelector(".feature-section");

      if (header && content) {
        if (isOpen) {
          header.classList.add("open");
          content.classList.add("open");
        } else {
          header.classList.remove("open");
          content.classList.remove("open");
        }
      }
    }
  });
}

// 一括選択チェックボックスの状態を更新
async function toggleAllInSection(
  toggleCheckbox: HTMLInputElement,
  sectionClass: string
): Promise<void> {
  const section = document.querySelector(
    `.section-${sectionClass} .feature-section`
  );
  if (!section) return;

  const checkboxes = section.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]'
  );
  const updates: Record<string, boolean> = {};

  checkboxes.forEach((checkbox) => {
    checkbox.checked = toggleCheckbox.checked;
    updates[checkbox.id] = checkbox.checked;
  });

  await updateStorageAndNotify(updates);
  toggleCheckbox.indeterminate = false;
}

// セクション名を取得
function getSectionName(section: Element | null): string | undefined {
  return section?.classList
    .toString()
    .split(" ")
    .find((cls) => cls.startsWith("section-"))
    ?.replace("section-", "");
}

// 親セクションの状態を更新
function updateParentSection(checkbox: HTMLInputElement): void {
  const section = checkbox.closest(".section");
  const sectionName = getSectionName(section);
  if (sectionName) {
    updateSectionToggle(sectionName);
  }
}

// セクションの一括チェックボックスの状態を更新
function updateSectionToggle(sectionName: string): void {
  const section = document.querySelector(`.section-${sectionName}`);
  if (!section) return;

  const checkboxes = section.querySelectorAll<HTMLInputElement>(
    '.feature-section input[type="checkbox"]'
  );
  const toggleCheckbox = section.querySelector<HTMLInputElement>(
    '.toggle-all input[type="checkbox"]'
  );

  if (!toggleCheckbox || checkboxes.length === 0) return;

  const checkedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;
  toggleCheckbox.checked = checkedCount === checkboxes.length;
  toggleCheckbox.indeterminate =
    checkedCount > 0 && checkedCount < checkboxes.length;
}
