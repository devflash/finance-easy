import {Request, Response, NextFunction} from 'express'
import {Saving} from '../models/Saving.model.js'
import {Budget} from '../models/Budget.model.js'
import {validateMandatory} from '../utils/util.js'
import {ApiError} from '../ErrorHandling/CustomErrors.js'
import mongoose, {PipelineStage} from 'mongoose'
import { ISaving } from '../utils/types.js'
const {ObjectId} = mongoose.Types

// const amountByCategoryPipeline: PipelineStage[] = [{
//         $group: {
//             _id: "$category",
//             value: {
//                 $sum: "$amount"
//             }
//         }
//     },{
//         $project: {
//             _id: 0,
//             name: '$_id',
//             value: 1
//         }
//     }]

//     const amountByMonth = [
//         {
//             $match: {
//                 incomeDate:
//                         {
//                                 $gte: new Date("01/01/2024"),
//                                 $lt: new Date("01/03/2025"),
//                         }
//                 }
//         },
//         {
//             $project: {
//                 month: {
//                     $month: '$incomeDate'
//                 },
//                 amount: 1,
//                 incomeDate: 1
//             }
//         },
//         {
//             $group: {
//                 _id: '$month',
//                 value: {$sum: '$amount'},
//                 incomeDate: {$first: '$incomeDate'}
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 name: {
//                     $dateToString: {
//                         format: "%b",
//                         date:'$incomeDate'
//                       }
//                 },
//                 value: 1
//             }
//         }
//     ]
const findAndUpdateBudget = async (userId: string, updatedSaving: ISaving) => {
    const budgetForUpdatedSaving = await Budget.findOne({
        userId: userId,
        startDate: {$lt: updatedSaving.date},
        endDate: {$gt: updatedSaving.date}
    })
    if (budgetForUpdatedSaving) {
        const isCategoryExist =
            budgetForUpdatedSaving.budget.findIndex(item => item.category === updatedSaving.category) > -1

        if (!isCategoryExist) {
            await Budget.findOneAndUpdate(
                {_id: budgetForUpdatedSaving._id},
                {
                    $push: {
                        budget: {
                            category: updatedSaving.category,
                            actualAmount: updatedSaving.amount,
                            budgetAmount: 0
                        }
                    }
                }
            )
        } else {
            await Budget.findOneAndUpdate(
                {_id: budgetForUpdatedSaving._id},
                {$inc: {'budget.$[elem].actualAmount': updatedSaving.amount}},
                {arrayFilters: [{'elem.category': updatedSaving.category}]}
            )
        }
    }
}

export const createSaving = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {amount, category, date, description} = req.body

        const requiredFields = {amount, date, category}
        validateMandatory(requiredFields)

        const saving = await Saving.create({
            amount,
            date,
            category,
            description,
            userId: req._id
        })

        const createdSaving = await Saving.findById(saving._id).select('-userId')

        if (createdSaving) {
            await Budget.findOneAndUpdate(
                {userId: req._id, startDate: {$lt: createdSaving.date}, endDate: {$gt: createdSaving.date}},
                {$inc: {'budget.$[elem].actualAmount': amount}},
                {arrayFilters: [{'elem.category': category}]}
            )
        }
        res.status(200).json(createdSaving)
    } catch (error) {
        next(error)
    }
}

export const getSavingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {savingId} = req.params

        validateMandatory({savingId})

        const saving = await Saving.findById(savingId).select('-userId')
        res.status(200).json(saving)
    } catch (error) {
        next(error)
    }
}

export const getSavings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let savings = []
        const userId = req._id
        if (userId) {
            savings = await Saving.find({userId}).select('-userId')
        }
        res.status(200).json(savings)
    } catch (error) {
        next(error)
    }
}

