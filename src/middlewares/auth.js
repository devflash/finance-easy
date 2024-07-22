import jwt from 'jsonwebtoken'
import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const auth = (req, res, next) => {
    try {
        const {accessToken} = req.cookies
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (error, decoded) => {
            if (error) {
                throw new ApiError('Unauthorized access', error.message, 400)
            }
            req._id = decoded._id
            next()
        })
    } catch (err) {
        next(err)
    }
}
