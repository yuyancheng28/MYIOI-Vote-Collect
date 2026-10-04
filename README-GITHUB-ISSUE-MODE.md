已美化并增强 GitHub-Issues 投票页面：

新增功能与改进：

- 全新官网式界面：更专业的视觉风格与响应式布局
- 管理员/普通成员分离：管理员登录后可创建投票、导出结果（管理员通过 GitHub Token 登录）
- 已投票去重：系统根据 GitHub username 检测并禁止重复投票
- 查看结果/仅看模式：可以查看结果且隐藏投票控件
- 导出 CSV：管理员可以导出投票原始记录为 CSV，便于归档与统计
- 隐藏底层细节：普通成员界面不显示 Token 字段或底层 API 细节（管理员单独登录）

重要使用说明：
- 该方案仍使用 GitHub Issues 作为后端，因此要投票或创建 Issue，用户或管理员需要使用拥有 `repo`/`issues` 权限的 GitHub Token。推荐管理员使用 token，成员也可使用个人短期 token。若不希望每个成员都输入 token，可由一名受信任管理员代为创建/记录投票（代投）。
- 管理员 Token 将被保存在浏览器 localStorage，仅在当前浏览器使用。请勿在公用电脑保存 Token。

已提交文件：
- docs/index.html（新版页面）
- README-GITHUB-ISSUE-MODE.md（已更新说明）

接下来我可以为你做（任选）：
- 为页面添加“只读公开查看”链接（通过 GitHub Pages 发布）
- 添加导出为 Excel 的按钮（xlsx）
- 增加更严格的管理员用户列表（通过仓库文件或 labels 管理）

要我继续做哪件（或直接部署到 GitHub Pages 帮你生成公开 URL）？
