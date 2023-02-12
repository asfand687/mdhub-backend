import Appointment from '../models/Appointment.js'
import User from "../models/User.js"

export const createAppointment = async (req, res) => {
  const { date, userId, service } = req.body
  try {
    const newAppointment = await new Appointment({
      date,
      userId,
      service
    })
    await newAppointment.save()
    const user = await User.findOne({ _id: userId })
    await user.appointments.push(newAppointment._id)
    await user.save()
    await newAppointment.save()
    res.status(201).json({ success: true, message: 'Appointment added successfully' })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: 'Unable to add appointment' });
  }
}