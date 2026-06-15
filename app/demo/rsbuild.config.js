import { MuUiResolver } from '@mu/ui/resolver'
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
    proxy: {
      '/api': {
        target: 'http://www.zeebone.cn:10096/',
        pathRewrite: { '^/api': '' },
      },
    },
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
      forceSplitting: {
        // 网络/请求
        axios: /node_modules[\\/]axios/,
        // UI 框架
        elementplus: /node_modules[\\/]element-plus/,
        // 大体量可视化 / 文档处理（建议在页面里 dynamic import）
        echarts: /node_modules[\\/]echarts/,
        three: /node_modules[\\/]three/,
        logicflow: /node_modules[\\/]@logicflow/,
        wavesurfer: /node_modules[\\/]wavesurfer\.js/,
        jspdf: /node_modules[\\/]jspdf/,
        // 工具库
        lodash: /node_modules[\\/]lodash-es/,
        validator: /node_modules[\\/]validator/,
        dayjs: /node_modules[\\/]dayjs/,
        // Vue 生态
        vueVendor: /node_modules[\\/](?:@vue|vue|vue-router|pinia|pinia-plugin-persistedstate|@vueuse)[\\/]/,
      },
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
    swc: {
      jsc: {
        // 生产构建移除 console.log/debug（保留 warn/error，与项目约束一致）
        minify: {
          compress: {

            pure_funcs: ['console.log', 'console.debug'],
          },
        },
      },
    },
  },
  dev: {},
})
