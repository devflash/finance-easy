import {Request, Response, NextFunction} from 'express'
import {Income} from '../models/Income.model.js'
import {validateMandatory} from '../utils/util.js'
import { ApiError } from '../ErrorHandling/CustomErrors.js'
import mongoose from 'mongoose'
const {ObjectId} = mongoose.Types
export const createIncome = async (req: Request, res: Response, next: NextFunction) => {
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
        const {source, amount, incomeDate, depositType, description, category} = req.body

        const requiredFields = {incomeId, source, amount, incomeDate, depositType, description, category}
        validateMandatory(requiredFields)
        const income = await Income.findOneAndUpdate(
            {_id: incomeId},
            {incomeId, source, amount, incomeDate, depositType, description, category}
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
        const response = await Income.aggregate(pipeline)
        res.status(200).send(response)
    } catch (error) {
        next(error)
    }
}
