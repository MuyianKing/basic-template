// 操作日志字典（若依 sys_oper_type）
export const OPER_TYPE_OPTIONS = [
  { label: '其它', value: 1 },
  { label: '新增', value: 2 },
  { label: '修改', value: 3 },
  { label: '删除', value: 4 },
  { label: '授权', value: 5 },
  { label: '导出', value: 6 },
  { label: '导入', value: 7 },
  { label: '强退', value: 8 },
  { label: '生成代码', value: 9 },
  { label: '清空数据', value: 10 },
]

// 执行状态（若依 sys_common_status：0 正常 / 1 异常）
export const OPER_STATUS_OPTIONS = [
  { label: '正常', value: 0 },
  { label: '异常', value: 1 },
]

// 登录状态（若依 sys_common_status，SysLogininfor.status 为字符串）
export const LOGIN_STATUS_OPTIONS = [
  { label: '成功', value: '0' },
  { label: '失败', value: '1' },
]
