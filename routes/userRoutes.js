import express from 'express'
import { verifyToken } from '../utils/utils.js'
import { getUser } from '../controllers/userController.js'

const router = express.Router()

//Get User
router.route('/:id').get(verifyToken, getUser)



export default router