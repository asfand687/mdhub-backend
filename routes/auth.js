import express from 'express'
import { registerUser } from '../controllers/authController.js'
 
const router = express.Router()

//REGISTER
router.route('/register').post(registerUser)

export default router