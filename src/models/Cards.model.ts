import {Schema, model, Model} from 'mongoose'
import {ICard} from '../utils/types.js'
const CardSchema = new Schema<ICard, Model<ICard>>({
    cardNumber: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    name: {
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

export const Card = model<ICard, Model<ICard>>('Cards', CardSchema)
