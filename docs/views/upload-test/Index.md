# 上传测试（/upload-test）

验证全局上传配置的测试页：`mu-upload` 组件经 `mu-config-provider` 注入的 `customConfig.uploadFile`（App.vue）完成上传，接口为 `/common/upload`（单文件）与 `/common/uploads`（多文件）。

## 数据流

1. `app/src/App.vue` 把 `@server/file` 的 `uploadFile` 通过 `mu-config-provider` 的 `custom-config` 注入，`mu-upload` / `mu-file` 经 `inject('GLOBAL_CUSTOM_CONFIG')` 取用。
2. `app/src/server/file.js` 的 `uploadFile(files, { onProgress })`：
   - 单文件：FormData 字段名 `file`，POST `/common/upload`，返回 `{ fileName, newFileName, url, originalFilename }`；
   - 多文件：FormData 字段名 `files`，POST `/common/uploads`，返回逗号拼接的 `fileNames/newFileNames/urls/originalFilenames`；
   - 统一归一化为 `{ id: newFileName, name: originalFilename, path: url }` 数组，`path` 缺失绝对地址时用 `BASE_URL` 拼接。
3. `uploadObject(medias)` 为差量封装：列表中 `File` 项重新上传、字符串/数字项视为已上传资源 id 原样保留。

## 页面区块

- **单张图片**：`mu-upload` type="image"，v-model 为单对象 `{ id, name, path }` 或 null。
- **多张图片**：`multiple` + `max-count="5"`，v-model 为数组。
- **文件上传**：type="file" + `multiple` + `progress`，展示内置进度条，`upload-start` / `upload-finish` 事件统计进行中数量与资源 id。
- **上传记录**：最近 20 条 `upload-finish` 返回的资源 id。

## 相关文件

- `app/src/App.vue` — 注入 customConfig
- `app/src/server/file.js` — 上传封装
- `app/src/api/common.js` — /common/upload(s) 接口声明
- `app/src/router/menu/index.js` — 静态壳路由（upload-test 挂在 admin 下，不走后端菜单合并）
