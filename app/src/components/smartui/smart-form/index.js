import { guid } from '@muyianking/utils'
import { defineComponent, h, ref, shallowReactive } from 'vue'
import SmartFormComp from './Index.vue'

const dialogs = shallowReactive([])

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

  dialogs.push({
    id: guid(),
    component: dialogComp,
    props,
    params,
    opened: false,
  })
}

export const MuDialogHost = defineComponent({
  name: 'MuDialogHost',
  setup() {
    function handleRef(dialog, instance) {
      if (!instance || dialog.opened) {
        return
      }

      dialog.opened = true
      requestAnimationFrame(() => instance.open?.(dialog.params))
    }

    function handleClose(dialog) {
      setTimeout(() => {
        const index = dialogs.indexOf(dialog)
        if (index !== -1) {
          dialogs.splice(index, 1)
        }
      }, 300)
    }

    return () => dialogs.map(dialog => h(dialog.component, {
      key: dialog.id,
      ...dialog.props,
      ref: instance => handleRef(dialog, instance),
      onClose: () => handleClose(dialog),
    }))
  },
})

export function useSmartForm({ Model } = {}) {
  const form = ref({})
  const smartFormRef = ref()

  function open(model) {
    if (Model) {
      model = new Model(model)
    }
    smartFormRef.value?.open?.(model)
  }

  const SmartForm = defineComponent({
    name: 'SmartForm',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h(SmartFormComp, {
        ref: smartFormRef,
        formRef: form,
        ...attrs,
      }, slots)
    },
  })

  return {
    form,
    SmartForm,
    open,
  }
}

export const MuSmartForm = SmartFormComp
export default MuSmartForm
