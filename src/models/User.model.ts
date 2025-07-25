import mongoose, {Model, Document, HydratedDocument} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {IUser, IUserMethods} from '../utils/types.js'

export type IUserModel = Model<IUser, {}, IUserMethods>

const userSchema = new mongoose.Schema<IUser, IUserModel>(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
)

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_KEY!,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
export type IUserDoc = HydratedDocument<IUser> & IUserMethods

export const User = mongoose.model<IUser, IUserModel>('User', userSchema)
