import mongoose from 'mongoose'

const incomeSchema = new mongoose.Schema(
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

export const Income = new mongoose.model('Income', incomeSchema)
