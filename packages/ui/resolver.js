function Resolver() {
  return {
    type: 'component',
    resolve: (name) => {
      if (name.startsWith('Mu')) {
        return {
          name,
          importName: name,
          from: '@mu/ui',
          path: `@mu/ui/index.js`,
        }
      }
    },
  }
}

export const MuUiResolver = Resolver
export default Resolver
