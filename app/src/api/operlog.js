export default {
  config: {
    prefix: '/monitor/operlog',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 操作日志列表（分页，TableDataInfo{rows,total}；操作时间区间按若依约定经 params[beginTime]/params[endTime] 传递）
    ['get', '/list'],
  ],
}
