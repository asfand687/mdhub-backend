import express from 'express'
import { verifyToken, verifyTokenAndAdmin } from '../utils/utils.js'
import { updateCodeForUser, getUser, updateUser, getAllUsers, deleteUser, getNewUserAndDeletedUserData, getUsersWithLatestPayment, makeOnDemandPayment } from '../controllers/userController.js'

const router = express.Router()

// Get Users PaymentInfo
router.route('/get_users_payment_info').get(getUsersWithLatestPayment)

// Get Users Info and Deleted Users Info
router.route('/get_user_info').get(getNewUserAndDeletedUserData)

//Get User
router.route('/:id').get(getUser)

//Get All Users
router.route('/').get(getAllUsers)

//Delete User
router.route('/:id').delete(deleteUser)

// Make On Demand Payment
router.route("/make_on_demand_payment").post(makeOnDemandPayment)

// Update User
router.route("/:id").put(updateUser)

// Update Code
router.route("/updateCode/:userId").put(updateCodeForUser)



export default router