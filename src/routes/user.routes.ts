import {Router, Request, Response, NextFunction} from 'express'
import {
    registerUser,
    loginUser,
    logout,
    addBankAccount,
    getProfile,
    updateProfile,
    updateBankAccount,
} from '../controller/user.controller.js'
import {dashboard} from '../controller/dashboard.controller.js'
import {auth} from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', auth, logout)

router.post('/create-bank-account', auth, addBankAccount)
router.put('/update-bank-account', auth, updateBankAccount)
router.get('/profile', auth, getProfile)
router.put('/update', auth, updateProfile)

router.get('/dashboard', auth, dashboard)

export default router
