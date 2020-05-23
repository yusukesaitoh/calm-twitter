chrome.runtime.onMessage.addListener((request, sender) => {
  if ((request.from === 'content') && (request.subject === 'showPageAction')) {
    chrome.pageAction.show(sender.tab!.id!);
  }
});
