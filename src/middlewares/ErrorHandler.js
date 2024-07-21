import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).send(err)
    }
    res.status(500).send(err)
}
