# AGENTS.md

本文件为 AI Coding Agent 的项目约束，由跨项目通用约束与本项目事实合并生成，每次会话优先读取。

## 0. 通用约束

以下通用约束已并入本文件，与项目专属章节同时生效；冲突时以项目专属章节为准。

### 修改原则

- 修改文件前先读取并理解现有实现，沿用所在模块的代码风格、命名和技术模式。
- 只做完成用户需求所需的最小修改，不进行无关重构。
- 新增依赖前先检查项目已有依赖、组件、插件和工具；能复用则不引入同类库。
- 不主动创建 README、CI、Docker、测试配置、类型声明或其他非用户要求文件。
- 修改多个关联文件时，保持接口、命名、数据结构和调用链一致。
- 先检查相关文件和既有调用方式，不仅凭文件名或常见框架习惯猜测实现。

### 组件设计

- 组件保持高内聚、低耦合，每个组件只承担清晰的展示、交互或领域职责。
- 父组件负责页面编排、数据准备和跨组件协作；子组件通过 props 接收输入，通过事件、双向绑定或项目既有模式返回结果。
- 避免使用 DOM 查询、隐式全局变量或事件总线传递核心业务数据。
- 子组件不直接依赖父组件内部状态、无关全局状态或宿主页面实现。
- 多个可独立理解的弹窗、表单、列表或复杂交互流程，应按职责拆分为子组件。
- 接口调用归属于实际负责该业务动作的组件或 API 模块，展示组件不承担无关业务流程。

### UI 与样式（通用）

- UI 组件优先复用顺序为：项目已有业务全局组件、项目基础公共组件、当前 UI 库原生组件；现有能力无法满足需求时才新增局部组件。
- 当项目使用 Tailwind CSS 时，flex 系列、width、min-width、height、min-height、padding、margin 必须直接使用 Tailwind CSS 工具类，禁止在 CSS 中通过普通属性实现。
- 当项目使用 Tailwind CSS 时，禁止使用 @apply，不得将 Tailwind 工具类封装到 @apply 规则中。
- 主题颜色必须优先使用项目中已有的主题变量；仅在没有对应主题变量时，才允许定义新的颜色值。
- 修改响应式布局时，同时检查模板、工具类、局部样式、媒体查询和样式加载顺序，避免同一属性存在多个冲突来源。
- 注释和界面文案遵循项目既有语言风格（本项目为中文）；格式化遵循项目现有配置。

### 验证与 Git（通用）

- 较大代码修改后运行项目已有的静态检查或测试命令；没有对应脚本时，不假设或自行引入测试框架。
- 默认不执行 Git 提交，除非用户明确要求。
- 用户要求提交时，先检查 git status、git diff 和近期提交风格。
- 不泄露、输出或提交密钥、令牌、内部地址及其他敏感配置。
- 禁止执行 git reset --hard、git clean -f、强制推送等破坏性 Git 操作，除非用户明确要求。

## 1. 项目边界

- 单应用仓库：app/ 是唯一的 Vue 3 后台管理应用（Rsbuild 构建），组件库通过 npm 依赖引入，仓库内不再维护 packages/ 组件源码。
- 技术栈：JavaScript（无 TypeScript）、Vue 3.5 SFC + JSX、vue-router 5、pinia 3、element-plus 2.14、@muyianking/ui（Mu 组件库）、Tailwind CSS 3、Node 22.22.0 / pnpm 10.32.1（volta 锁定）。
- 运行时依赖统一声明在根 package.json；app/package.json 仅保留 tailwindcss。
- @muyianking/hooks 0.0.5 导出：useAutoHeightAnimation（注意函数名与文件名 useAutoHeightAnimal 不同）、useList（列表页 headless 逻辑：query/page_query/getData/search/updateOne/table_data/loading）、useListRequest（分页查询：getList）、usePageRequest（挂载即查的页面查询）、useRequest（不返回数据的普通请求）；引入路径为 '@muyianking/hooks' 主入口。
- 禁止引入：TypeScript、Prettier、Vuex、axios 之外的请求库、element-plus 与 @muyianking/ui 之外的组件库、Tailwind 之外的原子化 CSS 方案、测试框架。
- 项目无 CI 配置；husky 仅在 commit-msg 阶段执行 commitlint。

## 2. 文件落位

- 页面放 app/src/views/，页面私有子组件放同页面 components/ 子目录；布局放 app/src/layout/。
- 业务聚合组件（smart-table / smart-form / smart-query）在 app/src/components/smartui/，随应用源码维护，经 @comp/smartui 引用。
- API 模块放 app/src/server/ 按业务域拆文件；store 放 app/src/pinia/modules/；工具放 app/src/utils/；路由与菜单在 app/src/router/。
- 全局样式在 app/src/assets/style/；环境变量文件为 app/.env*。