export const updateSaving = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {savingId} = req.params
        const {amount, date, category, description} = req.body

        const requiredFields = {amount, category, date}
        validateMandatory(requiredFields)
        const originalSaving = await Saving.findOneAndUpdate({_id: savingId}, {savingId, amount, date, category, description})

        if (!originalSaving) {
            throw new ApiError('Saving not found', 400)
        }

        const updatedSaving = await Saving.findById(originalSaving._id).select('-userId')
            const budget = await Budget.findOne({
            userId: req._id,
            startDate: {$lt: originalSaving.date},
            endDate: {$gt: originalSaving.date}
        })
        console.log(originalSaving)
        console.log(updatedSaving)
        console.log(budget)
          if (updatedSaving && !budget) {
            await findAndUpdateBudget(req._id!, updatedSaving)
        }

         if (
                    updatedSaving &&
                    budget &&
                    (updatedSaving.date.toISOString() !== originalSaving.date.toISOString() ||
                        updatedSaving.category !== originalSaving.category ||
                        updatedSaving.amount !== originalSaving.amount)
                ) {
                    if (updatedSaving.date >= budget.startDate && updatedSaving.date < budget.endDate) {
                        console.log("case 1")
                        const diffAmount = updatedSaving.amount - originalSaving.amount
                        console.log(diffAmount)
                        if (updatedSaving.category === originalSaving.category) {
                            await Budget.updateOne(
                                {_id: budget._id},
                                {$inc: {'budget.$[elem].actualAmount': diffAmount}},
                                {arrayFilters: [{'elem.category': category}]}
                            )
                        } else {
                            await Budget.updateOne(
                                {_id: budget._id},
                                {$inc: {'budget.$[elem].actualAmount': -originalSaving.amount}},
                                {arrayFilters: [{'elem.category': originalSaving.category}]}
                            )
                            await Budget.updateOne(
                                {_id: budget._id},
                                {$inc: {'budget.$[elem].actualAmount': updatedSaving.amount}},
                                {arrayFilters: [{'elem.category': category}]}
                            )
                        }
                    } else {
                        // expense date updated and falls outside the budget it was originally in
                        await Budget.updateOne(
                            {_id: budget._id},
                            {$inc: {'budget.$[elem].actualAmount': -originalSaving.amount}},
                            {arrayFilters: [{'elem.category': originalSaving.category}]}
                        )
                        await findAndUpdateBudget(req._id!, updatedSaving)
                    }
                }
        res.status(200).json(updatedSaving)
    } catch (error) {
        next(error)
    }
}

export const deleteSaving = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {savingId} = req.params

        const requiredFields = {savingId}
        validateMandatory(requiredFields)

        const saving = await Saving.findById(savingId)
        if (!saving) {
            throw new ApiError('Saving not found', 400)
        }

        const result = await Saving.deleteOne({_id: savingId})
        if (!result.deletedCount) {
            throw new ApiError('System faced issue deleting the saving', 400)
        }
        const budget = await Budget.findOne({
            userId: req._id,
            startDate: {$lt: saving.date},
            endDate: {$gt: saving.date}
        })

        if (budget) {
            await Budget.findOneAndUpdate(
                {_id: budget._id},
                {$inc: {'budget.$[elem].actualAmount': -saving.amount}},
                {arrayFilters: [{'elem.category': saving.category}]}
            )
        }

        res.status(200).json({
            msg: `Saving ${savingId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}

export const searchSavings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {category, startDate, endDate, page = 1, limit = 5} = req.query
        const userId = new ObjectId(req._id)

        const searchQuery = {
            userId,
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
        const response = await Saving.aggregate(pipeline)
        res.status(200).send({
            savings: response[0].paginatedResults,
            count: response[0].totalCount[0].count
        })
    } catch (error) {
        next(error)
    }
}

// export const getIncomeGraph = async (req: Request, res: Response, next: NextFunction) => {
//     try{
//         const {startDate, endDate} = req.body;
//         const userId = new ObjectId(req._id)
//          const incomeData = await Income.aggregate([
//             {
//                 $match: {userId }
//             },{
//                 $facet: {
//                     'incomeByCategory': amountByCategoryPipeline as any,
//                     'incomeByMonths': amountByMonth as any,
//                 }
//             }])

//         res.status(200).json({
//             incomeByCategory: incomeData[0].incomeByCategory,
//             incomeByMonths: incomeData[0].incomeByMonths,
//         })
//     }
//     catch(error){
//         next(error)
//     }
// }
