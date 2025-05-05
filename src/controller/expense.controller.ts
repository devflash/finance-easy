import {Request, Response, NextFunction} from 'express'
import {Expense} from '../models/Expense.model.js'
import {validateMandatory} from '../utils/util.js'
import {IExpense} from '../utils/types.js'
import { ApiError } from '../ErrorHandling/CustomErrors.js'
import mongoose, {PipelineStage} from 'mongoose'
const {ObjectId} = mongoose.Types

const amountByCategoryPipeline: PipelineStage[] = [{
        $group: {
            _id: "$category",
            value: {
                $sum: "$amount"
            }
        }
    },{
        $project: {
            _id: 0,
            name: '$_id',
            value: 1
        }
    }]

    const amountByMonthPipeline = [
        {
            $match: 
            {
                expenseDate: 
                    {
                        $gte: new Date("01/01/2024"),
                        $lt: new Date("01/03/2025"),
                    }
                }
        },
        {
            $project: {
                month: {
                    $month: '$expenseDate'
                },
                amount: 1,
                expenseDate: 1
            }
        },
        {
            $group: {
                _id: '$month',
                value: {$sum: '$amount'},
                expenseDate: {$first: '$expenseDate'}
            }
        },
        {
            $project: {
                _id: 0,
                name: {
                    $dateToString: {
                        format: "%b",
                        date:'$expenseDate'
                      }
                },
                value: 1
            }
        }
    ]

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
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
        console.log(userId)
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
        const {category, moneyPaidTo, paymentMethod, amount, expenseDate, description} = req.body

        const requiredFields = {expenseId, category, moneyPaidTo, paymentMethod, amount, expenseDate}
        validateMandatory(requiredFields)
        const expense = await Expense.findByIdAndUpdate(
            {_id: expenseId},
            {expenseId, category, moneyPaidTo, paymentMethod, amount, expenseDate, description}
        )
        
        if(!expense){
            throw new ApiError('Expense not found', 400)
        }

        let updatedExpense = null
        
        updatedExpense = await Expense.findById(expense._id).select('-userId')
        
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

        await Expense.deleteOne({_id: expenseId})

        res.status(200).json({
            msg: `Expense ${expenseId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}

export const searchExpenses = async (req: Request, res: Response, next: NextFunction) => {
   try {
          const {moneyPaidTo, category, startDate, endDate, page=1, limit=5} = req.query
          const userId = new ObjectId(req._id)
         
          const searchQuery = {
               userId,
               ...(moneyPaidTo && {moneyPaidTo}),
               ...(category && {category: {$in: [category]}}),
               ...(startDate && endDate && {incomeDate: {$and: [{$gte: startDate}, {$lte: endDate}]}})
          }
          const offset = (Number(page) - 1) * Number(limit)
      
          const pipeline = [
           { $match: searchQuery },
           {
             $facet: {
               paginatedResults: [
                 { $skip: offset },
                 { $limit: Number(limit) }
               ],
               totalCount: [
                 { $count: "count" }
               ]
             }
           }
         ];
           const response = await Expense.aggregate(pipeline)
           res.status(200).send(response)
       } catch (error) {
           next(error)
       }
}

export const getExpenseGraph = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {startDate, endDate} = req.body;
        const userId = new ObjectId(req._id)
         const expenseData = await Expense.aggregate([
            {
                $match: {userId }
            },{
                $facet: {
                    'expenseByCategory': amountByCategoryPipeline as any,
                    'expenseByMonths':  amountByMonthPipeline as any
                }
            }])
        
        res.status(200).json({
            expenseByCategory: expenseData[0].expenseByCategory,
            expenseByMonths: expenseData[0].expenseByMonths,
        })
    }
    catch(error){
        next(error)
    }
}

