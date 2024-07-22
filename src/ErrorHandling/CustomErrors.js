export class BaseError extends Error {
    constructor(description, name, statusCode) {
        super(description)
        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.statusCode = statusCode
        this.message = description
        Error.captureStackTrace(this)
    }
}

export class ApiError extends BaseError {
    constructor(description, name = 'Server Error', statusCode = 500) {
        super(description, name, statusCode)
    }
}
