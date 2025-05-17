import {Router} from 'express'
import {createSaving, getSavingById, getSavings, updateSaving, deleteSaving, searchSavings} from '../controller/saving.controller.js'
import {auth} from '../middlewares/auth.js'
const router = Router()

router.post('/create', auth, createSaving)
router.get('/all', auth, getSavings)
router.get('/search', auth, searchSavings)
router.get('/:savingId', auth, getSavingById)
router.put('/:savingId', updateSaving)
router.delete('/:savingId', deleteSaving)
export default router
