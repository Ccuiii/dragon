import { message } from 'antd'

import { sleep } from '../utils'
import ResponseError from '../request/ResponseError'

const toastError = (function() {
  let toasted = false
  return function(msg) {
    if (!toasted) {
      toasted = true
      message.error(msg, () => {
        toasted = false
      })
    }
  }
})()

export default class CustomFetch {
  constructor(url, options, interceptor, businessHandler, token) {
    this.url = url
    this.options = options
    this.responseType = ''
    this.requestInterceptors = interceptor.requestInterceptors
    this.responseInterceptors = interceptor.responseInterceptors
    this.token = token
    this.businessHandler = businessHandler

    return this.doFetch()
  }

  doFetch() {
    this.performRequestInterceptors()()

    const requestPromise = fetch(this.url, this.options)

    const instance = Promise.race([
      requestPromise,
      sleep(this.options.timeout) // 超时函数
    ])
      .then(this.checkStatus()) // 先检测状态码
      .then(this.parseResponse()) // 根据Content-Type处理数据
      .then(this.innerBusinessHandler())
      .catch(this.errorHandler())
      .finally(this.performResponseInterceptors())

    return instance
  }

  // 检测状态码
  checkStatus() {
    return (response) => {
      const { errorHandler = () => {} } = this.options
      if ((response.status >= 200 && response.status < 300) || response.status === 304) {
        // 刷新token
        const newToken = response.headers.get(this.token[0])
        if (newToken && this.token[2]) {
          this.token[2](newToken)
        }
        return response
      }
      errorHandler(response.status, response)
      throw new ResponseError(`网络繁忙，请稍后再试。`, response)
      // throw new ResponseError(`请求错误: ${response.statusText || '未知错误'}`, response)
    }
  }

  // 根据Content-Type处理数据
  parseResponse() {
    return (response) => {
      const ContentType = response.headers.get('Content-Type')
      if (ContentType.includes('application/json')) {
        this.responseType = 'json'
        return response.json()
      }
      if (ContentType.includes('text/plain')) {
        this.responseType = 'text'
        return response.text()
      }
      this.responseType = 'other'
      return response.blob()
    }
  }

  // 业务逻辑处理
  innerBusinessHandler() {
    return (data) => {
      // 检测是否是JSON格式的数据
      if (this.responseType !== 'json') {
        return data
      }

      // action和throw
      if (this.businessHandler[data.code]) {
        const { action, throw: isThrow } = this.businessHandler[data.code]

        // 设置throw，需要保留原来的默认值
        if (typeof isThrow !== 'undefined') {
          this.options.throw = isThrow
        }

        // action已经定好
        if (action) {
          const actionResult = action(data)
          return actionResult ? actionResult : data.data
        }

        throw new ResponseError(data.message, data)
      }
      // code未定义 默认抛出message异常
      throw new ResponseError(data.message, data)
    }
  }

  // 错误处理
  errorHandler() {
    return (e) => {
      // 不用弹提示
      if (!this.options.throw) return Promise.reject(e)
      if ('stack' in e && 'message' in e) {
        toastError(`${e.message || '未知错误'}`)
      }
      return Promise.reject(e)
    }
  }

  performRequestInterceptors() {
    return () => {
      if (this.options.enableInterceptors) {
        this.requestInterceptors.forEach((cb) => cb(this))
      }
    }
  }

  performResponseInterceptors() {
    return () => {
      if (this.options.enableInterceptors) {
        this.responseInterceptors.forEach((cb) => cb(this))
      }
    }
  }
}
