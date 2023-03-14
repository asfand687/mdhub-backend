import express from 'express'
import { verifyToken, verifyTokenAndAdmin } from '../utils/utils.js'
import { getUser, updateUser, getAllUsers, deleteUser, getNewUserAndDeletedUserData, getUsersWithLatestPayment } from '../controllers/userController.js'

const router = express.Router()

// Get Users PaymentInfo
router.route('/get_users_payment_info').get(verifyTokenAndAdmin, getUsersWithLatestPayment)

// Get Users Info and Deleted Users Info
router.route('/get_user_info').get(verifyTokenAndAdmin, getNewUserAndDeletedUserData)

//Get User
router.route('/:id').get(verifyToken, getUser)

//Get All Users
router.route('/').get(getAllUsers)

//Delete User
router.route('/:id').delete(verifyTokenAndAdmin, deleteUser)



// Update User
router.route("/:id").put(verifyToken, updateUser)



export default router