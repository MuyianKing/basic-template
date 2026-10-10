import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@muyianking/config/eslint.config.js'

export default antfu({
  formatters: true,
  ignores: ['**/public/**'],
}, {
  rules: {
    ...eslint,
    'pnpm/yaml-enforce-settings': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/max-attributes-per-line': 0,
    'e18e/prefer-static-regex': 0,
    'node/prefer-global/process': 0,
    'vue/custom-event-name-casing': 0,
  },
  files: ['**/src/**', '**/script/**', './pnpm-workspace.yaml', './app/alias.config.js', './app/rsbuild.config.js'],
  // markdown 会命中 files 规则，vue 规则在 md 上因解析器不同而崩溃，这里排除
  ignores: ['**/*.md'],
  languageOptions: {
    globals: {

    },
  },
}, {
  // unused-imports v4 的 no-unused-vars 委托 typescript-eslint 实现，其作用域分析在
  // espree 解析的 js/vue 上失效（所有引用被误判为"仅类型使用"），改用 ESLint 核心规则
  rules: {
    'unused-imports/no-unused-vars': 'off',
    'no-unused-vars': ['error', {
      args: 'after-used',
      argsIgnorePattern: '^_',
      caughtErrors: 'none',
      ignoreRestSiblings: true,
      vars: 'all',
      varsIgnorePattern: '^_',
    }],
  },
}, ...new FlatCompat().config({
  extends: [
    './app/.eslintrc-auto-import.json',
  ],
}))
