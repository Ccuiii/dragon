export default class ResponseError extends Error {
  constructor(message, response) {
    super(message) // 提示的信息
    this.response = response // 后端返回的数据
  }
}
