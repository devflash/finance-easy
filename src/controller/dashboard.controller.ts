import {Request, Response, NextFunction} from 'express'
import { Income } from "../models/Income.model.js";
import { Expense } from '../models/Expense.model.js';
import mongoose, {PipelineStage} from 'mongoose'
const {ObjectId} = mongoose.Types

const totalAmountPipeline: PipelineStage[] = [{
        $group: {
            _id: "$type",
            value: {
                $sum: "$amount"
            }
        }
    }
]

const incomeVsExpensePipeline: PipelineStage[] = [{
    $match: {$or: [
        {
          type: "Income",
          incomeDate: {
            $gte: new Date("01/01/2024"),
            $lt: new Date("01/03/2025"),
          },
        },
        {
          type: "Expense",
          expenseDate: {
            $gte: new Date("01/01/2024"),
            $lt: new Date("01/03/2025"),
          },
        },
      ]}
},{
    $project: {
        month: {
          $cond: {
            if: {
              $eq: ["$type", "Income"],
            },
            then: {
              $month: "$incomeDate",
            },
            else: {
              $month: "$expenseDate",
            },
          },
        },
        iv: {
          $cond: {
            if: {
              $eq: ["$type", "Income"],
            },
            then: "$amount",
            else: {
              $literal: 0,
            },
          },
        },
        ev: {
          $cond: {
            if: {
              $eq: ["$type", "Expense"],
            },
            then: "$amount",
            else: {
              $literal: 0,
            },
          },
        },
        name: {
          $dateToString: {
            format: "%b",
            date: {
              $ifNull: ["$incomeDate", "$expenseDate"],
            },
          },
        },
      }
},{
    $group: {
        _id: "$month",
        iv: {
          $sum: "$iv",
        },
        ev: {
          $sum: "$ev",
        },
        name: {
          $first: "$name",
        },
      }
},{
    $sort: {
        _id: 1,
      }
}]



export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate} = req.body;
        const userId = new ObjectId(req._id)
        console.log(userId)
        const incomeData = await Income.aggregate([
            {
              $match: {
                  userId
                },
            },
            {
              $project: {
                  category: 1,
                  amount: 1,
                  type: "Income",
                  incomeDate: 1
                },
            },
            {
              $unionWith: {
                  coll: "expenses",
                  pipeline: [
                    {
                      $match: {
                        userId
                      },
                    },
                    {
                      $project: {
                        category: 1,
                        amount: 1,
                        type: {
                          $literal: "Expense",
                        },
                        expenseDate: 1
                      },
                    },
                  ],
                },
            },
            {
              $facet: {
                'total': totalAmountPipeline as any,
                'incomeVsExpense': incomeVsExpensePipeline as any
            }
            },
          ])
       

        res.status(200).json({
            total: incomeData[0].total,
            incomesVsExpenses: incomeData[0].incomeVsExpense
        })
    }catch(err){
        next(err)
    }
}