# Fenty Prism / 万象 — 第 74 版源码

对应已发布版本：74
源代码提交：8e2867fdb2c639931ab4942e353a3e9949305a95
网站：https://fenty-beauty-quiz.cktay.chatgpt.site

本包保留该提交的全部源码、图片、MediaPipe 模型文件、配置及测试；本说明为导出时额外添加。
不含 Git 历史、node_modules、构建输出、缓存或运行环境中的密钥。

## 上传 GitHub（GitHub Desktop，无须命令行）

1. 下载并解压这个 ZIP。
2. 安装 https://desktop.github.com/ ，打开并登录 GitHub 账号。
3. 菜单 File → New Repository，Name 填 fenty-prism，选保存位置，点击 Create Repository。无需生成 README、Git ignore 或 License，本包已有 README 和 .gitignore。
4. 菜单 Repository → Show in Finder（Windows 是 Show in Explorer），打开新仓库文件夹。
5. 打开解压出来的 fenty-prism-v74 文件夹，把里面的所有文件和子文件夹复制到新仓库文件夹中。复制的是文件夹内的内容，不是把整个 fenty-prism-v74 文件夹再套进去。仓库根目录应直接有 package.json、app、public 等。
6. Mac 请先在 Finder 按 Command + Shift + . 显示隐藏文件，把 .gitignore、.openai 一起复制；Windows 请开启显示隐藏项目。不要上传 ZIP 本身。
7. 回到 GitHub Desktop，在左下角 Summary 填 Upload Fenty Prism v74 source，点击 Commit to main（按钮可能显示当前分支名）。
8. 点击 Publish repository；保留 Keep this code private 勾选即为私有仓库，需要公开再取消。再次点击 Publish Repository。
9. 菜单 Repository → View on GitHub，检查根目录能看到 package.json、app、public。

以后修改代码：在 GitHub Desktop 填写 Summary → Commit to main → Push origin。

GitHub 保存源码；上传源码本身不等于部署网站。原有网站地址继续使用。
本项目包含实时摄像头、人脸模型和服务端代码，不能把 ZIP 直接作为 GitHub Pages 网页。

## 本地开发

需要 Node.js >=22.13.0。在含 package.json 的项目文件夹中运行：

    npm ci
    npm run dev

用终端显示的本地地址打开。摄像头须浏览器允许权限；生产环境须 HTTPS。
原有 npm run build 使用 Linux 工具（GNU timeout 等）；macOS 上若构建失败，应使用 Linux 环境或按目标部署平台调整构建脚本。保留原 README.md 了解原始部署方式。

## 官方教程

https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop
