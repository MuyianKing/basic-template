import { MuUiResolver } from '@muyianking/ui/resolver'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginBabel } from '@rsbuild/plugin-babel'
import { pluginImageCompress } from '@rsbuild/plugin-image-compress'
import { pluginVue } from '@rsbuild/plugin-vue'
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/rspack'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/rspack'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/rspack'
import useAlias, { syncJsconfig } from './alias.config'

// 启动构建时自动把别名同步到 jsconfig.json，IDE 与运行时保持单一数据源
await syncJsconfig()

const { alias_map } = useAlias()
const { publicVars } = loadEnv({ prefixes: ['VITE_'] })

export default defineConfig({
  html: {
    template: './public/index.html',
    title: publicVars['import.meta.env.VITE_WEB_NAME'].replace(/"/g, ''),
  },
  server: {
    base: '/',
  },
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVue(),
    pluginVueJsx(),
    pluginImageCompress([
      // 位图使用有损压缩，质量略调低进一步缩体积
      { use: 'jpeg', test: /\.jpe?g$/, quality: 75 },
      { use: 'png', test: /\.png$/ },
      { use: 'ico', test: /\.ico$/ },
      // svg 走默认无损压缩
      { use: 'svg', test: /\.svg$/ },
    ]),
  ],
  resolve: {
    alias: alias_map,
  },
  source: {
    define: publicVars,
  },
  output: {
    // usage 模式按代码实际用到的 API 注入 polyfill，配合 .browserslistrc 体积更小
    polyfill: 'usage',
    legalComments: 'none',
    sourceMap: {
      js: false,
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  tools: {
    rspack: {
      plugins: [
        Icons({}),
        Components({
          dts: true,
          directoryAsNamespace: true,
          resolvers: [
            ElementPlusResolver({
              importStyle: 'css',
            }),
            MuUiResolver(),
            IconsResolver(),
          ],
        }),
        AutoImport({
          resolvers: [ElementPlusResolver()],
          imports: ['vue', 'pinia', 'vue-router', '@vueuse/core'],
          eslintrc: {
            enabled: true,
          },
          dirs: ['./src/pinia/modules'],
          dts: true,
        }),
      ],
    },
  },
  dev: {},
})
