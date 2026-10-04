# MYIOI Vote Collect (GitHub Issue Mode)

这是一个纯前端投票页面，适合洛谷团队内部使用：

- 通过 GitHub Token 访问仓库 Issue（所有投票数据集中存在 GitHub Issues）
- 管理员用 Token 创建投票并查看结果
- 用户直接在页面内投票，脚本会把投票写到指定 Issue 的评论区
- 适合小规模团队、无需额外后端部署

## 运行方式

### 方式 1：直接本地打开

在浏览器直接打开 `docs/index.html` 即可运行。

### 方式 2：GitHub Pages

1. 先把该仓库 push 到 GitHub
2. 在仓库设置里启用 GitHub Pages（Source: Deploy from a branch / docs）
3. 页面地址大致为：
   - https://<你的用户名>.github.io/<仓库名>/docs/

## 关键说明

- Token 需要具备至少 `repo` 或 `issues:write`/`issues:read` 权限
- 推荐：这里只给 issues 权限，不要给超范围权限
- 页面里所有投票都通过 GitHub Issues comments 记录，适合团队内部测试和演示
- 这不是完全安全的正式投票系统，但对于小范围团队内使用足够好用

## 使用流程

1. 在页面中粘贴 GitHub Token
2. 输入仓库 `owner/repo`
3. 创建投票
4. 成员在页面中点击对应投票提交选择
5. 结果通过读评论区 `/vote 1`、`/vote 2` 等格式汇总

## 注意

- 如果你只想简单试用，不想用 GitHub OAuth / Vercel / Render，推荐这个方案
- 如果需要更严谨的权限控制、匿名投票、投票去重、数据库审计，建议后续迁移到完整后端方案

## 示例仓库

默认仓库：
- yuyancheng28/MYIOI-Vote-Collect
