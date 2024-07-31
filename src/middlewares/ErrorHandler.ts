import {ApiError} from '../ErrorHandling/CustomErrors.js'
import {ICustomError} from '../utils/types.js'
import {Response} from 'express'

export const ErrorHandler = (err: Error | ICustomError, _: any , res:Response) => {
    if (err instanceof ApiError) {
        return res.status(err.status).send({name: err.name, message: err.message, statusCode: err.status})
    }
    return res.status(500).send(err)
}
