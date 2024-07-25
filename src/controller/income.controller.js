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

export const updateIncome = async (req, res, next) => {
    try {
        const {incomeId} = req.params
        const {source, amount, incomeDate, depositType, description, category} = req.body

        const requiredFields = {incomeId, source, amount, incomeDate, depositType, description, category}
        validateMandatory(requiredFields)
        const income = await Income.updateOne(
            {_id: incomeId},
            {incomeId, source, amount, incomeDate, depositType, description, category}
        )

        const updatedIncome = await Income.findById(income._id).select('-userId')
        res.status(200).json(updatedIncome)
    } catch (error) {
        next(error)
    }
}

export const deleteIncome = async (req, res, next) => {
    try {
        const {incomeId} = req.params

        const requiredFields = {incomeId}
        validateMandatory(requiredFields)

        await Income.deleteOne({_id: incomeId})

        res.status(200).json({
            msg: `Income ${incomeId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}
