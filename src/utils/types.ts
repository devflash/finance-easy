import {Types, Document} from 'mongoose'

export interface IUser{
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    refreshToken: string,
    createdAt: Date;
    updateAt: Date;
}

export interface IUserMethods {
    isPasswordCorrect: (password: string) => Promise<boolean>,
    generateAccessToken: () => string
}

export interface IBankAccount{
    userId: Types.ObjectId
    bankName: string;
    accountNumber: string;
    branch: string;
    type: string;
}

export interface IIncome extends Document {
    source: string,
    amount: number,
    userId: Types.ObjectId,
    date: Date,
    depositType: string, // bank deposit | cash
    description:  string,
    category:  string,
    createdAt: Date;
    updateAt: Date;
    type: "Income"
}

export interface IExpense extends Document {
    category: string,
    moneyPaidTo: string,
    paymentMethod: string,
    paymentMethodId: Types.ObjectId,
    amount: number,
    date: Date,
    description: string,
    userId: Types.ObjectId,
    createdAt: Date;
    updateAt: Date;
    type: 'Expense'
}

export interface ICustomError extends Error {
    status: number
}


export interface ISaving extends Document {
    userId: Types.ObjectId,
    date: Date,
    amount: number,
    category: string,
    description: string
    createdAt: Date;
    updateAt: Date;
    type: "Saving"
}

export interface ICard extends Document {
     _id: string
     userId: Types.ObjectId
     cardNumber: string;
     expirationDate: Date;
     name: string;
     type: string;
     createdAt: Date
     updateAt: Date
}

export interface IBudget extends Document { 
    _id: string
    userId: Types.ObjectId
    startDate: Date;
    endDate: Date;
    totalBudget: number,
    totalActual: number
    budget: BudgetItem[]
    createdAt: Date
    updateAt: Date
}

interface BudgetItem {
    category: string,
    actualAmount: number,
    budgetAmount: number,
    type: 'NEED' | 'WANT' | 'SAVING'
}