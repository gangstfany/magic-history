# 发布完整网站

正式入口为仓库根目录 `index.html`，统一世界史分支为 `course/apwh`。生成后的页面已包含在仓库内，静态托管不需要安装依赖。

## GitHub Pages

1. 打开仓库 Settings → Pages。
2. Source 选择 Deploy from a branch。
3. Branch 选择 course/apwh，Folder 选择 /(root)，保存。
4. 等待部署完成，使用Pages界面显示的网址。此次代码整理未修改GitHub Pages设置。

不要将 `src/`、`previews/` 或 `docs/` 选为完整网站发布入口。根目录 `.nojekyll` 保持静态文件直接发布。

发布源文件变化前，在根目录运行 `python3 scripts/build-site.py` 并验证，然后提交生成的 `index.html` 和 `world-map.html`。协作者只需使用发布后的首页网址。

账号回调沿用现有 `auth-callback.html`，实际登录服务及回调域名仍使用项目原有配置；本次整理保留账号界面，并未更改认证权限。

GitHub官方参考：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
