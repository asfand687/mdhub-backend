import express from 'express'
import { registerUser, loginUser } from '../controllers/authController.js'
 
const router = express.Router()

//REGISTER
router.route('/register').post(registerUser)

// LOGIN
router.route('/login').post(loginUser)

export default router