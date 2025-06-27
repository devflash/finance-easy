import {Router} from 'express'
import {
    createBudget,
} from '../controller/budget.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createBudget)


export default router
