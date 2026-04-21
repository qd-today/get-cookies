// Firefox/Chrome API compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
    var chrome = browser;
}

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
    }
});
//全局注册监听
chrome.runtime.onConnect.addListener((port) => {
  handlePort(port);
});
function handlePort(port) {
    console.assert(port.name == "get_cookie");
    console.log("onMessageAddListener:",port);
    port.onMessage.addListener(function(request) {
        console.log(request);
        if (request.do == "get_cookie") {
            var option1 = {},option2 = {},tempurl;
            if (request.site) {
                option1["url"] = request.site;
                //处理成域名来查找第2次
                tempurl=new URL(request.site);
                option2["domain"] = tempurl.hostname;
            }
            console.log(option1,option2);
            const obj = {};
            const getCookies = (options) => new Promise(resolve => {
                chrome.cookies.getAll(options, resolve);
            });
            Promise.all([getCookies(option1), getCookies(option2)])
                .then(([cookies1, cookies2]) => {
                    const processCookie = cookie => obj[cookie.name] = cookie.value;
                    cookies1.forEach(processCookie);
                    cookies2.forEach(processCookie);
                    const result = Object.keys(obj).length === 0 
                        ? { error: "cookies值为空，请检查是否已登陆" }
                        : obj;
                    port.postMessage(result);
                    console.log(result);
                })
                .catch(error => {
                    console.error('Cookie获取失败:', error);
                    port.postMessage({ error: "获取cookies时发生错误" });
                });
        }
    });
};
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {//tab页面刷新注入脚本
    if (changeInfo.status === 'loading' && urlcheck(tab.url)) {
        console.log("tab:",tab);
        chrome.scripting.executeScript({target: {tabId: tab.id},files: ["js/cookie.js"]});
    }
});