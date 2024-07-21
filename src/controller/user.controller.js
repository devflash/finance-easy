import {ApiError} from '../ErrorHandling/CustomErrors.js'
import {User} from '../models/User.model.js'

const generateToken = user => {
    const accessToken = user.generateAccessToken()
    return accessToken
}

export const registerUser = async (req, res, next) => {
    try {
        const {firstName, lastName, email, password} = req.body
        // check if firstName, lassName, email and password is present in req
        const requiredFields = {firstName, lastName, email, password}

        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                throw new ApiError('Field missing', `${field} is required`, 400)
            }
        }

        // validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw new ApiError('Invalid field', 'Email is not valid', 400)
        }

        const passwordMinLength = 8
        if (password.length < passwordMinLength) {
            throw new ApiError('Invalid field', `Password must be at least ${passwordMinLength} characters long`, 400)
        }

        // check if email address is present
        const userExist = await User.findOne({email})
        if (userExist) {
            throw new ApiError('User Exist', `User with email is already registered`, 409)
        }
        // save in db
        const user = await User.create({firstName, lastName, email, password})

        if (!user) {
            throw new ApiError('MongoDB failure', 'Failed to create new user', 500)
        }
        res.status(200).json({firstName, lastName, email, password})
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    try {
        //get user email and password
        const {email, password} = req.body
        // check if email and password present
        const requiredFields = {email, password}
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                throw new ApiError('Field missing', `${field} is required`, 400)
            }
        }

        //validate user
        const user = await User.findOne({
            email
        })
        const isPasswordValid = await user.isPasswordCorrect(password)
        if (!isPasswordValid) {
            throw new ApiError('Auth failed', 'Invalid email or password', 400)
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
