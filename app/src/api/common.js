export default {
  config: {
    prefix: '/common',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 上传单文件（FormData 字段名 file，返回 { fileName, newFileName, url, originalFilename }）
    ['post', '/upload'],
    // 上传多文件（FormData 字段名 files，返回逗号拼接的 fileNames/newFileNames/urls/originalFilenames）
    ['post', '/uploads'],
  ],
}
