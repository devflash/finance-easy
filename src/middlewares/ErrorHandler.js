export const ErrorHandler = (err, req, res, next) => {
    res.status(err.statusCode).send(err)
}
