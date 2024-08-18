import {Router} from 'express'
import {createIncome, getIncomeById, getIncomes, updateIncome, deleteIncome, searchIncomes} from '../controller/income.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createIncome)
router.get('/all', auth, getIncomes)
router.get('/search', auth, searchIncomes)
router.get('/:incomeId', auth, getIncomeById)
router.put('/:incomeId', updateIncome)
router.delete('/:incomeId', deleteIncome)

export default router
