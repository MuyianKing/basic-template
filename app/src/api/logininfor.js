export default {
  config: {
    prefix: '/monitor/logininfor',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 登录日志列表（分页，TableDataInfo{rows,total}；登录时间区间按若依约定经 params[beginTime]/params[endTime] 传递）
    ['get', '/list'],
  ],
}
