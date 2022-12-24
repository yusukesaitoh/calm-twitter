chrome.runtime.onStartup.addListener(function () {
  chrome.action.disable();
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if ((request.from === 'content') && (request.subject === 'showPageAction')) {
    chrome.action.enable(sender.tab!.id!);
  }
});