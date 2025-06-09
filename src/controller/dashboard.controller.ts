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
    $match: {
        date: {
            $gte: new Date("01/01/2024"),
            $lt: new Date("01/03/2025"),
          }
      }
},{
    $project: {
        month: {
         $month: "$date"
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
            date: "$date"
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

const savingsVsExpensePipeline: PipelineStage[] = [{
    $match: {
      date: {
        $gte: new Date("01/01/2024"),
        $lt: new Date("01/03/2025"),
      },
    }
},{
    $project: {
        month: {
          $month: "$date"
        },
        sv: {
          $cond: {
            if: {
              $eq: ["$type", "Saving"],
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
            date: "$date"
          },
        },
      }
},{
    $group: {
        _id: "$month",
        sv: {
          $sum: "$sv",
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

const topSpendingsPipeline: PipelineStage[] = [
  {
    $match:
      {
        date: {
          $gte: new Date("01/01/2024"),
          $lt: new Date("01/03/2025"),
        },
      },
  },
  {
    $project:
      {
        amount: 1,
        moneyPaidTo: 1,
        date: 1,
      },
  },
  {
    $sort:
      {
        amount: -1,
      },
  },
  {
    $limit: 5
  },
]

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate} = req.body;
        const userId = new ObjectId(req._id)
        console.log(userId)
        const dashboardData = await Income.aggregate([
            {
              $match: {
                  userId
                }
            },
            {
              $unionWith: {
                  coll: "expenses",
                  pipeline: [
                    {
                      $match: {
                        userId
                      }
                    }
                  ]
                }
            },
            {
              $unionWith: {
                  coll: "savings",
                  pipeline: [
                    {
                      $match: {
                        userId
                      }
                    }
                  ]
                }
            },
            {
              $facet: {
                'total': totalAmountPipeline as any,
                'incomeVsExpense': incomeVsExpensePipeline as any,
                'savingsVsExpense': savingsVsExpensePipeline as any,
                'topSpendings': topSpendingsPipeline as any
            }
            },
          ])
       
        const networth = dashboardData[0].incomeVsExpense.map((data: any)=>{
          const {_id, name} = data
          return {
            _id,
            name,
            nw: data.iv - data.ev
          }

        })
        res.status(200).json({
            total: dashboardData[0].total,
            incomesVsExpenses: dashboardData[0].incomeVsExpense,
            savingsVsExpense: dashboardData[0].savingsVsExpense,
            topSpendings: dashboardData[0].topSpendings,
            networth
        })
    }catch(err){
        next(err)
    }
}