import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const ErrorHandler = (err, req, res, next) => {
    console.log(err)
    if (err instanceof ApiError) {
        return res.status(err.statusCode).send({name: err.name, message: err.message, statusCode: err.statusCode})
    }
    console.log(err)
    return res.status(500).send(err)
}
