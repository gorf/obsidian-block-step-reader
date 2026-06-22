# 在 Obsidian 里，我终于可以「一段一段」读长文了

**副标题**：介绍 Obsidian 插件「渐读」——把 Readwise Reader 的步进阅读体验，搬进你的笔记库

---

## 你有没有这样的经历？

收藏了一篇很长的文章，放进 Obsidian，打算「有空慢慢读」。

结果打开一看：满屏文字，眼睛不知道往哪落，读两行就分心去刷别的了。

或者读到一半关掉，下次再打开——**完全忘了上次看到哪**。

Readwise Reader 解决过这个问题：一次只给你看一段，J/K 切换，进度自动保存，还有一个文库帮你管理「待读清单」。

但很多人（包括我）的核心笔记都在 Obsidian 里。能不能**不离开 Obsidian**，也有类似的体验？

这就是我做 **「渐读」** 的原因。

---

## 「渐读」是什么？

**渐读**（英文名 Block Step Reader）是 Obsidian 的一款社区插件。

它不改变你写笔记的方式，只增强**阅读模式**：

- 用键盘 **一段一段** 往下读，当前段落高亮
- 切换段落时自动滚到屏幕中央，眼睛不用到处找
- 底部有 **进度条**：读了多少、还剩多久
- 侧边栏 **阅读库**：待读、在读、已读，像个小型 Reader
- **记住阅读位置**，下次打开从上次的地方继续
- 多人共用一个库？每人设个 User ID，进度互不干扰

界面支持 **简体中文**，插件名就叫「渐读」——一点点读完，不着急。

---

## 三个我最常用的场景

### 1. 读收藏的长文

公众号、博客、Newsletter 剪藏进 Obsidian 之后，切换到阅读模式，按 `J` 往下走。

一次只看一段，注意力不容易散。读累了关掉，进度写在笔记的 frontmatter 里，下次接着读。

### 2. 管理「待读清单」

点击左侧 **图书馆** 图标，打开阅读库。

「待读」里是所有还没读完的笔记；读了一部分会出现在「在读」；读完了标记「已读」。

不用另外维护一个 To-Read 列表——**你的库本身就是清单**。

### 3. 和家人/同事共用笔记库

进度存在每条笔记的 YAML 里，按 User ID 区分：

```yaml
bsr:
  alice:
    progress: 0.42
    read: false
  bob:
    progress: 1
    read: true
```

同一份读书笔记，各自记录各自的进度，不会互相覆盖。

---

## 怎么开始用？

### 第一步：安装插件

**方式 A — BRAT（目前最方便）**

Obsidian 社区插件还在审核中，应用内暂时可能搜不到。可以先用 **Obsidian42-BRAT** 安装：

1. 安装 BRAT 插件
2. 添加 Beta 地址：`https://github.com/gorf/obsidian-block-step-reader`

**方式 B — 审核通过后**

在 Obsidian → 设置 → 社区插件，搜索 **Block Step Reader** 或 **渐读** 即可。

**方式 C — 手动安装**

从 GitHub Release 下载 `main.js`、`manifest.json`、`styles.css`，放进 `.obsidian/plugins/block-step-reader/`。

项目地址：https://github.com/gorf/obsidian-block-step-reader

### 第二步：启用并设置

1. 启用插件
2. 设置里打开 **Enable Block Selector**
3. 语言选 **简体中文**（或 Auto 跟随系统）
4. 打开任意笔记 → **阅读模式**

### 第三步：开读

- `J` / `↓`：下一段
- `K` / `↑`：上一段
- 点 **图书馆** 图标：打开阅读库

就这么简单。

---

## 和原版 Reading View Enhancer 的关系

「渐读」Fork 自 Galacsh 的 **Reading View Enhancer**（段落导航的原创实现，MIT 协议）。上游仓库已不可用，我在此基础上继续维护，并加入了阅读进度、阅读库、多用户 frontmatter、多语言等能力。

感谢 Galacsh 的开源贡献。

---

## 写在最后

Obsidian 是笔记工具，但笔记库里也堆着大量**需要读完的东西**。

「渐读」想做的，就是把「读」这件事变得轻一点：一次一段，进度可查，清单在手边。

如果你也常在 Obsidian 里读长文，欢迎试试。有问题可以在 GitHub 提 Issue，或在社区插件讨论帖留言。

如果你觉得这个插件对你有帮助，也欢迎点击文章底部的「赞赏」，你的支持是我持续维护的最大动力。

---

**项目链接**：https://github.com/gorf/obsidian-block-step-reader

**中文说明文档**：仓库内 `README.zh-CN.md`

**插件讨论帖**：https://community.obsidian.md/plugins/block-step-reader

---

*（发布时可配 2–3 张截图：阅读模式高亮段落、底部进度条、阅读库侧边栏。如需我根据实际界面写图注，告诉我你用的 Obsidian 主题名称即可。）*
