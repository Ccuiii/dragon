import { parseUrl, parseOption } from '../utils'
import CustomFetch from '../CustomFetch'

/**
 * Requests a URL, returning a promise.
 *
 * @param {String} url 请求路径
 * @param {Object} [options] The options we want to pass to "fetch"
 * @param {String} [options.method] 请求方式get、post、put、delete
 * @param {String} [options.type] 请求类型JSON、FILE
 * @param {Object} [options.body] 请求体
 * @param {Object} [options.headers] 请求头
 * @param {Boolean} [options.throw] 是否抛出异常
 * @param {Boolean} [options.enableInterceptors] 是否开启拦截器
 * @param {Number} [options.timeout] 超时时间
 * @return {Promise} An object containing either "data" or "error"
 */

function request(defaultOptions = {}, token) {
  const requestInterceptors = []
  const responseInterceptors = []
  const businessHandler = {}

  defaultOptions.errorHandler = throttle(defaultOptions.errorHandler, 1000)

  const instance = (url, options = {}) => {
    // 处理options
    options = parseOption(defaultOptions, options)
    // 处理url
    url = parseUrl(url, options)

    // 添加token
    options.headers[token[0]] = token[1]()

    const interceptor = {
      requestInterceptors,
      responseInterceptors
    }
    return new CustomFetch(url, options, interceptor, businessHandler, token)
  }

  // 设置四个方法
  const methods = ['get', 'post', 'delete', 'put']
  methods.forEach((method) => {
    instance[method] = (url, options) => instance(url, { ...options, method })
  })

  // 注入业务逻辑代码
  instance.injectBusinessHandler = (businesses) => {
    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i]
      if (business.code.length) {
        // 传入了一个数组
        business.code.forEach((code) => {
          businessHandler[code] = {
            ...business
          }
        })
      } else {
        businessHandler[business.code] = {
          ...business
        }
      }
    }
  }

  // 注入拦截器
  instance.interceptors = {
    request: (interceptor) => {
      requestInterceptors.push(interceptor)
    },
    response: (interceptor) => {
      responseInterceptors.push(interceptor)
    }
  }

  return instance
}

// 默认的请求配置
export default request

function throttle(func = () => {}, delay) {
  let lastTime
  return function() {
    let ctx = this
    let args = arguments
    let nowTime = new Date().getTime()
    if (!lastTime || nowTime > lastTime + delay) {
      lastTime = nowTime
      func.apply(ctx, args)
    }
  }
}
