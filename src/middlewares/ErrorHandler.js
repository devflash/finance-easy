import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).send(err)
    }
    console.log(err)
    return res.status(500).send(err)
}
