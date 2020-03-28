localize();
initValues(["isExploreHidden", "isTrendsHidden", "isReactionNumberHidden", "showCalmText"]);

function localize() {
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

function addClickEventListeners(keys: string[]) {
    keys.forEach(key => {
        var input = document.getElementById(key);
        input!.addEventListener('click', function(event) {
            var checkbox = event.target as HTMLInputElement;
            chrome.storage.local.set({[key] : checkbox!.checked}, function () {});

            chrome.tabs.query( {active: true, currentWindow: true}, function(tabs){
                let tabId = tabs[0].id;
                chrome.tabs.sendMessage(tabId!, {key: key}, function(){});
            });
        }, false);
    });
}

function toggleChecked(keys: string[]) {
    chrome.storage.local.get(keys, function(data) {
        keys.forEach(key => {
            console.log(key + ": " + data[key]);
            if (typeof data[key] === "undefined") {
                data[key] = true;
            }
            var input = document.getElementById(key) as HTMLInputElement;
            input!.checked = data[key];
        });
    });
}

function initValues(keys: string[]) {
    toggleChecked(keys);
    addClickEventListeners(keys);
}