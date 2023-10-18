import { stringify } from 'qs'
import ResponseError from '../request/ResponseError'

// 判断是否是IE
export function isIE() {
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    return true
  }
  return false
}

// 请求超时函数
export function sleep(timeout) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ResponseError('请求超时'), null)
    }, timeout)
  })
}

// 给URL加上时间戳，防止缓存
export function parseUrl(url, options) {
  if (isIE() && options.method === 'GET') {
    if (url.indexOf('?') !== -1) {
      url += `&t=${new Date().getTime()}`
    } else {
      url += `?t=${new Date().getTime()}`
    }
  }
  return url
}

export function parseOption(defaultOptions, options) {
  // 处理header
  options.headers = {
    ...defaultOptions.headers,
    ...options.headers
  }

  options = { ...defaultOptions, ...options }
  options.method = options.method.toUpperCase()

  if (['POST', 'PUT'].includes(options.method)) {
    switch (options.type) {
      case 'JSON':
        options.headers['Content-Type'] = 'application/json;charset=utf-8'
        options.body = JSON.stringify(options.body)
        break
      case 'FILE':
        break
      default:
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
        options.body = stringify(options.body)
        break
    }
  }

  return options
}
