import {Types, Document} from 'mongoose'

export interface IUser{
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    bankAccounts: Types.ObjectId[],
    refreshToken: string,
    createdAt: Date;
    updateAt: Date;
}

export interface IUserMethods {
    isPasswordCorrect: (password: string) => Promise<boolean>,
    generateAccessToken: () => string
}

export interface IBankAccount{
    bankName: string,
    accountNumber: string
}

export interface IIncome extends Document {
    source: string,
    amount: number,
    userId: Types.ObjectId,
    incomeDate: Date,
    depositType: string, // bank deposit | cash
    description:  string,
    category:  string,
    createdAt: Date;
    updateAt: Date;
}

export interface IExpense extends Document {
    category: string,
    moneyPaidTo: string,
    paymentMethod: string,
    amount: number,
    expenseDate: Date,
    description: string,
    userId: Types.ObjectId,
    createdAt: Date;
    updateAt: Date;
}

export interface ICustomError extends Error {
    status: number
}


export interface ISaving extends Document {
    userId: Types.ObjectId,
    date: Date,
    amount: number,
    type: string,
    description: string
    createdAt: Date;
    updateAt: Date;
}