import {Income} from '../models/Income.model.js'
import {validateMandatory} from '../utils/util.js'
export const createIncome = async (req, res, next) => {
    try {
        const {source, amount, incomeDate, depositType, description, category} = req.body

        const requiredFields = {source, amount, incomeDate, depositType}
        validateMandatory(requiredFields)

        const income = await Income.create({
            source,
            amount,
            incomeDate,
            depositType,
            description,
            category,
            userId: req._id
        })

        const createdIncome = await Income.findById(income._id).select('-userId')
        res.status(200).json(createdIncome)
    } catch (error) {
        next(error)
    }
}
