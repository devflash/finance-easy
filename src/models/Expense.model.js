import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true
        },
        expenseName: {
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
        }
    },
    {timestamps: true}
)

export const Expense = new mongoose.model('Expense', expenseSchema)
