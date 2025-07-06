import {Request, Response, NextFunction} from 'express'
import {Budget} from '../models/Budget.model.js'
import {validateMandatory} from '../utils/util.js'
import { ApiError } from '../ErrorHandling/CustomErrors.js'
import mongoose, {PipelineStage} from 'mongoose'
const {ObjectId} = mongoose.Types

export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate, totalBudget, totalActual, budget} = req.body

        const requiredFields = {startDate, endDate, totalBudget}
        validateMandatory(requiredFields)

        const newBudget = await Budget.create({
            startDate,
            endDate,
            totalBudget, totalActual,
            budget,
            userId: req._id
        })

        const createdBudget = await Budget.findById(newBudget._id).select('-userId')
        res.status(200).json(createdBudget)
    } catch (error) {
        next(error)
    }
}

export const getBudgetById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {budgetId} = req.params

        const budget = await Budget.findById(budgetId).select('-userId')
        res.status(200).json(budget)
    } catch (error) {
        next(error)
    }
}

export const searchBudgets = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Todo: Add query parameters to search budget: status
        const budgets = await Budget.find({userId: req._id})
        res.status(200).send(budgets)
    } catch (error) {
        next(error)
    }
}

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {budgetId} = req.params
        const {startDate, endDate, totalBudget, totalActual, budget} = req.body

        const requiredFields = {startDate, endDate, totalBudget}
        validateMandatory(requiredFields)
        const budgetData = await Budget.findOneAndUpdate(
            {_id: budgetId},
            {budgetId, startDate, endDate, totalBudget,totalActual, budget}
        )
    
        if(!budgetData){
            throw new ApiError("Budget not found", 400)
        }

        const updatedBudget = await Budget.findById(budgetId).select('-userId')
        res.status(200).json(updatedBudget)
    } catch (error) {
        next(error)
    }
}

export const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {budgetId} = req.params

        await Budget.deleteOne({_id: budgetId})

        res.status(200).json({
            msg: `Budget ${budgetId} is deleted from the records successfuly`
        })
    } catch (error) {
        next(error)
    }
}