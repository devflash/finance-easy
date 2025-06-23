import {Request, Response, NextFunction} from 'express'
import {Income} from '../models/Income.model.js'

import mongoose, {PipelineStage} from 'mongoose'
const {ObjectId} = mongoose.Types

const totalAmountPipeline: PipelineStage[] = [
    {
        $group: {
            _id: '$type',
            value: {
                $sum: '$amount'
            }
        }
    }
]

const incomeVsExpensePipeline: PipelineStage[] = [
    {
        $match: {
            date: {
                $gte: new Date('01/01/2024'),
                $lt: new Date('01/03/2025')
            }
        }
    },
    {
        $project: {
            month: {
                $month: '$date'
            },
            iv: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Income']
                    },
                    then: '$amount',
                    else: {
                        $literal: 0
                    }
                }
            },
            ev: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Expense']
                    },
                    then: '$amount',
                    else: {
                        $literal: 0
                    }
                }
            },
            name: {
                $dateToString: {
                    format: '%b',
                    date: '$date'
                }
            }
        }
    },
    {
        $group: {
            _id: '$month',
            iv: {
                $sum: '$iv'
            },
            ev: {
                $sum: '$ev'
            },
            name: {
                $first: '$name'
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
]

const savingsVsExpensePipeline: PipelineStage[] = [
    {
        $match: {
            date: {
                $gte: new Date('01/01/2024'),
                $lt: new Date('01/03/2025')
            }
        }
    },
    {
        $project: {
            month: {
                $month: '$date'
            },
            sv: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Saving']
                    },
                    then: '$amount',
                    else: {
                        $literal: 0
                    }
                }
            },
            ev: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Expense']
                    },
                    then: '$amount',
                    else: {
                        $literal: 0
                    }
                }
            },
            name: {
                $dateToString: {
                    format: '%b',
                    date: '$date'
                }
            }
        }
    },
    {
        $group: {
            _id: '$month',
            sv: {
                $sum: '$sv'
            },
            ev: {
                $sum: '$ev'
            },
            name: {
                $first: '$name'
            }
        }
    },
    {
        $sort: {
            _id: 1
        }
    }
]

const topSpendingsPipeline: PipelineStage[] = [
    {
        $match: {
            date: {
                $gte: new Date('01/01/2024'),
                $lt: new Date('01/03/2025')
            },
            type: 'Expense'
        }
    },
    {
        $project: {
            amount: 1,
            moneyPaidTo: 1,
            date: 1
        }
    },
    {
        $sort: {
            amount: -1
        }
    },
    {
        $limit: 5
    }
]

const networthPipeline: PipelineStage[] = [
    {
        $match:
            /**
             * query: The query in MQL.
             */
            {
                date: {
                    $gte: new Date('01/01/2024'),
                    $lt: new Date('01/01/2025')
                }
            }
    },
    {
        $project: {
            month: {
                $month: '$date'
            },
            iv: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Income']
                    },
                    then: '$amount',
                    else: 0
                }
            },
            ev: {
                $cond: {
                    if: {
                        $eq: ['$type', 'Expense']
                    },
                    then: '$amount',
                    else: 0
                }
            },
            name: {
                $dateToString: {
                    format: '%b',
                    date: '$date'
                }
            }
        }
    },
    {
        $group: {
            _id: '$month',
            iv: {
                $sum: '$iv'
            },
            ev: {
                $sum: '$ev'
            },
            name: {
                $first: '$name'
            }
        }
    },
    {
        $project: {
            name: 1,
            iv: 1,
            ev: 1,
            nw: {
                $subtract: ['$iv', '$ev']
            }
        }
    }
]

const expenseByBanksPipeline = [
    {
        $match: {
            type: 'Expense',
            paymentMethod: 'bank'
        }
    },
    {
        $group: {
            _id: '$paymentMethodId',
            value: {
                $sum: '$amount'
            }
        }
    },
    {
        $lookup: {
            from: 'bankaccounts',
            localField: '_id',
            foreignField: '_id',
            as: 'bank'
        }
    },
    {
        $unwind: {
            path: '$bank'
        }
    },
    {
        $project: {
            value: 1,
            bankName: '$bank.bankName',
            accountNumber: '$bank.accountNumber'
        }
    }
]

const expenseByCardsPipeline = [
    {
        $match: {
            type: 'Expense',
            paymentMethod: 'card'
        }
    },
    {
        $group: {
            _id: '$paymentMethodId',
            value: {
                $sum: '$amount'
            }
        }
    },
    {
        $lookup: {
            from: 'cards',
            localField: '_id',
            foreignField: '_id',
            as: 'card'
        }
    },
    {
        $unwind: {
            path: '$card'
        }
    },
    {
        $project: {
            value: 1,
            cardType: '$card.type',
            cardNumberaccountNumber: '$card.cardNumber'
        }
    }
]

const recentTransactionsPipeline: PipelineStage[] = [
    {
        $sort: {
            createdAt: -1
        }
    },
    {
        $limit: 5
    }
]

const summaryPipeline: PipelineStage[] = [
    {
        $group: {
            _id: '$type',
            average: {
                $avg: '$amount'
            },
            maximum: {
                $max: '$amount'
            },
            minimum: {
                $min: '$amount'
            },
            count: {
                $sum: 1
            }
        }
    }
]

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {startDate, endDate} = req.body
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
                    coll: 'expenses',
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
                    coll: 'savings',
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
            }
        ])

        const networth = dashboardData[0].incomeVsExpense.map((data: any) => {
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
    } catch (err) {
        next(err)
    }
}

export const dashboardNew = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
                    coll: 'expenses',
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
                    coll: 'savings',
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
                    'networth': networthPipeline as any,
                    'topSpendings': topSpendingsPipeline as any,
                    'expenseByBanks': expenseByBanksPipeline as any,
                    'expenseByCards': expenseByCardsPipeline as any,
                    'recentTransactions': recentTransactionsPipeline as any,
                    'summary': summaryPipeline as any
                }
            }
        ])
        res.status(200).json({
            total: dashboardData[0].total,
            networth: dashboardData[0].networth,
            topSpendings: dashboardData[0].topSpendings,
            expenseByBanks: dashboardData[0].expenseByBanks,
            expenseByCards: dashboardData[0].expenseByCards,
            transactions: dashboardData[0].recentTransactions,
            summary: dashboardData[0].summary
        })
    } catch (err) {
        next(err)
    }
}
