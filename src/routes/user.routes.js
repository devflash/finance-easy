import {Router} from 'express'
import {registerUser, loginUser, logout} from '../controller/user.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', auth, logout)

export default router
