import SmartForm from './Index.vue'

/**
 * 打开弹窗组件
 * @param {Vue.Component} dialogComp
 * @param {object} options
 * @param {object} options.props //传递到dialogComp上的属性
 * @param {object} options.params //传递到dialogComp上的open方法的参数
 */
export function openDialog(dialogComp, options = {}) {
  const {
    props = {},
    params,
  } = options

  const container = document.createElement('div')
  document.body.appendChild(container)

  let instance = null

  const app = createApp(
    defineComponent({
      setup() {
        const dialogRef = ref()

        function unmount() {
          setTimeout(() => {
            app.unmount()
            container.remove()
          }, 300)
        }

        function handleClose() {
          unmount()
        }

        instance = {
          getDialog: () => dialogRef.value,
        }

        return () => h(dialogComp, {
          ref: dialogRef,
          ...props,
          onClose: handleClose,
        })
      },
    }),
  )

  app.mount(container)

  requestAnimationFrame(() => {
    const dialog = instance?.getDialog()
    dialog?.open?.(params)
  })
}

export const MuSmartForm = SmartForm
export default MuSmartForm
