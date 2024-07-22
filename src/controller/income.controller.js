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

export const getIncomeById = async (req, resp, next) => {
    try {
        const {incomeId} = req.params

        validateMandatory({incomeId})

        const income = await Income.findById(incomeId).select('-userId')

        resp.status(200).json(income)
    } catch (error) {
        next(error)
    }
}

export const getIncomes = async (req, resp, next) => {
    try {
        const incomes = await Income.find({userId: req._id}).select('-userId')
        resp.status(200).json(incomes)
    } catch (error) {
        next(error)
    }
}
