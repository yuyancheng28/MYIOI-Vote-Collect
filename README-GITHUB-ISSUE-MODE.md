README: GitHub Issue Mode — 只读公开结果页、Excel 导出、管理员白名单

新增特性已实现：

1) 只读公开结果页（docs/results.html）
   - 任何人都可以访问此页面并查看当前投票的结果（无需 token），适合对外或团队内部分享“只读统计视图”。

2) 导出 Excel（管理员按钮）
   - 管理员在主页面或结果页可以把单个投票或全部投票导出为 .xlsx 文件，便于归档与分析（使用 SheetJS 客户端库）。

3) 管理员先行白名单（.github/admins.json）
   - 在仓库根路径下新增 `.github/admins.json`，列出允许视为管理员的 GitHub 用户名数组。页面会优先读取该文件并把匹配用户设为管理员（需要管理员在页面粘贴 token 以获取 username）。

4) 更像正式产品页的导航与品牌样式
   - 更新了 docs/index.html 的样式与交互，添加“公开结果页”链接。

如何使用

- 主页面（创建/投票/管理）：
  - docs/index.html（管理员创建并导出，成员登录后投票）
- 只读结果页（公开）：
  - docs/results.html（无需 token，可嵌入或分享）

注意事项

- 公开结果页依赖 GitHub Issues 的公开可读性：如果仓库是 private，那么读取结果将失败；建议把 docs/results.html 作为 GitHub Pages 页面发布到公开仓库，或将仓库设为团队可见。
- 管理员白名单生效流程：管理员仍需在页面粘贴 token（一次）来让页面获取其 username；页面会将 username 与 `.github/admins.json` 中的用户名比对来授予管理员权限（这样可以避免给任意有 repo 权限的用户管理面板的显示）。

下一步

- 我可以把 docs/results.html 做成自动刷新（定时更新）并支持导出所有投票为单个 Excel 文件；如果你同意，我会继续把该功能加上并提交。
