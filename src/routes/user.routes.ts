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
    deleteBankAccountById
} from '../controller/user.controller.js'
import {dashboard} from '../controller/dashboard.controller.js'
import {auth} from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', auth, logout)

router.get('/bank-accounts', auth, getBankAccounts)
router.post('/bank-account', auth, addBankAccount)
router.put('/bank-account', auth, updateBankAccount)
router.delete('/bank-account/:accountId', auth, deleteBankAccountById)
router.get('/profile', auth, getProfile)
router.put('/update', auth, updateProfile)

router.get('/dashboard', auth, dashboard)

export default router
