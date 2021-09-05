// 通过 chrome.storage 保存
function saveOptions() {
    var tgurl = document.getElementById('tgurl').value;
    //console.log(tgurl,typeof tgurl);
    chrome.storage.sync.set({
        targeturl: tgurl,
    }, () => {
        // 更新状态文本
        var status = document.getElementById('status');
        status.textContent = '已保存';
        // 隐藏状态文本
        setTimeout(() => {
            status.textContent = '';
        }, 500);
    })
}
function resetOptions() {
    chrome.storage.sync.remove('targeturl',() => {
        var status = document.getElementById('status');
        status.textContent = '已重置';
        setTimeout(() => {
            status.textContent = '';
        }, 500);
    })
}
// 加载数据
function loadOptions() {
    chrome.storage.sync.get(
        'targeturl',(items) => {
        document.getElementById('tgurl').value = (items.targeturl||"192.168.0.111");//console.log(items.targeturl,typeof items.targeturl);
    });
}
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reset').addEventListener('click', resetOptions);