## 3. 文档同步

- docs/ 是页面与组件的文档目录，按目录划分：docs/components/ 存放组件文档（对应 app/src/components/ 下的组件），docs/views/ 存放页面文档（对应 app/src/views/ 下的页面），文档子目录结构与源码目录保持一致。
- docs/README.md 是文档索引；新增、删除或移动页面与组件时，同步登记或调整索引条目。
- 所有业务改动和新需求改完后，必须同步更新受影响页面与组件的文档；新增页面或组件时同步创建文档并登记索引，文档未同步视为改动未完成。
- 后端接口文档为 docs/api-docs.json（OpenAPI 3.1 格式，若依管理系统接口，paths 下按路径列出全部接口及请求/响应 schema）；对接后端或新增 app/src/server/ 接口时以该文件为准，后端接口变更时同步更新。

## 4. 编码规范

- SFC 一律使用 script setup，并通过 defineOptions 声明 Mu 前缀组件名。
- 命名：组件 Mu 前缀 PascalCase、目录 kebab-case、store 文件 useXxxStore.js、组合式函数 useXxx.js。
- vue / pinia / vue-router / @vueuse/core 的 API 与 app/src/pinia/modules/ 下的 store 经 unplugin-auto-import 全局可用，无需手动 import。
- 模板标签属性单行书写：开标签的全部属性写在同一行，不逐属性换行；项目已关闭 vue/max-attributes-per-line（vue/first-attribute-linebreak 为 multiline: beside），禁止再格式化回多行属性。
- 业务弹窗模式：弹窗组件放页面 components/ 子目录，用 @comp/smartui 导出的 openDialog 打开（参考 app/src/views/form/）。
- 新增路径别名只改 app/alias.config.js（单一数据源），rsbuild 启动时自动同步生成 app/jsconfig.json，禁止手改 jsconfig.json。

## 5. UI 与样式

- UI 复用优先级：@muyianking/ui 与 @comp/smartui 组件 → element-plus 原生组件 → 新增局部组件。
- @muyianking/ui 的 Mu 开头组件经 MuUiResolver（@muyianking/ui/resolver）与 element-plus 组件一起按需自动导入，模板中直接使用，不手动 import；@comp/smartui 需显式 import；error、confirm、loading 等工具函数从 @muyianking/ui 主入口导入。
- 组件样式由 @muyianking/ui 自包含（es 内 style/index.js 与 theme-chalk），应用侧无需手动引入 Mu 组件样式。
- 图标用 unplugin-icons 写法 ~icons/<collection>/<name>，图标数据来自 @iconify/json。
- Tailwind CSS 以 important 模式启用，content 扫描范围含 @muyianking/ui/es（见 app/tailwind.config.js）。

## 6. 请求 / 状态 / 配置

- 请求统一走 @http 别名（app/src/utils/request.js，基于 axios 的 Http class 实例 http）；分页结果用 withPage 规整为 { count, data }；接口路径、参数与响应结构以 docs/api-docs.json 接口文档为准。
- store 使用 pinia，持久化由 pinia-plugin-persistedstate 统一配置（key 自动大写加 _STORAGE 后缀），不在组件内自行读写 localStorage。
- 环境变量使用 VITE_ 前缀，定义在 app/.env* 文件；业务代码统一从 @app 别名（app/src/utils/app.js）取值，不直接读 import.meta.env。
- 路由为 hash 模式，全部为静态路由，定义在 app/src/router/menu/index.js；左侧菜单渲染 name 为 admin 的路由的 children，新增页面在该 children 中添加。

## 7. Agent 操作与验证

- 常用命令：根目录执行 pnpm dev / pnpm build / pnpm preview（脚本内 cd app 进入应用目录执行，build:analyze 生成构建分析）；依赖安装用根目录 pnpm install。
- 无 lint script；改完代码在根目录用 npx eslint 校验本次改动文件，全库保持 0 报错，格式类问题可用 npx eslint . --fix 自动修复。
- 提交信息遵循 commitlint 的 type-enum（feat / fix / docs / style / refactor / perf / test / build / ci / revert / chore）。
- 不提交或泄露 app/.env* 中的内网接口地址等敏感配置；不改动 .husky/ 与 pnpm-workspace.yaml 的 allowBuilds。
- 改动收尾前核对「3. 文档同步」要求，确认 docs/ 下对应文档与 docs/README.md 索引已更新。
