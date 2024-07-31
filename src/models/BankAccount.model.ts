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
    }
})

export const BankAccount = model<IBankAccount, Model<IBankAccount>>('BankAccount', BankAccountSchema)
