chrome.runtime.onInstalled.addListener((details) => {
    console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url!.includes('https://twitter.com/')) {
        chrome.pageAction.show(tabId);
    }
});