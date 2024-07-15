import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            unique: true
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
)

export const User = new mongoose.model('User', userSchema)
