function onload(func) {
    if (document.readyState === "complete") {
        func();
    } else {
        window.addEventListener('load', func);
    }
}

onload(function() {
    console.log("getcookieload");
    document.body.setAttribute("get-cookie", "true");
    window.postMessage({"info":"get-cookieModReady"}, "*");//预传递，在签到平台登录主页时自动填入info信息
    window.addEventListener('click', function(event) {
        var export_btn = event.target;
        var port = chrome.runtime.connect({name: "get_cookie"});
        if (export_btn.getAttribute("data-toggle") == "get-cookie") {
            var site = export_btn.getAttribute("data-site");
            var name = export_btn.getAttribute("data-name");
            var domain = export_btn.getAttribute("data-domain");
            var callback = export_btn.getAttribute("data-callback");
            port.postMessage({"do": "get_cookie", "site": site, "name": name, "domain": domain});
            port.onMessage.addListener(function(msg) {
                if (window.confirm('你确定要此网站获取你' + site + '的Cookies么？')) {
                    export_btn.setAttribute("data-cookie", JSON.stringify(msg));
                    //console.log(msg);
                    window.postMessage(msg, "*");//传递给页面消息，让网页填上cookies数据
                } else {
                    return false;
                }

            });
        }

    }, false);

});
