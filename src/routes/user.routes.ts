import {Router, Request, Response, NextFunction} from 'express'
import {
    registerUser,
    loginUser,
    logout,
    addBankAccount,
    getProfile,
    updateProfile,
    updateBankAccount,
    getBankAccounts,
    deleteBankAccountById,
    getCards,
    addCard,
    deleteCardById,
    getPaymentMethods
} from '../controller/user.controller.js'
import {dashboard, dashboardNew} from '../controller/dashboard.controller.js'
import {auth} from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', auth, logout)

router.get('/bank-accounts', auth, getBankAccounts)
router.post('/bank-account', auth, addBankAccount)
router.delete('/bank-account/:accountId', auth, deleteBankAccountById)

router.get('/cards', auth, getCards)
router.post('/card', auth, addCard)
router.delete('/card/:cardId', auth, deleteCardById)

router.get('/profile', auth, getProfile)
router.put('/profile', auth, updateProfile)
router.get('/payment-methods', auth, getPaymentMethods)


router.get('/dashboard', auth, dashboardNew)

export default router
