import mongoose, {Model} from 'mongoose'
import {IBudget} from '../utils/types.js'

type BudgetModel = Model<IBudget>

const budgetSchema = new mongoose.Schema<IBudget, BudgetModel>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        totalBudget: {
            type: Number,
            required: true
        },
        totalActual: {
            type: Number,
            default: 0
        },
        budget: [
            {
                category: {
                    type: String,
                    required: true
                },
                actualAmount: {
                    type: Number,
                    default: 0
                },
                budgetAmount: {
                    type: Number,
                    required: true
                },
                type: {
                    type: String,
                    required: true,
                    enum: ['NEED', 'WANT', 'SAVING']
                }
            }
        ]
    },
    {timestamps: true}
)

export const Budget = mongoose.model<IBudget, BudgetModel>('Budget', budgetSchema)
