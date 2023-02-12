import express from 'express'
import { createAppointment } from '../controllers/appointmentController.js'

const router = express.Router()

//CREATE APPOINTMENT
router.route('/').post(createAppointment)


export default router