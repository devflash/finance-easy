import {Request, Response, NextFunction} from 'express'
import { Income } from "../models/Income.model.js";
import { Expense } from '../models/Expense.model.js';
import mongoose from 'mongoose'
const {ObjectId} = mongoose.Types

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate} = req.body;
        const userId = new ObjectId(req._id)
        console.log(userId)
        const incomeData = await Income.aggregate([{
            $match: {userId }
        },{
            $facet: {
                'totalIncome': [{
                    $group: {
                        _id: "$userId",
                        total: {
                            $sum: "$amount"
                        }
                    }
                }],
                'incomeByCategory': [{
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
                }],
                'incomeByMonths': [
                    {
                        $match: {
                            incomeDate: 
                                {
                                    $gte: new Date("01/01/2024"),
                                    $lt: new Date("01/03/2025"),
                                },
                            }
                    },
                    {
                        $project: {
                            month: {
                                $month: '$incomeDate'
                            },
                            amount: 1,
                            incomeDate: 1
                        }
                    },
                    {
                        $group: {
                            _id: '$month',
                            value: {$sum: '$amount'},
                            incomeDate: {$first: '$incomeDate'}
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            name: {
                                $dateToString: {
                                    format: "%b",
                                    date: "$incomeDate"
                                  }
                            },
                            value: 1
                        }
                    }
                ]
            }
        }])
        const expenseData = await Expense.aggregate([{
            $match: {userId }
        },{
            $facet: {
                'totalExpense': [{
                    $group: {
                        _id: "$userId",
                        total: {
                            $sum: "$amount"
                        }
                    }
                }]
            }
        }])
        res.status(200).json({
            totalIncome: incomeData[0].totalIncome[0].total,
            totalExpense: expenseData[0].totalExpense[0]?.total,
            incomeByCategory: incomeData[0].incomeByCategory,
            incomeByMonths: incomeData[0].incomeByMonths
        })
    }catch(err){
        next(err)
    }
}

// Dashboard income by months for date-range
// [
//     {
//       $match:
//         /**
//          * query: The query in MQL.
//          */
//         {
//           incomeDate: {
//             $gte: new ISODate("01/01/2024"),
//             $lt: new ISODate("01/03/2025"),
//           },
//         },
//     },
//     {
//       $project:
//         /**
//          * specifications: The fields to
//          *   include or exclude.
//          */
//         {
//           amount: 1,
//           source: 1,
//           incomeDate: 1,
//           months: {
//             $month: "$incomeDate",
//           },
//           year: {
//             $year: "$incomeDate",
//           },
//         },
//     },
//     {
//       $group: {
//         _id: "$months",
//         totalIncome: {
//           $sum: "$amount",
//         },
//       },
//     },
//     {
//       $project:
//         /**
//          * specifications: The fields to
//          *   include or exclude.
//          */
//         {
//           _id: 0,
//           month: "$_id",
//           totalIncome: 1,
//         },
//     },
//   ]



//totalIncome of the user
// [
//     {
//       $match:
//         /**
//          * query: The query in MQL.
//          */
//         {
//           userId: new ObjectId(
//             "669d51fc9fb13862b16b4406"
//           ),
//         },
//     },
//     {
//       $group:
//         /**
//          * _id: The id of the group.
//          * fieldN: The first field name.
//          */
//         {
//           _id: "$userId",
//           totalIncome: {
//             $sum: "$amount",
//           },
//         },
//     },
//     {
//       $project:
//         /**
//          * specifications: The fields to
//          *   include or exclude.
//          */
//         {
//           _id: 0,
//         },
//     },
//   ]