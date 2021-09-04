var button = function() {
    var cookie_btn = $("<span>").attr("data-callback", "eval").addClass("icon-btn-device").css({float:"none"}).attr("data-cookie", " ").attr("data-domain", ".baidu.com").attr("data-site", "http://pan.baidu.com/").attr("data-toggle", "get-cookie").text("点击获取");
    $(".icon-btn-device").after(cookie_btn);
    console.log("load JS");
    window.addEventListener("message", receiveMessage, false);

		function receiveMessage(event)
		{
			if (event.origin == window.location.origin){
				console.log(event.data);
			}
		}
};

var script = document.createElement('script');
script.id = "button_script";
script.appendChild(document.createTextNode('(' + button + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);

