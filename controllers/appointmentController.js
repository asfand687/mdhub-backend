import Appointment from '../models/Appointment.js'
import User from "../models/User.js"
import { confirmAppointmentPaymentIntent } from '../utils/utils.js'

export const createAppointment = async (req, res) => {
  console.log(req.body)
  const {
    selectedDate,
    customerId,
    serviceName,
    time,
    paymentMethod,
    amount,
    userId,
    address,
    homecareServices,
    nursingServices
  } = req.body
  try {
    await confirmAppointmentPaymentIntent(req, customerId, paymentMethod, amount)
    if (confirmAppointmentPaymentIntent) {
      const newAppointment = await new Appointment({
        date: selectedDate,
        userId,
        serviceName,
        time,
        address,
        homecareServices,
        nursingServices
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