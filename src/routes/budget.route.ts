import {Router} from 'express'
import {
    createBudget,
    getBudgetById,
    searchBudgets,
    deleteBudget,
    updateBudget
} from '../controller/budget.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createBudget)
router.get('/search', auth,searchBudgets)
router.get('/:budgetId', auth, getBudgetById)
router.put('/:budgetId', auth, updateBudget)
router.delete('/:budgetUd', auth, deleteBudget)
export default router
