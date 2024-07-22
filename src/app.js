import express from 'express'
import {ErrorHandler} from './middlewares/ErrorHandler.js'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'
import incomeRouter from './routes/income.routes.js'

export const app = express()

app.use(express.json())
app.use(cookieParser())

//routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/income', incomeRouter)

app.use(ErrorHandler)
