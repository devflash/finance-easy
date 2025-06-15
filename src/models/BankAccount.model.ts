import {Schema, model, Model} from 'mongoose'
import {IBankAccount} from '../utils/types.js'
const BankAccountSchema = new Schema<IBankAccount, Model<IBankAccount>>({
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

export const BankAccount = model<IBankAccount, Model<IBankAccount>>('BankAccount', BankAccountSchema)
