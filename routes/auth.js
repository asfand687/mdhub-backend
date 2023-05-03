import express from 'express'
import { registerUser, loginUser, forgotPassword } from '../controllers/authController.js'
 
const router = express.Router()

//REGISTER
router.route('/register').post(registerUser)

// LOGIN
router.route('/login').post(loginUser)

// FORGOT PASSWORD
router.route('/forgot-password').post(forgotPassword)

export default router