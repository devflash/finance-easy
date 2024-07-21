import {Router} from 'express'
import {userController} from '../controller/user.controller.js'
const registerRoute = Router()

registerRoute.post('/register', userController)

export {registerRoute}
