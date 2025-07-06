import {Router} from 'express'
import {
    createExpense,
    getExpenseById,
    getExpenses,
    deleteExpense,
    updateExpense,
    getExpenseGraph,
    searchExpenses
} from '../controller/expense.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createExpense)
router.get('/all', auth, getExpenses)
router.get('/graph', auth, getExpenseGraph)
router.get('/search', auth, searchExpenses)
router.get('/:expenseId', auth, getExpenseById)
router.put('/:expenseId', auth, updateExpense)
router.delete('/:expenseId', auth, deleteExpense)

export default router
