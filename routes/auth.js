import express from 'express'
import { registerUser } from '../controllers/authController.js'
 
const router = express.router()

//REGISTER
router.route('/register').post(registerUser)

export default router