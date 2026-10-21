# Magic History：账号服务配置

## 当前边界

这一阶段提供邮箱注册／登录、找回密码、Google 登录和退出登录的可配置接入，不包含支付或付费内容访问保护。当前完整开发版仍可浏览全部世界史与艺术史内容。账号界面不代表 U3–U9 已受到服务端保护；正式收费前必须单独迁移公开付费数据并实施服务端授权。

Supabase 项目、Google Cloud 项目与发信账号由 Tiffany 持有。不要把账号密码、service_role／secret key、Google client secret 或 SMTP 密码发送到聊天、写入 HTML 或提交 GitHub。客户端只使用项目 URL 和 publishable key。

## 1．创建测试项目

1. 在 https://supabase.com/dashboard 使用自己的账号创建独立测试项目，项目地区按实际选项选择。项目创建及可能产生的费用由本人确认；本功能不会代为创建。
2. 在项目设置或 Connect 面板找到 Project URL 与 publishable key。不要复制 Secret key、service_role key 或数据库密码。
3. 编辑 `assets/auth/auth-config.mjs` 的公开配置：

```js
export const AUTH_CONFIG = Object.freeze({
  supabaseUrl: 'https://你的项目标识.supabase.co',
  publishableKey: 'sb_publishable_你的公开密钥',
  googleEnabled: false,
});
```

这是配置形状说明，不是可用凭据。保留空值时应显示“暂未连接账号服务”，不发送真实账号请求。

## 2．配置邮箱与回调

在 Authentication 的 Email provider 中开启邮箱密码登录与邮箱确认。密码策略与网站一致：新密码至少12个字符，可以使用长口令，不强迫特定符号组合。

在 URL Configuration 中设置测试 Site URL，并添加明确允许的应用回调。当前完整图片学习版使用4174端口：

```text
Site URL: http://127.0.0.1:4174/index.html
Redirect URL: http://127.0.0.1:4174/auth-callback.html
```

如果同时使用4173，另加 `http://127.0.0.1:4173/auth-callback.html`。`localhost` 与 `127.0.0.1` 是不同来源；只有实际测试需要时，才另加对应 localhost 地址。通过哪种地址发起流程，就在相同来源、相同浏览器内打开确认邮件，PKCE 才能读取原始验证器。

默认发信功能只适合受限测试，不等于已具备面向任意学生发信的能力。公开注册前配置本人控制的邮件发送服务／自定义 SMTP，并按供应商要求验证发信域名，检查限流、垃圾邮件与退信。不要仅关闭邮箱确认来掩盖邮件配置失败。

官方：https://supabase.com/docs/guides/auth/auth-smtp

## 3．配置 Google

1. 在自己的 Google Cloud 项目创建 OAuth Web application；设置同意屏幕，测试阶段按 Google 要求加入测试用户。
2. 将 Supabase Google provider 面板显示的供应商回调 URL 配置到 Google 的 Authorized redirect URIs。它通常是 `https://你的项目标识.supabase.co/auth/v1/callback`，不是本站的 auth-callback.html。
3. 将 Google Client ID 与 Client Secret 填入 Supabase provider 后台。Client Secret 只留在该后台，不进入公开配置。
4. 启用该 provider，再把公开配置中的 `googleEnabled` 改成 true。
5. 从真实浏览器发起 Google 登录，确认最后回到本地 auth-callback.html，再安全返回主页。

Google 与网站邮箱是不同入口，但首次登录产生的账号归属、邮箱确认及同邮箱身份关联必须以 Supabase 的实际策略测试确认。不通过前端手工拼接账号或以邮箱字符串授予权限。

官方：https://supabase.com/docs/guides/auth/social-login/auth-google

## 4．需要本人完成的真实联调

- 使用本人控制的测试邮箱注册，收到并打开确认邮件，确认用户出现在 Supabase 的 Users 中。
- 登录后刷新，确认邮箱状态保持；另一台设备独立登录同一账号后确认其相同用户 ID。不同设备之间的 PKCE 邮件链接不是任意可交换的会话。
- 使用无痕窗口打开过期、重复或不完整回调，确认不会显示假成功。
- 发起密码找回，完成有效恢复流程；直接访问恢复页面或伪造 query 不能得到恢复权限。恢复流程中刷新页面后若证明已丢失，应重新申请邮件。
- 修改密码后，用新密码登录；退出后刷新不能恢复旧账号。检查断网退出的提示和本地会话清理。
- Google 测试用户登录、取消、拒绝授权、未启用 provider 均有明确反馈。
- 在大陆实际运营商网络与海外网络分别检查：注册页、认证 API、邮件链接、登录回调与退出。Google 并非大陆基础登录入口。不要以海外测试成功推断大陆也可用。

在上述步骤完成之前，只能说“代码与本地界面已接入，真实认证待配置／联调”，不能说已正式上线。

## 5．正式域名与付费阶段

正式上线时使用 HTTPS，配置正式 Site URL、确切回调与邮件地址，重新测试全部流程。保留同一项目时用户 ID 不因域名变更而自动变化；测试数据与正式学生数据仍建议隔离。

需要补齐实际隐私说明、发信身份、学生数据处理规则与限流／防滥用配置；本阶段不会生成虚假的政策或同意文案。

未来购买 APWH 的权限只能由可信后端在核实支付后写入，不能从前端 localStorage、用户可编辑资料或邮箱名单读取。正式商户支付、退款／撤销权限、管理员赋权、受保护内容 API 和价格均不在当前账号功能内。
