import express from 'express'
import {ErrorHandler} from './middlewares/ErrorHandler.js'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.routes.js'
import incomeRouter from './routes/income.routes.js'
import expenseRouter from './routes/expense.route.js'
import savingRouter from './routes/saving.route.js'
import budgetRouter from './routes/budget.route.js'
import cors from 'cors';

export const app = express()

app.use(cors({
    origin: 'http://localhost:5173'
}))
app.use(express.json())
app.use(cookieParser())

//routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/income', incomeRouter)
app.use('/api/v1/expense', expenseRouter)
app.use('/api/v1/saving', savingRouter)
app.use('/api/v1/budget', budgetRouter)
app.use(ErrorHandler)
