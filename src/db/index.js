import mongoose from 'mongoose'
import {DB_NAME} from '../utils/constants.js'
export const connectDB = async () => {
    try {
        const url = process.env.MONGO_URL.replace('<username>', process.env.MONGO_USERNAME)
            .replace('<password>', encodeURIComponent(process.env.MONGO_PASSWORD))
            .replace('<dbname>', DB_NAME)
        await mongoose.connect(url)
    } catch (error) {
        console.log('Mongo database connection error', error)
    }
}
