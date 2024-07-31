import {Router} from 'express'
import {
    createExpense,
    getExpenseById,
    getExpenses,
    deleteExpense,
    updateExpense
} from '../controller/expense.controller.js'
// import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', createExpense)
router.get('/all', getExpenses)
router.get('/:expenseId', getExpenseById)
router.put('/:expenseId', updateExpense)
router.delete('/:expenseId', deleteExpense)

export default router
