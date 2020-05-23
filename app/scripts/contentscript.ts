toggleClass(["isExploreHidden", "isTrendsHidden", "isReactionNumberHidden", "showCalmText"]);
addCalmTitle();
setTimeout(changeCalmColor, 50);

function toggleClass(keys: string[]) {
            if (typeof data[key] === "undefined") {
                data[key] = true;
            }
  chrome.storage.local.get(keys, function (data) {
    keys.forEach(key => {
      let body = document.getElementsByTagName('body')[0];
      if (data[key]) {
        body.classList.add(key);
      } else {
        body.classList.remove(key);
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  toggleClass([request.key]);
});

chrome.runtime.sendMessage({ from: 'content', subject: 'showPageAction' });

function addCalmTitle() {
  let calmText = chrome.i18n.getMessage("textCalm");
  let css = "body.showCalmText header[role=\"banner\"] h1[role=\"heading\"]::after { content:\"" + calmText + "\";}";
  let head = document.head || document.getElementsByTagName('head')[0];
  let style = document.createElement('style');
  head.appendChild(style);
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
}

function changeCalmColor() {
  let body = document.body || document.getElementsByTagName('body')[0];
  if (body.style.backgroundColor !== 'rgb(255, 255, 255)') {
    let css = "body.showCalmText header[role=\"banner\"] h1[role=\"heading\"]::after { color: rgb(255, 255, 255);}";
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
  }
}
