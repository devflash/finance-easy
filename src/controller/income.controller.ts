import {Request, Response, NextFunction} from 'express'
import {Income} from '../models/Income.model.js'
import {validateMandatory} from '../utils/util.js'
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

    const amountByMonth = [
        {
            $match: {
                date: 
                    {
                            $gte: new Date("01/01/2024"),
                            $lt: new Date("01/03/2025"),
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
                        format: "%b",
                        date:'$date'
                      }
                },
                value: 1
            }
        }
    ]

export const createIncome = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {source, amount, date, depositType, description, category} = req.body

        const requiredFields = {source, amount, date, depositType}
        validateMandatory(requiredFields)

        const income = await Income.create({
            source,
            amount,
            date,
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

export const getIncomeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {incomeId} = req.params

        validateMandatory({incomeId})

        const income = await Income.findById(incomeId).select('-userId')
        res.status(200).json(income)
    } catch (error) {
        next(error)
    }
}

export const getIncomes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let incomes = []
        const userId = req._id
        if (userId) {
            incomes = await Income.find({userId}).select('-userId')
        }
        res.status(200).json(incomes)
    } catch (error) {
        next(error)
    }
}

export const updateIncome = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {incomeId} = req.params
        const {source, amount, date, depositType, description, category} = req.body

        const requiredFields = {incomeId, source, amount, date, depositType, description, category}
        validateMandatory(requiredFields)
        const income = await Income.findOneAndUpdate(
            {_id: incomeId},
            {incomeId, source, amount, date, depositType, description, category}
        )

        if(!income){
            throw new ApiError("Income not found", 400)
        }

        const updatedIncome = await Income.findById(income._id).select('-userId')
        res.status(200).json(updatedIncome)
    } catch (error) {
        next(error)
    }
}

export const deleteIncome = async (req: Request, res: Response, next: NextFunction) => {
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

export const searchIncomes = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const {source, category, startDate, endDate, page=1, limit=5} = req.query
       const userId = new ObjectId(req._id)
      
       const searchQuery = {
            userId,
            ...(source && {source}),
            ...(category && {category: {$in: [category]}}),
            ...(startDate && endDate && {date: {$and: [{$gte: startDate}, {$lte: endDate}]}})
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
        const response = await Income.aggregate(pipeline)
        res.status(200).send({
            incomes: response[0].paginatedResults,
            count: response[0].totalCount[0].count
        })
    } catch (error) {
        next(error)
    }
}

export const getIncomeGraph = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {startDate, endDate} = req.body;
        const userId = new ObjectId(req._id)
         const incomeData = await Income.aggregate([
            {
                $match: {userId }
            },{
                $facet: {
                    'incomeByCategory': amountByCategoryPipeline as any,
                    'incomeByMonths': amountByMonth as any,
                }
            }])
        
        res.status(200).json({
            incomeByCategory: incomeData[0].incomeByCategory,
            incomeByMonths: incomeData[0].incomeByMonths,
        })
    }
    catch(error){
        next(error)
    }
}