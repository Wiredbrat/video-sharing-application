class ApiErrors extends Error {
  constructor (
    statusCode,
    message="Something went wrong",
    errors= [], 
    stack=''
  ) {
    super(statusCode)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    if(stack) {
      this.stack = stack
    }else{
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {ApiErrors}