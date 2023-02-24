import Appointment from '../models/Appointment.js'
import User from "../models/User.js"
import { confirmAppointmentPaymentIntent } from '../utils/utils.js'

export const createAppointment = async (req, res) => {
  const { date, customerId, service, time, additionalInfo, paymentMethod, amount, userId } = req.body
  try {
    await confirmAppointmentPaymentIntent(req, customerId, paymentMethod, amount)
    if (confirmAppointmentPaymentIntent) {
      const newAppointment = await new Appointment({
        date,
        userId,
        service,
        time,
        additionalInfo,
        amount
      })
      await newAppointment.save()
      const user = await User.findOne({ _id: userId })
      user.appointments.push(newAppointment._id)
      await user.save()
      await newAppointment.save()
      res.status(201).json({ success: true, message: 'Appointment added successfully' })
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: 'Unable to add appointment' });
  }
}