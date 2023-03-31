import Appointment from '../models/Appointment.js'
import User from "../models/User.js"
import {
  confirmAppointmentPaymentIntent,
  uploadFile,
  transporter,
  nursingAppointmentMailOptionsWithAttachment,
  nursingAppointmentMailOptionsWithoutAttachment,
  diagnosticsAppointmentMailOptionsWithAttachment,
  diagnosticsAppointmentMailOptionsWithoutAttachment
} from '../utils/utils.js'
import * as util from "util"



export const createAppointment = async (req, res) => {
  var mailOptions
  const sendMailAsync = util.promisify(transporter.sendMail).bind(transporter)
  if (!req.file) {
    console.log("No file uploaded")
    mailOptions = req.body.appointmentType === "nursing" ?
      nursingAppointmentMailOptionsWithoutAttachment(req) :
      diagnosticsAppointmentMailOptionsWithoutAttachment(req)
  } else {
    mailOptions = req.body.appointmentType === "nursing" ?
      nursingAppointmentMailOptionsWithAttachment(req) :
      diagnosticsAppointmentMailOptionsWithAttachment(req)
  }

  try {
    await confirmAppointmentPaymentIntent(req, req.body.customerId, req.body.paymentMethod, req.body.amount)
    if (confirmAppointmentPaymentIntent) {
      const newAppointment = new Appointment({
        date: req.body.selectedDate,
        userId: req.body.userId,
        time: req.body.time,
        address: req.body.address,
        nursingHomecareServices: JSON.parse(req.body.selectedServices),
        customNursingService: req.body.customNursingService
      })
      await newAppointment.save()
      const user = await User.findOne({ _id: req.body.userId })
      user.appointments.push(newAppointment._id)
      await user.save()
      await newAppointment.save()

      const info = await sendMailAsync(mailOptions)
      console.log('Email sent: ' + info.response)
      res.status(201).json({ success: true, message: 'Appointment added successfully' })
    } else {
      res.status(400).json("payment Failed")
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: 'Unable to add appointment' });
  }
}