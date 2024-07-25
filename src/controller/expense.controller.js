import {Expense} from '../models/Expense.model.js'
import {validateMandatory} from '../utils/util.js'
export const createExpense = async (req, res, next) => {
    try {
        const {category, moneyPaidTo, paymentMethod, amount, expenseDate, description} = req.body

        const requiredFields = {category, moneyPaidTo, paymentMethod, amount, expenseDate, description}
        validateMandatory(requiredFields)

        const expense = await Expense.create({
            category,
            amount,
            moneyPaidTo,
            paymentMethod,
            expenseDate,
            description,
            userId: req._id
        })

        const createdExpense = await Expense.findById(expense._id).select('-userId')
        res.status(200).json(createdExpense)
    } catch (error) {
        next(error)
    }
}

export const getExpenseById = async (req, resp, next) => {
    try {
        const {expenseId} = req.params

        validateMandatory({expenseId})

        const expense = await Expense.findById(expenseId).select('-userId')

        resp.status(200).json(expense)
    } catch (error) {
        next(error)
    }
}

export const getExpenses = async (req, resp, next) => {
    try {
        const expenses = await Expense.find({userId: req._id}).select('-userId')
        resp.status(200).json(expenses)
    } catch (error) {
        next(error)
    }
}

export const updateExpense = async (req, res, next) => {
    try {
        const {expenseId} = req.params
        const {category, moneyPaidTo, paymentMethod, amount, expenseDate, description} = req.body

        const requiredFields = {expenseId, category, moneyPaidTo, paymentMethod, amount, expenseDate}
        validateMandatory(requiredFields)
        const expense = await Expense.updateOne(
            {_id: expenseId},
            {expenseId, category, moneyPaidTo, paymentMethod, amount, expenseDate, description}
        )

        const updatedExpense = await Expense.findById(expense._id).select('-userId')
        res.status(200).json(updatedExpense)
    } catch (error) {
        next(error)
    }
}

export const deleteExpense = async (req, res, next) => {
    try {
        const {expenseId} = req.params

        const requiredFields = {expenseId}
        validateMandatory(requiredFields)

        await Expense.deleteOne({_id: expenseId})

        res.status(200).json({
            msg: `Expense ${expenseId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}
