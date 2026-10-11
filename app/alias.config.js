import { writeFile } from 'node:fs/promises'
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 项目别名单一数据源（Single Source of Truth）。
 * - 运行时：rsbuild 通过 useAlias().alias_map 解析模块。
 * - IDE：通过 syncJsconfig()（rsbuild 启动时自动调用）或 `node ./alias.config.js`
 *        生成 jsconfig.json#paths。
 *
 * 第二项以 `/` 结尾视作目录别名（IDE paths 使用 `<key>/*` -> `<value>/*` 形式）。
 * 不以 `/` 结尾视作单文件别名（IDE paths 使用 `<key>` -> `<value>`）。
 */
const alias_path = [
  ['@', './src/'],
  ['@api', './src/api/'],
  ['@comp', './src/components/'],
  ['@def', './src/default/'],
  ['@server', './src/server/'],
  ['@model', './src/model/'],
  ['@views', './src/views/'],
  ['@hooks', './src/hooks/'],
  ['@img', './src/assets/img/'],
  ['@data', './src/assets/data/'],
  ['@pinia', './src/pinia/modules/'],
  ['@style', './src/assets/style/'],
  ['@layout', './src/layout/'],
  ['@directions', './src/directions/'],
  ['@utils', './src/utils/'],
  ['@const', './src/const/'],
  // 单文件别名
  ['@app', './src/utils/app'],
  ['@http', './src/utils/request'],

]

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function useAlias() {
  const alias_map = {}
  alias_path.forEach(([key, value]) => {
    // 去掉末尾 `/`，rsbuild alias 不需要
    const normalized = value.replace(/\/$/, '')
    alias_map[key] = normalized.startsWith('@')
      ? normalized
      : resolve(__dirname, normalized.replace(/^\.\//, ''))
  })

  return {
    alias_map,
    alias_path,
  }
}

/** 生成 jsconfig.json#compilerOptions.paths 所需结构 */
export function buildJsconfigPaths() {
  const paths = {}
  alias_path.forEach(([key, value]) => {
    const isDir = value.endsWith('/')
    const target = value.replace(/\/$/, '')
    if (isDir) {
      paths[`${key}/*`] = [`${target}/*`]
    } else {
      paths[key] = [target]
    }
  })
  return paths
}

/**
 * 把当前别名写入 jsconfig.json，使 IDE 与构建期使用同一份配置。
 * 由 rsbuild.config.js 在启动时调用，也可通过 `node ./alias.config.js` 手动触发。
 */
export async function syncJsconfig() {
  await writeFile(
    resolve(__dirname, 'jsconfig.json'),
    `${JSON.stringify({
      compilerOptions: {
        ignoreDeprecations: '6.0',
        baseUrl: '.',
        paths: buildJsconfigPaths(),
        allowJs: true,
      },
      include: ['**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2)}\n`,
    'utf8',
  )
}

// 直接执行：`node ./alias.config.js` 同步生成 jsconfig.json
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  await syncJsconfig()
  console.warn('[alias] jsconfig.json regenerated.')
}
