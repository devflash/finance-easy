import {Schema, model} from 'mongoose'

const BankAccountSchema = new Schema({
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    }
})

export const BankAccount = new model('BankAccount', BankAccountSchema)
