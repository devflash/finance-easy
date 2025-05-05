import {Router} from 'express'
import {
    createExpense,
    getExpenseById,
    getExpenses,
    deleteExpense,
    updateExpense,
    getExpenseGraph
} from '../controller/expense.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createExpense)
router.get('/all', auth, getExpenses)
router.get('/:expenseId', auth, getExpenseById)
router.put('/:expenseId', updateExpense)
router.delete('/:expenseId', deleteExpense)
router.get('/graph', auth, getExpenseGraph)
export default router
