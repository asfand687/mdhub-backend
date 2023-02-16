import express from 'express'
import { verifyToken } from '../utils/utils.js'
import { getUser, updateUser } from '../controllers/userController.js'

const router = express.Router()

//Get User
router.route('/:id').get(verifyToken, getUser)

// Update User
router.route("/:id").put(verifyToken, updateUser)



export default router