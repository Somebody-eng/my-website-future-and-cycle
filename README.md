# 未来与周期｜长期主义商业思想笔记

一个使用 Astro + TypeScript 构建的中文静态博客，围绕巴菲特、查理·芒格、段永平、贝索斯、黄仁勋、马斯克等人物，讨论长期主义、现金流、护城河、定价权、资本配置、理性决策、企业经营、职业发展和副业。

本站不是荐股网站，不提供买卖建议，不承诺收益。文章默认展示免责声明：

> 本文仅用于商业与投资教育讨论，不构成任何投资建议。

## 技术栈

- Astro + TypeScript
- Markdown Content Collections
- 静态生成，无数据库
- RSS、sitemap、robots.txt
- Cloudflare Pages 免费部署
- pages.dev 免费子域名
- 后续可接入自定义域名、Google Analytics、Google Search Console、Google AdSense

## 本地运行

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run validate:posts
npm run validate:berkshire
npm run publish:drafts
npm run maintenance
npm run seo:report
npm run build
npm run preview
```

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
PUBLIC_SITE_URL=https://future-cycle.pages.dev
PUBLIC_ADSENSE_ENABLED=false
PUBLIC_ADSENSE_CLIENT=
PUBLIC_GA_ID=
PUBLIC_GISCUS_ENABLED=false
PUBLIC_GISCUS_REPO_ID=
PUBLIC_GISCUS_CATEGORY_ID=
```

说明：

- `PUBLIC_SITE_URL`：canonical、RSS、sitemap 使用的站点地址。
- `PUBLIC_ADSENSE_ENABLED`：验证期保持 `false`，页面不会加载广告代码，也不会显示广告空白。
- `PUBLIC_ADSENSE_CLIENT`：后续 AdSense 客户端 ID。
- `PUBLIC_GA_ID`：后续 Google Analytics Measurement ID。
- `PUBLIC_GISCUS_ENABLED`：设为 `true` 后在文章页加载 Giscus 评论。
- `PUBLIC_GISCUS_REPO_ID`：Giscus 使用的 GitHub 仓库 ID。
- `PUBLIC_GISCUS_CATEGORY_ID`：Giscus 使用的 Discussions 分类 ID。

## 留言互动

文章页默认显示“去 GitHub 留言”，读者可以在仓库 Issues 中创建与当前文章关联的公开讨论。该模式免费、无需数据库，也不会加载额外评论脚本。

