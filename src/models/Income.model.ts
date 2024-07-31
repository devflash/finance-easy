import mongoose, {Model} from 'mongoose'
import {IIncome} from '../utils/types.js'

type IncomeModel = Model<IIncome>

const incomeSchema = new mongoose.Schema<IIncome, IncomeModel>(
    {
        source: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        incomeDate: {
            type: Date,
            required: true
        },
        depositType: {
            type: String, // bank deposit | cash
            required: true
        },
        description: {
            type: String
        },
        category: {
            type: String
        }
    },
    {timestamps: true}
)

export const Income = mongoose.model<IIncome, IncomeModel>('Income', incomeSchema)
