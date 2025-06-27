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