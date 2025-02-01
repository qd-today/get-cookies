var listurlarr,format=function(a){
    var b = (a||"192.168.0.111");
    listurlarr=b.split(/[\s\n]/);
    console.log("init",listurlarr);
},urlcheck=function(a){
    for(var l in listurlarr){
        if(a && a.indexOf(listurlarr[l])>=0){
            console.log(true);
            return true
        }
    }
    return false
};
chrome.storage.sync.get('targeturl',function (a){
    format(a.targeturl);
});
chrome.storage.onChanged.addListener(function(changes, areaName){
    if(changes.hasOwnProperty("targeturl")){
        format(changes.targeturl.newValue);
        //console.log("true");
    }
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {//tab页面刷新事件
    //console.log(tab);
    if (changeInfo.status === 'loading' && urlcheck(tab.url)) {
        console.log("tab:",tab);
        chrome.scripting.executeScript({target: {tabId: tab.id},files: ["js/cookie.js"]});
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
                            if(Object.keys(obj).length == 0){
                                obj={"error":"cookies值为空,清检查是否已登陆"};
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