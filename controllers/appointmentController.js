import Appointment from '../models/Appointment.js'
import User from "../models/User.js"
import { confirmAppointmentPaymentIntent, uploadFile, transporter } from '../utils/utils.js'
import * as util from "util"



export const createAppointment = async (req, res) => {
  var mailOptions
  const sendMailAsync = util.promisify(transporter.sendMail).bind(transporter)
  if (!req.file) {
    console.log("No file uploaded")
    mailOptions = {
      from: 'mdhubtest@gmail.com',
      to: 'amir@cbstudio.ca, safiraja687@gmail.com',
      subject: 'Requisition Form',
      html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            email: ${req.body.emailAddress}
          </li>
          <li>
            preferredDate: ${req.body.selectedDate}
          </li>
          <li>
            preferredTime: ${req.body.time}
          </li>
          <li>
            address: ${req.body.address}
          </li>
          <li>
            city: ${req.body.city}
          </li>
          <li>
            city: ${req.body.province}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
        </ul>
      </div>
    `
    }
  } else {

    mailOptions = {
      from: 'mdhubtest@gmail.com',
      to: 'safiraja687@gmail.com',
      subject: 'Requisition Form',
      html: `
      <div>
        <h2>Hello This is Lab Requisition Email for the user ${req.body.firstName} ${req.body.lastName}</h2>
        <p>Here are the additional details:</p>
        <ul>
          <li>
            Phone: ${req.body.phoneNumber}
          </li>
          <li>
            email: ${req.body.emailAddress}
          </li>
          <li>
            preferredDate: ${req.body.selectedDate}
          </li>
          <li>
            preferredTime: ${req.body.time}
          </li>
          <li>
            address: ${req.body.address}
          </li>
          <li>
            city: ${req.body.city}
          </li>
          <li>
            city: ${req.body.province}
          </li>
          <li>
            Custom Service: ${req.body.customNursingService}
          </li>
        </ul>
      </div>
    `,
      attachments: [{
        filename: "requisition-form.jpg",
        path: req.file.path
      }]
    }
  }


  try {
    await confirmAppointmentPaymentIntent(req, req.body.customerId, req.body.paymentMethod, req.body.amount)
    if (confirmAppointmentPaymentIntent) {
      const newAppointment = await new Appointment({
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