# Get-Cookies 插件

一键获取 Cookies 的 Chrome 扩展, 用于配合 QD 框架使用

QD 框架: <https://github.com/qd-today/qd>

Docker 容器: <https://hub.docker.com/r/qdtoday/qd>

## 使用方式

1. 项目代码完整打包下载，使用 Chrome浏览器 -> `扩展` -> `加载已解压的扩展程序` 来使用;

2. 前往 [Releases](https://github.com/qd-today/get-cookies/releases/latest) 下载安装打包好的 `.crx` 文件.

    > 因未上传 Chrome 扩展商店, 仍然无法直接使用, 需要将 `.crx` 扩展名改为 `.zip` 后解压、同上使用.

> 注意: 使用前请进入 Chrome 扩展详情, 打开 `扩展程序选项`, 根据提示填入 QD 框架对应 `ip或域名` 信息.

## Tips

插件目前无法获取在**隐私模式**下访问的网站的 Cookies, (理论上可以, 但个人没有精力实现)

但是, 可以使用 Chrome 的 **多用户模式** 来达到隐私模式一样的效果。

> 只需要新建一个用户，重新安装本插件（无非是重新导入文件夹一次），在这个用户下同时访问签到平台和需要隐私访问的网站
>
> 同时在该用户的chrome设置里-隐私设置和安全性-cookie及其他网站数据-关闭所有窗口时清除cookie及网站数据 处打勾即可。

## 更新内容

- ### v2.0.0

    针对 Chrome 强制推进的 **Manifest V3** 标准进行了代码的整体迁移和更新, 未有功能上的改进。

    目前在新版浏览器上应该能正常运作。

    > 只部分测试了功能上的正常，未广泛进行兼容性测试，有bug欢迎提交issue

- ### v1.0.3

    小改进: 同时增加对旧版平台 BUG 的兼容 (编辑测试界面无法获取cookie, 新版 QD 框架已修正)

- ### v1.0.0

    修改匹配及注入方式，添加设定选项方便自行添加需要启用的网站

## 鸣谢

- [ckx000](https://github.com/ckx000)
- [acgotaku(原作者)](https://github.com/acgotaku/GetCookies)
