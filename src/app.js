import express from 'express'
import {ApiError} from './ErrorHandling/CustomErrors.js'
import {ErrorHandler} from './middlewares/ErrorHandler.js'
export const app = express()

app.get('/hello', () => {
    throw new ApiError('Something went wrong')
})
app.use(ErrorHandler)
