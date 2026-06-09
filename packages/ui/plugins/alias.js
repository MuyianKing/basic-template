export function MuUIAlias() {
  return {
    name: 'my-plugin',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('style/index.js')) {
        return
      }

      return code.replace(/@mu\/theme-chalk/g, '@mu/ui/theme-chalk')
    },
  }
}
