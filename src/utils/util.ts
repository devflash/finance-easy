import {ValidationError} from '../ErrorHandling/CustomErrors.js'

export const validateMandatory = (requiredFields: any) => {
    for (const [field, value] of Object.entries(requiredFields)) {
        if (!value) {
            throw new ValidationError(`${field} is required`)
        }
    }
}

