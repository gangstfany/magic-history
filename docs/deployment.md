# 部署模块化完整网站

静态站点根入口是 `index.html`。部署整个仓库根目录，同时保留课程入口与全部依赖资源。公共首页会嵌入 `apwh.html`、`apush-map.html` 和 `art-history-map.html`；仅上传首页不能运行课程。

本次候选版本在 `feature/modular-site-shell`，尚未自动合并到其他分支，也没有变更现有托管平台的部署设置。原 `course/apwh` 的已发布内容不受候选分支影响。

提交源文件修改前运行：

```sh
python3 scripts/build-site.py
```

提交生成的 `index.html`、`apwh.html`、`world-map.html` 以及关联的源码和资源。公共壳单独构建命令为 `python3 scripts/build-shell.py`，世界史单独构建为 `python3 src/apwh/build.py`。

既有静态托管可以使用同一个发布目录。若使用 GitHub Pages，在 Settings → Pages 中选择实际要发布的已验证分支与根目录；不要选择 `src/`、`docs/` 或历史预览目录。此次没有操作 Pages 设置。

课程在同一站点内嵌入，桥接消息验证同源。后续若改为跨域托管，需要单独设计允许的课程来源与认证边界，不能直接放开消息校验。

账号继续使用 `auth-callback.html` 与现有 Supabase 配置。实际部署域名必须在账号服务中允许回调；本次不修改认证权限或替用户执行真实注册、邮件验证。

将代码推送到分支与发布网站是不同操作。协作者本地查看时，拉取候选分支后启动 HTTP 服务，访问根目录即可。
