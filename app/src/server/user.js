import { api } from '@http'

/**
 * 退出登录
 */
export async function logout() {
  try {
    clearUserData()
  } catch (error) {
    console.log(error)
  } finally {
    window.location.href = `${window.location.origin}${window.location.pathname}#/login`
  }
}

/**
 * 清除用户数据
 */
export function clearUserData() {
  useUserStore().clearUser()
  useTagsStore().clearTags()
  useRouteStore().resetRoutes()
}

/**
 * 判断当前用户是否拥有指定的资源
 * @param {string} resource_id 资源ID
 */
export function hasResource(resource_id) {
  const resources_id = useUserStore().resources_id
  return (resource_id && resources_id.includes(resource_id)) || !resource_id
}

/**
 * 根据token获取当前登录用户信息（GET /getInfo）
 * @returns {Promise<{ id, username, nickname, avatar } | null>} 用户信息，请求失败返回 null
 */
export async function getUserInfoByToken() {
  const res = await api.auth.getInfo()
  if (!res?.user) {
    return null
  }
  return {
    id: res.user.userId,
    username: res.user.userName,
    nickname: res.user.nickName,
    avatar: res.user.avatar,
  }
}

/**
 * 上传个人中心头像（POST /system/user/profile/avatar，multipart 字段 avatarfile）
 * @param {File} file 头像图片文件
 * @returns {Promise<string|null>} 头像访问地址（imgUrl），请求失败返回 null
 */
export async function uploadAvatar(file) {
  const data = new FormData()
  data.append('avatarfile', file)
  // multipart 头覆盖默认 JSON：浏览器端遇 FormData 会由 axios 改写为带 boundary 的表单头
  const result = await api.user.uploadAvatar(data, { headers: { 'Content-Type': 'multipart/form-data' } })
  return result?.imgUrl ?? null
}
