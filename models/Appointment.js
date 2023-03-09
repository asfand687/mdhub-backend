import mongoose from 'mongoose'

const Appointment = new mongoose.Schema({
  nursingHomecareServices: [{ type: String }],
  customNursingService: { type: String },
  diagnosticService: { type: Boolean, default: false },
  date: { type: String },
  time: { type: String },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
},
  { timestamps: true }
)

const AppointmentSchema = mongoose.model('Appointment', Appointment)

export default AppointmentSchema