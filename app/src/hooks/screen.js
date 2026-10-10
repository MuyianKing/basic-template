/**
 * 切换浏览器全屏状态
 * 如果当前是全屏则退出全屏，如果是非全屏则进入全屏
 * @param {HTMLElement} element - 要全屏显示的元素，默认为整个文档
 * @returns {Promise} 返回Promise，表示全屏切换操作的结果
 */
export function toggleFullscreen(element = document.documentElement) {
  return new Promise((resolve, reject) => {
    // 检查是否支持全屏API
    if (!document.fullscreenEnabled
      && !document.webkitFullscreenEnabled
      && !document.mozFullScreenEnabled
      && !document.msFullscreenEnabled) {
      reject(new Error('浏览器不支持全屏功能'))
      return
    }

    // 检查当前是否处于全屏状态
    const isFullscreen
      = document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullScreenElement
        || document.msFullscreenElement

    if (isFullscreen) {
      // 退出全屏
      exitFullscreen().then(resolve).catch(reject)
    } else {
      // 进入全屏
      requestFullscreen(element).then(resolve).catch(reject)
    }
  })
}

/**
 * 进入全屏
 */
function requestFullscreen(element) {
  return new Promise((resolve, reject) => {
    if (element.requestFullscreen) {
      element.requestFullscreen().then(resolve(1)).catch(reject)
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen().then(resolve(1)).catch(reject)
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen().then(resolve(1)).catch(reject)
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen().then(resolve(1)).catch(reject)
    } else {
      reject(new Error('不支持全屏API'))
    }
  })
}

/**
 * 退出全屏
 */
function exitFullscreen() {
  return new Promise((resolve, reject) => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(resolve(2)).catch(reject)
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().then(resolve(2)).catch(reject)
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen().then(resolve(2)).catch(reject)
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen().then(resolve(2)).catch(reject)
    } else {
      reject(new Error('不支持退出全屏API'))
    }
  })
}

/**
 * 检查当前是否处于全屏状态
 * @returns {boolean} 当前是否全屏
 */
export function isFullscreen() {
  return !!(document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement)
}

/**
 * 监听全屏状态变化
 * @param {Function} callback - 回调函数，接收当前全屏状态
 * @returns {Function} 移除监听器的函数
 */
export function onFullscreenChange(callback) {
  // 统一的事件处理函数
  const handleChange = () => {
    const isFull = isFullscreen()
    callback(isFull)
  }

  // 添加所有浏览器前缀的事件监听
  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange',
  ]

  events.forEach((event) => {
    document.addEventListener(event, handleChange, false)
  })

  // 返回移除监听器的函数
  return function removeListeners() {
    events.forEach((event) => {
      document.removeEventListener(event, handleChange, false)
    })
  }
}

// 最简单的F11监听实现
export function listenF11(callback) {
  let isF11Enabled = true

  const handleKeyDown = (e) => {
    // 检测F11键
    const isF11 = e.key === 'F11'
      || e.keyCode === 122
      || e.code === 'F11'

    if (isF11 && isF11Enabled) {
      // 阻止默认行为
      e.preventDefault()
      e.stopPropagation()

      // 执行回调
      if (callback) {
        callback(e)
      }

      return false
    }
  }

  // 添加事件监听
  document.addEventListener('keydown', handleKeyDown, true)

  // 返回控制函数
  return {
    enable: () => {
      isF11Enabled = true
    },
    disable: () => {
      isF11Enabled = false
    },
    destroy: () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    },
  }
}

export default function () {
  const fullScreen = ref(false)

  // 监听进入全屏
  let removeListeners = onFullscreenChange(() => {
    fullScreen.value = isFullscreen()
  })

  // 监听使用Fll进入全屏
  let f11Controller = listenF11(() => {
    toggleFullscreen()
  })

  onMounted(() => {
    // 获取当前屏幕全屏状态
    fullScreen.value = isFullscreen()
  })

  onUnmounted(() => {
    removeListeners()
    removeListeners = null
    f11Controller.destroy()
    f11Controller = null
  })

  return {
    fullScreen,
    toggleFullscreen,
  }
}
