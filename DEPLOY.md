# 免费部署到 Render（约 5 分钟）

Render 免费套餐：不用信用卡、自动 HTTPS、空闲 15 分钟会休眠（有人访问时自动唤醒，
首次打开需等 30–60 秒）。

## 前提

1. 注册 GitHub 账号（如果还没有）：https://github.com/signup
2. 注册 Render 账号（免费，不用绑卡）：https://render.com/register

## 步骤

1. 登录 Render → 点 **New** → **Blueprint**（蓝图）
2. 选择连接 GitHub（第一次会跳转授权，允许即可）
3. 选中仓库 **JemmaUZH/zurich-deutsch**
4. Render 会自动读取 `render.yaml` 并开始构建（首次构建约 3–5 分钟）
5. 构建完成后，进入服务页 → 顶部就是你的网址，形如
   `https://zurilese.onrender.com`

把网址发给任何人，全世界都能打开，和你电脑是否开机无关。

## 注意事项

- **数据说明**：免费套餐的磁盘是临时的，Render 重启服务后学习进度可能重置。
  如果以后想要“进度永不丢失”，可以加一个免费/低价的数据库（如 Neon、Supabase），
  我可以帮你接上。
- **唤醒延迟**：15 分钟没人访问后服务休眠，下一次打开会等 30–60 秒。
- **更新代码**：推送到 GitHub 的 `main` 分支，Render 会自动重新部署。
