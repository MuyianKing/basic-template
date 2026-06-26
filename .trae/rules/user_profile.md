## User Preferences
- Communication language: Chinese
- Code style: prefers concise and non-redundant implementations
- Engineering approach: prefers callback-based solutions over event-based ones for component logic

## Tech Stack
- Vue.js, Element Plus (proficient)
- Tailwind CSS (proficient)
- Rsbuild (familiar with configuration)

## Constraints
- Debugging: prefers using console.warn/console.error over console.log for temporary debugging

## Performance Patterns

### Singleton Floating Layer Pattern (单例浮层模式)
**适用场景**：大数据量列表（如 5000 行），每行需要渲染选择器组件（el-select/el-date-picker/el-cascader 等）

**核心思想**：
- 同 field 分组的多个实例共享一个浮层组件
- 仅渲染 1 个核心组件实例，而非 N 个
- 通过 `window.GLOBAL_SINGLE_MAP` Map 管理全局单例
- 首个实例（isHost=true）创建 Teleport 浮层，其他实例共享

**架构要点**：
1. **全局状态管理**：
   ```javascript
   const GLOBAL_KEY = 'GLOBAL_SINGLE_MAP'
   window[GLOBAL_KEY] = window[GLOBAL_KEY] || new Map()
   const sharedMap = window[GLOBAL_KEY]
   ```

2. **isHost 判定**：
   ```javascript
   let state = sharedMap.get(props.field)
   const isHost = !state?.mounted
   if (isHost) {
     state = { mounted: true, open: null, openMethod: null }
     sharedMap.set(props.field, state)
   }
   ```

3. **防竞态**：只有 host 才能注册全局方法
   ```javascript
   if (isHost) {
     watchEffect(() => { state.openMethod = props.openMethod })
   }
   ```

4. **防闪现**：opacity + pointerEvents 替代 v-show
   ```vue
   :style="{
     opacity: visible ? 1 : 0,
     pointerEvents: visible ? 'auto' : 'none',
   }"
   ```

5. **初始化时机**：requestAnimationFrame 确保 Teleport 初始化
   ```javascript
   () => requestAnimationFrame(() => state.openMethod?.())
   ```

**性能提升**：
- 5000 行数据：DOM 节点从 ~50,000 减少到 ~2 个
- 渲染速度：从卡顿 3-5 秒优化到 <100ms
- 内存占用：从 ~200MB 优化到 ~20MB

**通用组件结构**：
- `SingletonField.vue`：通用单例容器（管理生命周期、定位、插槽）
- `Select.vue/DatePicker.vue`：适配层（提供具体组件配置和触发器插槽）

**关键 Slots**：
- `#trigger`：自定义触发区域（显示值 + 下拉箭头图标）
- `#default`：浮层内容（传入 Element Plus 组件）

**扩展新组件**：
遵循适配层模式：传入 `field`、`displayValue`（格式化显示）、`openMethod`（focus/handleOpen），通过 slots 传入组件和触发器。

**注意事项**：
- 同页面不同类型选择器使用不同 field 命名
- 组件卸载时自动清理全局状态（`onBeforeUnmount`）
- Teleport 挂载到 body 避免样式污染