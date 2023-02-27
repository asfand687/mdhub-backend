import mongoose from 'mongoose'

const Appointment = new mongoose.Schema({
  serviceName: { type: String },
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