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

import useAlias from './alias.config'

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
    pluginImageCompress(),
  ],
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
  resolve: {
    alias: alias_map,
  },
  source: {
    define: publicVars,
  },
  output: {
    polyfill: 'entry',
    legalComments: 'none',
    sourceMap: {
      js: false,
    },
  },
  performance: {
    chunkSplit: {
      forceSplitting: {
        axios: /node_modules[\\/]axios/,
        elementplus: /node_modules[\\/]element-plus/,
        echarts: /node_modules[\\/]echarts/,
        validator: /node_modules[\\/]validator/,
      },
    },
  },
  dev: {},
})
