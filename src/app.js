import express from 'express'
import {ErrorHandler} from './middlewares/ErrorHandler.js'
import {registerRoute} from './routes/registerUser.js'
export const app = express()

app.use(express.json())

app.use('/api/v1/user', registerRoute)

app.use(ErrorHandler)
