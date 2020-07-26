toggleClass(["isExploreHidden", "isTrendsHidden", "isReactionNumberHidden", "showCalmText", "isRetweetsAndFavsHidden", "isFollowingNumberHidden", "isFollowerNumberHidden", "isReactionNumberAlwaysHidden"]);
addCalmTitle();
for (let i = 0; i < 2; i++) {
	setTimeout(changeCalmColor, (i + 1)*100);
}

function toggleClass(keys: string[]) {
  chrome.storage.local.get(keys, function (data) {
    keys.forEach(key => {
      if (key === "isFollowingNumberHidden" || key === "isFollowerNumberHidden") {
        if (typeof data[key] === "undefined") {
          data[key] = false;
        }
      } else {
        if (typeof data[key] === "undefined") {
          data[key] = true;
        }
      }
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
  if (body.style.backgroundColor !== null) {
    const logo = (<HTMLElement>document.querySelector('header[role="banner"] h1[role="heading"] > a svg'));
    if (logo !== null) {
      let css = "body.showCalmText header[role=\"banner\"] h1[role=\"heading\"]::after { color: " + window.getComputedStyle(logo).color + ";}";
      let head = document.head || document.getElementsByTagName('head')[0];
      let style = document.createElement('style');
      head.appendChild(style);
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
    }
  }
}
