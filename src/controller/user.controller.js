import {ApiError} from '../ErrorHandling/CustomErrors.js'
import {User} from '../models/User.model.js'
export const userController = async (req, res, next) => {
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
        res.send({firstName, lastName, email, password})
    } catch (error) {
        next(error)
    }
}
