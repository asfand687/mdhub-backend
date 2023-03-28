import express from 'express'
import { createAppointment } from '../controllers/appointmentController.js'
import { uploadFile} from '../utils/utils.js'

const router = express.Router()

//CREATE APPOINTMENT
router.route('/').post(uploadFile.single("file"), createAppointment)


export default router