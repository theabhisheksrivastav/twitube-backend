class apiError extends Error {
  constructor(
    status,
    message = 'Internal Server Error',
    error = [],
    stack = ""
    ) {
    super(message)
    this.message = message
    this.status = status
    this.data = null
    this.error = error
    
    if (stack){
        this.stack = stack
    } else{
        Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {apiError}