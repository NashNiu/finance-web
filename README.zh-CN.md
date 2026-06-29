# Finance Web

[English](./README.md) | **简体中文**

一款用于在移动端记录日常收支的个人记账网页应用。可在数秒内记下一笔账，按周、月、年或自定义区间浏览账单，在分类、备注、金额维度上搜索，并通过分类占比与趋势图表回顾消费情况 —— 全程支持**中文或英文**。

技术栈：**Vue 3 + Vite + TypeScript + Vant + Pinia + Vue Router + Axios + ECharts + Vue I18n**。

---

## 环境要求

- Node.js **20+**（Vite 8 要求）
- 使用前需先启动后端（`finance-server`，同级目录）。

---

## 安装

```bash
npm install
```

复制 `.env.example` 为 `.env`，并设置 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

生产环境由 `.env.production` 将其设为相对路径 `/api`，使请求保持同源并由 nginx 代理到后端。

---

## 脚本命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器（端口 5173） |
| `npm run build` | 类型检查（`vue-tsc`）并打包生产版本 |
| `npm run preview` | 本地预览生产构建 |
| `npm test` | 使用 Vitest 运行单元测试 |

---

## 国际化（i18n）

界面支持**简体中文（`zh-CN`）**与**英文（`en`）**。

- 基于 **Vue I18n**，**Vant** 内置组件文案随之同步切换。
- 当前语言会持久化到 `localStorage`，首次访问时回退到浏览器语言。
- 在 **我的 → 偏好 → 语言** 中切换语言。
- 文案位于 `src/i18n/`，按命名空间拆分为 `src/i18n/locales/` 下的片段文件（如 `common`、`bills`、`reports` 等），在 `messages.ts` 中汇总。
- 日期、周期、图表坐标轴文案均随语言切换（如 `6月15日 昨天` ↔ `Jun 15 Yesterday`，`2026年6月` ↔ `Jun 2026`）。

新增文案：在对应片段的 `zh` 和 `en` 中加入相同的 key，再通过 `t('namespace.key')` 引用（组件内使用 `const { t } = useI18n()`，工具函数中使用导出的 `t` 辅助函数）。

---

## 功能与页面

| 路由 | 页面 | 说明 |
|---|---|---|
| `/login` | 登录 / 注册 | 基于 Token 的鉴权，可在登录与注册表单间切换 |
| `/` | 主页 | 月度汇总、近 3 日账单列表、悬浮「记一笔」按钮 |
| `/bills` | 账单 | 周期切换（周 / 月 / 年 / 自定义）、收支图表（折线或柱状，可设置）、按天分组明细、吸顶头部 |
| `/search` | 搜索 | 在分类、备注、金额维度上进行前端模糊搜索，维度可勾选 |
| `/reports` | 报表 | 分类占比（环形图）、趋势图与日历视图 |
| `/me` | 我的 | 个人信息、功能宫格、**语言切换**、退出登录 |
| `/categories` | 分类管理 | 管理收支的一级 / 二级分类 |
| `/record`、`/record/:id` | 新增 / 编辑账单 | 金额键盘、分类宫格、日期选择、备注 —— 以全局弹窗呈现 |

**鉴权流程：** 使用 Hash 路由（`createWebHashHistory`）。全局路由守卫检查 `localStorage` 中的 JWT；未登录访问受保护路由会重定向到 `/login`。Axios 客户端通过请求拦截器附带 JWT，并在 `401` 响应时重定向到 `/login`。

---

## 目录结构

```
src/
├── api/           # Axios 接口模块（auth、records、categories、stats、http）
├── components/    # 复用组件（AmountKeypad、CategoryGrid、CategoryDonut、DailyBar、
│                  #   PeriodPicker、RecordItem/List/Editor/Detail、RecordEditPopup、
│                  #   SubcategorySheet、AddCategoryForm、CategoryIcon、AppLoading）
├── i18n/          # Vue I18n 配置 + 语言片段（locales/*.ts）+ messages.ts
├── router/        # Vue Router 配置与鉴权守卫
├── stores/        # Pinia 状态（auth、categories、recordEdit）
├── types/         # 共享 TypeScript 类型（User、FinanceRecord、Category 等）
├── utils/         # 工具函数（format、period、aggregate、icon、swipeRegistry）
├── views/         # 页面级组件（Login、Home、Bills、Search、Reports、Me、
│                  #   CategoryManage、RecordEdit）
└── main.ts        # 应用入口 —— 注册 Vant、Pinia、Router 与 I18n
```
