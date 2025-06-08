import mongoose, {Model} from 'mongoose'
import {IExpense} from '../utils/types.js'

type IExpenseModel = Model<IExpense>

const expenseSchema = new mongoose.Schema<IExpense, IExpenseModel>(
    {
        category: {
            type: String,
            required: true
        },
        moneyPaidTo: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        description: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            default: 'Expense'
        }
    },
    {timestamps: true}
)

export const Expense = mongoose.model<IExpense, IExpenseModel>('Expense', expenseSchema)