需要启用页内评论时，在公开 GitHub 仓库中开启 Discussions、安装 Giscus App，并在 [giscus.app/zh-CN](https://giscus.app/zh-CN) 获取仓库 ID 和分类 ID。随后设置上述三个 Giscus 环境变量并重新部署。未填写完整配置时，网站会自动保留 GitHub Issues 留言入口。

## 内容结构

文章位于 `src/content/posts`，草稿位于 `drafts/pending`。

一级栏目：

- 伯克希尔股东会实录
- 巴菲特为什么
- 芒格的思维模型
- 好生意案例库
- 长期主义与普通人
- AI与科技巨头
- 股东信与经典文本解读
- 段永平与经营思想
- 人物思想地图

每篇文章 frontmatter 必须包含：

```yaml
title:
description:
date:
updatedDate:
category:
tags:
slug:
author:
coverImage:
coverAlt:
readingTime:
featured:
disclaimer:
sources:
```

`slug` 必须使用英文小写、数字和连字符。`sources` 至少提供一个来源说明。

### 伯克希尔股东会实录更新规则

- 实录按年份从 1994 年开始连续发布，分类页与首页时间轴按年份升序显示。
- 内部归档与下一篇年份配置位于 `src/data/berkshire-series.json`。
- 新增年度文章后同步更新配置中的 `referenceArchive` 和 `nextYear`。
- 执行 `npm run validate:berkshire`，年份跳跃、顺序错误或内部归档缺失都会导致校验失败。
- 文章采用原创摘要和解读，不做大段复制或逐字转载；公开页面只展示官方资料入口。

## 草稿审核与发布

把待审核文章放入 `drafts/pending`，然后执行：

```bash
npm run validate:posts
```

脚本会生成 `reports/content-check-report.md`，检查：

- frontmatter 完整性
- 中文正文是否至少 1200 字
- 是否包含免责声明
- 是否出现高风险表述：稳赚、必涨、推荐买入、建议买入、马上买、翻倍、确定收益
- 是否至少包含 2 个内部链接
- 是否至少包含 1 个来源说明

发布通过审核的草稿：

```bash
npm run publish:drafts
```

脚本只会把验证通过的草稿从 `drafts/pending` 发布到 `src/content/posts`，并生成 `reports/publish-log.md`。不合格内容不会自动发布。

## 维护流程

每月或每次集中更新后执行：

```bash
npm run maintenance
npm run seo:report
```

`maintenance` 会检查超过 90 天未更新的文章、死链接、重复标题、重复 slug、缺少封面 alt、内部链接不足等问题，并输出建议到 `reports/maintenance-report.md`。

`seo:report` 会汇总标题长度、description 长度、字数、分类、标签，并标记可能过短、重复或描述缺失的文章。

## Cloudflare Pages 部署

1. 将代码推送到 GitHub 仓库。
2. 打开 Cloudflare Dashboard，进入 Workers & Pages。
3. 选择 Create application -> Pages -> Connect to Git。
4. 选择 GitHub 仓库。
5. 构建配置：
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. 环境变量：
   - `PUBLIC_SITE_URL=https://future-cycle.pages.dev`
   - `PUBLIC_ADSENSE_ENABLED=false`
   - `PUBLIC_ADSENSE_CLIENT=` 留空
   - `PUBLIC_GA_ID=` 留空
7. 部署完成后访问 Cloudflare 分配的 `pages.dev` 子域名。

当前机器未检测到 `git` 命令。推送 GitHub 前，请安装 Git，或使用 GitHub Desktop / GitHub 网页上传代码。

## 绑定自定义域名

后续购买或已有域名后：

1. 在 Cloudflare Pages 项目中进入 Custom domains。
2. 添加你的正式域名。
3. 按 Cloudflare 提示完成 DNS 配置。
4. 在 Pages 环境变量中把 `PUBLIC_SITE_URL` 改为正式域名，例如 `https://example.com`。
5. 重新部署，确认 canonical、RSS、sitemap 均使用正式域名。

## 接入 Google Analytics

1. 创建 GA4 Property。
2. 获取 Measurement ID，格式类似 `G-XXXXXXXXXX`。
3. 在 Cloudflare Pages 环境变量设置 `PUBLIC_GA_ID=G-XXXXXXXXXX`。
4. 重新部署。

## 接入 Google Search Console

推荐使用 URL prefix 或 Domain property。

验证方式：

- Cloudflare DNS 验证：适合正式域名。
- HTML 标签验证：可把验证标签加入 `BaseLayout.astro` 的 `<head>`。

提交 sitemap：

```text
https://future-cycle.pages.dev/sitemap-index.xml
```

绑定正式域名后改为正式域名的 sitemap 地址。

## 接入 Google AdSense

验证期保持：

```bash
PUBLIC_ADSENSE_ENABLED=false
```

通过内容审核、隐私政策、免责声明、关于页和联系方式完善后，再申请 AdSense。

启用时：

```bash
PUBLIC_ADSENSE_ENABLED=true
PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
```

文章页已经预留文章顶部、正文中部、正文底部广告位。未启用时不会加载广告代码，也不会显示空白占位。

## 零成本原则

- 不使用数据库。
- 不使用付费服务。
- 不使用需要信用卡的第三方服务。
- Cloudflare Pages、GitHub、pages.dev 子域名均可免费使用。

## 项目结构

```text
.
├── astro.config.mjs
├── package.json
├── README.md
├── public/
│   └── images/covers/default.svg
├── drafts/
│   ├── pending/
│   ├── approved/
│   └── rejected/
├── reports/
├── scripts/
│   ├── content-utils.mjs
│   ├── maintenance.mjs
│   ├── publish-drafts.mjs
│   ├── seo-report.mjs
│   └── validate-posts.mjs
└── src/
    ├── components/
    ├── content/posts/
    ├── layouts/
    ├── lib/
    ├── pages/
    └── styles/
```
