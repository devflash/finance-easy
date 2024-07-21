import express from 'express'
import {ErrorHandler} from './middlewares/ErrorHandler.js'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'

export const app = express()

app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/user', userRouter)

app.use(ErrorHandler)
