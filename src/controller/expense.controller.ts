import {Request, Response, NextFunction} from 'express'
import {Expense} from '../models/Expense.model.js'
import {validateMandatory} from '../utils/util.js'
import {IExpense} from '../utils/types.js'
import {ApiError} from '../ErrorHandling/CustomErrors.js'
import mongoose, {PipelineStage} from 'mongoose'
import {Budget} from '../models/Budget.model.js'
const {ObjectId} = mongoose.Types

const amountByCategoryPipeline: PipelineStage[] = [
    {
        $group: {
            _id: '$category',
            value: {
                $sum: '$amount'
            }
        }
    },
    {
        $project: {
            _id: 0,
            name: '$_id',
            value: 1
        }
    }
]

const amountByMonthPipeline = [
    {
        $match: {
            date: {
                $gte: new Date('01/01/2024'),
                $lt: new Date('01/03/2025')
            }
        }
    },
    {
        $project: {
            month: {
                $month: '$date'
            },
            amount: 1,
            date: 1
        }
    },
    {
        $group: {
            _id: '$month',
            value: {$sum: '$amount'},
            date: {$first: '$date'}
        }
    },
    {
        $project: {
            _id: 0,
            name: {
                $dateToString: {
                    format: '%b',
                    date: '$date'
                }
            },
            value: 1
        }
    }
]

const findAndUpdateBudget = async (userId: string, updatedExpense: IExpense) => {
    const budgetForUpdatedExpense = await Budget.findOne({
        userId: userId,
        startDate: {$lt: updatedExpense.date},
        endDate: {$gt: updatedExpense.date}
    })
    if (budgetForUpdatedExpense) {
        const isCategoryExist =
            budgetForUpdatedExpense.budget.findIndex(item => item.category === updatedExpense.category) > -1

        if (!isCategoryExist) {
            await Budget.findOneAndUpdate(
                {_id: budgetForUpdatedExpense._id},
                {
                    $push: {
                        budget: {
                            category: updatedExpense.category,
                            actualAmount: updatedExpense.amount,
                            budgetAmount: 0
                        }
                    }
                }
            )
        } else {
            await Budget.findOneAndUpdate(
                {_id: budgetForUpdatedExpense._id},
                {$inc: {'budget.$[elem].actualAmount': updatedExpense.amount}},
                {arrayFilters: [{'elem.category': updatedExpense.category}]}
            )
        }
    }
}

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {category, moneyPaidTo, paymentMethod, paymentMethodId, amount, date, description} = req.body

        const requiredFields = {category, moneyPaidTo, paymentMethod, paymentMethodId, amount, date, description}
        validateMandatory(requiredFields)

        const expense = await Expense.create({
            category,
            amount,
            moneyPaidTo,
            paymentMethod,
            paymentMethodId,
            date,
            description,
            userId: req._id
        })

        const createdExpense = await Expense.findById(expense._id).select('-userId')
        if (createdExpense) {
            await Budget.findOneAndUpdate(
                {userId: req._id, startDate: {$lt: createdExpense.date}, endDate: {$gt: createdExpense.date}},
                {$inc: {'budget.$[elem].actualAmount': amount}},
                {arrayFilters: [{'elem.category': category}]}
            )
        }
        res.status(200).json(createdExpense)
    } catch (error) {
        next(error)
    }
}

