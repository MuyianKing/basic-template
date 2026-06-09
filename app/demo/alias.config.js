import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const alias_path = [
  ['@', './src'],
  ['@api', './src/api'],
  ['@comp', './src/components'],
  ['@def', './src/default'],
  ['@server', './src/server'],
  ['@model', './src/model'],
  ['@views', './src/views'],
  ['@hooks', './src/hooks'],
  ['@img', './src/assets/img'],
  ['@pinia', './src/pinia/modules'],
  ['@style', './src/assets/style'],
  ['@layout', './src/layout'],
  ['@directions', './src/directions'],
  ['@app', './src/utils/app'],
  ['@http', './src/utils/request'],
  ['@utils', './src/utils'],
]

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default function useAlias() {
  const alias_map = {}
  alias_path.forEach((item) => {
    alias_map[item[0]] = item[1].startsWith('@') ? item[1] : resolve(__dirname, item[1].replace('./', ''))
  })

  return {
    alias_map,
    alias_path,
  }
}
