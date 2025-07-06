import mongoose, {Model} from 'mongoose'
import {ISaving} from '../utils/types.js'

type ISavingModel = Model<ISaving>

const savingSchema = new mongoose.Schema<ISaving, ISavingModel>(
    {
       
        amount: {
            type: Number,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            required: true
        },
        description: {
            type: String
        },
        category: {
            type: String
        },
        type: {
            type: String,
            default: 'Saving'
        }
    },
    {timestamps: true}
)

export const Saving = mongoose.model<ISaving, ISavingModel>('Saving', savingSchema)
