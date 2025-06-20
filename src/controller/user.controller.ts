import {Request, Response, NextFunction} from 'express'
import {ApiError, ValidationError} from '../ErrorHandling/CustomErrors.js'
import {User, IUserDoc} from '../models/User.model.js'
import {BankAccount} from '../models/BankAccount.model.js'
import {Card} from '../models/Cards.model.js'
import {validateMandatory} from '../utils/util.js'
import {IBankAccount} from './../utils/types.js'
import mongoose, {PipelineStage} from 'mongoose'
const {ObjectId} = mongoose.Types

const generateToken = (user: IUserDoc) => {
    const accessToken = user.generateAccessToken()
    return accessToken
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {firstName, lastName, email, password} = req.body
        // check if firstName, lassName, email and password is present in req
        const requiredFields = {firstName, lastName, email, password}

        validateMandatory(requiredFields)

        // validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new ValidationError('Email is not valid')
        }

        const passwordMinLength = 8
        if (password.length < passwordMinLength) {
            throw new ValidationError(`Password must be at least ${passwordMinLength} characters long`)
        }

        // check if email address is present
        const userExist = await User.findOne({email})
        if (userExist) {
            throw new ApiError(`User with email is already registered`, 409)
        }
        // save in db
        const user = await User.create({firstName, lastName, email, password})

        if (!user) {
            throw new ApiError('Failed to create new user', 500)
        }
        res.status(200).json({firstName, lastName, email, password})
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //get user email and password
        const {email, password} = req.body
        // check if email and password present
        const requiredFields = {email, password}

        validateMandatory(requiredFields)

        //validate user
        const user = await User.findOne({
            email
        })

        if (!user) {
            throw new ApiError('User not found', 400)
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
            throw new ValidationError('Invalid email or password')
        }

        //Generate access tocken
        const accessToken = generateToken(user)

        //send response
        res.status(200).cookie('accessToken', accessToken, {httpOnly: true, secure: true}).json({
            isLoggedIn: true,
            accessToken
        })
    } catch (error) {
        next(error)
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).clearCookie('accessToken').json({
            isLoggedIn: false
        })
    } catch (err) {
        next(err)
    }
}

export const addBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {bankName, accountNumber, branch, type} = req.body
        const userId = req._id
        const body = {bankName, accountNumber, branch, type}
        validateMandatory(body)

        const bankAccount = await BankAccount.create({
            userId,
            ...body
        })

        if (!bankAccount._id) {
            throw new ApiError('Facing problem adding the bank account', 400)
        }

        res.status(200).json({
            msg: 'Bank account is added'
        })
    } catch (err) {
        next(err)
    }
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req._id)
        res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {firstName, lastName, email, password} = req.body
        await User.updateOne({_id: req._id}, {firstName, lastName, email, password})
        res.status(200).json({
            msg: 'User profile is updated successfully'
        })
    } catch (err) {
        next(err)
    }
}

export const updateBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {_id, bankName, accountNumber} = req.body
        const body = {bankName, accountNumber}
        validateMandatory(body)
        await BankAccount.findOneAndUpdate({_id}, body)
        res.status(200).json({
            msg: 'Bank account is updated successfully'
        })
    } catch (err) {
        next(err)
    }
}

export const getBankAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req._id
        const response = await BankAccount.find({userId})
        res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}

export const deleteBankAccountById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountId = req.params.accountId
        const response = await BankAccount.deleteOne({_id: accountId})
        res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}

export const addCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {cardNumber, expirationDate, name, type} = req.body
        const userId = req._id
        const body = {cardNumber, expirationDate, name, type}
        validateMandatory(body)

        const card = await Card.create({
            userId,
            ...body
        })

        if (!card._id) {
            throw new ApiError('Facing problem adding the card', 400)
        }

        res.status(200).json({
            msg: 'Card is added'
        })
    } catch (err) {
        next(err)
    }
}

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req._id
        const response = await Card.find({userId})
        res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}

export const deleteCardById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.params)
        const cardId = req.params.cardId
        const response = await Card.deleteOne({_id: cardId})
        res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}

export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = new ObjectId(req._id)
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    userId
                }
            },
            {
                $addFields: {
                    methodType: 'bank'
                }
            },
            {
                $unionWith: {
                    coll: 'cards',
                    pipeline: [
                        {
                            $match: {
                                userId
                            }
                        },
                        {
                            $addFields: {
                                methodType: 'card'
                            }
                        }
                    ]
                }
            }
        ]
        const paymentMethods = await BankAccount.aggregate(pipeline)
        res.status(200).json(paymentMethods)
    } catch (err) {
        next(err)
    }
}
