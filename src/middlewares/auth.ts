import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const auth = (req:Request, res:Response, next:NextFunction) => {
    try {
        // console.log(req)
        const {accessToken} = req.cookies
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY!, (error:any, decoded:any) => {
            if (error) {
                throw new ApiError(error.message, 400)
            }
            // console.log(decoded)
            req._id = decoded._id
            next()
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
}
