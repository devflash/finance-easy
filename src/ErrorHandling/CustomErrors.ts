import {ICustomError} from '../utils/types.js'

export class BaseError extends Error implements ICustomError {
    status
    constructor(name: string, message: string, status: number){
        super(message)
        this.name=name
        this.status=status
        Object.setPrototypeOf(this, BaseError.prototype)
    }
}

export class ApiError extends BaseError implements ICustomError {
    constructor(message:string, status: number) {
        super('API Error', message, status)
    }
}

export class ValidationError extends BaseError implements ICustomError{
    constructor(messge: string){
        super("Bad request", messge, 422)
    }
}