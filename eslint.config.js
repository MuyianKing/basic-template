import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@muyianking/config/eslint.config.js'

const compat = new FlatCompat()

export default antfu({
  formatters: true,
  ignores: ['**/public/**'],
}, {
  rules: {
    ...eslint,
    'pnpm/yaml-enforce-settings': 0,
    // https://eslint.vuejs.org/rules/singleline-html-element-content-newline.html#vue-singleline-html-element-content-newline
    'vue/singleline-html-element-content-newline': 0,
    'e18e/prefer-static-regex': 0,
  },
  files: ['**/src/**', '**/packages/*/**', '**/app/*/src/**', '**/script/**', './pnpm-workspace.yaml'],
  languageOptions: {
    globals: {

    },
  },
}, ...compat.config({
  extends: [
    './app/demo/.eslintrc-auto-import.json',
  ],
}))
