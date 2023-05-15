import express from 'express'
import { verifyToken, verifyTokenAndAdmin } from '../utils/utils.js'
import { addChildAccount, registerCorporateUser } from '../controllers/adminController.js'

const router = express.Router()

// Register Corporate User
router.route('/register').post(registerCorporateUser)

// Add Child Account
router.route('/add-child-account').post(addChildAccount)



export default router