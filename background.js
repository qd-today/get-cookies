chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //console.log(tab);
    //if (changeInfo.status === 'loading' && (tab.url.indexOf("在下方填写自己的平台ip地址") != -1 ||tab.url.indexOf("或者是域名地址") != -1)) {
    if (changeInfo.status === 'loading' && (tab.url.indexOf("192.168.0.229") != -1 ||tab.url.indexOf("abc.myds.me") != -1)) {
        if (!chrome.runtime.onConnect.hasListeners()) {
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "get_cookie");
                port.onMessage.addListener(function(request) {
                    console.log(request);
                    if (request.do == "get_cookie") {
                        //console.log(request);
                        var option1 = {},option2 = {},tempurl;
                        if (request.site) {
                            option1["url"] = request.site;
                            //处理成域名来查找第2次
                            tempurl=new URL(request.site);
                            option2["domain"] = tempurl.hostname;
                        }
                        console.log(option1,option2);
                        var obj = {};
                        chrome.cookies.getAll(option1, function(cookies) {
                            //console.log(cookies);
                            for (var i in cookies) {
                                var cookie = cookies[i];
                                obj[cookie.name] = cookie.value;
                            }
                        });
                        //查2次//查漏补缺，以防漏掉某些主域名cookies
                        chrome.cookies.getAll(option2, function(cookies) {
                            //console.log(cookies);
                            for (var i in cookies) {
                                var cookie = cookies[i];
                                obj[cookie.name] = cookie.value;
                            }
                            port.postMessage(obj);
                            console.log(obj);
                        });
                    }
                });
            });
        }

    }

});