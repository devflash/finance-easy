import {Router} from 'express'
import {createIncome} from '../controller/income.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createIncome)

export default router