export const getExpenseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {expenseId} = req.params

        validateMandatory({expenseId})

        const expense = await Expense.findById(expenseId).select('-userId')

        res.status(200).json(expense)
    } catch (error) {
        next(error)
    }
}

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let expenses: IExpense[] = []
        const userId = req._id

        if (userId) {
            expenses = await Expense.find({userId})
        }
        res.status(200).json(expenses)
    } catch (error) {
        next(error)
    }
}

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {expenseId} = req.params
        const {category, moneyPaidTo, paymentMethod, amount, date, description} = req.body

        const requiredFields = {expenseId, category, moneyPaidTo, paymentMethod, amount, date}
        validateMandatory(requiredFields)
        const originalExpense = await Expense.findByIdAndUpdate(
            {_id: expenseId},
            {expenseId, category, moneyPaidTo, paymentMethod, amount, date, description}
        )

        if (!originalExpense) {
            throw new ApiError('Expense not found', 400)
        }

        const updatedExpense = await Expense.findById(originalExpense._id).select('-userId')

        const budget = await Budget.findOne({
            userId: req._id,
            startDate: {$lt: originalExpense.date},
            endDate: {$gt: originalExpense.date}
        })

        if (updatedExpense && !budget) {
            await findAndUpdateBudget(req._id!, updatedExpense)
        }
        if (
            updatedExpense &&
            budget &&
            (updatedExpense.date.toISOString() !== originalExpense.date.toISOString() ||
                updatedExpense.category !== originalExpense.category ||
                updatedExpense.amount !== originalExpense.amount)
        ) {
            if (updatedExpense.date >= budget.startDate && updatedExpense.date < budget.endDate) {
                const diffAmount = updatedExpense.amount - originalExpense.amount
                if (updatedExpense.category === originalExpense.category) {
                    await Budget.updateOne(
                        {_id: budget._id},
                        {$inc: {'budget.$[elem].actualAmount': diffAmount}},
                        {arrayFilters: [{'elem.category': category}]}
                    )
                } else {
                    await Budget.updateOne(
                        {_id: budget._id},
                        {$inc: {'budget.$[elem].actualAmount': -originalExpense.amount}},
                        {arrayFilters: [{'elem.category': originalExpense.category}]}
                    )
                    await Budget.updateOne(
                        {_id: budget._id},
                        {$inc: {'budget.$[elem].actualAmount': updatedExpense.amount}},
                        {arrayFilters: [{'elem.category': category}]}
                    )
                }
            } else {
                // expense date updated and falls outside the budget it was originally in
                await Budget.updateOne(
                    {_id: budget._id},
                    {$inc: {'budget.$[elem].actualAmount': -originalExpense.amount}},
                    {arrayFilters: [{'elem.category': originalExpense.category}]}
                )
                await findAndUpdateBudget(req._id!, updatedExpense)
            }
        }
        res.status(200).json(updatedExpense)
    } catch (error) {
        next(error)
    }
}

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {expenseId} = req.params

        const requiredFields = {expenseId}
        validateMandatory(requiredFields)
        const expense = await Expense.findById(expenseId)
        if (!expense) {
            throw new ApiError('Expense not found', 400)
        }
        const result = await Expense.deleteOne({_id: expenseId})
        if (!result.deletedCount) {
            throw new ApiError('System faced issue deleting the expense', 400)
        }

        const budget = await Budget.findOne({
            userId: req._id,
            startDate: {$lt: expense.date},
            endDate: {$gt: expense.date}
        })

        if (budget) {
            await Budget.findOneAndUpdate(
                {_id: budget._id},
                {$inc: {'budget.$[elem].actualAmount': -expense.amount}},
                {arrayFilters: [{'elem.category': expense.category}]}
            )
        }

        res.status(200).json({
            msg: `Expense ${expenseId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}

export const searchExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {moneyPaidTo, category, startDate, endDate, page = 1, limit = 5} = req.query
        const userId = new ObjectId(req._id)

        const searchQuery = {
            userId,
            ...(moneyPaidTo && {moneyPaidTo}),
            ...(category && {category: {$in: [category]}}),
            ...(startDate && endDate && {incomeDate: {$and: [{$gte: startDate}, {$lte: endDate}]}})
        }
        const offset = (Number(page) - 1) * Number(limit)

        const pipeline = [
            {$match: searchQuery},
            {
                $facet: {
                    paginatedResults: [{$skip: offset}, {$limit: Number(limit)}],
                    totalCount: [{$count: 'count'}]
                }
            }
        ]
        const response = await Expense.aggregate(pipeline)
        res.status(200).send({
            expenses: response[0].paginatedResults,
            count: response[0].totalCount[0].count
        })
    } catch (error) {
        next(error)
    }
}

export const getExpenseGraph = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate} = req.body
        const userId = new ObjectId(req._id)
        const expenseData = await Expense.aggregate([
            {
                $match: {userId}
            },
            {
                $facet: {
                    'expenseByCategory': amountByCategoryPipeline as any,
                    'expenseByMonths': amountByMonthPipeline as any
                }
            }
        ])

        res.status(200).json({
            expenseByCategory: expenseData[0].expenseByCategory,
            expenseByMonths: expenseData[0].expenseByMonths
        })
    } catch (error) {
        next(error)
    }
}
