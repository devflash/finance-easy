import {ApiError, ValidationError} from '../ErrorHandling/CustomErrors.js'
import {ICustomError} from '../utils/types.js'
import {Response, NextFunction} from 'express'

export const ErrorHandler = (err: Error | ICustomError, _: any , res:Response, next: NextFunction) => {
    if (err instanceof ApiError || err instanceof ValidationError) {
        console.log("ApiError",err)
        return res.status(err.status).send({name: err.name, message: err.message, statusCode: err.status})
    }
    return res.status(500).send(err)
}
