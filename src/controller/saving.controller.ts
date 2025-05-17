import {Request, Response, NextFunction} from 'express'
import {Saving} from '../models/Saving.model.js'
import {validateMandatory} from '../utils/util.js'
import { ApiError } from '../ErrorHandling/CustomErrors.js'
import mongoose, {PipelineStage} from 'mongoose'
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

export const createSaving = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {amount, type, date, description} = req.body

        const requiredFields = {amount, date, type}
        validateMandatory(requiredFields)

        const saving = await Saving.create({
            amount,
            date,
            type,
            description,
            userId: req._id
        })

        const createdSaving = await Saving.findById(saving._id).select('-userId')
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
        const {amount, date, type, description} = req.body

        const requiredFields = {amount, type, date}
        validateMandatory(requiredFields)
        const saving = await Saving.findOneAndUpdate(
            {_id: savingId},
            {savingId, amount, date, type, description}
        )

        if(!saving){
            throw new ApiError("Saving not found", 400)
        }

        const updatedSaving = await Saving.findById(saving._id).select('-userId')
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

        await Saving.deleteOne({_id: savingId})

        res.status(200).json({
            msg: `Saving ${savingId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}

export const searchSavings = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const {type, startDate, endDate, page=1, limit=5} = req.query
       const userId = new ObjectId(req._id)
      
       const searchQuery = {
            userId,
            ...(type && {type: {$in: [type]}}),
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