import {ApiError} from '../ErrorHandling/CustomErrors.js'

export const validateMandatory = requiredFields => {
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            throw new ApiError('Field missing', `${field} is required`, 400)
        }
    }
}
