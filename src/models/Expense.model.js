import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
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
        expenseDate: {
            type: Date,
            required: true
        },
        description: {
            type: String
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true}
)

export const Expense = new mongoose.model('Expense', expenseSchema)
